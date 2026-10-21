// overlay/SkillsBack.tsx — while the camera is close to one skill planet, a way back out to all of them
import React from 'react';
import { universeOf } from '../journey';
import { useJourney } from '../store';
import { SKILL_GROUPS } from '../../data/portfolio';

export const SkillsBack: React.FC = () => {
  const step = useJourney((s) => s.step);
  const moving = useJourney((s) => s.moving);
  const modal = useJourney((s) => s.modal);
  const focus = useJourney((s) => s.skillFocus);
  if (focus === null || moving || modal || universeOf(step) !== 'skills') return null;
  return (
    <button
      className="mv-btn mv-btn--ghost mv-skills-back"
      onClick={() => {
        useJourney.getState().pick(null);
        useJourney.getState().focusSkill(null);
      }}
    >
      ← All skills <span className="mv-skills-back__group">· {SKILL_GROUPS[focus]}</span>
    </button>
  );
};
