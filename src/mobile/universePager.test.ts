import {
  UNIVERSE_ORDER, LAST_INDEX, clampIndex, nextIndex, prevIndex, accentOf, edgeState, travelDirection,
  INITIAL_WHEEL, wheelStep, WARP_MS, SWAP_MS, warpFrame, lerpColor, universeForHash,
} from './universePager';
import { PALETTES } from '../multiverse/fx/palettes';

test('order and index helpers', () => {
  expect(UNIVERSE_ORDER).toEqual(['home', 'about', 'skills', 'work', 'projects', 'contact']);
  expect(LAST_INDEX).toBe(5);
  expect([clampIndex(-3), clampIndex(2), clampIndex(9)]).toEqual([0, 2, 5]);
  expect([nextIndex(0), nextIndex(5), prevIndex(0), prevIndex(3)]).toEqual([1, 5, 0, 2]);
  expect(accentOf(4)).toBe(PALETTES.projects.atmos);
});

test('edgeState tolerates sub-pixel scroll positions', () => {
  expect(edgeState(0, 600, 2000)).toEqual({ atTop: true, atBottom: false });
  expect(edgeState(1399, 600, 2000)).toEqual({ atTop: false, atBottom: true });
  expect(edgeState(700, 600, 2000)).toEqual({ atTop: false, atBottom: false });
  expect(edgeState(0, 600, 500)).toEqual({ atTop: true, atBottom: true });
});

test('travelDirection needs an edge and a full pull', () => {
  expect(travelDirection({ atTop: false, atBottom: true, pull: 80 })).toBe('next');
  expect(travelDirection({ atTop: false, atBottom: true, pull: 79 })).toBeNull();
  expect(travelDirection({ atTop: true, atBottom: false, pull: -80 })).toBe('prev');
  expect(travelDirection({ atTop: false, atBottom: false, pull: 300 })).toBeNull();
  expect(travelDirection({ atTop: false, atBottom: false, pull: -300 })).toBeNull();
  expect(travelDirection({ atTop: true, atBottom: false, pull: 200 })).toBeNull();
  expect(travelDirection({ atTop: true, atBottom: true, pull: 90 })).toBe('next');
  expect(travelDirection({ atTop: true, atBottom: true, pull: -90 })).toBe('prev');
});

test('wheelStep ignores inertia right after reaching the edge, then needs a full pull', () => {
  const at = { atTop: false, atBottom: true };
  let r = wheelStep(INITIAL_WHEEL, { deltaY: 60, ...at, now: 1000 });
  expect(r.travel).toBeNull(); // arms
  r = wheelStep(r.state, { deltaY: 200, ...at, now: 1100 });
  expect(r.travel).toBeNull(); // still inside the 300 ms arming window: ignored
  r = wheelStep(r.state, { deltaY: 50, ...at, now: 1350 });
  expect(r.travel).toBeNull(); // 50 < 80
  r = wheelStep(r.state, { deltaY: 40, ...at, now: 1400 });
  expect(r.travel).toBe('next'); // 90 >= 80
  expect(r.state).toEqual(INITIAL_WHEEL);
});

test('wheelStep resets when not pushing an edge, and after idle gaps', () => {
  const at = { atTop: false, atBottom: true };
  let r = wheelStep(INITIAL_WHEEL, { deltaY: 60, ...at, now: 0 });
  r = wheelStep(r.state, { deltaY: 70, ...at, now: 400 });
  expect(r.travel).toBeNull();
  r = wheelStep(r.state, { deltaY: 70, ...at, now: 1000 }); // > 250 ms idle: the accumulator restarts at 70
  expect(r.travel).toBeNull();
  expect(wheelStep(r.state, { deltaY: -50, ...at, now: 1050 }).state).toEqual(INITIAL_WHEEL); // scrolling back up
  const top = { atTop: true, atBottom: false };
  let u = wheelStep(INITIAL_WHEEL, { deltaY: -60, ...top, now: 0 });
  u = wheelStep(u.state, { deltaY: -90, ...top, now: 400 });
  expect(u.travel).toBe('prev');
});

test('warpFrame phases and boundaries', () => {
  expect(warpFrame(0)).toMatchObject({ phase: 'launch', speed: 0, flash: 0, mix: 0, done: false });
  expect(warpFrame(349).phase).toBe('launch');
  expect(warpFrame(349).speed).toBeGreaterThan(0.99);
  expect(warpFrame(350)).toMatchObject({ phase: 'hyperspace', speed: 1, mix: 0 });
  expect(warpFrame(749).phase).toBe('hyperspace');
  expect(warpFrame(749).flash).toBeGreaterThan(0.99);
  expect(warpFrame(SWAP_MS)).toMatchObject({ phase: 'arrival', speed: 1, flash: 1, mix: 1 });
  expect(warpFrame(1199).phase).toBe('arrival');
  expect(warpFrame(1199).speed).toBeLessThan(0.01);
  expect(warpFrame(1199).flash).toBe(0);
  expect(warpFrame(WARP_MS)).toMatchObject({ phase: 'idle', speed: 0, streak: 0, flash: 0, done: true });
  expect(warpFrame(-5)).toMatchObject({ phase: 'idle', done: false });
});

test('flash peaks at the swap and the colour mix never goes backwards', () => {
  const peak = warpFrame(SWAP_MS).flash;
  let lastMix = 0;
  for (let t = 0; t <= WARP_MS; t += 10) {
    const f = warpFrame(t);
    expect(f.flash).toBeLessThanOrEqual(peak);
    expect(f.mix).toBeGreaterThanOrEqual(lastMix);
    lastMix = f.mix;
  }
});

test('lerpColor blends hex colours', () => {
  expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('rgb(128,128,128)');
  expect(lerpColor('#ff0000', '#0000ff', 0)).toBe('rgb(255,0,0)');
  expect(lerpColor('#ff0000', '#0000ff', 2)).toBe('rgb(0,0,255)');
});

test('universeForHash maps deep links', () => {
  expect(universeForHash('#work')).toEqual({ index: 3, anchor: 'work' });
  expect(universeForHash('#certifications')).toEqual({ index: 1, anchor: 'certifications' });
  expect(universeForHash('')).toBeNull();
  expect(universeForHash('#foo')).toBeNull();
  expect(universeForHash('#classic')).toBeNull();
});
