import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Nebula } from '../fx/Nebula';
import { GlowSprite } from '../fx/GlowSprite';
import { sunShader } from '../fx/shaders';
import { PALETTES } from '../fx/palettes';
import { certifications } from '../../data/portfolio';
import { UniverseProps } from './index';

const palette = PALETTES.certifications;
const RADIUS = 8;
const SUN_GLOW = new THREE.Color(1.4, 1.0, 0.3);

export const CertificationsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const orbit = useRef<THREE.Group>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const box = useMemo(() => new THREE.BoxGeometry(3.2, 2.2, 0.08), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(box), [box]);

  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    orbit.current.rotation.y += dt * 0.12;
  });

  return (
    <>
      <Nebula palette={palette} radius={65} />
      <ambientLight intensity={0.35} />
      <pointLight intensity={300} distance={50} color="#fcd34d" />
      <mesh>
        <sphereGeometry args={[2.2, 64, 64]} />
        <shaderMaterial args={[sunShader]} uniforms={uniforms} toneMapped={false} />
      </mesh>
      <GlowSprite color={SUN_GLOW} scale={12} opacity={0.8} />
      <group ref={orbit}>
        {certifications.map((c, i) => {
          const a = (i / certifications.length) * Math.PI * 2;
          return (
            <group key={c.title} position={[Math.cos(a) * RADIUS, Math.sin(a * 2) * 1.2, Math.sin(a) * RADIUS]} rotation-y={-a + Math.PI / 2}>
              <mesh geometry={box}>
                <meshStandardMaterial color="#fcd34d" emissive="#b45309" emissiveIntensity={0.6} transparent opacity={0.22} metalness={0.6} roughness={0.2} side={THREE.DoubleSide} />
              </mesh>
              <lineSegments geometry={edges}>
                <lineBasicMaterial color={[2.4, 1.8, 0.6]} toneMapped={false} />
              </lineSegments>
              {active && !preview && (
                <Html center transform distanceFactor={8} className="mv-plaque">{c.title}</Html>
              )}
            </group>
          );
        })}
      </group>
    </>
  );
};
