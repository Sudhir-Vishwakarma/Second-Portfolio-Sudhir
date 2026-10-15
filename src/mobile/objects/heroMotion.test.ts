import { DRAG_THRESHOLD, MAX_DRAG_TILT, MAX_SCROLL_TILT, dragTilt, isDrag, scrollHero } from './heroMotion';

test('constants', () => {
  expect([DRAG_THRESHOLD, MAX_DRAG_TILT, MAX_SCROLL_TILT]).toEqual([8, 12, 8]);
});

test('scrollHero drifts at 0.4x the scroll (the hero moves 0.6x as fast as the page), clamped, and tilts back up to 8 degrees', () => {
  expect(scrollHero(0, 300)).toEqual({ y: 0, rx: 0 });
  const mid = scrollHero(100, 300);
  expect(mid.y).toBeCloseTo(40);
  expect(mid.rx).toBeCloseTo(8 / 3);
  expect(scrollHero(1000, 300)).toEqual({ y: 75, rx: 8 });
  expect(scrollHero(-50, 300)).toEqual({ y: 0, rx: 0 });
  expect(scrollHero(100, 0)).toEqual({ y: 0, rx: 0 });
});

test('dragTilt follows the finger up to 12 degrees', () => {
  expect(dragTilt(0, 0, 300)).toEqual({ rx: 0, ry: 0 });
  expect(dragTilt(75, 0, 300)).toEqual({ rx: 0, ry: 6 });
  expect(dragTilt(600, -600, 300)).toEqual({ rx: 12, ry: 12 });
  expect(dragTilt(-600, 600, 300)).toEqual({ rx: -12, ry: -12 });
  expect(dragTilt(50, 50, 0)).toEqual({ rx: 0, ry: 0 });
});

test('isDrag needs 8 px of movement', () => {
  expect(isDrag(5, 5)).toBe(false);
  expect(isDrag(6, 6)).toBe(true);
  expect(isDrag(0, -8)).toBe(true);
});
