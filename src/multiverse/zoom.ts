// zoom.ts — pinch zoom for the Project Galaxy. level 1 = the normal view; smaller = closer.
import { Vec3 } from './journey';

export const ZOOM_MIN = 0.3;
export const ZOOM_MAX = 1;
/** One +/− button press zooms by this factor. */
export const ZOOM_STEP = 1.5;
/** Stars sit within this radius of the galaxy centre; the zoom focus never leaves it. */
export const GALAXY_RADIUS = 22;

export const clampZoom = (level: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, level));

/** Level after a pinch whose finger gap went from startGap to gap (px). */
export function pinchZoom(startLevel: number, startGap: number, gap: number): number {
  if (startGap <= 0 || gap <= 0) return startLevel;
  return clampZoom((startLevel * startGap) / gap);
}

/** Pins a focus point to the galaxy plane (y = 0) and inside its radius. */
export function clampFocus(p: Vec3, radius: number): Vec3 {
  const r = Math.hypot(p[0], p[2]);
  const k = r > radius ? radius / r : 1;
  return [p[0] * k, 0, p[2] * k];
}

/**
 * Camera pose zoomed towards focus: the look point slides to the focus as the level drops to ZOOM_MIN,
 * and the camera keeps its viewing direction at `level` times the distance.
 */
export function zoomedPose(pose: { pos: Vec3; look: Vec3 }, level: number, focus: Vec3): { pos: Vec3; look: Vec3 } {
  if (level >= ZOOM_MAX) return { pos: pose.pos, look: pose.look };
  const t = (ZOOM_MAX - level) / (ZOOM_MAX - ZOOM_MIN);
  const { pos, look } = pose;
  const at: Vec3 = [look[0] + (focus[0] - look[0]) * t, look[1] + (focus[1] - look[1]) * t, look[2] + (focus[2] - look[2]) * t];
  return { pos: [at[0] + (pos[0] - look[0]) * level, at[1] + (pos[1] - look[1]) * level, at[2] + (pos[2] - look[2]) * level], look: at };
}
