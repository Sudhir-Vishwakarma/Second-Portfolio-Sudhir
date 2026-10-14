import { MOBILE_SECTIONS, sectionForHash } from './sections';
import { PALETTES } from '../multiverse/fx/palettes';

test('six sections in nav order with labels and accents', () => {
  expect(MOBILE_SECTIONS.map((s) => s.id)).toEqual(['home', 'about', 'skills', 'work', 'projects', 'contact']);
  expect(MOBILE_SECTIONS.map((s) => s.label)).toEqual(['Home', 'About', 'Skills', 'Work', 'Projects', 'Contact']);
  MOBILE_SECTIONS.forEach((s) => expect(s.accent).toBe(PALETTES[s.id].atmos));
});

test('deep links land on the right section', () => {
  expect(sectionForHash('#work')).toEqual({ id: 'work', anchor: 'work' });
  expect(sectionForHash('#certifications')).toEqual({ id: 'about', anchor: 'certifications' });
  expect(sectionForHash('#home')).toEqual({ id: 'home', anchor: 'home' });
});

test('empty, classic and unknown hashes are ignored', () => {
  expect(sectionForHash('')).toBeNull();
  expect(sectionForHash('#')).toBeNull();
  expect(sectionForHash('#classic')).toBeNull();
  expect(sectionForHash('#foo')).toBeNull();
});
