import { UniverseId } from '../journey';

export interface Palette { a: string; b: string; atmos: string }

export const PALETTES: Record<UniverseId, Palette> = {
  home: { a: '#7c2d12', b: '#fb923c', atmos: '#fdba74' },
  about: { a: '#1e3a8a', b: '#38bdf8', atmos: '#60a5fa' },
  skills: { a: '#065f46', b: '#2dd4bf', atmos: '#5eead4' },
  certifications: { a: '#78350f', b: '#fbbf24', atmos: '#fcd34d' },
  work: { a: '#7f1d1d', b: '#f97316', atmos: '#fb923c' },
  projects: { a: '#4c1d95', b: '#e879f9', atmos: '#c084fc' },
  contact: { a: '#064e3b', b: '#34d399', atmos: '#6ee7b7' },
};
