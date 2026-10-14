import { Vec3 } from '../journey';

/** n points evenly around a ring in the XZ plane, with a gentle vertical wave. */
export function ringLayout(n: number, radius: number): Vec3[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * radius, Math.sin(a * 3) * 1.2, Math.sin(a) * radius] as Vec3;
  });
}
