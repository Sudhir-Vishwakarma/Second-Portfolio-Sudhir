// universes/skillSystems.ts — the Skills universe: one planet per skill group, its skills as asteroid moons
import { SkillGroup, SKILL_GROUPS } from '../../data/portfolio';
import { Vec3 } from '../journey';

export const SKILL_COLORS: Record<SkillGroup, string> = {
  Languages: '#38bdf8',
  Database: '#a3e635',
  Framework: '#fb923c',
  'Version Control': '#f472b6',
  Tools: '#facc15',
  'Operating System': '#2dd4bf',
  'AI Tools': '#c084fc',
};

/** Radius of the ring the group planets sit on (local units). */
export const SYSTEM_RING = 12;
/** The ring leans towards the viewer by this much (radians) so front planets don't hide back ones. */
export const RING_TILT = 0.75;
/** How close the camera comes to a tapped planet: desktop, and a tall phone screen. */
export const CLOSE_UP_DISTANCE = { desktop: 20, phone: 16 };

/** Group planet centres, local to the Skills universe, with the ring tilt already applied. */
export function systemPositions(): Vec3[] {
  const c = Math.cos(RING_TILT);
  const s = Math.sin(RING_TILT);
  return SKILL_GROUPS.map((_, i) => {
    const a = (i / SKILL_GROUPS.length) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * SYSTEM_RING;
    const z = Math.sin(a) * SYSTEM_RING;
    // Rotate about x: the far side of the ring rises, the near side drops.
    return [x, -z * s, z * c] as Vec3;
  });
}

/** Pose blended (t: 0 → 1) from the overview towards a close-up of `focus`, keeping the viewing direction. */
export function closeUpPose(pose: { pos: Vec3; look: Vec3 }, focus: Vec3, distance: number, t: number): { pos: Vec3; look: Vec3 } {
  if (t <= 0) return pose;
  const { pos, look } = pose;
  const d: Vec3 = [pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]];
  const len = Math.hypot(...d) || 1;
  const at: Vec3 = [look[0] + (focus[0] - look[0]) * t, look[1] + (focus[1] - look[1]) * t, look[2] + (focus[2] - look[2]) * t];
  const r = len + (distance - len) * t;
  return { pos: [at[0] + (d[0] / len) * r, at[1] + (d[1] / len) * r, at[2] + (d[2] / len) * r], look: at };
}
