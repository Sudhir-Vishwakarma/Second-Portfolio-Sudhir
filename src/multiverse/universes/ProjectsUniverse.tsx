import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, Line, useCursor } from '@react-three/drei';
import { easing } from 'maath';
import { GlowSprite } from '../fx/GlowSprite';
import { glowTexture } from '../fx/glow';
import { PALETTES } from '../fx/palettes';
import { projects, CONSTELLATIONS, Constellation } from '../../data/portfolio';
import { layoutGalaxy } from './layout';
import { useJourney } from '../store';
import { Vec3 } from '../journey';
import { UniverseProps } from './index';

export const CONSTELLATION_COLORS: Record<Constellation, string> = {
  'CRM Platforms': '#f97316',
  'Salesforce Portals': '#a78bfa',
  'Real Estate': '#38bdf8',
  'Web Apps': '#f472b6',
};

const { positions, centers } = layoutGalaxy(projects);

const GalaxyDust: React.FC = () => {
  const geo = useMemo(() => {
    const n = 6000;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const a = new THREE.Color(PALETTES.projects.a);
    const b = new THREE.Color(PALETTES.projects.b);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const arm = i % 3;
      const d = Math.pow(Math.random(), 0.6) * 34;
      const t = d * 0.18 + (arm * Math.PI * 2) / 3 + (Math.random() - 0.5) * 0.5;
      pos.set([Math.cos(t) * d, (Math.random() - 0.5) * 2.4 * Math.exp(-d / 20), Math.sin(t) * d], i * 3);
      c.copy(a).lerp(b, d / 34).multiplyScalar(1.4);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.35} map={glowTexture} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
};

const Star: React.FC<{ index: number; interactive: boolean; wasDragged: () => boolean }> = ({ index, interactive, wasDragged }) => {
  const p = projects[index];
  const color = CONSTELLATION_COLORS[p.constellation];
  const bright = useMemo(() => new THREE.Color(color).multiplyScalar(3), [color]);
  const group = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const size = p.featured ? 0.55 : 0.32;

  useCursor(hovered && interactive);
  useEffect(() => {
    if (!interactive) setHovered(false);
  }, [interactive]);

  useFrame((state, dt) => {
    const twinkle = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.08;
    easing.damp3(group.current.scale, (hovered ? 1.8 : 1) * twinkle, 0.15, dt);
  });

  return (
    <group ref={group} position={positions[index]}>
      <mesh
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          if (!interactive || wasDragged()) return;
          e.stopPropagation();
          useJourney.getState().openModal({ kind: 'project', index });
        }}
      >
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial color={bright} toneMapped={false} />
      </mesh>
      <GlowSprite color={color} scale={p.featured ? 5 : 2.6} opacity={0.8} />
      {p.featured && <GlowSprite color={color} scale={[9, 0.5, 1]} opacity={0.6} />}
      {interactive && hovered && (
        <Html center position={[0, size + 1.1, 0]} className="mv-label">
          {p.title}
          <small>{p.shortDescription}</small>
        </Html>
      )}
    </group>
  );
};

export const ProjectsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const galaxy = useRef<THREE.Group>(null!);
  const drag = useRef({ down: false, x: 0, startX: 0, startY: 0, moved: false, target: 0 });
  const interactive = active && !preview;
  const wasDragged = () => drag.current.moved;

  useEffect(() => {
    if (!interactive) return;
    const state = drag.current;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).tagName !== 'CANVAS') return;
      drag.current.down = true;
      drag.current.x = e.clientX;
      drag.current.startX = e.clientX;
      drag.current.startY = e.clientY;
      drag.current.moved = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.down) return;
      const d = drag.current;
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 5) d.moved = true;
      d.target = THREE.MathUtils.clamp(d.target + (e.clientX - d.x) * 0.004, -0.8, 0.8);
      d.x = e.clientX;
    };
    const onUp = () => {
      drag.current.down = false;
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      state.down = false;
    };
  }, [interactive]);

  useFrame((state, dt) => {
    easing.damp(galaxy.current.rotation, 'y', drag.current.target + state.clock.elapsedTime * 0.01, 0.4, dt);
  });

  const lines = useMemo(
    () => CONSTELLATIONS.map((c) => ({ c, pts: projects.map((p, i) => (p.constellation === c ? positions[i] : null)).filter(Boolean) as Vec3[] })),
    []
  );

  return (
    <group ref={galaxy}>
      <GalaxyDust />
      <GlowSprite color={PALETTES.projects.b} scale={18} opacity={0.5} />
      {lines.map(({ c, pts }) => (
        <Line key={c} points={pts} color={CONSTELLATION_COLORS[c]} lineWidth={1} transparent opacity={0.25} />
      ))}
      {projects.map((p, i) => (
        <Star key={p.title} index={i} interactive={interactive} wasDragged={wasDragged} />
      ))}
      {interactive &&
        CONSTELLATIONS.map((c) => (
          <Html key={c} center position={[centers[c][0], centers[c][1] + 6, centers[c][2]]} className="mv-label">
            <span style={{ color: CONSTELLATION_COLORS[c] }}>{c}</span>
          </Html>
        ))}
    </group>
  );
};
