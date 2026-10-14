// overlay/ScrollHint.tsx
import React from 'react';
import { STEPS } from '../journey';
import { useJourney } from '../store';

export const ScrollHint: React.FC = () => {
  const step = useJourney((s) => s.step);
  const moving = useJourney((s) => s.moving);
  if (moving) return null;
  return (
    <div className="mv-hint" key={step}>
      <span className="mv-hint__mouse" aria-hidden="true" />
      {STEPS[step].hint}
    </div>
  );
};
