import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { TextureKey, textureUrl } from './textures';

const prepare = (t: THREE.Texture) => {
  if (t.colorSpace === THREE.SRGBColorSpace && t.anisotropy === 4) return; // already prepared (textures are shared)
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
};

// Module-level so drei's onLoad effect runs once per mount, not on every render (which would re-upload the maps).
const onLoad = (t: THREE.Texture | THREE.Texture[]) => (Array.isArray(t) ? t : [t]).forEach(prepare);

/** Suspends until the maps load (one request per file, cached and shared); throws if one fails. */
export function useRealTextures(keys: TextureKey[]): THREE.Texture[] {
  return useTexture(keys.map(textureUrl), onLoad) as THREE.Texture[];
}
