import React, { useEffect, useRef } from 'react';

const STAR_COUNT = 250;

interface Star { x: number; y: number; z: number; tw: number }

/** Fixed 2D starfield: slow upward drift plus twinkle. Pauses when the tab is hidden; static when motion is reduced. */
export const StarfieldCanvas: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({ x: Math.random(), y: Math.random(), z: Math.random(), tw: Math.random() * Math.PI * 2 }));

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const size = 0.4 + s.z * 1.4;
        const alpha = 0.35 + s.z * 0.5 + (reducedMotion ? 0 : Math.sin(t / 900 + s.tw) * 0.15);
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = s.z > 0.92 ? '#ffd6a8' : '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      // Size from the element's own box (CSS fills the viewport). iOS fires resize as the toolbar shows/hides,
      // changing only the height by well under 120 px; skip those so the stars don't reallocate and jump.
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (cw === w && Math.abs(ch - h) < 120) return;
      w = cw;
      h = ch;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reducedMotion) draw(0); // resizing clears the canvas; the animated branch redraws next frame
    };

    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      for (const s of stars) {
        s.y -= dt * (0.004 + s.z * 0.012);
        if (s.y < 0) {
          s.y += 1;
          s.x = Math.random();
        }
      }
      draw(t);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());

    resize();
    window.addEventListener('resize', resize);
    if (reducedMotion) {
      draw(0);
    } else {
      start();
      document.addEventListener('visibilitychange', onVisibility);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={ref} className="mb-stars" aria-hidden="true" />;
};
