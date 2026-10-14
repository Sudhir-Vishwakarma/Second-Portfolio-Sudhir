export const COLLAPSED_BULLETS = 2;

export function visibleBullets(bullets: readonly string[], expanded: boolean, n = COLLAPSED_BULLETS): string[] {
  return expanded ? [...bullets] : bullets.slice(0, n);
}

export function hasHiddenBullets(bullets: readonly string[], n = COLLAPSED_BULLETS): boolean {
  return bullets.length > n;
}
