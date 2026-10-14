import { Constellation, Project, newestFirst } from '../data/portfolio';

export type ProjectFilter = 'All' | Constellation;

export const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'CRM Platforms', label: 'CRM' },
  { id: 'Salesforce Portals', label: 'Salesforce' },
  { id: 'Real Estate', label: 'Real Estate' },
  { id: 'Web Apps', label: 'Web Apps' },
];

export const INITIAL_VISIBLE = 6;

export function filterProjects(items: readonly Project[], filter: ProjectFilter): Project[] {
  const ordered = newestFirst(items);
  return filter === 'All' ? ordered : ordered.filter((p) => p.constellation === filter);
}

export function visibleProjects(list: Project[], showAll: boolean): Project[] {
  return showAll ? list : list.slice(0, INITIAL_VISIBLE);
}

export function topTech(p: Project, n = 3): string[] {
  return p.technologies.map((t) => t.trim()).filter(Boolean).slice(0, n);
}
