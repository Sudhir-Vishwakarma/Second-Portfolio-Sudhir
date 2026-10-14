import React, { useEffect, useRef } from 'react';
import { WarpState, lerpColor, warpFrame } from './universePager';

const STAR_COUNT = 250;

interface Star { x: number; y: number; z: number; tw: number }

const respawnNearCentre = (s: Star) => {
  const a = Math.random() * Math.PI * 2;
  const r = 0.02 + Math.random() * 0.12;
  s.x = 0.5 + Math.cos(a) * r;
  s.y = 0.5 + Math.sin(a) * r;
};

/**
 * Fixed 2D space: drifting, twinkling stars. While warpRef.t0 is set, the warp timeline accelerates them
 * outward into accent-tinted streaks with a flash at the swap. Pauses when hidden; static with reduced motion.
 */
export const SpaceCanvas: React.FC<{ reducedMotion: boolean; warpRef: React.MutableRefObject<WarpState> }> = ({ reducedMotion, warpRef }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({ x: Math.random(), y: Math.random(), z: Math.random(), tw: Math.random() * Math.PI * 2 }));

    const drawStars = (t: number) => {
      for (const s of stars) {
        const size = 0.4 + s.z * 1.4;
        const alpha = 0.35 + s.z * 0.5 + (reducedMotion ? 0 : Math.sin(t / 900 + s.tw) * 0.15);
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = s.z > 0.92 ? '#ffd6a8' : '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw = (t: number) => {
      const warp = warpRef.current;
      const f = warp.t0 === null ? null : warpFrame(t - warp.t0);
      const active = !!f && !f.done && f.phase !== 'idle';
      const shake = active ? f!.speed * 2.5 : 0;
      ctx.setTransform(dpr, 0, 0, dpr, (Math.random() - 0.5) * shake * dpr, (Math.random() - 0.5) * shake * dpr);
      ctx.clearRect(-10, -10, w + 20, h + 20);
      if (!active || f!.streak <= 0.02) {
        drawStars(t);
      } else {
        const colour = lerpColor(warp.from, warp.to, f!.mix);
        ctx.lineCap = 'round';
        for (const s of stars) {
          const dx = s.x - 0.5;
          const dy = s.y - 0.5;
          const d = Math.hypot(dx, dy) || 0.001;
          const len = f!.streak * (0.04 + d * 0.35);
          ctx.globalAlpha = 0.45 + s.z * 0.55;
          ctx.strokeStyle = s.z > 0.6 ? '#ffffff' : colour;
          ctx.lineWidth = 0.6 + s.z * 1.6;
          ctx.beginPath();
          ctx.moveTo(s.x * w, s.y * h);
          ctx.lineTo((s.x - (dx / d) * len) * w, (s.y - (dy / d) * len) * h);
          ctx.stroke();
        }
      }
      if (active && f!.flash > 0) {
        ctx.globalAlpha = f!.flash * 0.85;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, -10, w + 20, h + 20);
      }
      ctx.globalAlpha = 1;
      return active ? f!.speed : 0;
    };

    const resize = () => {
      // Size from the element's own box (CSS fills the viewport); skip iOS toolbar height jitter under 120 px.
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (cw === w && Math.abs(ch - h) < 120) return;
      w = cw;
      h = ch;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (reducedMotion) draw(0);
    };

    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const speed = draw(t);
      for (const s of stars) {
        if (speed > 0) {
          // Hyperspeed: rush outward from the centre, respawning near it once off-screen.
          const dx = s.x - 0.5;
          const dy = s.y - 0.5;
          const d = Math.hypot(dx, dy) || 0.001;
          const v = dt * (0.25 + d) * 3.2 * speed;
          s.x += (dx / d) * v;
          s.y += (dy / d) * v;
          if (s.x < -0.05 || s.x > 1.05 || s.y < -0.05 || s.y > 1.05) respawnNearCentre(s);
        } else {
          s.y -= dt * (0.004 + s.z * 0.012);
          if (s.y < 0) {
            s.y += 1;
            s.x = Math.random();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (w === 0) resize();
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());

    // First sizing waits for the first frame (reading clientWidth during React's commit forces a full layout).
    raf = requestAnimationFrame(() => {
      resize();
      if (!reducedMotion) start();
    });
    window.addEventListener('resize', resize);
    if (!reducedMotion) document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion, warpRef]);

  return <canvas ref={ref} className="mb-stars" aria-hidden="true" />;
};
