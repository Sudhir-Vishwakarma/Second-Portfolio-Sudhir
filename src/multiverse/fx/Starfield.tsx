// fx/Starfield.tsx — a star sphere that travels with the camera
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

export const Starfield: React.FC = () => {
  const group = useRef<THREE.Group>(null!);
  useFrame(({ camera }) => group.current.position.copy(camera.position));
  return (
    <group ref={group}>
      <Stars radius={120} depth={60} count={6000} factor={4} saturation={0.1} fade speed={0.6} />
    </group>
  );
};
