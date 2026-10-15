import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RealEarth } from '../fx/RealEarth';
import { RealPlanet } from '../fx/RealPlanet';
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

/** A real cratered moon; it brightens and grows as its education beat is reached. */
const Moon: React.FC<{ index: number }> = ({ index }) => {
  const [lit, setLit] = useState(false);
  const litRef = useRef(false);
  const a = MOON_ANGLES[index];
  useFrame(() => {
    const s = useJourney.getState();
    const step = STEPS[s.step];
    const now = step.universe === 'about' && step.beat === 'education' && !s.moving &&
      performance.now() - s.arrivedAt > MOON_DELAY_MS + index * MOON_STAGGER_MS;
    if (now !== litRef.current) {
      litRef.current = now;
      setLit(now);
    }
  });
  return (
    <RealPlanet
      radius={0.6}
      map="moon"
      bump={2}
      atmos="#9cc9ff"
      atmosStrength={0}
      tilt={0}
      spin={0.1}
      lightPos={light}
      highlight={lit ? 1 : 0}
      position={[Math.cos(a) * ORBIT_RADIUS, 0, Math.sin(a) * ORBIT_RADIUS]}
      fallback={palette}
    />
  );
};

export const AboutUniverse: React.FC<UniverseProps> = () => (
  <>
    <RealEarth radius={4} lightPos={light} fallback={palette} />
    <group rotation={[0.35, 0, 0.12]}>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ORBIT_RADIUS - 0.02, ORBIT_RADIUS + 0.02, 192]} />
        <meshBasicMaterial color="#cbd5e1" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      {MOON_ANGLES.map((_, i) => (
        <Moon key={i} index={i} />
      ))}
    </group>
  </>
);
