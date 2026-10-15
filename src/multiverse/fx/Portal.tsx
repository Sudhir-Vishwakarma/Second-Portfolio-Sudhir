import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RenderTexture, Sparkles } from '@react-three/drei';
import { PALETTES } from './palettes';
import { SceneLights } from './SceneLights';
import { MilkyWaySky } from './MilkyWaySky';
import { UniverseId, portalCenter, universeOrigin } from '../journey';

const PORTAL_RADIUS = 5;
const VISIBLE_RANGE = 260;
const PREVIEW_SIZE = 512;

const vertexShader = /* glsl */ `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// The preview is rendered with the main camera, so sampling it in screen space makes the disc a window.
const fragmentShader = /* glsl */ `
uniform sampler2D map;
uniform vec2 uResolution;
void main() {
  gl_FragColor = texture2D(map, gl_FragCoord.xy / uResolution);
}`;

interface PortalProps { universe: UniverseId; warm: boolean; children: React.ReactNode }

/** Ring at the entrance of a universe; its disc shows a live, low-resolution preview of that universe. */
export const Portal: React.FC<PortalProps> = ({ universe, warm, children }) => {
  const group = useRef<THREE.Group>(null!);
  const outer = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  const palette = PALETTES[universe];
  const glow = useMemo(() => new THREE.Color(palette.atmos).multiplyScalar(5), [palette]);
  const uniforms = useMemo(
    () => ({ map: { value: null as THREE.Texture | null }, uResolution: { value: new THREE.Vector2(1, 1) } }),
    []
  );
  const [near, setNear] = useState(true);
  const center = portalCenter(universe);
  const origin = universeOrigin(universe);
  const portalZ = origin[2] + center[2];

  useFrame((state, dt) => {
    const d = state.camera.position.z - portalZ;
    const isNear = warm || (d > 0 && d < VISIBLE_RANGE);
    group.current.visible = isNear;
    if (isNear !== near) setNear(isNear);
    state.gl.getDrawingBufferSize(uniforms.uResolution.value);
    outer.current.rotation.z += dt * 0.4;
    inner.current.rotation.z -= dt * 0.7;
  });

  return (
    <group ref={group} position={center}>
      <mesh>
        <circleGeometry args={[PORTAL_RADIUS, 96]} />
        <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} toneMapped={false}>
          <RenderTexture attach="uniforms-map-value" width={PREVIEW_SIZE} height={PREVIEW_SIZE} samples={0} frames={near ? Infinity : 0}>
            <color attach="background" args={['#020108']} />
            <SceneLights />
            <MilkyWaySky universe={universe} />
            {/* RenderTexture's scene is detached from this mesh, so place the preview at the universe's world origin
                (the parent offset plus the -center undo); it then lines up with the real universe */}
            <group position={origin}>{near && children}</group>
          </RenderTexture>
        </shaderMaterial>
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
