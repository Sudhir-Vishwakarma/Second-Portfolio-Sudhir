import { useEffect } from 'react';
import { STEPS } from './journey';
import { useJourney } from './store';

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
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startTarget = e.target;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40 && !shouldIgnoreScroll(startTarget)) store().go(dy > 0 ? 1 : -1);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);
}
