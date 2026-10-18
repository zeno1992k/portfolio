import type { CardProgress } from './study';

export interface CommutePlan {
  morning: string;
  evening: string;
  weekdaysOnly: boolean;
}

export interface ReviewDay {
  date: string;
  timestamp: number;
  count: number;
}

export interface NextReview {
  timestamp: number;
  count: number;
  isDue: boolean;
}

export const DEFAULT_COMMUTE_PLAN: Readonly<CommutePlan> = Object.freeze({
  morning: '08:30',
  evening: '18:30',
  weekdaysOnly: true,
});

const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;
const SEOUL_OFFSET_MS = 9 * 60 * MINUTE_MS;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_PATTERN.test(value);
}

/** Invalid fields fall back independently; storage never supplies extra properties. */
export function readCommutePlan(value: unknown): CommutePlan {
  if (!isRecord(value)) return { ...DEFAULT_COMMUTE_PLAN };
  return {
    morning: isTime(value.morning) ? value.morning : DEFAULT_COMMUTE_PLAN.morning,
    evening: isTime(value.evening) ? value.evening : DEFAULT_COMMUTE_PLAN.evening,
    weekdaysOnly: typeof value.weekdaysOnly === 'boolean'
      ? value.weekdaysOnly
      : DEFAULT_COMMUTE_PLAN.weekdaysOnly,
  };
}

function seoulMidnight(timestamp: number): number {
  return Math.floor((timestamp + SEOUL_OFFSET_MS) / DAY_MS) * DAY_MS - SEOUL_OFFSET_MS;
}

function seoulDate(timestamp: number): string {
  return new Date(timestamp + SEOUL_OFFSET_MS).toISOString().slice(0, 10);
}

function dueTimes(progress: Record<string, CardProgress>): number[] {
  return Object.values(progress)
    .map((entry) => entry.dueAt)
    .filter((timestamp) => Number.isFinite(timestamp));
}

/** Seven Seoul dates, including today. Older unfinished reviews count only today. */
export function buildReviewWeek(
  progress: Record<string, CardProgress>,
  now: number,
): ReviewDay[] {
  const start = seoulMidnight(now);
  const days = Array.from({ length: 7 }, (_, index) => {
    const timestamp = start + index * DAY_MS;
    return { date: seoulDate(timestamp), timestamp, count: 0 };
  });

  for (const dueAt of dueTimes(progress)) {
    const index = Math.max(0, Math.floor((dueAt - start) / DAY_MS));
    if (index < days.length) days[index].count += 1;
  }
  return days;
}

/** Past-due timestamps stay actual timestamps; isDue lets the UI label them "지금". */
export function buildNextReview(
  progress: Record<string, CardProgress>,
  now: number,
): NextReview | null {
  const timestamps = dueTimes(progress);
  if (timestamps.length === 0) return null;

  const earliest = timestamps.reduce((minimum, timestamp) => Math.min(minimum, timestamp));
  const isDue = earliest <= now;
  const earliestDay = seoulMidnight(earliest);
  const count = timestamps.filter((timestamp) => isDue
    ? timestamp <= now
    : seoulMidnight(timestamp) === earliestDay).length;
  return { timestamp: earliest, count, isDue };
}

function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** A suggested study slot, with minute precision; this does not schedule notifications. */
export function getNextCommute(plan: CommutePlan, now: number): number {
  const safePlan = readCommutePlan(plan);
  const currentMinute = Math.floor(now / MINUTE_MS) * MINUTE_MS;
  const today = seoulMidnight(now);
  const slots = [...new Set([
    minutesOfDay(safePlan.morning),
    minutesOfDay(safePlan.evening),
  ])].sort((a, b) => a - b);

  // Seven subsequent days cover the next occurrence even for Friday evening.
  for (let offset = 0; offset <= 7; offset += 1) {
    const date = today + offset * DAY_MS;
    const weekday = new Date(date + SEOUL_OFFSET_MS).getUTCDay();
    if (safePlan.weekdaysOnly && (weekday === 0 || weekday === 6)) continue;

    for (const minute of slots) {
      const candidate = date + minute * MINUTE_MS;
      if (candidate >= currentMinute) return candidate;
    }
  }

  // With two valid daily slots and the seven-day search this cannot be reached.
  throw new RangeError('No valid commute time was found.');
}
