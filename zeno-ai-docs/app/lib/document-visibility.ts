// 메뉴에서 공개 중인 두 과목만 검색 결과와 사이트맵에 포함한다.
const VISIBLE_COURSE_PREFIXES = [
  '/web/javascript/ECMAscript',
  '/web/ui_libraries/tailwind_css',
]

export function isVisibleDocumentRoute(route: string): boolean {
  return route === '/' || VISIBLE_COURSE_PREFIXES.some(
    prefix => route === prefix || route.startsWith(`${prefix}/`),
  )
}
