import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
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
    // Weld the corners (drop the per-face normals/uvs first) so normals are smooth, then lump it up.
    const raw = new THREE.IcosahedronGeometry(radius, 5);
    raw.deleteAttribute('normal');
    raw.deleteAttribute('uv');
    const g = mergeVertices(raw);
    raw.dispose();
    const pos = g.attributes.position;
    displaceRock(pos.array as Float32Array, seed, 0.32);
    g.computeVertexNormals();
    // Seam-free planar UVs from each vertex's direction, offset per rock so rocks show different patches.
    const off = (seed * 0.137) % 0.3;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getY(i), pos.getZ(i)) || 1;
      uv[i * 2] = 0.5 + 0.35 * (pos.getX(i) / r) + off;
      uv[i * 2 + 1] = 0.5 + 0.35 * (pos.getY(i) / r) + off;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
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
  const uniforms = useMemo(() => bodyUniforms(tex, lightPos, { atmos: color, atmosStrength: 0, bump: 0.25 }), [tex, lightPos, color]);
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
