import React from 'react';
import { Html, Line } from '@react-three/drei';
import { Nebula } from '../fx/Nebula';
import { Planet } from '../fx/Planet';
import { GlowSprite } from '../fx/GlowSprite';
import { Palette, PALETTES } from '../fx/palettes';
import { WORK_STOPS, universeOrigin, Vec3 } from '../journey';
import { experience } from '../../data/portfolio';
import { UniverseProps } from './index';

const JOB_PALETTES: Palette[] = [
  PALETTES.work,
  { a: '#312e81', b: '#f472b6', atmos: '#f9a8d4' },
  { a: '#134e4a', b: '#facc15', atmos: '#fde68a' },
];
const origin = universeOrigin('work');
const lightFor = (p: Vec3): Vec3 => [origin[0] + p[0] + 18, origin[1] + p[1] + 12, origin[2] + p[2] + 22];

export const WorkUniverse: React.FC<UniverseProps> = ({ active, preview }) => (
  <>
    <Nebula palette={PALETTES.work} radius={110} center={[0, 0, -70]} />
    <Line points={WORK_STOPS} color={PALETTES.work.atmos} lineWidth={1} transparent opacity={0.35} />
    {WORK_STOPS.map((p, i) => (
      <group key={experience[i].company} position={p}>
        <Planet radius={3.2} palette={JOB_PALETTES[i]} bands={8 + i * 3} lightPos={lightFor(p)} />
        <GlowSprite color={JOB_PALETTES[i].b} scale={16} opacity={0.25} />
        {active && !preview && (
          <Html center position={[0, 4.6, 0]} className="mv-label">
            {experience[i].company}
            <small>{experience[i].start} – {experience[i].end}</small>
          </Html>
        )}
      </group>
    ))}
  </>
);
