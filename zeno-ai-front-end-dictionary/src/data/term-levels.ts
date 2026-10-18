export const termLevels = [
  { id: 'foundation', label: '기초', description: '처음 익히는 언어·웹·앱 개발의 기본' },
  { id: 'practical', label: '실무', description: '실제 앱에서 쓰는 메서드·API·개발 방식' },
  { id: 'advanced', label: '심화', description: '동작 원리와 복잡한 상황을 다루는 개념' },
] as const;

export type TermLevel = (typeof termLevels)[number]['id'];
export type LearningLevel = TermLevel | 'all';

export const termKinds = [
  { id: 'concept', label: '개념' },
  { id: 'syntax', label: '문법·메서드' },
  { id: 'api', label: 'API' },
  { id: 'tool', label: '도구' },
] as const;

export type TermKind = (typeof termKinds)[number]['id'];

export function getTermLevel(id: TermLevel) {
  return termLevels.find(level => level.id === id)!;
}

export function getTermKind(id: TermKind) {
  return termKinds.find(kind => kind.id === id)!;
}

export function learningLevelLabel(level: LearningLevel) {
  return level === 'all' ? '기초부터' : getTermLevel(level).label;
}
