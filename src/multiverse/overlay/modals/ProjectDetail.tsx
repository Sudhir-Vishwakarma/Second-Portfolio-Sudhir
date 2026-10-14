import React from 'react';
import { projects, descriptionParagraphs } from '../../../data/portfolio';
import { CONSTELLATION_COLORS } from '../../universes/ProjectsUniverse';

export const ProjectDetail: React.FC<{ index: number }> = ({ index }) => {
  const p = projects[index];
  return (
    <article className="mv-detail">
      <span className="mv-kicker" style={{ color: CONSTELLATION_COLORS[p.constellation] }}>{p.constellation}</span>
      <h2 className="mv-h2">{p.title}</h2>
      <div className="mv-detail__badges">
        <span className="mv-tag">{p.type}</span>
        <span className="mv-tag">{p.status}</span>
      </div>
      {descriptionParagraphs(p.description).map((para, i) => (
        <p key={i} className="mv-text">{para}</p>
      ))}
      <div className="mv-detail__tech">
        {p.technologies.map((t) => (
          <span key={t} className="mv-tag">{t.trim()}</span>
        ))}
      </div>
      <div className="mv-actions">
        {p.demoUrl && <a className="mv-btn" href={p.demoUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}
        {p.codeUrl && <a className="mv-btn mv-btn--ghost" href={p.codeUrl} target="_blank" rel="noopener noreferrer">Code</a>}
      </div>
    </article>
  );
};
