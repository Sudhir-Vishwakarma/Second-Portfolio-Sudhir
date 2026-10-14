import { shouldUseClassic, classicSectionFor, DeviceEnv } from './mode';

const desktop: DeviceEnv = { webgl2: true, reducedMotion: false, width: 1440, coarsePointer: false, deviceMemory: 8 };

test('a capable desktop gets the multiverse', () => {
  expect(shouldUseClassic(desktop)).toBe(false);
  expect(shouldUseClassic({ ...desktop, deviceMemory: undefined })).toBe(false);
});

test.each([
  ['no WebGL2', { webgl2: false }],
  ['reduced motion', { reducedMotion: true }],
  ['narrow viewport', { width: 767 }],
  ['touch-first device', { coarsePointer: true }],
  ['low memory', { deviceMemory: 2 }],
])('%s gets the classic site', (_name, patch) => {
  expect(shouldUseClassic({ ...desktop, ...patch })).toBe(true);
});

test('maps universe hashes onto classic sections', () => {
  expect(classicSectionFor('#about')).toBe('about');
  expect(classicSectionFor('#skills')).toBe('about');
  expect(classicSectionFor('#certifications')).toBe('about');
  expect(classicSectionFor('#work')).toBe('work');
  expect(classicSectionFor('#projects')).toBe('projects');
  expect(classicSectionFor('#contact')).toBe('contacts');
  expect(classicSectionFor('')).toBe('home');
  expect(classicSectionFor('#classic')).toBe('home');
  expect(classicSectionFor('#foo')).toBe('home');
});
