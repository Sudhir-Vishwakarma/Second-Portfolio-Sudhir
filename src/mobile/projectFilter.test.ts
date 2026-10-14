import { FILTERS, INITIAL_VISIBLE, filterProjects, visibleProjects, topTech } from './projectFilter';
import { projects } from '../data/portfolio';

test('All returns every project, newest first', () => {
  const all = filterProjects(projects, 'All');
  expect(all).toHaveLength(23);
  expect(all[0].title).toBe('Shubhdhanam CRM');
  expect(all[all.length - 1].title).toBe('Weather App');
});

test('each constellation filter returns its projects', () => {
  expect(filterProjects(projects, 'CRM Platforms')).toHaveLength(2);
  expect(filterProjects(projects, 'Salesforce Portals')).toHaveLength(4);
  expect(filterProjects(projects, 'Real Estate')).toHaveLength(4);
  expect(filterProjects(projects, 'Web Apps')).toHaveLength(13);
});

test('filters are labelled for the chips', () => {
  expect(FILTERS.map((f) => f.label)).toEqual(['All', 'CRM', 'Salesforce', 'Real Estate', 'Web Apps']);
});

test('initially shows 6, show all reveals the rest', () => {
  const all = filterProjects(projects, 'All');
  expect(INITIAL_VISIBLE).toBe(6);
  expect(visibleProjects(all, false)).toHaveLength(6);
  expect(visibleProjects(all, true)).toHaveLength(23);
  expect(visibleProjects(filterProjects(projects, 'CRM Platforms'), false)).toHaveLength(2);
});

test('topTech trims and limits technologies', () => {
  const p = { ...projects[0], technologies: [' API Integration ', 'React', '', 'Next', 'MySQL'] };
  expect(topTech(p)).toEqual(['API Integration', 'React', 'Next']);
  expect(topTech(p, 5)).toEqual(['API Integration', 'React', 'Next', 'MySQL']);
});
