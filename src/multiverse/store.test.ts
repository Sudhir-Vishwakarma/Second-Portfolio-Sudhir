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
