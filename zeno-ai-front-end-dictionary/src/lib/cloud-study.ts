import { readCommutePlan, type CommutePlan } from './review-plan';
import { emptyState, readState, type CardProgress, type PersistedState } from './study';

export interface SyncSnapshot {
  study: PersistedState;
  settings: CommutePlan;
}

/** Stored separately for each account. Sessions belong only to this device. */
export interface SyncEnvelope {
  version: 1;
  ownerId: string;
  remoteRevision: number;
  base: SyncSnapshot;
  local: SyncSnapshot;
  pending: boolean;
  guestImportId: string | null;
  importedGuestIds: string[];
}

/** An immutable upload snapshot; keep it until its response has been handled. */
export interface SyncRequest {
  ownerId: string;
  expectedRevision: number;
  study: PersistedState;
  settings: CommutePlan;
  importId: string | null;
  /** Persisted with a frozen request so a lost response can be retried safely. */
  mutationId?: string;
}

export interface GuestImportClaim {
  guestId: string;
  ownerId: string;
}

const HISTORY_LIMIT = 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRevision(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isGuestId(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function checkOwner(ownerId: string): void {
  if (typeof ownerId !== 'string' || !ownerId.trim()) throw new TypeError('An account owner is required.');
}

/** Exact event tuples are stable across uploads and older, UUID-less records. */
export function historyEventKey(event: PersistedState['history'][number]): string {
  return JSON.stringify([event.id, event.at, event.rating]);
}

function mergeHistory(...histories: PersistedState['history'][]): PersistedState['history'] {
  const events = new Map<string, PersistedState['history'][number]>();
  for (const history of histories) {
    for (const event of history) events.set(historyEventKey(event), { ...event });
  }
  return [...events.values()]
    .sort((a, b) => a.at - b.at || compareStrings(historyEventKey(a), historyEventKey(b)))
    .slice(-HISTORY_LIMIT);
}

function safeStudy(value: unknown, validIds: string[], keepSession = true): PersistedState {
  const study = readState(value, validIds);
  return {
    ...study,
    progress: Object.fromEntries(Object.entries(study.progress).sort(([a], [b]) => compareStrings(a, b))),
    bookmarks: [...study.bookmarks].sort(),
    history: mergeHistory(study.history),
    session: keepSession ? study.session : null,
  };
}

function cloneStudy(study: PersistedState, keepSession = true): PersistedState {
  return {
    version: 1,
    progress: Object.fromEntries(Object.entries(study.progress).map(([id, progress]) => [id, { ...progress }])),
    bookmarks: [...study.bookmarks],
    history: study.history.map((event) => ({ ...event })),
    session: keepSession && study.session ? {
      ...study.session,
      ids: [...study.session.ids],
      ratings: [...study.session.ratings],
    } : null,
  };
}

function progressKey(progress: CardProgress | undefined): string {
  return progress ? JSON.stringify([progress.lastReviewedAt, progress.reviews, progress.interval, progress.dueAt, progress.lastRating]) : '';
}

function latestProgress(local: CardProgress | undefined, remote: CardProgress | undefined): CardProgress | undefined {
  if (!local) return remote;
  if (!remote) return local;
  if (local.lastReviewedAt !== remote.lastReviewedAt) return local.lastReviewedAt > remote.lastReviewedAt ? local : remote;
  // Resolve equal timestamps deterministically without adding review counters.
  if (local.reviews !== remote.reviews) return local.reviews > remote.reviews ? local : remote;
  return progressKey(local) >= progressKey(remote) ? local : remote;
}

/** Three-way merge keeps bookmark removals and independent card updates. */
export function mergeStudySnapshots(baseValue: unknown, localValue: unknown, remoteValue: unknown, validIds: string[]): PersistedState {
  const base = safeStudy(baseValue, validIds, false);
  const local = safeStudy(localValue, validIds);
  const remote = safeStudy(remoteValue, validIds, false);
  const progress: Record<string, CardProgress> = {};
  const progressIds = new Set([...Object.keys(base.progress), ...Object.keys(local.progress), ...Object.keys(remote.progress)]);
  for (const id of [...progressIds].sort()) {
    const baseline = base.progress[id];
    const ours = local.progress[id];
    const theirs = remote.progress[id];
    const selected = progressKey(ours) === progressKey(baseline) ? theirs
      : progressKey(theirs) === progressKey(baseline) ? ours
      : latestProgress(ours, theirs);
    if (selected) progress[id] = { ...selected };
  }

  const baseBookmarks = new Set(base.bookmarks);
  const localBookmarks = new Set(local.bookmarks);
  const remoteBookmarks = new Set(remote.bookmarks);
  const bookmarkIds = new Set([...base.bookmarks, ...local.bookmarks, ...remote.bookmarks]);
  const bookmarks = [...bookmarkIds].sort().filter((id) => {
    const baseline = baseBookmarks.has(id);
    const ours = localBookmarks.has(id);
    const theirs = remoteBookmarks.has(id);
    return ours === baseline ? theirs : ours;
  });

  return { version: 1, progress, bookmarks, history: mergeHistory(local.history, remote.history), session: local.session };
}

/** Independent changes to morning/evening/weekdays can merge without a timestamp. */
export function mergeCommutePlans(baseValue: unknown, localValue: unknown, remoteValue: unknown): CommutePlan {
  const base = readCommutePlan(baseValue);
  const local = readCommutePlan(localValue);
  const remote = readCommutePlan(remoteValue);
  return {
    morning: local.morning === base.morning ? remote.morning : local.morning,
    evening: local.evening === base.evening ? remote.evening : local.evening,
    weekdaysOnly: local.weekdaysOnly === base.weekdaysOnly ? remote.weekdaysOnly : local.weekdaysOnly,
  };
}

/** Remote session data is deliberately ignored, including malformed session data. */
export function readCloudSnapshot(state: unknown, settings: unknown, validIds: string[]): SyncSnapshot {
  return { study: safeStudy(state, validIds, false), settings: readCommutePlan(settings) };
}

function snapshotsEqual(a: SyncSnapshot, b: SyncSnapshot): boolean {
  return JSON.stringify(cloneStudy(a.study, false)) === JSON.stringify(cloneStudy(b.study, false))
    && JSON.stringify(a.settings) === JSON.stringify(b.settings);
}

function withPending(envelope: SyncEnvelope): SyncEnvelope {
  return { ...envelope, pending: envelope.guestImportId !== null || !snapshotsEqual(envelope.local, envelope.base) };
}

export function createSyncEnvelope(ownerId: string, validIds: string[], study?: unknown, settings?: unknown): SyncEnvelope {
  checkOwner(ownerId);
  return withPending({
    version: 1,
    ownerId,
    remoteRevision: 0,
    base: readCloudSnapshot(emptyState(), null, validIds),
    local: { study: safeStudy(study, validIds), settings: readCommutePlan(settings) },
    pending: false,
    guestImportId: null,
    importedGuestIds: [],
  });
}

/** A cache from another account can never become the current account's state. */
export function readSyncEnvelope(value: unknown, ownerId: string, validIds: string[]): SyncEnvelope {
  checkOwner(ownerId);
  if (!isRecord(value) || value.version !== 1 || value.ownerId !== ownerId || !isRevision(value.remoteRevision)) {
    return createSyncEnvelope(ownerId, validIds);
  }
  const base = isRecord(value.base) ? readCloudSnapshot(value.base.study, value.base.settings, validIds) : readCloudSnapshot(null, null, validIds);
  const local = isRecord(value.local) ? { study: safeStudy(value.local.study, validIds), settings: readCommutePlan(value.local.settings) } : {
    study: cloneStudy(base.study), settings: { ...base.settings },
  };
  const guestImportId = isGuestId(value.guestImportId) ? value.guestImportId : null;
  const importedGuestIds = Array.isArray(value.importedGuestIds) ? [...new Set(value.importedGuestIds.filter(isGuestId))] : [];
  if (guestImportId && !importedGuestIds.includes(guestImportId)) importedGuestIds.push(guestImportId);
  return withPending({ version: 1, ownerId, remoteRevision: value.remoteRevision, base, local, pending: false, guestImportId, importedGuestIds });
}

export function updateLocalSnapshot(envelope: SyncEnvelope, study: unknown, settings: unknown, validIds: string[]): SyncEnvelope {
  return withPending({ ...envelope, local: { study: safeStudy(study, validIds), settings: readCommutePlan(settings) } });
}

/** Re-fetch after a CAS conflict, rebase, then prepare another upload. */
export function rebaseSyncEnvelope(envelope: SyncEnvelope, remoteRevision: number, state: unknown, settings: unknown, validIds: string[]): SyncEnvelope {
  if (!isRevision(remoteRevision) || remoteRevision < envelope.remoteRevision) return envelope;
  const remote = readCloudSnapshot(state, settings, validIds);
  return withPending({
    ...envelope,
    remoteRevision,
    base: remote,
    local: {
      study: mergeStudySnapshots(envelope.base.study, envelope.local.study, remote.study, validIds),
      settings: mergeCommutePlans(envelope.base.settings, envelope.local.settings, remote.settings),
    },
  });
}

export function prepareSync(envelope: SyncEnvelope): SyncRequest | null {
  if (!withPending(envelope).pending) return null;
  return {
    ownerId: envelope.ownerId,
    expectedRevision: envelope.remoteRevision,
    study: cloneStudy(envelope.local.study, false),
    settings: { ...envelope.local.settings },
    importId: envelope.guestImportId,
  };
}

/** Merge changes made while the captured request was in flight against its ACK. */
export function acknowledgeSync(envelope: SyncEnvelope, request: SyncRequest, remoteRevision: number, state: unknown, settings: unknown, validIds: string[]): SyncEnvelope {
  if (request.ownerId !== envelope.ownerId || !isRevision(remoteRevision) || remoteRevision < envelope.remoteRevision || remoteRevision < request.expectedRevision) return envelope;
  const remote = readCloudSnapshot(state, settings, validIds);
  return withPending({
    ...envelope,
    remoteRevision,
    base: remote,
    local: {
      study: mergeStudySnapshots(request.study, envelope.local.study, remote.study, validIds),
      settings: mergeCommutePlans(request.settings, envelope.local.settings, remote.settings),
    },
    guestImportId: envelope.guestImportId === request.importId ? null : envelope.guestImportId,
  });
}

/** Persist the returned claim before starting an import into that account. */
export function claimGuestImport(claim: GuestImportClaim | null, guestId: string, ownerId: string): { claim: GuestImportClaim; allowed: boolean; newClaim: boolean } {
  checkOwner(ownerId);
  if (!isGuestId(guestId)) throw new TypeError('A guest import UUID is required.');
  if (claim) return { claim: { ...claim }, allowed: claim.guestId === guestId && claim.ownerId === ownerId, newClaim: false };
  return { claim: { guestId, ownerId }, allowed: true, newClaim: true };
}

/** Called only after a durable claim. Keep its UUID for the server's import CAS. */
export function importGuestSnapshot(envelope: SyncEnvelope, guestId: string, study: unknown, settings: unknown, validIds: string[], options: { importSettings?: boolean } = {}): SyncEnvelope {
  if (!isGuestId(guestId)) throw new TypeError('A guest import UUID is required.');
  if (envelope.importedGuestIds.includes(guestId)) return envelope;
  if (envelope.guestImportId && envelope.guestImportId !== guestId) throw new Error('Finish the pending guest import first.');
  const guest = safeStudy(study, validIds);
  const importedStudy = mergeStudySnapshots(emptyState(), envelope.local.study, guest, validIds);
  importedStudy.session = importedStudy.session ?? guest.session;
  const importSettings = options.importSettings ?? envelope.remoteRevision === 0;
  const localSettingsUnchanged = JSON.stringify(envelope.local.settings) === JSON.stringify(envelope.base.settings);
  return withPending({
    ...envelope,
    local: {
      study: importedStudy,
      settings: importSettings && localSettingsUnchanged ? readCommutePlan(settings) : { ...envelope.local.settings },
    },
    guestImportId: guestId,
    importedGuestIds: [...envelope.importedGuestIds, guestId],
  });
}
