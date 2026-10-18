import {
  acknowledgeSync, claimGuestImport, createSyncEnvelope, importGuestSnapshot,
  mergeCommutePlans, mergeStudySnapshots, prepareSync, readSyncEnvelope, rebaseSyncEnvelope, updateLocalSnapshot,
  type SyncEnvelope, type SyncRequest,
} from './cloud-study';
import { emptyState, readState, type PersistedState, type StudySession } from './study';
import { readCommutePlan, type CommutePlan } from './review-plan';

export const LEGACY_STUDY_KEY = 'teum-study-v1';
export const LEGACY_PLAN_KEY = 'commute-frontend-plan-v1';
export const LEARNING_PREFIX = 'commute-frontend-learning-v2';
export const GUEST_HEAD_KEY = `${LEARNING_PREFIX}:guest-head`;
export const GUEST_CLAIMS_KEY = `${LEARNING_PREFIX}:guest-claims`;
const MIGRATION_KEY = `${LEARNING_PREFIX}:migrated`;
const LEGACY_OWNER_KEY = `${LEARNING_PREFIX}:legacy-owner`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SyncStatus = 'guest' | 'loading' | 'syncing' | 'synced' | 'pending' | 'error';
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export interface RemoteReply { ok: boolean; revision: number; state: unknown; settings: unknown; conflict?: boolean; importAlreadyApplied?: boolean; mutationAlreadyApplied?: boolean }
export interface LearningRemote { get(ownerId: string): Promise<RemoteReply>; push(request: SyncRequest): Promise<RemoteReply> }
export interface LearningSnapshot {
  ownerId: string | null;
  data: PersistedState;
  plan: CommutePlan;
  storageIssue: string;
  issue: string;
  syncStatus: SyncStatus;
  syncError: string;
}
interface CacheRecord { version: 1; envelope: SyncEnvelope; session: StudySession | null; settingsTouched: boolean; inFlight: SyncRequest | null }
interface GuestCandidate { id: string; record: CacheRecord }
interface PlanPatch { ownerId: string; id: string; plan: CommutePlan }
interface StoreOptions {
  validIds: string[];
  storage: StorageLike | null;
  remote?: LearningRemote | null;
  online?: () => boolean;
  newId?: () => string;
  lock?: (name: string, work: () => void | Promise<void>) => Promise<void>;
  autoRetry?: boolean;
}

export const accountCacheKey = (id: string) => `${LEARNING_PREFIX}:user:${encodeURIComponent(id)}`;
export const guestCacheKey = (id: string) => `${LEARNING_PREFIX}:guest:${id}`;
const patchKey = (key: string) => `${key}:plan`;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const blank = (): LearningSnapshot => ({ ownerId: null, data: emptyState(), plan: readCommutePlan(null), storageIssue: '', issue: '', syncStatus: 'loading', syncError: '' });
const withoutSession = (data: PersistedState): PersistedState => ({ ...data, session: null });

function randomId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (part) => {
    const value = Math.floor(Math.random() * 16);
    return (part === 'x' ? value : (value & 3) | 8).toString(16);
  });
}

/** Storage/RPC are injected so the account and race boundaries can be tested directly. */
export class LearningStore {
  private view = blank();
  private listeners = new Set<() => void>();
  private memory = new Map<string, string | null>();
  private failedKeys = new Set<string>();
  private activeOwner: string | null = null;
  private activeGuestId: string | null = null;
  private suspended = true;
  private epoch = 0;
  private syncingEpoch: number | null = null;
  private retryCount = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private storageWarning = '';
  private planWarning = '';
  private current: CacheRecord | null = null;

