import React from 'react';
import { SKILL_GROUPS, skills } from '../../data/portfolio';
import { SectionHeading } from '../SectionHeading';
import { SKILL_COLORS } from '../skillColors';
import { SkillSystem } from '../objects/SkillSystem';
import { ViewToggle } from '../objects/ViewToggle';
import { useViewMode } from '../objects/useViewMode';
import { SectionProps } from './registry';

const SkillList: React.FC = () => (
  <>
    {SKILL_GROUPS.map((g) => (
      <div key={g} className="mb-skill-group" data-reveal>
        <h3 className="mb-skill-group__title">
          <span className="mb-dot" style={{ background: SKILL_COLORS[g], boxShadow: `0 0 8px ${SKILL_COLORS[g]}` }} />
          {g}
        </h3>
        <div className="mb-chips">
          {skills.filter((s) => s.group === g).map((s) => (
            <span key={s.name} className="mb-chip">{s.name}</span>
          ))}
        </div>
      </div>
    ))}
  </>
);

export const SkillsSection: React.FC<SectionProps> = () => {
  const [mode, setMode] = useViewMode('skills');
  return (
    <div>
      <SectionHeading kicker="Technical Skills" title="My Tech Belt" />
      <ViewToggle mode={mode} onChange={setMode} label="Skills" />
      {mode === 'orbit' ? <SkillSystem /> : <SkillList />}
    </div>
  );
};
