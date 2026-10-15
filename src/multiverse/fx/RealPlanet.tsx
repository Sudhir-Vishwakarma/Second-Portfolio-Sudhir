// fx/RealPlanet.tsx — a photo-mapped planet lit by its universe's star, with relief, atmosphere and optional ring
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { Planet } from './Planet';
import { Palette } from './palettes';
import { Vec3 } from '../journey';
import { TextureKey } from './textures';
import { useRealTextures } from './useRealTextures';
import { WithTextures } from './WithTextures';
import { atmosphereShader, bodyShader, ringShader } from './realShaders';

export const RING_INNER = 1.24;
export const RING_OUTER = 2.27;

export interface BodyProps {
  radius: number;
  /** World-space position of the star that lights this body. */
  lightPos: Vec3;
  highlight?: number;
  position?: Vec3;
  tilt?: number;
  spin?: number;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  /** Procedural colours shown while the image loads, or if it fails. */
  fallback: Palette;
}

export interface RealPlanetProps extends BodyProps {
  map: TextureKey;
  atmos?: string;
  atmosStrength?: number;
  bump?: number;
  ring?: boolean;
}

export function bodyUniforms(tex: THREE.Texture, [lx, ly, lz]: Vec3, o: { atmos?: string; atmosStrength?: number; bump?: number } = {}) {
  const img = tex.image as { width?: number; height?: number } | undefined;
  return {
    uMap: { value: tex },
    uLightPos: { value: new THREE.Vector3(lx, ly, lz) },
    uAtmos: { value: new THREE.Color(o.atmos ?? '#000000') },
    uAtmosStrength: { value: o.atmos ? o.atmosStrength ?? 0.6 : 0 },
    uBump: { value: o.bump ?? 1.5 },
    uHover: { value: 0 },
    uTexel: { value: new THREE.Vector2(1 / (img?.width || 2048), 1 / (img?.height || 1024)) },
    uHasRing: { value: 0 },
    uRingMap: { value: tex },
    uRingCenter: { value: new THREE.Vector3() },
    uRingNormal: { value: new THREE.Vector3(0, 1, 0) },
    uRingInner: { value: 0 },
    uRingOuter: { value: 0 },
  };
}

/** Thin glowing shell, brightest on the lit limb (Earth-blue, Mars-orange, …). */
export const Atmosphere: React.FC<{ radius: number; color: string; lightPos: Vec3; strength?: number }> = ({ radius, color, lightPos, strength = 0.6 }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const [lx, ly, lz] = lightPos;
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(color) }, uLightPos: { value: new THREE.Vector3(lx, ly, lz) }, uCenter: { value: new THREE.Vector3() }, uStrength: { value: strength } }),
    [color, lx, ly, lz, strength]
  );
  useFrame(() => mesh.current.getWorldPosition(uniforms.uCenter.value));
  return (
    <mesh ref={mesh} scale={1.08} raycast={() => null}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial args={[atmosphereShader]} uniforms={uniforms} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
};

const RealPlanetBody: React.FC<RealPlanetProps> = ({
  radius, lightPos, highlight = 0, position, tilt = 0.2, spin = 0.08, map, atmos, atmosStrength = 0.6, bump = 1.5, ring,
  onPointerOver, onPointerOut, onClick,
}) => {
  const [tex, ringTex] = useRealTextures(ring ? [map, 'saturnRing'] : [map]);
  const body = useRef<THREE.Mesh>(null!);
  const ringMesh = useRef<THREE.Mesh>(null!);
  const [lx, ly, lz] = lightPos;
  const uniforms = useMemo(() => {
    const u = bodyUniforms(tex, [lx, ly, lz], { atmos, atmosStrength, bump });
    if (ring && ringTex) {
      u.uHasRing.value = 1;
      u.uRingMap.value = ringTex;
    }
    return u;
  }, [tex, ringTex, ring, lx, ly, lz, atmos, atmosStrength, bump]);
  const ringUniforms = useMemo(
    () => ({
      uRingMap: { value: ringTex ?? tex },
      uInner: { value: radius * RING_INNER },
      uOuter: { value: radius * RING_OUTER },
      uLightPos: { value: new THREE.Vector3(lx, ly, lz) },
      uCenter: { value: new THREE.Vector3() },
      uRadius: { value: radius },
    }),
    [ringTex, tex, radius, lx, ly, lz]
  );
  const scale = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    easing.damp(uniforms.uHover, 'value', highlight, 0.2, dt);
    body.current.rotation.y += dt * spin;
    easing.damp3(body.current.scale, 1 + highlight * 0.25, 0.2, dt);
    if (ring) {
      const m = ringMesh.current;
      m.getWorldPosition(uniforms.uRingCenter.value);
      ringUniforms.uCenter.value.copy(uniforms.uRingCenter.value);
      m.getWorldDirection(uniforms.uRingNormal.value);
      const s = m.getWorldScale(scale).x;
      uniforms.uRingInner.value = radius * RING_INNER * s;
      uniforms.uRingOuter.value = radius * RING_OUTER * s;
      ringUniforms.uRadius.value = radius * s * body.current.scale.x;
    }
  });

  return (
    <group position={position}>
      <group rotation-z={tilt}>
        <mesh ref={body} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
          <sphereGeometry args={[radius, 64, 64]} />
          <shaderMaterial args={[bodyShader]} uniforms={uniforms} />
        </mesh>
        {ring && (
          <mesh ref={ringMesh} rotation-x={-Math.PI / 2} raycast={() => null}>
            <ringGeometry args={[radius * RING_INNER, radius * RING_OUTER, 128]} />
            <shaderMaterial args={[ringShader]} uniforms={ringUniforms} transparent side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        )}
      </group>
      {atmos && atmosStrength > 0 && <Atmosphere radius={radius} color={atmos} lightPos={lightPos} strength={atmosStrength} />}
    </group>
  );
};

export const RealPlanet: React.FC<RealPlanetProps> = (props) => (
  <WithTextures
    fallback={
      <Planet
        radius={props.radius}
        palette={props.fallback}
        bands={8}
        lightPos={props.lightPos}
        highlight={props.highlight}
        ring={props.ring}
        position={props.position}
        onPointerOver={props.onPointerOver}
        onPointerOut={props.onPointerOut}
        onClick={props.onClick}
      />
    }
  >
    <RealPlanetBody {...props} />
  </WithTextures>
);
