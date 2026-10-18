import assert from 'node:assert/strict';
import test from 'node:test';
import type { QuizChoiceId, QuizQuestion } from '../data/quizzes/types';
import { advanceQuizSession, confirmQuizAnswer, createEmptyQuizState, createQuizSession, readQuizState, selectQuizChoice, type QuizRecord } from './quiz';
import { filterQuizQuestions, gradeSingleQuiz, type QuizCatalogFilter } from './quiz-catalog';

function question(id: string, overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id, part: 'javascript', level: 'foundation', kind: 'concept', topic: 'Default values',
    prompt: 'Which value is retained by this operator?', code: 'const fallback = value ?? "DEFAULT";',
    codeLanguage: 'javascript',
    choices: [
      { id: 'a', text: 'empty string', explanation: 'choice-only-private-note' },
      { id: 'b', text: 'false', explanation: '별도 보기 해설입니다.' },
      { id: 'c', text: 'zero', explanation: '별도 보기 해설입니다.' },
      { id: 'd', text: 'null', explanation: '별도 보기 해설입니다.' },
    ],
    correctChoiceId: 'a', explanation: 'Nullish coalescing preserves a value that is not null or undefined.',
    relatedTermIds: ['nullish-coalescing'], source: 'https://developer.mozilla.org/', ...overrides,
  };
}
const questions = [
  question('js-base'),
  question('js-fetch', { level: 'practical', kind: 'practical', topic: 'Fetch cleanup',
    prompt: 'How is an in-flight request cancelled?', code: undefined,
    explanation: 'Pass an AbortSignal to fetch and abort during cleanup.', relatedTermIds: ['abort-controller'] }),
  question('js-window', { level: 'advanced', kind: 'coding-test', topic: 'Sliding\n  window',
    prompt: 'How do two pointers avoid rebuilding every substring?', code: undefined,
    explanation: 'Move the left boundary to restore the invariant.', relatedTermIds: ['sliding-window'] }),
  question('react-props', { part: 'react', topic: 'Props identity', code: undefined,
    prompt: 'How does the parent pass a read-only value?', explanation: 'A child receives props from its parent.', relatedTermIds: ['props'] }),
  question('react-effect', { part: 'react', level: 'practical', kind: 'practical', topic: 'Effect cleanup',
    prompt: 'What does cleanup disconnect?', code: undefined,
    explanation: 'Cleanup can cancel an AbortSignal subscription.', relatedTermIds: ['use-effect'] }),
  question('react-concurrency', { part: 'react', level: 'advanced', kind: 'coding-test', topic: 'Render snapshot',
    prompt: 'Which queued update sees this value?', code: undefined,
    explanation: 'Read each state snapshot before calculating the next update.', relatedTermIds: ['state'] }),
];
const records: Record<string, QuizRecord> = {
  'js-fetch': { attempts: 4, correct: 1, wrong: 3, lastCorrect: true, answeredAt: 1000 },
  'js-window': { attempts: 4, correct: 3, wrong: 1, lastCorrect: false, answeredAt: 1000 },
  'react-effect': { attempts: 1, correct: 1, wrong: 0, lastCorrect: true, answeredAt: 1000 },
  'react-concurrency': { attempts: 1, correct: 0, wrong: 1, lastCorrect: false, answeredAt: 1000 },
};
const all: QuizCatalogFilter = { query: '', part: 'all', level: 'all', kind: 'all', status: 'all' };
function ids(filter: Partial<QuizCatalogFilter> = {}) {
  return filterQuizQuestions(questions, { ...all, ...filter }, records).map(question => question.id);
}

test('all filters preserve catalog order and return a separate array without changing questions or records', () => {
  const before = JSON.stringify({ questions, records });
  const filtered = filterQuizQuestions(questions, all, records);
  assert.notEqual(filtered, questions);
  assert.deepEqual(filtered, questions);
  assert.equal(filtered[0], questions[0]);
  assert.equal(JSON.stringify({ questions, records }), before);
});

test('part, difficulty and kind filters each select exactly their own scope', () => {
  assert.deepEqual(ids({ part: 'react' }), ['react-props', 'react-effect', 'react-concurrency']);
  assert.deepEqual(ids({ level: 'foundation' }), ['js-base', 'react-props']);
  assert.deepEqual(ids({ level: 'advanced' }), ['js-window', 'react-concurrency']);
  assert.deepEqual(ids({ kind: 'coding-test' }), ['js-window', 'react-concurrency']);
  assert.deepEqual(ids({ kind: 'practical' }), ['js-fetch', 'react-effect']);
});

