import React from 'react';
import { Html, Line } from '@react-three/drei';
import { RealPlanet } from '../fx/RealPlanet';
import { Palette, PALETTES } from '../fx/palettes';
import { TextureKey } from '../fx/textures';
import { WORK_STOPS, firstStepOf, universeOrigin, Vec3 } from '../journey';
import { useJourney } from '../store';
import { experience } from '../../data/portfolio';
import { UniverseProps } from './index';
import { onTap } from './Tappable';

const JOB_PALETTES: Palette[] = [
  PALETTES.work,
  { a: '#312e81', b: '#f472b6', atmos: '#f9a8d4' },
  { a: '#134e4a', b: '#facc15', atmos: '#fde68a' },
];
// experience is newest first: Realatte (newest) → Saturn, then Jupiter, then Mars (oldest).
const BODIES: { map: TextureKey; radius: number; ring?: boolean; atmos: [string, number] }[] = [
  { map: 'saturn', radius: 3.0, ring: true, atmos: ['#f0e0b8', 0.2] },
  { map: 'jupiter', radius: 3.4, atmos: ['#f0dcb4', 0.25] },
  { map: 'mars', radius: 2.4, atmos: ['#e8a07a', 0.35] },
];
const origin = universeOrigin('work');
const lightFor = (p: Vec3): Vec3 => [origin[0] + p[0] + 18, origin[1] + p[1] + 12, origin[2] + p[2] + 22];

export const WorkUniverse: React.FC<UniverseProps> = ({ active, preview }) => (
  <>
    <Line points={WORK_STOPS} color="#cbd5e1" lineWidth={1} transparent opacity={0.18} />
    {WORK_STOPS.map((p, i) => {
      const body = BODIES[i % BODIES.length];
      return (
        <group key={experience[i].company} position={p}>
          <RealPlanet
            radius={body.radius}
            map={body.map}
            ring={body.ring}
            atmos={body.atmos[0]}
            atmosStrength={body.atmos[1]}
            tilt={body.ring ? 0.47 : 0.1}
            spin={0.1}
            lightPos={lightFor(p)}
            fallback={JOB_PALETTES[i]}
            onClick={onTap(active && !preview, () => useJourney.getState().openModal({ kind: 'details', step: firstStepOf('work') + i }))}
          />
          {active && !preview && (
            <Html center position={[0, 4.6, 0]} className="mv-label" pointerEvents="none">
              {experience[i].company}
              <small>{experience[i].start} – {experience[i].end}</small>
            </Html>
          )}
        </group>
      );
    })}
  </>
);
