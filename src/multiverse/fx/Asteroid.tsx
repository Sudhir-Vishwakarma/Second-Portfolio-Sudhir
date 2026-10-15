import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { displaceRock } from './rock';
import { bodyUniforms } from './RealPlanet';
import { bodyShader } from './realShaders';
import { useRealTextures } from './useRealTextures';
import { WithTextures } from './WithTextures';
import { Vec3 } from '../journey';

interface AsteroidProps {
  seed: number;
  radius: number;
  /** Skill-group colour, shown as a rim glow when hovered. */
  color: string;
  lightPos: Vec3;
  position: Vec3;
  hovered: boolean;
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: () => void;
}

const useRock = (seed: number, radius: number) => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(radius, 3);
    displaceRock(g.attributes.position.array as Float32Array, seed, 0.32);
    g.computeVertexNormals();
    return g;
  }, [seed, radius]);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
};

const useTumble = (mesh: React.MutableRefObject<THREE.Mesh>, seed: number, hovered: boolean) => {
  const axis = useMemo(() => new THREE.Vector3(Math.sin(seed * 12.9), Math.cos(seed * 78.2), Math.sin(seed * 3.7)).normalize(), [seed]);
  useFrame((_, dt) => {
    mesh.current.rotateOnAxis(axis, dt * (0.25 + (seed % 5) * 0.08));
    easing.damp3(mesh.current.scale, hovered ? 1.6 : 1, 0.15, dt);
  });
};

const RockBody: React.FC<AsteroidProps> = ({ seed, radius, color, lightPos, position, hovered, onPointerOver, onPointerOut }) => {
  const [tex] = useRealTextures(['moon']);
  const geo = useRock(seed, radius);
  const mesh = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => bodyUniforms(tex, lightPos, { atmos: color, atmosStrength: 0, bump: 1.2 }), [tex, lightPos, color]);
  useTumble(mesh, seed, hovered);
  useFrame((_, dt) => easing.damp(uniforms.uHover, 'value', hovered ? 1 : 0, 0.15, dt));
  return (
    <mesh ref={mesh} geometry={geo} position={position} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <shaderMaterial args={[bodyShader]} uniforms={uniforms} />
    </mesh>
  );
};

const PlainRock: React.FC<AsteroidProps> = ({ seed, radius, position, hovered, onPointerOver, onPointerOut }) => {
  const geo = useRock(seed, radius);
  const mesh = useRef<THREE.Mesh>(null!);
  useTumble(mesh, seed, hovered);
  return (
    <mesh ref={mesh} geometry={geo} position={position} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <meshStandardMaterial color="#8a8580" roughness={0.95} />
    </mesh>
  );
};

/** A tumbling, lumpy rock with a real lunar surface; one per skill. */
export const Asteroid: React.FC<AsteroidProps> = (props) => (
  <WithTextures fallback={<PlainRock {...props} />}>
    <RockBody {...props} />
  </WithTextures>
);
