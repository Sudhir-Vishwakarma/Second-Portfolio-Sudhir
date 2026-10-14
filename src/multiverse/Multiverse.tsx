import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor, Preload } from '@react-three/drei';
import { CameraRig } from './camera/CameraRig';
import { Starfield } from './fx/Starfield';
import { Hyperspace } from './fx/Hyperspace';
import { PostFX } from './fx/PostFX';
import { World } from './world/World';
import { SceneLights } from './fx/SceneLights';
import { useJourney } from './store';
import { stepForHash } from './journey';
import { useJourneyInput } from './input';
import { TopBar } from './overlay/TopBar';
import { Progress } from './overlay/Progress';
import { ScrollHint } from './overlay/ScrollHint';
import { Loader } from './overlay/Loader';
import { Panels } from './overlay/Panels';
import { ModalHost } from './overlay/ModalHost';
import { useHashSync } from './useHashSync';
import './multiverse.css';

const UiLayer: React.FC = () => {
  const booted = useJourney((s) => s.booted);
  return (
    <div className={`mv-ui${booted ? ' is-booted' : ''}`}>
      <TopBar />
      <Panels />
      <Progress />
      <ScrollHint />
      <ModalHost />
    </div>
  );
};

interface MultiverseProps { onFail: () => void }

// Start at the device ratio clamped to [1, 1.75], as the old dpr={[1, 1.75]} range did.
const initialDpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.75);

const Multiverse: React.FC<MultiverseProps> = ({ onFail }) => {
  // Start at the universe named in the URL (before the first frame renders).
  useState(() => {
    useJourney.getState().reset(stepForHash(window.location.hash) ?? 0);
    return true;
  });
  // Unmounting the Canvas (e.g. switching to the classic view) loses the GL context on purpose;
  // only a context loss while mounted counts as a failure.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  useJourneyInput();
  useHashSync();
  const booted = useJourney((s) => s.booted);

  const [dpr, setDpr] = useState(initialDpr);
  const [bloom, setBloom] = useState(true);
  const dprRef = useRef(initialDpr);
  const decline = useCallback(() => {
    if (dprRef.current > 1) {
      dprRef.current = 1;
      setDpr(1);
    } else {
      setBloom(false);
    }
  }, []);
  const fallback = useCallback(() => {
    dprRef.current = 1;
    setDpr(1);
    setBloom(false);
  }, []);

  return (
    <div className="mv">
      <Canvas
        dpr={dpr}
        camera={{ fov: 55, near: 0.1, far: 1200 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.domElement.addEventListener('webglcontextlost', () => { if (alive.current) onFail(); })}
      >
        <color attach="background" args={['#000004']} />
        <SceneLights />
        <CameraRig />
        <Starfield />
        <Hyperspace />
        <World />
        <PostFX bloom={bloom} />
        {booted && <PerformanceMonitor onDecline={decline} onFallback={fallback} flipflops={3} />}
        <Preload all />
      </Canvas>
      <UiLayer />
      <Loader />
    </div>
  );
};

export default Multiverse;
