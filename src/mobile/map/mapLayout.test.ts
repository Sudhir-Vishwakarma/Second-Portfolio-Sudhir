import { mapLayout } from './mapLayout';

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

test('six universes stay inside the map and well apart', () => {
  const pts = mapLayout(6);
  expect(pts).toHaveLength(6);
  pts.forEach((p) => {
    expect(p.x).toBeGreaterThanOrEqual(8);
    expect(p.x).toBeLessThanOrEqual(92);
    expect(p.y).toBeGreaterThanOrEqual(8);
    expect(p.y).toBeLessThanOrEqual(92);
  });
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) expect(dist(pts[i], pts[j])).toBeGreaterThanOrEqual(20);
});

test('the spiral starts near the core and widens outward', () => {
  const r = mapLayout(6).map((p) => dist(p, { x: 50, y: 50 }));
  expect(r[0]).toBeCloseTo(16);
  expect(r[5]).toBeCloseTo(42);
  for (let i = 1; i < r.length; i++) expect(r[i]).toBeGreaterThan(r[i - 1]);
});

test('rotation turns the whole layout around the core', () => {
  const a = mapLayout(6, 0);
  const b = mapLayout(6, Math.PI);
  a.forEach((p, i) => {
    expect(b[i].x).toBeCloseTo(100 - p.x);
    expect(b[i].y).toBeCloseTo(100 - p.y);
  });
  expect(mapLayout(1)).toEqual([{ x: expect.any(Number), y: expect.any(Number) }]);
  expect(dist(mapLayout(1)[0], { x: 50, y: 50 })).toBeCloseTo(16);
});
