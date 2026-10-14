import { CONSTELLATIONS, Constellation, Project, newestFirst } from '../../data/portfolio';

export interface GalaxyStar { title: string; arm: Constellation; featured: boolean; x: number; y: number; r: number }

export const ARM_COLORS: Record<Constellation, string> = {
  'CRM Platforms': '#f97316',
  'Salesforce Portals': '#38bdf8',
  'Real Estate': '#a3e635',
  'Web Apps': '#c084fc',
};
const ARM_START: Record<Constellation, number> = {
  'CRM Platforms': 0,
  'Salesforce Portals': Math.PI / 2,
  'Real Estate': Math.PI,
  'Web Apps': (3 * Math.PI) / 2,
};
const ARM_TWIST = 2.2;
const INNER = 10;
const OUTER = 42;

/** Point at t (0 = core end, 1 = outer end) along an arm, in percent of the square galaxy. */
export function armPoint(arm: Constellation, t: number): { x: number; y: number } {
  const r = INNER + t * (OUTER - INNER);
  const a = ARM_START[arm] + t * ARM_TWIST;
  return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
}

export function armPath(arm: Constellation): string {
  const pts = Array.from({ length: 25 }, (_, i) => armPoint(arm, i / 24));
  return `M${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')}`;
}

/** One star per project on its category's arm, newest nearest the core; featured stars are larger. */
export function galaxyLayout(items: readonly Project[]): GalaxyStar[] {
  const ordered = newestFirst(items);
  const stars: GalaxyStar[] = [];
  for (const arm of CONSTELLATIONS) {
    const onArm = ordered.filter((p) => p.constellation === arm);
    onArm.forEach((p, i) => {
      const t = onArm.length === 1 ? 0.5 : i / (onArm.length - 1);
      stars.push({ title: p.title, arm, featured: !!p.featured, ...armPoint(arm, t), r: p.featured ? 2.6 : 1.6 });
    });
  }
  return stars;
}

/** Index of the point nearest (x, y) within maxDist, or -1. Ties keep the first. */
export function nearestStar(points: readonly { x: number; y: number }[], x: number, y: number, maxDist: number): number {
  let best = -1;
  let bestDist = Infinity;
  points.forEach((p, i) => {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d <= maxDist && d < bestDist) {
      best = i;
      bestDist = d;
    }
  });
  return best;
}
