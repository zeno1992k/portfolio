import assert from 'node:assert/strict';
import test from 'node:test';
import React, { type ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider } from '@montage-ui/core';
import { QuizQuestionCard } from '../components/QuizTab';
import { QuizCatalog, QuizCatalogList } from '../components/QuizCatalog';
import type { QuizQuestion } from '../data/quizzes/types';
import { javascriptQuizzes } from '../data/quizzes/javascript';
import { CodeExample } from '../components/CodeExample';

const question: QuizQuestion = {
  id: 'ui-fixture',
  part: 'javascript',
  level: 'foundation',
  kind: 'practical',
  topic: '배열 반환값',
  prompt: '이 함수의 반환값으로 올바른 것은 무엇인가요?',
  choices: [
    { id: 'a', text: '새 배열', explanation: '새 배열을 반환하므로 원본과 구별할 수 있어요.' },
    { id: 'b', text: '원본 배열', explanation: '원본 배열은 이 함수의 반환값이 아니에요.' },
    { id: 'c', text: 'undefined', explanation: '반환값이 없는 함수와 구별해야 해요.' },
    { id: 'd', text: '배열 길이', explanation: '숫자를 반환하는 메서드와 구별해야 해요.' },
  ],
  correctChoiceId: 'a',
  explanation: '콜백 결과로 새 배열이 만들어지고 원본 배열은 유지돼요.',
  relatedTermIds: [],
  source: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map',
};

function renderCard(overrides: Partial<ComponentProps<typeof QuizQuestionCard>> = {}): string {
  return renderToStaticMarkup(React.createElement(ThemeProvider, { disableDefaultGlobalStyle: true },
    React.createElement(QuizQuestionCard, {
      question,
      orderedChoiceIds: ['d', 'b', 'a', 'c'],
      selectedChoiceId: null,
      answer: null,
      position: 1,
      total: 5,
      onChoose: () => {},
      onConfirm: () => {},
      onNext: () => {},
      onTerm: () => {},
      ...overrides,
    })));
}

function radioButtons(markup: string): string[] {
  return [...markup.matchAll(/<button\b[^>]*\brole="radio"[^>]*>/g)].map(match => match[0]);
}

test('a quiz question renders four named radio choices under its accessible question label', () => {
  const markup = renderCard();
  const radios = radioButtons(markup);
  assert.equal(radios.length, 4);
  const group = markup.match(/<[a-z]+\b[^>]*\brole="radiogroup"[^>]*>/)?.[0];
  assert.ok(group);
  const questionLabelId = group.match(/aria-labelledby="([^"]+)"/)?.[1];
  assert.ok(questionLabelId);
  assert.ok(markup.includes(`id="${questionLabelId}"`));
  assert.ok(markup.includes(question.prompt));
  for (const choice of question.choices) {
    assert.ok(markup.includes(choice.text));
    const radio = radios.find(button => button.includes(`value="${choice.id}"`));
    assert.ok(radio, `choice ${choice.id} can be selected`);
    assert.match(radio, /aria-labelledby="[^"]+"/);
    const labelId = radio.match(/aria-labelledby="([^"]+)"/)![1];
    assert.ok(markup.includes(`id="${labelId}"`), `choice ${choice.id} has a label`);
    assert.doesNotMatch(radio, /aria-disabled="true"/);
  }
});

test('separate console outputs remain readable in choices, the correct answer and every explanation heading', () => {
  const outputQuestion = javascriptQuizzes.find(item => item.id === 'js-nullish-or')!;
  const markup = renderCard({
    question: outputQuestion, orderedChoiceIds: ['a', 'b', 'c', 'd'], selectedChoiceId: 'a',
    answer: { choiceId: 'a', correct: true, answeredAt: 1000 },
  });
  assert.ok(markup.includes('첫 번째 출력: &quot;&quot; (빈 문자열)\n두 번째 출력: &quot;OK&quot;'));
  assert.ok(markup.includes('class="quiz-choice-text'));
  assert.ok(markup.includes('quiz-choice-explanation-title'));
  assert.ok(!markup.includes('→'));
});

test('selecting a choice does not reveal correctness or explanations before confirmation', () => {
  const markup = renderCard({ selectedChoiceId: 'c' });
  const selected = radioButtons(markup).find(button => button.includes('value="c"'))!;
  assert.match(selected, /aria-checked="true"/);
  assert.ok(markup.includes('정답 확인하기'));
  assert.ok(!markup.includes(question.explanation));
  for (const choice of question.choices) assert.ok(!markup.includes(choice.explanation));
  assert.ok(!markup.includes('정답과 해설'));
  assert.ok(!markup.includes('다음 문제'));
});

