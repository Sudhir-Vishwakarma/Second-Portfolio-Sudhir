// fx/Nebula.tsx — swirl of glowing points plus soft colour clouds
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { glowTexture } from './glow';
import { GlowSprite } from './GlowSprite';
import { Palette } from './palettes';
import { Vec3 } from '../journey';

interface NebulaProps { palette: Palette; radius?: number; count?: number; thickness?: number; center?: Vec3 }

export const Nebula: React.FC<NebulaProps> = ({ palette, radius = 60, count = 4000, thickness = 14, center = [0, 0, 0] }) => {
  const points = useRef<THREE.Points>(null!);
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const a = new THREE.Color(palette.a);
    const b = new THREE.Color(palette.b);
    const white = new THREE.Color('#ffffff');
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 6;
      const r = radius * (0.12 + (t / (Math.PI * 6)) * 0.88) + (Math.random() - 0.5) * radius * 0.15;
      pos[i * 3] = Math.cos(t) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * thickness * Math.exp(-r / radius);
      pos[i * 3 + 2] = Math.sin(t) * r;
      c.copy(a).lerp(b, Math.random()).lerp(white, Math.random() * Math.random() * 0.6);
      col.set([c.r * 1.6, c.g * 1.6, c.b * 1.6], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [palette, radius, count, thickness]);

  useFrame((_, dt) => {
    points.current.rotation.y += dt * 0.02;
  });

  return (
    <group position={center}>
      <points ref={points} geometry={geo}>
        <pointsMaterial size={0.55} map={glowTexture} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <GlowSprite
          key={i}
          color={i % 2 ? palette.a : palette.b}
          scale={radius * (0.5 + (i % 3) * 0.2)}
          opacity={0.2}
          position={[Math.cos(i * 1.05) * radius * 0.45, Math.sin(i * 2) * radius * 0.08, Math.sin(i * 1.05) * radius * 0.45 - radius * 0.3]}
        />
      ))}
    </group>
  );
};
