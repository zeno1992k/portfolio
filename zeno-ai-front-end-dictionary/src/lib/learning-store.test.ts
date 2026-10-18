import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LearningStore, accountCacheKey, guestCacheKey, GUEST_HEAD_KEY, GUEST_CLAIMS_KEY,
  LEGACY_STUDY_KEY, LEGACY_PLAN_KEY, type LearningRemote, type RemoteReply, type StorageLike,
} from './learning-store';
import { emptyState, type PersistedState } from './study';
import { readCommutePlan } from './review-plan';
import type { SyncRequest } from './cloud-study';

const validIds = ['a', 'b', 'c'];
const copy = <T,>(value: T): T => structuredClone(value);
const tick = () => new Promise<void>(resolve => setImmediate(resolve));
async function until(check: () => boolean) { for (let i = 0; i < 30 && !check(); i++) await tick(); assert.ok(check(), 'Async operation settled'); }
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (error: unknown) => void; const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
let nextUuid = 0;
function uuidFactory() { return () => `00000000-0000-4000-8000-${String(++nextUuid).padStart(12, '0')}`; }
function study(bookmarks: string[] = []): PersistedState { return { ...emptyState(), bookmarks }; }

class FakeStorage implements StorageLike {
  values = new Map<string, string>();
  blocked = false;
  blockedKey = '';
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { if (this.blocked || key === this.blockedKey) throw new Error('Storage full'); this.values.set(key, value); }
  removeItem(key: string) { if (this.blocked) throw new Error('Storage full'); this.values.delete(key); }
  put(key: string, value: unknown) { this.values.set(key, JSON.stringify(value)); }
  read(key: string) { const raw = this.values.get(key); return raw ? JSON.parse(raw) : null; }
}
class FakeRemote implements LearningRemote {
  states = new Map<string, { revision: number; state: PersistedState; settings: ReturnType<typeof readCommutePlan>; imports: Set<string>; mutations: Set<string> }>();
  requests: SyncRequest[] = [];
  getGate: { owner: string; value: ReturnType<typeof deferred<RemoteReply>> } | null = null;
  pushGate: ReturnType<typeof deferred<void>> | null = null;
  loseNextReply = false;
  conflictAlways = false;
  state(owner: string) { if (!this.states.has(owner)) this.states.set(owner, { revision: 0, state: emptyState(), settings: readCommutePlan(null), imports: new Set(), mutations: new Set() }); return this.states.get(owner)!; }
  payload(owner: string): RemoteReply { const row = this.state(owner); return { ok: true, revision: row.revision, state: copy(row.state), settings: copy(row.settings) }; }
  async get(owner: string) { if (this.getGate?.owner === owner) return this.getGate.value.promise; return this.payload(owner); }
  async push(request: SyncRequest): Promise<RemoteReply> {
    this.requests.push(copy(request));
    if (this.pushGate) { const gate = this.pushGate; this.pushGate = null; await gate.promise; }
    const row = this.state(request.ownerId);
    if (request.mutationId && row.mutations.has(request.mutationId)) return { ...this.payload(request.ownerId), mutationAlreadyApplied: true };
    if (request.importId && row.imports.has(request.importId)) return { ...this.payload(request.ownerId), importAlreadyApplied: true };
    if (this.conflictAlways || request.expectedRevision !== row.revision) {
      if (this.conflictAlways) row.revision++;
      return { ...this.payload(request.ownerId), ok: false, conflict: true };
    }
    row.state = copy(request.study); row.settings = copy(request.settings); row.revision++;
    if (request.importId) row.imports.add(request.importId);
    if (request.mutationId) row.mutations.add(request.mutationId);
    if (this.loseNextReply) { this.loseNextReply = false; throw new Error('Response lost after commit'); }
    return this.payload(request.ownerId);
  }
}
function make(storage = new FakeStorage(), remote: LearningRemote | null = null, online = () => true, lock?: (name: string, work: () => void | Promise<void>) => Promise<void>) {
  return new LearningStore({ validIds, storage, remote, online, lock, newId: uuidFactory(), autoRetry: false });
}