test('a JSX fill-in question shows an accessible blank while preserving code highlighting and hiding the answer', () => {
  const fillInQuestion: QuizQuestion = {
    ...question, part: 'react', codeLanguage: 'jsx',
    prompt: '클릭했을 때 저장하도록 빈칸에 들어갈 코드를 고르세요.',
    code: 'function SaveButton({ save }) {\n  return <button onClick={__BLANK__}>저장</button>;\n}',
  };
  const markup = renderCard({ question: fillInQuestion });
  assert.match(markup, /class="code-blank"/);
  assert.match(markup, /class="code-blank-label">빈칸<\/span>/);
  assert.match(markup, /aria-hidden="true">____<\/span>/);
  assert.match(markup, /class="token /);
  assert.ok(!markup.includes('__BLANK__'));
  assert.ok(!markup.includes(question.explanation));
  assert.ok(markup.includes('data-language="jsx"'));
  assert.ok(markup.includes('빈칸 채우기'));
});

test('normal code examples preserve marker-looking source text unless explicitly rendering a worksheet', () => {
  const code = 'const __BLANK__ = "원문";';
  const markup = renderToStaticMarkup(React.createElement(CodeExample, { code, language: 'javascript' }));
  assert.ok(markup.includes('__BLANK__'));
  assert.ok(!markup.includes('class="code-blank"'));
});

test('catalog rows identify fill-in, code-reading and conceptual questions without showing solutions', () => {
  const fillIn: QuizQuestion = { ...question, id: 'fill-in', code: 'const next = __BLANK__;', codeLanguage: 'javascript' };
  const codeReading: QuizQuestion = { ...question, id: 'code-reading', code: 'const next = 1;', codeLanguage: 'javascript' };
  const conceptual: QuizQuestion = { ...question, id: 'conceptual' };
  const markup = renderToStaticMarkup(React.createElement(ThemeProvider, { disableDefaultGlobalStyle: true },
    React.createElement(QuizCatalogList, { questions: [fillIn, codeReading, conceptual], records: {}, onOpen: () => {} })));
  assert.equal((markup.match(/빈칸 채우기/g) ?? []).length, 1);
  assert.equal((markup.match(/코드 읽기/g) ?? []).length, 1);
  assert.ok(!markup.includes('__BLANK__'));
  assert.ok(!markup.includes(question.explanation));
});

test('a checked wrong answer locks every choice and exposes its explanation and next step', () => {
  const markup = renderCard({ selectedChoiceId: 'c', answer: { choiceId: 'c', correct: false, answeredAt: 1000 } });
  const radios = radioButtons(markup);
  assert.equal(radios.length, 4);
  for (const radio of radios) {
    assert.match(radio, /aria-disabled="true"/);
    assert.match(radio, /\sdisabled(?:=""|\s|>)/);
  }
  assert.ok(markup.includes(question.explanation));
  assert.ok(markup.includes(question.choices[2].explanation));
  assert.ok(markup.includes('고른 답이 다른 이유'));
  assert.ok(markup.includes('다음 문제'));
  assert.ok(!markup.includes('정답 확인하기'));
});

test('the answer letter follows the shuffled display order while the correct choice ID stays unchanged', () => {
  const markup = renderCard({ selectedChoiceId: 'c', answer: { choiceId: 'c', correct: false, answeredAt: 1000 } });
  assert.ok(markup.includes('정답 C · 새 배열'));
  assert.ok(!markup.includes('정답 A · 새 배열'));
  assert.equal(question.correctChoiceId, 'a');
});

test('a correct final answer offers results without displaying an incorrect-answer warning', () => {
  const markup = renderCard({
    selectedChoiceId: 'a', answer: { choiceId: 'a', correct: true, answeredAt: 1000 }, position: 5,
  });
  assert.ok(markup.includes('맞았어요!'));
  assert.ok(markup.includes('결과 보기'));
  assert.ok(!markup.includes('다음 문제'));
  assert.ok(!markup.includes('고른 답이 다른 이유'));
});

test('the complete catalog offers search and every filter and access beyond the first thirty previews', () => {
  const questions = Array.from({ length: 31 }, (_, index) => ({ ...question, id: 'list-' + index, topic: '주제 ' + index }));
  const markup = renderToStaticMarkup(React.createElement(ThemeProvider, { disableDefaultGlobalStyle: true }, React.createElement(QuizCatalog, { questions, records: {}, onOpen: () => {} })));
  for (const label of ['전체 퀴즈 목록', '퀴즈 주제 또는 코드 검색', '전체 퀴즈 난도 필터', '퀴즈 유형', '풀이 기록']) assert.ok(markup.includes(label));
  assert.ok(markup.includes('전체 31문제'));
  for (const item of questions.slice(0, 30)) assert.ok(markup.includes('id="quiz-catalog-' + item.id + '"'));
  assert.ok(!markup.includes('id="quiz-catalog-list-30"'));
  assert.ok(markup.includes('문제 더 보기'));
  assert.ok(markup.includes('30 / 31'));
  assert.ok(!markup.includes(question.explanation));
});

test('the catalog shows question previews and latest status without exposing answers or explanations', () => {
  const questions = [question, { ...question, id: 'ui-correct', topic: '맞힌 주제' }, { ...question, id: 'ui-wrong', topic: '틀린 주제' }];
  const markup = renderToStaticMarkup(React.createElement(ThemeProvider, { disableDefaultGlobalStyle: true }, React.createElement(QuizCatalogList, {
    questions,
    records: {
      'ui-correct': { attempts: 1, correct: 1, wrong: 0, lastCorrect: true, answeredAt: 1000 },
      'ui-wrong': { attempts: 1, correct: 0, wrong: 1, lastCorrect: false, answeredAt: 1000 },
    },
    onOpen: () => {},
  })));
  for (const item of questions) {
    assert.ok(markup.includes(item.topic));
    assert.ok(markup.includes(item.prompt));
    assert.ok(markup.includes('id="quiz-catalog-' + item.id + '"'));
  }
  for (const label of ['미풀이', '맞힌 문제', '틀린 문제']) assert.ok(markup.includes(label));
  assert.ok(!markup.includes(question.explanation));
  for (const choice of question.choices) assert.ok(!markup.includes(choice.explanation));
});
