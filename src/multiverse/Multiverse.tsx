import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { CameraRig } from './camera/CameraRig';
import { Starfield } from './fx/Starfield';
import { Hyperspace } from './fx/Hyperspace';
import { PostFX } from './fx/PostFX';
import { World } from './world/World';
import { useJourney } from './store';
import { stepForHash } from './journey';
import { useJourneyInput } from './input';
import './multiverse.css';

interface MultiverseProps { onFail: () => void }

const Multiverse: React.FC<MultiverseProps> = ({ onFail }) => {
  // Start at the universe named in the URL (before the first frame renders).
  useState(() => {
    useJourney.getState().reset(stepForHash(window.location.hash) ?? 0);
    return true;
  });
  useJourneyInput();

  return (
    <div className="mv">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 55, near: 0.1, far: 1200 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.domElement.addEventListener('webglcontextlost', onFail)}
      >
        <color attach="background" args={['#000004']} />
        <CameraRig />
        <Starfield />
        <Hyperspace />
        <World />
        <PostFX bloom />
        <Preload all />
      </Canvas>
    </div>
  );
};

export default Multiverse;
