import assert from 'node:assert/strict';
import test from 'node:test';
import type { QuizChoiceId, QuizQuestion } from '../data/quizzes/types';
import { gradeSingleQuiz } from './quiz-catalog';
import {
  advanceQuizSession, confirmQuizAnswer, createEmptyQuizState, createQuizSession,
  getQuizPool, getQuizSummary, getWrongQuestionIds, loadQuizState, quizStorageKey,
  readQuizState, saveQuizState, selectQuizChoice,
  type QuizSessionConfig, type QuizState, type QuizStorage,
} from './quiz';

function question(id: string, overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id, part: 'javascript', level: 'foundation', kind: 'concept', topic: '비교', prompt: '어떤 값인가요?',
    choices: [
      { id: 'a', text: '0', explanation: '숫자 0입니다.' },
      { id: 'b', text: '1', explanation: '숫자 1입니다.' },
      { id: 'c', text: '2', explanation: '숫자 2입니다.' },
      { id: 'd', text: '3', explanation: '숫자 3입니다.' },
    ],
    correctChoiceId: 'b', explanation: '예시 정답은 1입니다.', relatedTermIds: [], source: 'https://developer.mozilla.org/',
    ...overrides,
  };
}
const questions = [
  ...Array.from({ length: 7 }, (_, index) => question(`js-${index}`, { correctChoiceId: index % 2 ? 'b' : 'a' })),
  question('js-practical', { level: 'practical' }),
  question('react-0', { part: 'react' }),
  question('react-advanced', { part: 'react', level: 'advanced' }),
];
const config: QuizSessionConfig = { part: 'javascript', level: 'foundation', mode: 'all' };
const options = { id: 'session-one', now: 1000, random: () => 0.25 };
function start(state = createEmptyQuizState(), id = options.id) {
  return createQuizSession(state, questions, config, { ...options, id });
}
function chooseCorrect(state: QuizState, correct: boolean): QuizState {
  const session = state.session!;
  const current = questions.find(item => item.id === session.questionIds[session.index])!;
  const choice = correct ? current.correctChoiceId : current.choices.find(item => item.id !== current.correctChoiceId)!.id;
  return confirmQuizAnswer(selectQuizChoice(state, choice), questions, 2000 + session.index);
}
function complete(state: QuizState, correctness: boolean[]): QuizState {
  for (const correct of correctness) {
    state = chooseCorrect(state, correct);
    state = advanceQuizSession(state, questions, 3000);
  }
  return state;
}

test('a session samples five distinct questions from exactly the chosen part and level', () => {
  const before = JSON.stringify(questions);
  const state = start();
  assert.equal(state.session?.questionIds.length, 5);
  assert.equal(new Set(state.session?.questionIds).size, 5);
  for (const id of state.session!.questionIds) {
    const item = questions.find(question => question.id === id)!;
    assert.equal(item.part, 'javascript');
    assert.equal(item.level, 'foundation');
  }
  assert.equal(JSON.stringify(questions), before);
  assert.equal(state.records && Object.keys(state.records).length, 0);
});

test('duplicate input IDs never create duplicate session questions', () => {
  const result = createQuizSession(createEmptyQuizState(), [questions[0], questions[0], questions[1]], config, options);
  assert.equal(result.session?.questionIds.length, 2);
  assert.equal(new Set(result.session?.questionIds).size, 2);
});

test('choice order is stored once and remains stable through selection and refresh', () => {
  const initial = start();
  const orders = JSON.stringify(initial.session!.optionOrders);
  initial.session!.optionOrders.forEach(order => assert.deepEqual([...order].sort(), ['a', 'b', 'c', 'd']));
  assert.notDeepEqual(initial.session!.optionOrders[0], ['a', 'b', 'c', 'd']);
  const selected = selectQuizChoice(initial, 'd');
  assert.equal(JSON.stringify(selected.session!.optionOrders), orders);
  assert.equal(JSON.stringify(readQuizState(JSON.stringify(selected), questions).session!.optionOrders), orders);
  assert.equal(initial.session!.selectedChoiceId, null);
});

test('a displayed shuffled choice still grades its stable choice ID', () => {
  let state = start();
  const current = questions.find(item => item.id === state.session!.questionIds[0])!;
  const displayedIndex = state.session!.optionOrders[0].indexOf(current.correctChoiceId);
  const clickedId = state.session!.optionOrders[0][displayedIndex];
  state = confirmQuizAnswer(selectQuizChoice(state, clickedId), questions, 2000);
  assert.equal(state.session!.answers[0]?.correct, true);
});

