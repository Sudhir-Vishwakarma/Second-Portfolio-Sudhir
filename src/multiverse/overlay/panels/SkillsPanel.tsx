import React from 'react';
import { skills, SKILL_GROUPS } from '../../../data/portfolio';
import { SKILL_COLORS } from '../../universes/skillColors';
import { PanelProps } from './index';

/** One skill group per stop of the Skills journey, like one job per Work stop. */
export const SkillsPanel: React.FC<PanelProps> = ({ beat }) => {
  const index = Number(beat.replace('group-', '')) || 0;
  const group = SKILL_GROUPS[index];
  const members = skills.filter((s) => s.group === group);
  return (
    <div>
      <span className="mv-kicker">Technical Skills · {index + 1} / {SKILL_GROUPS.length}</span>
      <h2 className="mv-h2" style={{ color: SKILL_COLORS[group] }}>{group}</h2>
      <div className="mv-skill-group">
        {members.map((s, i) => (
          <span key={s.name} className="mv-tag mv-tag--in" style={{ '--i': i, borderColor: SKILL_COLORS[group] } as React.CSSProperties}>{s.name}</span>
        ))}
      </div>
    </div>
  );
};
