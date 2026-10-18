'use client'

import { CacheProvider, createCache, ThemeProvider } from '@montage-ui/engine'
import { useTheme } from 'next-themes'
import { useEffect, type ReactNode } from 'react'

const montageCache = createCache({ key: 'zeno-montage', prepend: true })

export function MontageScope({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme()
  const montageTheme = resolvedTheme === 'dark' ? 'dark' : 'light'

  useEffect(() => {
    document.documentElement.dataset.theme = montageTheme
  }, [montageTheme])

  return (
    <CacheProvider value={montageCache}>
      <ThemeProvider theme={montageTheme}>
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
