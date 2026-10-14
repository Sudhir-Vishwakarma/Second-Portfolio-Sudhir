# Mobile Hyperspeed Universes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the mobile site from one scrolling page into six full-screen universes, with desktop-style ~1.2 s hyperspeed jumps between them. Jumps are triggered by Next buttons, edge swipes, the bottom nav, and the phone's Back button.

**Architecture:**
- **Pure logic:** `src/mobile/universePager.ts` holds all the testable logic: order, swipe and wheel decisions, the warp timeline and colour blending.
- **Pager hook:** `useUniversePager` runs one jump at a time, with history entries.
- **Canvas:** `SpaceCanvas` (which replaces `StarfieldCanvas`) reads a shared `warpRef` every frame to turn drifting stars into accent-tinted streaks with a flash.
- **One universe at a time:** `UniverseView` renders the current universe in its own scroll container, with `useEdgePull` gestures, a Next button and a `UniverseBackdrop`.
- **Unchanged:** section components, Sheet, content and routing.

**Tech Stack:** CRA 5 (react-scripts 5.0.1), React 18.3, TypeScript 4.9, Jest 27. Canvas 2D, CSS/SVG. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-15-mobile-hyperspeed-design.md`

## Global Constraints

- **Git:** work only on branch `worktree-multiverse` in `/home/sudhirvishwakarma/Documents/Landing Pages/Second-Portfolio-Sudhir/.claude/worktrees/multiverse`. Make local commits only, and never `git push` or deploy. Before every commit run `git checkout -- build` then `git clean -fdq build`, and stage files explicitly.
- **Build:** `CI=true npm run build` must end with **"Compiled successfully."** (zero warnings, which includes `react-hooks/exhaustive-deps`).
- **Tests:** run with `CI=true npx react-scripts test --watchAll=false <path>`.
- **Mobile chunk:** nothing under `src/mobile/` may import `three`, `@react-three/*`, `maath`, or any `.tsx` under `src/multiverse/`. `palettes.ts` and `journey.ts` are allowed.
- **Universe order and ids:** `home, about, skills, work, projects, contact`. The hashes `#home` … `#contact` are unchanged. `#certifications` opens `about`, scrolled to the anchor `certifications`.
- **Timings:** launch 0–350 ms, hyperspace 350–750 ms, swap at 750 ms (the flash peak), arrival 750–1200 ms, `WARP_MS = 1200`. With reduced motion: a fade of `FADE_MS = 250`, swapping at 125 ms.
- **Gestures:** a jump needs the scroll area to be **already at its edge** when the touch starts, plus a pull of `PULL_THRESHOLD = 80` px.
  - The wheel arms 300 ms after reaching the edge.
  - Gesture travel is ignored for `SETTLE_MS = 400` after a jump ends.
  - Gestures are ignored when they start in `input, textarea, select, .mb-sheet, .mb-filters`.
- **History:** each jump pushes `{ mbUniverse: id }` with `#id`. Back travels with `push: false`. Sheets (`{ mbSheet: true }`) close first.
- **Accessibility and layout:**
  - Tap targets are at least 44×44 px, and contrast meets WCAG AA.
  - There is no horizontal overflow at 320, 390 and 768 px or at 844×390.
  - After a jump, focus moves to the new universe's heading (`preventScroll`).
- **Content:** strings come only from `src/data/portfolio.ts`.
- **Scripts:** `$SCRATCH` = `/tmp/claude-1002/-home-sudhirvishwakarma-Documents-Landing-Pages-Second-Portfolio-Sudhir/01c9bdce-01ed-4d1b-ae64-6685ae80a718/scratchpad`. `puppeteer-core` is in `$SCRATCH/shots`.
  - Serve with `npx -y serve@14.2.4 -s build -l 3005` (in the background) and stop the server afterwards. Port 3000 is the owner's dev server; don't touch it.
  - Never send real email.
  - The old `mobile-check.js` and `mb-scenarios.js` assume a single scrolling page and are **replaced** by `mh-check.js` (Task 3).

## Review Focus

1. **Trackpad and wheel inertia on a narrow desktop window** (which gets the mobile site) must not chain several jumps. Pinned by the `wheelStep` arming and idle tests in Task 1 and `SETTLE_MS` in Task 3.
2. **Ordinary reading swipes** that don't start at an edge must never jump. Pinned by the `travelDirection` tests in Task 1 and the `swipe` scenario's mid-page case in Task 4.
3. **Pressing Back several times quickly** while a warp is running must end on the right universe. Pinned by the `nav-back` scenario's double-Back case in Task 3 (the pending-target replay).
4. **Swipes or scrolls inside the contact textarea, the project filter row, or an open sheet** must never trigger a jump. Pinned by the `isGestureExempt` jsdom test in Task 4.
5. **Deep links** (`#certifications`, unknown `#foo`, an empty hash) must open the right universe, or Home. Pinned by the `universeForHash` tests in Task 1.

---

## File Structure

```
src/mobile/
  universePager.ts (+ .test.ts)   NEW pure logic: order, clamp, edges, pull and wheel decisions, warp timeline, colour lerp, hash→universe
  useUniversePager.ts             NEW hook: current index, view state, one jump at a time, history, pending Back replay
  useEdgePull.ts (+ .test.ts)     NEW touch/wheel edge-pull gestures + isGestureExempt
  SpaceCanvas.tsx                 NEW (replaces StarfieldCanvas.tsx): stars + warp streaks + flash, driven by warpRef
  UniverseView.tsx                NEW: one full-screen universe (scroll area, Next button / Footer, pull indicator, backdrop)
  UniverseBackdrop.tsx            NEW: per-universe nebula + signature object (CSS/SVG)
  MobileApp.tsx                   REWRITTEN to use the pager
  mobile.css                      universe layout, transitions, pull indicator, Next button, backdrops
  DELETED: StarfieldCanvas.tsx, WarpOverlay.tsx, useActiveSection.ts
```

---

### Task 1: Pure pager logic

**Files:**
- Create: `src/mobile/universePager.ts`
- Test: `src/mobile/universePager.test.ts`

**Interfaces:**
- Consumes: `MOBILE_SECTIONS`, `MobileSectionId`, `sectionForHash` from `src/mobile/sections.ts`.
- Produces:
  - Constants: `UNIVERSE_ORDER: MobileSectionId[]`, `LAST_INDEX`, `PULL_THRESHOLD = 80`, `LAUNCH_MS = 350`, `SWAP_MS = 750`, `WARP_MS = 1200`, `FADE_MS = 250`, `SETTLE_MS = 400`, `WHEEL_ARM_MS = 300`, `WHEEL_IDLE_MS = 250`
  - Index helpers: `clampIndex(i)`, `nextIndex(i)`, `prevIndex(i)`, `accentOf(i)`
  - Edge and gesture decisions:
    - `edgeState(scrollTop, clientHeight, scrollHeight): { atTop; atBottom }`
    - `travelDirection({ atTop, atBottom, pull, threshold? }): 'next' | 'prev' | null`
    - `WheelState`, `INITIAL_WHEEL`, `wheelStep(state, { deltaY, atTop, atBottom, now }): { state; travel }`
  - Warp timeline: `WarpPhase`, `WarpFrame`, `warpFrame(t)`
  - `WarpState { t0: number | null; from: string; to: string }`
  - `lerpColor(a, b, t): string`
  - `universeForHash(hash): { index; anchor } | null`

- [ ] **Step 1: Write the failing test** `src/mobile/universePager.test.ts`:

```ts
import {
  UNIVERSE_ORDER, LAST_INDEX, clampIndex, nextIndex, prevIndex, accentOf, edgeState, travelDirection,
  INITIAL_WHEEL, wheelStep, WARP_MS, SWAP_MS, warpFrame, lerpColor, universeForHash,
} from './universePager';
import { PALETTES } from '../multiverse/fx/palettes';

test('order and index helpers', () => {
  expect(UNIVERSE_ORDER).toEqual(['home', 'about', 'skills', 'work', 'projects', 'contact']);
  expect(LAST_INDEX).toBe(5);
  expect([clampIndex(-3), clampIndex(2), clampIndex(9)]).toEqual([0, 2, 5]);
  expect([nextIndex(0), nextIndex(5), prevIndex(0), prevIndex(3)]).toEqual([1, 5, 0, 2]);
  expect(accentOf(4)).toBe(PALETTES.projects.atmos);
});

test('edgeState tolerates sub-pixel scroll positions', () => {
  expect(edgeState(0, 600, 2000)).toEqual({ atTop: true, atBottom: false });
  expect(edgeState(1399, 600, 2000)).toEqual({ atTop: false, atBottom: true });
  expect(edgeState(700, 600, 2000)).toEqual({ atTop: false, atBottom: false });
  expect(edgeState(0, 600, 500)).toEqual({ atTop: true, atBottom: true });
});

test('travelDirection needs an edge and a full pull', () => {
  expect(travelDirection({ atTop: false, atBottom: true, pull: 80 })).toBe('next');
  expect(travelDirection({ atTop: false, atBottom: true, pull: 79 })).toBeNull();
  expect(travelDirection({ atTop: true, atBottom: false, pull: -80 })).toBe('prev');
  expect(travelDirection({ atTop: false, atBottom: false, pull: 300 })).toBeNull();
  expect(travelDirection({ atTop: false, atBottom: false, pull: -300 })).toBeNull();
  expect(travelDirection({ atTop: true, atBottom: false, pull: 200 })).toBeNull();
  expect(travelDirection({ atTop: true, atBottom: true, pull: 90 })).toBe('next');
  expect(travelDirection({ atTop: true, atBottom: true, pull: -90 })).toBe('prev');
});

test('wheelStep ignores inertia right after reaching the edge, then needs a full pull', () => {
  const at = { atTop: false, atBottom: true };
  let r = wheelStep(INITIAL_WHEEL, { deltaY: 60, ...at, now: 1000 });
  expect(r.travel).toBeNull(); // arms
  r = wheelStep(r.state, { deltaY: 200, ...at, now: 1100 });
  expect(r.travel).toBeNull(); // still inside the 300 ms arming window: ignored
  r = wheelStep(r.state, { deltaY: 50, ...at, now: 1350 });
  expect(r.travel).toBeNull(); // 50 < 80
  r = wheelStep(r.state, { deltaY: 40, ...at, now: 1400 });
  expect(r.travel).toBe('next'); // 90 >= 80
  expect(r.state).toEqual(INITIAL_WHEEL);
});

test('wheelStep resets when not pushing an edge, and after idle gaps', () => {
  const at = { atTop: false, atBottom: true };
  let r = wheelStep(INITIAL_WHEEL, { deltaY: 60, ...at, now: 0 });
  r = wheelStep(r.state, { deltaY: 70, ...at, now: 400 });
  expect(r.travel).toBeNull();
  r = wheelStep(r.state, { deltaY: 70, ...at, now: 1000 }); // > 250 ms idle: the accumulator restarts at 70
  expect(r.travel).toBeNull();
  expect(wheelStep(r.state, { deltaY: -50, ...at, now: 1050 }).state).toEqual(INITIAL_WHEEL); // scrolling back up
  const top = { atTop: true, atBottom: false };
  let u = wheelStep(INITIAL_WHEEL, { deltaY: -60, ...top, now: 0 });
  u = wheelStep(u.state, { deltaY: -90, ...top, now: 400 });
  expect(u.travel).toBe('prev');
});

test('warpFrame phases and boundaries', () => {
  expect(warpFrame(0)).toMatchObject({ phase: 'launch', speed: 0, flash: 0, mix: 0, done: false });
  expect(warpFrame(349).phase).toBe('launch');
  expect(warpFrame(349).speed).toBeGreaterThan(0.99);
  expect(warpFrame(350)).toMatchObject({ phase: 'hyperspace', speed: 1, mix: 0 });
  expect(warpFrame(749).phase).toBe('hyperspace');
  expect(warpFrame(749).flash).toBeGreaterThan(0.99);
  expect(warpFrame(SWAP_MS)).toMatchObject({ phase: 'arrival', speed: 1, flash: 1, mix: 1 });
  expect(warpFrame(1199).phase).toBe('arrival');
  expect(warpFrame(1199).speed).toBeLessThan(0.01);
  expect(warpFrame(1199).flash).toBe(0);
  expect(warpFrame(WARP_MS)).toMatchObject({ phase: 'idle', speed: 0, streak: 0, flash: 0, done: true });
  expect(warpFrame(-5)).toMatchObject({ phase: 'idle', done: false });
});

test('flash peaks at the swap and the colour mix never goes backwards', () => {
  const peak = warpFrame(SWAP_MS).flash;
  let lastMix = 0;
  for (let t = 0; t <= WARP_MS; t += 10) {
    const f = warpFrame(t);
    expect(f.flash).toBeLessThanOrEqual(peak);
    expect(f.mix).toBeGreaterThanOrEqual(lastMix);
    lastMix = f.mix;
  }
});

test('lerpColor blends hex colours', () => {
  expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('rgb(128,128,128)');
  expect(lerpColor('#ff0000', '#0000ff', 0)).toBe('rgb(255,0,0)');
  expect(lerpColor('#ff0000', '#0000ff', 2)).toBe('rgb(0,0,255)');
});

test('universeForHash maps deep links', () => {
  expect(universeForHash('#work')).toEqual({ index: 3, anchor: 'work' });
  expect(universeForHash('#certifications')).toEqual({ index: 1, anchor: 'certifications' });
  expect(universeForHash('')).toBeNull();
  expect(universeForHash('#foo')).toBeNull();
  expect(universeForHash('#classic')).toBeNull();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/mobile/universePager`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/mobile/universePager.ts`**

```ts
import { MOBILE_SECTIONS, MobileSectionId, sectionForHash } from './sections';

export const UNIVERSE_ORDER: MobileSectionId[] = MOBILE_SECTIONS.map((s) => s.id);
export const LAST_INDEX = UNIVERSE_ORDER.length - 1;
export const PULL_THRESHOLD = 80;
export const LAUNCH_MS = 350;
export const SWAP_MS = 750;
export const WARP_MS = 1200;
export const FADE_MS = 250;
export const SETTLE_MS = 400;
export const WHEEL_ARM_MS = 300;
export const WHEEL_IDLE_MS = 250;

export const clampIndex = (i: number) => Math.max(0, Math.min(LAST_INDEX, Math.round(i)));
export const nextIndex = (i: number) => clampIndex(i + 1);
export const prevIndex = (i: number) => clampIndex(i - 1);
export const accentOf = (i: number) => MOBILE_SECTIONS[clampIndex(i)].accent;

export function edgeState(scrollTop: number, clientHeight: number, scrollHeight: number): { atTop: boolean; atBottom: boolean } {
  return { atTop: scrollTop <= 1, atBottom: scrollTop + clientHeight >= scrollHeight - 2 };
}

export interface PullInput { atTop: boolean; atBottom: boolean; pull: number; threshold?: number }

/** pull > 0: dragging up past the bottom; pull < 0: dragging down past the top. */
export function travelDirection({ atTop, atBottom, pull, threshold = PULL_THRESHOLD }: PullInput): 'next' | 'prev' | null {
  if (atBottom && pull >= threshold) return 'next';
  if (atTop && -pull >= threshold) return 'prev';
  return null;
}

