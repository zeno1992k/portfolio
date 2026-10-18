'use client'

import type { User } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getSupabaseBrowserClient, googleReturnUrl, isSupabaseConfigured } from '../lib/supabase'

const RETURN_PATH_KEY = 'zeno-docs:auth-return-path'

interface AuthValue {
  configured: boolean
  error: string
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  user: User | null
}

const AuthContext = createContext<AuthValue | null>(null)

function cleanAuthParams() {
  const url = new URL(window.location.href)
  const keys = ['code', 'error', 'error_code', 'error_description']
  let changed = false

  keys.forEach((key) => {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  })

  if (url.hash.includes('error')) {
    url.hash = ''
    changed = true
  }

  if (changed) window.history.replaceState(window.history.state, '', url)
}

function restoreReturnPath() {
  const returnPath = window.sessionStorage.getItem(RETURN_PATH_KEY)
  window.sessionStorage.removeItem(RETURN_PATH_KEY)
  if (!returnPath || returnPath === '/') return

  try {
    const target = new URL(returnPath, window.location.origin)
    if (target.origin === window.location.origin) window.location.replace(target.href)
  } catch {
    // 잘못된 로컬 값은 무시하고 현재 페이지를 유지한다.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    const client = getSupabaseBrowserClient()
    if (!client) {
      setLoading(false)
      return
    }

    let active = true
    const returnedFromAuth = new URL(window.location.href).searchParams.has('code')
    let returnPathRestored = false

    function finishAuthReturn(hasSession: boolean) {
      if (!returnedFromAuth || returnPathRestored || !hasSession) return
      returnPathRestored = true
      cleanAuthParams()
      restoreReturnPath()
    }

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setUser(session?.user ?? null)
      setLoading(false)
      finishAuthReturn(Boolean(session?.user))
    })

    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      setUser(data.session?.user ?? null)
      if (sessionError) setError('로그인 정보를 확인하지 못했습니다. 다시 로그인해 주세요.')
      cleanAuthParams()
      setLoading(false)
      finishAuthReturn(Boolean(data.session?.user))
    }).catch(() => {
      if (!active) return
      setError('로그인 정보를 확인하지 못했습니다. 연결 상태를 확인해 주세요.')
      setLoading(false)
    })

    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      client.auth.getSession().then(({ data }) => {
        if (active) setUser(data.session?.user ?? null)
      })
    }

    window.addEventListener('pageshow', handlePageShow)
    return () => {
      active = false
      subscription.unsubscribe()
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const client = getSupabaseBrowserClient()
    if (!client) {
      setError('Supabase 환경 변수가 아직 연결되지 않았습니다.')
      return
    }
    if (!navigator.onLine) {
      setError('Google 로그인에는 인터넷 연결이 필요합니다.')
      return
    }

    setError('')
    setLoading(true)
    window.sessionStorage.setItem(
      RETURN_PATH_KEY,
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    )

    try {
      const { error: loginError } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: { prompt: 'select_account' },
          redirectTo: googleReturnUrl(),
        },
      })
      if (loginError) {
        setError('Google 로그인에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.')
        setLoading(false)
      }
    } catch {
      setError('Google 로그인에 연결하지 못했습니다. 연결 상태를 확인해 주세요.')
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    const client = getSupabaseBrowserClient()
    if (!client) return

    setError('')
    setLoading(true)
    try {
      const { error: logoutError } = await client.auth.signOut({ scope: 'local' })
      if (logoutError) setError('로그아웃하지 못했습니다. 다시 시도해 주세요.')
      else setUser(null)
    } catch {
      setError('로그아웃하지 못했습니다. 연결 상태를 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo<AuthValue>(() => ({
    configured: isSupabaseConfigured,
    error,
    loading,
    signInWithGoogle,
    signOut,
    user,
  }), [error, loading, signInWithGoogle, signOut, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
