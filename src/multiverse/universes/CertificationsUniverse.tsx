import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { RealPlanet } from '../fx/RealPlanet';
import { Satellite } from '../fx/Satellite';
import { PALETTES } from '../fx/palettes';
import { certifications } from '../../data/portfolio';
import { Vec3, universeOrigin } from '../journey';
import { UniverseProps } from './index';

const RADIUS = 8;
const origin = universeOrigin('certifications');
const light: Vec3 = [origin[0] + 24, origin[1] + 14, origin[2] + 22];

export const CertificationsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const orbit = useRef<THREE.Group>(null!);
  const box = useMemo(() => new THREE.BoxGeometry(3.2, 2.2, 0.08), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(box), [box]);
  useEffect(() => () => box.dispose(), [box]);
  useEffect(() => () => edges.dispose(), [edges]);

  useFrame((_, dt) => {
    orbit.current.rotation.y += dt * 0.12;
  });

  return (
    <>
      <RealPlanet radius={2.6} map="moon" bump={2} tilt={0.1} spin={0.04} lightPos={light} fallback={PALETTES.certifications} />
      <group ref={orbit}>
        {certifications.map((c, i) => {
          const a = (i / certifications.length) * Math.PI * 2;
          return (
            <group key={c.title} position={[Math.cos(a) * RADIUS, Math.sin(a * 2) * 1.2, Math.sin(a) * RADIUS]} rotation-y={-a + Math.PI / 2}>
              <mesh geometry={box}>
                <meshStandardMaterial color="#e2e8f0" transparent opacity={0.12} metalness={0.6} roughness={0.2} side={THREE.DoubleSide} />
              </mesh>
              <lineSegments geometry={edges}>
                <lineBasicMaterial color={[1.6, 1.6, 1.7]} toneMapped={false} />
              </lineSegments>
              <Satellite position={[0, -1.9, 0]} scale={0.6} />
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
