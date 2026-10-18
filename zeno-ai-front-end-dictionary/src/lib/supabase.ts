import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function createBrowserClient(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key?.startsWith('sb_publishable_')) return null;
  try {
    const endpoint = new URL(url);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname);
    if (endpoint.protocol !== 'https:' && !(local && endpoint.protocol === 'http:')) return null;
    return createClient(url, key, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'commute-frontend-auth-v1',
      },
    });
  } catch {
    return null;
  }
}

// Only the project's browser-safe publishable key belongs in a VITE variable.
// The Google client secret and Supabase service-role key are never sent here.
export const supabase = createBrowserClient();

export function googleReturnUrl(): string {
  const url = new URL(import.meta.env.BASE_URL, window.location.href);
  url.search = '';
  url.hash = '';
  return url.href;
}
