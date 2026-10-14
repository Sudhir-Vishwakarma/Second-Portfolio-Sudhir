export type JumpKind = 'hyperspeed' | 'blackhole';

export const BH_PULL_MS = 600;
export const BH_SWAP_MS = 800;
export const BH_MS = 1600;

export type BlackHolePhase = 'idle' | 'pull' | 'collapse' | 'emerge';
/** spin is radians; every other number is 0..1. horizon is the event-horizon size relative to its maximum. */
export interface BlackHoleFrame { phase: BlackHolePhase; pull: number; horizon: number; spin: number; flare: number; burst: number; mix: number; done: boolean }

const idle = (done: boolean): BlackHoleFrame => ({ phase: 'idle', pull: 0, horizon: 0, spin: 0, flare: 0, burst: 0, mix: done ? 1 : 0, done });

/** Black hole timeline for elapsed ms: pull in, collapse (swap at BH_SWAP_MS, flare peak), emerge. */
export function blackHoleFrame(t: number): BlackHoleFrame {
  if (t < 0) return idle(false);
  if (t >= BH_MS) return idle(true);
  const spin = (t / 1000) * 7;
  if (t < BH_PULL_MS) {
    const p = t / BH_PULL_MS;
    return { phase: 'pull', pull: p * p, horizon: 0.6 * p, spin, flare: 0, burst: 0, mix: 0, done: false };
  }
  if (t < BH_SWAP_MS) {
    const p = (t - BH_PULL_MS) / (BH_SWAP_MS - BH_PULL_MS);
    return { phase: 'collapse', pull: 1, horizon: 0.6 + 0.4 * p, spin, flare: p, burst: 0, mix: p, done: false };
  }
  const p = (t - BH_SWAP_MS) / (BH_MS - BH_SWAP_MS);
  const inv = (1 - p) * (1 - p);
  return { phase: 'emerge', pull: inv, horizon: Math.max(0, 1 - p / 0.3), spin, flare: Math.max(0, 1 - p / 0.4), burst: inv, mix: 1, done: false };
}

/** Map jumps and jumps across more than one universe go through the black hole; neighbours keep hyperspeed. */
export function jumpKind({ from, to, via }: { from: number; to: number; via?: 'map' }): JumpKind {
  return via === 'map' || Math.abs(to - from) > 1 ? 'blackhole' : 'hyperspeed';
}
