import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildQueue,
  canResumeSession,
  dayKey,
  emptyState,
  readState,
  scheduleReview,
  type CardProgress,
} from './study.ts';

const DAY_MS = 86_400_000;
const NOW = Date.UTC(2026, 9, 5, 1);
const card: CardProgress = {
  dueAt: NOW,
  interval: 3,
  reviews: 1,
  lastRating: 'good',
  lastReviewedAt: NOW - 3 * DAY_MS,
};

test('empty states do not share mutable arrays or records', () => {
  const first = emptyState();
  first.bookmarks.push('a');
  first.progress.a = card;
  assert.deepEqual(emptyState(), {
    version: 1, progress: {}, bookmarks: [], history: [], session: null,
  });
});

test('invalid roots and unsupported versions return fresh empty states', () => {
  for (const value of [null, undefined, [], 'broken', 12, {}, { version: 2 }]) {
    assert.deepEqual(readState(value, ['a']), emptyState());
  }
});

test('a whole-catalog review survives reload and resumes outside the selected difficulty', () => {
  const review = { ids: ['basic-a', 'basic-b'], index: 1, revealed: true, ratings: ['good'], startedAt: NOW, kind: 'review' };
  const restored = readState({ version: 1, session: review }, ['basic-a', 'basic-b', 'practical-a']);
  assert.deepEqual(restored.session, review);
  assert.equal(canResumeSession(restored.session, new Set(['practical-a'])), true);
  assert.equal(canResumeSession({ ...restored.session!, kind: undefined }, new Set(['practical-a'])), false);
  assert.equal(canResumeSession({ ...restored.session!, index: 2 }, new Set(['practical-a'])), false);
  assert.equal(canResumeSession(null, new Set()), false);
  assert.equal(readState({ version: 1, session: { ...review, kind: 'unsupported' } }, ['basic-a', 'basic-b']).session?.kind, undefined);
});

test('recover valid fields while stripping unknown IDs and unknown fields', () => {
  const state = readState({
    version: 1,
    extra: 'ignored',
    progress: {
      a: { ...card, extra: true },
      b: { ...card, dueAt: Number.NaN },
      removed: card,
    },
    bookmarks: ['a', 'removed', 'a', false, 'b'],
    history: [
      { id: 'a', rating: 'good', at: NOW, extra: 'ignored' },
      { id: 'removed', rating: 'good', at: NOW },
      { id: 'b', rating: 'wrong', at: NOW },
      { id: 'b', rating: 'hard', at: Number.POSITIVE_INFINITY },
      null,
    ],
    session: null,
  }, ['a', 'b']);

  assert.deepEqual(state, {
    version: 1,
    progress: { a: card },
    bookmarks: ['a', 'b'],
    history: [{ id: 'a', rating: 'good', at: NOW }],
    session: null,
  });
});

test('invalid numeric fields and ratings are rejected per progress entry', () => {
  const invalid = [
    { dueAt: -1 },
    { dueAt: '100' },
    { dueAt: 8_640_000_000_000_001 },
    { interval: 0 },
    { interval: 1.5 },
    { reviews: -1 },
    { reviews: Number.POSITIVE_INFINITY },
    { lastReviewedAt: Number.NaN },
    { lastReviewedAt: NOW + 0.5 },
    { lastRating: 'unknown' },
  ];
  for (const fields of invalid) {
    assert.deepEqual(readState({ version: 1, progress: { a: { ...card, ...fields }, b: card } }, ['a', 'b']).progress, { b: card });
  }
});

test('valid session is recovered as independent data and strips unknown fields', () => {
  const session = {
    ids: ['a', 'b'], index: 1, revealed: true, ratings: ['good'], startedAt: NOW,
  };
  const state = readState({ version: 1, session: { ...session, extra: true } }, ['a', 'b']);
  assert.deepEqual(state.session, session);
  session.ids[0] = 'changed';
  session.ratings[0] = 'hard';
  assert.equal(state.session?.ids[0], 'a');
  assert.deepEqual(state.session?.ratings, ['good']);
});

