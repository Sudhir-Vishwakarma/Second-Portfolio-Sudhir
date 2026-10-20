import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RealPlanet } from '../fx/RealPlanet';
import { Asteroid } from '../fx/Asteroid';
import { PALETTES } from '../fx/palettes';
import { skills, SkillGroup } from '../../data/portfolio';
import { ringLayout } from './layout';
import { Vec3, universeOrigin } from '../journey';
import { useJourney } from '../store';
import { UniverseProps } from './index';
import { HitArea, InfoCard, onTap } from './Tappable';

export const SKILL_COLORS: Record<SkillGroup, string> = {
  Frontend: '#38bdf8',
  Backend: '#f97316',
  Database: '#a3e635',
  'Cloud & DevOps': '#c084fc',
  Tools: '#f472b6',
};

const positions = ringLayout(skills.length, 12);
const origin = universeOrigin('skills');
const light: Vec3 = [origin[0] + 30, origin[1] + 18, origin[2] + 26];

const SkillRock: React.FC<{ id: string; name: string; group: SkillGroup; color: string; position: Vec3; interactive: boolean; seed: number }> = ({ id, name, group, color, position, interactive, seed }) => {
  const [hovered, setHovered] = useState(false);
  const picked = useJourney((s) => s.picked === id);
  useEffect(() => {
    if (!interactive) setHovered(false);
  }, [interactive]);
  return (
    <group position={position}>
      <Asteroid
        seed={seed}
        radius={0.7}
        color={color}
        lightPos={light}
        position={[0, 0, 0]}
        hovered={hovered || picked}
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      />
      {/* Touch screens have no hover: a tap pins the name until another tap. */}
      <HitArea radius={1.3} onClick={onTap(interactive, () => useJourney.getState().pick(id))} />
      {interactive && (hovered || picked) && (
        <InfoCard position={[0, 1.6, 0]}>
          <strong style={{ color }}>{name}</strong>
          <small>{group}</small>
        </InfoCard>
      )}
    </group>
  );
};

export const SkillsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const belt = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    belt.current.rotation.y += dt * 0.05;
  });
  return (
    <>
      <RealPlanet radius={2.8} map="jupiter" atmos="#f0dcb4" atmosStrength={0.25} tilt={0.05} spin={0.12} lightPos={light} fallback={PALETTES.skills} />
      <group ref={belt}>
        {skills.map((s, i) => (
          <SkillRock key={s.name} id={`skill-${i}`} name={s.name} group={s.group} color={SKILL_COLORS[s.group]} position={positions[i]} interactive={active && !preview} seed={i + 1} />
        ))}
      </group>
    </>
  );
};
