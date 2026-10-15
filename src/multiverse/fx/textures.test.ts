import fs from 'fs';
import path from 'path';
import { ALL_TEXTURE_KEYS, TEXTURES, UNIVERSE_TEXTURES, textureUrl } from './textures';
import { UNIVERSES } from '../journey';

const dir = path.join(__dirname, '../../../public/textures');

test('every texture key points at a file that exists', () => {
  expect(ALL_TEXTURE_KEYS).toHaveLength(11);
  ALL_TEXTURE_KEYS.forEach((k) => expect(fs.existsSync(path.join(dir, TEXTURES[k]))).toBe(true));
});

test('urls are served from /textures/', () => {
  expect(textureUrl('moon')).toBe(`${process.env.PUBLIC_URL ?? ''}/textures/2k_moon.jpg`);
});

test('every universe lists only known keys, and every key is used somewhere', () => {
  expect(Object.keys(UNIVERSE_TEXTURES).sort()).toEqual([...UNIVERSES].sort());
  const used = new Set<string>(['milkyWay']); // the sky is global
  UNIVERSES.forEach((u) => UNIVERSE_TEXTURES[u].forEach((k) => {
    expect(ALL_TEXTURE_KEYS).toContain(k);
    used.add(k);
  }));
  expect(Array.from(used).sort()).toEqual([...ALL_TEXTURE_KEYS].sort());
});
