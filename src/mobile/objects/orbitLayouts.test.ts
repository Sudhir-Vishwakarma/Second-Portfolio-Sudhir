import { CAREER_PATH, careerPoints, ringPoints } from './orbitLayouts';

test('ringPoints spaces n points evenly, starting at the top', () => {
  const pts = ringPoints(4, 20);
  const expected = [{ x: 50, y: 30 }, { x: 70, y: 50 }, { x: 50, y: 70 }, { x: 30, y: 50 }];
  pts.forEach((p, i) => {
    expect(p.x).toBeCloseTo(expected[i].x);
    expect(p.y).toBeCloseTo(expected[i].y);
  });
  const shifted = ringPoints(1, 10, 0);
  expect(shifted[0].x).toBeCloseTo(60);
  expect(shifted[0].y).toBeCloseTo(50);
});

test('careerPoints run from the oldest job (bottom left) to the newest (top right)', () => {
  const pts = careerPoints(3);
  expect(pts[0].x).toBeCloseTo(84);
  expect(pts[0].y).toBeCloseTo(28);
  expect(pts[1].x).toBeCloseTo(45);
  expect(pts[1].y).toBeCloseTo(37.5);
  expect(pts[2].x).toBeCloseTo(16);
  expect(pts[2].y).toBeCloseTo(78);
  expect(careerPoints(1)[0].x).toBeCloseTo(84);
  expect(CAREER_PATH).toBe('M16 78 Q40 22 84 28');
});