test('legacy guest records, local session and explicit commute settings survive migration', async () => {
  const storage = new FakeStorage();
  const initial = { ...study(['a']), session: { ids: ['a', 'b'], index: 0, ratings: [], revealed: true, startedAt: 1000 } };
  storage.put(LEGACY_STUDY_KEY, initial);
  storage.put(LEGACY_PLAN_KEY, { morning: '09:00', evening: '19:00', weekdaysOnly: false });
  const store = make(storage); store.activate(null);
  assert.deepEqual(store.getSnapshot().data, initial);
  assert.equal(store.getSnapshot().plan.morning, '09:00');
  assert.ok(storage.read(LEGACY_STUDY_KEY), 'Original keys are not removed during migration');
  await store.setData(value => ({ ...value, bookmarks: [...value.bookmarks, 'b'] }));
  assert.deepEqual(storage.read(LEGACY_STUDY_KEY).bookmarks, ['a', 'b']);
  assert.equal(store.getSnapshot().syncStatus, 'guest');
});

test('account caches and local sessions remain isolated while offline and after reload', async () => {
  const storage = new FakeStorage(), store = make(storage, null, () => false);
  store.activate('A');
  await store.setData(value => ({ ...value, bookmarks: ['a'], session: { ids: ['a'], index: 0, ratings: [], revealed: false, startedAt: 1000 } }));
  store.activate('B'); assert.deepEqual(store.getSnapshot().data.bookmarks, []); assert.equal(store.getSnapshot().data.session, null);
  await store.setData(value => ({ ...value, bookmarks: ['b'] }));
  store.activate('A'); assert.deepEqual(store.getSnapshot().data.bookmarks, ['a']); assert.equal(store.getSnapshot().data.session?.ids[0], 'a');
  const reload = make(storage, null, () => false); reload.activate('A');
  assert.deepEqual(reload.getSnapshot().data.bookmarks, ['a']); assert.equal(reload.getSnapshot().syncStatus, 'pending');
  reload.activate(null); assert.deepEqual(reload.getSnapshot().data.bookmarks, []);
});

test('fetch merges pending local edits made while a remote read is in flight', async () => {
  const storage = new FakeStorage(), remote = new FakeRemote(), gate = deferred<RemoteReply>();
  remote.getGate = { owner: 'A', value: gate };
  const store = make(storage, remote); store.activate('A');
  await store.setData(value => ({ ...value, bookmarks: ['a'] }));
  gate.resolve({ ok: true, revision: 1, state: study(['b']), settings: readCommutePlan(null) }); remote.getGate = null;
  remote.state('A').revision = 1; remote.state('A').state = study(['b']);
  await until(() => store.getSnapshot().syncStatus === 'synced');
  assert.deepEqual(store.getSnapshot().data.bookmarks, ['a', 'b']);
  assert.deepEqual(remote.state('A').state.bookmarks, ['a', 'b']);
});

test('ACK preserves bookmark removals made during upload and sends the remaining edit', async () => {
  const storage = new FakeStorage(), remote = new FakeRemote(); remote.state('A').state = study(['b']); remote.state('A').revision = 1;
  const store = make(storage, remote); store.activate('A'); await until(() => store.getSnapshot().syncStatus === 'synced');
  const gate = deferred<void>(); remote.pushGate = gate;
  await store.setData(value => ({ ...value, bookmarks: ['a', 'b'] })); await until(() => remote.requests.length === 1);
  await store.setData(value => ({ ...value, bookmarks: value.bookmarks.filter(id => id !== 'b') }));
  gate.resolve(); await until(() => store.getSnapshot().syncStatus === 'synced');
  assert.deepEqual(store.getSnapshot().data.bookmarks, ['a']); assert.deepEqual(remote.state('A').state.bookmarks, ['a']); assert.equal(remote.requests.length, 2);
});

test('a stale remote result cannot write into or display the newly selected account', async () => {
  const storage = new FakeStorage(), remote = new FakeRemote(), gate = deferred<RemoteReply>();
  remote.getGate = { owner: 'A', value: gate }; remote.state('B').state = study(['b']); remote.state('B').revision = 1;
  const store = make(storage, remote); store.activate('A'); store.activate('B');
  await until(() => store.getSnapshot().syncStatus === 'synced');
  gate.resolve({ ok: true, revision: 1, state: study(['a']), settings: readCommutePlan(null) }); await tick();
  assert.equal(store.getSnapshot().ownerId, 'B'); assert.deepEqual(store.getSnapshot().data.bookmarks, ['b']);
  assert.equal(storage.getItem(accountCacheKey('A')), null, 'Late A read is not cached after switching');
});