test('empty wrong-answer practice does not create a phantom session', () => {
  const empty = createEmptyQuizState();
  assert.equal(createQuizSession(empty, questions, { ...config, mode: 'wrong' }, options), empty);
  assert.deepEqual(getQuizPool(empty, questions, { ...config, mode: 'wrong' }), []);
});

test('checking requires a choice and advancing requires a checked answer', () => {
  const state = start();
  assert.equal(confirmQuizAnswer(state, questions, 2000), state);
  assert.equal(advanceQuizSession(state, questions, 2000), state);
  const selected = selectQuizChoice(state, 'c');
  assert.equal(advanceQuizSession(selected, questions, 2000), selected);
  assert.equal(selectQuizChoice(state, 'invalid' as QuizChoiceId), state);
});

test('a checked answer is locked and cannot be submitted or scored twice', () => {
  const state = chooseCorrect(start(), false);
  const current = questions.find(item => item.id === state.session!.questionIds[0])!;
  assert.equal(selectQuizChoice(state, current.correctChoiceId), state);
  assert.equal(confirmQuizAnswer(state, questions, 2001), state);
  assert.equal(Object.keys(state.records).length, 0);
  const next = advanceQuizSession(state, questions, 3000);
  assert.equal(next.session!.index, 1);
  assert.equal(next.session!.selectedChoiceId, null);
  assert.equal(next.session!.answers[1], null);
  assert.equal(advanceQuizSession(next, questions, 3000), next);
});

test('finishing five answers records exact score and one attempt for each question', () => {
  const state = complete(start(), [true, false, true, false, false]);
  const summary = getQuizSummary(state.session!)!;
  assert.equal(summary.total, 5);
  assert.equal(summary.correct, 2);
  assert.equal(summary.wrong, 3);
  assert.equal(state.session!.status, 'completed');
  assert.equal(state.history.length, 1);
  assert.equal(getWrongQuestionIds(state).length, 3);
  assert.equal(Object.keys(state.records).length, 5);
  for (const record of Object.values(state.records)) {
    assert.equal(record.attempts, 1);
    assert.equal(record.correct + record.wrong, 1);
  }
  assert.equal(advanceQuizSession(state, questions, 4000), state);
  assert.equal(confirmQuizAnswer(state, questions, 4000), state);
  const refreshed = readQuizState(JSON.stringify(state), questions);
  assert.deepEqual(refreshed, state);
  assert.equal(advanceQuizSession(refreshed, questions, 4000), refreshed);
  assert.equal(createQuizSession(state, questions, config, options), state);
});

test('short wrong-answer practice uses only wrong IDs and clears them when answered correctly', () => {
  let state = complete(start(), [true, false, true, false, true]);
  const wrongIds = getWrongQuestionIds(state);
  const previousRecords = structuredClone(state.records);
  state = createQuizSession(state, questions, { ...config, mode: 'wrong' }, { ...options, id: 'retry-two', now: 4000 });
  assert.equal(state.session!.questionIds.length, 2);
  assert.deepEqual([...state.session!.questionIds].sort(), [...wrongIds].sort());
  state = complete(state, [true, true]);
  assert.deepEqual(getWrongQuestionIds(state), []);
  assert.equal(state.history[0].total, 2);
  assert.equal(state.history[0].correct, 2);
  for (const id of wrongIds) {
    assert.equal(state.records[id].attempts, 2);
    assert.equal(state.records[id].wrong, 1);
    assert.equal(state.records[id].correct, 1);
    assert.equal(state.records[id].lastCorrect, true);
  }
  for (const id of Object.keys(previousRecords).filter(id => !wrongIds.includes(id))) assert.deepEqual(state.records[id], previousRecords[id]);
});

test('wrong-answer pools also honor the chosen part and difficulty', () => {
  const state = createEmptyQuizState();
  for (const id of ['js-0', 'js-practical', 'react-0', 'react-advanced']) {
    state.records[id] = { attempts: 1, correct: 0, wrong: 1, lastCorrect: false, answeredAt: 1000 };
  }
  assert.deepEqual(getQuizPool(state, questions, { ...config, mode: 'wrong' }).map(item => item.id), ['js-0']);
  assert.deepEqual(getQuizPool(state, questions, { part: 'react', level: 'advanced', mode: 'wrong' }).map(item => item.id), ['react-advanced']);
});

test('an unfinished session restores selected choices, checked answers and its exact position', () => {
  let state = advanceQuizSession(chooseCorrect(start(), false), questions, 2000);
  state = selectQuizChoice(state, 'd');
  assert.deepEqual(readQuizState(JSON.stringify(state), questions), state);
  const checked = chooseCorrect(state, true);
  assert.deepEqual(readQuizState(JSON.stringify(checked), questions), checked);
});