export interface WheelState { armedAt: number | null; acc: number; lastAt: number }
export const INITIAL_WHEEL: WheelState = { armedAt: null, acc: 0, lastAt: -Infinity };

export function wheelStep(
  s: WheelState,
  e: { deltaY: number; atTop: boolean; atBottom: boolean; now: number }
): { state: WheelState; travel: 'next' | 'prev' | null } {
  const pushing = (e.atBottom && e.deltaY > 0) || (e.atTop && e.deltaY < 0);
  if (!pushing) return { state: INITIAL_WHEEL, travel: null };
  if (s.armedAt === null) return { state: { armedAt: e.now, acc: 0, lastAt: e.now }, travel: null };
  if (e.now - s.armedAt < WHEEL_ARM_MS) return { state: { ...s, lastAt: e.now }, travel: null };
  const acc = e.now - s.lastAt > WHEEL_IDLE_MS ? e.deltaY : s.acc + e.deltaY;
  const travel = travelDirection({ atTop: e.atTop, atBottom: e.atBottom, pull: acc });
  return travel ? { state: INITIAL_WHEEL, travel } : { state: { armedAt: s.armedAt, acc, lastAt: e.now }, travel: null };
}

export type WarpPhase = 'idle' | 'launch' | 'hyperspace' | 'arrival';
export interface WarpFrame { phase: WarpPhase; speed: number; streak: number; flash: number; mix: number; done: boolean }
export interface WarpState { t0: number | null; from: string; to: string }

