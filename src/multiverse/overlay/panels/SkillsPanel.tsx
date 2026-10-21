import React from 'react';
import { skills, SKILL_GROUPS } from '../../../data/portfolio';
import { SKILL_COLORS } from '../../universes/skillSystems';
import { PanelProps } from './index';

export const SkillsPanel: React.FC<PanelProps> = () => (
  <div>
    <span className="mv-kicker">Technical Skills</span>
    <h2 className="mv-h2">My Tech Belt</h2>
    {SKILL_GROUPS.map((g) => (
      <div key={g} className="mv-skill-group">
        <h3 style={{ color: SKILL_COLORS[g] }}>{g}</h3>
        {skills.filter((s) => s.group === g).map((s) => (
          <span key={s.name} className="mv-tag">{s.name}</span>
        ))}
      </div>
    ))}
  </div>
);
