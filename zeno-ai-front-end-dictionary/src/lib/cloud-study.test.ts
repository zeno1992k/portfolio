import assert from 'node:assert/strict';
import test from 'node:test';
import {
  acknowledgeSync,
  claimGuestImport,
  createSyncEnvelope,
  importGuestSnapshot,
  mergeCommutePlans,
  mergeStudySnapshots,
  prepareSync,
  readCloudSnapshot,
  readSyncEnvelope,
  rebaseSyncEnvelope,
  updateLocalSnapshot,
} from './cloud-study.ts';
import { DEFAULT_COMMUTE_PLAN } from './review-plan.ts';
import { emptyState, scheduleReview, type PersistedState } from './study.ts';

const IDS = ['closure', 'promise', 'component'];
const GUEST_ID = 'ac010101-0202-4303-8404-050505050505';
const NEXT_GUEST_ID = 'ac010101-0202-4303-8404-050505050506';
const PLAN = { ...DEFAULT_COMMUTE_PLAN };

function state(bookmarks: string[] = []): PersistedState {
  return { ...emptyState(), bookmarks };
}

function reviewed(id: string, at: number, previous?: PersistedState): PersistedState {
  const study = previous ? structuredClone(previous) : state();
  study.progress[id] = scheduleReview(study.progress[id], 'good', at);
  study.history.push({ id, at, rating: 'good' });
  return study;
}

test('three-way bookmarks preserve removals plus independent additions on both devices', () => {
  const base = state(['closure', 'promise']);
  const local = state(['promise', 'component']);
  const remote = state(['closure', 'component']);
  assert.deepEqual(mergeStudySnapshots(base, local, remote, IDS).bookmarks, ['component']);
});

test('unchanged local state accepts a remote bookmark deletion', () => {
  const base = state(['closure']);
  assert.deepEqual(mergeStudySnapshots(base, base, state(), IDS).bookmarks, []);
});

test('different cards studied concurrently survive and repeated events are deduplicated', () => {
  const base = reviewed('component', 10);
  const local = reviewed('closure', 20, base);
  const remote = reviewed('promise', 30, base);
  const merged = mergeStudySnapshots(base, local, remote, IDS);
  assert.deepEqual(Object.keys(merged.progress), ['closure', 'component', 'promise']);
  assert.equal(merged.history.length, 3);
  assert.equal(merged.progress.component.reviews, 1);
});

test('concurrent reviews of the same card use the latest complete progress, never a sum', () => {
  const base = reviewed('closure', 10);
  const local = reviewed('closure', 20, base);
  const remote = reviewed('closure', 30, base);
  const merged = mergeStudySnapshots(base, local, remote, IDS);
  assert.deepEqual(merged.progress.closure, remote.progress.closure);
  assert.equal(merged.progress.closure.reviews, 2);
  assert.equal(merged.history.length, 3);
});

test('equal-time conflicts and event ordering are deterministic when device sides swap', () => {
  const local = reviewed('closure', 20);
  const remote = reviewed('closure', 20);
  remote.progress.closure = scheduleReview(remote.progress.closure, 'hard', 20);
  remote.history.push({ id: 'closure', at: 20, rating: 'hard' });
  assert.deepEqual(mergeStudySnapshots(state(), local, remote, IDS), mergeStudySnapshots(state(), remote, local, IDS));
});

test('bounded append-only history does not resurrect discarded baseline events', () => {
  const base = state();
  for (let at = 0; at < 1000; at++) base.history.push({ id: 'closure', at, rating: 'good' });
  const local = structuredClone(base);
  local.history = [...local.history.slice(1), { id: 'promise', at: 1000, rating: 'hard' }];
  const merged = mergeStudySnapshots(base, local, base, IDS);
  assert.equal(merged.history.length, 1000);
  assert.equal(merged.history[0].at, 1);
  assert.equal(merged.history.at(-1)?.at, 1000);
  assert.equal(base.history[0].at, 0);
});

test('settings merge independent field changes and keep local intent on same-field conflicts', () => {
  assert.deepEqual(mergeCommutePlans(PLAN, { ...PLAN, morning: '07:40' }, { ...PLAN, evening: '19:20', weekdaysOnly: false }), {
    morning: '07:40', evening: '19:20', weekdaysOnly: false,
  });
  assert.equal(mergeCommutePlans(PLAN, { ...PLAN, morning: '07:40' }, { ...PLAN, morning: '09:00' }).morning, '07:40');
});

