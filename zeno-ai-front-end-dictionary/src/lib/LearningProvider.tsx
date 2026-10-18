import {
  createContext, useContext, useEffect, useLayoutEffect, useMemo, useState,
  useSyncExternalStore, type ReactNode, type SetStateAction,
} from 'react';
import { terms } from '../data/terms';
import { useAuth } from './AuthProvider';
import { supabase } from './supabase';
import { emptyState, type PersistedState } from './study';
import { readCommutePlan, type CommutePlan } from './review-plan';
import { LearningStore, type LearningSnapshot, type StorageLike } from './learning-store';
import { createLearningRemote } from './learning-remote';

interface LearningValue extends Omit<LearningSnapshot, 'ownerId'> {
  setData: (update: SetStateAction<PersistedState>) => Promise<void>;
  savePlan: (plan: CommutePlan) => boolean;
  retrySync: () => Promise<void>;
}
const LearningContext = createContext<LearningValue | null>(null);

function browserStorage(): StorageLike | null {
  try { return window.localStorage; } catch { return null; }
}
export function LearningProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const ownerId = auth.user?.id ?? null;
  const [store] = useState(() => new LearningStore({
    validIds: terms.map(term => term.id), storage: browserStorage(), remote: supabase ? createLearningRemote(supabase) : null,
    online: () => navigator.onLine,
    lock: navigator.locks ? (name, work) => navigator.locks.request(name, work) : undefined,
  }));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  useLayoutEffect(() => { store.activate(ownerId, auth.loading); }, [store, ownerId, auth.loading]);
  useEffect(() => {
    const online = () => { void store.retrySync(); };
    const storage = (event: StorageEvent) => store.storageChanged(event.key);
    window.addEventListener('online', online);
    window.addEventListener('offline', online);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', online); window.removeEventListener('storage', storage); store.stop(); };
  }, [store]);
  const value = useMemo<LearningValue>(() => {
    const ready = !auth.loading && snapshot.ownerId === ownerId;
    const safe = ready ? snapshot : {
      data: emptyState(), plan: readCommutePlan(null), storageIssue: '', issue: '', syncStatus: 'loading' as const, syncError: '',
    };
    return {
      ...safe,
      setData: update => ready && store.getSnapshot().ownerId === ownerId ? store.setData(update) : Promise.resolve(),
      savePlan: plan => ready && store.getSnapshot().ownerId === ownerId ? store.savePlan(plan) : false,
      retrySync: store.retrySync,
    };
  }, [snapshot, ownerId, auth.loading, store]);
  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning(): LearningValue {
  const value = useContext(LearningContext);
  if (!value) throw new Error('useLearning requires LearningProvider');
  return value;
}