test('search ignores case and leading, trailing, repeated or line-break whitespace', () => {
  assert.deepEqual(ids({ query: '  ABORTsignal  ' }), ['js-fetch', 'react-effect']);
  assert.deepEqual(ids({ query: '  SLIDING   WINDOW\n ' }), ['js-window']);
  assert.deepEqual(ids({ query: '\n \t ' }), questions.map(question => question.id));
});

test('search includes topic, prompt, code, answer text, main explanation and related term IDs', () => {
  assert.deepEqual(ids({ query: 'Props identity' }), ['react-props']);
  assert.deepEqual(ids({ query: 'queued update' }), ['react-concurrency']);
  assert.deepEqual(ids({ query: 'const fallback' }), ['js-base']);
  assert.deepEqual(ids({ query: 'empty string' }), questions.map(question => question.id));
  assert.deepEqual(ids({ query: 'restore the invariant' }), ['js-window']);
  assert.deepEqual(ids({ query: 'abort-controller' }), ['js-fetch']);
  assert.deepEqual(ids({ query: 'choice-only-private-note' }), []);
});

test('multi-word search combines part and topic regardless of order and requires every search word', () => {
  assert.deepEqual(ids({ query: 'React cleanup' }), ['react-effect']);
  assert.deepEqual(ids({ query: 'cleanup React' }), ['react-effect']);
  assert.deepEqual(ids({ query: 'JS cleanup' }), ['js-fetch']);
  assert.deepEqual(ids({ query: 'JavaScript fallback retained' }), ['js-base']);
  assert.deepEqual(ids({ query: 'React cleanup missing-word' }), []);
});

test('an explicit part in search excludes incidental part mentions in distractors and explanations', () => {
  const incidental = question('js-incidental', {
    topic: 'Browser storage', explanation: 'This does not update React state automatically.',
    choices: [{ id: 'a', text: 'Update React state', explanation: 'Incorrect.' }, questions[0].choices[1], questions[0].choices[2], questions[0].choices[3]],
  });
  const related = question('react-state', { part: 'react', topic: 'React state' });
  assert.deepEqual(filterQuizQuestions([incidental, related], { ...all, query: 'React state' }, {}).map(item => item.id), ['react-state']);
  assert.deepEqual(filterQuizQuestions([incidental, related], { ...all, query: 'React state', part: 'javascript' }, {}), []);
});

test('unseen means no record while correct and wrong use the latest outcome instead of lifetime counts', () => {
  assert.deepEqual(ids({ status: 'unseen' }), ['js-base', 'react-props']);
  assert.deepEqual(ids({ status: 'correct' }), ['js-fetch', 'react-effect']);
  assert.deepEqual(ids({ status: 'wrong' }), ['js-window', 'react-concurrency']);
});

test('search, part, level, kind and status intersect instead of broadening one another', () => {
  assert.deepEqual(ids({ query: 'AbortSignal', part: 'javascript', level: 'practical', kind: 'practical', status: 'correct' }), ['js-fetch']);
  assert.deepEqual(ids({ query: 'AbortSignal', part: 'javascript', level: 'practical', kind: 'practical', status: 'wrong' }), []);
  assert.deepEqual(ids({ part: 'react', level: 'foundation', status: 'unseen' }), ['react-props']);
  assert.deepEqual(ids({ part: 'react', level: 'foundation', kind: 'coding-test' }), []);
});

test('empty catalogs and search misses return no results without depending on unrelated records', () => {
  assert.deepEqual(filterQuizQuestions([], all, records), []);
  assert.deepEqual(ids({ query: 'no matching catalog content' }), []);
  assert.deepEqual(filterQuizQuestions(questions, { ...all, status: 'wrong' }, {
    missing: { attempts: 1, correct: 0, wrong: 1, lastCorrect: false, answeredAt: 1000 },
  }), []);
});

test('an inherited record does not mark an unseen question as attempted', () => {
  const inherited = Object.create({ 'js-base': records['js-fetch'] }) as Record<string, QuizRecord>;
  assert.deepEqual(filterQuizQuestions([questions[0]], { ...all, status: 'unseen' }, inherited), [questions[0]]);
  assert.deepEqual(filterQuizQuestions([questions[0]], { ...all, status: 'correct' }, inherited), []);
});