test('malformed remote fields are independently recovered using the existing readers', () => {
  const good = reviewed('closure', 20);
  const cloud = readCloudSnapshot({
    ...good,
    progress: { ...good.progress, promise: { ...good.progress.closure, reviews: -1 }, removed: good.progress.closure },
    bookmarks: ['closure', 'removed', 'closure'],
    history: [...good.history, { id: 'promise', at: Number.NaN, rating: 'good' }],
    session: { ids: ['closure'], index: 0, revealed: false, ratings: [], startedAt: 10 },
  }, { morning: '99:00', evening: '20:10', weekdaysOnly: 'yes', timeZone: 'ignored' }, IDS);
  assert.deepEqual(Object.keys(cloud.study.progress), ['closure']);
  assert.deepEqual(cloud.study.bookmarks, ['closure']);
  assert.equal(cloud.study.history.length, 1);
  assert.equal(cloud.study.session, null);
  assert.deepEqual(cloud.settings, { morning: '08:30', evening: '20:10', weekdaysOnly: true });
});

test('pending state is computed from snapshots and session-only changes do not upload', () => {
  let envelope = createSyncEnvelope('account-a', IDS);
  const local = state();
  local.session = { ids: ['closure'], index: 0, revealed: true, ratings: [], startedAt: 10 };
  envelope = updateLocalSnapshot(envelope, local, PLAN, IDS);
  assert.equal(envelope.pending, false);
  assert.equal(prepareSync(envelope), null);
  const saved = readSyncEnvelope({ ...envelope, pending: true }, 'account-a', IDS);
  assert.equal(saved.local.study.session?.revealed, true);
  assert.equal(saved.pending, false);
});

test('a captured request strips the device session and cannot change when local state changes', () => {
  const local = state(['closure']);
  local.session = { ids: ['closure'], index: 0, revealed: true, ratings: [], startedAt: 10 };
  const envelope = createSyncEnvelope('account-a', IDS, local, PLAN);
  const request = prepareSync(envelope)!;
  assert.equal(request.study.session, null);
  envelope.local.study.bookmarks.push('promise');
  assert.deepEqual(request.study.bookmarks, ['closure']);
});

test('CAS conflict rebase preserves both devices and retry acknowledgement clears pending', () => {
  let envelope = createSyncEnvelope('account-a', IDS, reviewed('closure', 20), PLAN);
  const firstRequest = prepareSync(envelope)!;
  assert.equal(firstRequest.expectedRevision, 0);
  const remote = reviewed('promise', 30);
  envelope = rebaseSyncEnvelope(envelope, 1, remote, PLAN, IDS);
  const retry = prepareSync(envelope)!;
  assert.equal(retry.expectedRevision, 1);
  assert.deepEqual(Object.keys(retry.study.progress), ['closure', 'promise']);
  envelope = acknowledgeSync(envelope, retry, 2, retry.study, retry.settings, IDS);
  assert.equal(envelope.remoteRevision, 2);
  assert.equal(envelope.pending, false);
  assert.equal(prepareSync(envelope), null);
});

test('edits made during an upload remain pending while its exact baseline is acknowledged', () => {
  let envelope = createSyncEnvelope('account-a', IDS, reviewed('closure', 20), PLAN);
  const request = prepareSync(envelope)!;
  const next = reviewed('promise', 30, envelope.local.study);
  next.bookmarks.push('promise');
  next.session = { ids: ['promise'], index: 0, revealed: true, ratings: [], startedAt: 25 };
  envelope = updateLocalSnapshot(envelope, next, { ...PLAN, evening: '20:00' }, IDS);
  envelope = acknowledgeSync(envelope, request, 1, request.study, request.settings, IDS);
  assert.equal(envelope.pending, true);
  assert.deepEqual(Object.keys(envelope.base.study.progress), ['closure']);
  assert.deepEqual(Object.keys(envelope.local.study.progress), ['closure', 'promise']);
  assert.deepEqual(envelope.local.study.bookmarks, ['promise']);
  assert.equal(envelope.local.study.session?.revealed, true);
  assert.equal(envelope.local.settings.evening, '20:00');
});

test('account switches isolate caches and ignore delayed acknowledgements for the previous user', () => {
  const accountA = createSyncEnvelope('account-a', IDS, reviewed('closure', 20), PLAN);
  const requestA = prepareSync(accountA)!;
  const accountB = readSyncEnvelope(accountA, 'account-b', IDS);
  assert.deepEqual(accountB.local.study, emptyState());
  assert.equal(acknowledgeSync(accountB, requestA, 1, requestA.study, requestA.settings, IDS), accountB);
});

