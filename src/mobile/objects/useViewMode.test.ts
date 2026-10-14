import { readViewMode, writeViewMode } from './useViewMode';

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => (m.has(k) ? m.get(k)! : null), setItem: (k: string, v: string) => void m.set(k, v) };
};

test('defaults to orbit', () => {
  expect(readViewMode('skills', memory())).toBe('orbit');
});

test('remembers the choice per section', () => {
  const s = memory();
  writeViewMode('skills', 'list', s);
  expect(readViewMode('skills', s)).toBe('list');
  expect(readViewMode('work', s)).toBe('orbit');
  expect(s.getItem('mb-view-skills')).toBe('list');
});

test('unknown stored values fall back to orbit', () => {
  const s = memory();
  s.setItem('mb-view-skills', 'grid');
  expect(readViewMode('skills', s)).toBe('orbit');
});

test('blocked or missing storage falls back to orbit and never throws', () => {
  const blocked = {
    getItem: (): string | null => { throw new Error('denied'); },
    setItem: (): void => { throw new Error('denied'); },
  };
  expect(readViewMode('skills', blocked)).toBe('orbit');
  expect(() => writeViewMode('skills', 'list', blocked)).not.toThrow();
  expect(readViewMode('skills', null)).toBe('orbit');
  expect(() => writeViewMode('skills', 'list', null)).not.toThrow();
});
