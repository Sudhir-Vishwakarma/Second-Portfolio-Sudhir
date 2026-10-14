import React from 'react';
import { profile } from '../data/portfolio';
import { PALETTES } from '../multiverse/fx/palettes';

const ORBITS = [
  { size: 168, period: 9, color: PALETTES.about.atmos, planet: 10, start: '0deg' },
  { size: 214, period: 14, color: PALETTES.projects.atmos, planet: 14, start: '130deg' },
  { size: 256, period: 21, color: PALETTES.contact.atmos, planet: 9, start: '250deg' },
];

/** CSS-only solar system: the profile photo glows inside the sun, three planets orbit it. */
export const SolarHero: React.FC = () => (
  <div className="mb-solar" aria-hidden="true">
    {ORBITS.map((o, i) => (
      <div
        key={i}
        className="mb-solar__orbit"
        style={{ width: o.size, height: o.size, animationDuration: `${o.period}s`, '--planet': o.color, '--planet-size': `${o.planet}px`, '--start': o.start } as React.CSSProperties}
      >
        <span className="mb-solar__planet" />
      </div>
    ))}
    <div className="mb-solar__sun">
      <img src={profile.photo} alt="" width={112} height={112} />
    </div>
  </div>
);
