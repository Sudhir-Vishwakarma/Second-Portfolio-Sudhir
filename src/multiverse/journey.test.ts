import {
  STEPS, UNIVERSES, worldPose, universeAtZ, universeIndex, next, prev, firstStepOf, universeOf,
  isWarp, hashFor, stepForHash, portalCenter, PORTAL_OFFSET, universeOrigin, framePose, SKILL_STOPS, UNIVERSE_SPACING,
} from './journey';
import { SKILL_GROUPS } from '../data/portfolio';

test('steps follow the agreed order', () => {
  expect(STEPS.map((s) => `${s.universe}:${s.beat}`)).toEqual([
    'home:hero', 'about:summary', 'about:education',
    'skills:group-0', 'skills:group-1', 'skills:group-2', 'skills:group-3', 'skills:group-4', 'skills:group-5', 'skills:group-6',
    'certifications:archive',
    'work:job-0', 'work:job-1', 'work:job-2', 'projects:galaxy', 'contact:station',
  ]);
});

test('every camera pose sits inside its own universe', () => {
  STEPS.forEach((s, i) => expect(universeAtZ(worldPose(i).pos[2])).toBe(universeIndex(s.universe)));
});

test('universeAtZ splits space at each portal plane', () => {
  expect(universeAtZ(1000)).toBe(0);
  expect(universeAtZ(-339.9)).toBe(0);
  expect(universeAtZ(-340)).toBe(1);
  expect(universeAtZ(-740)).toBe(2);
  expect(universeAtZ(-99999)).toBe(UNIVERSES.length - 1);
});

test('next/prev clamp at the ends', () => {
  expect(prev(0)).toBe(0);
  expect(next(0)).toBe(1);
  expect(next(STEPS.length - 1)).toBe(STEPS.length - 1);
});

test('warps only between universes', () => {
  expect(isWarp(0, 1)).toBe(true);
  expect(isWarp(1, 2)).toBe(false);
  expect(isWarp(firstStepOf('skills'), firstStepOf('skills') + 6)).toBe(false);
  expect(isWarp(firstStepOf('skills') + 6, firstStepOf('certifications'))).toBe(true);
  expect(isWarp(0, STEPS.length - 1)).toBe(true);
});

test('hash round trip for every universe', () => {
  UNIVERSES.forEach((u) => {
    const i = firstStepOf(u);
    expect(universeOf(i)).toBe(u);
    expect(stepForHash(hashFor(i))).toBe(i);
  });
  expect(hashFor(firstStepOf('work') + 1)).toBe('#work');
  expect(hashFor(firstStepOf('skills') + 3)).toBe('#skills');
});

test('empty hash is home, unknown hashes are ignored', () => {
  expect(stepForHash('')).toBe(0);
  expect(stepForHash('#')).toBe(0);
  expect(stepForHash('#classic')).toBeNull();
  expect(stepForHash('#lab')).toBeNull();
  expect(stepForHash('#foo')).toBeNull();
});

test('each portal sits on the camera line into its universe', () => {
  UNIVERSES.slice(1).forEach((u) => {
    const c = portalCenter(u);
    const first = STEPS[firstStepOf(u)];
    expect(c).toEqual([first.pos[0], first.pos[1], PORTAL_OFFSET]);
    expect(universeOrigin(u)[2]).toBe(-400 * universeIndex(u));
  });
});

describe('framePose', () => {
  const all = STEPS.map((_, i) => i);

  test('landscape screens get the desktop pose unchanged', () => {
    for (const i of all) expect(framePose(i, 1.6)).toEqual({ ...worldPose(i), fov: 55 });
  });

  test('tall phones get each step phone pose', () => {
    for (const i of all) {
      const o = universeOrigin(STEPS[i].universe);
      const p = framePose(i, 0.46);
      const { phone } = STEPS[i];
      [0, 1, 2].forEach((k) => {
        expect(p.pos[k]).toBeCloseTo(o[k] + phone.pos[k]);
        expect(p.look[k]).toBeCloseTo(o[k] + phone.look[k]);
      });
      expect(p.fov).toBe(phone.fov);
    }
  });

  test('phone poses stay inside their universe and widen the view', () => {
    for (const i of all) {
      const { phone } = STEPS[i];
      expect(phone.fov).toBeGreaterThan(55);
      expect(phone.pos[2]).toBeLessThanOrEqual(PORTAL_OFFSET - 8);
    }
  });

  test('the first phone pose of a universe stays on the portal line', () => {
    UNIVERSES.slice(1).forEach((u) => {
      const { phone } = STEPS[firstStepOf(u)];
      const c = portalCenter(u);
      expect(Math.hypot(phone.pos[0] - c[0], phone.pos[1] - c[1])).toBeLessThanOrEqual(1);
    });
  });

  test('in-between aspects blend from the desktop pose', () => {
    const desk = framePose(0, 1);
    const half = framePose(0, 0.75);
    const phone = framePose(0, 0.5);
    expect(half.fov).toBeCloseTo((desk.fov + phone.fov) / 2);
    expect(half.pos[1]).toBeCloseTo((desk.pos[1] + phone.pos[1]) / 2);
  });
});

test('the skills journey has one stop per resume skill group, in order', () => {
  const skillSteps = STEPS.filter((s) => s.universe === 'skills');
  expect(skillSteps).toHaveLength(SKILL_GROUPS.length);
  expect(SKILL_STOPS).toHaveLength(SKILL_GROUPS.length);
  expect(skillSteps[0].hint).toBe(`Scroll for ${SKILL_GROUPS[1]}`);
  expect(skillSteps[SKILL_GROUPS.length - 1].hint).toBe('Scroll to warp to Certifications');
});

test('skill planets zig-zag away from the portal and stay inside the Skills universe', () => {
  for (let i = 1; i < SKILL_STOPS.length; i++) {
    expect(SKILL_STOPS[i][2]).toBeLessThan(SKILL_STOPS[i - 1][2] - 30);
    expect(Math.sign(SKILL_STOPS[i][0])).not.toBe(Math.sign(SKILL_STOPS[i - 1][0]) || 0);
  }
  expect(SKILL_STOPS[SKILL_STOPS.length - 1][2]).toBeGreaterThan(PORTAL_OFFSET - UNIVERSE_SPACING + 40);
});
