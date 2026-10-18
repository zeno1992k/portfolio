import { javascriptQuizzes } from './javascript';
import { reactQuizzes } from './react';
import { javascriptExtraQuizzes } from './javascript-extra';
import { reactExtraQuizzes } from './react-extra';
import { javascriptCoverageQuizzes } from './javascript-coverage';
import { reactCoverageQuizzes } from './react-coverage';
import type { QuizQuestion } from './types';

const levelOrder = { foundation: 0, practical: 1, advanced: 2 };
export const quizQuestions: QuizQuestion[] = [...javascriptQuizzes, ...javascriptExtraQuizzes, ...javascriptCoverageQuizzes, ...reactQuizzes, ...reactExtraQuizzes, ...reactCoverageQuizzes]
  .sort((left, right) => left.part === right.part ? levelOrder[left.level] - levelOrder[right.level] : left.part === 'javascript' ? -1 : 1);
export const quizParts = [
  { id: 'javascript', label: 'JavaScript', description: '언어 기본기, 실무 코드, 코딩테스트 패턴' },
  { id: 'react', label: 'React', description: '컴포넌트, 상태 관리, 실제 앱의 동작' },
] as const;
export const quizKindLabels = { concept: '개념', practical: '실무', 'coding-test': '코딩테스트' } as const;