  constructor(private options: StoreOptions) {}
  getSnapshot = (): LearningSnapshot => this.view;
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  private notify() { for (const listener of this.listeners) listener(); }
  private online() { return this.options.online?.() ?? true; }
  private uuid() { return this.options.newId?.() ?? randomId(); }
  private live(epoch: number, owner: string | null) { return this.epoch === epoch && !this.suspended && this.activeOwner === owner; }
  private key() { return this.activeOwner ? accountCacheKey(this.activeOwner) : guestCacheKey(this.activeGuestId!); }
  private envelopeOwner() { return this.activeOwner ?? `guest:${this.activeGuestId}`; }
  private warnStorage() { this.storageWarning = '기기에 기록을 저장하지 못했어요. 이 탭을 닫으면 아직 동기화되지 않은 진도가 사라질 수 있어요.'; }

  private raw(key: string): string | null {
    if (this.failedKeys.has(key)) return this.memory.get(key) ?? null;
    try {
      if (!this.options.storage) throw new Error('Storage unavailable');
      const value = this.options.storage.getItem(key);
      this.memory.set(key, value);
      return value;
    } catch { this.warnStorage(); return this.memory.get(key) ?? null; }
  }
  private json(key: string): unknown {
    try { const raw = this.raw(key); return raw ? JSON.parse(raw) : null; }
    catch { this.warnStorage(); return null; }
  }
  private write(key: string, value: unknown): boolean {
    const raw = JSON.stringify(value);
    this.memory.set(key, raw);
    try {
      if (!this.options.storage) throw new Error('Storage unavailable');
      this.options.storage.setItem(key, raw);
      this.failedKeys.delete(key);
      return true;
    } catch { this.failedKeys.add(key); this.warnStorage(); return false; }
  }
  private remove(key: string): boolean {
    try {
      if (!this.options.storage) throw new Error('Storage unavailable');
      this.options.storage.removeItem(key);
      this.memory.delete(key); this.failedKeys.delete(key);
      return true;
    } catch { this.warnStorage(); return false; }
  }
  private async exclusive(name: string, work: () => void | Promise<void>): Promise<void> {
    if (!this.options.lock) { await work(); return; }
    let entered = false;
    try { await this.options.lock(name, async () => { entered = true; await work(); }); }
    catch (error) { if (entered) throw error; await work(); }
  }
  private record(owner: string, study?: unknown, plan?: unknown): CacheRecord {
    const data = readState(study, this.options.validIds);
    return { version: 1, envelope: createSyncEnvelope(owner, this.options.validIds, withoutSession(data), plan), session: data.session, settingsTouched: false, inFlight: null };
  }
  private readRequest(value: unknown, owner: string): SyncRequest | null {
    if (!isRecord(value) || value.ownerId !== owner || !Number.isSafeInteger(value.expectedRevision) || (value.expectedRevision as number) < 0 || typeof value.mutationId !== 'string' || !UUID.test(value.mutationId)) return null;
    return {
      ownerId: owner, expectedRevision: value.expectedRevision as number,
      study: withoutSession(readState(value.study, this.options.validIds)), settings: readCommutePlan(value.settings),
      importId: typeof value.importId === 'string' && UUID.test(value.importId) ? value.importId : null,
      mutationId: value.mutationId,
    };
  }
  private loadRecord(key: string, owner: string): CacheRecord {
    const value = this.json(key);
    const record = isRecord(value) && value.version === 1 ? {
      version: 1 as const,
      envelope: readSyncEnvelope(value.envelope, owner, this.options.validIds),
      session: readState({ ...emptyState(), session: value.session }, this.options.validIds).session,
      settingsTouched: value.settingsTouched === true,
      inFlight: this.readRequest(value.inFlight, owner),
    } : this.record(owner);
    const patch = this.json(patchKey(key));
    if (isRecord(patch) && patch.ownerId === owner && typeof patch.id === 'string') {
      record.envelope = updateLocalSnapshot(record.envelope, record.envelope.local.study, patch.plan, this.options.validIds);
      record.settingsTouched = true;
    }
    return record;
  }
  private latest(): CacheRecord { return this.loadRecord(this.key(), this.envelopeOwner()); }
  private commit(record: CacheRecord): boolean {
    record.envelope.local.study = withoutSession(record.envelope.local.study);
    const saved = this.write(this.key(), record);
    this.current = record;
    if (saved) {
      const patch = this.json(patchKey(this.key()));
      if (isRecord(patch) && JSON.stringify(readCommutePlan(patch.plan)) === JSON.stringify(record.envelope.local.settings)) this.remove(patchKey(this.key()));
      if (this.activeOwner === null && this.json(LEGACY_OWNER_KEY) === this.activeGuestId) {
        this.write(LEGACY_STUDY_KEY, { ...record.envelope.local.study, session: record.session });
        if (record.settingsTouched) this.write(LEGACY_PLAN_KEY, record.envelope.local.settings);
      }
    }
    return saved;
  }
  private publish(status = this.view.syncStatus, error = this.view.syncError) {
    const record = this.current;
    this.view = {
      ownerId: this.activeOwner,
      data: record ? { ...record.envelope.local.study, session: record.session } : emptyState(),
      plan: record?.envelope.local.settings ?? readCommutePlan(null),
      storageIssue: this.storageWarning, issue: this.planWarning,
      syncStatus: status, syncError: error,
    };
    this.notify();
  }
  private guestHead(): string {
    const existing = this.json(GUEST_HEAD_KEY);
    if (typeof existing === 'string' && UUID.test(existing)) return existing;
    const id = this.uuid();
    const migrated = this.json(MIGRATION_KEY) === true;
    const oldStudy = migrated ? null : this.json(LEGACY_STUDY_KEY);
    const oldPlan = migrated ? null : this.json(LEGACY_PLAN_KEY);
    const record = this.record(`guest:${id}`, oldStudy, oldPlan);
    record.settingsTouched = oldPlan !== null;
    const saved = this.write(guestCacheKey(id), record);
    if (saved && this.write(GUEST_HEAD_KEY, id)) {
      this.write(MIGRATION_KEY, true);
      // Keep the old keys readable until this exact guest archive is acknowledged.
      this.write(LEGACY_OWNER_KEY, id);
    } else this.write(GUEST_HEAD_KEY, id);
    return id;
  }
  private claims(): Record<string, string> {
    const raw = this.json(GUEST_CLAIMS_KEY);
    return isRecord(raw) ? Object.fromEntries(Object.entries(raw).filter(([id, owner]) => UUID.test(id) && typeof owner === 'string' && owner.length > 0)) as Record<string, string> : {};
  }
  /** Import/retirement must honor another tab's durable owner over failed memory writes. */
  private durableClaims(): Record<string, string> | null {
    try {
      if (!this.options.storage) throw new Error('Storage unavailable');
      const serialized = this.options.storage.getItem(GUEST_CLAIMS_KEY);
      const value: unknown = serialized ? JSON.parse(serialized) : null;
      const claims = isRecord(value) ? Object.fromEntries(Object.entries(value).filter(([id, owner]) => UUID.test(id) && typeof owner === 'string' && owner.length > 0)) as Record<string, string> : {};
      this.memory.set(GUEST_CLAIMS_KEY, serialized); this.failedKeys.delete(GUEST_CLAIMS_KEY);
      return claims;
    } catch { this.warnStorage(); return null; }
  }
  private rotateGuest(id: string) {
    if (this.json(GUEST_HEAD_KEY) !== id) return;
    const fresh = this.uuid();
    this.write(guestCacheKey(fresh), this.record(`guest:${fresh}`));
    // A full/blocked device still needs a fresh in-memory guest head. The claimed
    // archive remains intact; it must never become the signed-out learning view.
    this.write(GUEST_HEAD_KEY, fresh);
  }

