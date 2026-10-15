import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { rig } from './rig';

export const PostFX: React.FC<{ bloom: boolean }> = ({ bloom }) => {
  const ca = useRef<any>(null);
  const offset = useMemo(() => new THREE.Vector2(0, 0), []);
  useFrame(() => {
    const w = rig.warp * rig.warp;
    offset.set(0.0035 * w, 0.0035 * w);
    if (ca.current) ca.current.offset = offset;
  });
  const aberration = <ChromaticAberration ref={ca} offset={offset} radialModulation={false} modulationOffset={0} />;
  const vignette = <Vignette eskil={false} offset={0.25} darkness={0.85} />;
  return bloom ? (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.15} luminanceThreshold={1.0} luminanceSmoothing={0.2} radius={0.75} />
      {aberration}
      {vignette}
    </EffectComposer>
  ) : (
    <EffectComposer multisampling={0}>
      {aberration}
      {vignette}
    </EffectComposer>
  );
};
