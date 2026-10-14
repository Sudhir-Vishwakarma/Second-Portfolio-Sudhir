import { COLLAPSED_BULLETS, visibleBullets, hasHiddenBullets } from './bullets';

const five = ['a', 'b', 'c', 'd', 'e'];

test('collapsed shows the first two, expanded shows all', () => {
  expect(COLLAPSED_BULLETS).toBe(2);
  expect(visibleBullets(five, false)).toEqual(['a', 'b']);
  expect(visibleBullets(five, true)).toEqual(five);
});

test('short lists are unchanged and report nothing hidden', () => {
  expect(visibleBullets(['a'], false)).toEqual(['a']);
  expect(hasHiddenBullets(['a', 'b'])).toBe(false);
  expect(hasHiddenBullets(five)).toBe(true);
});

test('never mutates the input', () => {
  const src = [...five];
  visibleBullets(src, true).push('x');
  expect(src).toEqual(five);
});
