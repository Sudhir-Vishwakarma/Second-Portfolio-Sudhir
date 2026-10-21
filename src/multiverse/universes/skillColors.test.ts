import { SKILL_GROUPS } from '../../data/portfolio';
import { SKILL_COLORS } from './skillColors';

test('every skill group has its own colour', () => {
  const colors = SKILL_GROUPS.map((g) => SKILL_COLORS[g]);
  expect(colors.every(Boolean)).toBe(true);
  expect(new Set(colors).size).toBe(SKILL_GROUPS.length);
});
