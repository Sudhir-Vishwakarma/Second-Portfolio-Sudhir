import { chooseMode, classicSectionFor, DeviceEnv } from './mode';

const desktop: DeviceEnv = { webgl2: true, reducedMotion: false, width: 1440, coarsePointer: false, deviceMemory: 8 };

test('a capable desktop gets the multiverse', () => {
  expect(chooseMode(desktop, '')).toBe('multiverse');
  expect(chooseMode({ ...desktop, deviceMemory: undefined }, '#about')).toBe('multiverse');
});

test('#classic always wins', () => {
  expect(chooseMode(desktop, '#classic')).toBe('classic');
  expect(chooseMode({ ...desktop, width: 390, coarsePointer: true }, '#classic')).toBe('classic');
});

test.each([
  ['narrow viewport', { width: 767 }],
  ['touch-first device', { coarsePointer: true }],
  ['reduced-motion phone', { width: 390, coarsePointer: true, reducedMotion: true }],
  ['phone without WebGL2', { width: 390, coarsePointer: true, webgl2: false }],
])('%s gets the mobile site', (_name, patch) => {
  expect(chooseMode({ ...desktop, ...patch }, '')).toBe('mobile');
});

test.each([
  ['no WebGL2', { webgl2: false }],
  ['reduced motion', { reducedMotion: true }],
  ['low memory', { deviceMemory: 2 }],
])('desktop with %s gets the classic site', (_name, patch) => {
  expect(chooseMode({ ...desktop, ...patch }, '')).toBe('classic');
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
