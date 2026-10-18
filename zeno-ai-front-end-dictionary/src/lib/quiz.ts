import type { QuizChoiceId, QuizLevel, QuizPart, QuizQuestion } from '../data/quizzes/types';

export type QuizMode = 'all' | 'wrong';
export interface QuizSessionConfig { part: QuizPart; level: QuizLevel; mode: QuizMode }
export interface QuizAnswer { choiceId: QuizChoiceId; correct: boolean; answeredAt: number }
export interface QuizRecord {
  attempts: number;
  correct: number;
  wrong: number;
  lastCorrect: boolean;
  answeredAt: number;
}
export interface QuizSession extends QuizSessionConfig {
  id: string;
  questionIds: string[];
  optionOrders: QuizChoiceId[][];
  answers: (QuizAnswer | null)[];
  index: number;
  selectedChoiceId: QuizChoiceId | null;
  status: 'in-progress' | 'completed';
  startedAt: number;
  completedAt: number | null;
}
export interface QuizSummary extends QuizSessionConfig {
  id: string;
  questionIds: string[];
  total: number;
  correct: number;
  wrong: number;
  startedAt: number;
  completedAt: number;
}
export interface QuizState {
  version: 1;
  session: QuizSession | null;
  records: Record<string, QuizRecord>;
  history: QuizSummary[];
}
export interface QuizStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export interface LoadedQuizState { state: QuizState; storageIssue?: string }

const sessionSize = 5;
const historyLimit = 10;
const parts = ['javascript', 'react'] as const;
const levels = ['foundation', 'practical', 'advanced'] as const;
const modes = ['all', 'wrong'] as const;
const choiceIds = ['a', 'b', 'c', 'd'] as const;

export function createEmptyQuizState(): QuizState {
  return { version: 1, session: null, records: {}, history: [] };
}

/** Guest and each signed-in account use independent browser records. */
export function quizStorageKey(accountId: string | null | undefined): string {
  return accountId == null ? 'zeno-quiz:v1:guest' : `zeno-quiz:v1:user:${encodeURIComponent(accountId)}`;
}

export function getWrongQuestionIds(state: QuizState): string[] {
  return Object.keys(state.records).filter(id => !state.records[id].lastCorrect);
}

