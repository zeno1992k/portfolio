import type { MetadataRoute } from 'next'
import type { PageMapItem } from 'nextra'
import { getPageMap } from 'nextra/page-map'
import { SITE_URL } from './site-url'

export const dynamic = 'force-static'


// 테스트 문서만 있는 과목은 검색 엔진에 알리지 않는다.
const HIDDEN_ROUTE_PREFIXES = ['/web/nextjs', '/web/ui_libraries']

function collectRoutes(items: PageMapItem[]): string[] {
  return items.flatMap((item) => {
    if ('children' in item) return collectRoutes(item.children)

    if ('route' in item && typeof item.route === 'string') {
      return [item.route]
    }

    return []
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = collectRoutes(await getPageMap()).filter(
    (route) => !HIDDEN_ROUTE_PREFIXES.some((prefix) => route.startsWith(prefix)),
  )

  return routes.map((route) => ({
    url: new URL(route, SITE_URL).href,
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }))
}