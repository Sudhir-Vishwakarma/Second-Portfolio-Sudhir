import { ringLayout, layoutGalaxy } from './layout';
import { projects, CONSTELLATIONS } from '../../data/portfolio';

test('ringLayout puts n points on a ring of the given radius', () => {
  const pts = ringLayout(20, 12);
  expect(pts).toHaveLength(20);
  pts.forEach(([x, , z]) => expect(Math.hypot(x, z)).toBeCloseTo(12, 6));
  const angles = new Set(pts.map(([x, , z]) => Math.atan2(z, x).toFixed(4)));
  expect(angles.size).toBe(20);
});

describe('layoutGalaxy', () => {
  const { positions, centers } = layoutGalaxy(projects);

  test('one position per project, all inside the galaxy', () => {
    expect(positions).toHaveLength(projects.length);
    positions.forEach(([x, y, z]) => expect(Math.hypot(x, y, z)).toBeLessThan(30));
  });

  test('no two stars overlap', () => {
    for (let i = 0; i < positions.length; i++)
      for (let j = i + 1; j < positions.length; j++) {
        const [a, b] = [positions[i], positions[j]];
        expect(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])).toBeGreaterThan(1);
      }
  });

  test('four distinct constellation centres, deterministic', () => {
    expect(Object.keys(centers).sort()).toEqual([...CONSTELLATIONS].sort());
    expect(layoutGalaxy(projects).positions).toEqual(positions);
  });
});
