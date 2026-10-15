// fx/textures.ts — the shared planet maps (Solar System Scope, CC BY 4.0) and where each universe uses them
import { UniverseId } from '../journey';

export const TEXTURES = {
  sun: '2k_sun.jpg',
  earthDay: '2k_earth_daymap.jpg',
  earthNight: '2k_earth_nightmap.jpg',
  earthClouds: '2k_earth_clouds.jpg',
  moon: '2k_moon.jpg',
  mars: '2k_mars.jpg',
  jupiter: '2k_jupiter.jpg',
  saturn: '2k_saturn.jpg',
  saturnRing: '2k_saturn_ring_alpha.png',
  neptune: '2k_neptune.jpg',
  milkyWay: '2k_stars_milky_way.jpg',
} as const;

export type TextureKey = keyof typeof TEXTURES;
export const ALL_TEXTURE_KEYS = Object.keys(TEXTURES) as TextureKey[];

export const textureUrl = (key: TextureKey) => `${process.env.PUBLIC_URL ?? ''}/textures/${TEXTURES[key]}`;

/** Which maps each universe draws (the Milky Way sky is global). One request per file, shared everywhere. */
export const UNIVERSE_TEXTURES: Record<UniverseId, TextureKey[]> = {
  home: ['sun', 'earthDay', 'earthNight', 'earthClouds', 'jupiter', 'moon', 'mars', 'saturn', 'saturnRing', 'neptune'],
  about: ['earthDay', 'earthNight', 'earthClouds', 'moon'],
  skills: ['jupiter', 'moon'],
  certifications: ['moon'],
  work: ['saturn', 'saturnRing', 'jupiter', 'mars'],
  projects: [],
  contact: ['moon', 'earthDay', 'earthNight', 'earthClouds'],
};