test('guest claims prevent a second account from importing and retain the archive until ACK', async () => {
  const storage = new FakeStorage(); storage.put(LEGACY_STUDY_KEY, study(['a']));
  const remote = new FakeRemote(), gate = deferred<void>(); remote.pushGate = gate;
  const store = make(storage, remote); store.activate(null);
  const guestId = storage.read(GUEST_HEAD_KEY); store.activate('A'); await until(() => remote.requests.length === 1);
  assert.equal(storage.read(GUEST_CLAIMS_KEY)[guestId], 'A'); assert.ok(storage.getItem(guestCacheKey(guestId))); assert.ok(storage.getItem(LEGACY_STUDY_KEY));
  store.activate('B'); await until(() => store.getSnapshot().syncStatus === 'synced'); assert.deepEqual(store.getSnapshot().data.bookmarks, []);
  store.activate(null); assert.deepEqual(store.getSnapshot().data.bookmarks, []);
  gate.resolve(); await tick(); assert.ok(storage.getItem(guestCacheKey(guestId)), 'A late ACK leaves the archive for A recovery');
  store.activate('A'); await until(() => store.getSnapshot().syncStatus === 'synced');
  assert.deepEqual(store.getSnapshot().data.bookmarks, ['a']); assert.equal(storage.getItem(guestCacheKey(guestId)), null); assert.equal(storage.getItem(LEGACY_STUDY_KEY), null);
});

test('a claimed guest archive is hidden even when storage prevents rotating its head', () => {
  const storage = new FakeStorage(); storage.put(LEGACY_STUDY_KEY, study(['a']));
  const store = make(storage); store.activate(null); const id = storage.read(GUEST_HEAD_KEY);
  storage.put(GUEST_CLAIMS_KEY, { [id]: 'A' }); storage.blocked = true;
  store.activate('A'); store.activate(null);
  assert.deepEqual(store.getSnapshot().data.bookmarks, []); assert.match(store.getSnapshot().storageIssue, /저장/);
  assert.ok(storage.getItem(guestCacheKey(id)), 'Claimed records remain recoverable');
});

test('guest edits check durable ownership before a delayed cross-tab Storage event arrives', async () => {
  const storage = new FakeStorage(); storage.put(LEGACY_STUDY_KEY, study(['a']));
  const store = make(storage); store.activate(null); const id = storage.read(GUEST_HEAD_KEY);
  storage.put(GUEST_CLAIMS_KEY, { [id]: 'A' }); storage.blockedKey = GUEST_HEAD_KEY;
  await store.setData(value => ({ ...value, bookmarks: [...value.bookmarks, 'b'] }));
  assert.deepEqual(store.getSnapshot().data.bookmarks, []);
  assert.deepEqual(storage.read(guestCacheKey(id)).envelope.local.study.bookmarks, ['a']);
});

test('queued guest plan settling rechecks a claim acquired while it waits for the lock', async () => {
  const storage = new FakeStorage(), gate = deferred<void>(); let hold = false;
  const lock = async (_name: string, work: () => void | Promise<void>) => { if (hold) await gate.promise; await work(); };
  const store = make(storage, null, () => true, lock); store.activate(null); const id = storage.read(GUEST_HEAD_KEY);
  hold = true; assert.equal(store.savePlan({ morning: '09:00', evening: '19:00', weekdaysOnly: false }), true);
  storage.put(GUEST_CLAIMS_KEY, { [id]: 'A' }); storage.blockedKey = GUEST_HEAD_KEY;
  gate.resolve(); await tick();
  assert.deepEqual(store.getSnapshot().plan, readCommutePlan(null));
  assert.deepEqual(storage.read(guestCacheKey(id)).envelope.local.settings, readCommutePlan(null));
});

