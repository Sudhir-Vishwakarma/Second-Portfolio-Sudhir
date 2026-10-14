import React, { useEffect, useRef } from 'react';
import { MOBILE_SECTIONS } from './sections';
import { SECTION_COMPONENTS } from './sections/registry';
import { LAST_INDEX, PULL_THRESHOLD } from './universePager';
import { useEdgePull } from './useEdgePull';
import { ViewState } from './useUniversePager';
import { useReveal } from './useReveal';
import { Footer } from './sections/Footer';
import { UniverseBackdrop } from './UniverseBackdrop';

export interface UniverseViewProps {
  index: number;
  state: ViewState;
  /** In-universe anchor to scroll to on mount (deep links such as #certifications). */
  anchor: string | null;
  /** Move focus to the heading on mount (after a jump, not on first load). */
  focusHeading: boolean;
  onTravel: (dir: 'next' | 'prev', source: 'button' | 'gesture') => void;
}

/** One full-screen universe with its own scroll area. Remounted (keyed by index) for every jump. */
export const UniverseView: React.FC<UniverseViewProps> = ({ index, state, anchor, focusHeading, onTravel }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const section = MOBILE_SECTIONS[index];
  const Section = SECTION_COMPONENTS[section.id];
  const next = index < LAST_INDEX ? MOBILE_SECTIONS[index + 1] : null;
  useReveal(scrollRef);
  const prev = index > 0 ? MOBILE_SECTIONS[index - 1] : null;
  const pull = useEdgePull(scrollRef, (dir) => onTravel(dir, 'gesture'), state === 'active');
  const pullTarget = pull > 0 ? next : pull < 0 ? prev : null;
  const pullReady = Math.abs(pull) >= PULL_THRESHOLD;

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    if (anchor && anchor !== section.id) root.querySelector<HTMLElement>(`#${anchor}`)?.scrollIntoView({ block: 'start' });
    if (focusHeading) {
      const heading = root.querySelector<HTMLElement>('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }, [anchor, focusHeading, section.id]);

  const leaving = state === 'leaving';
  return (
    <div
      className={`mb-universe is-${state}`}
      style={{ '--accent': section.accent } as React.CSSProperties}
      aria-hidden={leaving ? true : undefined}
      {...((leaving ? { inert: '' } : {}) as Record<string, string>)}
    >
      <UniverseBackdrop id={section.id} />
      <div className="mb-universe__scroll" ref={scrollRef} data-universe={section.id}>
        <div className="mb-main">
          <section id={section.id} className="mb-section" aria-label={section.label}>
            <Section section={section} />
            {next ? (
              <button className="mb-btn mb-btn--ghost mb-next" onClick={() => onTravel('next', 'button')}>
                Next: {next.label} ↓
              </button>
            ) : (
              <Footer />
            )}
          </section>
        </div>
      </div>
      {pullTarget && (
        <div className={`mb-pull mb-pull--${pull > 0 ? 'bottom' : 'top'}${pullReady ? ' is-ready' : ''}`} style={{ opacity: Math.min(1, Math.abs(pull) / PULL_THRESHOLD) }} aria-hidden="true">
          {pullReady ? `Release for ${pullTarget.label}` : `Pull for ${pullTarget.label}`} {pull > 0 ? '↓' : '↑'}
        </div>
      )}
    </div>
  );
};