/** Hyperspeed timeline for elapsed ms since the jump started. */
export function warpFrame(t: number): WarpFrame {
  if (t < 0) return { phase: 'idle', speed: 0, streak: 0, flash: 0, mix: 0, done: false };
  if (t >= WARP_MS) return { phase: 'idle', speed: 0, streak: 0, flash: 0, mix: 1, done: true };
  if (t < LAUNCH_MS) {
    const p = t / LAUNCH_MS;
    const e = p * p;
    return { phase: 'launch', speed: e, streak: e * 0.6, flash: 0, mix: 0, done: false };
  }
  if (t < SWAP_MS) {
    const p = (t - LAUNCH_MS) / (SWAP_MS - LAUNCH_MS);
    return { phase: 'hyperspace', speed: 1, streak: 0.6 + 0.4 * p, flash: p < 0.6 ? 0 : (p - 0.6) / 0.4, mix: p, done: false };
  }
  const p = (t - SWAP_MS) / (WARP_MS - SWAP_MS);
  const inv = (1 - p) * (1 - p);
  return { phase: 'arrival', speed: inv, streak: inv, flash: Math.max(0, 1 - p / 0.35), mix: 1, done: false };
}

const channels = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function lerpColor(a: string, b: string, t: number): string {
  const k = Math.max(0, Math.min(1, t));
  const ca = channels(a);
  const cb = channels(b);
  const mixed = ca.map((v, i) => Math.round(v + (cb[i] - v) * k));
  return `rgb(${mixed.join(',')})`;
}

export function universeForHash(hash: string): { index: number; anchor: string } | null {
  const target = sectionForHash(hash);
  return target ? { index: UNIVERSE_ORDER.indexOf(target.id), anchor: target.anchor } : null;
}
```

- [ ] **Step 4: Run it to verify it passes.** Same command → PASS (10 tests). Then run the full suite.

- [ ] **Step 5: Commit** (restore build/ first)

```bash
git add src/mobile/universePager.ts src/mobile/universePager.test.ts
git commit -m "feat(mobile): pure universe pager logic (edges, pulls, wheel, warp timeline)"
```

---

### Task 2: SpaceCanvas — stars that turn into hyperspeed streaks

**Files:**
- Create: `src/mobile/SpaceCanvas.tsx`
- Delete: `src/mobile/StarfieldCanvas.tsx`
- Modify: `src/mobile/MobileApp.tsx` (swap the canvas; pass an idle `warpRef`)

**Interfaces:**
- Consumes: `warpFrame`, `lerpColor`, `WarpState` (Task 1).
- Produces: `SpaceCanvas({ reducedMotion: boolean; warpRef: React.MutableRefObject<WarpState> })`. It uses the same `.mb-stars` CSS class as before.

- [ ] **Step 1: Create `src/mobile/SpaceCanvas.tsx`.** It keeps the old canvas's proven sizing, visibility and reduced-motion handling, and adds the warp.

```tsx
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
```

- [ ] **Step 2: Swap it into `MobileApp.tsx`.** Re-read the file first.
  - Replace the import `import { StarfieldCanvas } from './StarfieldCanvas';` with:

```tsx
import { SpaceCanvas } from './SpaceCanvas';
import { WarpState } from './universePager';
```

  - Inside the component, next to the other hooks, add:

```tsx
  // Idle until the pager (Task 3) drives it.
  const warpRef = useRef<WarpState>({ t0: null, from: '#ff7a00', to: '#ff7a00' });
```

  - Replace `<StarfieldCanvas reducedMotion={reducedMotion} />` with `<SpaceCanvas reducedMotion={reducedMotion} warpRef={warpRef} />`.

Then `git rm src/mobile/StarfieldCanvas.tsx`.

- [ ] **Step 3: Verify.**
  - `npx tsc --noEmit -p .` must be clean.
  - Run the full tests.
  - `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"` → `Compiled successfully.`
  - Serve on 3005 and run `node $SCRATCH/shots/mb-scenarios.js smoke` (the old page still works). Expected: `"mobile":true`, `"overflowX":false`, and the stars render.
  - Stop the server.

- [ ] **Step 4: Commit** (restore build/ first)

```bash
git add src/mobile/SpaceCanvas.tsx src/mobile/MobileApp.tsx
git rm src/mobile/StarfieldCanvas.tsx
git commit -m "feat(mobile): SpaceCanvas with warp-driven hyperspeed streaks and flash"
```

---

### Task 3: Universe pager — one universe at a time, jumps, history

**Files:**
- Create: `src/mobile/useUniversePager.ts`, `src/mobile/UniverseView.tsx`, `$SCRATCH/shots/mh-check.js`
- Rewrite: `src/mobile/MobileApp.tsx`
- Delete: `src/mobile/WarpOverlay.tsx`, `src/mobile/useActiveSection.ts`
- Modify: `src/mobile/mobile.css`

**Interfaces:**
- Consumes:
  - from `universePager.ts` (Task 1): `UNIVERSE_ORDER`, `LAST_INDEX`, `SWAP_MS`, `WARP_MS`, `FADE_MS`, `SETTLE_MS`, `clampIndex`, `nextIndex`, `prevIndex`, `accentOf`, `universeForHash`, `WarpState`
  - `SpaceCanvas` (Task 2)
  - `SECTION_COMPONENTS`, `MOBILE_SECTIONS`, `useReveal(ref)`, `useReducedMotion()`, `BottomNav({ active, onSelect })`, `TopBar({ onHome })`, `Footer`
- Produces:
  - `ViewState = 'active' | 'leaving' | 'arriving'`, `TravelSource = 'nav' | 'button' | 'gesture' | 'history'`
  - `useUniversePager(initialIndex, reducedMotion): { index; viewState; arrivals; warpRef; travelTo(target, { push?, source? }) }`
  - `UniverseView({ index, state, anchor, focusHeading, onTravel })`

- [ ] **Step 1: Create `src/mobile/useUniversePager.ts`**