test('responses older than the local remote revision cannot roll the account backward', () => {
  const initial = createSyncEnvelope('account-a', IDS, reviewed('closure', 20), PLAN);
  const oldRequest = prepareSync(initial)!;
  const latest = rebaseSyncEnvelope(initial, 5, reviewed('promise', 30), PLAN, IDS);
  assert.equal(rebaseSyncEnvelope(latest, 4, state(), PLAN, IDS), latest);
  assert.equal(acknowledgeSync(latest, oldRequest, 1, oldRequest.study, PLAN, IDS), latest);
});

test('first guest snapshot is claimed for account A, cannot be claimed again for account B', () => {
  const first = claimGuestImport(null, GUEST_ID, 'account-a');
  assert.equal(first.allowed, true);
  assert.equal(first.newClaim, true);
  const retry = claimGuestImport(first.claim, GUEST_ID, 'account-a');
  assert.equal(retry.allowed, true);
  assert.equal(retry.newClaim, false);
  const otherAccount = claimGuestImport(first.claim, GUEST_ID, 'account-b');
  assert.equal(otherAccount.allowed, false);
  assert.equal(otherAccount.claim.ownerId, 'account-a');
});

test('guest import is applied once before and after acknowledgement, including after reload', () => {
  const guest = reviewed('closure', 20);
  guest.bookmarks.push('closure');
  guest.session = { ids: ['closure'], index: 0, revealed: true, ratings: [], startedAt: 10 };
  let envelope = importGuestSnapshot(createSyncEnvelope('account-a', IDS), GUEST_ID, guest, { ...PLAN, morning: '07:20' }, IDS);
  assert.equal(envelope.guestImportId, GUEST_ID);
  assert.equal(envelope.local.study.session?.revealed, true);
  assert.equal(envelope.local.settings.morning, '07:20');
  assert.equal(importGuestSnapshot(envelope, GUEST_ID, guest, PLAN, IDS), envelope);
  const request = prepareSync(envelope)!;
  envelope = acknowledgeSync(envelope, request, 1, request.study, request.settings, IDS);
  envelope = readSyncEnvelope(JSON.parse(JSON.stringify(envelope)), 'account-a', IDS);
  assert.equal(envelope.guestImportId, null);
  assert.equal(envelope.pending, false);
  assert.equal(importGuestSnapshot(envelope, GUEST_ID, guest, PLAN, IDS), envelope);
  assert.deepEqual(envelope.importedGuestIds, [GUEST_ID]);
});

test('existing account settings win when guest learning data is imported', () => {
  const remotePlan = { ...PLAN, morning: '09:00' };
  let envelope = rebaseSyncEnvelope(createSyncEnvelope('account-a', IDS), 7, state(['promise']), remotePlan, IDS);
  envelope = importGuestSnapshot(envelope, GUEST_ID, state(['closure']), { ...PLAN, morning: '06:00' }, IDS);
  assert.deepEqual(envelope.local.study.bookmarks, ['closure', 'promise']);
  assert.equal(envelope.local.settings.morning, '09:00');
});

test('replayed import acknowledgement accepts canonical deletions instead of resurrecting guest bookmarks', () => {
  const guest = state(['closure']);
  let envelope = importGuestSnapshot(createSyncEnvelope('account-a', IDS), GUEST_ID, guest, PLAN, IDS);
  const request = prepareSync(envelope)!;
  // Server has already imported this UUID, and another device later removed it.
  envelope = acknowledgeSync(envelope, request, 4, state(), PLAN, IDS);
  assert.deepEqual(envelope.local.study.bookmarks, []);
  assert.equal(envelope.pending, false);
  assert.equal(envelope.guestImportId, null);
});

test('a different import must wait until the current UUID has been acknowledged', () => {
  const envelope = importGuestSnapshot(createSyncEnvelope('account-a', IDS), GUEST_ID, state(), PLAN, IDS);
  assert.throws(() => importGuestSnapshot(envelope, NEXT_GUEST_ID, state(), PLAN, IDS), /pending guest import/);
});

test('recover a tampered pending flag and keep the exact truncated upload baseline', () => {
  const envelope = createSyncEnvelope('account-a', IDS, state(['closure']), PLAN);
  const recovered = readSyncEnvelope({ ...envelope, pending: false }, 'account-a', IDS);
  assert.equal(recovered.pending, true);
  assert.deepEqual(recovered.base.study, emptyState());
  assert.deepEqual(recovered.local.study.bookmarks, ['closure']);
});
