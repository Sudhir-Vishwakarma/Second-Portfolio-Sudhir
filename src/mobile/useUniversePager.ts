import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BH_MS, BH_SWAP_MS, JumpKind, jumpKind as pickJumpKind } from './blackHole';
import { FADE_MS, SETTLE_MS, SWAP_MS, UNIVERSE_ORDER, WARP_MS, WarpState, accentOf, clampIndex, universeForHash } from './universePager';

export type ViewState = 'active' | 'leaving' | 'arriving';
export type TravelSource = 'nav' | 'button' | 'gesture' | 'history';
export interface TravelOptions { push?: boolean; source?: TravelSource; via?: 'map' }
type TravelTo = (target: number, opts?: TravelOptions) => void;

export interface UniversePager {
  index: number;
  viewState: ViewState;
  arrivals: number;
  /** Effect of the current (or last) jump. */
  jumpKind: JumpKind;
  warpRef: React.MutableRefObject<WarpState>;
  travelTo: TravelTo;
}

interface Flight { startedAt: number; doneAt: number; swap: (() => void) | null; timers: number[] }

/** One universe at a time; one jump at a time. Each jump pushes a history entry; Back travels without pushing. */
export function useUniversePager(initialIndex: number, reducedMotion: boolean): UniversePager {
  const [index, setIndex] = useState(initialIndex);
  const [viewState, setViewState] = useState<ViewState>('active');
  const [arrivals, setArrivals] = useState(0);
  const [jumpKind, setJumpKind] = useState<JumpKind>('hyperspeed');
  const warpRef = useRef<WarpState>({ t0: null, from: accentOf(initialIndex), to: accentOf(initialIndex), kind: 'hyperspeed' });
  const indexRef = useRef(initialIndex);
  const flight = useRef<Flight | null>(null);
  const settledAt = useRef(-Infinity);
  const pending = useRef<number | null>(null);
  const travelRef = useRef<TravelTo>(() => {});

  const finish = useCallback(() => {
    const f = flight.current;
    if (!f) return;
    f.timers.forEach((id) => window.clearTimeout(id));
    if (f.swap) f.swap();
    flight.current = null;
    warpRef.current.t0 = null;
    setViewState('active');
    settledAt.current = performance.now();
    if (pending.current !== null) {
      const p = pending.current;
      pending.current = null;
      travelRef.current(p, { push: false, source: 'history' });
    }
  }, []);

  const travelTo = useCallback<TravelTo>(
    (target, opts = {}) => {
      const { push = true, source = 'nav', via } = opts;
      const to = clampIndex(target);
      // A sheet is open. Checked in the DOM: Forward can land on a closed sheet's stale { mbSheet } entry.
      if (source !== 'history' && document.querySelector('.mb-sheet')) return;
      const now = performance.now();
      if (flight.current) {
        if (source === 'history') pending.current = to; // replay Back/Forward once this jump lands
        return;
      }
      if (to === indexRef.current) return;
      if (source === 'gesture' && now - settledAt.current < SETTLE_MS) return;
      // Reduced motion: every jump is the same short fade, whatever its distance.
      const kind: JumpKind = reducedMotion ? 'hyperspeed' : pickJumpKind({ from: indexRef.current, to, via });
      const swapAt = reducedMotion ? FADE_MS / 2 : kind === 'blackhole' ? BH_SWAP_MS : SWAP_MS;
      const doneAt = reducedMotion ? FADE_MS : kind === 'blackhole' ? BH_MS : WARP_MS;
      if (!reducedMotion) warpRef.current = { t0: now, from: accentOf(indexRef.current), to: accentOf(to), kind };
      setJumpKind(kind);
      const swap = () => {
        const f = flight.current;
        if (!f || !f.swap) return;
        f.swap = null;
        indexRef.current = to;
        setIndex(to);
        setViewState('arriving');
        setArrivals((n) => n + 1);
        const id = UNIVERSE_ORDER[to];
        // A Back/Forward pop during this flight already moved history; pushing now would desync URL and stack.
        if (push && pending.current === null) window.history.pushState({ mbUniverse: id }, '', `#${id}`);
      };
      flight.current = { startedAt: now, doneAt, swap, timers: [] };
      flight.current.timers.push(window.setTimeout(swap, swapAt), window.setTimeout(finish, doneAt));
      setViewState('leaving');
    },
    [reducedMotion, finish]
  );
  travelRef.current = travelTo;

  useEffect(() => {
    window.history.replaceState({ mbUniverse: UNIVERSE_ORDER[indexRef.current] }, '');
    const onPop = () => {
      const st = window.history.state;
      if (st && st.mbSheet) return; // the open sheet handles its own entry
      const target = universeForHash(window.location.hash);
      travelRef.current(target ? target.index : 0, { push: false, source: 'history' });
    };
    // Timers are throttled in hidden tabs; land an overdue jump as soon as the tab is visible again.
    const onVisible = () => {
      const f = flight.current;
      if (!document.hidden && f && performance.now() - f.startedAt >= f.doneAt) finish();
    };
    const flightRef = flight;
    window.addEventListener('popstate', onPop);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('visibilitychange', onVisible);
      flightRef.current?.timers.forEach((id) => window.clearTimeout(id));
    };
  }, [finish]);

  return { index, viewState, arrivals, jumpKind, warpRef, travelTo };
}
