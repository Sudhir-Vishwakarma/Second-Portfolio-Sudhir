import React from 'react';
import { MobileSectionId } from '../sections';
import { Planet } from '../objects/Planet';

const spiral = (offset: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 30; i++) {
    const t = (i / 30) * Math.PI * 2.6;
    const r = 2 + t * 1.9;
    pts.push(`${(Math.cos(t + offset) * r).toFixed(1)},${(Math.sin(t + offset) * r).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
};
const ARMS = [0, Math.PI].map(spiral);
const MOONS = [0, 120, 240].map((a) => ({ x: Math.cos((a * Math.PI) / 180) * 15, y: Math.sin((a * Math.PI) / 180) * 15 }));

const GLYPHS: Record<MobileSectionId, (c: string) => React.ReactNode> = {
  home: () => (
    <>
      <circle r="16" fill="#ffb347" opacity="0.22" />
      <Planet r={10} color="#ffb347" />
    </>
  ),
  about: (c) => (
    <>
      <circle r="15" fill="none" stroke={c} strokeOpacity="0.45" strokeDasharray="2 2" />
      <Planet r={8} color={c} />
      {MOONS.map((m, i) => <circle key={i} cx={m.x} cy={m.y} r="2.2" fill={c} />)}
    </>
  ),
  skills: (c) => <Planet r={8} color={c} ring />,
  work: (c) => (
    <>
      <path d="M-15,10 Q-2,-14 15,-10" fill="none" stroke={c} strokeOpacity="0.5" strokeDasharray="2 2" />
      <Planet cx={-14} cy={10} r={4} color={c} />
      <Planet cx={0} cy={-3} r={5} color={c} />
      <Planet cx={14} cy={-10} r={6} color={c} />
    </>
  ),
  projects: (c) => (
    <>
      {ARMS.map((d, i) => <path key={i} d={d} fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.85" />)}
      <circle r="3" fill="#ffffff" />
    </>
  ),
  contact: (c) => (
    <>
      <circle cy="-8" r="9" fill={c} opacity="0.25" />
      <path d="M-6,16 L0,-4 L6,16 Z" fill={c} fillOpacity="0.6" />
      <path d="M-9,-10 Q0,-18 9,-10" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <circle cy="-8" r="2.6" fill="#ffffff" />
    </>
  ),
};

/** Small picture of a universe for the multiverse map. Decorative: the button around it carries the name. */
export const UniverseGlyph: React.FC<{ id: MobileSectionId; color: string; size?: number }> = ({ id, color, size = 40 }) => (
  <svg className="mb-orbit__glyph" width={size} height={size} viewBox="-20 -20 40 40" aria-hidden="true">
    {GLYPHS[id](color)}
  </svg>
);
