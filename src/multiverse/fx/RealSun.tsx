// fx/RealSun.tsx — the Sun: photosphere map, limb darkening and corona (procedural while the map loads)
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import { GlowSprite } from './GlowSprite';
import { sunShader } from './shaders';
import { sunShader2 } from './realShaders';
import { useRealTextures } from './useRealTextures';
import { WithTextures } from './WithTextures';
import { WARMUP_MS } from '../journey';

// HDR corona (components above 1 are intentional)
const CORONA = new THREE.Color(1.35, 0.95, 0.6);

const useIgnite = (mesh: React.MutableRefObject<THREE.Mesh>, ignite: boolean) =>
  useFrame((state, dt) => {
    if (ignite) easing.damp3(mesh.current.scale, state.clock.elapsedTime * 1000 > WARMUP_MS ? 1 : 0.001, 1.0, dt);
    mesh.current.rotation.y += dt * 0.03;
  });

const SunBody: React.FC<{ radius: number; ignite: boolean }> = ({ radius, ignite }) => {
  const [map] = useRealTextures(['sun']);
  const mesh = useRef<THREE.Mesh>(null!);
  const clock = useThree((s) => s.clock);
  const uniforms = useMemo(() => {
    // sunShader2 scrolls u over time; the default clamp wrap would smear the edge texels into streaks past u=1.
    if (map.wrapS !== THREE.RepeatWrapping) {
      map.wrapS = THREE.RepeatWrapping;
      map.needsUpdate = true;
    }
    return { uMap: { value: map }, uTime: { value: 0 } };
  }, [map]);
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });
  useIgnite(mesh, ignite);
  return (
    <mesh ref={mesh} scale={ignite && clock.elapsedTime * 1000 < WARMUP_MS ? 0.001 : 1}>
      <sphereGeometry args={[radius, 96, 96]} />
      <shaderMaterial args={[sunShader2]} uniforms={uniforms} toneMapped={false} />
    </mesh>
  );
};

const ProceduralSun: React.FC<{ radius: number; ignite: boolean }> = ({ radius, ignite }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const clock = useThree((s) => s.clock);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });
  useIgnite(mesh, ignite);
  return (
    <mesh ref={mesh} scale={ignite && clock.elapsedTime * 1000 < WARMUP_MS ? 0.001 : 1}>
      <sphereGeometry args={[radius, 96, 96]} />
      <shaderMaterial args={[sunShader]} uniforms={uniforms} toneMapped={false} />
    </mesh>
  );
};

/** The Sun: real photosphere map, limb darkening, soft corona. It is the light for its universe's bodies. */
export const RealSun: React.FC<{ radius: number; ignite?: boolean }> = ({ radius, ignite = false }) => (
  <group>
    <WithTextures fallback={<ProceduralSun radius={radius} ignite={ignite} />}>
      <SunBody radius={radius} ignite={ignite} />
    </WithTextures>
    <GlowSprite color={CORONA} scale={radius * 5} />
  </group>
);
