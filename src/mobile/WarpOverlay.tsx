import React, { useEffect, useRef } from 'react';

const DURATION = 600;
const STREAKS = 140;

interface WarpOverlayProps { accent: string; onMidpoint: () => void; onDone: () => void }

/** A 0.6 s hyperspeed flash: streaks radiate from the centre while the screen dips to black at the midpoint. */
export const WarpOverlay: React.FC<WarpOverlayProps> = ({ accent, onMidpoint, onDone }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const mid = useRef(onMidpoint);
  const done = useRef(onDone);
  mid.current = onMidpoint;
  done.current = onDone;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      mid.current();
      done.current();
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.hypot(cx, cy);
    const streaks = Array.from({ length: STREAKS }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random() * 0.3, len: 0.15 + Math.random() * 0.35 }));
    let firedMid = false;
    let raf = 0;
    const t0 = performance.now();

    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION);
      const dip = Math.sin(p * Math.PI); // 0 → 1 → 0
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgba(0,0,4,${0.85 * dip})`;
      ctx.fillRect(0, 0, w, h);
      ctx.lineCap = 'round';
      for (const s of streaks) {
        const r0 = (s.r + p * 1.4) * maxR;
        const r1 = r0 + s.len * maxR * dip;
        ctx.strokeStyle = Math.random() > 0.5 ? accent : '#ffffff';
        ctx.globalAlpha = 0.9 * dip;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(s.a) * r0, cy + Math.sin(s.a) * r0);
        ctx.lineTo(cx + Math.cos(s.a) * r1, cy + Math.sin(s.a) * r1);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (!firedMid && p >= 0.5) {
        firedMid = true;
        mid.current();
      }
      if (p < 1) raf = requestAnimationFrame(frame);
      else done.current();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [accent]);

  return <canvas ref={ref} className="mb-warp" aria-hidden="true" />;
};
