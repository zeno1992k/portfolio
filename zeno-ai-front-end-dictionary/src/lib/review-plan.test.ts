import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildNextReview,
  buildReviewWeek,
  DEFAULT_COMMUTE_PLAN,
  getNextCommute,
  readCommutePlan,
} from './review-plan.ts';
import type { CardProgress } from './study';

const DAY_MS = 86_400_000;
const at = (iso: string) => Date.parse(iso);
const progressAt = (dueAt: number): CardProgress => ({
  dueAt, interval: 3, reviews: 1, lastRating: 'good', lastReviewedAt: dueAt - 3 * DAY_MS,
});

test('commute plan recovers valid fields and strips unknown fields', () => {
  assert.deepEqual(readCommutePlan({
    morning: '06:45', evening: '22:15', weekdaysOnly: false, extra: true,
  }), { morning: '06:45', evening: '22:15', weekdaysOnly: false });
  assert.deepEqual(readCommutePlan({
    morning: '8:30', evening: '20:00', weekdaysOnly: 'false',
  }), { morning: '08:30', evening: '20:00', weekdaysOnly: true });
});

test('invalid roots and times recover the defaults without sharing mutable data', () => {
  for (const value of [undefined, null, [], 'bad json', 42]) {
    assert.deepEqual(readCommutePlan(value), DEFAULT_COMMUTE_PLAN);
  }
  for (const time of ['', '24:00', '23:60', '-1:30', '08:30:00', ' 08:30', '08:30\n', 830]) {
    assert.equal(readCommutePlan({ morning: time }).morning, '08:30');
  }
  assert.equal(readCommutePlan({ morning: '00:00' }).morning, '00:00');
  assert.equal(readCommutePlan({ evening: '23:59' }).evening, '23:59');
  const plan = readCommutePlan(null);
  plan.morning = '10:00';
  assert.equal(readCommutePlan(null).morning, '08:30');
});

test('review week uses Seoul midnight across a month boundary', () => {
  const now = at('2026-10-31T23:59:59+09:00');
  const days = buildReviewWeek({}, now);
  assert.deepEqual(days.map((day) => day.date), [
    '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03',
    '2026-11-04', '2026-11-05', '2026-11-06',
  ]);
  assert.equal(days[0].timestamp, at('2026-10-31T00:00:00+09:00'));
  assert.equal(buildReviewWeek({}, now + 1000)[0].date, '2026-11-01');
});

test('overdue reviews count once today while future dates stay in their own day', () => {
  const now = at('2026-10-05T12:00:00+09:00');
  const progress = {
    old: progressAt(at('2026-09-01T09:00:00+09:00')),
    yesterday: progressAt(at('2026-10-04T23:59:59+09:00')),
    now: progressAt(now),
    tonight: progressAt(at('2026-10-05T23:59:59+09:00')),
    tomorrow: progressAt(at('2026-10-06T00:00:00+09:00')),
    lastDay: progressAt(at('2026-10-11T23:59:59+09:00')),
    nextWeek: progressAt(at('2026-10-12T00:00:00+09:00')),
  };
  const week = buildReviewWeek(progress, now);
  assert.deepEqual(week.map((day) => day.count), [4, 1, 0, 0, 0, 0, 1]);
  assert.equal(week.reduce((count, day) => count + day.count, 0), 6);
  assert.equal(progress.old.dueAt, at('2026-09-01T09:00:00+09:00'));
});

test('next review reports all already-due cards with their earliest actual due time', () => {
  const now = at('2026-10-05T12:00:00+09:00');
  const earliest = at('2026-10-01T08:30:00+09:00');
  assert.deepEqual(buildNextReview({
    old: progressAt(earliest), now: progressAt(now),
    later: progressAt(at('2026-10-05T18:30:00+09:00')),
  }, now), { timestamp: earliest, count: 2, isDue: true });
});

test('next future review counts its Seoul date rather than matching only exact timestamps', () => {
  const now = at('2026-10-05T12:00:00+09:00');
  const first = at('2026-10-06T00:00:00+09:00');
  assert.deepEqual(buildNextReview({
    midnight: progressAt(first), evening: progressAt(at('2026-10-06T18:30:00+09:00')),
    later: progressAt(at('2026-10-07T08:30:00+09:00')),
  }, now), { timestamp: first, count: 2, isDue: false });
  assert.equal(buildNextReview({}, now), null);
});

test('commute slot includes the current minute even after seconds have elapsed', () => {
  const expected = at('2026-10-05T08:30:00+09:00');
  assert.equal(getNextCommute(DEFAULT_COMMUTE_PLAN, expected), expected);
  assert.equal(getNextCommute(DEFAULT_COMMUTE_PLAN, expected + 59_999), expected);
  assert.equal(getNextCommute(DEFAULT_COMMUTE_PLAN, expected + 60_000), at('2026-10-05T18:30:00+09:00'));
});

test('weekday plan skips Saturday and Sunday after Friday evening', () => {
  const nextMonday = at('2026-10-05T08:30:00+09:00');
  for (const now of [
    '2026-10-02T18:31:00+09:00',
    '2026-10-03T08:00:00+09:00',
    '2026-10-04T22:00:00+09:00',
  ]) {
    assert.equal(getNextCommute(DEFAULT_COMMUTE_PLAN, at(now)), nextMonday);
  }
  assert.equal(getNextCommute({ ...DEFAULT_COMMUTE_PLAN, weekdaysOnly: false }, at('2026-10-03T08:00:00+09:00')), at('2026-10-03T08:30:00+09:00'));
});

test('duplicate slots act as one daily time and chronological order does not depend on labels', () => {
  const duplicate = { morning: '08:30', evening: '08:30', weekdaysOnly: false };
  assert.equal(getNextCommute(duplicate, at('2026-10-05T08:31:00+09:00')), at('2026-10-06T08:30:00+09:00'));
  const swapped = { morning: '20:00', evening: '07:00', weekdaysOnly: false };
  assert.equal(getNextCommute(swapped, at('2026-10-05T06:00:00+09:00')), at('2026-10-05T07:00:00+09:00'));
});

test('commute midnight and year boundaries follow Seoul dates independently of host timezone', () => {
  const plan = { morning: '00:00', evening: '23:59', weekdaysOnly: false };
  assert.equal(getNextCommute(plan, at('2026-12-31T15:00:32Z')), at('2027-01-01T00:00:00+09:00'));
  assert.equal(getNextCommute(plan, at('2026-12-31T23:59:59+09:00')), at('2026-12-31T23:59:00+09:00'));
  assert.equal(getNextCommute({ ...plan, morning: '08:30' }, at('2027-01-01T00:00:00+09:00')), at('2027-01-01T08:30:00+09:00'));
});