test('inconsistent sessions are discarded without losing valid independent progress', () => {
  const session = {
    ids: ['a', 'b'], index: 1, revealed: false, ratings: ['good'], startedAt: NOW,
  };
  const invalid = [
    { ids: [] },
    { ids: ['a', 'removed'] },
    { ids: ['a', 'a'] },
    { index: -1 },
    { index: 1.5 },
    { index: 3 },
    { ratings: [] },
    { ratings: ['wrong'] },
    { revealed: 'true' },
    { startedAt: Number.NaN },
    { index: 2, ratings: ['good', 'hard'], revealed: true },
  ];
  for (const fields of invalid) {
    const state = readState({ version: 1, progress: { a: card }, session: { ...session, ...fields } }, ['a', 'b']);
    assert.equal(state.session, null);
    assert.deepEqual(state.progress, { a: card });
  }
  assert.notEqual(readState({ version: 1, session: { ...session, index: 2, ratings: ['good', 'hard'] } }, ['a', 'b']).session, null);
});

test('good reviews advance 3, 7, 14, 30 days and remain at 30', () => {
  let progress: CardProgress | undefined;
  for (const [index, days] of [3, 7, 14, 30, 30].entries()) {
    progress = scheduleReview(progress, 'good', NOW);
    assert.deepEqual(progress, {
      dueAt: NOW + days * DAY_MS,
      interval: days,
      reviews: index + 1,
      lastRating: 'good',
      lastReviewedAt: NOW,
    });
  }
});

test('hard and again reset spacing to tomorrow, preserving review count', () => {
  for (const rating of ['again', 'hard'] as const) {
    const previous = { ...card, interval: 30, reviews: 9 };
    const result = scheduleReview(previous, rating, NOW);
    assert.equal(result.interval, 1);
    assert.equal(result.dueAt, NOW + DAY_MS);
    assert.equal(result.reviews, 10);
    assert.equal(result.lastRating, rating);
    assert.equal(scheduleReview(result, 'good', NOW).interval, 3);
    assert.equal(previous.interval, 30);
  }
});

test('queue prioritizes earliest due reviews, then unseen cards, and excludes future reviews', () => {
  const progress = {
    recentlyDue: { ...card, dueAt: NOW },
    oldest: { ...card, dueAt: NOW - 7 * DAY_MS },
    alsoOldest: { ...card, dueAt: NOW - 7 * DAY_MS },
    tomorrow: { ...card, dueAt: NOW + DAY_MS },
  };
  const ids = ['new1', 'recentlyDue', 'oldest', 'tomorrow', 'new2', 'alsoOldest', 'new3'];
  assert.deepEqual(buildQueue(ids, progress, NOW), ['oldest', 'alsoOldest', 'recentlyDue', 'new1', 'new2']);
  assert.deepEqual(buildQueue(ids, progress, NOW, 2), ['oldest', 'alsoOldest']);
  assert.deepEqual(buildQueue(['tomorrow'], progress, NOW), []);
});

test('queue avoids duplicate IDs and handles empty or invalid limits', () => {
  assert.deepEqual(buildQueue(['a', 'a', 'b'], {}, NOW), ['a', 'b']);
  assert.deepEqual(buildQueue([], {}, NOW), []);
  for (const limit of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.deepEqual(buildQueue(['a'], {}, NOW, limit), []);
  }
});

test('prototype-named IDs are treated as ordinary data', () => {
  const state = readState(JSON.parse(JSON.stringify({
    version: 1, progress: Object.fromEntries([['__proto__', card]]), bookmarks: ['__proto__'],
  })), ['__proto__', 'constructor']);
  assert.deepEqual(state.progress.__proto__, card);
  assert.equal(Object.getPrototypeOf(state.progress), Object.prototype);
  assert.deepEqual(buildQueue(['constructor', '__proto__'], state.progress, NOW), ['__proto__', 'constructor']);
});

test('day keys use Seoul midnight regardless of the device timezone', () => {
  assert.equal(dayKey(Date.UTC(2026, 9, 4, 14, 59, 59)), '2026-10-04');
  assert.equal(dayKey(Date.UTC(2026, 9, 4, 15, 0, 0)), '2026-10-05');
  assert.equal(dayKey(Date.UTC(2026, 11, 31, 15, 0, 0)), '2027-01-01');
});