```ts
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FADE_MS, SETTLE_MS, SWAP_MS, UNIVERSE_ORDER, WARP_MS, WarpState, accentOf, clampIndex, universeForHash } from './universePager';

export type ViewState = 'active' | 'leaving' | 'arriving';
export type TravelSource = 'nav' | 'button' | 'gesture' | 'history';
type TravelTo = (target: number, opts?: { push?: boolean; source?: TravelSource }) => void;

export interface UniversePager {
  index: number;
  viewState: ViewState;
  arrivals: number;
  warpRef: React.MutableRefObject<WarpState>;
  travelTo: TravelTo;
}

interface Flight { startedAt: number; doneAt: number; swap: (() => void) | null; timers: number[] }

/** One universe at a time; one jump at a time. Each jump pushes a history entry; Back travels without pushing. */
export function useUniversePager(initialIndex: number, reducedMotion: boolean): UniversePager {
  const [index, setIndex] = useState(initialIndex);
  const [viewState, setViewState] = useState<ViewState>('active');
  const [arrivals, setArrivals] = useState(0);
  const warpRef = useRef<WarpState>({ t0: null, from: accentOf(initialIndex), to: accentOf(initialIndex) });
  const indexRef = useRef(initialIndex);
  const flight = useRef<Flight | null>(null);
  const settledAt = useRef(-Infinity);
  const pending = useRef<number | null>(null);
  const travelRef = useRef<TravelTo>(() => {});

  const finish = useCallback(() => {
    const f = flight.current;
    if (!f) return;
    f.timers.forEach((id) => window.clearTimeout(id));
    if (f.swap) f.swap();
    flight.current = null;
    warpRef.current.t0 = null;
    setViewState('active');
    settledAt.current = performance.now();
    if (pending.current !== null) {
      const p = pending.current;
      pending.current = null;
      travelRef.current(p, { push: false, source: 'history' });
    }
  }, []);

  const travelTo = useCallback<TravelTo>(
    (target, opts = {}) => {
      const { push = true, source = 'nav' } = opts;
      const to = clampIndex(target);
      const now = performance.now();
      if (flight.current) {
        if (source === 'history') pending.current = to; // replay Back/Forward once this jump lands
        return;
      }
      if (to === indexRef.current) return;
      if (source === 'gesture' && now - settledAt.current < SETTLE_MS) return;
      const swapAt = reducedMotion ? FADE_MS / 2 : SWAP_MS;
      const doneAt = reducedMotion ? FADE_MS : WARP_MS;
      if (!reducedMotion) warpRef.current = { t0: now, from: accentOf(indexRef.current), to: accentOf(to) };
      const swap = () => {
        const f = flight.current;
        if (!f || !f.swap) return;
        f.swap = null;
        indexRef.current = to;
        setIndex(to);
        setViewState('arriving');
        setArrivals((n) => n + 1);
        const id = UNIVERSE_ORDER[to];
        if (push) window.history.pushState({ mbUniverse: id }, '', `#${id}`);
      };
      flight.current = { startedAt: now, doneAt, swap, timers: [] };
      flight.current.timers.push(window.setTimeout(swap, swapAt), window.setTimeout(finish, doneAt));
      setViewState('leaving');
    },
    [reducedMotion, finish]
  );
  travelRef.current = travelTo;

  useEffect(() => {
    window.history.replaceState({ mbUniverse: UNIVERSE_ORDER[indexRef.current] }, '');
    const onPop = () => {
      const st = window.history.state;
      if (st && st.mbSheet) return; // the open sheet handles its own entry
      const target = universeForHash(window.location.hash);
      travelRef.current(target ? target.index : 0, { push: false, source: 'history' });
    };
    // Timers are throttled in hidden tabs; land an overdue jump as soon as the tab is visible again.
    const onVisible = () => {
      const f = flight.current;
      if (!document.hidden && f && performance.now() - f.startedAt >= f.doneAt) finish();
    };
    const flightRef = flight;
    window.addEventListener('popstate', onPop);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('visibilitychange', onVisible);
      flightRef.current?.timers.forEach((id) => window.clearTimeout(id));
    };
  }, [finish]);

  return { index, viewState, arrivals, warpRef, travelTo };
}
```

- [ ] **Step 2: Create `src/mobile/UniverseView.tsx`**

```tsx
import React, { useEffect, useRef } from 'react';
import { MOBILE_SECTIONS } from './sections';
import { SECTION_COMPONENTS } from './sections/registry';
import { LAST_INDEX } from './universePager';
import { ViewState } from './useUniversePager';
import { useReveal } from './useReveal';
import { Footer } from './sections/Footer';

export interface UniverseViewProps {
  index: number;
  state: ViewState;
  /** In-universe anchor to scroll to on mount (deep links such as #certifications). */
  anchor: string | null;
  /** Move focus to the heading on mount (after a jump, not on first load). */
  focusHeading: boolean;
  onTravel: (dir: 'next' | 'prev', source: 'button' | 'gesture') => void;
}

