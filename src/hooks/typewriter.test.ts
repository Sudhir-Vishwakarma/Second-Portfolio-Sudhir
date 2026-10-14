import { nextTypewriterState, typewriterDelay, TYPE_MS, DELETE_MS, HOLD_MS, TypewriterState } from './typewriter';

const words = ['AB', 'C'];
const run = (s: TypewriterState, n: number) => {
  const seen: string[] = [];
  for (let i = 0; i < n; i++) { s = nextTypewriterState(s, words); seen.push(`${s.text}${s.deleting ? '<' : ''}`); }
  return seen;
};

test('types, holds, deletes, then moves to the next word', () => {
  expect(run({ wordIndex: 0, text: '', deleting: false }, 7)).toEqual(['A', 'AB', 'AB<', 'A<', '<', '', 'C']);
});

test('uses the classic timings', () => {
  expect(typewriterDelay({ wordIndex: 0, text: 'A', deleting: false }, words)).toBe(TYPE_MS);
  expect(typewriterDelay({ wordIndex: 0, text: 'AB', deleting: false }, words)).toBe(HOLD_MS);
  expect(typewriterDelay({ wordIndex: 0, text: 'A', deleting: true }, words)).toBe(DELETE_MS);
  expect([TYPE_MS, DELETE_MS, HOLD_MS]).toEqual([100, 50, 2000]);
});

test('wraps around the word list', () => {
  expect(nextTypewriterState({ wordIndex: 1, text: '', deleting: true }, words)).toEqual({ wordIndex: 0, text: '', deleting: false });
});
