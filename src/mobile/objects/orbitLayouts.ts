export interface OrbitPoint { x: number; y: number }

/** n points evenly spaced on a circle of `radius` (percent) around (50, 50), the first at angle `start`. */
export function ringPoints(n: number, radius: number, start = -Math.PI / 2): OrbitPoint[] {
  return Array.from({ length: n }, (_, i) => {
    const a = start + (i / n) * Math.PI * 2;
    return { x: 50 + Math.cos(a) * radius, y: 50 + Math.sin(a) * radius };
  });
}

const A = { x: 16, y: 78 }; // oldest
const C = { x: 40, y: 22 }; // curve control
const B = { x: 84, y: 28 }; // newest
export const CAREER_PATH = `M${A.x} ${A.y} Q${C.x} ${C.y} ${B.x} ${B.y}`;

/** Points along the career curve for n jobs given newest first: index 0 sits at the newest end. */
export function careerPoints(n: number): OrbitPoint[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 1 : 1 - i / (n - 1);
    const u = 1 - t;
    return { x: u * u * A.x + 2 * u * t * C.x + t * t * B.x, y: u * u * A.y + 2 * u * t * C.y + t * t * B.y };
  });
}
