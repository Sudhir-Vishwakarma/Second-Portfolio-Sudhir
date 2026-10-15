// fx/MilkyWaySky.tsx — the real Milky Way panorama at infinity, seen from a different angle in each universe
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { UNIVERSES, UniverseId } from '../journey';
import { useJourney } from '../store';
import { useRealTextures } from './useRealTextures';
import { WithTextures } from './WithTextures';

const SKY_BRIGHTNESS = 2.2; // the source panorama is very dark (band peaks ~0.3), so it is lifted; toneMapped=false keeps it linear
/** Each universe sees the galaxy from its own angle, with a faint tint, so they never look identical. */
export const SKY: Record<UniverseId, { x: number; y: number; tint: string }> = {
  home: { x: 0.35, y: 0.0, tint: '#ffffff' },
  about: { x: -0.2, y: 1.1, tint: '#cfe3ff' },
  skills: { x: 0.6, y: 2.2, tint: '#d9fff4' },
  certifications: { x: -0.5, y: 3.0, tint: '#fff3d6' },
  work: { x: 0.15, y: 4.0, tint: '#ffe2d0' },
  projects: { x: 1.0, y: 5.0, tint: '#f1e0ff' },
  contact: { x: -0.3, y: 5.8, tint: '#d8ffe9' },
};

const SkyBody: React.FC<{ universe?: UniverseId }> = ({ universe }) => {
  const [tex] = useRealTextures(['milkyWay']);
  const group = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const tint = useMemo(() => new THREE.Color(), []);
  useFrame(({ camera }, dt) => {
    group.current.position.copy(camera.position);
    const id = universe ?? UNIVERSES[useJourney.getState().cameraUniverse] ?? 'home';
    const s = SKY[id];
    easing.damp(group.current.rotation, 'x', s.x, 0.8, dt);
    easing.damp(group.current.rotation, 'y', s.y, 0.8, dt);
    tint.set(s.tint).multiplyScalar(SKY_BRIGHTNESS);
    easing.dampC(mat.current.color, tint, 0.8, dt);
  });
  return (
    <group ref={group}>
      <mesh renderOrder={-1} raycast={() => null}>
        <sphereGeometry args={[900, 64, 32]} />
        <meshBasicMaterial ref={mat} map={tex} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** The real Milky Way at infinity; follows the camera. With `universe`, it is pinned to that universe's view (portal previews). */
export const MilkyWaySky: React.FC<{ universe?: UniverseId }> = ({ universe }) => (
  <WithTextures fallback={null}>
    <SkyBody universe={universe} />
  </WithTextures>
);
