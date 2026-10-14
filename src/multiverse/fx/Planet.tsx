// fx/Planet.tsx — procedural banded planet lit from a world-space point
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { planetShader } from './shaders';
import { Palette } from './palettes';
import { Vec3 } from '../journey';

interface PlanetProps {
  radius: number;
  palette: Palette;
  bands: number;
  lightPos: Vec3;
  highlight?: number;
  ring?: boolean;
  position?: Vec3;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

export const Planet: React.FC<PlanetProps> = ({ radius, palette, bands, lightPos, highlight = 0, ring, position, onPointerOver, onPointerOut, onClick }) => {
  const body = useRef<THREE.Mesh>(null!);
  const [lx, ly, lz] = lightPos;
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(palette.a) },
      uColorB: { value: new THREE.Color(palette.b) },
      uAtmos: { value: new THREE.Color(palette.atmos) },
      uBands: { value: bands },
      uHover: { value: 0 },
      uLightPos: { value: new THREE.Vector3(lx, ly, lz) },
    }),
    [palette, bands, lx, ly, lz]
  );

  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    easing.damp(uniforms.uHover, 'value', highlight, 0.2, dt);
    body.current.rotation.y += dt * 0.25;
    easing.damp3(body.current.scale, 1 + highlight * 0.25, 0.2, dt);
  });

  return (
    <group position={position}>
      <mesh ref={body} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial args={[planetShader]} uniforms={uniforms} />
      </mesh>
      {ring && (
        <mesh rotation={[-Math.PI / 2.4, 0, 0.3]}>
          <ringGeometry args={[radius * 1.4, radius * 1.95, 128]} />
          <meshBasicMaterial color={palette.atmos} transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};
