import { useCallback, useEffect, useRef, useState } from 'react';
import { Page } from './types';

export type Route = Page;

export const VALID_ROUTES: Route[] = ['vault', 'transfers', 'crypto', 'market', 'ledger', 'profile'];

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return (VALID_ROUTES as string[]).includes(hash) ? (hash as Route) : 'vault';
}

export interface HashRoute {
  route: Route;
  navigate: (route: Route) => void;
  /** Go back to the previous in-app page, or to `fallback` when there is none. */
  back: (fallback: Route) => void;
}

/**
 * Dependency-free hash router: `#/vault`, `#/transfers`, … Each `navigate`
 * pushes a history entry (so the browser back button works) and records the
 * previous page in an in-app stack so back buttons follow real navigation
 * order instead of hardcoded targets.
 */
export function useHashRoute(): HashRoute {
  const [route, setRoute] = useState<Route>(() => parseHash());
  const stackRef = useRef<Route[]>([]);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash();
      setRoute(next);
      // Browser back: the previous page is back on top of the stack — pop it.
      if (stackRef.current[stackRef.current.length - 1] === next) {
        stackRef.current.pop();
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    if (next === parseHash()) return;
    stackRef.current = [...stackRef.current, parseHash()];
    window.location.hash = `/${next}`;
    setRoute(next);
  }, []);

  const back = useCallback((fallback: Route) => {
    const previous = stackRef.current.pop();
    const target: Route = previous && previous !== parseHash() ? previous : fallback;
    window.location.hash = `/${target}`;
    setRoute(target);
  }, []);

  return { route, navigate, back };
}
