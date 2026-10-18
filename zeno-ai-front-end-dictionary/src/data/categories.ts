export const categoryGroups = [
  { id: 'web-basics', label: '웹 기본기', initial: 'Web', description: 'HTML · CSS · JavaScript · TypeScript' },
  { id: 'browser-network', label: '브라우저·통신', initial: 'Net', description: '브라우저 · HTTP · API·백엔드 기초' },
  { id: 'react-app', label: 'React·앱 개발', initial: 'Re', description: 'React · Next.js · 상태관리 · 폼 · 앱 구조' },
  { id: 'ui-experience', label: 'UI·사용성', initial: 'UI', description: '스타일링 · UI 컴포넌트 · 접근성 · 디자인 시스템' },
  { id: 'quality', label: '품질·성능', initial: 'QA', description: '테스트 · 성능 · 보안 · 에러 처리' },
  { id: 'collaboration', label: '협업·운영', initial: 'Ops', description: 'Git · CI/CD · 배포 · 모니터링' },
  { id: 'cs', label: 'CS·코딩테스트', initial: 'CS', description: '자료구조 · 알고리즘 · CS 기초' },
] as const;

export const categories = [
  { id: 'html', label: 'HTML', groupId: 'web-basics' },
  { id: 'css', label: 'CSS', groupId: 'web-basics' },
  { id: 'javascript', label: 'JavaScript', groupId: 'web-basics' },
  { id: 'typescript', label: 'TypeScript', groupId: 'web-basics' },
  { id: 'browser', label: '브라우저', groupId: 'browser-network' },
  { id: 'http', label: 'HTTP·네트워크', groupId: 'browser-network' },
  { id: 'api-backend', label: 'API·백엔드 기초', groupId: 'browser-network' },
  { id: 'react', label: 'React', groupId: 'react-app' },
  { id: 'nextjs', label: 'Next.js', groupId: 'react-app' },
  { id: 'server-state', label: '서버 상태', groupId: 'react-app' },
  { id: 'client-state', label: '클라이언트 상태', groupId: 'react-app' },
  { id: 'forms', label: '폼·검증', groupId: 'react-app' },
  { id: 'architecture', label: '앱 구조', groupId: 'react-app' },
  { id: 'styling', label: '스타일링 도구', groupId: 'ui-experience' },
  { id: 'ui-components', label: 'UI 컴포넌트', groupId: 'ui-experience' },
  { id: 'accessibility', label: '웹 접근성', groupId: 'ui-experience' },
  { id: 'design-system', label: '디자인 시스템', groupId: 'ui-experience' },
  { id: 'testing', label: '테스트', groupId: 'quality' },
  { id: 'performance', label: '성능 최적화', groupId: 'quality' },
  { id: 'security', label: '보안', groupId: 'quality' },
  { id: 'error-handling', label: '에러 처리', groupId: 'quality' },
  { id: 'git', label: 'Git·코드 리뷰', groupId: 'collaboration' },
  { id: 'ci-cd', label: 'CI/CD', groupId: 'collaboration' },
  { id: 'deployment', label: '배포·환경 설정', groupId: 'collaboration' },
  { id: 'monitoring', label: '모니터링', groupId: 'collaboration' },
  { id: 'cs', label: '자료구조·알고리즘·CS', groupId: 'cs' },
] as const;

export type Category = (typeof categories)[number]['id'];
export type CategoryGroupId = (typeof categoryGroups)[number]['id'];

export function getCategory(id: Category) {
  return categories.find((category) => category.id === id)!;
}

export function getCategoryGroup(id: CategoryGroupId) {
  return categoryGroups.find((group) => group.id === id)!;
}

export function categoriesInGroup(groupId: CategoryGroupId | 'all') {
  return categories.filter((category) => groupId === 'all' || category.groupId === groupId);
}
