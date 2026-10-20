import { useEffect } from 'react';
import { STEPS, universeOf } from './journey';
import { useJourney } from './store';
import { pinchZoom } from './zoom';

const gapOf = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

export function isFormField(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && typeof el.closest === 'function' && !!el.closest('input, textarea, select, [contenteditable="true"]');
}

export function isActivatable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && typeof el.closest === 'function' && !!el.closest('button, a[href], [role="button"], summary');
}

/** True when the target is inside a [data-capture-scroll] element that actually overflows. */
export function insideScrollable(target: EventTarget | null): boolean {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    if (el.hasAttribute && el.hasAttribute('data-capture-scroll') && el.scrollHeight > el.clientHeight + 1) return true;
    el = el.parentElement;
  }
  return false;
}

/** True when a wheel/swipe starting on this target must not travel (form field or overflowing panel). */
export function shouldIgnoreScroll(target: EventTarget | null): boolean {
  return isFormField(target) || insideScrollable(target);
}

export function useJourneyInput(): void {
  useEffect(() => {
    const store = useJourney.getState;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 20 || shouldIgnoreScroll(e.target)) return;
      store().go(e.deltaY > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (isFormField(e.target)) return;
      const s = store();
      if (s.modal) {
        if (e.key === 'Escape') s.closeModal();
        return;
      }
      if (e.key === ' ' && isActivatable(e.target)) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        s.go(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        s.go(-1);
      } else if (e.key === 'Home') {
        s.jump(0);
      } else if (e.key === 'End') {
        s.jump(STEPS.length - 1);
      }
    };

    let startY = 0;
    let startTarget: EventTarget | null = null;
    // A gesture that ever had two fingers down is a pinch, never a swipe; it ends when the last finger lifts.
    let multi = false;
    let pinch: { gap: number; level: number } | null = null;
    const canZoom = () => {
      const s = store();
      return universeOf(s.step) === 'projects' && !s.moving && !s.modal;
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        multi = true;
        if (canZoom() && !shouldIgnoreScroll(e.target)) {
          const [a, b] = [e.touches[0], e.touches[1]];
          const mid: [number, number] = [((a.clientX + b.clientX) / 2 / window.innerWidth) * 2 - 1, -((a.clientY + b.clientY) / 2 / window.innerHeight) * 2 + 1];
          pinch = { gap: gapOf(e.touches), level: store().zoom };
          store().setZoom(pinch.level, mid);
        }
        return;
      }
      startY = e.touches[0].clientY;
      startTarget = e.target;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (pinch && e.touches.length > 1) store().setZoom(pinchZoom(pinch.level, pinch.gap, gapOf(e.touches)));
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (multi) {
        if (e.touches.length === 0) multi = false;
        pinch = null;
        return;
      }
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40 && !shouldIgnoreScroll(startTarget)) store().go(dy > 0 ? 1 : -1);
    };
    const onTouchCancel = (e: TouchEvent) => {
      pinch = null;
      if (e.touches.length === 0) multi = false;
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchCancel, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
    };
  }, []);
}
