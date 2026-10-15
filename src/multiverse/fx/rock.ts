// Deterministic lumpy-rock displacement: a sum of a few random directional waves, so it depends
// only on a vertex's direction (duplicated vertices of non-indexed geometry stay welded).
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WAVES = 5;

export function displaceRock(positions: Float32Array, seed: number, amount: number): void {
  const rand = mulberry32(seed);
  const waves = Array.from({ length: WAVES }, () => {
    const z = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - z * z);
    return { x: s * Math.cos(a), y: s * Math.sin(a), z, freq: 1.5 + rand() * 3.5, phase: rand() * Math.PI * 2, amp: 0.4 + rand() * 0.6 };
  });
  const total = waves.reduce((sum, w) => sum + w.amp, 0);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    const r = Math.hypot(x, y, z) || 1;
    const dx = x / r;
    const dy = y / r;
    const dz = z / r;
    let f = 0;
    for (const w of waves) f += w.amp * Math.cos(w.freq * (dx * w.x + dy * w.y + dz * w.z) * Math.PI + w.phase);
    const k = 1 + amount * (f / total);
    positions[i] = x * k;
    positions[i + 1] = y * k;
    positions[i + 2] = z * k;
  }
}