/** One full-screen universe with its own scroll area. Remounted (keyed by index) for every jump. */
export const UniverseView: React.FC<UniverseViewProps> = ({ index, state, anchor, focusHeading, onTravel }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const section = MOBILE_SECTIONS[index];
  const Section = SECTION_COMPONENTS[section.id];
  const next = index < LAST_INDEX ? MOBILE_SECTIONS[index + 1] : null;
  useReveal(scrollRef);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    if (anchor && anchor !== section.id) root.querySelector<HTMLElement>(`#${anchor}`)?.scrollIntoView({ block: 'start' });
    if (focusHeading) {
      const heading = root.querySelector<HTMLElement>('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }, [anchor, focusHeading, section.id]);

  const leaving = state === 'leaving';
  return (
    <div
      className={`mb-universe is-${state}`}
      style={{ '--accent': section.accent } as React.CSSProperties}
      aria-hidden={leaving ? true : undefined}
      {...((leaving ? { inert: '' } : {}) as Record<string, string>)}
    >
      <div className="mb-universe__scroll" ref={scrollRef} data-universe={section.id}>
        <section id={section.id} className="mb-main mb-section" aria-label={section.label}>
          <Section section={section} />
          {next ? (
            <button className="mb-btn mb-btn--ghost mb-next" onClick={() => onTravel('next', 'button')}>
              Next: {next.label} ↓
            </button>
          ) : (
            <Footer />
          )}
        </section>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Rewrite `src/mobile/MobileApp.tsx`**

```tsx
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { MobileSectionId } from './sections';
import { UNIVERSE_ORDER, nextIndex, prevIndex, universeForHash } from './universePager';
import { useUniversePager } from './useUniversePager';
import { useReducedMotion } from './useReducedMotion';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SpaceCanvas } from './SpaceCanvas';
import { UniverseView } from './UniverseView';
import './mobile.css';

const MobileApp: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [initial] = useState(() => universeForHash(window.location.hash));
  const pager = useUniversePager(initial ? initial.index : 0, reducedMotion);
  const { travelTo, index } = pager;

  // Layout effects run before the pager's passive mount effect.
  useLayoutEffect(() => {
    // index.css smooth-scrolls <html> for the classic site; mobile jumps must be instant.
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    // A reload or Forward onto a stale sheet entry would leave mbSheet set with no sheet open.
    if (window.history.state && window.history.state.mbSheet) window.history.replaceState(null, '');
    return () => {
      root.style.scrollBehavior = prevBehavior;
    };
  }, []);

  const onTravel = useCallback(
    (dir: 'next' | 'prev', source: 'button' | 'gesture') => travelTo(dir === 'next' ? nextIndex(index) : prevIndex(index), { source }),
    [travelTo, index]
  );
  const onSelect = useCallback((id: MobileSectionId) => travelTo(UNIVERSE_ORDER.indexOf(id)), [travelTo]);

  return (
    <div className={`mb mb--pager${reducedMotion ? ' is-reduced' : ''}`}>
      <SpaceCanvas reducedMotion={reducedMotion} warpRef={pager.warpRef} />
      <TopBar onHome={() => travelTo(0)} />
      <UniverseView
        key={index}
        index={index}
        state={pager.viewState}
        anchor={pager.arrivals === 0 && initial ? initial.anchor : null}
        focusHeading={pager.arrivals > 0}
        onTravel={onTravel}
      />
      <BottomNav active={UNIVERSE_ORDER[index]} onSelect={onSelect} />
    </div>
  );
};

export default MobileApp;
```

Then delete the replaced modules: `git rm src/mobile/WarpOverlay.tsx src/mobile/useActiveSection.ts`. Run `grep -rn "WarpOverlay\|useActiveSection\|StarfieldCanvas\|scrollToAnchor" src`; expected: no output.

- [ ] **Step 4: Update `mobile.css`.**
  - Delete the now-unused `.mb-warp { … }` rule.
  - Append:

```css
/* ---------- universe pager ---------- */
.mb--pager { height: 100vh; height: 100dvh; min-height: 0; overflow: hidden; }
.mb-universe { position: fixed; inset: 0; z-index: 1; will-change: transform, opacity; }
.mb-universe__scroll {
  position: absolute; inset: 0; overflow-y: auto; overscroll-behavior-y: contain; -webkit-overflow-scrolling: touch;
  z-index: 1;
}
.mb-universe .mb-section { padding-bottom: 24px; min-height: 100%; }
.mb-universe.is-leaving {
  opacity: 0; transform: scale(0.92); filter: blur(6px); pointer-events: none;
  transition: opacity 0.35s ease-in, transform 0.35s ease-in, filter 0.35s ease-in;
}
.mb-universe.is-arriving { animation: mb-arrive 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
@keyframes mb-arrive { from { opacity: 0; transform: scale(1.08); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
.mb.is-reduced .mb-universe.is-leaving { transform: none; filter: none; transition: opacity 0.12s linear; }
.mb.is-reduced .mb-universe.is-arriving { animation: mb-fade 0.12s linear both; }
@media (prefers-reduced-motion: reduce) {
  .mb-universe.is-leaving { transform: none; filter: none; transition: opacity 0.12s linear; }
  .mb-universe.is-arriving { animation: mb-fade 0.12s linear both; }
}
.mb-next { width: 100%; margin: 28px 0 8px; }
```

- [ ] **Step 5: Create the check script `$SCRATCH/shots/mh-check.js`.** It replaces `mobile-check.js` and `mb-scenarios.js` for the pager. The `swipe` scenario passes only after Task 4.

```js
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const [scenario = 'all', base = 'http://localhost:3005/'] = process.argv.slice(2);
const OUT = __dirname + '/mh';
fs.mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ORDER = ['home', 'about', 'skills', 'work', 'projects', 'contact'];
const LABEL = { home: 'Home', about: 'About', skills: 'Skills', work: 'Work', projects: 'Projects', contact: 'Contact' };
const NEEDLES = {
  home: ["HELLO I'M", 'A highly driven Front-End Engineer'],
  about: ['Results-driven developer', 'Shree Raghuveer English High School', 'ReactJS'],
  skills: ['Middleware Serverless REST API'],
  work: ['Realatte', 'Entrance1.com'],
  projects: ['Shubhdhanam CRM'],
  contact: ['Send Message', 'Classic view'],
};
let failures = 0;
const fail = (m) => { failures++; console.log('FAIL', m); };
const JUMP = 1700;

async function openPage(b, { width = 390, height = 844, reduced = false, canvas = false } = {}) {
  const p = await b.newPage();
  if (canvas) await p.evaluateOnNewDocument(() => {
    const o = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, a) { return o.call(this, t, Object.assign({}, a, { preserveDrawingBuffer: true })); };
  });
  if (reduced) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.setViewport({ width, height, isMobile: true, hasTouch: true });
  p.on('pageerror', (e) => fail('pageerror ' + e.message));
  return p;
}
const state = (p) => p.evaluate(() => {
  const sc = document.querySelector('.mb-universe:not(.is-leaving) .mb-universe__scroll');
  return {
    hash: location.hash,
    active: document.querySelector('.mb-nav__item.is-active span')?.textContent,
    universes: document.querySelectorAll('.mb-universe').length,
    current: sc?.getAttribute('data-universe'),
    text: sc?.innerText || '',
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    focusedHeading: !!document.activeElement && document.activeElement.matches('h1, h2'),
  };
});
const clickNav = (p, label) => p.evaluate((l) => [...document.querySelectorAll('.mb-nav__item')].find((x) => x.textContent.includes(l)).click(), label);

const SCENARIOS = {
  async tour(b) {
    for (const vp of [{ width: 320, height: 640 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }]) {
      const p = await openPage(b, vp);
      await p.goto(base, { waitUntil: 'networkidle0' });
      await wait(1200);
      for (let i = 0; i < ORDER.length; i++) {
        const id = ORDER[i];
        const s = await state(p);
        if (s.current !== id) fail(`${vp.width}: expected ${id}, got ${s.current}`);
        if (s.universes !== 1) fail(`${vp.width} ${id}: ${s.universes} universes mounted`);
        if (s.overflowX) fail(`${vp.width} ${id}: horizontal overflow`);
        NEEDLES[id].filter((n) => !s.text.includes(n)).forEach((n) => fail(`${vp.width} ${id}: missing "${n}"`));
        if (i > 0 && (s.hash !== `#${id}` || s.active !== LABEL[id] || !s.focusedHeading)) fail(`${vp.width} ${id}: hash=${s.hash} active=${s.active} focus=${s.focusedHeading}`);
        const small = await p.evaluate(() => [...document.querySelectorAll('.mb button, .mb a')].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.width < 43.5 || r.height < 43.5) && !el.closest('.mb-chips');
        }).map((el) => el.textContent.trim().slice(0, 20) || el.getAttribute('aria-label')));
        if (small.length) fail(`${vp.width} ${id}: small targets ${small.join(' | ')}`);
        await p.screenshot({ path: `${OUT}/${vp.width}x${vp.height}-${id}.png` });
        if (i < ORDER.length - 1) {
          await p.evaluate(() => document.querySelector('.mb-universe:not(.is-leaving) .mb-next').click());
          await wait(JUMP);
        }
      }
      console.log(`tour ${vp.width}x${vp.height} done`);
      await p.close();
    }
  },
  async 'nav-back'(b) {
    const p = await openPage(b);
    await p.goto(base, { waitUntil: 'networkidle0' });
    await wait(1000);
    await clickNav(p, 'Projects');
    await wait(JUMP);
    let s = await state(p);
    if (s.current !== 'projects' || s.hash !== '#projects') fail(`nav to projects: ${s.current} ${s.hash}`);
    await p.goBack();
    await wait(JUMP);
    s = await state(p);
    if (s.current !== 'home') fail(`back from projects: ${s.current}`);
    // Review Focus 3: two quick Backs mid-warp must end on the right universe.
    await clickNav(p, 'About');
    await wait(JUMP);
    await clickNav(p, 'Skills');
    await wait(JUMP);
    await p.goBack();
    await wait(200);
    await p.goBack();
    await wait(JUMP * 2 + 300);
    s = await state(p);
    if (s.current !== 'home') fail(`double back: ended on ${s.current} (${s.hash})`);
    console.log('nav-back', JSON.stringify({ final: s.current, hash: s.hash }));
    await p.close();
  },
  async 'sheet-back'(b) {
    const p = await openPage(b);
    await p.goto(base + '#projects', { waitUntil: 'networkidle0' });
    await wait(1200);
    await p.evaluate(() => [...document.querySelectorAll('.mb-project .mb-btn--ghost')][0].click());
    await wait(500);
    const open = await p.evaluate(() => !!document.querySelector('.mb-sheet'));
    await p.goBack();
    await wait(700);
    const s = await state(p);
    const closed = await p.evaluate(() => !document.querySelector('.mb-sheet'));
    if (!open || !closed || s.current !== 'projects') fail(`sheet-back: open=${open} closed=${closed} current=${s.current}`);
    console.log('sheet-back', JSON.stringify({ open, closed, current: s.current }));
    await p.close();
  },
  async deeplink(b) {
    const p = await openPage(b);
    await p.goto(base + '#certifications', { waitUntil: 'networkidle0' });
    await wait(1200);
    const r = await p.evaluate(() => {
      const sc = document.querySelector('.mb-universe__scroll');
      const h = document.getElementById('certifications');
      return { current: sc.getAttribute('data-universe'), top: h.getBoundingClientRect().top };
    });
    if (r.current !== 'about' || r.top > 250 || r.top < 0) fail(`deeplink: ${JSON.stringify(r)}`);
    const u = await openPage(b);
    await u.goto(base + '#foo', { waitUntil: 'networkidle0' });
    await wait(800);
    const s = await state(u);
    if (s.current !== 'home') fail(`unknown hash opened ${s.current}`);
    console.log('deeplink', JSON.stringify(r), 'unknown→', s.current);
    await p.close();
    await u.close();
  },
  async reduced(b) {
    const p = await openPage(b, { reduced: true });
    await p.goto(base, { waitUntil: 'networkidle0' });
    await wait(800);
    await clickNav(p, 'Work');
    await wait(400); // the fade swaps at 125 ms; a warp would not swap until 750 ms
    const s = await state(p);
    const reducedClass = await p.evaluate(() => !!document.querySelector('.mb.is-reduced'));
    if (!reducedClass || s.current !== 'work' || s.hash !== '#work') fail(`reduced: ${JSON.stringify({ reducedClass, current: s.current, hash: s.hash })}`);
    console.log('reduced', JSON.stringify({ reducedClass, current: s.current, hash: s.hash }));
    await p.close();
  },
  async warpframe(b) {
    const p = await openPage(b, { canvas: true });
    await p.goto(base, { waitUntil: 'networkidle0' });
    await wait(1500);
    const shot = (name) => p.evaluate(() => document.querySelector('.mb-stars').toDataURL('image/png')).then((d) => fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(d.split(',')[1], 'base64')));
    await shot('canvas-rest');
    await clickNav(p, 'Skills');
    await wait(520);
    await shot('canvas-midwarp');
    console.log('warpframe saved', `${OUT}/canvas-rest.png`, `${OUT}/canvas-midwarp.png`);
    await p.close();
  },
  async swipe(b) {
    const p = await openPage(b);
    await p.goto(base, { waitUntil: 'networkidle0' });
    await wait(1200);
    const drag = async (fromY, toY) => {
      await p.touchscreen.touchStart(195, fromY);
      for (let i = 1; i <= 8; i++) await p.touchscreen.touchMove(195, fromY + ((toY - fromY) * i) / 8);
      await p.touchscreen.touchEnd();
    };
    await p.evaluate(() => { const sc = document.querySelector('.mb-universe__scroll'); sc.scrollTop = sc.scrollHeight; });
    await wait(300);
    await drag(600, 420); // pull 180 up at the bottom
    await wait(JUMP);
    let s = await state(p);
    if (s.current !== 'about') fail(`swipe up at bottom of home → ${s.current}`);
    await wait(500);
    await p.evaluate(() => { document.querySelector('.mb-universe__scroll').scrollTop = 0; });
    await wait(300);
    await drag(300, 480); // pull 180 down at the top
    await wait(JUMP);
    s = await state(p);
    if (s.current !== 'home') fail(`swipe down at top of about → ${s.current}`);
    // Review Focus 2: a swipe that doesn't start at an edge never jumps.
    await clickNav(p, 'Work');
    await wait(JUMP);
    await p.evaluate(() => { const sc = document.querySelector('.mb-universe__scroll'); sc.scrollTop = Math.max(1, (sc.scrollHeight - sc.clientHeight) / 2); });
    await wait(300);
    await drag(600, 420);
    await wait(JUMP);
    s = await state(p);
    if (s.current !== 'work') fail(`mid-page swipe jumped to ${s.current}`);
    console.log('swipe', JSON.stringify({ final: s.current }));
    await p.close();
  },
  async contact(b) {
    const p = await openPage(b);
    await p.setRequestInterception(true);
    p.on('request', (r) => (r.method() === 'POST' && r.url().endsWith('/api/contact')
      ? r.respond({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
      : r.continue()));
    await p.goto(base + '#contact', { waitUntil: 'networkidle0' });
    await wait(1200);
    await p.type('.mb-form input[name=name]', 'Test User');
    await p.type('.mb-form input[name=email]', 'test@example.com');
    await p.select('.mb-form select[name=subject]', 'job');
    await p.type('.mb-form textarea[name=message]', 'Hello from the hyperspeed test');
    await p.click('.mb-form .mb-btn');
    await wait(500);
    const r = await p.evaluate(() => ({ toast: !!document.querySelector('.mb-toast'), current: document.querySelector('.mb-universe__scroll').getAttribute('data-universe') }));
    if (!r.toast || r.current !== 'contact') fail(`contact: ${JSON.stringify(r)}`);
    console.log('contact', JSON.stringify(r));
    await p.close();
  },
};

(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new' });
  const names = scenario === 'all' ? Object.keys(SCENARIOS) : scenario.split(',');
  for (const n of names) {
    if (!SCENARIOS[n]) { fail(`unknown scenario ${n}`); continue; }
    try { await SCENARIOS[n](b); } catch (e) { fail(`${n} threw: ${e.message}`); }
  }
  console.log(failures ? `${failures} FAILURE(S)` : 'ALL HYPERSPEED CHECKS PASSED');
  await b.close();
})();
```

- [ ] **Step 6: Verify.**
  - `npx tsc --noEmit -p .` is clean.
  - Run the full tests.
  - `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"` → `Compiled successfully.`
  - Serve on 3005, then run `node $SCRATCH/shots/mh-check.js tour,nav-back,sheet-back,deeplink,reduced,warpframe,contact`.
  - Expected: `ALL HYPERSPEED CHECKS PASSED` (`swipe` is not part of this run).
  - Read `mh/canvas-midwarp.png`. It must show radial streaks, not dots.
  - Read two tour screenshots. Each must show a single full-screen universe with its Next button.
  - Stop the server.