  /** Run from a layout effect. Auth transitions suspend uploads without touching guest ownership. */
  activate(owner: string | null, authLoading = false) {
    if (this.activeOwner === owner && this.suspended === authLoading && this.current) return;
    this.epoch += 1;
    this.activeOwner = owner; this.suspended = authLoading;
    this.syncingEpoch = null; this.retryCount = 0;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null; this.storageWarning = ''; this.planWarning = '';
    if (authLoading) { this.current = null; this.publish('loading', ''); return; }
    this.activeGuestId = owner ? null : this.guestHead();
    if (!owner && this.claims()[this.activeGuestId!]) {
      this.rotateGuest(this.activeGuestId!);
      this.activeGuestId = this.guestHead();
    }
    this.current = this.latest();
    this.publish(owner ? this.online() ? 'loading' : 'pending' : 'guest', '');
    if (owner) void this.sync();
  }
  stop() { this.epoch += 1; this.suspended = true; this.syncingEpoch = null; if (this.timer) clearTimeout(this.timer); this.timer = null; }

  async setData(update: PersistedState | ((value: PersistedState) => PersistedState)): Promise<void> {
    const epoch = this.epoch, owner = this.activeOwner, guest = this.activeGuestId;
    await this.exclusive(owner ? `${accountCacheKey(owner)}:write` : `${LEARNING_PREFIX}:guest-write`, () => {
      if (!this.live(epoch, owner) || guest !== this.activeGuestId) return;
      if (!owner && (this.json(GUEST_HEAD_KEY) !== guest || this.claims()[guest!])) { this.current = null; this.activate(null); return; }
      const record = this.latest();
      const previous = { ...record.envelope.local.study, session: record.session };
      const next = readState(typeof update === 'function' ? update(previous) : update, this.options.validIds);
      record.envelope = updateLocalSnapshot(record.envelope, withoutSession(next), record.envelope.local.settings, this.options.validIds);
      record.session = next.session;
      this.commit(record);
      this.publish(owner ? record.envelope.pending ? 'pending' : this.view.syncStatus : 'guest', '');
    });
    if (this.live(epoch, owner) && owner) void this.sync();
  }

