import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { easing } from 'maath';
import { sunShader } from '../fx/shaders';
import { GlowSprite } from '../fx/GlowSprite';
import { Planet } from '../fx/Planet';
import { PALETTES } from '../fx/palettes';
import { UniverseId, UNIVERSE_LABELS, WARMUP_MS, firstStepOf } from '../journey';
import { useJourney } from '../store';
import { UniverseProps } from './index';

interface OrbitDef { universe: UniverseId; orbit: number; size: number; speed: number; bands: number; ring?: boolean; tagline: string }

const ORBITS: OrbitDef[] = [
  { universe: 'about', orbit: 7, size: 0.7, speed: 0.22, bands: 6, tagline: 'Who I am' },
  { universe: 'skills', orbit: 9.5, size: 0.8, speed: 0.17, bands: 9, tagline: 'What I build with' },
  { universe: 'certifications', orbit: 12, size: 0.75, speed: 0.13, bands: 7, tagline: "What I've earned" },
  { universe: 'work', orbit: 14.5, size: 0.95, speed: 0.1, bands: 10, tagline: "Where I've built" },
  { universe: 'projects', orbit: 17.5, size: 1.25, speed: 0.08, bands: 14, ring: true, tagline: "Everything I've made" },
  { universe: 'contact', orbit: 20.5, size: 0.8, speed: 0.06, bands: 8, tagline: 'Open a channel' },
];

// HDR glow colour (components above 1 are intentional)
const SUN_GLOW = new THREE.Color(1.3, 0.45, 0.08);

const Sun: React.FC = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    // ignite once the loader lifts
    easing.damp3(mesh.current.scale, state.clock.elapsedTime * 1000 > WARMUP_MS ? 1 : 0.001, 1.0, dt);
    mesh.current.rotation.y += dt * 0.03;
  });
  return (
    <group>
      <mesh ref={mesh} scale={0.001}>
        <sphereGeometry args={[3, 96, 96]} />
        <shaderMaterial args={[sunShader]} uniforms={uniforms} toneMapped={false} />
      </mesh>
      <GlowSprite color={SUN_GLOW} scale={15} />
    </group>
  );
};

const OrbitingPlanet: React.FC<{ def: OrbitDef; index: number; active: boolean; preview?: boolean }> = ({ def, index, active, preview }) => {
  const pivot = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const interactive = active && !preview;

  useFrame((state) => {
    pivot.current.rotation.y = index * 1.7 + state.clock.elapsedTime * def.speed;
  });

  return (
    <>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[def.orbit - 0.015, def.orbit + 0.015, 192]} />
        <meshBasicMaterial color={PALETTES[def.universe].atmos} transparent opacity={hovered ? 0.55 : 0.14} side={THREE.DoubleSide} />
      </mesh>
      <group ref={pivot}>
        <group position={[def.orbit, 0, 0]}>
          <Planet
            radius={def.size}
            palette={PALETTES[def.universe]}
            bands={def.bands}
            ring={def.ring}
            lightPos={[0, 0, 0]}
            highlight={hovered ? 1 : 0}
            onPointerOver={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHovered(false);
              document.body.style.cursor = '';
            }}
            onClick={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              document.body.style.cursor = '';
              useJourney.getState().jump(firstStepOf(def.universe));
            }}
          />
          {interactive && (
            <Html center position={[0, def.size + 0.9, 0]} className="mv-label" style={{ transform: hovered ? 'scale(1.15)' : undefined }}>
              {UNIVERSE_LABELS[def.universe]}
              {hovered && <small>{def.tagline}</small>}
            </Html>
          )}
        </group>
      </group>
    </>
  );
};

export const HomeUniverse: React.FC<UniverseProps> = ({ active, preview }) => (
  <group rotation-x={0.08}>
    <Sun />
    {ORBITS.map((def, i) => (
      <OrbitingPlanet key={def.universe} def={def} index={i} active={active} preview={preview} />
    ))}
  </group>
);