test('guest import is refused on every retry until the ownership claim is durable', async () => {
  const storage = new FakeStorage(); storage.put(LEGACY_STUDY_KEY, study(['a'])); storage.blockedKey = GUEST_CLAIMS_KEY;
  const remote = new FakeRemote(), store = make(storage, remote); store.activate('A'); await until(() => store.getSnapshot().syncStatus === 'pending');
  await store.retrySync(); await store.retrySync();
  assert.equal(remote.requests.length, 0); assert.deepEqual(remote.state('A').state.bookmarks, []); assert.ok(storage.getItem(LEGACY_STUDY_KEY)); assert.match(store.getSnapshot().storageIssue, /저장/);
  assert.equal(store.getSnapshot().syncStatus, 'pending'); assert.match(store.getSnapshot().syncError, /옮기지 못/);
  storage.blockedKey = ''; await store.retrySync(); assert.deepEqual(remote.state('A').state.bookmarks, ['a']);
});

test('a failed memory claim cannot replace another account’s later durable claim', async () => {
  const storage = new FakeStorage(); storage.put(LEGACY_STUDY_KEY, study(['a'])); storage.blockedKey = GUEST_CLAIMS_KEY;
  const remote = new FakeRemote(), first = make(storage, remote); first.activate('A');
  await until(() => first.getSnapshot().syncStatus === 'pending'); const guest = storage.read(GUEST_HEAD_KEY);
  storage.blockedKey = ''; const gate = deferred<void>(); remote.pushGate = gate;
  const second = make(storage, remote); second.activate('B'); await until(() => remote.requests.length === 1);
  assert.equal(storage.read(GUEST_CLAIMS_KEY)[guest], 'B');
  await first.retrySync();
  assert.equal(storage.read(GUEST_CLAIMS_KEY)[guest], 'B');
  assert.deepEqual(first.getSnapshot().data.bookmarks, []); assert.equal(remote.requests.filter(request => request.ownerId === 'A').length, 0);
  assert.deepEqual(second.getSnapshot().data.bookmarks, ['a']);
  gate.resolve(); await until(() => second.getSnapshot().syncStatus === 'synced');
});

test('lost import responses recover idempotently after reload without re-adding removed bookmarks', async () => {
  const storage = new FakeStorage(); storage.put(LEGACY_STUDY_KEY, study(['a']));
  const remote = new FakeRemote(); remote.loseNextReply = true;
  const store = make(storage, remote); store.activate('A'); await until(() => store.getSnapshot().syncStatus === 'error'); store.stop();
  remote.state('A').state.bookmarks = []; remote.state('A').revision++;
  const reload = make(storage, remote); reload.activate('A'); await until(() => reload.getSnapshot().syncStatus === 'synced');
  assert.deepEqual(reload.getSnapshot().data.bookmarks, []); assert.deepEqual(remote.state('A').state.bookmarks, []);
  assert.ok(remote.requests[1].importId); assert.equal(remote.requests[1].importId, remote.requests[0].importId);
});

test('lost ordinary ACK retries its frozen mutation before GET and preserves newer local edits', async () => {
  const storage = new FakeStorage(), remote = new FakeRemote(), store = make(storage, remote);
  store.activate('A'); await until(() => store.getSnapshot().syncStatus === 'synced');
  remote.loseNextReply = true;
  await store.setData(value => ({ ...value, bookmarks: ['a'] })); await until(() => store.getSnapshot().syncStatus === 'error');
  const frozen = storage.read(accountCacheKey('A')).inFlight;
  assert.ok(frozen.mutationId); assert.equal(frozen.importId, null); store.stop();
  remote.state('A').state.bookmarks = []; remote.state('A').revision++;
  const gate = deferred<void>(); remote.pushGate = gate;
  const reload = make(storage, remote); reload.activate('A'); await until(() => remote.requests.length === 2);
  assert.deepEqual(remote.requests[1], frozen, 'The retry uses the exact persisted upload');
  await reload.setData(value => ({ ...value, bookmarks: [...value.bookmarks, 'b'] }));
  gate.resolve(); await until(() => reload.getSnapshot().syncStatus === 'synced');
  assert.deepEqual(reload.getSnapshot().data.bookmarks, ['b']); assert.deepEqual(remote.state('A').state.bookmarks, ['b']);
  assert.equal(remote.requests[0].mutationId, remote.requests[1].mutationId);
  assert.notEqual(remote.requests[2].mutationId, remote.requests[1].mutationId);
  assert.equal(storage.read(accountCacheKey('A')).inFlight, null);
});

