import React from 'react';
import { aboutSummary, education } from '../../../data/portfolio';
import { PanelProps } from './index';

export const AboutPanel: React.FC<PanelProps> = ({ beat }) =>
  beat === 'education' ? (
    <div>
      <span className="mv-kicker">About · 2 / 2</span>
      <h2 className="mv-h2">Education</h2>
      <ol className="mv-timeline">
        {education.map((e, i) => (
          <li key={e.years} style={{ '--i': i } as React.CSSProperties}>
            <span className="mv-timeline__years">{e.years}</span>
            <strong>{e.title}</strong>
            <span className="mv-timeline__place">{e.school}</span>
          </li>
        ))}
      </ol>
    </div>
  ) : (
    <div>
      <span className="mv-kicker">About · 1 / 2</span>
      <h2 className="mv-h2">About Me</h2>
      <p className="mv-text">{aboutSummary}</p>
    </div>
  );
