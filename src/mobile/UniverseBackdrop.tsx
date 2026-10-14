import React from 'react';
import { MobileSectionId } from './sections';

// Spiral arm as an SVG path around (0,0).
const spiralPath = (offset: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI * 3;
    const r = 6 + t * 6.4;
    pts.push(`${(Math.cos(t + offset) * r).toFixed(1)},${(Math.sin(t + offset) * r).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
};
const ARMS = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map(spiralPath);
const CRYSTALS = Array.from({ length: 10 }, (_, i) => (i / 10) * 360);

// Signature objects drawn in currentColor (= the universe accent), centred on (0,0) in a 140×140 view box.
const OBJECTS: Partial<Record<MobileSectionId, React.ReactNode>> = {
  about: (
    <>
      <circle r="48" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="3 5" />
      <circle r="22" fill="currentColor" fillOpacity="0.75" />
      <g className="mb-spin">
        {[0, 90, 180, 270].map((a) => (
          <circle key={a} r="4" cx={Math.cos((a * Math.PI) / 180) * 48} cy={Math.sin((a * Math.PI) / 180) * 48} fill="currentColor" />
        ))}
      </g>
    </>
  ),
  skills: (
    <>
      <circle r="12" fill="currentColor" fillOpacity="0.8" />
      <g className="mb-spin">
        {CRYSTALS.map((a) => (
          <rect key={a} x="-4" y="-4" width="8" height="8" fill="currentColor" fillOpacity="0.85"
            transform={`rotate(${a}) translate(46 0) rotate(45)`} />
        ))}
      </g>
    </>
  ),
  work: (
    <>
      <path d="M-50,30 Q-10,-20 20,-10 T55,-40" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="3 5" />
      <circle cx="-50" cy="30" r="14" fill="currentColor" fillOpacity="0.8" />
      <circle cx="20" cy="-10" r="10" fill="currentColor" fillOpacity="0.6" />
      <circle cx="55" cy="-40" r="12" fill="currentColor" fillOpacity="0.45" />
    </>
  ),
  projects: (
    <g className="mb-spin mb-spin--slow">
      {ARMS.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
      ))}
      <circle r="6" fill="currentColor" />
    </g>
  ),
  contact: (
    <>
      <circle className="mb-pulse" r="20" fill="none" stroke="currentColor" strokeOpacity="0.6" />
      <rect x="-3" y="-6" width="6" height="56" fill="currentColor" fillOpacity="0.7" />
      <path d="M-22,-14 Q0,-34 22,-14" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cy="-22" r="4" fill="currentColor" />
    </>
  ),
};

/** Decorative per-universe space: two drifting nebula glows in the accent, plus a signature object. */
export const UniverseBackdrop: React.FC<{ id: MobileSectionId }> = ({ id }) => (
  <div className="mb-backdrop" aria-hidden="true">
    <span className="mb-backdrop__nebula mb-backdrop__nebula--a" />
    <span className="mb-backdrop__nebula mb-backdrop__nebula--b" />
    {OBJECTS[id] && (
      <svg className="mb-backdrop__object" viewBox="-70 -70 140 140">
        {OBJECTS[id]}
      </svg>
    )}
  </div>
);