- [ ] **Step 7: Commit** (restore build/ first)

```bash
git add src/mobile/useUniversePager.ts src/mobile/UniverseView.tsx src/mobile/MobileApp.tsx src/mobile/mobile.css
git rm src/mobile/WarpOverlay.tsx src/mobile/useActiveSection.ts
git commit -m "feat(mobile): universe pager with hyperspeed jumps, Next buttons and history"
```

---

### Task 4: Edge-swipe gestures and the pull indicator

**Files:**
- Create: `src/mobile/useEdgePull.ts`
- Test: `src/mobile/useEdgePull.test.ts`
- Modify: `src/mobile/UniverseView.tsx`, `src/mobile/mobile.css`

**Interfaces:**
- Consumes: `edgeState`, `travelDirection`, `wheelStep`, `INITIAL_WHEEL`, `WheelState`, `PULL_THRESHOLD` (Task 1); `UniverseView` (Task 3).
- Produces: `isGestureExempt(target): boolean`, `useEdgePull(scrollRef, onTravel, enabled): number`. The returned number is the current pull in px: positive past the bottom, negative past the top.

- [ ] **Step 1: Write the failing test** `src/mobile/useEdgePull.test.ts`:

```ts
import { isGestureExempt } from './useEdgePull';

test('gestures starting in form fields, sheets or the filter row are exempt', () => {
  document.body.innerHTML = `
    <textarea id="t"></textarea><input id="i" /><select id="s"></select>
    <div class="mb-sheet"><p id="insheet">x</p></div>
    <div class="mb-filters"><button id="chip">All</button></div>
    <div id="plain"><span id="inner">y</span></div>`;
  ['t', 'i', 's', 'insheet', 'chip'].forEach((id) => expect(isGestureExempt(document.getElementById(id))).toBe(true));
  expect(isGestureExempt(document.getElementById('inner'))).toBe(false);
  expect(isGestureExempt(null)).toBe(false);
});
```

