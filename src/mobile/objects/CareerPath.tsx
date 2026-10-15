import React, { useState } from 'react';
import { experience } from '../../data/portfolio';
import { Job } from '../sections/Job';
import { ObjectStage } from './ObjectStage';
import { Planet } from './Planet';
import { CAREER_PATH, careerPoints } from './orbitLayouts';

const POINTS = careerPoints(experience.length);
const COLORS = ['#ffb347', '#7dd3fc', '#c4b5fd'];
const colorOf = (i: number) => COLORS[i % COLORS.length];

/** Jobs as planets along a flight path, oldest to newest; a ship marks the current job. */
export const CareerPath: React.FC = () => {
  const [selected, setSelected] = useState(0);
  const ship = POINTS[0];
  return (
    <div className="mb-orbit-view">
      <ObjectStage label="Career path" className="mb-career">
        <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
          <path d={CAREER_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
          <path d="M0,-3 L2.2,2.5 L0,1.2 L-2.2,2.5 Z" fill="#ffffff" transform={`translate(${ship.x + 7} ${ship.y - 9}) rotate(40)`} />
        </svg>
        {experience.map((job, i) => (
          <button
            key={job.company}
            className={`mb-orbit__node${i === selected ? ' is-selected' : ''}`}
            style={{ left: `${POINTS[i].x}%`, top: `${POINTS[i].y}%`, '--glow': colorOf(i) } as React.CSSProperties}
            aria-label={`${job.role} at ${job.company}`}
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
          >
            <span className="mb-orbit__upright">
              <svg className="mb-orbit__glyph" width={i === 0 ? 40 : 32} height={i === 0 ? 40 : 32} viewBox="-16 -16 32 32" aria-hidden="true">
                <Planet r={i === 0 ? 13 : 10} color={colorOf(i)} />
              </svg>
              <span className="mb-orbit__label">{job.company}</span>
            </span>
          </button>
        ))}
      </ObjectStage>
      <ol className="mb-jobs mb-card mb-orbit-panel" aria-live="polite">
        <Job key={selected} index={selected} />
      </ol>
    </div>
  );
};
