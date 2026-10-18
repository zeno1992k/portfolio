import type { MetadataRoute } from 'next'
import type { PageMapItem } from 'nextra'
import { getPageMap } from 'nextra/page-map'
import { SITE_URL } from './site-url'
import { isVisibleDocumentRoute } from './lib/document-visibility'

export const dynamic = 'force-static'


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
  const routes = collectRoutes(await getPageMap()).filter(isVisibleDocumentRoute)

  return routes.map((route) => ({
    url: new URL(route, SITE_URL).href,
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }))
}