test('corrupt or unsupported persisted data safely falls back to empty records', () => {
  for (const raw of [null, undefined, '', '{', '[]', 'null', '{"version":2,"records":{},"history":[]}', '{"version":1,"records":null,"history":[]}']) {
    assert.deepEqual(readQuizState(raw, questions), createEmptyQuizState());
  }
});

test('unknown IDs and invalid record counts are removed without losing valid records', () => {
  const state = complete(start(), [true, false, true, false, true]);
  const raw = JSON.parse(JSON.stringify(state));
  raw.records.unknown = { attempts: 1, correct: 1, wrong: 0, lastCorrect: true, answeredAt: 1 };
  raw.records['js-practical'] = { attempts: 2, correct: 2, wrong: 2, lastCorrect: true, answeredAt: 1 };
  const result = readQuizState(JSON.stringify(raw), questions);
  assert.deepEqual(result.records, state.records);
});

test('invalid or stale persisted sessions are discarded while legitimate records survive', () => {
  const saved = complete(start(), [true, false, true, false, true]);
  const fresh = start(saved, 'new-session');
  const mutations: ((raw: any) => void)[] = [
    raw => { raw.session.questionIds[0] = 'removed-question'; },
    raw => { raw.session.questionIds[1] = raw.session.questionIds[0]; },
    raw => { raw.session.optionOrders[0] = ['a', 'a', 'c', 'd']; },
    raw => { raw.session.selectedChoiceId = 'x'; },
    raw => { raw.session.index = -1; },
    raw => { raw.session.index = 5; },
    raw => { raw.session.part = 'react'; },
    raw => { raw.session.level = 'advanced'; },
    raw => { raw.session.status = 'completed'; raw.session.completedAt = 4000; },
    raw => { raw.session.answers[1] = { choiceId: 'a', correct: true, answeredAt: 2000 }; },
  ];
  for (const mutate of mutations) {
    const raw = JSON.parse(JSON.stringify(fresh));
    mutate(raw);
    const result = readQuizState(JSON.stringify(raw), questions);
    assert.equal(result.session, null);
    assert.deepEqual(result.records, saved.records);
  }
});

test('persisted answer correctness is verified from content instead of trusting a saved boolean', () => {
  const raw = JSON.parse(JSON.stringify(chooseCorrect(start(), false)));
  raw.session.answers[0].correct = true;
  assert.equal(readQuizState(JSON.stringify(raw), questions).session, null);
});

test('only ten recent completed sessions are retained and each ID is unique', () => {
  let state = createEmptyQuizState();
  for (let index = 0; index < 12; index += 1) state = complete(start(state, `run-${index}`), [true, true, true, true, true]);
  assert.equal(state.history.length, 10);
  assert.equal(state.history[0].id, 'run-11');
  assert.equal(state.history[9].id, 'run-2');
  const raw = JSON.parse(JSON.stringify(state));
  raw.history.unshift(raw.history[0], { ...raw.history[0], id: 'bad-total', correct: 99 });
  const restored = readQuizState(JSON.stringify(raw), questions);
  assert.equal(restored.history.length, 10);
  assert.equal(new Set(restored.history.map(summary => summary.id)).size, 10);
});

test('guest and different accounts cannot read one another’s quiz state through storage helpers', () => {
  const entries = new Map<string, string>();
  const storage: QuizStorage = {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => { entries.set(key, value); },
  };
  const guestKey = quizStorageKey(null);
  const accountA = quizStorageKey('account-a');
  const accountB = quizStorageKey('account-b');
  assert.equal(new Set([guestKey, accountA, accountB, quizStorageKey('guest')]).size, 4);
  const guestState = complete(start(), [true, false, true, false, true]);
  assert.equal(saveQuizState(storage, guestKey, guestState), true);
  assert.deepEqual(loadQuizState(storage, accountA, questions).state, createEmptyQuizState());
  assert.deepEqual(loadQuizState(storage, accountB, questions).state, createEmptyQuizState());
  assert.deepEqual(loadQuizState(storage, guestKey, questions).state, guestState);
  saveQuizState(storage, accountA, start());
  assert.equal(loadQuizState(storage, accountA, questions).state.session?.status, 'in-progress');
  assert.equal(loadQuizState(storage, guestKey, questions).state.session?.status, 'completed');
  assert.equal(loadQuizState(storage, accountA, questions).storageIssue, undefined);
});

test('unavailable or blocked browser storage does not prevent in-memory quiz interaction', () => {
  const blocked: QuizStorage = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
  };
  assert.deepEqual(loadQuizState(blocked, 'key', questions).state, createEmptyQuizState());
  assert.deepEqual(loadQuizState(null, 'key', questions).state, createEmptyQuizState());
  assert.ok(loadQuizState(blocked, 'key', questions).storageIssue);
  assert.ok(loadQuizState(null, 'key', questions).storageIssue);
  assert.equal(saveQuizState(blocked, 'key', start()), false);
  assert.equal(saveQuizState(null, 'key', start()), false);
  assert.equal(chooseCorrect(start(), true).session?.answers[0]?.correct, true);
});

