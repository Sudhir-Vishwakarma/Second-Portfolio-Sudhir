import { RefObject, useEffect, useRef, useState } from 'react';
import { INITIAL_WHEEL, WheelState, edgeState, travelDirection, wheelStep } from './universePager';

export function isGestureExempt(target: EventTarget | null): boolean {
  const el = target as Element | null;
  return !!el && typeof el.closest === 'function' && !!el.closest('input, textarea, select, .mb-sheet, .mb-filters, .mb-orbit');
}

/**
 * Edge pulls on a universe's scroll area: a touch that STARTS at the top/bottom edge and pulls a further
 * PULL_THRESHOLD px travels prev/next on release. Wheel input uses the armed/idle rules in wheelStep.
 * Returns the live pull distance for the indicator (0 when idle).
 */
export function useEdgePull(scrollRef: RefObject<HTMLElement>, onTravel: (dir: 'next' | 'prev') => void, enabled: boolean): number {
  const [pull, setPull] = useState(0);
  const travel = useRef(onTravel);
  travel.current = onTravel;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled) return;
    let start: { y: number; atTop: boolean; atBottom: boolean } | null = null;
    let current = 0;
    let raf = 0;
    const show = (v: number) => {
      current = v;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setPull(v));
    };
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || isGestureExempt(e.target)) {
        start = null;
        show(0);
        return;
      }
      start = { y: e.touches[0].clientY, ...edgeState(el.scrollTop, el.clientHeight, el.scrollHeight) };
    };
    const onMove = (e: TouchEvent) => {
      if (!start) return;
      const dy = start.y - e.touches[0].clientY; // > 0: finger moved up
      show((start.atBottom && dy > 0) || (start.atTop && dy < 0) ? dy : 0);
    };
    const onEnd = () => {
      if (!start) return;
      const dir = travelDirection({ atTop: start.atTop, atBottom: start.atBottom, pull: current });
      start = null;
      show(0);
      if (dir) travel.current(dir);
    };
    const onCancel = () => {
      start = null;
      show(0);
    };
    let wheel: WheelState = INITIAL_WHEEL;
    const onWheel = (e: WheelEvent) => {
      if (isGestureExempt(e.target)) return;
      const r = wheelStep(wheel, { deltaY: e.deltaY, ...edgeState(el.scrollTop, el.clientHeight, el.scrollHeight), now: performance.now() });
      wheel = r.state;
      if (r.travel) travel.current(r.travel);
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onCancel, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      setPull(0);
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onCancel);
      el.removeEventListener('wheel', onWheel);
    };
  }, [scrollRef, enabled]);

  return pull;
}
