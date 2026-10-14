import React, { useEffect, useRef } from 'react';
import { BlackHoleFrame, blackHoleFrame } from './blackHole';
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
 * Fixed 2D space: drifting, twinkling stars. While warpRef.t0 is set, the jump timeline for warpRef.kind
 * either accelerates them into accent-tinted hyperspeed streaks with a flash, or pulls them into a black hole
 * that flares and bursts out. Pauses when hidden; static with reduced motion.
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

    const drawStreaks = (streak: number, colour: string) => {
      ctx.lineCap = 'round';
      for (const s of stars) {
        const dx = s.x - 0.5;
        const dy = s.y - 0.5;
        const d = Math.hypot(dx, dy) || 0.001;
        const len = streak * (0.04 + d * 0.35);
        ctx.globalAlpha = 0.45 + s.z * 0.55;
        ctx.strokeStyle = s.z > 0.6 ? '#ffffff' : colour;
        ctx.lineWidth = 0.6 + s.z * 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x * w, s.y * h);
        ctx.lineTo((s.x - (dx / d) * len) * w, (s.y - (dy / d) * len) * h);
        ctx.stroke();
      }
    };

    const drawBlackHole = (b: BlackHoleFrame, colour: string) => {
      const cx = w / 2;
      const cy = h / 2;
      const diag = Math.hypot(w, h) / 2 || 1;
      const R = b.horizon * 0.16 * Math.min(w, h);
      // Space darkens as the pull grows.
      ctx.globalAlpha = Math.min(0.85, b.pull * 0.85);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-10, -10, w + 20, h + 20);
      if (b.burst > 0.02) {
        drawStreaks(b.burst, colour);
      } else {
        // Stars spiral inward: inner stars twist further, each drawn as a short trailing arc.
        ctx.lineCap = 'round';
        for (const s of stars) {
          const dx = (s.x - 0.5) * w;
          const dy = (s.y - 0.5) * h;
          const r0 = Math.hypot(dx, dy);
          const k = 1 - Math.min(1, r0 / diag);
          const a = Math.atan2(dy, dx) + b.pull * (0.6 + 2.4 * k) + b.spin * 0.1 * b.pull;
          const r = R + r0 * (1 - 0.85 * b.pull);
          const tail = a - 0.25 * b.pull * (0.3 + k);
          ctx.globalAlpha = 0.35 + s.z * 0.6;
          ctx.strokeStyle = s.z > 0.6 ? '#ffffff' : colour;
          ctx.lineWidth = 0.6 + s.z * 1.4;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(tail) * r, cy + Math.sin(tail) * r);
          ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          ctx.stroke();
        }
      }
      if (R > 0.5) {
        const glow = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 2.6);
        glow.addColorStop(0, colour);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 0.55 + 0.45 * b.flare;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.7 + 0.3 * b.flare;
        ctx.strokeStyle = '#ffd6a8';
        ctx.lineWidth = Math.max(1, R * 0.12);
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * 1.7, R * 0.55, b.spin * 0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();
      }
      if (b.flare > 0) {
        ctx.globalAlpha = b.flare * 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, -10, w + 20, h + 20);
      }
    };

    /** Draws one frame; returns the outward star speed for the motion step (0 = normal drift). */
    const draw = (t: number) => {
      const warp = warpRef.current;
      if (warp.kind === 'blackhole') {
        const b = blackHoleFrame(warp.t0 === null ? -1 : t - warp.t0);
        const active = warp.t0 !== null && !b.done && b.phase !== 'idle';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(-10, -10, w + 20, h + 20);
        if (active) drawBlackHole(b, lerpColor(warp.from, warp.to, b.mix));
        else drawStars(t);
        ctx.globalAlpha = 1;
        return active && b.phase === 'emerge' ? b.burst : 0;
      }
      const f = warp.t0 === null ? null : warpFrame(t - warp.t0);
      const active = !!f && !f.done && f.phase !== 'idle';
      const shake = active ? f!.speed * 2.5 : 0;
      ctx.setTransform(dpr, 0, 0, dpr, (Math.random() - 0.5) * shake * dpr, (Math.random() - 0.5) * shake * dpr);
      ctx.clearRect(-10, -10, w + 20, h + 20);
      if (!active || f!.streak <= 0.02) drawStars(t);
      else drawStreaks(f!.streak, lerpColor(warp.from, warp.to, f!.mix));
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
          // Rush outward from the centre, respawning near it once off-screen.
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