test('a later single-question answer remains latest when an older paused set finally completes', () => {
  let state = start();
  const first = questions.find(question => question.id === state.session!.questionIds[0])!;
  state = chooseCorrect(state, false);
  const olderAnswerTime = state.session!.answers[0]!.answeredAt;
  state = gradeSingleQuiz(state, questions, first.id, first.correctChoiceId, { id: 'newer-single', now: olderAnswerTime + 10_000, random: () => 0 });
  assert.equal(state.records[first.id].lastCorrect, true);
  state = advanceQuizSession(state, questions, olderAnswerTime + 20_000);
  state = complete(state, [true, true, true, true]);
  assert.equal(state.records[first.id].attempts, 2);
  assert.equal(state.records[first.id].correct, 1);
  assert.equal(state.records[first.id].wrong, 1);
  assert.equal(state.records[first.id].lastCorrect, true);
  assert.equal(state.records[first.id].answeredAt, olderAnswerTime + 10_000);
  assert.ok(!getWrongQuestionIds(state).includes(first.id));
  assert.deepEqual(readQuizState(JSON.stringify(state), questions), state);
});

test('clock changes cannot write a session with timestamps before its start or checked answer', () => {
  let state = createQuizSession(createEmptyQuizState(), questions, config, { ...options, now: 5000 });
  state = complete(state, [true, true, true, true, true]);
  assert.ok(state.session!.answers.every(answer => answer!.answeredAt >= 5000));
  assert.equal(state.session!.completedAt, 5000);
  assert.deepEqual(readQuizState(JSON.stringify(state), questions), state);
  const raw = JSON.parse(JSON.stringify(state));
  raw.session.answers[0].answeredAt = 4999;
  assert.equal(readQuizState(JSON.stringify(raw), questions).session, null);
});

test('opening one catalog question creates a restorable one-question session and counts its completion once', () => {
  const selected = questions.find(question => question.id === 'react-advanced')!;
  const singleConfig: QuizSessionConfig = { part: selected.part, level: selected.level, mode: 'all' };
  let state = createQuizSession(createEmptyQuizState(), [selected], singleConfig, { ...options, id: 'one-catalog-question' });
  assert.deepEqual(state.session!.questionIds, [selected.id]);
  assert.equal(state.session!.index, 0);
  state = selectQuizChoice(state, selected.correctChoiceId);
  state = readQuizState(JSON.stringify(state), questions);
  assert.equal(state.session!.selectedChoiceId, selected.correctChoiceId);
  state = confirmQuizAnswer(state, questions, 2000);
  state = advanceQuizSession(state, questions, 3000);
  assert.equal(state.session!.index, 0);
  assert.equal(state.session!.status, 'completed');
  assert.equal(getQuizSummary(state.session!)!.total, 1);
  assert.equal(getQuizSummary(state.session!)!.correct, 1);
  assert.equal(state.records[selected.id].attempts, 1);
  const restored = readQuizState(JSON.stringify(state), questions);
  assert.deepEqual(restored, state);
  assert.equal(advanceQuizSession(restored, questions, 4000), restored);
  assert.equal(restored.records[selected.id].attempts, 1);
});

test('retrying one catalog question clears only its latest wrong status while preserving other wrong answers', () => {
  const selected = questions[0];
  let state = createEmptyQuizState();
  state.records[questions[1].id] = { attempts: 1, correct: 0, wrong: 1, lastCorrect: false, answeredAt: 900 };
  state = createQuizSession(state, [selected], config, { ...options, id: 'one-wrong' });
  state = complete(state, [false]);
  assert.equal(getQuizSummary(state.session!)!.wrong, 1);
  assert.equal(state.records[selected.id].wrong, 1);
  assert.deepEqual([...getWrongQuestionIds(state)].sort(), [selected.id, questions[1].id].sort());
  state = createQuizSession(state, [selected], config, { ...options, id: 'one-correct-retry', now: 4000 });
  state = complete(state, [true]);
  const restored = readQuizState(JSON.stringify(state), questions);
  assert.deepEqual(getWrongQuestionIds(restored), [questions[1].id]);
  assert.equal(restored.records[selected.id].attempts, 2);
  assert.equal(restored.records[selected.id].correct, 1);
  assert.equal(restored.records[selected.id].wrong, 1);
  assert.equal(restored.records[selected.id].lastCorrect, true);
  assert.equal(restored.history[0].total, 1);
});
