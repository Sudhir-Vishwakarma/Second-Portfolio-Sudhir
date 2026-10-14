import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { easing } from 'maath';
import { Nebula } from '../fx/Nebula';
import { GlowSprite } from '../fx/GlowSprite';
import { PALETTES } from '../fx/palettes';
import { skills, SkillGroup } from '../../data/portfolio';
import { ringLayout } from './layout';
import { Vec3 } from '../journey';
import { UniverseProps } from './index';

export const SKILL_COLORS: Record<SkillGroup, string> = {
  Frontend: '#38bdf8',
  Backend: '#f97316',
  Database: '#a3e635',
  'Cloud & DevOps': '#c084fc',
  Tools: '#f472b6',
};

const positions = ringLayout(skills.length, 12);

const Crystal: React.FC<{ name: string; color: string; position: Vec3; interactive: boolean }> = ({ name, color, position, interactive }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { if (!interactive) setHovered(false); }, [interactive]);
  useFrame((state, dt) => {
    mesh.current.rotation.y += dt * 0.8;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime + position[0]) * 0.4;
    easing.damp3(mesh.current.scale, hovered ? 1.6 : 1, 0.15, dt);
  });
  return (
    <group position={position}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.6 : 0.7} flatShading metalness={0.3} roughness={0.2} />
      </mesh>
      <GlowSprite color={color} scale={hovered ? 4 : 2.4} opacity={0.5} />
      {interactive && hovered && (
        <Html center position={[0, 1.5, 0]} className="mv-label">{name}</Html>
      )}
    </group>
  );
};

export const SkillsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const belt = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    belt.current.rotation.y += dt * 0.05;
    core.current.rotation.y -= dt * 0.3;
    core.current.rotation.x += dt * 0.1;
  });
  const palette = PALETTES.skills;
  return (
    <>
      <Nebula palette={palette} radius={75} />
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[2.6, 0]} />
          <meshStandardMaterial color={palette.atmos} emissive={palette.a} emissiveIntensity={0.8} flatShading metalness={0.4} roughness={0.15} />
        </mesh>
        <mesh scale={1.35}>
          <icosahedronGeometry args={[2.6, 1]} />
          <meshBasicMaterial color={[1.6, 2.4, 2.2]} wireframe transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>
      <GlowSprite color={palette.b} scale={14} opacity={0.4} />
      <group ref={belt}>
        {skills.map((s, i) => (
          <Crystal key={s.name} name={s.name} color={SKILL_COLORS[s.group]} position={positions[i]} interactive={active && !preview} />
        ))}
      </group>
    </>
  );
};
