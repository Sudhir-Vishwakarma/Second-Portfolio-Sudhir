import { Vec3 } from '../journey';
import { Constellation, CONSTELLATIONS } from '../../data/portfolio';

/** n points evenly around a ring in the XZ plane, with a gentle vertical wave. */
export function ringLayout(n: number, radius: number): Vec3[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * radius, Math.sin(a * 3) * 1.2, Math.sin(a) * radius] as Vec3;
  });
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Constellations sit at the four compass points; stars spiral out from each centre (sunflower pattern). */
export function layoutGalaxy(items: { constellation: Constellation }[]): { positions: Vec3[]; centers: Record<Constellation, Vec3> } {
  const centers = {} as Record<Constellation, Vec3>;
  CONSTELLATIONS.forEach((c, i) => {
    const a = (i / CONSTELLATIONS.length) * Math.PI * 2 + Math.PI / 4;
    centers[c] = [Math.cos(a) * 16, 0, Math.sin(a) * 16];
  });
  const seen: Record<string, number> = {};
  const positions = items.map(({ constellation }) => {
    const j = (seen[constellation] = (seen[constellation] ?? -1) + 1);
    const r = 2 + 1.6 * Math.sqrt(j);
    const a = j * GOLDEN;
    const [cx, cy, cz] = centers[constellation];
    return [cx + Math.cos(a) * r, cy + ((j % 3) - 1) * 1.2, cz + Math.sin(a) * r] as Vec3;
  });
  return { positions, centers };
}
