import React, { useState } from 'react';
import { ObjectStage } from './ObjectStage';

/** Contact's hero: a signal tower. Tap the lamp for a pulse; each successful send (signal++) flares it too. */
export const Beacon: React.FC<{ signal: number }> = ({ signal }) => {
  const [pulses, setPulses] = useState(0);
  const key = pulses + signal;
  return (
    <ObjectStage label="Signal beacon" className="mb-beacon">
      <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M38,96 L50,34 L62,96 Z" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        <path d="M42,76 L58,76 M45,58 L55,58" stroke="var(--accent)" strokeWidth="1.2" />
        <path d="M30,30 Q50,12 70,30" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M22,22 Q50,-2 78,22" fill="none" stroke="var(--accent)" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {key > 0 && <span key={key} className="mb-beacon__pulse" aria-hidden="true" />}
      <button className="mb-orbit__node mb-beacon__light" style={{ left: '50%', top: '30%' }} aria-label="Send a signal pulse" onClick={() => setPulses((n) => n + 1)}>
        <span className="mb-beacon__lamp" />
      </button>
    </ObjectStage>
  );
};
