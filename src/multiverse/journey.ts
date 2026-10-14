export type UniverseId = 'home' | 'about' | 'skills' | 'certifications' | 'work' | 'projects' | 'contact';
export type Vec3 = [number, number, number];

export const UNIVERSES: UniverseId[] = ['home', 'about', 'skills', 'certifications', 'work', 'projects', 'contact'];
export const UNIVERSE_LABELS: Record<UniverseId, string> = {
  home: 'Home',
  about: 'About',
  skills: 'Skills',
  certifications: 'Certifications',
  work: 'Work',
  projects: 'Projects',
  contact: 'Contact',
};

export const UNIVERSE_SPACING = 400;
export const PORTAL_OFFSET = 60;
/** Everything is mounted and visible this long at start (behind the loader) so shaders compile. */
export const WARMUP_MS = 1600;
/** Company planets in the Work universe, newest first (local coordinates). */
export const WORK_STOPS: Vec3[] = [[0, 0, 0], [-16, 3, -70], [14, -2, -140]];

export interface Step { universe: UniverseId; beat: string; pos: Vec3; look: Vec3; hint: string }

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const workStep = (i: number, hint: string): Step => ({
  universe: 'work',
  beat: `job-${i}`,
  pos: add(WORK_STOPS[i], [-9, 2.5, 18]),
  look: add(WORK_STOPS[i], [-6, 0, 0]),
  hint,
});

/** Camera poses are local to each universe's origin. */
export const STEPS: Step[] = [
  { universe: 'home', beat: 'hero', pos: [-7, 7, 30], look: [-7, 0, 0], hint: 'Scroll to warp to About' },
  { universe: 'about', beat: 'summary', pos: [-6, 2, 30], look: [-6, 0, 0], hint: 'Scroll for Education' },
  { universe: 'about', beat: 'education', pos: [-4, 9, 22], look: [-4, 0, 0], hint: 'Scroll to warp to Skills' },
  { universe: 'skills', beat: 'belt', pos: [-8, 8, 32], look: [-8, 0, 0], hint: 'Scroll to warp to Certifications' },
  { universe: 'certifications', beat: 'archive', pos: [-7, 3, 28], look: [-7, 0, 0], hint: 'Scroll to warp to Work' },
  workStep(0, 'Scroll for the next role'),
  workStep(1, 'Scroll for the next role'),
  workStep(2, 'Scroll to warp to Projects'),
  { universe: 'projects', beat: 'galaxy', pos: [0, 26, 50], look: [0, 0, 0], hint: 'Click a star · Scroll to warp to Contact' },
  { universe: 'contact', beat: 'station', pos: [-8, 3, 26], look: [-8, 1, 0], hint: 'Scroll up to travel back' },
];

const LAST = STEPS.length - 1;
const clamp = (i: number) => Math.max(0, Math.min(LAST, i));

export const universeIndex = (u: UniverseId) => UNIVERSES.indexOf(u);
export const universeOrigin = (u: UniverseId): Vec3 => [0, 0, -UNIVERSE_SPACING * universeIndex(u)];
export const universeOf = (i: number): UniverseId => STEPS[clamp(i)].universe;
export const firstStepOf = (u: UniverseId) => STEPS.findIndex((s) => s.universe === u);
export const next = (i: number) => clamp(i + 1);
export const prev = (i: number) => clamp(i - 1);
export const isWarp = (from: number, to: number) => universeOf(from) !== universeOf(to);

/** Portal ring centre, local to its universe: on the straight camera line into the first step. */
export function portalCenter(u: UniverseId): Vec3 {
  const first = STEPS[firstStepOf(u)];
  return [first.pos[0], first.pos[1], PORTAL_OFFSET];
}

export function worldPose(i: number): { pos: Vec3; look: Vec3 } {
  const s = STEPS[clamp(i)];
  const o = universeOrigin(s.universe);
  return { pos: add(o, s.pos), look: add(o, s.look) };
}

export const hashFor = (i: number) => `#${universeOf(i)}`;

export function stepForHash(hash: string): number | null {
  const id = hash.replace(/^#/, '');
  if (id === '') return 0;
  return (UNIVERSES as string[]).includes(id) ? firstStepOf(id as UniverseId) : null;
}

/** Which universe owns world-space z: universe n spans (portal n+1, portal n]. */
export function universeAtZ(z: number): number {
  const n = Math.floor((PORTAL_OFFSET - z) / UNIVERSE_SPACING);
  return Math.max(0, Math.min(UNIVERSES.length - 1, n));
}
