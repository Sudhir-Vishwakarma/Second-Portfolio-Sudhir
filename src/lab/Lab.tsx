import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { Preload } from '@react-three/drei';
import { SolarSystem, Starfield, Hyperspace, Portal, Universe, CameraRig, Stage, rig, PORTAL_POS } from './Scene';
import { SECTIONS } from './sections';
import './Lab.css';

const STAGES: Stage[] = ['system', 'portal', 'inside'];

// Chromatic aberration grows with warp speed
const WarpFX: React.FC = () => {
  const ca = useRef<any>(null);
  const offset = useMemo(() => new THREE.Vector2(0, 0), []);
  useFrame(() => {
    const w = rig.warp * rig.warp;
    offset.set(0.0035 * w, 0.0035 * w);
    if (ca.current) ca.current.offset = offset;
  });
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.85} luminanceSmoothing={0.2} radius={0.75} />
      <ChromaticAberration ref={ca} offset={offset} radialModulation={false} modulationOffset={0} />
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
    </EffectComposer>
  );
};

const Lab: React.FC = () => {
  const [stage, setStage] = useState<Stage>('system');
  const [sectionIndex, setSectionIndex] = useState(2); // Projects
  const [inside, setInside] = useState(false);
  const [ready, setReady] = useState(false);
  const lock = useRef(0);
  const section = SECTIONS[sectionIndex];

  const go = useCallback((dir: 1 | -1) => {
    const now = performance.now();
    if (now - lock.current < 1100) return;
    lock.current = now;
    setStage((s) => STAGES[Math.min(STAGES.length - 1, Math.max(0, STAGES.indexOf(s) + dir))]);
  }, []);

  const visitPlanet = useCallback((i: number) => {
    lock.current = performance.now();
    setSectionIndex(i);
    setStage('portal');
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 20) go(e.deltaY > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) go(1);
      if (['ArrowUp', 'PageUp'].includes(e.key)) go(-1);
      if (e.key === 'Escape') setStage('system');
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) go(dy > 0 ? 1 : -1);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    const t = setTimeout(() => setReady(true), 400);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      clearTimeout(t);
    };
  }, [go]);

  const hint =
    stage === 'system' ? 'Scroll to engage hyperspeed · or click a planet' :
    stage === 'portal' ? `Scroll to enter the ${section.label} universe` :
    'Scroll up to return · Esc for the solar system';

  return (
    <div className={`lab ${ready ? 'is-ready' : ''}`}>
      <Canvas dpr={[1, 2]} camera={{ fov: 55, position: [0, 6.5, 25], near: 0.1, far: 1000 }} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#000004']} />
        {/* first, so the camera moves before anything that follows it */}
        <CameraRig stage={stage} onCrossing={setInside} />
        <Starfield />
        <Hyperspace />
        <SolarSystem visible={!inside} showLabels={stage === 'system'} onSelect={visitPlanet} />
        <Portal section={section} visible={!inside} />
        {inside && (
          <group position={PORTAL_POS}>
            <Universe section={section} interactive />
          </group>
        )}
        <WarpFX />
        {/* compile every shader during the intro so the warp never stutters */}
        <Preload all />
      </Canvas>

      <div className="lab-overlay">
        <header className={`lab-brand ${stage === 'system' ? '' : 'is-dim'}`}>
          <span className="lab-kicker">Portfolio · Multiverse</span>
          <h1>Sudhir<br />Vishwakarma</h1>
          <p>Full-stack developer · React · Next.js · Salesforce</p>
        </header>

        <div className="lab-stage">
          {inside ? `Universe / ${section.label}` : stage === 'portal' ? `Portal / ${section.label}` : 'Solar system'}
        </div>

        <nav className="lab-dots" aria-label="Journey">
          {STAGES.map((s) => (
            <button key={s} className={s === stage ? 'is-active' : ''} onClick={() => setStage(s)} aria-label={s} />
          ))}
        </nav>

        <div className="lab-hint">
          <span className="lab-mouse" />
          {hint}
        </div>

        <a className="lab-exit" href="#home">← Classic site</a>
      </div>
      <div className="lab-intro" />
    </div>
  );
};

export default Lab;
