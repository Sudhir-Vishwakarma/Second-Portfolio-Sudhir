// fx/RealEarth.tsx — Earth lit by its universe's star: day map, city lights, ocean glint, clouds, blue atmosphere
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { Planet } from './Planet';
import { Atmosphere, BodyProps } from './RealPlanet';
import { useRealTextures } from './useRealTextures';
import { WithTextures } from './WithTextures';
import { cloudShader, earthShader } from './realShaders';

const EarthBody: React.FC<BodyProps> = ({ radius, lightPos, highlight = 0, position, tilt = 0.41, spin = 0.05, onPointerOver, onPointerOut, onClick }) => {
  const [day, night, clouds] = useRealTextures(['earthDay', 'earthNight', 'earthClouds']);
  const body = useRef<THREE.Mesh>(null!);
  const sky = useRef<THREE.Mesh>(null!);
  const scaleGroup = useRef<THREE.Group>(null!);
  const [lx, ly, lz] = lightPos;
  const uniforms = useMemo(
    () => ({ uDay: { value: day }, uNight: { value: night }, uLightPos: { value: new THREE.Vector3(lx, ly, lz) }, uAtmos: { value: new THREE.Color('#6ab4ff') }, uHover: { value: 0 } }),
    [day, night, lx, ly, lz]
  );
  const cloudUniforms = useMemo(() => ({ uClouds: { value: clouds }, uLightPos: { value: new THREE.Vector3(lx, ly, lz) } }), [clouds, lx, ly, lz]);
  useFrame((_, dt) => {
    easing.damp(uniforms.uHover, 'value', highlight, 0.2, dt);
    body.current.rotation.y += dt * spin;
    sky.current.rotation.y += dt * spin * 1.25;
    // Hover grows body, clouds and atmosphere together so the blue limb stays visible.
    easing.damp3(scaleGroup.current.scale, 1 + highlight * 0.25, 0.2, dt);
  });
  return (
    <group position={position}>
      <group ref={scaleGroup}>
        <group rotation-z={tilt}>
          <mesh ref={body} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
            <sphereGeometry args={[radius, 64, 64]} />
            <shaderMaterial args={[earthShader]} uniforms={uniforms} />
          </mesh>
          <mesh ref={sky} raycast={() => null}>
            <sphereGeometry args={[radius * 1.012, 64, 64]} />
            <shaderMaterial args={[cloudShader]} uniforms={cloudUniforms} transparent depthWrite={false} />
          </mesh>
        </group>
        <Atmosphere radius={radius} color="#6ab4ff" lightPos={lightPos} strength={0.9} />
      </group>
    </group>
  );
};

/** Earth: day map lit by the sun, city lights on the night side, ocean glint, drifting clouds, blue atmosphere. */
export const RealEarth: React.FC<BodyProps> = (props) => (
  <WithTextures fallback={<Planet radius={props.radius} palette={props.fallback} bands={6} lightPos={props.lightPos} highlight={props.highlight} position={props.position} onPointerOver={props.onPointerOver} onPointerOut={props.onPointerOut} onClick={props.onClick} />}>
    <EarthBody {...props} />
  </WithTextures>
);
