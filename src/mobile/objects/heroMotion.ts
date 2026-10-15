export const DRAG_THRESHOLD = 8;
export const MAX_DRAG_TILT = 12;
export const MAX_SCROLL_TILT = 8;
const DRIFT = 0.4; // the hero lags the page: it moves at 0.6x the scroll speed
const MAX_DRIFT = 0.25; // of the hero's height

const clamp = (v: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, v));

/** Scroll drift: translateY (px) and backward tilt (deg) for the hero at this scroll offset. */
export function scrollHero(scrollTop: number, heroHeight: number): { y: number; rx: number } {
  if (heroHeight <= 0 || scrollTop <= 0) return { y: 0, rx: 0 };
  return {
    y: Math.min(scrollTop * DRIFT, heroHeight * MAX_DRIFT),
    rx: clamp(scrollTop / heroHeight, 0, 1) * MAX_SCROLL_TILT,
  };
}

/** Drag tilt (deg): dragging right turns the hero right, dragging up tilts it back. */
export function dragTilt(dx: number, dy: number, size: number): { rx: number; ry: number } {
  if (size <= 0) return { rx: 0, ry: 0 };
  return {
    rx: -clamp((dy / size) * 2) * MAX_DRAG_TILT || 0,
    ry: clamp((dx / size) * 2) * MAX_DRAG_TILT || 0,
  };
}

export function isDrag(dx: number, dy: number): boolean {
  return Math.hypot(dx, dy) >= DRAG_THRESHOLD;
}
