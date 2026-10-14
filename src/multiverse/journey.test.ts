import {
  STEPS, UNIVERSES, worldPose, universeAtZ, universeIndex, next, prev, firstStepOf, universeOf,
  isWarp, hashFor, stepForHash, portalCenter, PORTAL_OFFSET, universeOrigin,
} from './journey';

test('steps follow the agreed order', () => {
  expect(STEPS.map((s) => `${s.universe}:${s.beat}`)).toEqual([
    'home:hero', 'about:summary', 'about:education', 'skills:belt', 'certifications:archive',
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
  expect(isWarp(5, 7)).toBe(false);
  expect(isWarp(0, 9)).toBe(true);
});

test('hash round trip for every universe', () => {
  UNIVERSES.forEach((u) => {
    const i = firstStepOf(u);
    expect(universeOf(i)).toBe(u);
    expect(stepForHash(hashFor(i))).toBe(i);
  });
  expect(hashFor(6)).toBe('#work');
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