Run: `CI=true npx react-scripts test --watchAll=false src/mobile/useEdgePull` → FAIL (module not found).

- [ ] **Step 2: Create `src/mobile/useEdgePull.ts`**

```ts
import { RefObject, useEffect, useRef, useState } from 'react';
import { INITIAL_WHEEL, WheelState, edgeState, travelDirection, wheelStep } from './universePager';

export function isGestureExempt(target: EventTarget | null): boolean {
  const el = target as Element | null;
  return !!el && typeof el.closest === 'function' && !!el.closest('input, textarea, select, .mb-sheet, .mb-filters');
}

/**
 * Edge pulls on a universe's scroll area: a touch that STARTS at the top/bottom edge and pulls a further
 * PULL_THRESHOLD px travels prev/next on release. Wheel input uses the armed/idle rules in wheelStep.
 * Returns the live pull distance for the indicator (0 when idle).
 */
export function useEdgePull(scrollRef: RefObject<HTMLElement>, onTravel: (dir: 'next' | 'prev') => void, enabled: boolean): number {
  const [pull, setPull] = useState(0);
  const travel = useRef(onTravel);
  travel.current = onTravel;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled) return;
    let start: { y: number; atTop: boolean; atBottom: boolean } | null = null;
    let current = 0;
    let raf = 0;
    const show = (v: number) => {
      current = v;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setPull(v));
    };
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || isGestureExempt(e.target)) {
        start = null;
        return;
      }
      start = { y: e.touches[0].clientY, ...edgeState(el.scrollTop, el.clientHeight, el.scrollHeight) };
    };
    const onMove = (e: TouchEvent) => {
      if (!start) return;
      const dy = start.y - e.touches[0].clientY; // > 0: finger moved up
      show((start.atBottom && dy > 0) || (start.atTop && dy < 0) ? dy : 0);
    };
    const onEnd = () => {
      if (!start) return;
      const dir = travelDirection({ atTop: start.atTop, atBottom: start.atBottom, pull: current });
      start = null;
      show(0);
      if (dir) travel.current(dir);
    };
    const onCancel = () => {
      start = null;
      show(0);
    };
    let wheel: WheelState = INITIAL_WHEEL;
    const onWheel = (e: WheelEvent) => {
      if (isGestureExempt(e.target)) return;
      const r = wheelStep(wheel, { deltaY: e.deltaY, ...edgeState(el.scrollTop, el.clientHeight, el.scrollHeight), now: performance.now() });
      wheel = r.state;
      if (r.travel) travel.current(r.travel);
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onCancel, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onCancel);
      el.removeEventListener('wheel', onWheel);
    };
  }, [scrollRef, enabled]);

  return pull;
}
```

Run the same test command → PASS.

- [ ] **Step 3: Wire it into `UniverseView.tsx`.**
  - Add the imports `import { useEdgePull } from './useEdgePull';` and `PULL_THRESHOLD` to the `./universePager` import.
  - Below `useReveal(scrollRef);`, add:

```tsx
  const prev = index > 0 ? MOBILE_SECTIONS[index - 1] : null;
  const pull = useEdgePull(scrollRef, (dir) => onTravel(dir, 'gesture'), state === 'active');
  const pullTarget = pull > 0 ? next : pull < 0 ? prev : null;
  const pullReady = Math.abs(pull) >= PULL_THRESHOLD;
```

  - Inside the outer `.mb-universe` div, as a sibling **after** the scroll div, add:

```tsx
      {pullTarget && (
        <div className={`mb-pull mb-pull--${pull > 0 ? 'bottom' : 'top'}${pullReady ? ' is-ready' : ''}`} style={{ opacity: Math.min(1, Math.abs(pull) / PULL_THRESHOLD) }} aria-hidden="true">
          {pullReady ? `Release for ${pullTarget.label}` : `Pull for ${pullTarget.label}`} {pull > 0 ? '↓' : '↑'}
        </div>
      )}
```

- [ ] **Step 4: Append the styles to `mobile.css`**

```css
/* ---------- edge pull indicator ---------- */
.mb-pull {
  position: absolute; left: 50%; transform: translateX(-50%); z-index: 3; pointer-events: none;
  padding: 8px 16px; border-radius: 999px; font-size: 0.8rem; letter-spacing: 0.04em; white-space: nowrap;
  background: rgba(8, 8, 14, 0.85); border: 1px solid var(--border); color: rgba(255, 255, 255, 0.85);
}
.mb-pull--bottom { bottom: calc(var(--nav-h) + 16px + env(safe-area-inset-bottom)); }
.mb-pull--top { top: calc(72px + env(safe-area-inset-top)); }
.mb-pull.is-ready { border-color: var(--accent); color: #fff; box-shadow: 0 0 16px color-mix(in srgb, var(--accent) 45%, transparent); }
```

- [ ] **Step 5: Verify.**
  - Run the full tests, `npx tsc --noEmit -p .`, and `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"` → `Compiled successfully.`
  - Serve, then run `node $SCRATCH/shots/mh-check.js swipe,tour,nav-back`. Expected: `ALL HYPERSPEED CHECKS PASSED`.
  - Stop the server.

- [ ] **Step 6: Commit** (restore build/ first)

```bash
git add src/mobile/useEdgePull.ts src/mobile/useEdgePull.test.ts src/mobile/UniverseView.tsx src/mobile/mobile.css
git commit -m "feat(mobile): edge-pull swipes between universes with a pull indicator"
```

---

### Task 5: Universe backdrops

**Files:**
- Create: `src/mobile/UniverseBackdrop.tsx`
- Modify: `src/mobile/UniverseView.tsx`, `src/mobile/mobile.css`

**Interfaces:**
- Consumes: `MobileSectionId` (`sections.ts`); `UniverseView` (Tasks 3–4).
- Produces: `UniverseBackdrop({ id: MobileSectionId })`, which is decorative and `aria-hidden`.

- [ ] **Step 1: Create `src/mobile/UniverseBackdrop.tsx`**

```tsx
import React from 'react';
import { MobileSectionId } from './sections';

// Spiral arm as an SVG path around (0,0).
const spiralPath = (offset: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI * 3;
    const r = 6 + t * 6.4;
    pts.push(`${(Math.cos(t + offset) * r).toFixed(1)},${(Math.sin(t + offset) * r).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
};
const ARMS = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map(spiralPath);
const CRYSTALS = Array.from({ length: 10 }, (_, i) => (i / 10) * 360);

