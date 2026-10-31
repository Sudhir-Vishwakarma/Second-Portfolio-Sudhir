import { SKILL_GROUPS } from '../../data/portfolio';
import { SKILL_COLORS } from './skillColors';

test('Languages has an accent and the remaining skill groups share a neutral colour', () => {
  const colors = SKILL_GROUPS.map((g) => SKILL_COLORS[g]);
  expect(colors.every(Boolean)).toBe(true);
  expect(SKILL_COLORS.Languages).toBe('#38bdf8');
  expect(new Set(colors.filter((color) => color !== SKILL_COLORS.Languages))).toEqual(new Set(['#cbd5e1']));
});
