import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { quizQuestions } from '../data/quizzes';

test('React includes code and fill-in exercises at every level while retaining conceptual questions', () => {
  const react = quizQuestions.filter(question => question.part === 'react');
  assert.equal(react.length, 210);
  assert.equal(react.filter(question => question.code).length, 125);
  assert.equal(react.filter(question => !question.code).length, 85);
  for (const [level, count] of [['foundation', 44], ['practical', 41], ['advanced', 40]] as const) {
    const questions = react.filter(question => question.level === level);
    assert.equal(questions.filter(question => question.code).length, count, level);
    const blanks = questions.filter(question => question.code?.includes('__BLANK__'));
    assert.ok(blanks.length >= 10, level + ': meaningful fill-in coverage');
    for (const question of blanks) assert.match(question.prompt, /빈칸/, question.id);
  }
});

test('code enhancements retain all 420 question IDs and answer IDs from the deployed catalog', () => {
  // Baseline: production commit 93328be, captured before these code edits.
  // Persisted sessions identify both questions and choices by these IDs.
  const signature = JSON.stringify(quizQuestions.map(q => [q.id, q.correctChoiceId]).sort((a, b) => a[0].localeCompare(b[0])));
  assert.equal(createHash('sha256').update(signature).digest('hex'), '00576ddf8065f0deb3174c4f1ed609f840d6f6c818f6d9939913dec43203620b');
});

test('the coordinate state question includes the event code whose structure is being improved', () => {
  const question = quizQuestions.find(question => question.id === 'react-extra-group-related-coordinate')!;
  assert.equal(question.codeLanguage, 'jsx');
  assert.match(question.code!, /onPointerMove/);
  assert.match(question.code!, /setX\(/);
  assert.match(question.code!, /setY\(/);
  assert.match(question.choices.find(choice => choice.id === question.correctChoiceId)!.text, /position/);
});
