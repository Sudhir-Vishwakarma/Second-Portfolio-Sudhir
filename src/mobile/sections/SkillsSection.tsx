import React from 'react';
import { SKILL_GROUPS, SkillGroup, skills } from '../../data/portfolio';
import { SectionHeading } from '../SectionHeading';
import { SectionProps } from './registry';

const GROUP_COLORS: Record<SkillGroup, string> = {
  Frontend: '#38bdf8',
  Backend: '#f97316',
  Database: '#a3e635',
  'Cloud & DevOps': '#c084fc',
  Tools: '#f472b6',
};

export const SkillsSection: React.FC<SectionProps> = () => (
  <div>
    <SectionHeading kicker="Technical Skills" title="My Tech Belt" />
    {SKILL_GROUPS.map((g) => (
      <div key={g} className="mb-skill-group" data-reveal>
        <h3 className="mb-skill-group__title">
          <span className="mb-dot" style={{ background: GROUP_COLORS[g], boxShadow: `0 0 8px ${GROUP_COLORS[g]}` }} />
          {g}
        </h3>
        <div className="mb-chips">
          {skills.filter((s) => s.group === g).map((s) => (
            <span key={s.name} className="mb-chip">{s.name}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
);
