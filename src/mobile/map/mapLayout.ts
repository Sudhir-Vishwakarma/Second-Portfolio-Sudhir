export interface MapPoint { x: number; y: number }

const INNER = 16;
const OUTER = 42;
const STEP = 2.4; // radians between neighbours: a sunflower-like spiral keeps them apart

/** Positions (percent of a square map) for n universes on a spiral around the core at (50, 50). */
export function mapLayout(n: number, rotation = 0): MapPoint[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const r = INNER + t * (OUTER - INNER);
    const a = rotation - Math.PI / 2 + i * STEP;
    return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
  });
}
