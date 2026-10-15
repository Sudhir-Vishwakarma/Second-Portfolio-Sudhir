import { displaceRock } from './rock';

const sphere = () => {
  // 3 directions, the first duplicated (like non-indexed geometry), radius 1
  return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0]);
};
const radii = (p: Float32Array) => Array.from({ length: p.length / 3 }, (_, i) => Math.hypot(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]));

test('deterministic per seed, different across seeds', () => {
  const a = sphere();
  const b = sphere();
  const c = sphere();
  displaceRock(a, 7, 0.3);
  displaceRock(b, 7, 0.3);
  displaceRock(c, 8, 0.3);
  expect(Array.from(a)).toEqual(Array.from(b));
  expect(Array.from(a)).not.toEqual(Array.from(c));
});

test('radii stay within 1 ± amount and duplicated vertices stay welded', () => {
  const p = sphere();
  displaceRock(p, 3, 0.25);
  radii(p).forEach((r) => {
    expect(r).toBeGreaterThanOrEqual(0.75 - 1e-6);
    expect(r).toBeLessThanOrEqual(1.25 + 1e-6);
  });
  expect([p[0], p[1], p[2]]).toEqual([p[9], p[10], p[11]]);
});