test('a fresh upload waits until its frozen request can be persisted', async () => {
  const storage = new FakeStorage(), remote = new FakeRemote(), store = make(storage, remote);
  store.activate('A'); await until(() => store.getSnapshot().syncStatus === 'synced');
  storage.blockedKey = accountCacheKey('A');
  await store.setData(value => ({ ...value, bookmarks: ['a'] })); await until(() => store.getSnapshot().syncStatus === 'pending' && store.getSnapshot().syncError.length > 0);
  assert.equal(remote.requests.length, 0); assert.deepEqual(store.getSnapshot().data.bookmarks, ['a']);
  storage.blockedKey = ''; await store.retrySync();
  assert.deepEqual(remote.state('A').state.bookmarks, ['a']); assert.equal(store.getSnapshot().syncStatus, 'synced');
});

test('storage events merge another tab without discarding failed local writes', async () => {
  const storage = new FakeStorage(), first = make(storage, null, () => false), second = make(storage, null, () => false);
  first.activate('A'); second.activate('A');
  storage.blockedKey = accountCacheKey('A'); await first.setData(value => ({ ...value, bookmarks: ['a'] }));
  storage.blockedKey = ''; await second.setData(value => ({ ...value, bookmarks: ['b'] }));
  storage.blockedKey = accountCacheKey('A'); first.storageChanged(accountCacheKey('A')); await tick();
  assert.deepEqual(first.getSnapshot().data.bookmarks, ['a', 'b']); assert.equal(first.getSnapshot().syncStatus, 'pending');
  storage.blockedKey = ''; await first.setData(value => value);
  assert.deepEqual(storage.read(accountCacheKey('A')).envelope.local.study.bookmarks, ['a', 'b']);
});

test('failed-write event merge waits for the shared write lock and reads the newest cache inside it', async () => {
  const queues = new Map<string, Promise<void>>(), gate = deferred<void>(); let holdNext = false, waiting = false;
  const lock = async (name: string, work: () => void | Promise<void>) => {
    const previous = queues.get(name) ?? Promise.resolve();
    const next = previous.then(async () => { if (holdNext) { holdNext = false; waiting = true; await gate.promise; } await work(); });
    queues.set(name, next.catch(() => {})); await next;
  };
  const storage = new FakeStorage(), first = make(storage, null, () => false, lock), second = make(storage, null, () => false, lock);
  first.activate('A'); second.activate('A'); storage.blockedKey = accountCacheKey('A');
  await first.setData(value => ({ ...value, bookmarks: ['a'] })); storage.blockedKey = '';
  holdNext = true; const otherWrite = second.setData(value => ({ ...value, bookmarks: ['b'] })); await until(() => waiting);
  first.storageChanged(accountCacheKey('A')); assert.deepEqual(first.getSnapshot().data.bookmarks, ['a']);
  gate.resolve(); await otherWrite; await tick();
  assert.deepEqual(first.getSnapshot().data.bookmarks, ['a', 'b']);
  assert.deepEqual(storage.read(accountCacheKey('A')).envelope.local.study.bookmarks, ['a', 'b']);
});

test('an external empty cache cannot mark an unconfirmed or failed connection synced', async () => {
  const storage = new FakeStorage(), remote = new FakeRemote(), gate = deferred<RemoteReply>();
  remote.getGate = { owner: 'A', value: gate };
  const store = make(storage, remote); store.activate('A');
  const offline = make(storage, null, () => false); offline.activate('A'); await offline.setData(value => value);
  store.storageChanged(accountCacheKey('A')); assert.equal(store.getSnapshot().syncStatus, 'syncing');
  gate.reject(new Error('Offline')); await until(() => store.getSnapshot().syncStatus === 'error');
  store.storageChanged(accountCacheKey('A')); assert.notEqual(store.getSnapshot().syncStatus, 'synced');
});

