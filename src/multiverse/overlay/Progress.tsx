// overlay/Progress.tsx
import React from 'react';
import { STEPS, Step } from '../journey';
import { useJourney } from '../store';
import { experience, SKILL_GROUPS } from '../../data/portfolio';

const shortCompany = (name: string) => name.replace(/\s+(Pvt\.?\s*Ltd\.?|Private Limited)$/i, '');

/** Readable screen-reader names for each step's dot. */
function stepLabel(s: Step): string {
  switch (s.universe) {
    case 'home':
      return 'Home';
    case 'about':
      return `About: ${s.beat}`;
    case 'skills':
      return `Skills: ${SKILL_GROUPS[Number(s.beat.replace('group-', ''))] ?? ''}`;
    case 'certifications':
      return 'Certifications';
    case 'work': {
      const job = experience[Number(s.beat.replace('job-', ''))];
      return job ? `Work: ${shortCompany(job.company)}` : 'Work';
    }
    case 'projects':
      return 'Projects';
    case 'contact':
      return 'Contact';
    default:
      return s.beat;
  }
}

const LABELS = STEPS.map(stepLabel);

export const Progress: React.FC = () => {
  const step = useJourney((s) => s.step);
  const jump = useJourney((s) => s.jump);
  return (
    <nav className="mv-progress" aria-label="Journey progress">
      {STEPS.map((s, i) => (
        <button
          key={i}
          className={`mv-progress__dot${i === step ? ' is-current' : ''}${i > 0 && STEPS[i - 1].universe !== s.universe ? ' is-new-universe' : ''}`}
          aria-label={LABELS[i]}
          aria-current={i === step ? 'step' : undefined}
          onClick={() => jump(i)}
        />
      ))}
    </nav>
  );
};
