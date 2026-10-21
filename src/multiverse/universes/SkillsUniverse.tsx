import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { RealPlanet } from '../fx/RealPlanet';
import { RealEarth } from '../fx/RealEarth';
import { Asteroid } from '../fx/Asteroid';
import { GlowSprite } from '../fx/GlowSprite';
import { Palette } from '../fx/palettes';
import { TextureKey } from '../fx/textures';
import { skills, SkillGroup, SKILL_GROUPS } from '../../data/portfolio';
import { Vec3, universeOrigin } from '../journey';
import { useJourney } from '../store';
import { UniverseProps } from './index';
import { HitArea, InfoCard, onTap } from './Tappable';
import { RING_TILT, SKILL_COLORS, SYSTEM_RING, systemPositions } from './skillSystems';

export { SKILL_COLORS } from './skillSystems';

const origin = universeOrigin('skills');
const light: Vec3 = [origin[0] + 30, origin[1] + 18, origin[2] + 26];
const POSITIONS = systemPositions();

const PLANET_RADIUS = 1.3;
/** Skill asteroids circle their planet in a near-vertical ring, so none hide behind it. */
const MOON_ORBIT = 2.7;
const MOON_SPEED = 0.18;

/** Each group gets its own real body and atmosphere tint (its skill colour). */
const BODIES: Record<SkillGroup, { map: TextureKey | 'earth'; ring?: boolean; atmos: number }> = {
  Languages: { map: 'jupiter', atmos: 0.45 },
  Database: { map: 'neptune', atmos: 0.6 },
  Framework: { map: 'saturn', ring: true, atmos: 0.35 },
  'Version Control': { map: 'mars', atmos: 0.45 },
  Tools: { map: 'moon', atmos: 0.55 },
  'Operating System': { map: 'earth', atmos: 0.5 },
  'AI Tools': { map: 'neptune', atmos: 0.9 },
};

const paletteOf = (color: string): Palette => ({ a: '#111827', b: color, atmos: color });

interface RockProps { id: string; name: string; group: SkillGroup; groupIndex: number; angle: number; seed: number; interactive: boolean; focused: boolean }

const SkillRock: React.FC<RockProps> = ({ id, name, group, groupIndex, angle, seed, interactive, focused }) => {
  const color = SKILL_COLORS[group];
  const holder = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const picked = useJourney((s) => s.picked === id);
  useEffect(() => {
    if (!interactive) setHovered(false);
  }, [interactive]);
  useFrame((state) => {
    const a = angle + state.clock.elapsedTime * MOON_SPEED;
    holder.current.position.set(Math.cos(a) * MOON_ORBIT, Math.sin(a) * MOON_ORBIT, 0);
  });
  const select = () => {
    useJourney.getState().focusSkill(groupIndex);
    useJourney.getState().pick(id);
  };
  const lit = hovered || picked;
  return (
    <group ref={holder}>
      <Asteroid
        seed={seed}
        radius={0.4 + (seed % 3) * 0.06}
        color={color}
        lightPos={light}
        position={[0, 0, 0]}
        hovered={lit || focused}
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      />
      <GlowSprite color={color} scale={lit ? 2.6 : 1.5} opacity={lit ? 0.75 : 0.35} />
      <HitArea radius={0.85} onClick={onTap(interactive, select)} />
      {interactive && lit && (
        <InfoCard position={[0, 1.3, 0]}>
          <strong style={{ color }}>{name}</strong>
          <small>{group}</small>
        </InfoCard>
      )}
      {interactive && focused && !lit && (
        <Html center position={[0, 0.95, 0]} className="mv-label mv-label--skill" pointerEvents="none">
          <span style={{ color }}>{name}</span>
        </Html>
      )}
    </group>
  );
};

const SkillSystem: React.FC<{ index: number; group: SkillGroup; interactive: boolean }> = ({ index, group, interactive }) => {
  const color = SKILL_COLORS[group];
  const body = BODIES[group];
  const focus = useJourney((s) => s.skillFocus);
  const focused = focus === index;
  const members = useMemo(() => skills.filter((s) => s.group === group), [group]);
  const [hovered, setHovered] = useState(false);
  const fly = onTap(interactive, () => {
    useJourney.getState().pick(null);
    useJourney.getState().focusSkill(index);
  });
  const hover = {
    onPointerOver: (e: { stopPropagation: () => void }) => {
      if (!interactive) return;
      e.stopPropagation();
      setHovered(true);
    },
    onPointerOut: () => setHovered(false),
  };
  const shared = { radius: PLANET_RADIUS, lightPos: light, highlight: hovered || focused ? 1 : 0, fallback: paletteOf(color), onClick: fly, ...hover };
  return (
    <group position={POSITIONS[index]}>
      {body.map === 'earth' ? (
        <RealEarth {...shared} />
      ) : (
        <RealPlanet {...shared} map={body.map} ring={body.ring} atmos={color} atmosStrength={body.atmos} tilt={body.ring ? 0.47 : 0.15} spin={0.1} />
      )}
      {group === 'AI Tools' && <GlowSprite color={color} scale={6} opacity={0.35} />}
      <HitArea radius={2} onClick={fly} />
      <group rotation-x={0.28}>
        <mesh>
          <ringGeometry args={[MOON_ORBIT - 0.015, MOON_ORBIT + 0.015, 96]} />
          <meshBasicMaterial color={color} transparent opacity={focused ? 0.35 : 0.14} side={THREE.DoubleSide} />
        </mesh>
        {members.map((s, k) => (
          <SkillRock
            key={s.name}
            id={`skill-${skills.indexOf(s)}`}
            name={s.name}
            group={group}
            groupIndex={index}
            angle={(k / members.length) * Math.PI * 2}
            seed={skills.indexOf(s) * 7 + 3}
            interactive={interactive}
            focused={focused}
          />
        ))}
      </group>
      {interactive && (
        <Html center position={[0, -(MOON_ORBIT + 1.1), 0]} className="mv-label" pointerEvents="none">
          <span style={{ color }}>{group}</span>
          <small>{members.length} {members.length === 1 ? 'skill' : 'skills'}</small>
        </Html>
      )}
    </group>
  );
};

export const SkillsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const interactive = active && !preview;
  return (
    <>
      <GlowSprite color="#5eead4" scale={16} opacity={0.18} />
      <group rotation-x={RING_TILT}>
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[SYSTEM_RING - 0.02, SYSTEM_RING + 0.02, 192]} />
          <meshBasicMaterial color="#cbd5e1" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {SKILL_GROUPS.map((g, i) => (
        <SkillSystem key={g} index={i} group={g} interactive={interactive} />
      ))}
    </>
  );
};
