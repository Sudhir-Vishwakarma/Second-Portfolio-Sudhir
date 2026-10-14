import React from 'react';
import { MOBILE_SECTIONS } from '../sections';
import { ObjectStage } from '../objects/ObjectStage';
import { UniverseGlyph } from './UniverseGlyph';
import { mapLayout } from './mapLayout';

const POINTS = mapLayout(MOBILE_SECTIONS.length);
const LANES = POINTS.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

/** The six universes on a slowly turning spiral around a black hole; tap one to travel there. */
export const MultiverseMap: React.FC<{ current: number; onPick: (index: number) => void }> = ({ current, onPick }) => (
  <div className="mb-map">
    <span className="mb-kicker">Navigation</span>
    <h2 className="mb-h2">Multiverse Map</h2>
    <p className="mb-text">Tap a universe to travel there through the black hole.</p>
    <ObjectStage label="Multiverse map" className="mb-map__space">
      <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="mb-map-disk">
            <stop offset="0.35" stopColor="#ff7a00" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ff7a00" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="12" fill="url(#mb-map-disk)" />
        <ellipse cx="50" cy="50" rx="11" ry="3.4" fill="none" stroke="#ffd6a8" strokeWidth="0.8" transform="rotate(-20 50 50)" />
        <circle cx="50" cy="50" r="5" fill="#000000" />
      </svg>
      <div className="mb-orbit__ring" style={{ '--period': '140s' } as React.CSSProperties}>
        <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
          <polyline points={LANES} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.4" strokeDasharray="1 1.6" />
        </svg>
        {MOBILE_SECTIONS.map((s, i) => (
          <button
            key={s.id}
            className={`mb-orbit__node mb-map__node${i === current ? ' is-selected' : ''}`}
            style={{ left: `${POINTS[i].x}%`, top: `${POINTS[i].y}%`, '--glow': s.accent } as React.CSSProperties}
            aria-label={`Travel to ${s.label}`}
            aria-current={i === current ? 'true' : undefined}
            onClick={() => onPick(i)}
          >
            <span className="mb-orbit__upright">
              <UniverseGlyph id={s.id} color={s.accent} />
              <span className="mb-orbit__label">{s.label}</span>
              {i === current && <span className="mb-map__here">You are here</span>}
            </span>
          </button>
        ))}
      </div>
    </ObjectStage>
  </div>
);