test('a single catalog drill records one result while preserving every detail of an unfinished five-question session', () => {
  const mainQuestions = Array.from({ length: 5 }, (_, index) => question(`main-${index}`));
  const chosen = questions[5];
  const catalog = [...mainQuestions, chosen];
  let state = createQuizSession(createEmptyQuizState(), catalog, {
    part: 'javascript', level: 'foundation', mode: 'all',
  }, { id: 'main-session', now: 1000, random: () => 0.4 });
  state = confirmQuizAnswer(selectQuizChoice(state, 'b'), catalog, 2000);
  state = advanceQuizSession(state, catalog, 2000);
  state = selectQuizChoice(state, 'c');
  const mainSession = state.session;
  const before = JSON.stringify(state);
  const graded = gradeSingleQuiz(state, catalog, chosen.id, chosen.correctChoiceId, {
    id: 'single-drill', now: 3000, random: () => 0.2,
  });
  assert.equal(graded.session, mainSession);
  assert.equal(graded.session!.index, 1);
  assert.equal(graded.session!.selectedChoiceId, 'c');
  assert.equal(graded.session!.answers[0]!.correct, false);
  assert.equal(graded.session!.questionIds.length, 5);
  assert.equal(graded.history.length, 1);
  assert.equal(graded.history[0].total, 1);
  assert.equal(graded.history[0].correct, 1);
  assert.equal(graded.records[chosen.id].attempts, 1);
  assert.equal(graded.records[chosen.id].lastCorrect, true);
  assert.equal(JSON.stringify(state), before);
  assert.deepEqual(readQuizState(JSON.stringify(graded), catalog), graded);
  assert.equal(gradeSingleQuiz(graded, catalog, chosen.id, 'b', { id: 'single-drill', now: 4000, random: () => 0.2 }), graded);
});

test('individual wrong then correct drills update latest status once and preserve unrelated wrong records', () => {
  const chosen = questions[0];
  let state = createEmptyQuizState();
  state.records['js-window'] = { ...records['js-window'] };
  state = gradeSingleQuiz(state, questions, chosen.id, 'd', { id: 'single-wrong', now: 1000, random: () => 0.2 });
  assert.equal(state.session, null);
  assert.equal(state.history[0].wrong, 1);
  assert.equal(state.records[chosen.id].lastCorrect, false);
  assert.deepEqual(filterQuizQuestions(questions, { ...all, status: 'wrong' }, state.records).map(item => item.id), ['js-base', 'js-window']);
  state = gradeSingleQuiz(state, questions, chosen.id, chosen.correctChoiceId, { id: 'single-retry', now: 2000, random: () => 0.2 });
  assert.equal(state.history.length, 2);
  assert.equal(state.history[0].total, 1);
  assert.equal(state.history[0].correct, 1);
  assert.equal(state.records[chosen.id].attempts, 2);
  assert.equal(state.records[chosen.id].correct, 1);
  assert.equal(state.records[chosen.id].wrong, 1);
  assert.equal(state.records[chosen.id].lastCorrect, true);
  assert.deepEqual(state.records['js-window'], records['js-window']);
  assert.deepEqual(filterQuizQuestions(questions, { ...all, status: 'wrong' }, state.records).map(item => item.id), ['js-window']);
});

test('invalid single drills and duplicate IDs leave the entire original state unchanged', () => {
  const state = createQuizSession(createEmptyQuizState(), questions, {
    part: 'javascript', level: 'foundation', mode: 'all',
  }, { id: 'live-session', now: 1000, random: () => 0.4 });
  const options = { id: 'single-invalid', now: 2000, random: () => 0.2 };
  assert.equal(gradeSingleQuiz(state, questions, 'missing-question', 'a', options), state);
  assert.equal(gradeSingleQuiz(state, questions, questions[0].id, 'invalid' as QuizChoiceId, options), state);
  assert.equal(gradeSingleQuiz(state, questions, questions[0].id, 'a', { ...options, now: -1 }), state);
  assert.equal(gradeSingleQuiz(state, questions, questions[0].id, 'a', { ...options, id: '' }), state);
  const graded = gradeSingleQuiz(state, questions, questions[0].id, 'a', options);
  assert.equal(gradeSingleQuiz(graded, questions, questions[0].id, 'd', options), graded);
});
