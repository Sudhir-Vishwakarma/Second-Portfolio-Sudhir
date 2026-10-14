import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MOBILE_SECTIONS, MobileSectionId, sectionForHash } from './sections';
import { SECTION_COMPONENTS } from './sections/registry';
import { useActiveSection } from './useActiveSection';
import { useReducedMotion } from './useReducedMotion';
import { useReveal } from './useReveal';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { StarfieldCanvas } from './StarfieldCanvas';
import { WarpOverlay } from './WarpOverlay';
import { Footer } from './sections/Footer';
import './mobile.css';

const IDS = MOBILE_SECTIONS.map((s) => s.id);

export function scrollToAnchor(anchor: string, smooth: boolean): void {
  document.getElementById(anchor)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
}

const MobileApp: React.FC = () => {
  // Captured before useActiveSection's first effect mirrors the default section into the hash.
  const [initialHash] = useState(() => window.location.hash);
  const active = useActiveSection(IDS);
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [warpTo, setWarpTo] = useState<MobileSectionId | null>(null);
  useReveal(rootRef);

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
      <StarfieldCanvas reducedMotion={reducedMotion} />
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
          accent={warpAccent}
          onMidpoint={() => scrollToAnchor(warpTo, false)}
          onDone={() => setWarpTo(null)}
        />
      )}
    </div>
  );
};

export default MobileApp;
