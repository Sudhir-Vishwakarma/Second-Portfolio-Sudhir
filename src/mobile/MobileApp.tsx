import React, { useCallback, useEffect, useState } from 'react';
import { MOBILE_SECTIONS, MobileSectionId, sectionForHash } from './sections';
import { SECTION_COMPONENTS } from './sections/registry';
import { useActiveSection } from './useActiveSection';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
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

  // Deep link on first load.
  useEffect(() => {
    const target = sectionForHash(initialHash);
    if (!target) return;
    const raf = requestAnimationFrame(() => scrollToAnchor(target.anchor, false));
    return () => cancelAnimationFrame(raf);
  }, [initialHash]);

  const navigate = useCallback((id: MobileSectionId) => scrollToAnchor(id, false), []);

  return (
    <div className="mb">
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
    </div>
  );
};

export default MobileApp;
