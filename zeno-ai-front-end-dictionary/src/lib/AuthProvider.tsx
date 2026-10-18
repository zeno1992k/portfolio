import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { googleReturnUrl, supabase } from './supabase';

interface AuthValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  error: string;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState('');

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;
    let authRevision = 0;
    const currentUrl = new URL(window.location.href);
    const returnedCode = currentUrl.searchParams.has('code');
    // This callback stays synchronous: awaiting Auth methods inside it can deadlock.
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      authRevision += 1;
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const revisionAtRead = authRevision;
    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (authRevision === revisionAtRead) setUser(data.session?.user ?? null);
      const callbackStillPending = returnedCode && new URL(window.location.href).searchParams.has('code');
      if (sessionError || callbackStillPending || (returnedCode && !data.session)) setError('로그인을 마치지 못했어요. 다시 구글로 로그인해 주세요.');
      if (returnedCode) {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('code');
        window.history.replaceState(window.history.state, '', cleanUrl);
      }
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setError('로그인 정보를 확인하지 못했어요. 연결 상태를 확인해 주세요.');
      setLoading(false);
    });
    if (currentUrl.searchParams.has('error') || new URLSearchParams(currentUrl.hash.slice(1)).has('error')) {
      setError('구글 로그인을 마치지 못했어요. 다시 시도해 주세요.');
      ['error', 'error_code', 'error_description'].forEach((key) => currentUrl.searchParams.delete(key));
      currentUrl.hash = '';
      window.history.replaceState(window.history.state, '', currentUrl);
    }
    const restorePage = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      // Safari can restore the pre-redirect page with an old account/loading state.
      setLoading(true);
      const revision = authRevision;
      client.auth.getSession().then(({ data, error: restoreError }) => {
        if (!active) return;
        if (authRevision === revision) setUser(data.session?.user ?? null);
        if (restoreError) setError('로그인 정보를 확인하지 못했어요. 다시 로그인해 주세요.');
        setLoading(false);
      }).catch(() => {
        if (!active) return;
        setError('로그인 정보를 확인하지 못했어요. 연결 상태를 확인해 주세요.');
        setLoading(false);
      });
    };
    window.addEventListener('pageshow', restorePage);
    return () => { active = false; subscription.unsubscribe(); window.removeEventListener('pageshow', restorePage); };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      setError('로그인을 준비하고 있어요. 지금은 기기에 기록을 저장할 수 있어요.');
      return;
    }
    if (!navigator.onLine) {
      setError('로그인하려면 인터넷 연결이 필요해요. 학습은 계속할 수 있어요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { error: loginError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: googleReturnUrl(), queryParams: { prompt: 'select_account' } },
      });
      if (loginError) {
        setError('구글 로그인에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.');
        setLoading(false);
      }
    } catch {
      setError('구글 로그인에 연결하지 못했어요. 연결 상태를 확인해 주세요.');
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    setError('');
    setLoading(true);
    try {
      const { error: logoutError } = await supabase.auth.signOut({ scope: 'local' });
      if (logoutError) setError('로그아웃을 마치지 못했어요. 다시 시도해 주세요.');
      else setUser(null);
    } catch {
      setError('로그아웃을 마치지 못했어요. 연결 상태를 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  return <AuthContext.Provider value={{ user, loading, configured: !!supabase, error, signInWithGoogle, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth requires AuthProvider');
  return value;
}
