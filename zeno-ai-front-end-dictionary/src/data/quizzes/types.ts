import type { Term } from '../terms';
import type { TermLevel } from '../term-levels';

export type QuizPart = 'javascript' | 'react';
export type QuizLevel = TermLevel;
export type QuizKind = 'concept' | 'practical' | 'coding-test';
export type QuizChoiceId = 'a' | 'b' | 'c' | 'd';
export interface QuizChoice { id: QuizChoiceId; text: string; explanation: string }
export interface QuizQuestion {
  id: string;
  part: QuizPart;
  level: QuizLevel;
  kind: QuizKind;
  topic: string;
  prompt: string;
  code?: string;
  codeLanguage?: Term['codeLanguage'];
  choices: [QuizChoice, QuizChoice, QuizChoice, QuizChoice];
  correctChoiceId: QuizChoiceId;
  explanation: string;
  relatedTermIds: string[];
  source: string;
  /** Pure synchronous JavaScript examples only; used by content verification. */
  expectedLogs?: string[];
}
