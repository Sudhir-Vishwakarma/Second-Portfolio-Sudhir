import React from 'react';
import { experience } from '../../data/portfolio';
import { SectionHeading } from '../SectionHeading';
import { CareerPath } from '../objects/CareerPath';
import { ViewToggle } from '../objects/ViewToggle';
import { useViewMode } from '../objects/useViewMode';
import { Job } from './Job';
import { SectionProps } from './registry';

export const WorkSection: React.FC<SectionProps> = () => {
  const [mode, setMode] = useViewMode('work');
  return (
    <div>
      <SectionHeading kicker="Work Experience" title="Career Galaxy" />
      <ViewToggle mode={mode} onChange={setMode} label="Work" />
      {mode === 'orbit' ? (
        <CareerPath />
      ) : (
        <ol className="mb-timeline mb-jobs">
          {experience.map((j, i) => (
            <Job key={j.company} index={i} />
          ))}
        </ol>
      )}
    </div>
  );
};
