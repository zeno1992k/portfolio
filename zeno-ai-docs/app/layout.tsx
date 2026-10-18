import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Layout } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { PageMapItem } from 'nextra'
import { AiStudyAssistant } from './components/ai-study-assistant'
import { AuthProvider } from './components/auth-provider'
import { CopyAttribution } from './components/copy-attribution'
import { DocsNavbar } from './components/docs-navbar'
import { ReadStatusSidebarMarks } from './components/read-status'
import '@montage-ui/core/theme.css'
import 'nextra-theme-docs/style.css'
import 'katex/dist/katex.min.css'
import './globals.css'
import { SITE_URL } from './site-url'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Zeno AI Docs',
    template: '%s | Zeno Docs',
  },
  description:
    '웹 개발 기술을 공부하며 정리하는 개인 아카이브 공간입니다. JavaScript와 React를 중심으로 학습 내용을 기록하고, 관심있는 공부 자료도 함께 정리합니다.',
  openGraph: {
    type: 'website',
    siteName: 'Zeno Docs',
    title: 'Zeno Docs',
    description:
      '웹 개발 기술을 공부하며 정리하는 개인 아카이브 공간입니다. JavaScript와 React를 중심으로 학습 내용을 기록하고, 관심있는 공부 자료도 함께 정리합니다.',
    url: SITE_URL,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zeno Docs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zeno AI Docs',
    description:
      '웹 개발 기술을 공부하며 정리하는 개인 아카이브 공간입니다. JavaScript와 React를 중심으로 학습 내용을 기록하고, 관심있는 공부 자료도 함께 정리합니다.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

function encodePageMapRoutes(pageMap: PageMapItem[]): PageMapItem[] {
  return pageMap.map((item) => {
    const route =
      'route' in item && typeof item.route === 'string'
        ? encodeURI(item.route)
        : undefined

    if ('children' in item) {
      return {
        ...item,
        ...(route && { route }),
        children: encodePageMapRoutes(item.children),
      }
    }

    return route ? { ...item, route } : item
  })
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const pageMap = encodePageMapRoutes(await getPageMap())

  return (
    <html lang="ko" dir="ltr" suppressHydrationWarning>
      <Head
        color={{
          hue: 216,
          saturation: { light: 100, dark: 100 },
          lightness: { light: 50, dark: 68 },
        }}
      />
      <body>
        <AuthProvider>
          <Layout
            navbar={<DocsNavbar key="docs-navbar" pageMap={pageMap} />}
            pageMap={pageMap}
            sidebar={{ autoCollapse: true, defaultMenuCollapseLevel: 1 }}
            feedback={{ content: null }}
            editLink={null}
          >
            <CopyAttribution />
            <AiStudyAssistant />
            <ReadStatusSidebarMarks />
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  )
}