test('plan save only returns true for durable intent and blocked study writes stay usable in memory', async () => {
  const storage = new FakeStorage(), store = make(storage); store.activate(null);
  assert.equal(storage.getItem(LEGACY_PLAN_KEY), null);
  storage.blocked = true;
  assert.equal(store.savePlan({ morning: '09:10', evening: '19:20', weekdaysOnly: false }), false);
  await tick(); assert.equal(store.getSnapshot().plan.morning, '09:10'); assert.match(store.getSnapshot().issue, /저장하지 못/);
  await store.setData(value => ({ ...value, bookmarks: ['a'] })); await store.setData(value => ({ ...value, bookmarks: [...value.bookmarks, 'b'] }));
  assert.deepEqual(store.getSnapshot().data.bookmarks, ['a', 'b']); assert.match(store.getSnapshot().storageIssue, /저장하지 못/);
});

test('durable plan intents are read before async settling and survive reload', async () => {
  const storage = new FakeStorage(), store = make(storage, null, () => false); store.activate('A');
  assert.equal(store.savePlan({ morning: '09:10', evening: '19:20', weekdaysOnly: false }), true);
  const reload = make(storage, null, () => false); reload.activate('A'); assert.equal(reload.getSnapshot().plan.morning, '09:10');
  await tick(); assert.equal(storage.read(accountCacheKey('A')).envelope.pending, true);
});

test('CAS conflict retries are bounded and preserve unsent local data', async () => {
  const storage = new FakeStorage(), remote = new FakeRemote(); remote.conflictAlways = true;
  const store = make(storage, remote); store.activate('A'); await until(() => store.getSnapshot().syncStatus === 'synced');
  await store.setData(value => ({ ...value, bookmarks: ['a'] })); await until(() => remote.requests.length === 3 && store.getSnapshot().syncStatus === 'pending');
  await tick(); assert.equal(remote.requests.length, 3); assert.deepEqual(store.getSnapshot().data.bookmarks, ['a']); assert.equal(storage.read(accountCacheKey('A')).envelope.pending, true);
});

test('device sessions are saved locally and excluded from uploads and remote session reads', async () => {
  const storage = new FakeStorage(), remote = new FakeRemote(), store = make(storage, remote); store.activate('A'); await until(() => store.getSnapshot().syncStatus === 'synced');
  const session = { ids: ['a'], index: 0, ratings: [], revealed: true, startedAt: 1000 };
  await store.setData(value => ({ ...value, bookmarks: ['a'], session })); await until(() => store.getSnapshot().syncStatus === 'synced');
  assert.deepEqual(store.getSnapshot().data.session, session); assert.equal(remote.requests[0].study.session, null); assert.equal(storage.read(accountCacheKey('A')).envelope.local.study.session, null);
});

test('browser-style locks merge independent edits from two tabs before writing', async () => {
  const queues = new Map<string, Promise<void>>();
  const lock = async (name: string, work: () => void | Promise<void>) => {
    const previous = queues.get(name) ?? Promise.resolve(); const next = previous.then(work); queues.set(name, next.catch(() => {})); await next;
  };
  const storage = new FakeStorage(), first = make(storage, null, () => false, lock), second = make(storage, null, () => false, lock);
  first.activate('A'); second.activate('A');
  await Promise.all([first.setData(value => ({ ...value, bookmarks: [...value.bookmarks, 'a'] })), second.setData(value => ({ ...value, bookmarks: [...value.bookmarks, 'b'] }))]);
  first.storageChanged(accountCacheKey('A')); assert.deepEqual(first.getSnapshot().data.bookmarks, ['a', 'b']);
});

test('auth loading freezes migration and masks the active data until identity resolves', () => {
  const storage = new FakeStorage(); storage.put(LEGACY_STUDY_KEY, study(['a']));
  const store = make(storage); store.activate(null, true); assert.equal(storage.getItem(GUEST_HEAD_KEY), null); assert.equal(store.getSnapshot().syncStatus, 'loading'); assert.deepEqual(store.getSnapshot().data.bookmarks, []);
  store.activate(null, false); assert.deepEqual(store.getSnapshot().data.bookmarks, ['a']);
});
