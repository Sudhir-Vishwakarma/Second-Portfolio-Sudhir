import React, { useMemo, useState } from 'react';
import { Project, descriptionParagraphs, projects } from '../../data/portfolio';
import { FILTERS, ProjectFilter, filterProjects, topTech, visibleProjects } from '../projectFilter';
import { SectionHeading } from '../SectionHeading';
import { Sheet } from '../Sheet';
import { SectionProps } from './registry';

const ProjectDetails: React.FC<{ p: Project }> = ({ p }) => (
  <article className="mb-details">
    <span className="mb-kicker">{p.constellation}</span>
    <h2 className="mb-h2">{p.title}</h2>
    <div className="mb-chips">
      <span className="mb-chip">{p.type}</span>
      <span className="mb-chip">{p.status}</span>
    </div>
    {descriptionParagraphs(p.description).map((para, i) => (
      <p key={i} className="mb-text">{para}</p>
    ))}
    <div className="mb-chips">
      {p.technologies.map((t) => t.trim()).filter(Boolean).map((t) => (
        <span key={t} className="mb-chip">{t}</span>
      ))}
    </div>
    <div className="mb-details__actions">
      {p.demoUrl && <a className="mb-btn" href={p.demoUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}
      {p.codeUrl && <a className="mb-btn mb-btn--ghost" href={p.codeUrl} target="_blank" rel="noopener noreferrer">Code</a>}
    </div>
  </article>
);

export const ProjectsSection: React.FC<SectionProps> = () => {
  const [filter, setFilter] = useState<ProjectFilter>('All');
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<Project | null>(null);
  const list = useMemo(() => filterProjects(projects, filter), [filter]);
  const shown = visibleProjects(list, showAll);

  return (
    <div>
      <SectionHeading kicker="My Projects" title="Project Galaxy" />
      <div className="mb-filters" role="group" aria-label="Filter projects">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`mb-chip mb-filter${f.id === filter ? ' is-active' : ''}`}
            aria-pressed={f.id === filter}
            onClick={() => {
              setFilter(f.id);
              setShowAll(false);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mb-projects">
        {shown.map((p) => (
          <li key={p.title} className="mb-card mb-project" data-reveal>
            <h3 className="mb-project__title">
              {p.title}
              {p.featured && <span className="mb-star" aria-label="Featured">★</span>}
            </h3>
            <p className="mb-text">{p.shortDescription}</p>
            <div className="mb-chips">
              {topTech(p).map((t) => (
                <span key={t} className="mb-chip">{t}</span>
              ))}
            </div>
            <div className="mb-project__actions">
              {p.demoUrl && <a className="mb-btn" href={p.demoUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}
              <button className="mb-btn mb-btn--ghost" onClick={() => setOpen(p)}>Details</button>
            </div>
          </li>
        ))}
      </ul>

      {list.length > shown.length && (
        <button className="mb-btn mb-btn--ghost mb-showall" onClick={() => setShowAll(true)}>
          Show all {list.length}
        </button>
      )}

      <Sheet open={open !== null} onClose={() => setOpen(null)} label={open ? open.title : 'Project details'}>
        {open && <ProjectDetails p={open} />}
      </Sheet>
    </div>
  );
};
