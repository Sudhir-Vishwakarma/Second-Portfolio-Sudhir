import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, useCursor } from '@react-three/drei';
import { RealSun } from '../fx/RealSun';
import { RealEarth } from '../fx/RealEarth';
import { RealPlanet } from '../fx/RealPlanet';
import { PALETTES } from '../fx/palettes';
import { UniverseId, UNIVERSE_LABELS, Vec3, firstStepOf, universeOrigin } from '../journey';
import { useJourney } from '../store';
import { UniverseProps } from './index';

type BodyKind = 'earth' | 'jupiter' | 'moon' | 'mars' | 'saturn' | 'neptune';
interface OrbitDef { universe: UniverseId; orbit: number; size: number; speed: number; body: BodyKind; ring?: boolean; tagline: string }

const ORBITS: OrbitDef[] = [
  { universe: 'about', orbit: 7, size: 0.7, speed: 0.22, body: 'earth', tagline: 'Who I am' },
  { universe: 'skills', orbit: 9.5, size: 0.9, speed: 0.17, body: 'jupiter', tagline: 'What I build with' },
  { universe: 'certifications', orbit: 12, size: 0.6, speed: 0.13, body: 'moon', tagline: "What I've earned" },
  { universe: 'work', orbit: 14.5, size: 0.8, speed: 0.1, body: 'mars', tagline: "Where I've built" },
  { universe: 'projects', orbit: 17.5, size: 1.15, speed: 0.08, body: 'saturn', ring: true, tagline: "Everything I've made" },
  { universe: 'contact', orbit: 20.5, size: 0.85, speed: 0.06, body: 'neptune', tagline: 'Open a channel' },
];
const ATMOS: Partial<Record<BodyKind, [string, number]>> = {
  mars: ['#e8a07a', 0.35],
  jupiter: ['#f0dcb4', 0.25],
  saturn: ['#f0e0b8', 0.2],
  neptune: ['#8fb8ff', 0.6],
};
// The Sun sits at Home's origin and lights every portal planet.
const SUN: Vec3 = universeOrigin('home');

const OrbitingPlanet: React.FC<{ def: OrbitDef; index: number; active: boolean; preview?: boolean }> = ({ def, index, active, preview }) => {
  const pivot = React.useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const interactive = active && !preview;

  useCursor(hovered && interactive);
  useEffect(() => {
    if (!interactive) setHovered(false);
  }, [interactive]);

  useFrame((state) => {
    pivot.current.rotation.y = index * 1.7 + state.clock.elapsedTime * def.speed;
  });

  const handlers = {
    onPointerOver: (e: { stopPropagation: () => void }) => {
      if (!interactive) return;
      e.stopPropagation();
      setHovered(true);
    },
    onPointerOut: () => setHovered(false),
    onClick: (e: { stopPropagation: () => void }) => {
      if (!interactive) return;
      e.stopPropagation();
      useJourney.getState().jump(firstStepOf(def.universe));
    },
  };
  const highlight = hovered ? 1 : 0;
  const fallback = PALETTES[def.universe];

  return (
    <>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[def.orbit - 0.015, def.orbit + 0.015, 192]} />
        <meshBasicMaterial color="#cbd5e1" transparent opacity={hovered ? 0.45 : 0.08} side={THREE.DoubleSide} />
      </mesh>
      <group ref={pivot}>
        <group position={[def.orbit, 0, 0]}>
          {def.body === 'earth' ? (
            <RealEarth radius={def.size} lightPos={SUN} highlight={highlight} fallback={fallback} {...handlers} />
          ) : (
            <RealPlanet
              radius={def.size}
              map={def.body}
              ring={def.ring}
              atmos={ATMOS[def.body]?.[0]}
              atmosStrength={ATMOS[def.body]?.[1]}
              lightPos={SUN}
              highlight={highlight}
              fallback={fallback}
              {...handlers}
            />
          )}
          {interactive && (
            <Html center position={[0, def.size + 0.9, 0]} className="mv-label">
              <span className="mv-label__inner" style={{ display: 'inline-block', transform: hovered ? 'scale(1.15)' : 'none', transition: 'transform 0.2s' }}>
                {UNIVERSE_LABELS[def.universe]}
                {hovered && <small>{def.tagline}</small>}
              </span>
            </Html>
          )}
        </group>
      </group>
    </>
  );
};

export const HomeUniverse: React.FC<UniverseProps> = ({ active, preview }) => (
  <group rotation-x={0.08}>
    <RealSun radius={3} ignite />
    {ORBITS.map((def, i) => (
      <OrbitingPlanet key={def.universe} def={def} index={i} active={active} preview={preview} />
    ))}
  </group>
);
