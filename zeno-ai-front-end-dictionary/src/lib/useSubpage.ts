import { useCallback, useEffect, useState } from 'react';

export type Subpage = { kind: 'term'; termId: string } | { kind: 'categories' } | null;

function readSubpage(hash: string, validTermIds: readonly string[]): Subpage {
  if (hash === '#learning-categories') return { kind: 'categories' };
  if (!hash.startsWith('#term/')) return null;
  try {
    const termId = decodeURIComponent(hash.slice(6));
    return validTermIds.includes(termId) ? { kind: 'term', termId } : null;
  } catch {
    return null;
  }
}

export function useSubpage(validTermIds: readonly string[]) {
  const [subpage, setSubpage] = useState(() => readSubpage(window.location.hash, validTermIds));

  useEffect(() => {
    const update = () => setSubpage(readSubpage(window.location.hash, validTermIds));
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', update);
    };
  }, [validTermIds]);

  const openSubpage = useCallback((next: Exclude<Subpage, null>) => {
    const url = new URL(window.location.href);
    url.hash = next.kind === 'categories' ? 'learning-categories' : `term/${encodeURIComponent(next.termId)}`;
    window.history.pushState({ commuteFrontendSubpage: true }, '', url);
    setSubpage(next);
  }, []);

  const closeSubpage = useCallback(() => {
    if (window.history.state?.commuteFrontendSubpage) {
      window.history.back();
    } else {
      const url = new URL(window.location.href);
      url.hash = '';
      window.history.replaceState(window.history.state, '', url);
      setSubpage(null);
    }
  }, []);

  return { subpage, openSubpage, closeSubpage };
}
