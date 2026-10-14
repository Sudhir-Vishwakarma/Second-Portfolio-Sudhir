// overlay/TopBar.tsx
import React from 'react';
import { UNIVERSES, UNIVERSE_LABELS, firstStepOf, universeOf } from '../journey';
import { useJourney } from '../store';

export const TopBar: React.FC = () => {
  const step = useJourney((s) => s.step);
  const jump = useJourney((s) => s.jump);
  const current = universeOf(step);
  return (
    <header className="mv-topbar">
      <button className="mv-mono" onClick={() => jump(0)} aria-label="Home">SV</button>
      <nav className="mv-nav" aria-label="Universes">
        {UNIVERSES.map((u) => (
          <button
            key={u}
            className={u === current ? 'is-current' : ''}
            aria-current={u === current ? 'true' : undefined}
            onClick={() => jump(firstStepOf(u))}
          >
            {UNIVERSE_LABELS[u]}
          </button>
        ))}
      </nav>
      <a className="mv-classic" href="#classic">Classic view</a>
    </header>
  );
};
