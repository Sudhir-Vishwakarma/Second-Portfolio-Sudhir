import { RefObject, useEffect } from 'react';
import { dragTilt, isDrag, scrollHero } from './heroMotion';

const BOOST_RATE = 3;
const BOOST_MS = 1000;
const RIPPLE_MS = 900;
const CLICK_GRACE_MS = 60;

/**
 * Hero object motion, written as CSS custom properties (no React re-renders):
 * scroll drift (--hero-y, --hero-rx), drag tilt (--hero-drx, --hero-dry; springs back on release),
 * and a ripple plus a brief orbit speed-up on a tap in empty space. A drag never also selects a planet.
 */
export function useHeroMotion(ref: RefObject<HTMLElement>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const scroller = el.closest<HTMLElement>('.mb-universe__scroll');
    const timers: number[] = [];
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const m = scrollHero(scroller ? scroller.scrollTop : 0, el.offsetHeight);
        el.style.setProperty('--hero-y', `${m.y}px`);
        el.style.setProperty('--hero-rx', `${m.rx}deg`);
      });
    };

    let start: { x: number; y: number; id: number } | null = null;
    let dragged = false;
    let suppressClick = false;
    const setTilt = (rx: number, ry: number) => {
      el.style.setProperty('--hero-drx', `${rx}deg`);
      el.style.setProperty('--hero-dry', `${ry}deg`);
    };
    const onDown = (e: PointerEvent) => {
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      dragged = false;
      suppressClick = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!dragged && !isDrag(dx, dy)) return;
      dragged = true;
      el.classList.add('is-dragging');
      const t = dragTilt(dx, dy, el.offsetWidth);
      setTilt(t.rx, t.ry);
    };
    const onEnd = () => {
      if (!start) return;
      start = null;
      el.classList.remove('is-dragging');
      setTilt(0, 0);
      suppressClick = dragged;
      // A real drag usually fires no click at all; don't let the flag swallow the next, genuine tap.
      if (dragged) timers.push(window.setTimeout(() => { suppressClick = false; }, CLICK_GRACE_MS));
    };
    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('button, a')) return;
      const anims = typeof el.getAnimations === 'function' ? el.getAnimations({ subtree: true }) : [];
      anims.forEach((a) => {
        a.playbackRate = BOOST_RATE;
      });
      timers.push(window.setTimeout(() => anims.forEach((a) => { a.playbackRate = 1; }), BOOST_MS));
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'mb-hero__ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      el.appendChild(ripple);
      timers.push(window.setTimeout(() => ripple.remove(), RIPPLE_MS));
    };

    scroller?.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('pointerdown', onDown, { passive: true });
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerup', onEnd, { passive: true });
    el.addEventListener('pointercancel', onEnd, { passive: true });
    el.addEventListener('click', onClickCapture, true);
    el.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      scroller?.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onEnd);
      el.removeEventListener('pointercancel', onEnd);
      el.removeEventListener('click', onClickCapture, true);
      el.removeEventListener('click', onClick);
      ['--hero-y', '--hero-rx', '--hero-drx', '--hero-dry'].forEach((v) => el.style.removeProperty(v));
      el.classList.remove('is-dragging');
    };
  }, [ref, enabled]);
}
