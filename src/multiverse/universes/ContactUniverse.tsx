import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RealPlanet } from '../fx/RealPlanet';
import { RealEarth } from '../fx/RealEarth';
import { RadioDish } from '../fx/RadioDish';
import { PALETTES } from '../fx/palettes';
import { useJourney } from '../store';
import { universeOrigin, Vec3 } from '../journey';
import { UniverseProps } from './index';

export const BEAM_MS = 2500;
const DISH: [number, number, number] = [0, 3.4, 0];
const origin = universeOrigin('contact');
// A low sun off to the right: long shadows on the lunar surface, Earth half-lit.
const SUN: Vec3 = [origin[0] + 120, origin[1] + 10, origin[2] - 60];

export const ContactUniverse: React.FC<UniverseProps> = () => {
  const dish = useRef<THREE.Group>(null!);
  const lights = useRef<THREE.Group>(null!);
  const beam = useRef<THREE.Mesh>(null!);
  const beamMat = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame((state, dt) => {
    dish.current.rotation.y += dt * 0.4;
    lights.current.children.forEach((child, i) => {
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      const on = Math.sin(state.clock.elapsedTime * 3 + i * 2) > 0.3;
      m.color.setRGB(on ? 3 : 0.3, on ? 0.25 : 0.03, on ? 0.2 : 0.02); // red aviation beacons
    });
    const t = performance.now() - useJourney.getState().beamAt;
    const live = t >= 0 && t < BEAM_MS;
    beam.current.visible = live;
    if (live) {
      beam.current.scale.y = Math.min(1, t / 400);
      beamMat.current.opacity = 1 - t / BEAM_MS;
    }
  });

  return (
    <>
      {/* lunar surface: the top of a huge Moon, the dish stands on it */}
      <RealPlanet radius={60} map="moon" bump={1.0} tilt={Math.PI / 2} spin={0} lightPos={SUN} position={[0, -70, 0]} fallback={PALETTES.certifications} />
      {/* Earth rising behind the dish */}
      <RealEarth radius={10} lightPos={SUN} position={[-26, -26, -80]} spin={0.03} fallback={PALETTES.about} />
      <group scale={1.5}>
        <RadioDish dishRef={dish} dishPos={DISH} />
        <group ref={lights}>
          {[[-0.6, -4, 0.45], [0.6, -1, 0.45], [0, 5.6, 0]].map((p, i) => (
            <mesh key={i} position={p as [number, number, number]}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshBasicMaterial color={[3, 0.25, 0.2]} toneMapped={false} />
            </mesh>
          ))}
        </group>
        <group position={DISH} rotation={[-0.6, 0, 0.35]}>
          <mesh ref={beam} visible={false}>
            <cylinderGeometry args={[0.12, 0.7, 220, 16, 1, true]} />
            <meshBasicMaterial ref={beamMat} color={[1.2, 3, 2.2]} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </>
  );
};
