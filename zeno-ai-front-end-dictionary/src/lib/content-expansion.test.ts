import assert from 'node:assert/strict';
import test from 'node:test';
import { terms } from '../data/terms';
import { quizQuestions } from '../data/quizzes';
import { coverageLanguageTerms } from '../data/coverage-language-terms';
import { coverageReactTerms } from '../data/coverage-react-terms';
import { coveragePlatformTerms } from '../data/coverage-platform-terms';
import { coverageBrowserApiTerms } from '../data/coverage-browser-apis';
import { previousTermIds, previousQuizAnswers } from './content-baseline';
import { readState, type PersistedState } from './study';
import { createEmptyQuizState, createQuizSession, readQuizState, selectQuizChoice } from './quiz';

test('all previous 500 term IDs retain bookmarks, progress and a paused card session', () => {
  assert.equal(previousTermIds.length, 500);
  const state: PersistedState = {
    version: 1, bookmarks: [...previousTermIds],
    progress: Object.fromEntries(previousTermIds.map(id => [id, { dueAt: 10000, interval: 3, reviews: 1, lastRating: 'good', lastReviewedAt: 1000 }])),
    history: previousTermIds.map(id => ({ id, rating: 'good', at: 1000 })),
    session: { ids: previousTermIds.slice(0, 5), index: 2, ratings: ['good', 'good'], revealed: true, startedAt: 1000 },
  };
  assert.deepEqual(readState(state, terms.map(term => term.id)), state);
});

test('all previous 300 quiz IDs and correct choices retain records and the exact paused session', () => {
  assert.equal(previousQuizAnswers.length, 300);
  const questionMap = new Map(quizQuestions.map(question => [question.id, question]));
  for (const previous of previousQuizAnswers) {
    assert.equal(questionMap.get(previous.id)?.correctChoiceId, previous.correctChoiceId, previous.id);
  }
  const previous = previousQuizAnswers.map(question => questionMap.get(question.id)!);
  const records = Object.fromEntries(previous.map((question, index) => [question.id,
    { attempts: 2, correct: 1, wrong: 1, lastCorrect: index % 2 === 0, answeredAt: 1000 }]));
  let state = createQuizSession({ ...createEmptyQuizState(), records }, previous,
    { part: 'javascript', level: 'foundation', mode: 'all' }, { id: 'before-expansion', now: 2000, random: () => 0.4 });
  state = selectQuizChoice(state, 'b');
  assert.deepEqual(readQuizState(JSON.stringify(state), quizQuestions), state);
});

test('the 170 gap-fill cards add substantive interview answers and leave existing IDs intact', () => {
  const added = [...coverageLanguageTerms, ...coverageReactTerms, ...coveragePlatformTerms, ...coverageBrowserApiTerms];
  assert.equal(added.length, 170);
  const previous = new Set<string>(previousTermIds);
  for (const term of added) {
    assert.ok(!previous.has(term.id), term.id);
    assert.ok(term.definition.trim().length >= 40, term.id);
    assert.ok((term.tags?.length ?? 0) >= 2, term.id);
    assert.ok((term.interview?.answer.trim().length ?? 0) >= 60, term.id);
    assert.notEqual(term.interview?.answer, term.definition, term.id);
    assert.ok((term.interview?.question.trim().length ?? 0) >= 10, term.id);
    assert.ok((term.interview?.followUp.trim().length ?? 0) >= 10, term.id);
    assert.doesNotMatch(term.question, /까\?|(?<!요)나\?|생각해 봐/, term.id);
  }
});

test('term-card questions avoid informal question endings', () => {
  for (const term of terms) assert.doesNotMatch(term.question, /까\?|(?<!요)나\?|생각해 봐/, term.id);
});
