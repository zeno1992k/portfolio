export type Rating = 'again' | 'hard' | 'good';

export interface CardProgress {
  dueAt: number;
  interval: number;
  reviews: number;
  lastRating: Rating;
  lastReviewedAt: number;
}

export interface StudySession {
  ids: string[];
  index: number;
  revealed: boolean;
  ratings: Rating[];
  startedAt: number;
  kind?: 'review';
}

export interface PersistedState {
  version: 1;
  progress: Record<string, CardProgress>;
  bookmarks: string[];
  history: { id: string; rating: Rating; at: number }[];
  session: StudySession | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_TIMESTAMP = 8_640_000_000_000_000;
const GOOD_INTERVALS = [3, 7, 14, 30] as const;
const seoulDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRating(value: unknown): value is Rating {
  return value === 'again' || value === 'hard' || value === 'good';
}

function isTimestamp(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= MAX_TIMESTAMP
  );
}

function isInteger(value: unknown, minimum: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum;
}

function readProgress(value: unknown): CardProgress | null {
  if (
    !isRecord(value) ||
    !isTimestamp(value.dueAt) ||
    !isInteger(value.interval, 1) ||
    !isInteger(value.reviews, 0) ||
    !isRating(value.lastRating) ||
    !isTimestamp(value.lastReviewedAt)
  ) {
    return null;
  }

  return {
    dueAt: value.dueAt,
    interval: value.interval,
    reviews: value.reviews,
    lastRating: value.lastRating,
    lastReviewedAt: value.lastReviewedAt,
  };
}

function readSession(value: unknown, validIds: Set<string>): StudySession | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.ids) ||
    value.ids.length === 0 ||
    ![...value.ids].every((id) => typeof id === 'string' && validIds.has(id)) ||
    new Set(value.ids).size !== value.ids.length ||
    !isInteger(value.index, 0) ||
    value.index > value.ids.length ||
    typeof value.revealed !== 'boolean' ||
    (value.index === value.ids.length && value.revealed) ||
    !Array.isArray(value.ratings) ||
    value.ratings.length !== value.index ||
    ![...value.ratings].every(isRating) ||
    !isTimestamp(value.startedAt)
  ) {
    return null;
  }

  return {
    ids: [...value.ids] as string[],
    index: value.index,
    revealed: value.revealed,
    ratings: [...value.ratings] as Rating[],
    startedAt: value.startedAt,
    ...(value.kind === 'review' ? { kind: 'review' as const } : {}),
  };
}

/** Explicit whole-catalog reviews remain resumable outside the daily learning scope. */
export function canResumeSession(session: StudySession | null, selectedIds: ReadonlySet<string>): boolean {
  return !!session && session.index < session.ids.length && (session.kind === 'review' || session.ids.every(id => selectedIds.has(id)));
}

export function emptyState(): PersistedState {
  return { version: 1, progress: {}, bookmarks: [], history: [], session: null };
}

/** Recover valid entries independently, without trusting data from storage. */
export function readState(value: unknown, validIds: string[]): PersistedState {
  const state = emptyState();
  if (!isRecord(value) || value.version !== 1) return state;

  const valid = new Set(validIds);
  if (isRecord(value.progress)) {
    const entries: [string, CardProgress][] = [];
    for (const [id, raw] of Object.entries(value.progress)) {
      if (!valid.has(id)) continue;
      const progress = readProgress(raw);
      if (progress) entries.push([id, progress]);
    }
    state.progress = Object.fromEntries(entries);
  }

  if (Array.isArray(value.bookmarks)) {
    state.bookmarks = [
      ...new Set(value.bookmarks.filter((id): id is string => typeof id === 'string' && valid.has(id))),
    ];
  }

  if (Array.isArray(value.history)) {
    for (const entry of value.history) {
      if (
        isRecord(entry) &&
        typeof entry.id === 'string' &&
        valid.has(entry.id) &&
        isRating(entry.rating) &&
        isTimestamp(entry.at)
      ) {
        state.history.push({ id: entry.id, rating: entry.rating, at: entry.at });
      }
    }
  }

  // Dropping invalid session IDs could move the saved study position to a new card.
  // Discard an inconsistent session while preserving its independent review data.
  state.session = readSession(value.session, valid);
  return state;
}

/** Intervals use elapsed 24-hour days. Hard/again reset the next interval to one day. */
export function scheduleReview(
  previous: CardProgress | undefined,
  rating: Rating,
  now: number,
): CardProgress {
  const interval = rating === 'good'
    ? GOOD_INTERVALS.find((days) => days > (previous?.interval ?? 0)) ?? 30
    : 1;

  return {
    dueAt: now + interval * DAY_MS,
    interval,
    reviews: (previous?.reviews ?? 0) + 1,
    lastRating: rating,
    lastReviewedAt: now,
  };
}

export function buildQueue(
  allIds: string[],
  progress: Record<string, CardProgress>,
  now: number,
  limit = 5,
): string[] {
  if (!Number.isFinite(limit) || limit <= 0) return [];

  const due: { id: string; dueAt: number; order: number }[] = [];
  const unseen: string[] = [];
  const uniqueIds = [...new Set(allIds)];

  uniqueIds.forEach((id, order) => {
    if (!Object.prototype.hasOwnProperty.call(progress, id)) {
      unseen.push(id);
    } else if (progress[id].dueAt <= now) {
      due.push({ id, dueAt: progress[id].dueAt, order });
    }
  });

  due.sort((a, b) => a.dueAt - b.dueAt || a.order - b.order);
  return [...due.map(({ id }) => id), ...unseen].slice(0, Math.floor(limit));
}

/** Calendar dates remain Korean dates even when the device uses another timezone. */
export function dayKey(now: number): string {
  const parts = seoulDate.formatToParts(new Date(now));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
