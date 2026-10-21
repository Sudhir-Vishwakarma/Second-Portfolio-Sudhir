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
import { SKILL_STOPS, STEPS, Vec3, firstStepOf, universeOrigin } from '../journey';
import { useJourney } from '../store';
import { UniverseProps } from './index';
import { HitArea, InfoCard, onTap } from './Tappable';
import { SKILL_COLORS } from './skillColors';

export { SKILL_COLORS } from './skillColors';

const origin = universeOrigin('skills');
const lightFor = (p: Vec3): Vec3 => [origin[0] + p[0] + 18, origin[1] + p[1] + 12, origin[2] + p[2] + 22];

const PLANET_RADIUS = 2.4;
/** Skill asteroids circle their planet in a near-upright ring facing the camera, so none hide behind it. */
const ORBIT = 4.4;
const ORBIT_SPEED = 0.12;

/** Each group gets its own real body; its atmosphere glows in the group colour. */
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

/** Index of the skill stop the journey is at, or -1 outside the Skills universe. */
const currentStop = (step: number) => {
  const s = STEPS[step];
  return s && s.universe === 'skills' ? Number(s.beat.replace('group-', '')) : -1;
};

interface RockProps { id: string; name: string; group: SkillGroup; angle: number; seed: number; light: Vec3; interactive: boolean; here: boolean }

const SkillRock: React.FC<RockProps> = ({ id, name, group, angle, seed, light, interactive, here }) => {
  const color = SKILL_COLORS[group];
  const holder = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const picked = useJourney((s) => s.picked === id);
  useEffect(() => {
    if (!interactive) setHovered(false);
  }, [interactive]);
  useFrame((state) => {
    const a = angle + state.clock.elapsedTime * ORBIT_SPEED;
    holder.current.position.set(Math.cos(a) * ORBIT, Math.sin(a) * ORBIT, 0);
  });
  const lit = hovered || picked;
  return (
    <group ref={holder}>
      <Asteroid
        seed={seed}
        radius={0.36 + (seed % 3) * 0.05}
        color={color}
        lightPos={light}
        position={[0, 0, 0]}
        hovered={lit || here}
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      />
      <GlowSprite color={color} scale={lit ? 2.6 : 1.5} opacity={lit ? 0.75 : 0.3} />
      <HitArea radius={1.1} onClick={onTap(interactive, () => useJourney.getState().pick(id))} />
      {interactive && lit && (
        <InfoCard position={[0, 1.3, 0]}>
          <strong style={{ color }}>{name}</strong>
          <small>{group}</small>
        </InfoCard>
      )}
      {interactive && here && !lit && (
        <Html center position={[0, 0.9, 0]} className="mv-label mv-label--skill" pointerEvents="none">
          <span style={{ color }}>{name}</span>
        </Html>
      )}
    </group>
  );
};

const SkillStop: React.FC<{ index: number; group: SkillGroup; interactive: boolean; here: boolean; visible: boolean }> = ({ index, group, interactive, here, visible }) => {
  const color = SKILL_COLORS[group];
  const body = BODIES[group];
  const stop = SKILL_STOPS[index];
  const light = lightFor(stop);
  const members = useMemo(() => skills.filter((s) => s.group === group), [group]);
  // Tapping a planet further along the path travels to it.
  const travel = onTap(interactive && !here, () => useJourney.getState().jump(firstStepOf('skills') + index));
  const shared = { radius: PLANET_RADIUS, lightPos: light, fallback: paletteOf(color), onClick: travel };
  return (
    <group position={stop} visible={visible}>
      {body.map === 'earth' ? (
        <RealEarth {...shared} />
      ) : (
        <RealPlanet {...shared} map={body.map} ring={body.ring} atmos={color} atmosStrength={body.atmos} tilt={body.ring ? 0.47 : 0.15} spin={0.1} />
      )}
      {group === 'AI Tools' && <GlowSprite color={color} scale={9} opacity={0.35} />}
      <group rotation-x={0.25}>
        <mesh>
          <ringGeometry args={[ORBIT - 0.02, ORBIT + 0.02, 128]} />
          <meshBasicMaterial color={color} transparent opacity={here ? 0.3 : 0.12} side={THREE.DoubleSide} />
        </mesh>
        {members.map((s, k) => {
          const n = skills.indexOf(s);
          return (
            <SkillRock
              key={s.name}
              id={`skill-${n}`}
              name={s.name}
              group={group}
              angle={(k / members.length) * Math.PI * 2 + Math.PI / 2}
              seed={n * 7 + 3}
              light={light}
              interactive={interactive}
              here={here}
            />
          );
        })}
      </group>
      {here && (
        <Html center position={[0, ORBIT + 2.6, 0]} className="mv-label" pointerEvents="none">
          <span style={{ color }}>{group}</span>
          <small>{members.length} {members.length === 1 ? 'skill' : 'skills'}</small>
        </Html>
      )}
    </group>
  );
};

export const SkillsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const interactive = active && !preview;
  const stop = useJourney((s) => currentStop(s.step));
  const moving = useJourney((s) => s.moving);
  // Only the current planet is drawn, so each stop is clean. While gliding, the planet being left stays
  // until arrival, so the move still reads as travel. Outside Skills (portal preview, warping in) it's the first.
  const settled = useRef(0);
  if (!moving && stop >= 0) settled.current = stop;
  const target = stop >= 0 ? stop : 0;
  return (
    <>
      {SKILL_GROUPS.map((g, i) => (
        <SkillStop
          key={g}
          index={i}
          group={g}
          interactive={interactive && i === target}
          here={interactive && stop === i}
          visible={i === target || (moving && i === settled.current)}
        />
      ))}
    </>
  );
};
