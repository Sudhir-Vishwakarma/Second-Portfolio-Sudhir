// overlay/Progress.tsx
import React from 'react';
import { STEPS, UNIVERSE_LABELS } from '../journey';
import { useJourney } from '../store';

export const Progress: React.FC = () => {
  const step = useJourney((s) => s.step);
  const jump = useJourney((s) => s.jump);
  return (
    <nav className="mv-progress" aria-label="Journey progress">
      {STEPS.map((s, i) => (
        <button
          key={i}
          className={`mv-progress__dot${i === step ? ' is-current' : ''}${i > 0 && STEPS[i - 1].universe !== s.universe ? ' is-new-universe' : ''}`}
          aria-label={`${UNIVERSE_LABELS[s.universe]}: ${s.beat}`}
          aria-current={i === step ? 'step' : undefined}
          onClick={() => jump(i)}
        />
      ))}
    </nav>
  );
};