  /** A durable small intent preserves the synchronous save API without bypassing the shared write lock. */
  savePlan(next: CommutePlan): boolean {
    if (this.suspended || !this.current) return false;
    const epoch = this.epoch, owner = this.activeOwner, guest = this.activeGuestId;
    if (!owner && (this.json(GUEST_HEAD_KEY) !== guest || this.claims()[guest!])) { this.current = null; this.activate(null); return false; }
    const patch: PlanPatch = { ownerId: this.envelopeOwner(), id: this.uuid(), plan: readCommutePlan(next) };
    const saved = this.write(patchKey(this.key()), patch);
    this.current.envelope = updateLocalSnapshot(this.current.envelope, this.current.envelope.local.study, patch.plan, this.options.validIds);
    this.current.settingsTouched = true;
    this.planWarning = saved ? '' : '출퇴근 시간을 저장하지 못했어요. 이 탭에서는 선택한 시간을 사용할 수 있어요.';
    this.publish(owner ? 'pending' : 'guest', '');
    void this.exclusive(owner ? `${accountCacheKey(owner)}:write` : `${LEARNING_PREFIX}:guest-write`, () => {
      if (!this.live(epoch, owner) || guest !== this.activeGuestId) return;
      if (!owner && (this.json(GUEST_HEAD_KEY) !== guest || this.claims()[guest!])) { this.current = null; this.activate(null); return; }
      this.commit(this.latest()); this.publish(owner ? 'pending' : 'guest', '');
    }).then(() => { if (this.live(epoch, owner) && owner) void this.sync(); });
    return saved;
  }

