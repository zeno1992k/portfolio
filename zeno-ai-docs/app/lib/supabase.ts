import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

function hasValidPublicConfig() {
  if (!supabaseKey.startsWith('sb_publishable_')) return false

  try {
    const endpoint = new URL(supabaseUrl)
    const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname)
    return endpoint.protocol === 'https:' || (isLocal && endpoint.protocol === 'http:')
  } catch {
    return false
  }
}

export const isSupabaseConfigured = hasValidPublicConfig()

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured || typeof window === 'undefined') return null
  if (browserClient) return browserClient

  try {
    browserClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true,
        storageKey: 'zeno-docs:auth',
      },
    })

    return browserClient
  } catch {
    return null
  }
}

export function googleReturnUrl(): string {
  return new URL('/', window.location.origin).href
}
