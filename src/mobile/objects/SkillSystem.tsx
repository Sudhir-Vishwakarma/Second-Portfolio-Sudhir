import React, { useState } from 'react';
import { SKILL_GROUPS, SkillGroup, skills } from '../../data/portfolio';
import { SKILL_COLORS } from '../skillColors';
import { ObjectStage } from './ObjectStage';
import { Planet } from './Planet';
import { ringPoints } from './orbitLayouts';

const RADII = [18, 24, 30, 36, 42];
const PERIODS = [38, 52, 66, 84, 104];

/** Skills as a solar system: one planet per skill group on its own orbit; the panel lists the selected group. */
export const SkillSystem: React.FC = () => {
  const [selected, setSelected] = useState<SkillGroup>(SKILL_GROUPS[0]);
  return (
    <div className="mb-orbit-view">
      <ObjectStage label="Skills solar system" className="mb-skills-orbit">
        <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
          {RADII.map((r) => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
          ))}
          <circle cx="50" cy="50" r="13" fill="#ffb347" opacity="0.18" />
          <g transform="translate(50 50)">
            <Planet r={8} color="#ffb347" />
          </g>
        </svg>
        <span className="mb-orbit__core-label" aria-hidden="true">Skills</span>
        {SKILL_GROUPS.map((g, i) => {
          const p = ringPoints(SKILL_GROUPS.length, RADII[i])[i];
          return (
            <div key={g} className="mb-orbit__ring" style={{ '--period': `${PERIODS[i]}s` } as React.CSSProperties}>
              <button
                className={`mb-orbit__node${g === selected ? ' is-selected' : ''}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, '--glow': SKILL_COLORS[g] } as React.CSSProperties}
                aria-label={`${g} skills`}
                aria-pressed={g === selected}
                onClick={() => setSelected(g)}
              >
                <span className="mb-orbit__upright">
                  <svg className="mb-orbit__glyph" width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true">
                    <Planet r={9} color={SKILL_COLORS[g]} ring={g === 'Cloud & DevOps'} />
                  </svg>
                </span>
              </button>
            </div>
          );
        })}
      </ObjectStage>
      <div className="mb-card mb-orbit-panel" aria-live="polite">
        <h3 className="mb-skill-group__title">
          <span className="mb-dot" style={{ background: SKILL_COLORS[selected], boxShadow: `0 0 8px ${SKILL_COLORS[selected]}` }} />
          {selected}
        </h3>
        <div className="mb-chips">
          {skills.filter((s) => s.group === selected).map((s) => (
            <span key={s.name} className="mb-chip">{s.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