export function getQuizPool(state: QuizState, questions: readonly QuizQuestion[], config: QuizSessionConfig): QuizQuestion[] {
  return questions.filter(question => question.part === config.part && question.level === config.level
    && (config.mode === 'all' || state.records[question.id]?.lastCorrect === false));
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const draw = random();
    const swapIndex = Math.floor((Number.isFinite(draw) && draw >= 0 && draw < 1 ? draw : 0) * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

/** A short wrong-answer pool produces 1–4 questions; a full pool produces five. */
export function createQuizSession(
  state: QuizState,
  questions: readonly QuizQuestion[],
  config: QuizSessionConfig,
  options: { id: string; now: number; random: () => number },
): QuizState {
  if (!validId(options.id) || !validTime(options.now) || !validConfig(config)
    || state.history.some(summary => summary.id === options.id)) return state;
  const uniquePool = [...new Map(getQuizPool(state, questions, config).map(question => [question.id, question])).values()];
  const selected = shuffle(uniquePool, options.random).slice(0, sessionSize);
  if (selected.length === 0) return state;
  return {
    ...state,
    session: {
      ...config,
      id: options.id,
      questionIds: selected.map(question => question.id),
      optionOrders: selected.map(question => shuffle(question.choices.map(choice => choice.id), options.random)),
      answers: selected.map(() => null),
      index: 0,
      selectedChoiceId: null,
      status: 'in-progress',
      startedAt: options.now,
      completedAt: null,
    },
  };
}

export function selectQuizChoice(state: QuizState, choiceId: QuizChoiceId): QuizState {
  const session = state.session;
  if (!session || session.status !== 'in-progress' || session.answers[session.index]
    || !session.optionOrders[session.index]?.includes(choiceId) || session.selectedChoiceId === choiceId) return state;
  return { ...state, session: { ...session, selectedChoiceId: choiceId } };
}

export function confirmQuizAnswer(state: QuizState, questions: readonly QuizQuestion[], now: number): QuizState {
  const session = state.session;
  if (!session || session.status !== 'in-progress' || session.answers[session.index]
    || session.selectedChoiceId === null || !validTime(now)) return state;
  const question = questions.find(item => item.id === session.questionIds[session.index]);
  if (!question || !question.choices.some(choice => choice.id === session.selectedChoiceId)) return state;
  const answers = [...session.answers];
  answers[session.index] = {
    choiceId: session.selectedChoiceId,
    correct: session.selectedChoiceId === question.correctChoiceId,
    answeredAt: Math.max(now, session.startedAt, ...session.answers.map(answer => answer?.answeredAt ?? 0)),
  };
  return { ...state, session: { ...session, answers } };
}

export function getQuizSummary(session: QuizSession): QuizSummary | null {
  if (session.status !== 'completed' || session.completedAt === null || session.answers.some(answer => answer === null)) return null;
  const correct = session.answers.filter(answer => answer?.correct).length;
  return {
    id: session.id,
    part: session.part,
    level: session.level,
    mode: session.mode,
    questionIds: [...session.questionIds],
    total: session.questionIds.length,
    correct,
    wrong: session.questionIds.length - correct,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
  };
}

/** Advancing the last checked answer commits this session exactly once. */
export function advanceQuizSession(state: QuizState, questions: readonly QuizQuestion[], now: number): QuizState {
  const session = state.session;
  if (!session || session.status !== 'in-progress' || !session.answers[session.index] || !validTime(now)) return state;
  if (session.index < session.questionIds.length - 1) {
    return { ...state, session: { ...session, index: session.index + 1, selectedChoiceId: null } };
  }
  if (session.answers.some(answer => answer === null)
    || session.questionIds.some(id => !questions.some(question => question.id === id))) return state;
  const completedSession: QuizSession = {
    ...session,
    status: 'completed',
    completedAt: Math.max(now, session.startedAt, ...session.answers.map(answer => answer?.answeredAt ?? 0)),
  };
  const summary = getQuizSummary(completedSession)!;
  if (state.history.some(item => item.id === session.id)) return { ...state, session: completedSession };
  const records = { ...state.records };
  session.questionIds.forEach((id, index) => {
    const answer = session.answers[index]!;
    const previous = records[id];
    const isLatestAnswer = !previous || answer.answeredAt >= previous.answeredAt;
    records[id] = {
      attempts: (previous?.attempts ?? 0) + 1,
      correct: (previous?.correct ?? 0) + Number(answer.correct),
      wrong: (previous?.wrong ?? 0) + Number(!answer.correct),
      lastCorrect: isLatestAnswer ? answer.correct : previous.lastCorrect,
      answeredAt: Math.max(answer.answeredAt, previous?.answeredAt ?? 0),
    };
  });
  return { ...state, session: completedSession, records, history: [summary, ...state.history].slice(0, historyLimit) };
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function validTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 128;
}
function nonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function validConfig(value: unknown): value is QuizSessionConfig {
  return object(value) && parts.includes(value.part as QuizPart)
    && levels.includes(value.level as QuizLevel) && modes.includes(value.mode as QuizMode);
}
function validChoice(value: unknown): value is QuizChoiceId {
  return choiceIds.includes(value as QuizChoiceId);
}
function validRecord(value: unknown): value is QuizRecord {
  return object(value) && nonNegativeInteger(value.attempts) && value.attempts > 0
    && nonNegativeInteger(value.correct) && nonNegativeInteger(value.wrong)
    && value.correct + value.wrong === value.attempts && typeof value.lastCorrect === 'boolean'
    && (value.lastCorrect ? value.correct > 0 : value.wrong > 0) && validTime(value.answeredAt);
}

function readSession(value: unknown, byId: ReadonlyMap<string, QuizQuestion>): QuizSession | null {
  if (!object(value) || !validConfig(value) || !validId(value.id) || !validTime(value.startedAt)
    || !Array.isArray(value.questionIds) || value.questionIds.length < 1 || value.questionIds.length > sessionSize
    || value.questionIds.some(id => typeof id !== 'string' || !byId.has(id))
    || new Set(value.questionIds).size !== value.questionIds.length
    || !Array.isArray(value.optionOrders) || value.optionOrders.length !== value.questionIds.length
    || !Array.isArray(value.answers) || value.answers.length !== value.questionIds.length
    || !nonNegativeInteger(value.index) || value.index >= value.questionIds.length
    || (value.selectedChoiceId !== null && !validChoice(value.selectedChoiceId))
    || (value.status !== 'in-progress' && value.status !== 'completed')) return null;

  const ids = value.questionIds as string[];
  const answers: (QuizAnswer | null)[] = [];
  const orders: QuizChoiceId[][] = [];
  for (let index = 0; index < ids.length; index += 1) {
    const question = byId.get(ids[index])!;
    if (question.part !== value.part || question.level !== value.level) return null;
    const order: unknown = value.optionOrders[index];
    if (!Array.isArray(order) || order.length !== 4 || new Set(order).size !== 4
      || order.some(id => !question.choices.some(choice => choice.id === id))) return null;
    orders.push([...order] as QuizChoiceId[]);
    const answer: unknown = value.answers[index];
    if (answer === null) {
      answers.push(null);
    } else {
      if (!object(answer) || !validChoice(answer.choiceId) || !validTime(answer.answeredAt)
        || answer.answeredAt < value.startedAt || answer.answeredAt < (answers[index - 1]?.answeredAt ?? 0)
        || typeof answer.correct !== 'boolean' || answer.correct !== (answer.choiceId === question.correctChoiceId)) return null;
      answers.push({ choiceId: answer.choiceId, correct: answer.correct, answeredAt: answer.answeredAt });
    }
  }
  if (answers.slice(0, value.index).some(answer => answer === null)
    || answers.slice(value.index + 1).some(answer => answer !== null)) return null;
  const currentAnswer = answers[value.index];
  if (currentAnswer && value.selectedChoiceId !== currentAnswer.choiceId) return null;
  if (value.status === 'completed') {
    if (value.index !== ids.length - 1 || answers.some(answer => answer === null)
      || !validTime(value.completedAt) || value.completedAt < (currentAnswer?.answeredAt ?? value.startedAt)) return null;
  } else if (value.completedAt !== null) return null;

  return {
    id: value.id,
    part: value.part,
    level: value.level,
    mode: value.mode,
    questionIds: [...ids],
    optionOrders: orders,
    answers,
    index: value.index,
    selectedChoiceId: value.selectedChoiceId as QuizChoiceId | null,
    status: value.status,
    startedAt: value.startedAt,
    completedAt: value.completedAt as number | null,
  };
}

function readSummary(value: unknown, byId: ReadonlyMap<string, QuizQuestion>): QuizSummary | null {
  if (!object(value) || !validConfig(value) || !validId(value.id) || !validTime(value.startedAt)
    || !validTime(value.completedAt) || value.completedAt < value.startedAt || !Array.isArray(value.questionIds)
    || value.questionIds.length < 1 || value.questionIds.length > sessionSize
    || new Set(value.questionIds).size !== value.questionIds.length
    || value.questionIds.some(id => typeof id !== 'string' || !byId.has(id)
      || byId.get(id)!.part !== value.part || byId.get(id)!.level !== value.level)
    || value.total !== value.questionIds.length || !nonNegativeInteger(value.correct)
    || !nonNegativeInteger(value.wrong) || value.correct + value.wrong !== value.total) return null;
  return {
    id: value.id,
    part: value.part,
    level: value.level,
    mode: value.mode,
    questionIds: [...value.questionIds] as string[],
    total: value.total as number,
    correct: value.correct,
    wrong: value.wrong,
    startedAt: value.startedAt,
    completedAt: value.completedAt,
  };
}

/** Invalid sessions are discarded; independently valid accumulated records survive. */
export function readQuizState(raw: string | null | undefined, questions: readonly QuizQuestion[]): QuizState {
  const empty = createEmptyQuizState();
  if (typeof raw !== 'string' || raw.length > 1_000_000) return empty;
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return empty; }
  if (!object(parsed) || parsed.version !== 1 || !object(parsed.records) || !Array.isArray(parsed.history)) return empty;
  const byId = new Map(questions.map(question => [question.id, question]));
  const records: Record<string, QuizRecord> = {};
  for (const [id, value] of Object.entries(parsed.records)) {
    if (!byId.has(id) || ['__proto__', 'constructor', 'prototype'].includes(id) || !validRecord(value)) continue;
    records[id] = { attempts: value.attempts, correct: value.correct, wrong: value.wrong, lastCorrect: value.lastCorrect, answeredAt: value.answeredAt };
  }
  const history: QuizSummary[] = [];
  for (const item of parsed.history) {
    const summary = readSummary(item, byId);
    if (summary && !history.some(existing => existing.id === summary.id)) history.push(summary);
    if (history.length === historyLimit) break;
  }
  return { version: 1, session: readSession(parsed.session, byId), records, history };
}

export function loadQuizState(storage: QuizStorage | null | undefined, key: string, questions: readonly QuizQuestion[]): LoadedQuizState {
  const storageIssue = '이 브라우저에서 퀴즈 기록을 저장할 수 없어요. 퀴즈는 계속 풀 수 있어요.';
  if (!storage) return { state: createEmptyQuizState(), storageIssue };
  try { return { state: readQuizState(storage.getItem(key), questions) }; }
  catch { return { state: createEmptyQuizState(), storageIssue }; }
}

export function saveQuizState(storage: QuizStorage | null | undefined, key: string, state: QuizState): boolean {
  if (!storage) return false;
  try { storage.setItem(key, JSON.stringify(state)); return true; } catch { return false; }
}
