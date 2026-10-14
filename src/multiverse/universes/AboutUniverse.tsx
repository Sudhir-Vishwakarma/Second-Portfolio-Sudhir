import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Nebula } from '../fx/Nebula';
import { Planet } from '../fx/Planet';
import { GlowSprite } from '../fx/GlowSprite';
import { PALETTES } from '../fx/palettes';
import { STEPS, universeOrigin, Vec3 } from '../journey';
import { useJourney } from '../store';
import { UniverseProps } from './index';

export const MOON_DELAY_MS = 200;
export const MOON_STAGGER_MS = 250;
const ORBIT_RADIUS = 11;
const MOON_ANGLES = [0.5, 2.1, 3.7, 5.2];
const palette = PALETTES.about;
const origin = universeOrigin('about');
const light: Vec3 = [origin[0] + 25, origin[1] + 15, origin[2] + 25];

const Moon: React.FC<{ index: number }> = ({ index }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const dim = useMemo(() => new THREE.Color('#1e293b'), []);
  const bright = useMemo(() => new THREE.Color(palette.atmos).multiplyScalar(3), []);
  const a = MOON_ANGLES[index];

  useFrame((_, dt) => {
    const s = useJourney.getState();
    const step = STEPS[s.step];
    const lit = step.universe === 'about' && step.beat === 'education' && !s.moving &&
      performance.now() - s.arrivedAt > MOON_DELAY_MS + index * MOON_STAGGER_MS;
    mat.current.color.lerp(lit ? bright : dim, Math.min(1, dt * 6));
    const target = lit ? 1.4 : 1;
    mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, target, Math.min(1, dt * 6)));
  });

  return (
    <mesh ref={mesh} position={[Math.cos(a) * ORBIT_RADIUS, 0, Math.sin(a) * ORBIT_RADIUS]}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshBasicMaterial ref={mat} color={dim} toneMapped={false} />
    </mesh>
  );
};

export const AboutUniverse: React.FC<UniverseProps> = () => (
  <>
    <Nebula palette={palette} radius={70} />
    <GlowSprite color={palette.b} scale={26} opacity={0.35} />
    <Planet radius={4} palette={palette} bands={6} lightPos={light} />
    <group rotation={[0.35, 0, 0.12]}>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ORBIT_RADIUS - 0.03, ORBIT_RADIUS + 0.03, 192]} />
        <meshBasicMaterial color={palette.atmos} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      {MOON_ANGLES.map((_, i) => (
        <Moon key={i} index={i} />
      ))}
    </group>
  </>
);
