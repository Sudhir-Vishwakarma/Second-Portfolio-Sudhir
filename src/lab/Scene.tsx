import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, Stars, Sparkles, Float, MeshPortalMaterial } from '@react-three/drei';
import { easing } from 'maath';
import { sunShader, planetShader } from './shaders';
import { Section, SECTIONS, PROJECTS } from './sections';

export type Stage = 'system' | 'portal' | 'inside';

// Shared per-frame values (written by the camera rig, read by effects)
export const rig = { warp: 0 };

export const PORTAL_POS = new THREE.Vector3(0, 0, -400);

// Soft round sprite used for stars, nebula points and glows
const glowTexture = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();

/* ---------------- Sun ---------------- */
const Sun: React.FC = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    // ignite: grow from nothing on load
    easing.damp3(mesh.current.scale, 1, 1.2, dt);
    mesh.current.rotation.y += dt * 0.03;
  });
  return (
    <group>
      <mesh ref={mesh} scale={0.001}>
        <sphereGeometry args={[3, 96, 96]} />
        <shaderMaterial args={[sunShader]} uniforms={uniforms} toneMapped={false} />
      </mesh>
      <sprite scale={15}>
        <spriteMaterial map={glowTexture} color={[1.3, 0.45, 0.08]} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <pointLight intensity={400} distance={80} color="#ffb070" />
    </group>
  );
};

/* ---------------- Planet ---------------- */
const Planet: React.FC<{ section: Section; index: number; showLabel: boolean; onSelect: (i: number) => void }> = ({ section, index, showLabel, onSelect }) => {
  const pivot = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(section.colorA) },
      uColorB: { value: new THREE.Color(section.colorB) },
      uAtmos: { value: new THREE.Color(section.atmos) },
      uBands: { value: section.bands },
      uHover: { value: 0 },
    }),
    [section]
  );
  const start = useMemo(() => index * 1.7, [index]);

  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    easing.damp(uniforms.uHover, 'value', hovered ? 1 : 0, 0.2, dt);
    pivot.current.rotation.y = start + state.clock.elapsedTime * section.speed;
    body.current.rotation.y += dt * 0.25;
    easing.damp3(body.current.scale, hovered ? 1.25 : 1, 0.2, dt);
  });

  return (
    <>
      {/* orbit path */}
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[section.orbit - 0.015, section.orbit + 0.015, 192]} />
        <meshBasicMaterial color={section.atmos} transparent opacity={hovered ? 0.55 : 0.14} side={THREE.DoubleSide} />
      </mesh>
      <group ref={pivot}>
        <group position={[section.orbit, 0, 0]}>
          <mesh
            ref={body}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = ''; }}
            onClick={(e) => { e.stopPropagation(); onSelect(index); }}
          >
            <sphereGeometry args={[section.size, 64, 64]} />
            <shaderMaterial args={[planetShader]} uniforms={uniforms} />
          </mesh>
          {section.ring && (
            <mesh rotation={[-Math.PI / 2.4, 0, 0.3]}>
              <ringGeometry args={[section.size * 1.4, section.size * 1.95, 128]} />
              <meshBasicMaterial color={section.atmos} transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
          )}
          {showLabel && (
            <Html center position={[0, section.size + 0.9, 0]} className={`planet-label ${hovered ? 'is-hover' : ''}`}>
              <span>{section.label}</span>
              <small>{section.tagline}</small>
            </Html>
          )}
        </group>
      </group>
    </>
  );
};

export const SolarSystem: React.FC<{ visible: boolean; showLabels: boolean; onSelect: (i: number) => void }> = ({ visible, showLabels, onSelect }) => (
  <group visible={visible} rotation-x={0.08}>
    <Sun />
    {SECTIONS.map((s, i) => (
      <Planet key={s.id} section={s} index={i} showLabel={showLabels} onSelect={onSelect} />
    ))}
  </group>
);

/* ---------------- Starfield that travels with the camera ---------------- */
export const Starfield: React.FC = () => {
  const group = useRef<THREE.Group>(null!);
  useFrame(({ camera }) => group.current.position.copy(camera.position));
  return (
    <group ref={group}>
      <Stars radius={120} depth={60} count={6000} factor={4} saturation={0.4} fade speed={0.6} />
    </group>
  );
};

