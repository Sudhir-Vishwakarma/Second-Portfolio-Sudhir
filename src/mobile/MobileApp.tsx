import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MOBILE_SECTIONS, MobileSectionId, sectionForHash } from './sections';
import { SECTION_COMPONENTS } from './sections/registry';
import { useActiveSection } from './useActiveSection';
import { useReducedMotion } from './useReducedMotion';
import { useReveal } from './useReveal';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SpaceCanvas } from './SpaceCanvas';
import { WarpState } from './universePager';
import { WarpOverlay } from './WarpOverlay';
import { Footer } from './sections/Footer';
import './mobile.css';

const IDS = MOBILE_SECTIONS.map((s) => s.id);

export function scrollToAnchor(anchor: string, smooth: boolean): void {
  // 'instant' beats any inherited `scroll-behavior: smooth`; TS 4.9's DOM lib lacks it, hence the cast.
  document.getElementById(anchor)?.scrollIntoView({ behavior: smooth ? 'smooth' : ('instant' as ScrollBehavior), block: 'start' });
}

const MobileApp: React.FC = () => {
  // Captured before useActiveSection's first effect mirrors the default section into the hash.
  const [initialHash] = useState(() => window.location.hash);
  const active = useActiveSection(IDS);
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [warpTo, setWarpTo] = useState<MobileSectionId | null>(null);
  // Idle until the pager (Task 3) drives it.
  const warpRef = useRef<WarpState>({ t0: null, from: '#ff7a00', to: '#ff7a00' });
  useReveal(rootRef);

  // Layout effects run before useActiveSection's passive hash-sync effect and before any scroll.
  useLayoutEffect(() => {
    // index.css smooth-scrolls <html> for the classic site; jumps here (warp midpoint, reduced motion) must be instant.
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    // A reload or Forward onto a stale sheet entry would leave mbSheet set with no sheet open, blocking hash sync.
    if (window.history.state && window.history.state.mbSheet) window.history.replaceState(null, '');
    return () => {
      root.style.scrollBehavior = prevBehavior;
    };
  }, []);

  // Deep link on first load.
  useEffect(() => {
    const target = sectionForHash(initialHash);
    if (!target) return;
    const raf = requestAnimationFrame(() => scrollToAnchor(target.anchor, false));
    return () => cancelAnimationFrame(raf);
  }, [initialHash]);

  const navigate = useCallback(
    (id: MobileSectionId) => {
      if (reducedMotion) scrollToAnchor(id, false);
      else setWarpTo(id);
    },
    [reducedMotion]
  );

  const warpAccent = MOBILE_SECTIONS.find((s) => s.id === warpTo)?.accent ?? '#ff7a00';

  return (
    <div className={`mb${reducedMotion ? ' is-reduced' : ''}`} ref={rootRef}>
      <SpaceCanvas reducedMotion={reducedMotion} warpRef={warpRef} />
      <TopBar onHome={() => navigate('home')} />
      <main className="mb-main">
        {MOBILE_SECTIONS.map((s) => {
          const Section = SECTION_COMPONENTS[s.id];
          return (
            <section key={s.id} id={s.id} className="mb-section" style={{ '--accent': s.accent } as React.CSSProperties} aria-label={s.label}>
              <Section section={s} />
            </section>
          );
        })}
        <Footer />
      </main>
      <BottomNav active={active} onSelect={navigate} />
      {warpTo && (
        <WarpOverlay
          key={warpTo}
          accent={warpAccent}
          onMidpoint={() => scrollToAnchor(warpTo, false)}
          onDone={() => setWarpTo(null)}
        />
      )}
    </div>
  );
};

export default MobileApp;
