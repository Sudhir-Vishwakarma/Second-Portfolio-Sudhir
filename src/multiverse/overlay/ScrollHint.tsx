// overlay/ScrollHint.tsx
import React from 'react';
import { STEPS } from '../journey';
import { useJourney } from '../store';
import { useCompact } from '../useCompact';
import { touchHint } from './caption';

export const ScrollHint: React.FC = () => {
  const step = useJourney((s) => s.step);
  const moving = useJourney((s) => s.moving);
  const compact = useCompact();
  if (moving) return null;
  return (
    <div className="mv-hint" key={step}>
      <span className="mv-hint__mouse" aria-hidden="true" />
      {compact ? touchHint(STEPS[step].hint) : STEPS[step].hint}
    </div>
  );
};
