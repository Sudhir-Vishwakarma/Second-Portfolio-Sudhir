import React, { useState } from 'react';
import { projects, newestFirst, CONSTELLATIONS } from '../../../data/portfolio';
import { CONSTELLATION_COLORS } from '../../universes/ProjectsUniverse';
import { useJourney } from '../../store';
import { PanelProps } from './index';

export const ProjectsPanel: React.FC<PanelProps> = () => {
  const openModal = useJourney((s) => s.openModal);
  const [showList, setShowList] = useState(false);
  return (
    <div className="mv-projects">
      <span className="mv-kicker">My Projects</span>
      <h2 className="mv-h2">Project Galaxy</h2>
      <p className="mv-text">{projects.length} projects across {CONSTELLATIONS.length} constellations. Hover a star to see its name, click to open it, drag to turn the galaxy.</p>
      <ul className="mv-legend">
        {CONSTELLATIONS.map((c) => (
          <li key={c}><span style={{ background: CONSTELLATION_COLORS[c] }} />{c}</li>
        ))}
      </ul>
      <button className="mv-btn mv-btn--ghost" onClick={() => setShowList((v) => !v)} aria-expanded={showList}>
        {showList ? 'Hide list' : 'View as list'}
      </button>
      {showList && (
        <ul className="mv-list" data-capture-scroll>
          {newestFirst(projects).map((p) => (
            <li key={p.title}>
              <button onClick={() => openModal({ kind: 'project', index: projects.indexOf(p) })}>
                <span className="mv-list__dot" style={{ background: CONSTELLATION_COLORS[p.constellation] }} />
                <strong>{p.title}</strong>
                <em>{p.shortDescription}</em>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
