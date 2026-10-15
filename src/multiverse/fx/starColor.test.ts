import { starColor } from './starColor';

test('cool stars are orange-red, sun-like stars near white, hot stars blue-white', () => {
  const [r1, g1, b1] = starColor(1500);
  expect(r1).toBe(1);
  expect(g1).toBeLessThan(0.6);
  expect(b1).toBeLessThan(0.3);
  starColor(6600).forEach((v) => expect(v).toBeGreaterThan(0.9));
  const [r3, , b3] = starColor(10000);
  expect(b3).toBe(1);
  expect(r3).toBeLessThan(0.85);
});

test('blueness rises with temperature and inputs are clamped', () => {
  let last = -Infinity;
  for (let k = 2000; k <= 20000; k += 1000) {
    const [r, , b] = starColor(k);
    const ratio = b / r;
    expect(ratio).toBeGreaterThanOrEqual(last);
    last = ratio;
  }
  expect(starColor(-5)).toEqual(starColor(1000));
  expect(starColor(1e9)).toEqual(starColor(40000));
});
