import type { QuizChoiceId, QuizKind, QuizLevel, QuizPart, QuizQuestion } from '../data/quizzes/types';
import { advanceQuizSession, confirmQuizAnswer, createQuizSession, selectQuizChoice, type QuizRecord, type QuizState } from './quiz';

export type QuizCatalogStatus = 'all' | 'unseen' | 'correct' | 'wrong';
export interface QuizCatalogFilter {
  query: string;
  part: 'all' | QuizPart;
  level: 'all' | QuizLevel;
  kind: 'all' | QuizKind;
  status: QuizCatalogStatus;
}

function normalizeQuery(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Filter the catalog without changing its editorial order or learning records. */
export function filterQuizQuestions(
  questions: readonly QuizQuestion[],
  filter: QuizCatalogFilter,
  records: Readonly<Record<string, QuizRecord>>,
): QuizQuestion[] {
  const query = normalizeQuery(filter.query);
  return questions.filter(question => {
    if (filter.part !== 'all' && question.part !== filter.part) return false;
    if (filter.level !== 'all' && question.level !== filter.level) return false;
    if (filter.kind !== 'all' && question.kind !== filter.kind) return false;
    const record = Object.hasOwn(records, question.id) ? records[question.id] : undefined;
    if (filter.status === 'unseen' && record) return false;
    if (filter.status === 'correct' && record?.lastCorrect !== true) return false;
    if (filter.status === 'wrong' && record?.lastCorrect !== false) return false;
    if (!query) return true;
    const searchable = [
      question.topic, question.prompt, question.code ?? '',
      ...question.choices.map(choice => choice.text), question.explanation, ...question.relatedTermIds,
    ];
    return searchable.some(value => normalizeQuery(value).includes(query));
  });
}

/** Grade a catalog drill while retaining an unrelated five-question session. */
export function gradeSingleQuiz(
  state: QuizState,
  questions: readonly QuizQuestion[],
  questionId: string,
  choiceId: QuizChoiceId,
  options: Parameters<typeof createQuizSession>[3],
): QuizState {
  const question = questions.find(item => item.id === questionId);
  if (!question || !question.choices.some(choice => choice.id === choiceId)
    || state.history.some(summary => summary.id === options.id)) return state;
  let single = createQuizSession(state, [question], {
    part: question.part, level: question.level, mode: 'all',
  }, options);
  if (single === state) return state;
  single = selectQuizChoice(single, choiceId);
  single = confirmQuizAnswer(single, questions, options.now);
  single = advanceQuizSession(single, questions, options.now);
  if (single.session?.status !== 'completed') return state;
  return { ...single, session: state.session };
}
