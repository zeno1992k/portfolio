import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { transformWithOxc } from 'vite';
import { quizQuestions } from '../data/quizzes';
import { javascriptQuizzes } from '../data/quizzes/javascript';
import { reactQuizzes } from '../data/quizzes/react';
import { terms } from '../data/terms';
import { advanceQuizSession, confirmQuizAnswer, createEmptyQuizState, createQuizSession, readQuizState, selectQuizChoice } from './quiz';
import { formatQuizLogValue } from './quiz-test-output';

test('both quiz parts have seventy complete four-choice questions at each of three levels', () => {
  assert.equal(quizQuestions.length, 420);
  assert.equal(new Set(quizQuestions.map(question => question.id)).size, 420);
  const signatures = quizQuestions.map(question => [question.part, question.prompt.trim(), question.code?.trim() ?? '', ...question.choices.map(choice => choice.text.trim())].join('\n'));
  assert.equal(new Set(signatures).size, 420, 'duplicate questions should not inflate the catalog');
  const termIds = new Set(terms.map(term => term.id));
  for (const part of ['javascript', 'react']) {
    for (const level of ['foundation', 'practical', 'advanced']) {
      assert.equal(quizQuestions.filter(question => question.part === part && question.level === level).length, 70);
    }
  }
  for (const question of quizQuestions) {
    assert.match(question.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(['concept', 'practical', 'coding-test'].includes(question.kind), question.id);
    assert.ok(question.topic.trim() && question.prompt.trim(), question.id);
    assert.deepEqual(question.choices.map(choice => choice.id).sort(), ['a', 'b', 'c', 'd'], question.id);
    assert.equal(new Set(question.choices.map(choice => choice.text.trim())).size, 4, question.id);
    assert.ok(question.choices.some(choice => choice.id === question.correctChoiceId), question.id);
    assert.ok(question.explanation.trim().length >= 40, question.id);
    for (const choice of question.choices) assert.ok(choice.explanation.trim().length >= 12, question.id + ':' + choice.id);
    assert.ok(question.relatedTermIds.length >= 2, question.id);
    for (const id of question.relatedTermIds) assert.ok(termIds.has(id), question.id + ': ' + id);
    assert.equal(new Set(question.relatedTermIds).size, question.relatedTermIds.length, question.id);
    assert.equal(new URL(question.source).protocol, 'https:', question.id);
    if (question.code) assert.ok(question.code.split('\n').length <= 16, question.id);
  }
});

test('quiz code examples parse as the language shown to learners', async () => {
  const extensions = { javascript: 'js', typescript: 'ts', jsx: 'jsx', tsx: 'tsx' };
  for (const question of quizQuestions.filter(question => question.code)) {
    const extension = extensions[question.codeLanguage as keyof typeof extensions];
    assert.ok(extension, question.id + ': code language');
    await assert.doesNotReject(() => transformWithOxc(question.code!, question.id + '.' + extension), question.id);
  }
});

test('adding 360 questions retains records and the exact paused session from the original sixty', () => {
  const original = [...javascriptQuizzes, ...reactQuizzes];
  assert.equal(original.length, 60);
  const previous = reactQuizzes[0];
  let state = createQuizSession(createEmptyQuizState(), [previous], { part: previous.part, level: previous.level, mode: 'all' }, { id: 'original-result', now: 100, random: () => 0.3 });
  state = confirmQuizAnswer(selectQuizChoice(state, previous.correctChoiceId), original, 200);
  state = advanceQuizSession(state, original, 200);
  state = createQuizSession(state, original, { part: 'javascript', level: 'foundation', mode: 'all' }, { id: 'original-session', now: 1000, random: () => 0.3 });
  const first = original.find(question => question.id === state.session!.questionIds[0])!;
  state = confirmQuizAnswer(selectQuizChoice(state, first.correctChoiceId), original, 2000);
  state = advanceQuizSession(state, original, 2000);
  state = selectQuizChoice(state, 'b');
  const restored = readQuizState(JSON.stringify(state), quizQuestions);
  assert.deepEqual(restored, state);
  for (const question of original) assert.ok(quizQuestions.some(current => current.id === question.id));
});

test('runnable synchronous JavaScript examples produce the documented answers', () => {
  const runnable = quizQuestions.filter(question => question.part === 'javascript' && question.expectedLogs);
  assert.ok(runnable.length >= 20, 'output questions should have executable checks');
  for (const question of runnable) {
    const logs: string[] = [];
    runInNewContext(question.code!, {
      console: { log: (...values: unknown[]) => logs.push(values.map(value =>
        formatQuizLogValue(value)).join(' ')) },
    }, { timeout: 1000, filename: question.id + '.js' });
    assert.deepEqual(logs, question.expectedLogs, question.id);
  }
});

test('the nullish question distinguishes each console call and makes the empty string explicit', () => {
  const question = quizQuestions.find(item => item.id === 'js-nullish-or')!;
  assert.equal(question.choices.find(choice => choice.id === question.correctChoiceId)!.text,
    '첫 번째 출력: "" (빈 문자열)\n두 번째 출력: "OK"');
  assert.deepEqual(question.expectedLogs, ['', 'OK']);
  assert.doesNotMatch(question.prompt, /생각해 봐|일까\?/);
  for (const choice of question.choices) {
    assert.ok(choice.text.startsWith('첫 번째 출력: '));
    assert.ok(choice.text.includes('\n두 번째 출력: '));
    assert.ok(!choice.text.includes('→'));
  }
});

test('multiple console calls have separate output labels while a literal arrow inside one log remains intact', () => {
  for (const question of quizQuestions.filter(item => (item.expectedLogs?.length ?? 0) > 1)) {
    const correct = question.choices.find(choice => choice.id === question.correctChoiceId)!;
    assert.ok(correct.text.includes('첫 번째 출력: '), question.id);
    assert.ok(correct.text.includes('\n두 번째 출력: '), question.id);
  }
  const dfs = quizQuestions.find(question => question.id === 'js-extra-practical-36')!;
  assert.ok(dfs.code!.includes('order.join(" → ")'));
  assert.deepEqual(dfs.expectedLogs, ['A → B → D → C']);
});

test('output checks preserve special JavaScript values instead of serializing them as null', () => {
  assert.equal(formatQuizLogValue(NaN), 'NaN');
  assert.equal(formatQuizLogValue(Infinity), 'Infinity');
  assert.equal(formatQuizLogValue(-0), '-0');
  assert.equal(formatQuizLogValue(undefined), 'undefined');
  assert.equal(formatQuizLogValue([undefined, NaN]), '[undefined,NaN]');
  assert.deepEqual(quizQuestions.find(question => question.id === 'js-extra-foundation-12')!.expectedLogs, ['12', 'NaN']);
  assert.deepEqual(quizQuestions.find(question => question.id === 'js-map-return')!.expectedLogs, ['[undefined,undefined]']);
});

test('the event-loop question records four separate logs in browser task order', () => {
  const question = quizQuestions.find(item => item.id === 'js-event-loop-order')!;
  const logs: string[] = [];
  const tasks: (() => void)[] = [];
  runInNewContext(question.code!, {
    console: { log: (value: unknown) => logs.push(formatQuizLogValue(value)) },
    setTimeout: (callback: () => void) => tasks.push(callback),
  }, { timeout: 1000, microtaskMode: 'afterEvaluate' });
  tasks.forEach(callback => callback());
  assert.deepEqual(logs, ['A', 'D', 'B', 'C']);
  const correct = question.choices.find(choice => choice.id === question.correctChoiceId)!;
  assert.equal(correct.text, '첫 번째 출력: A\n두 번째 출력: D\n세 번째 출력: B\n네 번째 출력: C');
});

test('Promise.all and Promise.any examples produce the success values described by their correct choices', { timeout: 1000 }, async () => {
  for (const [id, expected] of [['js-promise-all-order', '["slow","fast"]'], ['js-promise-any', 'B']]) {
    const question = quizQuestions.find(item => item.id === id)!;
    const actual = await new Promise<string>(resolve => {
      runInNewContext(question.code!, {
        console: { log: (value: unknown) => resolve(formatQuizLogValue(value)) },
        setTimeout,
      }, { timeout: 1000 });
    });
    assert.equal(actual, expected, id);
  }
});

test('quiz questions use polite Korean without informal instructions', () => {
  for (const question of quizQuestions) {
    assert.doesNotMatch(question.prompt, /까\?|(?<!요)나\?|생각해 봐|해 봐\./, question.id);
  }
});
