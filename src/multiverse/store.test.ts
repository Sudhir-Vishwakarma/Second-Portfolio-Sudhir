import { useJourney, SETTLE_MS } from './store';

const S = () => useJourney.getState();
beforeEach(() => S().reset(0));

test('go moves one step and warps between universes', () => {
  S().go(1, 1000);
  expect(S()).toMatchObject({ step: 1, moving: true, moveKind: 'warp' });
});

test('input is ignored while the camera is moving', () => {
  S().go(1, 1000);
  S().go(1, 1001);
  S().jump(8, 1002);
  expect(S().step).toBe(1);
});

test('trackpad inertia right after arriving is ignored', () => {
  S().go(1, 1000);
  S().arrive(2000);
  S().go(1, 2000 + SETTLE_MS - 1);
  expect(S().step).toBe(1);
  S().go(1, 2000 + SETTLE_MS);
  expect(S()).toMatchObject({ step: 2, moveKind: 'glide' });
});

test('clamps at both ends without starting a move', () => {
  S().go(-1, 1000);
  expect(S()).toMatchObject({ step: 0, moving: false });
  S().reset(9);
  S().go(1, 1000);
  expect(S()).toMatchObject({ step: 9, moving: false });
});

test('an open modal blocks go, but jump closes it', () => {
  S().openModal({ kind: 'cv' });
  S().go(1, 1000);
  expect(S().step).toBe(0);
  S().jump(8, 1000);
  expect(S()).toMatchObject({ step: 8, modal: null, moveKind: 'warp' });
});

test('reset puts the camera in the step universe', () => {
  S().reset(6);
  expect(S()).toMatchObject({ step: 6, cameraUniverse: 4, moving: false, modal: null });
});

test('setCameraUniverse, fireBeam and setBooted', () => {
  S().setCameraUniverse(3);
  S().fireBeam(1234);
  S().setBooted();
  expect(S()).toMatchObject({ cameraUniverse: 3, beamAt: 1234, booted: true });
});

test('reset clears booted so a remounted multiverse waits for its loader', () => {
  S().setBooted();
  expect(S().booted).toBe(true);
  S().reset(2);
  expect(S().booted).toBe(false);
});

test('the Read more sheet blocks swipe travel until it closes', () => {
  const s = useJourney.getState();
  s.reset(0);
  useJourney.getState().openModal({ kind: 'details' });
  useJourney.getState().go(1, 10_000);
  expect(useJourney.getState().step).toBe(0);
  useJourney.getState().closeModal();
  useJourney.getState().go(1, 10_000);
  expect(useJourney.getState().step).toBe(1);
});

test('tapping an object picks it, tapping again or travelling clears it', () => {
  S().reset(0);
  S().pick('moon-1');
  expect(S().picked).toBe('moon-1');
  S().pick('moon-2');
  expect(S().picked).toBe('moon-2');
  S().pick('moon-2');
  expect(S().picked).toBeNull();
  S().pick('skill-3');
  S().jump(1, 10_000);
  expect(S().picked).toBeNull();
});

test('a details sheet can be opened for a specific step', () => {
  S().reset(0);
  S().openModal({ kind: 'details', step: 6 });
  expect(S().modal).toEqual({ kind: 'details', step: 6 });
  expect(S().step).toBe(0);
});

test('galaxy zoom is clamped, remembers where the pinch started, and resets on travel', () => {
  S().reset(8);
  S().setZoom(0.01, [0.2, -0.1]);
  expect(S().zoom).toBe(0.3);
  expect(S().zoomAnchor).toEqual([0.2, -0.1]);
  S().setZoomFocus([4, 0, -6]);
  expect(S().zoomAnchor).toBeNull();
  expect(S().zoomFocus).toEqual([4, 0, -6]);
  S().jump(9, 10_000);
  expect(S().zoom).toBe(1);
  expect(S().zoomFocus).toEqual([0, 0, 0]);
});

test('a tapped skill planet stays in focus until cleared or the visitor travels', () => {
  S().reset(3);
  S().focusSkill(2);
  expect(S().skillFocus).toBe(2);
  S().focusSkill(null);
  expect(S().skillFocus).toBeNull();
  S().focusSkill(4);
  S().jump(4, 10_000);
  expect(S().skillFocus).toBeNull();
});
