// fx/hexGate.ts — pure 2D geometry for the hexagonal honeycomb portal (flat-top hexagons in the portal plane)
export type P2 = [number, number];
export type Segment = [P2, P2];

const STEP = Math.PI / 3;

/** The 6 corners of a flat-top hexagon of circumradius r; corner k at angle k*60deg (k=0 -> (r, 0)). */
export const hexCorners = (r: number): P2[] =>
  Array.from({ length: 6 }, (_, k) => [r * Math.cos(k * STEP), r * Math.sin(k * STEP)] as P2);

/** Centres of the 6 cells that tile around a flat-top hexagon of circumradius r: at sqrt(3)*r + gap, angle 30 + k*60deg. */
export const honeycombRing = (r: number, gap = 0): P2[] =>
  Array.from({ length: 6 }, (_, k) => {
    const a = STEP / 2 + k * STEP;
    const d = Math.sqrt(3) * r + gap;
    return [d * Math.cos(a), d * Math.sin(a)] as P2;
  });

/** The edges (corner k -> corner k+1) of the hexagon at `center`, minus the edge indices in `skip`. */
export function edgeSegments(center: P2, r: number, skip: number[]): Segment[] {
  const c = hexCorners(r).map(([x, y]) => [x + center[0], y + center[1]] as P2);
  const out: Segment[] = [];
  for (let k = 0; k < 6; k++) if (!skip.includes(k)) out.push([c[k], c[(k + 1) % 6]]);
  return out;
}

/** Edge j's midpoint lies at angle 30 + j*60deg from its cell centre; neighbour k sits at 30 + k*60deg, so edge k+3 faces the centre. */
export const facingEdge = (cell: number): number => (cell + 3) % 6;

/** Deterministic missing edges of neighbour `cell`: the one shared with the centre (drawn orange), plus one outer edge for cells 1 and 4. */
export const openEdges = (cell: number): number[] =>
  cell === 1 || cell === 4 ? [facingEdge(cell), (cell + 1) % 6] : [facingEdge(cell)];

/** Closed outer outline of the 7-cell honeycomb (18 corners): neighbour k contributes its outer edges k-1, k, k+1 in order. */
export function perimeterPath(r: number): P2[] {
  const out: P2[] = [];
  honeycombRing(r).forEach((c, k) => {
    const segs = edgeSegments(c, r, []);
    [(k + 5) % 6, k, (k + 1) % 6].forEach((j) => out.push(segs[j][0]));
  });
  return out;
}
