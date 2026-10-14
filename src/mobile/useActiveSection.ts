import { useEffect, useState } from 'react';
import { MobileSectionId } from './sections';

/** Tracks which section crosses the 40% line and mirrors it into the URL hash (no history entries). */
export function useActiveSection(ids: readonly MobileSectionId[]): MobileSectionId {
  const [active, setActive] = useState<MobileSectionId>(ids[0]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id as MobileSectionId);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);

  useEffect(() => {
    // An open sheet owns the current history entry; don't overwrite it.
    if (window.history.state && window.history.state.mbSheet) return;
    if (window.location.hash !== `#${active}`) window.history.replaceState(null, '', `#${active}`);
  }, [active]);

  return active;
}
