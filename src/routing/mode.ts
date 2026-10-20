export interface DeviceEnv {
  webgl2: boolean;
  reducedMotion: boolean;
  width: number;
  coarsePointer: boolean;
  deviceMemory?: number;
}

export const CLASSIC_HASH = '#classic';
export type ClassicSection = 'home' | 'about' | 'work' | 'projects' | 'contacts';

export type AppMode = 'classic' | 'multiverse';

/** Phones and desktops share the multiverse; the overlay adapts to the viewport at runtime. */
export function chooseMode(env: DeviceEnv, hash: string): AppMode {
  if (hash === CLASSIC_HASH) return 'classic';
  if (!env.webgl2 || env.reducedMotion || (env.deviceMemory !== undefined && env.deviceMemory < 4)) return 'classic';
  return 'multiverse';
}

export function detectEnv(): DeviceEnv {
  let webgl2 = false;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    webgl2 = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webgl2 = false;
  }
  const media = (q: string) => (typeof window.matchMedia === 'function' ? window.matchMedia(q).matches : false);
  return {
    webgl2,
    reducedMotion: media('(prefers-reduced-motion: reduce)'),
    width: window.innerWidth,
    coarsePointer: media('(pointer: coarse)'),
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
  };
}

export function classicSectionFor(hash: string): ClassicSection {
  switch (hash.replace(/^#/, '')) {
    case 'about':
    case 'skills':
    case 'certifications':
      return 'about';
    case 'work':
      return 'work';
    case 'projects':
      return 'projects';
    case 'contact':
      return 'contacts';
    default:
      return 'home';
  }
}
