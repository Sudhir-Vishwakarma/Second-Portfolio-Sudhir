import { ZOOM_MIN, ZOOM_MAX, clampZoom, pinchZoom, zoomedPose, clampFocus } from './zoom';
import { Vec3 } from './journey';

const pose = { pos: [0, 26, 52] as Vec3, look: [0, -9, 0] as Vec3, fov: 84 };
const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

test('zoom level stays between full view and the closest zoom', () => {
  expect(clampZoom(5)).toBe(ZOOM_MAX);
  expect(clampZoom(0.01)).toBe(ZOOM_MIN);
  expect(clampZoom(0.5)).toBe(0.5);
});

test('spreading the fingers zooms in, pinching them together zooms out', () => {
  expect(pinchZoom(1, 100, 200)).toBeCloseTo(0.5); // fingers twice as far apart: twice as close
  expect(pinchZoom(0.5, 200, 100)).toBe(ZOOM_MAX);
  expect(pinchZoom(0.5, 100, 1000)).toBe(ZOOM_MIN);
  expect(pinchZoom(0.6, 100, 0)).toBe(0.6); // a degenerate pinch changes nothing
});

test('full zoom leaves the pose untouched', () => {
  expect(zoomedPose(pose, 1, [10, 0, 10])).toEqual({ pos: pose.pos, look: pose.look });
});

test('zooming in moves the camera towards the pinch point', () => {
  const focus: Vec3 = [12, 0, 8];
  const half = zoomedPose(pose, 0.5, focus);
  const closest = zoomedPose(pose, ZOOM_MIN, focus);
  expect(dist(half.pos, half.look)).toBeCloseTo(dist(pose.pos, pose.look) * 0.5);
  expect(closest.look).toEqual(focus);
  expect(dist(closest.pos, focus)).toBeLessThan(dist(half.pos, half.look));
});

test('the zoom focus is kept inside the galaxy', () => {
  expect(clampFocus([100, 3, 0], 22)).toEqual([22, 0, 0]);
  expect(clampFocus([5, 3, 5], 22)).toEqual([5, 0, 5]);
});
