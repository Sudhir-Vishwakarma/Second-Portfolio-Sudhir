import React, { useMemo, useState } from 'react';
import { CONSTELLATIONS, Project, projects } from '../../data/portfolio';
import { ProjectFilter, filterProjects, topTech } from '../projectFilter';
import { ObjectStage } from './ObjectStage';
import { ARM_COLORS, armPath, galaxyLayout, nearestStar } from './galaxyLayout';

const STARS = galaxyLayout(projects);
const TAP_RADIUS_PX = 40;

/** Projects as a spiral galaxy: tap near a star (or step with ◀ ▶) to show its card; Details opens the sheet. */
export const ProjectGalaxy: React.FC<{ filter: ProjectFilter; onDetails: (p: Project) => void }> = ({ filter, onDetails }) => {
  const order = useMemo(() => filterProjects(projects, filter), [filter]);
  const visible = useMemo(() => (filter === 'All' ? STARS : STARS.filter((s) => s.arm === filter)), [filter]);
  const [picked, setPicked] = useState(order[0].title);
  // A filter change can hide the picked star; fall back to the newest visible project.
  const title = order.some((p) => p.title === picked) ? picked : order[0].title;
  const pos = order.findIndex((p) => p.title === title);
  const project = order[pos];
  const sel = STARS.find((s) => s.title === title)!;
  const step = (d: number) => setPicked(order[(pos + d + order.length) % order.length].title);
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const i = nearestStar(visible, x, y, (TAP_RADIUS_PX / rect.width) * 100);
    if (i >= 0) setPicked(visible[i].title);
  };
  return (
    <div className="mb-orbit-view">
      <div>
        <ObjectStage label="Project galaxy" className="mb-galaxy">
          <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="9" fill="#ffd6a8" opacity="0.25" />
            <circle cx="50" cy="50" r="3.5" fill="#ffffff" opacity="0.9" />
            {CONSTELLATIONS.map((arm) => (
              <path key={arm} d={armPath(arm)} fill="none" stroke={ARM_COLORS[arm]} strokeWidth="5" strokeLinecap="round" opacity={filter === 'All' || filter === arm ? 0.22 : 0.06} />
            ))}
            {STARS.map((s) => {
              const dim = filter !== 'All' && s.arm !== filter;
              return (
                <circle key={s.title} className={`mb-galaxy__star${dim ? ' is-dim' : ''}`} data-title={s.title} cx={s.x} cy={s.y} r={s.r}
                  fill={s.featured ? '#ffffff' : ARM_COLORS[s.arm]} opacity={dim ? 0.2 : 1} />
              );
            })}
            <circle cx={sel.x} cy={sel.y} r={sel.r + 2.4} fill="none" stroke="#ffffff" strokeWidth="0.6" />
          </svg>
          <div className="mb-galaxy__hit" onClick={onTap} aria-hidden="true" />
          <span className="mb-galaxy__tag" style={{ left: `${Math.min(78, Math.max(22, sel.x))}%`, top: `${sel.y}%` }} aria-hidden="true">{sel.title}</span>
        </ObjectStage>
        <div className="mb-galaxy__nav">
          <button className="mb-btn mb-btn--ghost" aria-label="Previous project" onClick={() => step(-1)}>◀&#xFE0E;</button>
          <span className="mb-galaxy__count">{pos + 1} / {order.length}</span>
          <button className="mb-btn mb-btn--ghost" aria-label="Next project" onClick={() => step(1)}>▶&#xFE0E;</button>
        </div>
      </div>
      <div className="mb-card mb-project mb-orbit-panel" aria-live="polite">
        <h3 className="mb-project__title">
          {project.title}
          {project.featured && <span className="mb-star" role="img" aria-label="Featured">★</span>}
        </h3>
        <p className="mb-text">{project.shortDescription}</p>
        <div className="mb-chips">
          {topTech(project).map((t) => (
            <span key={t} className="mb-chip">{t}</span>
          ))}
        </div>
        <div className="mb-project__actions">
          {project.demoUrl && <a className="mb-btn" aria-label={`Live demo: ${project.title}`} href={project.demoUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}
          <button className="mb-btn mb-btn--ghost" aria-label={`Details: ${project.title}`} onClick={() => onDetails(project)}>Details</button>
        </div>
      </div>
    </div>
  );
};
