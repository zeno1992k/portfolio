import { useEffect, useState, useSyncExternalStore } from 'react';
import { LEARNING_CATEGORIES_STORAGE_KEY, LearningCategoriesStore, type LearningCategoriesStorage } from './learning-categories';

function deviceStorage(): LearningCategoriesStorage | null {
  try { return window.localStorage; } catch { return null; }
}

export function useLearningCategories() {
  const [store] = useState(() => new LearningCategoriesStore(deviceStorage()));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LEARNING_CATEGORIES_STORAGE_KEY || event.key === null) store.refreshFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [store]);
  return { ...snapshot, setSelectedGroupIds: store.setSelectedGroupIds, setSelection: store.setSelection };
}
