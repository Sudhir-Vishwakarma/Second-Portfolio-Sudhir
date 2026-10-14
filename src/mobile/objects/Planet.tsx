import React, { useId } from 'react';

/** A sphere shaded with a lit highlight (top-left) fading to night; optional tilted ring. SVG units. */
export const Planet: React.FC<{ cx?: number; cy?: number; r: number; color: string; ring?: boolean }> = ({ cx = 0, cy = 0, r, color, ring }) => {
  const id = `mb-planet-${useId().replace(/:/g, '')}`;
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.28" stopColor={color} />
          <stop offset="1" stopColor="#05030a" />
        </radialGradient>
      </defs>
      {ring && (
        <ellipse cx={cx} cy={cy} rx={r * 1.9} ry={r * 0.55} fill="none" stroke={color} strokeOpacity="0.65" strokeWidth={r * 0.18} transform={`rotate(-18 ${cx} ${cy})`} />
      )}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </g>
  );
};
