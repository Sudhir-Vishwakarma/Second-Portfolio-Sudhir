import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshPortalMaterial, Sparkles } from '@react-three/drei';
import { PALETTES } from './palettes';
import { UniverseId, portalCenter, universeOrigin } from '../journey';

const PORTAL_RADIUS = 5;
const VISIBLE_RANGE = 260;

interface PortalProps { universe: UniverseId; warm: boolean; children: React.ReactNode }

/** Ring at the entrance of a universe; its disc shows a live preview of that universe. */
export const Portal: React.FC<PortalProps> = ({ universe, warm, children }) => {
  const group = useRef<THREE.Group>(null!);
  const outer = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  const palette = PALETTES[universe];
  const glow = useMemo(() => new THREE.Color(palette.atmos).multiplyScalar(5), [palette]);
  const center = portalCenter(universe);
  const portalZ = universeOrigin(universe)[2] + center[2];

  useFrame((state, dt) => {
    const d = state.camera.position.z - portalZ;
    group.current.visible = warm || (d > 0 && d < VISIBLE_RANGE);
    outer.current.rotation.z += dt * 0.4;
    inner.current.rotation.z -= dt * 0.7;
  });

  return (
    <group ref={group} position={center}>
      <mesh>
        <circleGeometry args={[PORTAL_RADIUS, 96]} />
        <MeshPortalMaterial resolution={1024} blur={0}>
          <color attach="background" args={['#020108']} />
          <ambientLight intensity={0.4} />
          {/* undo the portal's offset so the preview lines up with the real universe */}
          <group position={[-center[0], -center[1], -center[2]]}>{children}</group>
        </MeshPortalMaterial>
      </mesh>
      <mesh ref={outer}>
        <torusGeometry args={[PORTAL_RADIUS + 0.05, 0.07, 16, 160]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[PORTAL_RADIUS + 0.4, 0.02, 8, 160, Math.PI * 1.4]} />
        <meshBasicMaterial color={glow} toneMapped={false} transparent opacity={0.7} />
      </mesh>
      <Sparkles count={90} scale={[13, 13, 3]} size={4} speed={0.6} color={palette.atmos} />
    </group>
  );
};
