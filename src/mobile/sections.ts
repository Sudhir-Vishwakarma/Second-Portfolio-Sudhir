import { PALETTES } from '../multiverse/fx/palettes';

export type MobileSectionId = 'home' | 'about' | 'skills' | 'work' | 'projects' | 'contact';
export interface MobileSection { id: MobileSectionId; label: string; accent: string }

const LABELS: Record<MobileSectionId, string> = {
  home: 'Home',
  about: 'About',
  skills: 'Skills',
  work: 'Work',
  projects: 'Projects',
  contact: 'Contact',
};

export const MOBILE_SECTIONS: MobileSection[] = (['home', 'about', 'skills', 'work', 'projects', 'contact'] as MobileSectionId[]).map(
  (id) => ({ id, label: LABELS[id], accent: PALETTES[id].atmos })
);

/** Map a URL hash to the section (and in-page anchor) to scroll to. */
export function sectionForHash(hash: string): { id: MobileSectionId; anchor: string } | null {
  const key = hash.replace(/^#/, '');
  if (key === 'certifications') return { id: 'about', anchor: 'certifications' };
  const match = MOBILE_SECTIONS.find((s) => s.id === key);
  return match ? { id: match.id, anchor: match.id } : null;
}
