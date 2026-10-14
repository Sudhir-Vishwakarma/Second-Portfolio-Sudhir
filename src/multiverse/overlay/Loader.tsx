// overlay/Loader.tsx — black curtain with progress; lifts once assets load and shaders are warm
import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { useJourney } from '../store';
import { WARMUP_MS } from '../journey';

const TIMEOUT_MS = 10000;

export const Loader: React.FC = () => {
  const { active, progress, total } = useProgress();
  const setBooted = useJourney((s) => s.setBooted);
  const [elapsed, setElapsed] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (gone) return;
    const start = performance.now();
    const id = setInterval(() => {
      const e = performance.now() - start;
      setElapsed(e);
      if (e >= TIMEOUT_MS) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, [gone]);

  const assetsDone = !active && (total === 0 || progress >= 100);
  const ready = (assetsDone && elapsed >= WARMUP_MS) || elapsed >= TIMEOUT_MS;
  const pct = ready ? 100 : Math.min(99, Math.round(assetsDone ? (elapsed / WARMUP_MS) * 100 : progress));

  useEffect(() => {
    if (!ready) return;
    setBooted();
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [ready, setBooted]);

  if (gone) return null;
  return (
    <div className={`mv-loader${ready ? ' is-done' : ''}`} role="status" aria-live="polite">
      <span className="mv-loader__text">Igniting the sun… {pct}%</span>
      <div className="mv-loader__bar"><span style={{ transform: `scaleX(${pct / 100})` }} /></div>
    </div>
  );
};