// Signature objects drawn in currentColor (= the universe accent), centred on (0,0) in a 140×140 view box.
const OBJECTS: Partial<Record<MobileSectionId, React.ReactNode>> = {
  about: (
    <>
      <circle r="48" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="3 5" />
      <circle r="22" fill="currentColor" fillOpacity="0.75" />
      <g className="mb-spin">
        {[0, 90, 180, 270].map((a) => (
          <circle key={a} r="4" cx={Math.cos((a * Math.PI) / 180) * 48} cy={Math.sin((a * Math.PI) / 180) * 48} fill="currentColor" />
        ))}
      </g>
    </>
  ),
  skills: (
    <>
      <circle r="12" fill="currentColor" fillOpacity="0.8" />
      <g className="mb-spin">
        {CRYSTALS.map((a) => (
          <rect key={a} x="-4" y="-4" width="8" height="8" fill="currentColor" fillOpacity="0.85"
            transform={`rotate(${a}) translate(46 0) rotate(45)`} />
        ))}
      </g>
    </>
  ),
  work: (
    <>
      <path d="M-50,30 Q-10,-20 20,-10 T55,-40" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="3 5" />
      <circle cx="-50" cy="30" r="14" fill="currentColor" fillOpacity="0.8" />
      <circle cx="20" cy="-10" r="10" fill="currentColor" fillOpacity="0.6" />
      <circle cx="55" cy="-40" r="12" fill="currentColor" fillOpacity="0.45" />
    </>
  ),
  projects: (
    <g className="mb-spin mb-spin--slow">
      {ARMS.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
      ))}
      <circle r="6" fill="currentColor" />
    </g>
  ),
  contact: (
    <>
      <circle className="mb-pulse" r="20" fill="none" stroke="currentColor" strokeOpacity="0.6" />
      <rect x="-3" y="-6" width="6" height="56" fill="currentColor" fillOpacity="0.7" />
      <path d="M-22,-14 Q0,-34 22,-14" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cy="-22" r="4" fill="currentColor" />
    </>
  ),
};

/** Decorative per-universe space: two drifting nebula glows in the accent, plus a signature object. */
export const UniverseBackdrop: React.FC<{ id: MobileSectionId }> = ({ id }) => (
  <div className="mb-backdrop" aria-hidden="true">
    <span className="mb-backdrop__nebula mb-backdrop__nebula--a" />
    <span className="mb-backdrop__nebula mb-backdrop__nebula--b" />
    {OBJECTS[id] && (
      <svg className="mb-backdrop__object" viewBox="-70 -70 140 140">
        {OBJECTS[id]}
      </svg>
    )}
  </div>
);
```

- [ ] **Step 2: Render it in `UniverseView.tsx`.** Add `import { UniverseBackdrop } from './UniverseBackdrop';`, and render `<UniverseBackdrop id={section.id} />` as the **first** child of the outer `.mb-universe` div, before the scroll div.

- [ ] **Step 3: Append the styles to `mobile.css`**

```css
/* ---------- universe backdrops ---------- */
.mb-backdrop { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.mb-backdrop__nebula {
  position: absolute; width: 140vmax; height: 140vmax; border-radius: 50%; filter: blur(40px);
  background: radial-gradient(closest-side, rgba(255, 122, 0, 0.35), transparent);
  animation: mb-drift 24s ease-in-out infinite alternate;
}
.mb-backdrop__nebula--a { top: -70vmax; right: -80vmax; opacity: 0.6; }
.mb-backdrop__nebula--b { bottom: -80vmax; left: -90vmax; opacity: 0.35; animation-duration: 32s; }
.mb-backdrop__object {
  position: absolute; width: 140px; height: 140px; opacity: 0.5; color: var(--accent);
  top: calc(84px + env(safe-area-inset-top)); right: max(12px, calc((100% - var(--col)) / 2));
}
.mb-spin { animation: mb-spin 40s linear infinite; }
.mb-spin--slow { animation-duration: 90s; }
.mb-pulse { animation: mb-pulse 2.4s ease-out infinite; transform-origin: 0 0; }
@keyframes mb-drift { from { transform: translate(0, 0); } to { transform: translate(-6vmax, 4vmax); } }
@keyframes mb-spin { to { transform: rotate(360deg); } }
@keyframes mb-pulse { from { transform: scale(0.6); opacity: 0.9; } to { transform: scale(1.6); opacity: 0; } }
@supports (color: color-mix(in srgb, red 50%, transparent)) {
  .mb-backdrop__nebula { background: radial-gradient(closest-side, color-mix(in srgb, var(--accent) 45%, transparent), transparent); }
}
@media (prefers-reduced-motion: reduce) {
  .mb-backdrop__nebula, .mb-spin, .mb-pulse { animation: none; }
}
.mb.is-reduced .mb-backdrop__nebula, .mb.is-reduced .mb-spin, .mb.is-reduced .mb-pulse { animation: none; }
```

- [ ] **Step 4: Verify.**
  - Run the tests, tsc, and the CI build (`Compiled successfully.`).
  - Serve, then run `node $SCRATCH/shots/mh-check.js tour`. Expected: `ALL HYPERSPEED CHECKS PASSED`.
  - Read the 390×844 tour screenshots for about, skills, work, projects and contact. Each must show its signature object at top right in the universe's colour, behind the content, without hurting text legibility.
  - Stop the server.

- [ ] **Step 5: Commit** (restore build/ first)

```bash
git add src/mobile/UniverseBackdrop.tsx src/mobile/UniverseView.tsx src/mobile/mobile.css
git commit -m "feat(mobile): per-universe nebula backdrops and signature objects"
```

---

### Task 6: Full verification, Lighthouse and regressions

**Files:**
- Modify: `src/mobile/*` (only for fixes the checks reveal; list each in the report)

- [ ] **Step 1: Full hyperspeed checks.** Build, serve on 3005, and run `node $SCRATCH/shots/mh-check.js all`.
  - Expected: `ALL HYPERSPEED CHECKS PASSED`.
  - Read every screenshot in `$SCRATCH/shots/mh/`, including `canvas-midwarp.png`.
  - Fix any failure at its root cause, with the smallest change, and re-run until it passes.

- [ ] **Step 2: Lighthouse (mobile performance).**

```bash
npx -y lighthouse@12.2.1 http://localhost:3005/ --only-categories=performance --form-factor=mobile --screenEmulation.mobile --chrome-flags="--headless=new" --chrome-path=/usr/bin/google-chrome --quiet --output=json --output-path=$SCRATCH/shots/lh-hyperspeed.json
node -e "const r=require('$SCRATCH/shots/lh-hyperspeed.json');console.log('performance', Math.round(r.categories.performance.score*100), '| LCP', r.audits['largest-contentful-paint'].displayValue, '| CLS', r.audits['cumulative-layout-shift'].displayValue, '| TBT', r.audits['total-blocking-time'].displayValue)"
```

  - The aim is 90 or more. If it is lower, report the top 3 opportunities and don't make risky changes.
  - Run it twice and report both scores, since load on this machine makes the score noisy.

- [ ] **Step 3: Regressions.**
  - `node $SCRATCH/shots/mv-check.js http://localhost:3005/ $SCRATCH/shots/regress-hs 10` → 10 real panel lines, then `no console errors`
  - `node $SCRATCH/shots/classic-check.js http://localhost:3005/#classic` → `all sections OK`
  - `node $SCRATCH/shots/mv-interact.js reduced-motion` → `reduced motion → classic`

  Stop the server.

- [ ] **Step 4: Final gates.**
  - `CI=true npx react-scripts test --watchAll=false` → all pass.
  - `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"` → `Compiled successfully.`
  - `grep -rn "three\|@react-three" src/mobile` → no imports.
  - Restore build/.

- [ ] **Step 5: Commit** any fixes from Step 1 (skip if there are none):

```bash
git add <the files you changed>
git commit -m "fix(mobile): hyperspeed polish from device verification"
```
