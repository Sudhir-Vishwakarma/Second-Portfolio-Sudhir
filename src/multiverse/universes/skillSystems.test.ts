import { SKILL_GROUPS } from '../../data/portfolio';
import { SKILL_COLORS, SYSTEM_RING, systemPositions, closeUpPose } from './skillSystems';
import { Vec3 } from '../journey';

const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

test('every skill group has its own planet colour', () => {
  const colors = SKILL_GROUPS.map((g) => SKILL_COLORS[g]);
  expect(colors.every(Boolean)).toBe(true);
  expect(new Set(colors).size).toBe(SKILL_GROUPS.length);
});

test('one planet per group on a ring, well spaced', () => {
  const p = systemPositions();
  expect(p).toHaveLength(SKILL_GROUPS.length);
  p.forEach((a) => expect(Math.hypot(...a)).toBeCloseTo(SYSTEM_RING));
  for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) expect(dist(p[i], p[j])).toBeGreaterThan(8);
});

test('the ring is tilted towards the camera so planets do not hide behind each other', () => {
  const ys = systemPositions().map((a) => a[1]);
  expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(SYSTEM_RING * 0.8);
});

describe('closeUpPose', () => {
  const pose = { pos: [-8, 8, 32] as Vec3, look: [-8, 0, 0] as Vec3 };
  const focus: Vec3 = [5, 3, -4];

  test('t = 0 is the overview pose', () => {
    expect(closeUpPose(pose, focus, 9, 0)).toEqual(pose);
  });

  test('t = 1 looks at the planet from the given distance, same direction', () => {
    const p = closeUpPose(pose, focus, 9, 1);
    expect(p.look).toEqual(focus);
    expect(dist(p.pos, p.look)).toBeCloseTo(9);
    const d0 = [pose.pos[0] - pose.look[0], pose.pos[1] - pose.look[1], pose.pos[2] - pose.look[2]];
    const d1 = [p.pos[0] - p.look[0], p.pos[1] - p.look[1], p.pos[2] - p.look[2]];
    const n0 = Math.hypot(...d0);
    d0.forEach((v, k) => expect(d1[k] / 9).toBeCloseTo(v / n0));
  });
});
