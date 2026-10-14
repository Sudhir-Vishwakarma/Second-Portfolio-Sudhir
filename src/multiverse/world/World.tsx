import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { UNIVERSES, UniverseId, WARMUP_MS, universeAtZ, universeOrigin } from '../journey';
import { useJourney } from '../store';
import { UNIVERSE_COMPONENTS } from '../universes';
import { Portal } from '../fx/Portal';

interface SlotProps { id: UniverseId; index: number; active: boolean; warm: boolean }

const UniverseSlot: React.FC<SlotProps> = ({ id, index, active, warm }) => {
  const content = useRef<THREE.Group>(null!);
  const Universe = UNIVERSE_COMPONENTS[id];
  useFrame(({ camera }) => {
    content.current.visible = warm || universeAtZ(camera.position.z) === index;
  });
  return (
    <group position={universeOrigin(id)}>
      <group ref={content}>
        <Universe active={active} />
      </group>
      {index > 0 && (
        <Portal universe={id} warm={warm}>
          <Universe active={false} preview />
        </Portal>
      )}
    </group>
  );
};

export const World: React.FC = () => {
  const cameraU = useJourney((s) => s.cameraUniverse);
  const [warm, setWarm] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setWarm(false), WARMUP_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* every slot stays mounted so travelling never compiles new GPU programs; visibility is per frame */}
      {UNIVERSES.map((id, n) => (
        <UniverseSlot key={id} id={id} index={n} active={!warm && n === cameraU} warm={warm} />
      ))}
    </>
  );
};
