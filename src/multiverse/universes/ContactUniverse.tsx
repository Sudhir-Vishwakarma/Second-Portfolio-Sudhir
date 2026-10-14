import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Nebula } from '../fx/Nebula';
import { GlowSprite } from '../fx/GlowSprite';
import { PALETTES } from '../fx/palettes';
import { useJourney } from '../store';
import { UniverseProps } from './index';

export const BEAM_MS = 2500;
const palette = PALETTES.contact;
const DISH: [number, number, number] = [0, 3.4, 0];

export const ContactUniverse: React.FC<UniverseProps> = () => {
  const dish = useRef<THREE.Group>(null!);
  const lights = useRef<THREE.Group>(null!);
  const beam = useRef<THREE.Mesh>(null!);
  const beamMat = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame((state, dt) => {
    dish.current.rotation.y += dt * 0.4;
    lights.current.children.forEach((child, i) => {
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      const on = Math.sin(state.clock.elapsedTime * 3 + i * 2) > 0.3;
      m.color.setScalar(on ? 3 : 0.3);
    });
    const t = performance.now() - useJourney.getState().beamAt;
    const live = t >= 0 && t < BEAM_MS;
    beam.current.visible = live;
    if (live) {
      beam.current.scale.y = Math.min(1, t / 400);
      beamMat.current.opacity = 1 - t / BEAM_MS;
    }
  });

  return (
    <>
      <Nebula palette={palette} radius={65} />
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 8, 10]} intensity={200} distance={60} color={palette.atmos} />
      <group scale={1.5}>
      {/* tower */}
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[0.35, 0.8, 9, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} emissive={palette.a} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 1.8, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.6, 0.08, 12, 64]} />
        <meshBasicMaterial color={[0.8, 2.4, 1.6]} toneMapped={false} />
      </mesh>
      {/* rotating dish */}
      <group ref={dish} position={DISH}>
        <mesh rotation={[-Math.PI / 3, 0, 0]}>
          <sphereGeometry args={[2.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.7} roughness={0.25} emissive="#34d399" emissiveIntensity={0.25} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.9, -0.5]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color={[0.6, 3, 2]} toneMapped={false} />
        </mesh>
      </group>
      {/* blinking lights */}
      <group ref={lights}>
        {[[-0.9, -4, 0.6], [0.9, -1, 0.6], [0, 5.6, 0]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color={[3, 3, 3]} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <GlowSprite color={palette.b} scale={10} opacity={0.35} position={DISH} />
      {/* transmission beam */}
      <group position={DISH} rotation={[-0.6, 0, 0.35]}>
        <mesh ref={beam} visible={false}>
          <cylinderGeometry args={[0.12, 0.7, 220, 16, 1, true]} />
          <meshBasicMaterial ref={beamMat} color={[1.2, 3, 2.2]} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      </group>
    </>
  );
};
