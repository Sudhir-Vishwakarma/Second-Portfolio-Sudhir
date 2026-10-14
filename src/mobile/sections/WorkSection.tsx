import React, { useState } from 'react';
import { experience } from '../../data/portfolio';
import { hasHiddenBullets, visibleBullets } from '../bullets';
import { SectionHeading } from '../SectionHeading';
import { SectionProps } from './registry';

const Job: React.FC<{ index: number }> = ({ index }) => {
  const job = experience[index];
  const [expanded, setExpanded] = useState(false);
  const listId = `job-${index}-bullets`;
  return (
    <li className="mb-job" data-reveal>
      <span className="mb-timeline__years">{job.start} – {job.end}</span>
      <h3 className="mb-job__role">{job.role}</h3>
      <p className="mb-job__company">{job.company}</p>
      <ul className="mb-bullets" id={listId}>
        {visibleBullets(job.bullets, expanded).map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      {hasHiddenBullets(job.bullets) && (
        <button className="mb-link" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show less' : `Show more (${job.bullets.length - 2})`}
        </button>
      )}
    </li>
  );
};

export const WorkSection: React.FC<SectionProps> = () => (
  <div>
    <SectionHeading kicker="Work Experience" title="Career Galaxy" />
    <ol className="mb-timeline mb-jobs">
      {experience.map((j, i) => (
        <Job key={j.company} index={i} />
      ))}
    </ol>
  </div>
);