  storageChanged(key: string | null) {
    if (this.suspended || !this.current) return;
    const guestKey = !this.activeOwner && (key === GUEST_HEAD_KEY || key === GUEST_CLAIMS_KEY);
    if (key !== null && key !== this.key() && key !== patchKey(this.key()) && !guestKey) return;
    const unsaved = this.activeOwner && (this.failedKeys.has(this.key()) || this.failedKeys.has(patchKey(this.key()))) ? this.current : null;
    if (unsaved) {
      const owner = this.activeOwner!, epoch = this.epoch;
      // Keep failed local writes visible while waiting for the same lock used by
      // ordinary edits, then merge against the newest external record under it.
      void this.exclusive(`${accountCacheKey(owner)}:write`, () => {
        if (!this.live(epoch, owner)) return;
        const local = this.latest();
        if (key === null) { this.memory.clear(); this.failedKeys.clear(); }
        else {
          this.memory.delete(this.key()); this.failedKeys.delete(this.key());
          this.memory.delete(patchKey(this.key())); this.failedKeys.delete(patchKey(this.key()));
        }
        const external = this.latest();
        const revision = Math.max(local.envelope.remoteRevision, external.envelope.remoteRevision);
        const base = local.envelope.remoteRevision >= external.envelope.remoteRevision ? local.envelope.base : external.envelope.base;
        const ours = rebaseSyncEnvelope(local.envelope, revision, base.study, base.settings, this.options.validIds);
        const theirs = rebaseSyncEnvelope(external.envelope, revision, base.study, base.settings, this.options.validIds);
        const merged = updateLocalSnapshot(ours,
          mergeStudySnapshots(base.study, ours.local.study, theirs.local.study, this.options.validIds),
          mergeCommutePlans(base.settings, ours.local.settings, theirs.local.settings), this.options.validIds);
        merged.importedGuestIds = [...new Set([...ours.importedGuestIds, ...theirs.importedGuestIds])];
        merged.guestImportId = ours.guestImportId ?? theirs.guestImportId;
        this.commit({ ...local, envelope: merged, inFlight: local.inFlight ?? external.inFlight, settingsTouched: local.settingsTouched || external.settingsTouched });
        this.publish(this.current!.envelope.pending ? 'pending' : this.view.syncStatus, this.view.syncError);
      }).then(() => { if (this.live(epoch, owner)) void this.sync(); });
      return;
    }
    if (key === null) { this.memory.clear(); this.failedKeys.clear(); }
    else { this.memory.delete(key); this.failedKeys.delete(key); }
    if (!this.activeOwner && (key === GUEST_HEAD_KEY || key === GUEST_CLAIMS_KEY || key === null)) {
      this.current = null; this.activate(null); return;
    }
    this.current = this.latest();
    // An external cache write is not confirmation that this tab reached the server.
    this.publish(this.activeOwner ? this.current!.envelope.pending ? 'pending' : this.view.syncStatus : 'guest', this.view.syncError);
    if (this.activeOwner) void this.sync();
  }
  retrySync = async (): Promise<void> => { this.retryCount = 0; if (this.timer) clearTimeout(this.timer); this.timer = null; await this.sync(); };