/* ---------------- Hyperspeed streaks ---------------- */
const STREAKS = 1400;
export const Hyperspace: React.FC = () => {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(
    () =>
      Array.from({ length: STREAKS }, () => {
        const a = Math.random() * Math.PI * 2;
        const r = 2.5 + Math.pow(Math.random(), 0.7) * 45;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: -260 + Math.random() * 280 };
      }),
    []
  );

  useFrame(({ camera }, dt) => {
    const w = rig.warp;
    mesh.current.position.copy(camera.position);
    mat.current.opacity = Math.min(1, w * 1.6);
    mesh.current.visible = w > 0.01;
    if (!mesh.current.visible) return;
    const speed = 120 + w * 900;
    for (let i = 0; i < STREAKS; i++) {
      const d = data[i];
      d.z += speed * dt;
      if (d.z > 20) d.z -= 280;
      dummy.position.set(d.x, d.y, d.z);
      dummy.scale.set(1, 1, 1 + w * 38);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, STREAKS]} frustumCulled={false}>
      <boxGeometry args={[0.035, 0.035, 0.5]} />
      <meshBasicMaterial ref={mat} color={[1.6, 1.9, 3]} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  );
};

/* ---------------- A universe behind a portal ---------------- */
const Nebula: React.FC<{ section: Section }> = ({ section }) => {
  const points = useRef<THREE.Points>(null!);
  const geo = useMemo(() => {
    const n = 5000;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const a = new THREE.Color(section.colorA);
    const b = new THREE.Color(section.colorB);
    const white = new THREE.Color('#ffffff');
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      // swirl-shaped cloud
      const t = Math.random() * Math.PI * 6;
      const r = 4 + t * 3 + (Math.random() - 0.5) * 10;
      pos[i * 3] = Math.cos(t) * r + (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14 * Math.exp(-r / 60);
      pos[i * 3 + 2] = -45 + Math.sin(t) * r * 0.9;
      c.copy(a).lerp(b, Math.random()).lerp(white, Math.random() * Math.random() * 0.6);
      col.set([c.r * 1.6, c.g * 1.6, c.b * 1.6], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [section]);
  useFrame((_, dt) => (points.current.rotation.y += dt * 0.02));
  return (
    <group position={[0, 0, -45]}>
      <points ref={points} geometry={geo} position={[0, 0, 45]}>
        <pointsMaterial size={0.55} map={glowTexture} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      {[...Array(7)].map((_, i) => (
        <sprite key={i} position={[(i - 3) * 9, Math.sin(i * 2) * 6, -10 - (i % 3) * 8]} scale={30 + (i % 3) * 12}>
          <spriteMaterial map={glowTexture} color={i % 2 ? section.colorA : section.colorB} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
};

const Crystal: React.FC<{ section: Section }> = ({ section }) => {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state, dt) => {
    ref.current.rotation.y += dt * 0.25;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
  });
  return (
    <group ref={ref} position={[0, 0, -45]}>
      <mesh>
        <icosahedronGeometry args={[3.2, 0]} />
        <meshStandardMaterial color={section.atmos} emissive={section.colorA} emissiveIntensity={0.6} metalness={0.4} roughness={0.15} flatShading />
      </mesh>
      <mesh scale={1.35}>
        <icosahedronGeometry args={[3.2, 1]} />
        <meshBasicMaterial color={[2, 2, 2.4]} wireframe transparent opacity={0.25} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Holograms: React.FC = () => (
  <group position={[0, 0, -45]}>
    {PROJECTS.map((p, i) => {
      const a = (i - (PROJECTS.length - 1) / 2) * 0.42;
      const r = 15;
      return (
        <Float key={p.title} speed={1.5} rotationIntensity={0.15} floatIntensity={1.2}>
          <group position={[Math.sin(a) * r, i % 2 ? 2.6 : -2.6, Math.cos(a) * r]}>
            <Html transform sprite distanceFactor={9} className="holo-card" style={{ animationDelay: `${i * 0.12}s` }}>
              <a href={p.url} target="_blank" rel="noopener noreferrer">
                <span className="holo-index">0{i + 1}</span>
                <strong>{p.title}</strong>
                <em>{p.tag}</em>
              </a>
            </Html>
          </group>
        </Float>
      );
    })}
  </group>
);

export const Universe: React.FC<{ section: Section; interactive: boolean }> = ({ section, interactive }) => (
  <>
    <color attach="background" args={['#020108']} />
    <ambientLight intensity={0.4} />
    <pointLight position={[0, 6, -35]} intensity={300} color={section.atmos} />
    <Nebula section={section} />
    <Crystal section={section} />
    <Sparkles count={160} scale={[60, 30, 60]} position={[0, 0, -45]} size={3} speed={0.4} color={section.colorB} />
    {interactive && section.id === 'projects' && <Holograms />}
    {interactive && section.id !== 'projects' && (
      <Html center position={[0, 6, -38]} className="universe-title">
        <h2>{section.label}</h2>
        <p>This universe is next on the roadmap.</p>
      </Html>
    )}
  </>
);

/* ---------------- Portal ring with a live view of the universe ---------------- */
export const Portal: React.FC<{ section: Section; visible: boolean }> = ({ section, visible }) => {
  const group = useRef<THREE.Group>(null!);
  const outer = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  const glow = useMemo(() => new THREE.Color(section.atmos).multiplyScalar(5), [section]);
  useFrame((state, dt) => {
    // only shown once you have left the solar system; also during the first
    // 1.5s (behind the black intro curtain) so its shaders compile before the warp
    group.current.visible = visible && (state.camera.position.z < -120 || state.clock.elapsedTime < 1.5);
    outer.current.rotation.z += dt * 0.4;
    inner.current.rotation.z -= dt * 0.7;
    const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.015;
    outer.current.scale.setScalar(s);
  });
  return (
    <group ref={group} position={PORTAL_POS} visible={false}>
      <mesh>
        <circleGeometry args={[5, 96]} />
        <MeshPortalMaterial resolution={1024} blur={0}>
          <Universe section={section} interactive={false} />
        </MeshPortalMaterial>
      </mesh>
      <mesh ref={outer}>
        <torusGeometry args={[5.05, 0.07, 16, 160]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[5.4, 0.02, 8, 160, Math.PI * 1.4]} />
        <meshBasicMaterial color={glow} toneMapped={false} transparent opacity={0.7} />
      </mesh>
      <Sparkles count={90} scale={[13, 13, 3]} size={4} speed={0.6} color={section.atmos} />
      {/* the planet you are visiting, hanging beside the portal */}
      <mesh position={[16, -7, -28]}>
        <sphereGeometry args={[7, 64, 64]} />
        <shaderMaterial
          args={[planetShader]}
          uniforms={{
            uTime: { value: 0 },
            uColorA: { value: new THREE.Color(section.colorA) },
            uColorB: { value: new THREE.Color(section.colorB) },
            uAtmos: { value: new THREE.Color(section.atmos) },
            uBands: { value: section.bands },
            uHover: { value: 0.4 },
          }}
        />
      </mesh>
    </group>
  );
};

/* ---------------- Camera choreography ---------------- */
const CAM = {
  system: { pos: new THREE.Vector3(0, 6.5, 25), look: new THREE.Vector3(0, 0, 0) },
  portal: { pos: new THREE.Vector3(0, 0.4, -386.5), look: new THREE.Vector3(0, 0, -400) },
  inside: { pos: new THREE.Vector3(0, 0, -411), look: new THREE.Vector3(0, 0, -445) },
};

export const CameraRig: React.FC<{ stage: Stage; onCrossing: (inside: boolean) => void }> = ({ stage, onCrossing }) => {
  const look = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const last = useMemo(() => new THREE.Vector3(0, 6.5, 25), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const wasInside = useRef(false);

  useFrame((state, dt) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const goal = CAM[stage];
    // mouse parallax
    const px = state.pointer.x * (stage === 'system' ? 2.5 : 1.2);
    const py = state.pointer.y * (stage === 'system' ? 1.5 : 0.8);
    target.set(goal.pos.x + px, goal.pos.y + py, goal.pos.z);
    easing.damp3(cam.position, target, stage === 'inside' ? 0.7 : 0.85, dt);
    easing.damp3(look, goal.look, 0.5, dt);
    cam.lookAt(look);

    // warp strength from how fast the camera is moving
    const speed = cam.position.distanceTo(last) / Math.max(dt, 1e-4);
    last.copy(cam.position);
    easing.damp(rig, 'warp', THREE.MathUtils.clamp((speed - 25) / 160, 0, 1), 0.15, dt);

    // stretch the lens and shake while warping
    easing.damp(cam, 'fov', 55 + rig.warp * 38, 0.25, dt);
    cam.rotation.z += (Math.random() - 0.5) * 0.012 * rig.warp;
    cam.updateProjectionMatrix();

    // tell the app when the camera passes through the portal plane
    const inside = cam.position.z < PORTAL_POS.z - 0.5;
    if (inside !== wasInside.current) {
      wasInside.current = inside;
      onCrossing(inside);
    }
  });
  return null;
};
