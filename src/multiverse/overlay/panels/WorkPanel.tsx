import React from 'react';
import { experience } from '../../../data/portfolio';
import { PanelProps } from './index';

export const WorkPanel: React.FC<PanelProps> = ({ beat }) => {
  const index = Number(beat.replace('job-', '')) || 0;
  const job = experience[index];
  return (
    <div>
      <span className="mv-kicker">Work Experience · {index + 1} / {experience.length}</span>
      <h2 className="mv-h2">{job.role}</h2>
      <p className="mv-job__meta"><strong>{job.company}</strong> · {job.start} – {job.end}</p>
      <ul className="mv-bullets">
        {job.bullets.map((b, i) => (
          <li key={b} style={{ '--i': i } as React.CSSProperties}>{b}</li>
        ))}
      </ul>
    </div>
  );
};