  private async guestForImport(owner: string, epoch: number, record: CacheRecord): Promise<{ candidate: GuestCandidate | null; blocked: boolean }> {
    let candidate: GuestCandidate | null = null, blocked = false;
    await this.exclusive(`${LEARNING_PREFIX}:guest-write`, () => {
      if (!this.live(epoch, owner)) return;
      // A failed in-memory reservation grants no ownership. Another tab may
      // already have durably claimed this archive, and its owner must win.
      const claims = this.durableClaims();
      if (!claims) { blocked = true; return; }
      const prior = record.envelope.guestImportId ?? Object.keys(claims).find(id => claims[id] === owner && !record.envelope.importedGuestIds.includes(id));
      if (prior && claims[prior] === owner) {
        candidate = { id: prior, record: this.loadRecord(guestCacheKey(prior), `guest:${prior}`) };
        this.rotateGuest(prior); return;
      }
      if (record.envelope.guestImportId) return;
      const id = this.guestHead();
      if (claims[id] && claims[id] !== owner) { this.rotateGuest(id); return; }
      const guest = this.loadRecord(guestCacheKey(id), `guest:${id}`);
      const data = guest.envelope.local.study;
      if (!Object.keys(data.progress).length && !data.bookmarks.length && !data.history.length && !guest.session && !guest.settingsTouched) return;
      const claim = claimGuestImport(claims[id] ? { guestId: id, ownerId: claims[id] } : null, id, owner);
      if (!claim.allowed) return;
      // Without a durable ownership claim, importing could give a later account the same guest records.
      if (!this.write(GUEST_CLAIMS_KEY, { ...claims, [id]: owner })) { blocked = true; return; }
      candidate = { id, record: guest };
      this.rotateGuest(id);
    });
    return { candidate, blocked };
  }
  private async importGuest(owner: string, epoch: number): Promise<boolean> {
    if (!this.live(epoch, owner)) return false;
    const { candidate, blocked } = await this.guestForImport(owner, epoch, this.latest());
    if (!candidate || !this.live(epoch, owner)) return blocked;
    await this.exclusive(`${accountCacheKey(owner)}:write`, () => {
      if (!this.live(epoch, owner)) return;
      const record = this.latest();
      record.envelope = importGuestSnapshot(record.envelope, candidate.id, { ...candidate.record.envelope.local.study, session: candidate.record.session }, candidate.record.envelope.local.settings, this.options.validIds, { importSettings: record.envelope.remoteRevision === 0 });
      record.session = record.session ?? record.envelope.local.study.session;
      this.commit(record); this.publish('syncing', '');
    });
    return false;
  }
  private async retireGuest(owner: string, epoch: number, id: string) {
    await this.exclusive(`${LEARNING_PREFIX}:guest-write`, () => {
      if (!this.live(epoch, owner)) return;
      const claims = this.durableClaims();
      if (!claims || claims[id] !== owner) return;
      this.rotateGuest(id);
      if (this.json(GUEST_HEAD_KEY) === id) return;
      if (!this.remove(guestCacheKey(id))) return;
      this.remove(patchKey(guestCacheKey(id)));
      const next = { ...claims }; delete next[id];
      this.write(GUEST_CLAIMS_KEY, next);
      if (this.json(LEGACY_OWNER_KEY) === id) {
        this.remove(LEGACY_STUDY_KEY); this.remove(LEGACY_PLAN_KEY); this.remove(LEGACY_OWNER_KEY);
      }
    });
  }
  private validate(reply: RemoteReply): RemoteReply {
    if (!Number.isSafeInteger(reply.revision) || reply.revision < 0 || (!reply.ok && !reply.conflict)) throw new Error('Invalid learning response');
    return reply;
  }
  private scheduleRetry(epoch: number, owner: string) {
    if (this.options.autoRetry === false || !this.live(epoch, owner) || !this.online() || this.retryCount >= 3) return;
    const delay = [1000, 3000, 10000][this.retryCount++];
    this.timer = setTimeout(() => { this.timer = null; if (this.live(epoch, owner)) void this.sync(); }, delay);
  }

  private storagePending(epoch: number, owner: string, importing = false) {
    if (!this.live(epoch, owner)) return;
    this.publish('pending', importing
      ? '이 기기의 기록을 계정으로 옮기지 못했어요. 저장 공간을 확인한 뒤 다시 동기화해 주세요.'
      : '동기화할 기록을 기기에 저장하지 못했어요. 저장 공간을 확인한 뒤 다시 동기화해 주세요.');
    this.scheduleRetry(epoch, owner);
  }

