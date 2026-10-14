// useHashSync.ts — URL hash follows the universe; Back/Forward and hash links travel
import { useEffect } from 'react';
import { hashFor, stepForHash, universeOf } from './journey';
import { useJourney } from './store';

export function useHashSync(): void {
  useEffect(() => {
    const unsubscribe = useJourney.subscribe((s, prev) => {
      if (prev.moving && !s.moving) {
        const h = hashFor(s.step);
        if (window.location.hash !== h) window.history.pushState(null, '', h);
      }
    });
    const onNav = () => {
      const target = stepForHash(window.location.hash);
      const s = useJourney.getState();
      if (target !== null && universeOf(target) !== universeOf(s.step)) s.jump(target);
    };
    window.addEventListener('popstate', onNav);
    window.addEventListener('hashchange', onNav);
    return () => {
      unsubscribe();
      window.removeEventListener('popstate', onNav);
      window.removeEventListener('hashchange', onNav);
    };
  }, []);
}
