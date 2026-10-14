// useHashSync.ts — URL hash follows the universe; Back/Forward and hash links travel
import { useEffect } from 'react';
import { hashFor, stepForHash, universeOf } from './journey';
import { SETTLE_MS, useJourney } from './store';

export function useHashSync(): void {
  useEffect(() => {
    // A Back/Forward that arrives mid-move is remembered and travelled to once the camera settles.
    let pending: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = useJourney.subscribe((s, prev) => {
      if (prev.moving && !s.moving) {
        if (pending !== null) {
          const target = pending;
          pending = null;
          clearTimeout(timer);
          timer = setTimeout(() => useJourney.getState().jump(target), SETTLE_MS);
          return;
        }
        const h = hashFor(s.step);
        if (window.location.hash !== h) window.history.pushState(null, '', h);
      }
    });
    const onNav = () => {
      const target = stepForHash(window.location.hash);
      const s = useJourney.getState();
      if (target === null || universeOf(target) === universeOf(s.step)) {
        pending = null;
        return;
      }
      if (s.moving) {
        pending = target; // picked up by the arrive subscription above
        return;
      }
      const settleLeft = SETTLE_MS - (performance.now() - s.arrivedAt);
      if (settleLeft > 0) {
        // already arrived but still settling: no further arrival will fire, so wait out the rest
        clearTimeout(timer);
        timer = setTimeout(() => useJourney.getState().jump(target), settleLeft + 16);
      } else {
        s.jump(target);
      }
    };
    window.addEventListener('popstate', onNav);
    window.addEventListener('hashchange', onNav);
    return () => {
      unsubscribe();
      clearTimeout(timer);
      window.removeEventListener('popstate', onNav);
      window.removeEventListener('hashchange', onNav);
    };
  }, []);
}