  /** An uncertain upload is retried against its original baseline and stable UUID. */
  private async sendFrozen(owner: string, epoch: number, request: SyncRequest): Promise<'ok' | 'conflict' | 'blocked' | 'stale'> {
    const reply = this.validate(await this.options.remote!.push(request));
    if (!this.live(epoch, owner)) return 'stale';
    let durable = false;
    await this.exclusive(`${accountCacheKey(owner)}:write`, () => {
      if (!this.live(epoch, owner)) return;
      const record = this.latest();
      record.envelope = reply.conflict
        ? rebaseSyncEnvelope(record.envelope, reply.revision, reply.state, reply.settings, this.options.validIds)
        : acknowledgeSync(record.envelope, request, reply.revision, reply.state, reply.settings, this.options.validIds);
      record.inFlight = null;
      durable = this.commit(record);
      if (!durable) {
        // Keep the original request until the ACK and its new baseline are durable.
        record.inFlight = request; this.commit(record);
      }
      this.publish('syncing', '');
    });
    if (!this.live(epoch, owner)) return 'stale';
    if (!durable) return 'blocked';
    if (reply.ok && request.importId) await this.retireGuest(owner, epoch, request.importId);
    return reply.conflict ? 'conflict' : 'ok';
  }

  async sync(): Promise<void> {
    const owner = this.activeOwner, epoch = this.epoch;
    if (!owner || this.suspended || this.syncingEpoch === epoch) return;
    if (!this.options.remote || !this.online()) { this.publish('pending', ''); return; }
    this.syncingEpoch = epoch; this.publish('syncing', '');
    try {
      await this.exclusive(`${accountCacheKey(owner)}:sync`, async () => {
        if (!this.live(epoch, owner)) return;
        // Resolve a lost response before GET can rebase away its upload baseline.
        const frozen = this.latest().inFlight;
        if (frozen) {
          const result = await this.sendFrozen(owner, epoch, frozen);
          if (result === 'stale') return;
          if (result === 'blocked') { this.storagePending(epoch, owner); return; }
        }
        const remote = this.validate(await this.options.remote!.get(owner));
        if (!this.live(epoch, owner)) return;
        await this.exclusive(`${accountCacheKey(owner)}:write`, () => {
          if (!this.live(epoch, owner)) return;
          const record = this.latest();
          record.envelope = rebaseSyncEnvelope(record.envelope, remote.revision, remote.state, remote.settings, this.options.validIds);
          this.commit(record); this.publish('syncing', '');
        });
        let importBlocked = await this.importGuest(owner, epoch);
        for (let attempt = 0; attempt < 3 && this.live(epoch, owner); attempt += 1) {
          let request: SyncRequest | null = null;
          let durable = false;
          await this.exclusive(`${accountCacheKey(owner)}:write`, () => {
            if (!this.live(epoch, owner)) return;
            const record = this.latest();
            request = record.inFlight ?? prepareSync(record.envelope);
            if (!request) return;
            request = { ...request, mutationId: request.mutationId ?? this.uuid() };
            record.inFlight = request;
            durable = this.commit(record);
          });
          if (!this.live(epoch, owner)) return;
          if (!request) {
            this.current = this.latest();
            if (importBlocked) this.storagePending(epoch, owner, true);
            else { this.publish('synced', ''); this.retryCount = 0; }
            return;
          }
          // Never send a fresh UUID if its exact request cannot survive a reload.
          if (!durable) { this.storagePending(epoch, owner); return; }
          const result = await this.sendFrozen(owner, epoch, request);
          if (result === 'stale') return;
          if (result === 'blocked') { this.storagePending(epoch, owner); return; }
          if (result === 'ok') importBlocked = await this.importGuest(owner, epoch);
        }
        if (this.live(epoch, owner)) {
          this.current = this.latest();
          if (importBlocked) this.storagePending(epoch, owner, true);
          else if (this.current.envelope.pending || this.current.inFlight) { this.publish('pending', '기록이 계속 바뀌어 다음 연결 때 다시 동기화할게요.'); this.scheduleRetry(epoch, owner); }
          else { this.publish('synced', ''); this.retryCount = 0; }
        }
      });
    } catch {
      if (this.live(epoch, owner)) {
        this.publish(this.online() ? 'error' : 'pending', '동기화하지 못했어요. 기기에 저장된 기록으로 계속 학습할 수 있어요.');
        this.scheduleRetry(epoch, owner);
      }
    } finally { if (this.syncingEpoch === epoch) this.syncingEpoch = null; }
  }
}
