import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Vec3 } from '../journey';

/** A small spacecraft: gold-foil body, two blue solar panels on a truss, an antenna dish. Lit by SceneLights. */
export const Satellite: React.FC<{ position?: Vec3; scale?: number }> = ({ position, scale = 1 }) => {
  const g = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    g.current.rotation.y += dt * 0.25;
  });
  return (
    <group ref={g} position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[0.7, 0.7, 1.1]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.04, 0.04, 3.2, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.55, 0, 0]}>
          <boxGeometry args={[2.0, 0.04, 0.8]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.35} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.75]} rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.32, 0.25, 20, 1, true]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
