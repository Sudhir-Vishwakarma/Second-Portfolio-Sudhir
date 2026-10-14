import { MOBILE_SECTIONS, MobileSectionId, sectionForHash } from './sections';

export const UNIVERSE_ORDER: MobileSectionId[] = MOBILE_SECTIONS.map((s) => s.id);
export const LAST_INDEX = UNIVERSE_ORDER.length - 1;
export const PULL_THRESHOLD = 80;
export const LAUNCH_MS = 350;
export const SWAP_MS = 750;
export const WARP_MS = 1200;
export const FADE_MS = 250;
export const SETTLE_MS = 400;
export const WHEEL_ARM_MS = 300;
export const WHEEL_IDLE_MS = 250;

export const clampIndex = (i: number) => Math.max(0, Math.min(LAST_INDEX, Math.round(i)));
export const nextIndex = (i: number) => clampIndex(i + 1);
export const prevIndex = (i: number) => clampIndex(i - 1);
export const accentOf = (i: number) => MOBILE_SECTIONS[clampIndex(i)].accent;

export function edgeState(scrollTop: number, clientHeight: number, scrollHeight: number): { atTop: boolean; atBottom: boolean } {
  return { atTop: scrollTop <= 1, atBottom: scrollTop + clientHeight >= scrollHeight - 2 };
}

export interface PullInput { atTop: boolean; atBottom: boolean; pull: number; threshold?: number }

/** pull > 0: dragging up past the bottom; pull < 0: dragging down past the top. */
export function travelDirection({ atTop, atBottom, pull, threshold = PULL_THRESHOLD }: PullInput): 'next' | 'prev' | null {
  if (atBottom && pull >= threshold) return 'next';
  if (atTop && -pull >= threshold) return 'prev';
  return null;
}

export interface WheelState { armedAt: number | null; acc: number; lastAt: number }
export const INITIAL_WHEEL: WheelState = { armedAt: null, acc: 0, lastAt: -Infinity };

export function wheelStep(
  s: WheelState,
  e: { deltaY: number; atTop: boolean; atBottom: boolean; now: number }
): { state: WheelState; travel: 'next' | 'prev' | null } {
  const pushing = (e.atBottom && e.deltaY > 0) || (e.atTop && e.deltaY < 0);
  if (!pushing) return { state: INITIAL_WHEEL, travel: null };
  if (s.armedAt === null) return { state: { armedAt: e.now, acc: 0, lastAt: e.now }, travel: null };
  if (e.now - s.armedAt < WHEEL_ARM_MS) return { state: { ...s, lastAt: e.now }, travel: null };
  const acc = e.now - s.lastAt > WHEEL_IDLE_MS ? e.deltaY : s.acc + e.deltaY;
  const travel = travelDirection({ atTop: e.atTop, atBottom: e.atBottom, pull: acc });
  return travel ? { state: INITIAL_WHEEL, travel } : { state: { armedAt: s.armedAt, acc, lastAt: e.now }, travel: null };
}

export type WarpPhase = 'idle' | 'launch' | 'hyperspace' | 'arrival';
export interface WarpFrame { phase: WarpPhase; speed: number; streak: number; flash: number; mix: number; done: boolean }
export interface WarpState { t0: number | null; from: string; to: string }

/** Hyperspeed timeline for elapsed ms since the jump started. */
export function warpFrame(t: number): WarpFrame {
  if (t < 0) return { phase: 'idle', speed: 0, streak: 0, flash: 0, mix: 0, done: false };
  if (t >= WARP_MS) return { phase: 'idle', speed: 0, streak: 0, flash: 0, mix: 1, done: true };
  if (t < LAUNCH_MS) {
    const p = t / LAUNCH_MS;
    const e = p * p;
    return { phase: 'launch', speed: e, streak: e * 0.6, flash: 0, mix: 0, done: false };
  }
  if (t < SWAP_MS) {
    const p = (t - LAUNCH_MS) / (SWAP_MS - LAUNCH_MS);
    return { phase: 'hyperspace', speed: 1, streak: 0.6 + 0.4 * p, flash: p < 0.6 ? 0 : (p - 0.6) / 0.4, mix: p, done: false };
  }
  const p = (t - SWAP_MS) / (WARP_MS - SWAP_MS);
  const inv = (1 - p) * (1 - p);
  return { phase: 'arrival', speed: inv, streak: inv, flash: Math.max(0, 1 - p / 0.35), mix: 1, done: false };
}

const channels = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function lerpColor(a: string, b: string, t: number): string {
  const k = Math.max(0, Math.min(1, t));
  const ca = channels(a);
  const cb = channels(b);
  const mixed = ca.map((v, i) => Math.round(v + (cb[i] - v) * k));
  return `rgb(${mixed.join(',')})`;
}

export function universeForHash(hash: string): { index: number; anchor: string } | null {
  const target = sectionForHash(hash);
  return target ? { index: UNIVERSE_ORDER.indexOf(target.id), anchor: target.anchor } : null;
}
