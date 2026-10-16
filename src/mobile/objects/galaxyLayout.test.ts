import { CONSTELLATIONS, projects } from '../../data/portfolio';
import { filterProjects } from '../projectFilter';
import { galaxyLayout, nearestStar } from './galaxyLayout';

const stars = galaxyLayout(projects);

test('every project is a star on its category arm', () => {
  expect(stars).toHaveLength(24);
  const count = (arm: string) => stars.filter((s) => s.arm === arm).length;
  expect(CONSTELLATIONS.map(count)).toEqual([3, 4, 4, 13]);
  stars.forEach((s) => {
    expect(s.x - s.r).toBeGreaterThanOrEqual(5);
    expect(s.x + s.r).toBeLessThanOrEqual(95);
    expect(s.y - s.r).toBeGreaterThanOrEqual(5);
    expect(s.y + s.r).toBeLessThanOrEqual(95);
  });
});

test('each arm runs newest first from the core outward; featured stars are bigger', () => {
  for (const arm of CONSTELLATIONS) {
    const onArm = stars.filter((s) => s.arm === arm);
    expect(onArm.map((s) => s.title)).toEqual(filterProjects(projects, arm).map((p) => p.title));
    const radii = onArm.map((s) => Math.hypot(s.x - 50, s.y - 50));
    for (let i = 1; i < radii.length; i++) expect(radii[i]).toBeGreaterThan(radii[i - 1]);
  }
  stars.forEach((s) => expect(s.r).toBe(s.featured ? 2.6 : 1.6));
});

test('nearestStar picks the closest star in range', () => {
  const pts = [{ x: 10, y: 10 }, { x: 20, y: 10 }, { x: 15, y: 10 }];
  expect(nearestStar(pts, 11, 10, 5)).toBe(0);
  expect(nearestStar(pts, 16, 11, 5)).toBe(2);
  expect(nearestStar(pts, 50, 50, 5)).toBe(-1);
  expect(nearestStar([{ x: 0, y: 0 }, { x: 2, y: 0 }], 1, 0, 5)).toBe(0);
  expect(nearestStar([], 1, 1, 5)).toBe(-1);
});
