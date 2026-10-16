import { hexCorners, honeycombRing, edgeSegments, openEdges, facingEdge, perimeterPath, sharedEdge } from './hexGate';

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 6);

test('hexCorners: 6 flat-top corners at radius r, corner k at k*60 degrees', () => {
  const c = hexCorners(5);
  expect(c).toHaveLength(6);
  close(c[0][0], 5);
  close(c[0][1], 0);
  c.forEach(([x, y], k) => {
    close(Math.hypot(x, y), 5);
    close(Math.atan2(y, x), Math.atan2(Math.sin((k * Math.PI) / 3), Math.cos((k * Math.PI) / 3)));
  });
});

test('honeycombRing: 6 neighbours at sqrt(3)*r (+gap), at 30 + k*60 degrees', () => {
  const ring = honeycombRing(5);
  expect(ring).toHaveLength(6);
  ring.forEach(([x, y], k) => {
    close(Math.hypot(x, y), Math.sqrt(3) * 5);
    const a = Math.PI / 6 + (k * Math.PI) / 3;
    close(x, Math.sqrt(3) * 5 * Math.cos(a));
    close(y, Math.sqrt(3) * 5 * Math.sin(a));
  });
  honeycombRing(5, 0.4).forEach(([x, y]) => close(Math.hypot(x, y), Math.sqrt(3) * 5 + 0.4));
});

test('neighbour cells share an edge with the centre hexagon (no gap)', () => {
  const r = 5;
  const centre = edgeSegments([0, 0], r, []);
  honeycombRing(r).forEach((c, k) => {
    const [[ax, ay], [bx, by]] = edgeSegments(c, r, [])[facingEdge(k)];
    const shared = centre.some(([[px, py], [qx, qy]]) =>
      (Math.hypot(px - bx, py - by) < 1e-6 && Math.hypot(qx - ax, qy - ay) < 1e-6));
    expect(shared).toBe(true);
  });
});

test('edgeSegments: 6 - skip.length edges, each joining consecutive corners', () => {
  expect(edgeSegments([0, 0], 5, [])).toHaveLength(6);
  expect(edgeSegments([1, 2], 5, [0, 3])).toHaveLength(4);
  const segs = edgeSegments([1, 2], 5, []);
  segs.forEach(([[ax, ay], [bx, by]]) => close(Math.hypot(bx - ax, by - ay), 5));
  close(segs[0][0][0], 6);
  close(segs[0][0][1], 2);
});

test('the edge reported as facing the centre is the one whose midpoint is closest to the origin', () => {
  honeycombRing(5).forEach((c, k) => {
    const segs = edgeSegments(c, 5, []);
    const dists = segs.map(([[ax, ay], [bx, by]]) => Math.hypot((ax + bx) / 2, (ay + by) / 2));
    const nearest = dists.indexOf(Math.min(...dists));
    expect(facingEdge(k)).toBe(nearest);
    expect(openEdges(k)).toContain(nearest);
  });
});

test('openEdges is deterministic; cells 1 and 4 miss one extra edge', () => {
  for (let k = 0; k < 6; k++) {
    expect(openEdges(k)).toEqual(openEdges(k));
    const extra = k === 1 || k === 4 ? 2 : 1;
    expect(openEdges(k)).toHaveLength(extra);
    new Set(openEdges(k)).forEach((e) => expect(e).toBeGreaterThanOrEqual(0));
    openEdges(k).forEach((e) => expect(e).toBeLessThan(6));
  }
});

test('sharedEdge(k) is the edge neighbour k shares with neighbour k+1', () => {
  const ring = honeycombRing(5);
  const same = (a: number[][], b: number[][]) =>
    (Math.hypot(a[0][0] - b[1][0], a[0][1] - b[1][1]) < 1e-6 && Math.hypot(a[1][0] - b[0][0], a[1][1] - b[0][1]) < 1e-6);
  ring.forEach((c, k) => {
    const mine = edgeSegments(c, 5, [])[sharedEdge(k)];
    const next = edgeSegments(ring[(k + 1) % 6], 5, []);
    expect(next.some((s) => same(mine, s))).toBe(true);
    expect(openEdges(k)).not.toContain(sharedEdge(k));
  });
});

test('perimeterPath: closed 18-corner outline of the honeycomb, every step one edge long', () => {
  const r = 5;
  const path = perimeterPath(r);
  expect(path).toHaveLength(18);
  path.forEach(([x, y], i) => {
    const [nx, ny] = path[(i + 1) % path.length];
    close(Math.hypot(nx - x, ny - y), r);
    expect(Math.hypot(x, y)).toBeGreaterThan(r * 1.5);
  });
});
