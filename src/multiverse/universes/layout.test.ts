import { ringLayout } from './layout';

test('ringLayout puts n points on a ring of the given radius', () => {
  const pts = ringLayout(20, 12);
  expect(pts).toHaveLength(20);
  pts.forEach(([x, , z]) => expect(Math.hypot(x, z)).toBeCloseTo(12, 6));
  const angles = new Set(pts.map(([x, , z]) => Math.atan2(z, x).toFixed(4)));
  expect(angles.size).toBe(20);
});
