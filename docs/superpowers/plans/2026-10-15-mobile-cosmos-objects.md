# Mobile Cosmos Objects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make planets, galaxies, a black hole and the multiverse functional on the mobile site. The work has four stages, each shippable on its own:
1. a black hole jump
2. a multiverse map for navigation
3. Orbit object views of the content, with an Orbit | List switch
4. hero objects that react to touch and scroll

**Architecture:**
- **Pure geometry and timelines** live in small tested modules: `blackHole.ts`, `mapLayout.ts`, `orbitLayouts.ts`, `galaxyLayout.ts`, `heroMotion.ts` and `useViewMode.ts`.
- **Objects are SVG art** (shaded with `Planet` gradients) under absolutely positioned HTML `<button>` nodes. This keeps them accessible and gives every tap target a real 44 px size.
- **`ObjectStage`** is the shared container. It handles pause-on-hold and, in Stage 4, hero motion.
- **The black hole** is drawn by the existing `SpaceCanvas`, driven by `warpRef.kind`. The pager picks the effect per jump.

**Tech Stack:** CRA 5 (react-scripts 5.0.1), React 18.3, TypeScript 4.9, Jest 27, Canvas 2D, SVG and CSS. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-15-mobile-cosmos-objects-design.md`

## Global Constraints

- **Git:** work on branch `worktree-multiverse` in `/home/sudhirvishwakarma/Documents/Landing Pages/Second-Portfolio-Sudhir/.claude/worktrees/multiverse`.
  - Local commits only. Never `git push` or deploy.
  - Use plain, separate git commands: no `&&` chains and no `git -C`.
  - Before every commit, run `git checkout -- build` then `git clean -fdq build`, and stage files explicitly.
  - Commit messages end with a blank line, then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Build:** `CI=true npm run build` must end with **"Compiled successfully."** (zero warnings).
- **Tests:** run with `CI=true npx react-scripts test --watchAll=false [path]`. Types: `npx tsc --noEmit -p .` must be clean.
- **Mobile chunk:** nothing under `src/mobile/` may import `three`, `@react-three/*`, `maath`, or any `.tsx` under `src/multiverse/`. `src/multiverse/fx/palettes.ts` is allowed. No new runtime dependencies.
- **Content:** all strings come from `src/data/portfolio.ts`, except UI labels named in this plan ("Orbit", "List", "Map", "Multiverse Map", "You are here", aria-labels).
- **Black hole:** `BH_PULL_MS = 600`, `BH_SWAP_MS = 800`, `BH_MS = 1600`.
  - It is used when `via === 'map'` or `|to − from| > 1`.
  - Neighbour jumps keep hyperspeed (swap at 750 ms, done at 1200 ms).
  - Reduced motion: every jump is the 250 ms fade (swap at 125 ms).
- **Tap targets:** at least 44×44 px.
- **Contrast:** WCAG AA.
- **No horizontal overflow** at 320×640, 390×844, 768×1024 or 844×390.
- **Keyboard and screen reader:** every object selection is a real `<button>` with an `aria-label`, plus `aria-pressed` for selection or `aria-current` for the map.
- **Orbit | List:**
  - The choice is stored in `localStorage` under the key `mb-view-<sectionId>`.
  - Every storage access is wrapped in try/catch.
  - Orbit is the default and the fallback.
- **Reduced motion:** no orbit rotation, drift, tilt or ripple. Everything stays tappable.
- **Headless checks:**
  - `$SCRATCH` = `/tmp/claude-1002/-home-sudhirvishwakarma-Documents-Landing-Pages-Second-Portfolio-Sudhir/01c9bdce-01ed-4d1b-ae64-6685ae80a718/scratchpad`. puppeteer-core 23 lives in `$SCRATCH/shots`; run node scripts from that directory.
  - Serve with the Bash tool's `run_in_background`: `npx -y serve@14.2.4 -s build -l 3005` from the worktree root. Wait until `curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/` returns 200.
  - Stop the server afterwards by PID: `pgrep -f "serve@14.2.4"`, then `kill <pids>`. Never use `pkill -f`.
  - Never touch port 3000.
  - Never send real email; `/api/contact` is always mocked.
- **LH command** (Lighthouse mobile performance; run it twice and record both lines):
  ```bash
  npx -y lighthouse@12.2.1 http://localhost:3005/ --only-categories=performance --form-factor=mobile --screenEmulation.mobile --chrome-flags="--headless=new" --chrome-path=/usr/bin/google-chrome --quiet --output=json --output-path=$SCRATCH/shots/lh-run.json
  node -e "const r=require('$SCRATCH/shots/lh-run.json');console.log('performance', Math.round(r.categories.performance.score*100), '| LCP', r.audits['largest-contentful-paint'].displayValue, '| CLS', r.audits['cumulative-layout-shift'].displayValue, '| TBT', r.audits['total-blocking-time'].displayValue)"
  ```
  Lighthouse results are **recorded, not gated**. Append each pair of result lines to `$SCRATCH/shots/lh-cosmos.txt`, labelled with the stage.

## Review Focus

1. **A second tap on the map while it is closing** must not trigger two `history.back()` calls or two jumps. The first pick wins. Pinned by the `double-pick` scenario in `map-check.js` (Task 4).
2. **Nav taps during a black hole jump** must be ignored, so no chained jump starts. Pinned by the pager test "travel input during a black hole jump is ignored" (Task 2).
3. **Tapping a moving planet:** pointer-down pauses orbits (`is-held`) so the target stops moving under the finger. Pinned by the `held` check in `skills-check.js` (Task 5).
4. **A vertical swipe that starts on a hero object** must still scroll the universe. The stage uses `touch-action: pan-y`, so horizontal drags tilt and vertical drags scroll. Pinned by the `vertical-scroll` check in `hero-check.js` (Task 8).
5. **A `#certifications` link when the visitor last chose List for About** must land on the List heading. In Orbit, it lands on the origin system with the first certification selected. Pinned by the `cert-link-list` check in `origin-check.js` (Task 7).

---

## File Structure

```
src/mobile/
  blackHole.ts (+ .test.ts)          NEW pure: black hole timeline, jumpKind
  universePager.ts                    WarpState gains kind
  useUniversePager.ts (+ test)        picks hyperspeed | blackhole per jump; via option; exposes jumpKind
  SpaceCanvas.tsx                     draws the black hole when warp.kind === 'blackhole'
  UniverseView.tsx                    is-blackhole class; kind prop
  MobileApp.tsx                       map sheet wiring (close-then-travel)
  Sheet.tsx                           exports closeTopSheet
  TopBar.tsx                          Map button
  useEdgePull.ts (+ test)             .mb-orbit is gesture-exempt
  skillColors.ts                      NEW (moved from SkillsSection)
  map/mapLayout.ts (+ .test.ts)       NEW pure: spiral positions
  map/UniverseGlyph.tsx               NEW: per-universe SVG glyph
  map/MultiverseMap.tsx               NEW: the map
  objects/Planet.tsx                  NEW: shaded SVG planet
  objects/ObjectStage.tsx             NEW: stage container (hold-to-pause; hero motion in Stage 4)
  objects/useViewMode.ts (+ .test.ts) NEW: Orbit | List persistence
  objects/ViewToggle.tsx              NEW
  objects/orbitLayouts.ts (+ .test.ts) NEW pure: ringPoints, careerPoints, CAREER_PATH
  objects/SkillSystem.tsx             NEW
  objects/galaxyLayout.ts (+ .test.ts) NEW pure: star positions, arm paths, nearestStar
  objects/ProjectGalaxy.tsx           NEW
  objects/CareerPath.tsx              NEW
  objects/OriginSystem.tsx            NEW
  objects/heroMotion.ts (+ .test.ts)  NEW pure: scroll drift, drag tilt
  objects/useHeroMotion.ts            NEW
  objects/Beacon.tsx                  NEW
  sections/Job.tsx                    NEW (moved out of WorkSection)
  sections/{Skills,Projects,Work,About,Home,Contact}Section.tsx   use the object views
  UniverseBackdrop.tsx                nebula only (signature objects removed)
  mobile.css                          styles per task
$SCRATCH/shots/cosmos-lib.js + bh-check.js, map-check.js, skills-check.js, galaxy-check.js, origin-check.js, hero-check.js
```

---

### Task 1: Black hole timeline (pure), WarpState.kind, and the Lighthouse baseline

**Files:**
- Create: `src/mobile/blackHole.ts`, `src/mobile/blackHole.test.ts`
- Modify: `src/mobile/universePager.ts` (WarpState), `src/mobile/useUniversePager.ts` (the warpRef initial value)

**Interfaces:**
- Produces:
  - `type JumpKind = 'hyperspeed' | 'blackhole'`
  - `BH_PULL_MS = 600`, `BH_SWAP_MS = 800`, `BH_MS = 1600`
  - `type BlackHolePhase = 'idle' | 'pull' | 'collapse' | 'emerge'`
  - `interface BlackHoleFrame { phase; pull; horizon; spin; flare; burst; mix; done }`
  - `blackHoleFrame(t: number): BlackHoleFrame`
  - `jumpKind({ from, to, via }: { from: number; to: number; via?: 'map' }): JumpKind`
  - `WarpState` becomes `{ t0: number | null; from: string; to: string; kind: JumpKind }`

- [ ] **Step 0: Lighthouse baseline (before any code change).**
  - Build: `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"`.
  - Serve on 3005 and run the LH command twice.
  - Append both lines to `$SCRATCH/shots/lh-cosmos.txt` under the heading `baseline (HEAD before cosmos work)`.
  - Stop the server, then restore build/.

- [ ] **Step 1: Write the failing test** `src/mobile/blackHole.test.ts`:

```ts
import { BH_MS, BH_PULL_MS, BH_SWAP_MS, blackHoleFrame, jumpKind } from './blackHole';

test('timeline constants', () => {
  expect([BH_PULL_MS, BH_SWAP_MS, BH_MS]).toEqual([600, 800, 1600]);
});

test('blackHoleFrame phase boundaries', () => {
  expect(blackHoleFrame(-1)).toMatchObject({ phase: 'idle', done: false });
  expect(blackHoleFrame(0)).toMatchObject({ phase: 'pull', pull: 0, horizon: 0, flare: 0, burst: 0, mix: 0 });
  expect(blackHoleFrame(599).phase).toBe('pull');
  expect(blackHoleFrame(599).pull).toBeGreaterThan(0.99);
  expect(blackHoleFrame(600)).toMatchObject({ phase: 'collapse', pull: 1, flare: 0, mix: 0 });
  expect(blackHoleFrame(799).phase).toBe('collapse');
  expect(blackHoleFrame(799).flare).toBeGreaterThan(0.99);
  expect(blackHoleFrame(800)).toMatchObject({ phase: 'emerge', pull: 1, horizon: 1, flare: 1, burst: 1, mix: 1 });
  expect(blackHoleFrame(1599).phase).toBe('emerge');
  expect(blackHoleFrame(1599).burst).toBeLessThan(0.01);
  expect(blackHoleFrame(1599).horizon).toBe(0);
  expect(blackHoleFrame(1600)).toMatchObject({ phase: 'idle', pull: 0, horizon: 0, flare: 0, burst: 0, mix: 1, done: true });
});

test('flare peaks at the swap, mix never goes backwards, values stay in range', () => {
  let lastMix = 0;
  for (let t = 0; t <= BH_MS; t += 10) {
    const f = blackHoleFrame(t);
    expect(f.flare).toBeLessThanOrEqual(blackHoleFrame(BH_SWAP_MS).flare);
    expect(f.mix).toBeGreaterThanOrEqual(lastMix);
    lastMix = f.mix;
    [f.pull, f.horizon, f.flare, f.burst, f.mix].forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  }
  expect(blackHoleFrame(BH_SWAP_MS - 10).flare).toBeLessThan(1);
  expect(blackHoleFrame(BH_SWAP_MS + 10).flare).toBeLessThan(1);
});

test('jumpKind: map jumps and far jumps use the black hole', () => {
  expect(jumpKind({ from: 0, to: 1 })).toBe('hyperspeed');
  expect(jumpKind({ from: 3, to: 2 })).toBe('hyperspeed');
  expect(jumpKind({ from: 0, to: 2 })).toBe('blackhole');
  expect(jumpKind({ from: 5, to: 0 })).toBe('blackhole');
  expect(jumpKind({ from: 0, to: 1, via: 'map' })).toBe('blackhole');
});
```

- [ ] **Step 2: Run it to verify it fails.** Run `CI=true npx react-scripts test --watchAll=false src/mobile/blackHole`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement `src/mobile/blackHole.ts`**

```ts
export type JumpKind = 'hyperspeed' | 'blackhole';

export const BH_PULL_MS = 600;
export const BH_SWAP_MS = 800;
export const BH_MS = 1600;

export type BlackHolePhase = 'idle' | 'pull' | 'collapse' | 'emerge';
/** spin is radians; every other number is 0..1. horizon is the event-horizon size relative to its maximum. */
export interface BlackHoleFrame { phase: BlackHolePhase; pull: number; horizon: number; spin: number; flare: number; burst: number; mix: number; done: boolean }

const idle = (done: boolean): BlackHoleFrame => ({ phase: 'idle', pull: 0, horizon: 0, spin: 0, flare: 0, burst: 0, mix: done ? 1 : 0, done });

/** Black hole timeline for elapsed ms: pull in, collapse (swap at BH_SWAP_MS, flare peak), emerge. */
export function blackHoleFrame(t: number): BlackHoleFrame {
  if (t < 0) return idle(false);
  if (t >= BH_MS) return idle(true);
  const spin = (t / 1000) * 7;
  if (t < BH_PULL_MS) {
    const p = t / BH_PULL_MS;
    return { phase: 'pull', pull: p * p, horizon: 0.6 * p, spin, flare: 0, burst: 0, mix: 0, done: false };
  }
  if (t < BH_SWAP_MS) {
    const p = (t - BH_PULL_MS) / (BH_SWAP_MS - BH_PULL_MS);
    return { phase: 'collapse', pull: 1, horizon: 0.6 + 0.4 * p, spin, flare: p, burst: 0, mix: p, done: false };
  }
  const p = (t - BH_SWAP_MS) / (BH_MS - BH_SWAP_MS);
  const inv = (1 - p) * (1 - p);
  return { phase: 'emerge', pull: inv, horizon: Math.max(0, 1 - p / 0.3), spin, flare: Math.max(0, 1 - p / 0.4), burst: inv, mix: 1, done: false };
}

/** Map jumps and jumps across more than one universe go through the black hole; neighbours keep hyperspeed. */
export function jumpKind({ from, to, via }: { from: number; to: number; via?: 'map' }): JumpKind {
  return via === 'map' || Math.abs(to - from) > 1 ? 'blackhole' : 'hyperspeed';
}
```

- [ ] **Step 4: Add `kind` to WarpState.**
  - In `src/mobile/universePager.ts`, add `import type { JumpKind } from './blackHole';` at the top, and change `export interface WarpState { t0: number | null; from: string; to: string }` to:

```ts
export interface WarpState { t0: number | null; from: string; to: string; kind: JumpKind }
```

  - In `src/mobile/useUniversePager.ts`, change the warpRef initialiser to:

```ts
  const warpRef = useRef<WarpState>({ t0: null, from: accentOf(initialIndex), to: accentOf(initialIndex), kind: 'hyperspeed' });
```

  - Also change the line inside `travelTo` that assigns `warpRef.current = { t0: now, from: …, to: … }` to include `kind: 'hyperspeed'`. Task 2 replaces it with the chosen kind.

- [ ] **Step 5: Verify.**
  - Run the blackHole test: PASS.
  - Run the full suite: all pass.
  - `npx tsc --noEmit -p .` is clean.
  - `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"` prints `Compiled successfully.`
  - Restore build/.

- [ ] **Step 6: Commit**

```bash
git add src/mobile/blackHole.ts src/mobile/blackHole.test.ts src/mobile/universePager.ts src/mobile/useUniversePager.ts
git commit -m "feat(mobile): black hole timeline and jump-kind rule"
```

---

### Task 2: The pager picks the black hole for map and far jumps; view classes

**Files:**
- Modify: `src/mobile/useUniversePager.ts`, `src/mobile/useUniversePager.test.tsx`, `src/mobile/UniverseView.tsx`, `src/mobile/MobileApp.tsx`, `src/mobile/mobile.css`

**Interfaces:**
- Consumes: `JumpKind`, `jumpKind`, `BH_SWAP_MS`, `BH_MS` (Task 1).
- Produces:
  - `TravelOptions { push?: boolean; source?: TravelSource; via?: 'map' }`
  - `travelTo(target, opts?: TravelOptions)`
  - `UniversePager.jumpKind: JumpKind`, the kind of the current or last flight
  - `UniverseViewProps.kind: JumpKind`
  - the CSS class `is-blackhole` on `.mb-universe` while it is leaving or arriving through a black hole

- [ ] **Step 1: Append the failing tests** to `src/mobile/useUniversePager.test.tsx`:

```tsx
test('far jumps use the black hole timeline; neighbours keep hyperspeed', async () => {
  await travel(5);
  expect(pager.jumpKind).toBe('blackhole');
  expect(pager.warpRef.current.kind).toBe('blackhole');
  await advance(799);
  expect(pager.index).toBe(0);
  await advance(1);
  expect(pager.index).toBe(5);
  expect(window.location.hash).toBe('#contact');
  await advance(799);
  expect(pager.viewState).toBe('arriving');
  await advance(1);
  expect(pager.viewState).toBe('active');
  await travel(4);
  expect(pager.jumpKind).toBe('hyperspeed');
  expect(pager.warpRef.current.kind).toBe('hyperspeed');
  await advance(750);
  expect(pager.index).toBe(4);
});

test('map jumps use the black hole even to a neighbour', async () => {
  await travel(1, { via: 'map' });
  expect(pager.jumpKind).toBe('blackhole');
  await advance(1600);
  expect(pager.index).toBe(1);
  expect(pager.viewState).toBe('active');
});

test('travel input during a black hole jump is ignored', async () => {
  await travel(5);
  await advance(300);
  await travel(2);
  await advance(1300);
  expect(pager.index).toBe(5);
  await advance(1000);
  expect(pager.index).toBe(5);
});
```

Run `CI=true npx react-scripts test --watchAll=false src/mobile/useUniversePager`. Expected: FAIL. `jumpKind` is undefined, and `via` doesn't type-check (ts-jest isn't used, so the failure shows up as an assertion failure).

- [ ] **Step 2: Update `src/mobile/useUniversePager.ts`.** Re-read it first.
  - Replace the import block and types at the top with:

```ts
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BH_MS, BH_SWAP_MS, JumpKind, jumpKind as pickJumpKind } from './blackHole';
import { FADE_MS, SETTLE_MS, SWAP_MS, UNIVERSE_ORDER, WARP_MS, WarpState, accentOf, clampIndex, universeForHash } from './universePager';

export type ViewState = 'active' | 'leaving' | 'arriving';
export type TravelSource = 'nav' | 'button' | 'gesture' | 'history';
export interface TravelOptions { push?: boolean; source?: TravelSource; via?: 'map' }
type TravelTo = (target: number, opts?: TravelOptions) => void;

export interface UniversePager {
  index: number;
  viewState: ViewState;
  arrivals: number;
  /** Effect of the current (or last) jump. */
  jumpKind: JumpKind;
  warpRef: React.MutableRefObject<WarpState>;
  travelTo: TravelTo;
}
```

  - Below `const [arrivals, setArrivals] = useState(0);`, add `const [jumpKind, setJumpKind] = useState<JumpKind>('hyperspeed');`.
  - In `travelTo`, change `const { push = true, source = 'nav' } = opts;` to `const { push = true, source = 'nav', via } = opts;`.
  - Replace the three lines `const swapAt = …`, `const doneAt = …` and `if (!reducedMotion) warpRef.current = …` with:

```ts
      // Reduced motion: every jump is the same short fade, whatever its distance.
      const kind: JumpKind = reducedMotion ? 'hyperspeed' : pickJumpKind({ from: indexRef.current, to, via });
      const swapAt = reducedMotion ? FADE_MS / 2 : kind === 'blackhole' ? BH_SWAP_MS : SWAP_MS;
      const doneAt = reducedMotion ? FADE_MS : kind === 'blackhole' ? BH_MS : WARP_MS;
      if (!reducedMotion) warpRef.current = { t0: now, from: accentOf(indexRef.current), to: accentOf(to), kind };
      setJumpKind(kind);
```

  - Change the final `return` to `return { index, viewState, arrivals, jumpKind, warpRef, travelTo };`.

- [ ] **Step 3: Update `src/mobile/UniverseView.tsx`.**
  - Add `import { JumpKind } from './blackHole';`.
  - Add `kind: JumpKind;` to `UniverseViewProps`, with the comment `/** Effect of the current jump; drives the black hole leave/arrive classes. */`.
  - Destructure `kind` in the component.
  - Change the outer className to:

```tsx
      className={`mb-universe is-${state}${kind === 'blackhole' && state !== 'active' ? ' is-blackhole' : ''}`}
```

- [ ] **Step 4: Pass the kind from `src/mobile/MobileApp.tsx`.** Add `kind={pager.jumpKind}` to the `<UniverseView … />` props.

- [ ] **Step 5: Append the CSS to `src/mobile/mobile.css`**

```css
/* ---------- black hole jump ---------- */
.mb-universe.is-leaving.is-blackhole {
  opacity: 0; transform: scale(0.05) rotate(180deg); filter: blur(8px);
  transition: opacity 0.6s ease-in, transform 0.6s cubic-bezier(0.55, 0, 1, 0.45), filter 0.6s ease-in;
}
.mb-universe.is-arriving.is-blackhole { animation: mb-emerge 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
@keyframes mb-emerge { from { opacity: 0; transform: scale(0.6) rotate(-25deg); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }
```

- [ ] **Step 6: Verify.**
  - The pager tests PASS (all, old and new).
  - The full suite passes, tsc is clean, and the CI build prints `Compiled successfully.`
  - Restore build/.

- [ ] **Step 7: Commit**

```bash
git add src/mobile/useUniversePager.ts src/mobile/useUniversePager.test.tsx src/mobile/UniverseView.tsx src/mobile/MobileApp.tsx src/mobile/mobile.css
git commit -m "feat(mobile): black hole jumps for far and map travel"
```

---

### Task 3: SpaceCanvas draws the black hole; headless check library; stage-1 Lighthouse

**Files:**
- Modify: `src/mobile/SpaceCanvas.tsx` (full replacement below)
- Create: `$SCRATCH/shots/cosmos-lib.js`, `$SCRATCH/shots/bh-check.js`

**Interfaces:**
- Consumes: `blackHoleFrame`, `BlackHoleFrame` (Task 1); `WarpState.kind` (Task 1), set by the pager (Task 2).
- Produces: `cosmos-lib.js`, a headless helper used by every later check script. It exports `base, wait, fail, openPage, done, current, clickNav, smallTargets, overflowX, canvasShot, run, VIEWPORTS, OUT`.

- [ ] **Step 1: Replace `src/mobile/SpaceCanvas.tsx`** with:

```tsx
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
```

- [ ] **Step 2: Create `$SCRATCH/shots/cosmos-lib.js`**

```js
// Shared helpers for the cosmos headless checks. Each openPage() gets its own browser context (fresh localStorage).
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const base = process.env.BASE || 'http://localhost:3005/';
const OUT = __dirname + '/cosmos';
fs.mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const VIEWPORTS = [{ width: 320, height: 640 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }];
let failures = 0;
const fail = (m) => { failures++; console.log('FAIL', m); };

async function openPage(b, { width = 390, height = 844, reduced = false, canvas = false } = {}) {
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  p.__ctx = ctx;
  if (canvas) await p.evaluateOnNewDocument(() => {
    const o = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, a) { return o.call(this, t, Object.assign({}, a, { preserveDrawingBuffer: true })); };
  });
  if (reduced) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.setViewport({ width, height, isMobile: true, hasTouch: true });
  p.on('pageerror', (e) => fail('pageerror ' + e.message));
  await p.setRequestInterception(true);
  p.on('request', (r) => (r.method() === 'POST' && r.url().endsWith('/api/contact')
    ? r.respond({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
    : r.continue()));
  return p;
}
const done = (p) => p.__ctx.close();
const current = (p) => p.evaluate(() => {
  const sc = document.querySelector('.mb-universe:not(.is-leaving) .mb-universe__scroll');
  return {
    id: sc ? sc.getAttribute('data-universe') : null,
    hash: location.hash,
    text: sc ? sc.innerText : '',
    focusedHeading: !!document.activeElement && document.activeElement.matches('h1, h2'),
  };
});
const clickNav = (p, label) => p.evaluate((l) => [...document.querySelectorAll('.mb-nav__item')].find((x) => x.textContent.includes(l)).click(), label);
const smallTargets = (p) => p.evaluate(() => [...document.querySelectorAll('.mb button, .mb a')].filter((el) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && (r.width < 43.5 || r.height < 43.5) && !el.closest('.mb-chips');
}).map((el) => el.getAttribute('aria-label') || el.textContent.trim().slice(0, 20)));
const overflowX = (p) => p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
const canvasShot = (p, name) => p.evaluate(() => document.querySelector('.mb-stars').toDataURL('image/png'))
  .then((d) => fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(d.split(',')[1], 'base64')));

async function run(scenarios) {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new' });
  const arg = process.argv[2] || 'all';
  const names = arg === 'all' ? Object.keys(scenarios) : arg.split(',');
  for (const n of names) {
    if (!scenarios[n]) { fail(`unknown scenario ${n}`); continue; }
    try { await scenarios[n](b); } catch (e) { fail(`${n} threw: ${e.message}`); }
  }
  console.log(failures ? `${failures} FAILURE(S)` : 'ALL COSMOS CHECKS PASSED');
  await b.close();
}

module.exports = { base, OUT, VIEWPORTS, wait, fail, openPage, done, current, clickNav, smallTargets, overflowX, canvasShot, run };
```

- [ ] **Step 3: Create `$SCRATCH/shots/bh-check.js`**

```js
const L = require('./cosmos-lib');

L.run({
  async far(b) {
    const p = await L.openPage(b, { canvas: true });
    await p.goto(L.base, { waitUntil: 'networkidle0' });
    await L.wait(1200);
    await L.clickNav(p, 'Contact');
    await L.wait(300);
    if (!(await p.evaluate(() => !!document.querySelector('.mb-universe.is-leaving.is-blackhole')))) L.fail('far jump: no black hole leaving class at ~300 ms');
    await L.wait(350);
    await L.canvasShot(p, 'blackhole-650ms');
    await L.wait(1300);
    const s = await L.current(p);
    if (s.id !== 'contact' || s.hash !== '#contact' || !s.focusedHeading) L.fail(`far jump landed ${JSON.stringify({ id: s.id, hash: s.hash, focus: s.focusedHeading })}`);
    await L.clickNav(p, 'Projects');
    await L.wait(150);
    if (await p.evaluate(() => !!document.querySelector('.mb-universe.is-blackhole'))) L.fail('neighbour jump used the black hole');
    await L.wait(1400);
    if ((await L.current(p)).id !== 'projects') L.fail('neighbour jump did not land on projects');
    console.log('far: ok, canvas saved to', `${L.OUT}/blackhole-650ms.png`);
    await L.done(p);
  },
  async reduced(b) {
    const p = await L.openPage(b, { reduced: true });
    await p.goto(L.base, { waitUntil: 'networkidle0' });
    await L.wait(800);
    await L.clickNav(p, 'Contact');
    await L.wait(60);
    if (await p.evaluate(() => !!document.querySelector('.mb-universe.is-blackhole'))) L.fail('reduced motion used the black hole');
    await L.wait(400);
    const s = await L.current(p);
    if (s.id !== 'contact') L.fail(`reduced: landed on ${s.id}`);
    console.log('reduced: ok');
    await L.done(p);
  },
});
```

- [ ] **Step 4: Verify.**
  - Run the full tests, tsc and the CI build (`Compiled successfully.`).
  - Serve on 3005, then from `$SCRATCH/shots` run:
    - `node bh-check.js`. Expected: `ALL COSMOS CHECKS PASSED`.
    - `node mh-check.js nav-back,sheet-back,warpframe,reduced`. Expected: `ALL HYPERSPEED CHECKS PASSED` (hyperspeed is not broken).
  - Read `$SCRATCH/shots/cosmos/blackhole-650ms.png`. It must show a black disc with a glowing ring and inward-curving star trails, not plain dots.
  - Read `$SCRATCH/shots/mh/canvas-midwarp.png`. It must still show hyperspeed streaks.
- [ ] **Step 5: Stage 1 Lighthouse.** Run the LH command twice and append both lines under `stage 1 (black hole)`. Stop the server and restore build/.

- [ ] **Step 6: Commit**

```bash
git add src/mobile/SpaceCanvas.tsx
git commit -m "feat(mobile): SpaceCanvas draws the black hole jump"
```

---

### Task 4: The multiverse map

**Files:**
- Create:
  - `src/mobile/objects/Planet.tsx`
  - `src/mobile/objects/ObjectStage.tsx`
  - `src/mobile/map/mapLayout.ts` and `src/mobile/map/mapLayout.test.ts`
  - `src/mobile/map/UniverseGlyph.tsx`
  - `src/mobile/map/MultiverseMap.tsx`
  - `$SCRATCH/shots/map-check.js`
- Modify: `src/mobile/Sheet.tsx`, `src/mobile/TopBar.tsx`, `src/mobile/MobileApp.tsx`, `src/mobile/mobile.css`

**Interfaces:**
- Consumes: `travelTo(target, { via: 'map' })` (Task 2), `MOBILE_SECTIONS`, `Sheet`.
- Produces:
  - `Planet({ cx?, cy?, r, color, ring? })`: an SVG `<g>` with a shaded sphere
  - `ObjectStage({ label?, id?, className?, children })`: a `div.mb-orbit` that toggles `is-held` while pressed. Without a `label` it is `aria-hidden`.
  - `mapLayout(n, rotation = 0): { x: number; y: number }[]`, in percent of a square
  - `UniverseGlyph({ id, color, size? })`
  - `MultiverseMap({ current, onPick })`
  - `closeTopSheet(onClose)`, exported from `Sheet.tsx`
  - `TopBar({ onHome, onMap })`
  - shared CSS classes: `.mb-orbit`, `.mb-orbit__art`, `.mb-orbit__ring` (with `--period`), `.mb-orbit__node` (with `--glow`, `is-selected`), `.mb-orbit__upright`, `.mb-orbit__glyph`, `.mb-orbit__label`

- [ ] **Step 1: Write the failing test** `src/mobile/map/mapLayout.test.ts`:

```ts
import { mapLayout } from './mapLayout';

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

test('six universes stay inside the map and well apart', () => {
  const pts = mapLayout(6);
  expect(pts).toHaveLength(6);
  pts.forEach((p) => {
    expect(p.x).toBeGreaterThanOrEqual(8);
    expect(p.x).toBeLessThanOrEqual(92);
    expect(p.y).toBeGreaterThanOrEqual(8);
    expect(p.y).toBeLessThanOrEqual(92);
  });
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) expect(dist(pts[i], pts[j])).toBeGreaterThanOrEqual(20);
});

test('the spiral starts near the core and widens outward', () => {
  const r = mapLayout(6).map((p) => dist(p, { x: 50, y: 50 }));
  expect(r[0]).toBeCloseTo(16);
  expect(r[5]).toBeCloseTo(42);
  for (let i = 1; i < r.length; i++) expect(r[i]).toBeGreaterThan(r[i - 1]);
});

test('rotation turns the whole layout around the core', () => {
  const a = mapLayout(6, 0);
  const b = mapLayout(6, Math.PI);
  a.forEach((p, i) => {
    expect(b[i].x).toBeCloseTo(100 - p.x);
    expect(b[i].y).toBeCloseTo(100 - p.y);
  });
  expect(mapLayout(1)).toEqual([{ x: expect.any(Number), y: expect.any(Number) }]);
  expect(dist(mapLayout(1)[0], { x: 50, y: 50 })).toBeCloseTo(16);
});
```

Run `CI=true npx react-scripts test --watchAll=false src/mobile/map`. Expected: FAIL, module not found.

- [ ] **Step 2: Implement `src/mobile/map/mapLayout.ts`**

```ts
export interface MapPoint { x: number; y: number }

const INNER = 16;
const OUTER = 42;
const STEP = 2.4; // radians between neighbours: a sunflower-like spiral keeps them apart

/** Positions (percent of a square map) for n universes on a spiral around the core at (50, 50). */
export function mapLayout(n: number, rotation = 0): MapPoint[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const r = INNER + t * (OUTER - INNER);
    const a = rotation - Math.PI / 2 + i * STEP;
    return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
  });
}
```

Run the map tests. Expected: PASS.

- [ ] **Step 3: Create `src/mobile/objects/Planet.tsx`**

```tsx
import React, { useId } from 'react';

/** A sphere shaded with a lit highlight (top-left) fading to night; optional tilted ring. SVG units. */
export const Planet: React.FC<{ cx?: number; cy?: number; r: number; color: string; ring?: boolean }> = ({ cx = 0, cy = 0, r, color, ring }) => {
  const id = `mb-planet-${useId().replace(/:/g, '')}`;
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.28" stopColor={color} />
          <stop offset="1" stopColor="#05030a" />
        </radialGradient>
      </defs>
      {ring && (
        <ellipse cx={cx} cy={cy} rx={r * 1.9} ry={r * 0.55} fill="none" stroke={color} strokeOpacity="0.65" strokeWidth={r * 0.18} transform={`rotate(-18 ${cx} ${cy})`} />
      )}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </g>
  );
};
```

- [ ] **Step 4: Create `src/mobile/objects/ObjectStage.tsx`**

```tsx
import React, { useState } from 'react';

export interface ObjectStageProps {
  /** Accessible name; without one the stage is decorative (aria-hidden). */
  label?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

/** Square stage for an interactive space object. Orbits pause while it is pressed so targets hold still. */
export const ObjectStage: React.FC<ObjectStageProps> = ({ label, id, className, children }) => {
  const [held, setHeld] = useState(false);
  const release = () => setHeld(false);
  return (
    <div
      id={id}
      className={`mb-orbit${className ? ` ${className}` : ''}${held ? ' is-held' : ''}`}
      role={label ? 'group' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onPointerDown={() => setHeld(true)}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
    >
      {children}
    </div>
  );
};
```

- [ ] **Step 5: Create `src/mobile/map/UniverseGlyph.tsx`**

```tsx
import React from 'react';
import { MobileSectionId } from '../sections';
import { Planet } from '../objects/Planet';

const spiral = (offset: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 30; i++) {
    const t = (i / 30) * Math.PI * 2.6;
    const r = 2 + t * 1.9;
    pts.push(`${(Math.cos(t + offset) * r).toFixed(1)},${(Math.sin(t + offset) * r).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
};
const ARMS = [0, Math.PI].map(spiral);
const MOONS = [0, 120, 240].map((a) => ({ x: Math.cos((a * Math.PI) / 180) * 15, y: Math.sin((a * Math.PI) / 180) * 15 }));

const GLYPHS: Record<MobileSectionId, (c: string) => React.ReactNode> = {
  home: () => (
    <>
      <circle r="16" fill="#ffb347" opacity="0.22" />
      <Planet r={10} color="#ffb347" />
    </>
  ),
  about: (c) => (
    <>
      <circle r="15" fill="none" stroke={c} strokeOpacity="0.45" strokeDasharray="2 2" />
      <Planet r={8} color={c} />
      {MOONS.map((m, i) => <circle key={i} cx={m.x} cy={m.y} r="2.2" fill={c} />)}
    </>
  ),
  skills: (c) => <Planet r={8} color={c} ring />,
  work: (c) => (
    <>
      <path d="M-15,10 Q-2,-14 15,-10" fill="none" stroke={c} strokeOpacity="0.5" strokeDasharray="2 2" />
      <Planet cx={-14} cy={10} r={4} color={c} />
      <Planet cx={0} cy={-3} r={5} color={c} />
      <Planet cx={14} cy={-10} r={6} color={c} />
    </>
  ),
  projects: (c) => (
    <>
      {ARMS.map((d, i) => <path key={i} d={d} fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.85" />)}
      <circle r="3" fill="#ffffff" />
    </>
  ),
  contact: (c) => (
    <>
      <circle cy="-8" r="9" fill={c} opacity="0.25" />
      <path d="M-6,16 L0,-4 L6,16 Z" fill={c} fillOpacity="0.6" />
      <path d="M-9,-10 Q0,-18 9,-10" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <circle cy="-8" r="2.6" fill="#ffffff" />
    </>
  ),
};

/** Small picture of a universe for the multiverse map. Decorative: the button around it carries the name. */
export const UniverseGlyph: React.FC<{ id: MobileSectionId; color: string; size?: number }> = ({ id, color, size = 40 }) => (
  <svg className="mb-orbit__glyph" width={size} height={size} viewBox="-20 -20 40 40" aria-hidden="true">
    {GLYPHS[id](color)}
  </svg>
);
```

- [ ] **Step 6: Create `src/mobile/map/MultiverseMap.tsx`**

```tsx
import React from 'react';
import { MOBILE_SECTIONS } from '../sections';
import { ObjectStage } from '../objects/ObjectStage';
import { UniverseGlyph } from './UniverseGlyph';
import { mapLayout } from './mapLayout';

const POINTS = mapLayout(MOBILE_SECTIONS.length);
const LANES = POINTS.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

/** The six universes on a slowly turning spiral around a black hole; tap one to travel there. */
export const MultiverseMap: React.FC<{ current: number; onPick: (index: number) => void }> = ({ current, onPick }) => (
  <div className="mb-map">
    <span className="mb-kicker">Navigation</span>
    <h2 className="mb-h2">Multiverse Map</h2>
    <p className="mb-text">Tap a universe to travel there through the black hole.</p>
    <ObjectStage label="Multiverse map" className="mb-map__space">
      <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="mb-map-disk">
            <stop offset="0.35" stopColor="#ff7a00" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ff7a00" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="12" fill="url(#mb-map-disk)" />
        <ellipse cx="50" cy="50" rx="11" ry="3.4" fill="none" stroke="#ffd6a8" strokeWidth="0.8" transform="rotate(-20 50 50)" />
        <circle cx="50" cy="50" r="5" fill="#000000" />
      </svg>
      <div className="mb-orbit__ring" style={{ '--period': '140s' } as React.CSSProperties}>
        <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
          <polyline points={LANES} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.4" strokeDasharray="1 1.6" />
        </svg>
        {MOBILE_SECTIONS.map((s, i) => (
          <button
            key={s.id}
            className={`mb-orbit__node mb-map__node${i === current ? ' is-selected' : ''}`}
            style={{ left: `${POINTS[i].x}%`, top: `${POINTS[i].y}%`, '--glow': s.accent } as React.CSSProperties}
            aria-label={`Travel to ${s.label}`}
            aria-current={i === current ? 'true' : undefined}
            onClick={() => onPick(i)}
          >
            <span className="mb-orbit__upright">
              <UniverseGlyph id={s.id} color={s.accent} />
              <span className="mb-orbit__label">{s.label}</span>
              {i === current && <span className="mb-map__here">You are here</span>}
            </span>
          </button>
        ))}
      </div>
    </ObjectStage>
  </div>
);
```

- [ ] **Step 7: Export `closeTopSheet` from `src/mobile/Sheet.tsx`.**
  - Add this above `interface SheetProps`:

```ts
/** Close the open sheet through history when it owns the top entry, so Back, ✕ and in-sheet actions behave the same. */
export function closeTopSheet(onClose: () => void) {
  if (window.history.state && window.history.state.mbSheet) window.history.back();
  else onClose();
}
```

  - Replace the body of `requestClose` with `closeTopSheet(() => onCloseRef.current());`. It keeps its `useCallback(…, [])`, and its comment line becomes `// Close through history when we own the top entry.`

- [ ] **Step 8: Replace `src/mobile/TopBar.tsx`**

```tsx
import React from 'react';

export const TopBar: React.FC<{ onHome: () => void; onMap: () => void }> = ({ onHome, onMap }) => (
  <header className="mb-topbar">
    <button className="mb-mono" onClick={onHome} aria-label="Go to Home">SV</button>
    <button className="mb-mapbtn" onClick={onMap} aria-label="Multiverse map">
      <svg viewBox="-12 -12 24 24" aria-hidden="true">
        <path d="M0,0 m-9,0 a9,4 -20 1,0 18,0 a9,4 -20 1,0 -18,0" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle r="3" fill="currentColor" />
        <circle cx="7" cy="-6" r="1.4" fill="currentColor" />
      </svg>
      <span aria-hidden="true">Map</span>
    </button>
  </header>
);
```

- [ ] **Step 9: Wire the map in `src/mobile/MobileApp.tsx`.**
  - Change the React import to `import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';`.
  - Add the imports `import { Sheet, closeTopSheet } from './Sheet';` and `import { MultiverseMap } from './map/MultiverseMap';`.
  - After the `onSelect` callback, add:

```tsx
  const [mapOpen, setMapOpen] = useState(false);
  // Universe picked on the map. Travel starts only after the map's sheet has closed AND left the DOM:
  // the pager ignores non-history travel while a .mb-sheet is mounted.
  const mapTarget = useRef<number | null>(null);
  const mapClosing = useRef(false);
  const closeMap = useCallback(() => setMapOpen(false), []);
  useEffect(() => {
    if (mapOpen) return;
    mapClosing.current = false;
    const target = mapTarget.current;
    mapTarget.current = null;
    if (target !== null) travelTo(target, { via: 'map' });
  }, [mapOpen, travelTo]);
  const onPick = useCallback(
    (i: number) => {
      if (mapClosing.current) return; // a second tap while the map is closing must not go Back twice
      mapClosing.current = true;
      mapTarget.current = i === index ? null : i;
      closeTopSheet(closeMap);
    },
    [index, closeMap]
  );
```

  - Change the TopBar line to `<TopBar onHome={() => travelTo(0)} onMap={() => setMapOpen(true)} />`.
  - After `<BottomNav … />`, add:

```tsx
      <Sheet open={mapOpen} onClose={closeMap} label="Multiverse map" variant="full">
        <MultiverseMap current={index} onPick={onPick} />
      </Sheet>
```

- [ ] **Step 10: Update `src/mobile/mobile.css`.**
  - In the existing `.mb-topbar` rule, change `display: flex; align-items: center;` to `display: flex; align-items: center; justify-content: space-between;`.
  - Append:

```css
/* ---------- map button ---------- */
.mb-mapbtn {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px; min-width: 44px; padding: 0 14px;
  border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.22); background: rgba(255, 255, 255, 0.06);
  color: #fff; font: inherit; font-size: 0.85rem; cursor: pointer;
}
.mb-mapbtn svg { width: 20px; height: 20px; color: #ffb15c; }

/* ---------- object stages (map, orbit views, heroes) ---------- */
.mb-orbit { position: relative; width: min(100%, 360px); aspect-ratio: 1 / 1; margin: 8px auto 16px; touch-action: pan-y; }
.mb-orbit__art { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.mb-orbit__ring { position: absolute; inset: 0; pointer-events: none; animation: mb-spin var(--period, 60s) linear infinite; }
.mb-orbit__node {
  position: absolute; transform: translate(-50%, -50%); min-width: 44px; min-height: 44px; padding: 2px;
  display: grid; place-items: center; border: 0; border-radius: 50%; background: none; color: #fff;
  font: inherit; cursor: pointer; pointer-events: auto;
}
.mb-orbit__upright { display: grid; justify-items: center; gap: 2px; }
.mb-orbit__ring .mb-orbit__upright { animation: mb-spin-rev var(--period, 60s) linear infinite; }
.mb-orbit__glyph { display: block; overflow: visible; }
.mb-orbit__node.is-selected .mb-orbit__glyph { filter: drop-shadow(0 0 8px var(--glow, #ffffff)); }
.mb-orbit__label { font-size: 0.7rem; letter-spacing: 0.06em; white-space: nowrap; color: rgba(255, 255, 255, 0.85); text-shadow: 0 1px 3px #000; }
.mb-orbit.is-held .mb-orbit__ring, .mb-orbit.is-held .mb-orbit__upright,
.mb-orbit:focus-within .mb-orbit__ring, .mb-orbit:focus-within .mb-orbit__upright { animation-play-state: paused; }
@keyframes mb-spin-rev { to { transform: rotate(-360deg); } }
@media (prefers-reduced-motion: reduce) { .mb-orbit__ring, .mb-orbit__ring .mb-orbit__upright { animation: none; } }
.mb.is-reduced .mb-orbit__ring, .mb.is-reduced .mb-orbit__ring .mb-orbit__upright { animation: none; }

/* ---------- multiverse map ---------- */
.mb-map { display: flex; flex-direction: column; gap: 6px; padding: 28px 0 8px; }
.mb-map__space { width: min(100%, 520px, max(300px, calc(100vh - 230px))); width: min(100%, 520px, max(300px, calc(100dvh - 230px))); }
.mb-map__here { font-size: 0.66rem; letter-spacing: 0.08em; text-transform: uppercase; color: #ffb15c; }
.mb-map__node[aria-current='true'] .mb-orbit__glyph { filter: drop-shadow(0 0 10px var(--glow, #ffffff)); animation: mb-here 1.8s ease-in-out infinite; }
@keyframes mb-here { 50% { transform: scale(1.12); } }
@media (prefers-reduced-motion: reduce) { .mb-map__node[aria-current='true'] .mb-orbit__glyph { animation: none; } }
.mb.is-reduced .mb-map__node[aria-current='true'] .mb-orbit__glyph { animation: none; }
```

  Note: `@keyframes mb-spin` already exists in `mobile.css` (the backdrop section). Keep it.

- [ ] **Step 11: Create `$SCRATCH/shots/map-check.js`**

```js
const L = require('./cosmos-lib');
const mapOpen = (p) => p.evaluate(() => !!document.querySelector('.mb-sheet .mb-map'));
const openMap = async (p) => { await p.click('.mb-mapbtn'); await L.wait(450); };
const pickNode = (p, label) => p.evaluate((l) => document.querySelector(`.mb-map__node[aria-label="Travel to ${l}"]`).click(), label);

L.run({
  async 'open-close'(b) {
    const p = await L.openPage(b);
    await p.goto(L.base, { waitUntil: 'networkidle0' });
    await L.wait(1000);
    await openMap(p);
    if (!(await mapOpen(p))) L.fail('map did not open');
    const nodes = await p.evaluate(() => [...document.querySelectorAll('.mb-map__node')].map((n) => ({ label: n.getAttribute('aria-label'), current: n.getAttribute('aria-current') })));
    if (nodes.length !== 6) L.fail(`map has ${nodes.length} nodes`);
    if (!nodes.find((n) => n.label === 'Travel to Home' && n.current === 'true')) L.fail('Home is not marked current');
    await p.goBack();
    await L.wait(500);
    if (await mapOpen(p)) L.fail('Back did not close the map');
    if ((await L.current(p)).id !== 'home') L.fail('Back from the map left Home');
    console.log('open-close: ok');
    await L.done(p);
  },
  async travel(b) {
    const p = await L.openPage(b);
    await p.goto(L.base, { waitUntil: 'networkidle0' });
    await L.wait(1000);
    await openMap(p);
    await pickNode(p, 'Contact');
    await L.wait(350);
    if (await mapOpen(p)) L.fail('map still open after picking');
    if (!(await p.evaluate(() => !!document.querySelector('.mb-universe.is-blackhole')))) L.fail('map travel did not use the black hole');
    await L.wait(1700);
    const s = await L.current(p);
    if (s.id !== 'contact' || s.hash !== '#contact' || !s.focusedHeading) L.fail(`map travel landed ${JSON.stringify({ id: s.id, hash: s.hash, focus: s.focusedHeading })}`);
    const active = await p.evaluate(() => document.querySelector('.mb-nav__item.is-active span').textContent);
    if (active !== 'Contact') L.fail(`nav shows ${active}`);
    await p.goBack();
    await L.wait(2000);
    if ((await L.current(p)).id !== 'home') L.fail('Back after a map jump did not return Home');
    await openMap(p);
    await pickNode(p, 'Home');
    await L.wait(600);
    if (await mapOpen(p)) L.fail('picking the current universe did not close the map');
    if (await p.evaluate(() => !!document.querySelector('.mb-universe.is-leaving'))) L.fail('picking the current universe started a jump');
    console.log('travel: ok');
    await L.done(p);
  },
  async 'double-pick'(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#skills', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    const before = await p.evaluate(() => history.length);
    await openMap(p);
    await p.evaluate(() => {
      document.querySelector('.mb-map__node[aria-label="Travel to Projects"]').click();
      document.querySelector('.mb-map__node[aria-label="Travel to Contact"]').click();
    });
    await L.wait(2200);
    const s = await L.current(p);
    if (s.id !== 'projects') L.fail(`double pick ended on ${s.id}`);
    // Map open pushes its sheet entry (+1); closing goes Back onto Skills; the jump's push replaces the
    // forward sheet entry. Net +1. A second Back from the double pick would have left us before Skills.
    const after = await p.evaluate(() => history.length);
    if (after !== before + 1) L.fail(`history length ${before} -> ${after} (expected +1)`);
    await p.goBack();
    await L.wait(1500);
    if ((await L.current(p)).id !== 'skills') L.fail('Back after double pick did not return to Skills');
    console.log('double-pick: ok');
    await L.done(p);
  },
  async layout(b) {
    for (const vp of L.VIEWPORTS) {
      const p = await L.openPage(b, vp);
      await p.goto(L.base, { waitUntil: 'networkidle0' });
      await L.wait(900);
      await openMap(p);
      const small = await L.smallTargets(p);
      if (small.length) L.fail(`${vp.width}: small targets ${small.join(' | ')}`);
      if (await L.overflowX(p)) L.fail(`${vp.width}: horizontal overflow with the map open`);
      await p.screenshot({ path: `${L.OUT}/map-${vp.width}x${vp.height}.png` });
      await L.done(p);
    }
    console.log('layout: screenshots in', L.OUT);
  },
});
```

- [ ] **Step 12: Verify.**
  - Run the map tests and the full suite. tsc is clean, and the CI build prints `Compiled successfully.`
  - Serve, then run:
    - `node map-check.js`. Expected: `ALL COSMOS CHECKS PASSED`.
    - `node mh-check.js tour,nav-back,sheet-back`. Expected: `ALL HYPERSPEED CHECKS PASSED`. The tour's small-target check now includes the Map button.
  - Read `cosmos/map-390x844.png` and `cosmos/map-844x390.png`. The map must show the black hole core, six labelled universe objects on a spiral with dotted lanes, and "You are here" on Home, with nothing overlapping or cut off.
- [ ] **Step 13: Stage 2 Lighthouse.** Run the LH command twice and append both lines under `stage 2 (map)`. Stop the server and restore build/.

- [ ] **Step 14: Commit**

```bash
git add src/mobile/objects/Planet.tsx src/mobile/objects/ObjectStage.tsx src/mobile/map/mapLayout.ts src/mobile/map/mapLayout.test.ts src/mobile/map/UniverseGlyph.tsx src/mobile/map/MultiverseMap.tsx src/mobile/Sheet.tsx src/mobile/TopBar.tsx src/mobile/MobileApp.tsx src/mobile/mobile.css
git commit -m "feat(mobile): multiverse map with black hole travel"
```

---

### Task 5: The Orbit | List switch, orbit layouts, and the Skills solar system

**Files:**
- Create:
  - `src/mobile/objects/useViewMode.ts` and `src/mobile/objects/useViewMode.test.ts`
  - `src/mobile/objects/ViewToggle.tsx`
  - `src/mobile/objects/orbitLayouts.ts` and `src/mobile/objects/orbitLayouts.test.ts`
  - `src/mobile/skillColors.ts`
  - `src/mobile/objects/SkillSystem.tsx`
  - `$SCRATCH/shots/skills-check.js`
- Modify: `src/mobile/sections/SkillsSection.tsx`, `src/mobile/useEdgePull.ts`, `src/mobile/useEdgePull.test.ts`, `src/mobile/mobile.css`, `$SCRATCH/shots/mh-check.js` (tour)

**Interfaces:**
- Consumes: `ObjectStage`, `Planet`, the `.mb-orbit*` CSS (Task 4).
- Produces:
  - `type ViewMode = 'orbit' | 'list'`
  - `readViewMode(id, store?)`, `writeViewMode(id, mode, store?)`, `useViewMode(id): [ViewMode, (m: ViewMode) => void]`
  - `ViewToggle({ mode, onChange, label })`, rendering `.mb-viewtoggle` with the buttons "Orbit" and "List"
  - `ringPoints(n, radius, start = -Math.PI / 2): { x; y }[]`
  - `careerPoints(n): { x; y }[]`, where index 0 is the newest job
  - `CAREER_PATH: string`
  - `SKILL_COLORS: Record<SkillGroup, string>`
  - `SkillSystem`
  - shared CSS: `.mb-orbit-view` (stage plus panel layout), `.mb-orbit-panel`, `.mb-orbit__core-label`
  - `.mb-orbit` becomes gesture-exempt

- [ ] **Step 1: Write the failing tests.**

`src/mobile/objects/useViewMode.test.ts`:

```ts
import { readViewMode, writeViewMode } from './useViewMode';

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => (m.has(k) ? m.get(k)! : null), setItem: (k: string, v: string) => void m.set(k, v) };
};

test('defaults to orbit', () => {
  expect(readViewMode('skills', memory())).toBe('orbit');
});

test('remembers the choice per section', () => {
  const s = memory();
  writeViewMode('skills', 'list', s);
  expect(readViewMode('skills', s)).toBe('list');
  expect(readViewMode('work', s)).toBe('orbit');
  expect(s.getItem('mb-view-skills')).toBe('list');
});

test('unknown stored values fall back to orbit', () => {
  const s = memory();
  s.setItem('mb-view-skills', 'grid');
  expect(readViewMode('skills', s)).toBe('orbit');
});

test('blocked or missing storage falls back to orbit and never throws', () => {
  const blocked = {
    getItem: (): string | null => { throw new Error('denied'); },
    setItem: (): void => { throw new Error('denied'); },
  };
  expect(readViewMode('skills', blocked)).toBe('orbit');
  expect(() => writeViewMode('skills', 'list', blocked)).not.toThrow();
  expect(readViewMode('skills', null)).toBe('orbit');
  expect(() => writeViewMode('skills', 'list', null)).not.toThrow();
});
```

`src/mobile/objects/orbitLayouts.test.ts`:

```ts
import { CAREER_PATH, careerPoints, ringPoints } from './orbitLayouts';

test('ringPoints spaces n points evenly, starting at the top', () => {
  const pts = ringPoints(4, 20);
  const expected = [{ x: 50, y: 30 }, { x: 70, y: 50 }, { x: 50, y: 70 }, { x: 30, y: 50 }];
  pts.forEach((p, i) => {
    expect(p.x).toBeCloseTo(expected[i].x);
    expect(p.y).toBeCloseTo(expected[i].y);
  });
  const shifted = ringPoints(1, 10, 0);
  expect(shifted[0].x).toBeCloseTo(60);
  expect(shifted[0].y).toBeCloseTo(50);
});

test('careerPoints run from the oldest job (bottom left) to the newest (top right)', () => {
  const pts = careerPoints(3);
  expect(pts[0].x).toBeCloseTo(84);
  expect(pts[0].y).toBeCloseTo(28);
  expect(pts[1].x).toBeCloseTo(45);
  expect(pts[1].y).toBeCloseTo(37.5);
  expect(pts[2].x).toBeCloseTo(16);
  expect(pts[2].y).toBeCloseTo(78);
  expect(careerPoints(1)[0].x).toBeCloseTo(84);
  expect(CAREER_PATH).toBe('M16 78 Q40 22 84 28');
});
```

In `src/mobile/useEdgePull.test.ts`, add `<div class="mb-orbit"><span id="planet">p</span></div>` inside the `innerHTML` template, and add `'planet'` to the array of ids expected to be exempt.

Run `CI=true npx react-scripts test --watchAll=false src/mobile/objects src/mobile/useEdgePull`. Expected: FAIL. The modules are missing, and `planet` is not exempt.

- [ ] **Step 2: Implement `src/mobile/objects/useViewMode.ts`**

```ts
import { useCallback, useState } from 'react';

export type ViewMode = 'orbit' | 'list';
type ViewStore = Pick<Storage, 'getItem' | 'setItem'>;

const storageKey = (id: string) => `mb-view-${id}`;

function browserStorage(): ViewStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readViewMode(id: string, store: ViewStore | null = browserStorage()): ViewMode {
  try {
    return store && store.getItem(storageKey(id)) === 'list' ? 'list' : 'orbit';
  } catch {
    return 'orbit';
  }
}

export function writeViewMode(id: string, mode: ViewMode, store: ViewStore | null = browserStorage()): void {
  try {
    store?.setItem(storageKey(id), mode);
  } catch {
    // Blocked storage (private mode, policy): the choice just isn't remembered.
  }
}

/** Orbit | List choice for one section, remembered per visitor when storage allows. */
export function useViewMode(id: string): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(() => readViewMode(id));
  const choose = useCallback(
    (next: ViewMode) => {
      setMode(next);
      writeViewMode(id, next);
    },
    [id]
  );
  return [mode, choose];
}
```

- [ ] **Step 3: Implement `src/mobile/objects/orbitLayouts.ts`**

```ts
export interface OrbitPoint { x: number; y: number }

/** n points evenly spaced on a circle of `radius` (percent) around (50, 50), the first at angle `start`. */
export function ringPoints(n: number, radius: number, start = -Math.PI / 2): OrbitPoint[] {
  return Array.from({ length: n }, (_, i) => {
    const a = start + (i / n) * Math.PI * 2;
    return { x: 50 + Math.cos(a) * radius, y: 50 + Math.sin(a) * radius };
  });
}

const A = { x: 16, y: 78 }; // oldest
const C = { x: 40, y: 22 }; // curve control
const B = { x: 84, y: 28 }; // newest
export const CAREER_PATH = `M${A.x} ${A.y} Q${C.x} ${C.y} ${B.x} ${B.y}`;

/** Points along the career curve for n jobs given newest first: index 0 sits at the newest end. */
export function careerPoints(n: number): OrbitPoint[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 1 : 1 - i / (n - 1);
    const u = 1 - t;
    return { x: u * u * A.x + 2 * u * t * C.x + t * t * B.x, y: u * u * A.y + 2 * u * t * C.y + t * t * B.y };
  });
}
```

- [ ] **Step 4: Make orbit stages gesture-exempt.** In `src/mobile/useEdgePull.ts`, change the selector in `isGestureExempt` to `'input, textarea, select, .mb-sheet, .mb-filters, .mb-orbit'`. Run the Step 1 tests. Expected: PASS.

- [ ] **Step 5: Create `src/mobile/skillColors.ts`**

```ts
import { SkillGroup } from '../data/portfolio';

export const SKILL_COLORS: Record<SkillGroup, string> = {
  Frontend: '#38bdf8',
  Backend: '#f97316',
  Database: '#a3e635',
  'Cloud & DevOps': '#c084fc',
  Tools: '#f472b6',
};
```

- [ ] **Step 6: Create `src/mobile/objects/ViewToggle.tsx`**

```tsx
import React from 'react';
import { ViewMode } from './useViewMode';

/** Orbit | List switch. List always shows the plain cards. */
export const ViewToggle: React.FC<{ mode: ViewMode; onChange: (mode: ViewMode) => void; label: string }> = ({ mode, onChange, label }) => (
  <div className="mb-viewtoggle" role="group" aria-label={`${label} view`}>
    <button aria-pressed={mode === 'orbit'} onClick={() => onChange('orbit')}>Orbit</button>
    <button aria-pressed={mode === 'list'} onClick={() => onChange('list')}>List</button>
  </div>
);
```

- [ ] **Step 7: Create `src/mobile/objects/SkillSystem.tsx`**

```tsx
import React, { useState } from 'react';
import { SKILL_GROUPS, SkillGroup, skills } from '../../data/portfolio';
import { SKILL_COLORS } from '../skillColors';
import { ObjectStage } from './ObjectStage';
import { Planet } from './Planet';
import { ringPoints } from './orbitLayouts';

const RADII = [18, 24, 30, 36, 42];
const PERIODS = [38, 52, 66, 84, 104];

/** Skills as a solar system: one planet per skill group on its own orbit; the panel lists the selected group. */
export const SkillSystem: React.FC = () => {
  const [selected, setSelected] = useState<SkillGroup>(SKILL_GROUPS[0]);
  return (
    <div className="mb-orbit-view">
      <ObjectStage label="Skills solar system" className="mb-skills-orbit">
        <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
          {RADII.map((r) => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
          ))}
          <circle cx="50" cy="50" r="13" fill="#ffb347" opacity="0.18" />
          <g transform="translate(50 50)">
            <Planet r={8} color="#ffb347" />
          </g>
        </svg>
        <span className="mb-orbit__core-label" aria-hidden="true">Skills</span>
        {SKILL_GROUPS.map((g, i) => {
          const p = ringPoints(SKILL_GROUPS.length, RADII[i])[i];
          return (
            <div key={g} className="mb-orbit__ring" style={{ '--period': `${PERIODS[i]}s` } as React.CSSProperties}>
              <button
                className={`mb-orbit__node${g === selected ? ' is-selected' : ''}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, '--glow': SKILL_COLORS[g] } as React.CSSProperties}
                aria-label={`${g} skills`}
                aria-pressed={g === selected}
                onClick={() => setSelected(g)}
              >
                <span className="mb-orbit__upright">
                  <svg className="mb-orbit__glyph" width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true">
                    <Planet r={9} color={SKILL_COLORS[g]} ring={g === 'Cloud & DevOps'} />
                  </svg>
                  {g === selected && <span className="mb-orbit__label">{g}</span>}
                </span>
              </button>
            </div>
          );
        })}
      </ObjectStage>
      <div className="mb-card mb-orbit-panel" aria-live="polite">
        <h3 className="mb-skill-group__title">
          <span className="mb-dot" style={{ background: SKILL_COLORS[selected], boxShadow: `0 0 8px ${SKILL_COLORS[selected]}` }} />
          {selected}
        </h3>
        <div className="mb-chips">
          {skills.filter((s) => s.group === selected).map((s) => (
            <span key={s.name} className="mb-chip">{s.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 8: Replace `src/mobile/sections/SkillsSection.tsx`**

```tsx
import React from 'react';
import { SKILL_GROUPS, skills } from '../../data/portfolio';
import { SectionHeading } from '../SectionHeading';
import { SKILL_COLORS } from '../skillColors';
import { SkillSystem } from '../objects/SkillSystem';
import { ViewToggle } from '../objects/ViewToggle';
import { useViewMode } from '../objects/useViewMode';
import { SectionProps } from './registry';

const SkillList: React.FC = () => (
  <>
    {SKILL_GROUPS.map((g) => (
      <div key={g} className="mb-skill-group" data-reveal>
        <h3 className="mb-skill-group__title">
          <span className="mb-dot" style={{ background: SKILL_COLORS[g], boxShadow: `0 0 8px ${SKILL_COLORS[g]}` }} />
          {g}
        </h3>
        <div className="mb-chips">
          {skills.filter((s) => s.group === g).map((s) => (
            <span key={s.name} className="mb-chip">{s.name}</span>
          ))}
        </div>
      </div>
    ))}
  </>
);

export const SkillsSection: React.FC<SectionProps> = () => {
  const [mode, setMode] = useViewMode('skills');
  return (
    <div>
      <SectionHeading kicker="Technical Skills" title="My Tech Belt" />
      <ViewToggle mode={mode} onChange={setMode} label="Skills" />
      {mode === 'orbit' ? <SkillSystem /> : <SkillList />}
    </div>
  );
};
```

- [ ] **Step 9: Append to `src/mobile/mobile.css`**

```css
/* ---------- orbit | list ---------- */
.mb-viewtoggle {
  display: inline-flex; gap: 4px; padding: 4px; margin: 0 0 12px; border-radius: 999px;
  border: 1px solid var(--border); background: rgba(255, 255, 255, 0.04);
}
.mb-viewtoggle button {
  min-height: 44px; min-width: 76px; padding: 0 16px; border-radius: 999px; border: 0; background: none;
  color: var(--muted); font: inherit; font-size: 0.85rem; cursor: pointer;
}
.mb-viewtoggle button[aria-pressed='true'] { background: rgba(255, 255, 255, 0.14); color: #fff; box-shadow: inset 0 0 0 1px var(--accent); }
.mb-orbit-view { display: grid; gap: 16px; }
@media (min-width: 700px), (orientation: landscape) and (min-width: 560px) {
  .mb-orbit-view { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; }
}
.mb-orbit-panel { position: relative; z-index: 1; }
.mb-orbit__core-label {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, 26px); pointer-events: none;
  font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted);
}
```

- [ ] **Step 10: Patch the `tour` scenario in `$SCRATCH/shots/mh-check.js`.** Orbit views show one item at a time, so the tour checks content needles in List view. Replace this exact line:

```js
        NEEDLES[id].filter((n) => !s.text.includes(n)).forEach((n) => fail(`${vp.width} ${id}: missing "${n}"`));
```

with:

```js
        // Orbit views show one item at a time; content needles are checked in List view.
        await p.evaluate(() => { const t = [...document.querySelectorAll('.mb-universe:not(.is-leaving) .mb-viewtoggle button')].find((x) => x.textContent === 'List'); if (t) t.click(); });
        await wait(150);
        const listText = (await state(p)).text;
        NEEDLES[id].filter((n) => !listText.includes(n)).forEach((n) => fail(`${vp.width} ${id}: missing "${n}"`));
```

- [ ] **Step 11: Create `$SCRATCH/shots/skills-check.js`**

```js
const L = require('./cosmos-lib');
const panel = (p) => p.evaluate(() => document.querySelector('.mb-universe:not(.is-leaving) .mb-orbit-panel').innerText);

L.run({
  async orbit(b) {
    for (const vp of L.VIEWPORTS) {
      const p = await L.openPage(b, vp);
      await p.goto(L.base + '#skills', { waitUntil: 'networkidle0' });
      await L.wait(1000);
      const pressed = await p.evaluate(() => [...document.querySelectorAll('.mb-viewtoggle button')].map((x) => `${x.textContent}:${x.getAttribute('aria-pressed')}`).join(','));
      if (pressed !== 'Orbit:true,List:false') L.fail(`${vp.width}: toggle ${pressed}`);
      if ((await p.$$('.mb-skills-orbit .mb-orbit__node')).length !== 5) L.fail(`${vp.width}: expected 5 planets`);
      if (!(await panel(p)).includes('Frontend')) L.fail(`${vp.width}: first group not selected`);
      await p.evaluate(() => document.querySelector('.mb-orbit__node[aria-label="Backend skills"]').click());
      await L.wait(200);
      if (!(await panel(p)).includes('Middleware Serverless REST API')) L.fail(`${vp.width}: Backend planet did not show its skills`);
      const small = await L.smallTargets(p);
      if (small.length) L.fail(`${vp.width}: small targets ${small.join(' | ')}`);
      if (await L.overflowX(p)) L.fail(`${vp.width}: horizontal overflow`);
      await p.screenshot({ path: `${L.OUT}/skills-${vp.width}x${vp.height}.png` });
      await L.done(p);
    }
    console.log('orbit: ok');
  },
  async held(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#skills', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    const box = await (await p.$('.mb-skills-orbit')).boundingBox();
    await p.touchscreen.touchStart(box.x + box.width / 2, box.y + box.height / 2);
    await L.wait(100);
    const held = await p.evaluate(() => document.querySelector('.mb-skills-orbit').classList.contains('is-held'));
    await p.touchscreen.touchEnd();
    await L.wait(100);
    const released = await p.evaluate(() => !document.querySelector('.mb-skills-orbit').classList.contains('is-held'));
    if (!held || !released) L.fail(`held=${held} released=${released}`);
    console.log('held: ok');
    await L.done(p);
  },
  async list(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#skills', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    await p.evaluate(() => [...document.querySelectorAll('.mb-viewtoggle button')].find((x) => x.textContent === 'List').click());
    await L.wait(200);
    if ((await p.$$('.mb-skill-group')).length !== 5) L.fail('List did not show 5 skill groups');
    await p.reload({ waitUntil: 'networkidle0' });
    await L.wait(1000);
    if ((await p.$$('.mb-skill-group')).length !== 5) L.fail('List choice was not remembered after reload');
    console.log('list: ok');
    await L.done(p);
  },
});
```

- [ ] **Step 12: Verify.**
  - Run the full tests, tsc and the CI build (`Compiled successfully.`).
  - Serve, then run `node skills-check.js` and `node mh-check.js tour,swipe,deeplink`. Both must report all passed.
  - Read `cosmos/skills-390x844.png` and `cosmos/skills-844x390.png`. Expect: a sun with 5 coloured, shaded planets on orbits; the selected planet glows with its name; the panel lists that group's chips. In landscape, the stage and panel sit side by side.
  - Stop the server and restore build/.

- [ ] **Step 13: Commit**

```bash
git add src/mobile/objects/useViewMode.ts src/mobile/objects/useViewMode.test.ts src/mobile/objects/ViewToggle.tsx src/mobile/objects/orbitLayouts.ts src/mobile/objects/orbitLayouts.test.ts src/mobile/skillColors.ts src/mobile/objects/SkillSystem.tsx src/mobile/sections/SkillsSection.tsx src/mobile/useEdgePull.ts src/mobile/useEdgePull.test.ts src/mobile/mobile.css
git commit -m "feat(mobile): Orbit/List switch and the Skills solar system"
```

---

### Task 6: The Project Galaxy

**Files:**
- Create:
  - `src/mobile/objects/galaxyLayout.ts` and `src/mobile/objects/galaxyLayout.test.ts`
  - `src/mobile/objects/ProjectGalaxy.tsx`
  - `$SCRATCH/shots/galaxy-check.js`
- Modify: `src/mobile/sections/ProjectsSection.tsx`, `src/mobile/mobile.css`

**Interfaces:**
- Consumes: `ObjectStage` (Task 4); `useViewMode`, `ViewToggle`, and the `.mb-orbit-view` / `.mb-orbit-panel` CSS (Task 5); `filterProjects`, `topTech`, `ProjectFilter` from `projectFilter.ts`.
- Produces:
  - `GalaxyStar { title; arm; featured; x; y; r }`
  - `ARM_COLORS`
  - `armPoint(arm, t)`, `armPath(arm)`
  - `galaxyLayout(items)`
  - `nearestStar(points, x, y, maxDist): number` (returns -1 when none is in range; on a tie the first wins)
  - `ProjectGalaxy({ filter, onDetails })`

- [ ] **Step 1: Write the failing test** `src/mobile/objects/galaxyLayout.test.ts`:

```ts
import { CONSTELLATIONS, projects } from '../../data/portfolio';
import { filterProjects } from '../projectFilter';
import { galaxyLayout, nearestStar } from './galaxyLayout';

const stars = galaxyLayout(projects);

test('every project is a star on its category arm', () => {
  expect(stars).toHaveLength(23);
  const count = (arm: string) => stars.filter((s) => s.arm === arm).length;
  expect(CONSTELLATIONS.map(count)).toEqual([2, 4, 4, 13]);
  stars.forEach((s) => {
    expect(s.x - s.r).toBeGreaterThanOrEqual(5);
    expect(s.x + s.r).toBeLessThanOrEqual(95);
    expect(s.y - s.r).toBeGreaterThanOrEqual(5);
    expect(s.y + s.r).toBeLessThanOrEqual(95);
  });
});

test('each arm runs newest first from the core outward; featured stars are bigger', () => {
  for (const arm of CONSTELLATIONS) {
    const onArm = stars.filter((s) => s.arm === arm);
    expect(onArm.map((s) => s.title)).toEqual(filterProjects(projects, arm).map((p) => p.title));
    const radii = onArm.map((s) => Math.hypot(s.x - 50, s.y - 50));
    for (let i = 1; i < radii.length; i++) expect(radii[i]).toBeGreaterThan(radii[i - 1]);
  }
  stars.forEach((s) => expect(s.r).toBe(s.featured ? 2.6 : 1.6));
});

test('nearestStar picks the closest star in range', () => {
  const pts = [{ x: 10, y: 10 }, { x: 20, y: 10 }, { x: 15, y: 10 }];
  expect(nearestStar(pts, 11, 10, 5)).toBe(0);
  expect(nearestStar(pts, 16, 11, 5)).toBe(2);
  expect(nearestStar(pts, 50, 50, 5)).toBe(-1);
  expect(nearestStar([{ x: 0, y: 0 }, { x: 2, y: 0 }], 1, 0, 5)).toBe(0);
  expect(nearestStar([], 1, 1, 5)).toBe(-1);
});
```

Run `CI=true npx react-scripts test --watchAll=false src/mobile/objects/galaxyLayout`. Expected: FAIL.

- [ ] **Step 2: Implement `src/mobile/objects/galaxyLayout.ts`**

```ts
import { CONSTELLATIONS, Constellation, Project, newestFirst } from '../../data/portfolio';

export interface GalaxyStar { title: string; arm: Constellation; featured: boolean; x: number; y: number; r: number }

export const ARM_COLORS: Record<Constellation, string> = {
  'CRM Platforms': '#f97316',
  'Salesforce Portals': '#38bdf8',
  'Real Estate': '#a3e635',
  'Web Apps': '#c084fc',
};
const ARM_START: Record<Constellation, number> = {
  'CRM Platforms': 0,
  'Salesforce Portals': Math.PI / 2,
  'Real Estate': Math.PI,
  'Web Apps': (3 * Math.PI) / 2,
};
const ARM_TWIST = 2.2;
const INNER = 10;
const OUTER = 42;

/** Point at t (0 = core end, 1 = outer end) along an arm, in percent of the square galaxy. */
export function armPoint(arm: Constellation, t: number): { x: number; y: number } {
  const r = INNER + t * (OUTER - INNER);
  const a = ARM_START[arm] + t * ARM_TWIST;
  return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
}

export function armPath(arm: Constellation): string {
  const pts = Array.from({ length: 25 }, (_, i) => armPoint(arm, i / 24));
  return `M${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')}`;
}

/** One star per project on its category's arm, newest nearest the core; featured stars are larger. */
export function galaxyLayout(items: readonly Project[]): GalaxyStar[] {
  const ordered = newestFirst(items);
  const stars: GalaxyStar[] = [];
  for (const arm of CONSTELLATIONS) {
    const onArm = ordered.filter((p) => p.constellation === arm);
    onArm.forEach((p, i) => {
      const t = onArm.length === 1 ? 0.5 : i / (onArm.length - 1);
      stars.push({ title: p.title, arm, featured: !!p.featured, ...armPoint(arm, t), r: p.featured ? 2.6 : 1.6 });
    });
  }
  return stars;
}

/** Index of the point nearest (x, y) within maxDist, or -1. Ties keep the first. */
export function nearestStar(points: readonly { x: number; y: number }[], x: number, y: number, maxDist: number): number {
  let best = -1;
  let bestDist = Infinity;
  points.forEach((p, i) => {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d <= maxDist && d < bestDist) {
      best = i;
      bestDist = d;
    }
  });
  return best;
}
```

Run the test. Expected: PASS.

- [ ] **Step 3: Create `src/mobile/objects/ProjectGalaxy.tsx`**

```tsx
import React, { useMemo, useState } from 'react';
import { CONSTELLATIONS, Project, projects } from '../../data/portfolio';
import { ProjectFilter, filterProjects, topTech } from '../projectFilter';
import { ObjectStage } from './ObjectStage';
import { ARM_COLORS, armPath, galaxyLayout, nearestStar } from './galaxyLayout';

const STARS = galaxyLayout(projects);
const TAP_RADIUS_PX = 40;

/** Projects as a spiral galaxy: tap near a star (or step with ◀ ▶) to show its card; Details opens the sheet. */
export const ProjectGalaxy: React.FC<{ filter: ProjectFilter; onDetails: (p: Project) => void }> = ({ filter, onDetails }) => {
  const order = useMemo(() => filterProjects(projects, filter), [filter]);
  const visible = useMemo(() => (filter === 'All' ? STARS : STARS.filter((s) => s.arm === filter)), [filter]);
  const [picked, setPicked] = useState(order[0].title);
  // A filter change can hide the picked star; fall back to the newest visible project.
  const title = order.some((p) => p.title === picked) ? picked : order[0].title;
  const pos = order.findIndex((p) => p.title === title);
  const project = order[pos];
  const sel = STARS.find((s) => s.title === title)!;
  const step = (d: number) => setPicked(order[(pos + d + order.length) % order.length].title);
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const i = nearestStar(visible, x, y, (TAP_RADIUS_PX / rect.width) * 100);
    if (i >= 0) setPicked(visible[i].title);
  };
  return (
    <div className="mb-orbit-view">
      <div>
        <ObjectStage label="Project galaxy" className="mb-galaxy">
          <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="9" fill="#ffd6a8" opacity="0.25" />
            <circle cx="50" cy="50" r="3.5" fill="#ffffff" opacity="0.9" />
            {CONSTELLATIONS.map((arm) => (
              <path key={arm} d={armPath(arm)} fill="none" stroke={ARM_COLORS[arm]} strokeWidth="5" strokeLinecap="round" opacity={filter === 'All' || filter === arm ? 0.22 : 0.06} />
            ))}
            {STARS.map((s) => {
              const dim = filter !== 'All' && s.arm !== filter;
              return (
                <circle key={s.title} className={`mb-galaxy__star${dim ? ' is-dim' : ''}`} data-title={s.title} cx={s.x} cy={s.y} r={s.r}
                  fill={s.featured ? '#ffffff' : ARM_COLORS[s.arm]} opacity={dim ? 0.2 : 1} />
              );
            })}
            <circle cx={sel.x} cy={sel.y} r={sel.r + 2.4} fill="none" stroke="#ffffff" strokeWidth="0.6" />
          </svg>
          <div className="mb-galaxy__hit" onClick={onTap} aria-hidden="true" />
          <span className="mb-galaxy__tag" style={{ left: `${Math.min(78, Math.max(22, sel.x))}%`, top: `${sel.y}%` }} aria-hidden="true">{sel.title}</span>
        </ObjectStage>
        <div className="mb-galaxy__nav">
          <button className="mb-btn mb-btn--ghost" aria-label="Previous project" onClick={() => step(-1)}>◀</button>
          <span className="mb-galaxy__count">{pos + 1} / {order.length}</span>
          <button className="mb-btn mb-btn--ghost" aria-label="Next project" onClick={() => step(1)}>▶</button>
        </div>
      </div>
      <div className="mb-card mb-project mb-orbit-panel" aria-live="polite">
        <h3 className="mb-project__title">
          {project.title}
          {project.featured && <span className="mb-star" role="img" aria-label="Featured">★</span>}
        </h3>
        <p className="mb-text">{project.shortDescription}</p>
        <div className="mb-chips">
          {topTech(project).map((t) => (
            <span key={t} className="mb-chip">{t}</span>
          ))}
        </div>
        <div className="mb-project__actions">
          {project.demoUrl && <a className="mb-btn" aria-label={`Live demo: ${project.title}`} href={project.demoUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}
          <button className="mb-btn mb-btn--ghost" aria-label={`Details: ${project.title}`} onClick={() => onDetails(project)}>Details</button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Update `src/mobile/sections/ProjectsSection.tsx`.** Re-read it first.
  - Add the imports:

```tsx
import { ProjectGalaxy } from '../objects/ProjectGalaxy';
import { ViewToggle } from '../objects/ViewToggle';
import { useViewMode } from '../objects/useViewMode';
```

  - Inside `ProjectsSection`, add `const [mode, setMode] = useViewMode('projects');` as the first hook.
  - Insert `<ViewToggle mode={mode} onChange={setMode} label="Projects" />` right after `<SectionHeading … />`. The filter chips stay as they are, below it.
  - Wrap the existing `<ul className="mb-projects" …>…</ul>` and the "Show all" button block in the List branch, so the JSX between the filters and the `<Sheet>` becomes:

```tsx
      {mode === 'orbit' ? (
        <ProjectGalaxy filter={filter} onDetails={setOpen} />
      ) : (
        <>
          {/* the existing <ul className="mb-projects" …> … </ul> and the "Show all" button, unchanged */}
        </>
      )}
```

  Move the existing elements into that fragment verbatim. Don't retype them.

- [ ] **Step 5: Append to `src/mobile/mobile.css`**

```css
/* ---------- project galaxy ---------- */
.mb-galaxy__hit { position: absolute; inset: 0; cursor: pointer; }
.mb-galaxy__tag {
  position: absolute; transform: translate(-50%, calc(-100% - 12px)); pointer-events: none; white-space: nowrap;
  max-width: 60%; overflow: hidden; text-overflow: ellipsis;
  padding: 3px 8px; border-radius: 999px; font-size: 0.7rem; background: rgba(8, 8, 14, 0.85); border: 1px solid var(--border);
}
.mb-galaxy__nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: -4px; }
.mb-galaxy__nav .mb-btn { min-width: 44px; min-height: 44px; padding: 0 14px; }
.mb-galaxy__count { font-size: 0.85rem; color: var(--muted); min-width: 56px; text-align: center; }
```

- [ ] **Step 6: Create `$SCRATCH/shots/galaxy-check.js`**

```js
const L = require('./cosmos-lib');
const panelTitle = (p) => p.evaluate(() => document.querySelector('.mb-universe:not(.is-leaving) .mb-orbit-panel .mb-project__title').childNodes[0].textContent.trim());

L.run({
  async galaxy(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#projects', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    if ((await p.$$('.mb-galaxy__star')).length !== 23) L.fail('expected 23 stars');
    const first = await panelTitle(p);
    await p.click('[aria-label="Next project"]');
    await L.wait(150);
    const second = await panelTitle(p);
    if (second === first) L.fail('▶ did not move to another project');
    await p.click('[aria-label="Previous project"]');
    await L.wait(150);
    if ((await panelTitle(p)) !== first) L.fail('◀ did not return');
    // Tap the centre of a specific star: that project must be selected.
    const target = await p.evaluate(() => {
      const s = [...document.querySelectorAll('.mb-galaxy__star')][7];
      const r = s.getBoundingClientRect();
      return { title: s.getAttribute('data-title'), x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await p.mouse.click(target.x, target.y);
    await L.wait(150);
    if ((await panelTitle(p)) !== target.title) L.fail(`tapping a star selected "${await panelTitle(p)}", expected "${target.title}"`);
    // Filter to one arm.
    await p.evaluate(() => [...document.querySelectorAll('.mb-filter')].find((x) => x.textContent === 'Salesforce').click());
    await L.wait(150);
    const bright = await p.$$eval('.mb-galaxy__star:not(.is-dim)', (els) => els.length);
    if (bright !== 4) L.fail(`Salesforce filter lit ${bright} stars`);
    const count = await p.$eval('.mb-galaxy__count', (e) => e.textContent);
    if (count !== '1 / 4') L.fail(`Salesforce counter ${count}`);
    // Details opens the existing sheet; Back closes it.
    await p.evaluate(() => document.querySelector('.mb-orbit-panel [aria-label^="Details:"]').click());
    await L.wait(450);
    if (!(await p.$('.mb-sheet .mb-details'))) L.fail('Details sheet did not open');
    await p.goBack();
    await L.wait(500);
    if (await p.$('.mb-sheet')) L.fail('Back did not close the Details sheet');
    if ((await L.current(p)).id !== 'projects') L.fail('Back from Details left Projects');
    console.log('galaxy: ok');
    await L.done(p);
  },
  async viewports(b) {
    for (const vp of L.VIEWPORTS) {
      const p = await L.openPage(b, vp);
      await p.goto(L.base + '#projects', { waitUntil: 'networkidle0' });
      await L.wait(1000);
      const small = await L.smallTargets(p);
      if (small.length) L.fail(`${vp.width}: small targets ${small.join(' | ')}`);
      if (await L.overflowX(p)) L.fail(`${vp.width}: horizontal overflow`);
      await p.screenshot({ path: `${L.OUT}/galaxy-${vp.width}x${vp.height}.png` });
      await L.done(p);
    }
    console.log('viewports: ok');
  },
  async list(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#projects', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    await p.evaluate(() => [...document.querySelectorAll('.mb-viewtoggle button')].find((x) => x.textContent === 'List').click());
    await L.wait(200);
    if ((await p.$$('.mb-projects .mb-project')).length !== 6) L.fail('List did not show the first 6 project cards');
    console.log('list: ok');
    await L.done(p);
  },
});
```

- [ ] **Step 7: Verify.**
  - Run the full tests, tsc and the CI build (`Compiled successfully.`).
  - Serve, then run `node galaxy-check.js` and `node mh-check.js tour,sheet-back`. Both must report all passed.
  - Read `cosmos/galaxy-390x844.png` and `cosmos/galaxy-844x390.png`. Expect: a 4-arm coloured spiral with a bright core, 23 stars (featured ones bigger and white), the selected star ringed with a title tag, ◀ n / 23 ▶, and the project card.
  - Stop the server and restore build/.

- [ ] **Step 8: Commit**

```bash
git add src/mobile/objects/galaxyLayout.ts src/mobile/objects/galaxyLayout.test.ts src/mobile/objects/ProjectGalaxy.tsx src/mobile/sections/ProjectsSection.tsx src/mobile/mobile.css
git commit -m "feat(mobile): Project Galaxy object view"
```

---

### Task 7: Career Path (Work) and Origin System (About); stage-3 Lighthouse

**Files:**
- Create:
  - `src/mobile/sections/Job.tsx`
  - `src/mobile/objects/CareerPath.tsx`
  - `src/mobile/objects/OriginSystem.tsx`
  - `$SCRATCH/shots/origin-check.js`
- Modify: `src/mobile/sections/WorkSection.tsx`, `src/mobile/sections/AboutSection.tsx`, `src/mobile/mobile.css`

**Interfaces:**
- Consumes:
  - `ObjectStage({ id })`, `Planet` (Task 4)
  - `ringPoints`, `careerPoints`, `CAREER_PATH`, `useViewMode`, `ViewToggle` (Task 5)
  - `PALETTES` from `../../multiverse/fx/palettes`
- Produces:
  - `Job({ index })`, moved from WorkSection unchanged
  - `CareerPath`
  - `OriginSystem({ onViewCert })`: its stage carries `id="certifications"`

- [ ] **Step 1: Move `Job` into `src/mobile/sections/Job.tsx`.**
  - Create the file with the `Job` component cut verbatim from `WorkSection.tsx` and exported: `export const Job: React.FC<{ index: number }> = …`.
  - It needs these imports: `React, { useState }` from 'react', `experience` from '../../data/portfolio', and `hasHiddenBullets, visibleBullets` from '../bullets'.

- [ ] **Step 2: Create `src/mobile/objects/CareerPath.tsx`**

```tsx
import React, { useState } from 'react';
import { experience } from '../../data/portfolio';
import { Job } from '../sections/Job';
import { ObjectStage } from './ObjectStage';
import { Planet } from './Planet';
import { CAREER_PATH, careerPoints } from './orbitLayouts';

const POINTS = careerPoints(experience.length);
const COLORS = ['#ffb347', '#7dd3fc', '#c4b5fd'];
const colorOf = (i: number) => COLORS[i % COLORS.length];

/** Jobs as planets along a flight path, oldest to newest; a ship marks the current job. */
export const CareerPath: React.FC = () => {
  const [selected, setSelected] = useState(0);
  const ship = POINTS[0];
  return (
    <div className="mb-orbit-view">
      <ObjectStage label="Career path" className="mb-career">
        <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
          <path d={CAREER_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
          <path d="M0,-3 L2.2,2.5 L0,1.2 L-2.2,2.5 Z" fill="#ffffff" transform={`translate(${ship.x + 7} ${ship.y - 9}) rotate(40)`} />
        </svg>
        {experience.map((job, i) => (
          <button
            key={job.company}
            className={`mb-orbit__node${i === selected ? ' is-selected' : ''}`}
            style={{ left: `${POINTS[i].x}%`, top: `${POINTS[i].y}%`, '--glow': colorOf(i) } as React.CSSProperties}
            aria-label={`${job.role} at ${job.company}`}
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
          >
            <span className="mb-orbit__upright">
              <svg className="mb-orbit__glyph" width={i === 0 ? 40 : 32} height={i === 0 ? 40 : 32} viewBox="-16 -16 32 32" aria-hidden="true">
                <Planet r={i === 0 ? 13 : 10} color={colorOf(i)} />
              </svg>
              <span className="mb-orbit__label">{job.company}</span>
            </span>
          </button>
        ))}
      </ObjectStage>
      <ol className="mb-jobs mb-card mb-orbit-panel" aria-live="polite">
        <Job key={selected} index={selected} />
      </ol>
    </div>
  );
};
```

- [ ] **Step 3: Create `src/mobile/objects/OriginSystem.tsx`**

```tsx
import React, { useState } from 'react';
import { certifications, education } from '../../data/portfolio';
import { PALETTES } from '../../multiverse/fx/palettes';
import { ObjectStage } from './ObjectStage';
import { Planet } from './Planet';
import { ringPoints } from './orbitLayouts';

type Selection = { kind: 'edu' | 'cert'; i: number };

const EDU = ringPoints(education.length, 22);
const CERTS = ringPoints(certifications.length, 40, -Math.PI / 4);

/** Education as moons and certifications as satellites around a home planet. #certifications selects the first certificate. */
export const OriginSystem: React.FC<{ onViewCert: (index: number) => void }> = ({ onViewCert }) => {
  const [sel, setSel] = useState<Selection>(() => (window.location.hash === '#certifications' ? { kind: 'cert', i: 0 } : { kind: 'edu', i: 0 }));
  const isSel = (kind: Selection['kind'], i: number) => sel.kind === kind && sel.i === i;
  const edu = education[sel.i];
  const cert = certifications[sel.i];
  return (
    <div className="mb-orbit-view">
      <ObjectStage label="Origin system: education and certifications" className="mb-origin" id="certifications">
        <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.3" strokeDasharray="1 1.5" />
          <g transform="translate(50 50)">
            <Planet r={10} color={PALETTES.about.atmos} />
          </g>
        </svg>
        <div className="mb-orbit__ring" style={{ '--period': '90s' } as React.CSSProperties}>
          {education.map((e, i) => (
            <button
              key={e.years}
              className={`mb-orbit__node${isSel('edu', i) ? ' is-selected' : ''}`}
              style={{ left: `${EDU[i].x}%`, top: `${EDU[i].y}%`, '--glow': '#e2e8f0' } as React.CSSProperties}
              aria-label={`Education: ${e.title}, ${e.years}`}
              aria-pressed={isSel('edu', i)}
              onClick={() => setSel({ kind: 'edu', i })}
            >
              <span className="mb-orbit__upright">
                <svg className="mb-orbit__glyph" width="22" height="22" viewBox="-11 -11 22 22" aria-hidden="true">
                  <Planet r={7} color="#cbd5e1" />
                </svg>
                <span className="mb-orbit__label">{e.years.slice(0, 4)}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mb-orbit__ring" style={{ '--period': '140s' } as React.CSSProperties}>
          {certifications.map((c, i) => (
            <button
              key={c.title}
              className={`mb-orbit__node${isSel('cert', i) ? ' is-selected' : ''}`}
              style={{ left: `${CERTS[i].x}%`, top: `${CERTS[i].y}%`, '--glow': '#ffb347' } as React.CSSProperties}
              aria-label={`Certification: ${c.title}`}
              aria-pressed={isSel('cert', i)}
              onClick={() => setSel({ kind: 'cert', i })}
            >
              <span className="mb-orbit__upright">
                <svg className="mb-orbit__glyph" width="26" height="26" viewBox="-13 -13 26 26" aria-hidden="true">
                  <rect x="-3.5" y="-3.5" width="7" height="7" rx="1.5" fill="#ffb347" />
                  <rect x="-12" y="-2" width="7" height="4" fill="#7dd3fc" opacity="0.85" />
                  <rect x="5" y="-2" width="7" height="4" fill="#7dd3fc" opacity="0.85" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </ObjectStage>
      {sel.kind === 'edu' ? (
        <div className="mb-card mb-orbit-panel mb-origin__panel" aria-live="polite">
          <span className="mb-kicker">Education</span>
          <span className="mb-timeline__years">{edu.years}</span>
          <strong>{edu.title}</strong>
          <span className="mb-timeline__place">{edu.school}</span>
        </div>
      ) : (
        <div className="mb-card mb-cert mb-orbit-panel" aria-live="polite">
          <div>
            <span className="mb-kicker">Certification</span>
            <strong>{cert.title}</strong>
            <span>{cert.provider}</span>
          </div>
          <button className="mb-btn mb-btn--ghost" onClick={() => onViewCert(sel.i)}>View</button>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 4: Replace `src/mobile/sections/WorkSection.tsx`**

```tsx
import React from 'react';
import { experience } from '../../data/portfolio';
import { SectionHeading } from '../SectionHeading';
import { CareerPath } from '../objects/CareerPath';
import { ViewToggle } from '../objects/ViewToggle';
import { useViewMode } from '../objects/useViewMode';
import { Job } from './Job';
import { SectionProps } from './registry';

export const WorkSection: React.FC<SectionProps> = () => {
  const [mode, setMode] = useViewMode('work');
  return (
    <div>
      <SectionHeading kicker="Work Experience" title="Career Galaxy" />
      <ViewToggle mode={mode} onChange={setMode} label="Work" />
      {mode === 'orbit' ? (
        <CareerPath />
      ) : (
        <ol className="mb-timeline mb-jobs">
          {experience.map((j, i) => (
            <Job key={j.company} index={i} />
          ))}
        </ol>
      )}
    </div>
  );
};
```

- [ ] **Step 5: Update `src/mobile/sections/AboutSection.tsx`.** Re-read it first.
  - Add the imports `OriginSystem` from '../objects/OriginSystem', `ViewToggle` from '../objects/ViewToggle', and `useViewMode` from '../objects/useViewMode'.
  - In `AboutSection`, add `const [mode, setMode] = useViewMode('about');`.
  - Keep the `SectionHeading` and the summary `<p className="mb-card mb-text" …>`.
  - After the summary, insert `<ViewToggle mode={mode} onChange={setMode} label="About" />` (it needs a top margin; see the CSS).
  - Wrap the existing Education `<h3>`, `<ol className="mb-timeline">…</ol>`, Certifications `<h3 id="certifications">` and `<ul className="mb-certs">…</ul>` verbatim in the List branch:

```tsx
      {mode === 'orbit' ? (
        <OriginSystem onViewCert={setOpenCert} />
      ) : (
        <>
          {/* existing Education h3 + ol, Certifications h3#certifications + ul, unchanged */}
        </>
      )}
```

  - The certificate `<Sheet>` stays where it is, after the branch.

- [ ] **Step 6: Append to `src/mobile/mobile.css`**

```css
/* ---------- career path & origin system ---------- */
.mb-orbit-panel.mb-jobs { list-style: none; margin: 0; }
.mb-origin__panel { display: flex; flex-direction: column; gap: 4px; }
.mb-card + .mb-viewtoggle { margin-top: 20px; }
```

- [ ] **Step 7: Create `$SCRATCH/shots/origin-check.js`**

```js
const L = require('./cosmos-lib');
const panel = (p) => p.evaluate(() => document.querySelector('.mb-universe:not(.is-leaving) .mb-orbit-panel').innerText);
const chooseList = (p) => p.evaluate(() => [...document.querySelectorAll('.mb-viewtoggle button')].find((x) => x.textContent === 'List').click());

L.run({
  async career(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#work', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    if ((await p.$$('.mb-career .mb-orbit__node')).length !== 3) L.fail('expected 3 job planets');
    if (!(await panel(p)).includes('Realatte')) L.fail('current job (Realatte) not selected by default');
    await p.evaluate(() => [...document.querySelectorAll('.mb-career .mb-orbit__node')].find((x) => x.getAttribute('aria-label').includes('Entrance1.com')).click());
    await L.wait(150);
    if (!(await panel(p)).includes('Entrance1.com')) L.fail('Entrance1.com planet did not show its job');
    const more = await p.$('.mb-orbit-panel .mb-link');
    if (more) {
      await more.click();
      await L.wait(100);
      if ((await p.$eval('.mb-orbit-panel .mb-link', (e) => e.getAttribute('aria-expanded'))) !== 'true') L.fail('Show more did not expand');
    }
    console.log('career: ok');
    await L.done(p);
  },
  async origin(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#about', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    if ((await p.$$('.mb-origin .mb-orbit__node')).length !== 8) L.fail('expected 4 moons + 4 satellites');
    if (!(await panel(p)).includes('2022 - 2023')) L.fail('latest education not selected by default');
    await p.evaluate(() => document.querySelector('.mb-orbit__node[aria-label="Certification: ReactJS"]').click());
    await L.wait(150);
    if (!(await panel(p)).includes('ReactJS')) L.fail('ReactJS satellite did not show its certificate');
    await p.evaluate(() => [...document.querySelectorAll('.mb-orbit-panel button')].find((x) => x.textContent === 'View').click());
    await L.wait(500);
    if (!(await p.$('.mb-sheet .mb-cert-viewer img'))) L.fail('View did not open the certificate viewer');
    await p.goBack();
    await L.wait(500);
    if (await p.$('.mb-sheet')) L.fail('Back did not close the viewer');
    console.log('origin: ok');
    await L.done(p);
  },
  async 'cert-link-orbit'(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#certifications', { waitUntil: 'networkidle0' });
    await L.wait(1200);
    if (!(await panel(p)).includes('HTML5 Application Development Fundamentals')) L.fail('#certifications did not select the first certificate');
    const top = await p.evaluate(() => document.getElementById('certifications').getBoundingClientRect().top);
    if (top < 0 || top > 300) L.fail(`#certifications stage top=${top}`);
    console.log('cert-link-orbit: ok');
    await L.done(p);
  },
  async 'cert-link-list'(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#about', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    await chooseList(p);
    await L.wait(200);
    await p.goto(L.base + '#certifications', { waitUntil: 'networkidle0' });
    await p.reload({ waitUntil: 'networkidle0' });
    await L.wait(1200);
    const r = await p.evaluate(() => { const h = document.getElementById('certifications'); return { tag: h.tagName, top: h.getBoundingClientRect().top }; });
    if (r.tag !== 'H3' || r.top < 0 || r.top > 300) L.fail(`List #certifications: ${JSON.stringify(r)}`);
    console.log('cert-link-list: ok');
    await L.done(p);
  },
  async viewports(b) {
    for (const vp of L.VIEWPORTS) {
      for (const id of ['work', 'about']) {
        const p = await L.openPage(b, vp);
        await p.goto(L.base + '#' + id, { waitUntil: 'networkidle0' });
        await L.wait(1000);
        const small = await L.smallTargets(p);
        if (small.length) L.fail(`${vp.width} ${id}: small targets ${small.join(' | ')}`);
        if (await L.overflowX(p)) L.fail(`${vp.width} ${id}: horizontal overflow`);
        await p.screenshot({ path: `${L.OUT}/${id}-${vp.width}x${vp.height}.png` });
        await L.done(p);
      }
    }
    console.log('viewports: ok');
  },
});
```

- [ ] **Step 8: Verify.**
  - Run the full tests, tsc and the CI build (`Compiled successfully.`).
  - Serve, then run `node origin-check.js` and `node mh-check.js tour,deeplink`. Both must report all passed.
  - Read the `cosmos/work-390x844.png`, `cosmos/about-390x844.png` and `-844x390` screenshots. Expect:
    - Work: three planets on a dashed path, the ship near the newest, company labels inside the frame, and the job card.
    - About: a planet with moons labelled by year and satellites, plus the panel.
- [ ] **Step 9: Stage 3 Lighthouse.** Run the LH command twice and append both lines under `stage 3 (object views)`. Stop the server and restore build/.

- [ ] **Step 10: Commit**

```bash
git add src/mobile/sections/Job.tsx src/mobile/objects/CareerPath.tsx src/mobile/objects/OriginSystem.tsx src/mobile/sections/WorkSection.tsx src/mobile/sections/AboutSection.tsx src/mobile/mobile.css
git commit -m "feat(mobile): Career Path and Origin System object views"
```

---

### Task 8: Hero reactions, the Contact beacon, and a nebula-only backdrop

**Files:**
- Create:
  - `src/mobile/objects/heroMotion.ts` and `src/mobile/objects/heroMotion.test.ts`
  - `src/mobile/objects/useHeroMotion.ts`
  - `src/mobile/objects/Beacon.tsx`
  - `$SCRATCH/shots/hero-check.js`
- Modify: `src/mobile/objects/ObjectStage.tsx`, `src/mobile/sections/HomeSection.tsx`, `src/mobile/sections/ContactSection.tsx`, `src/mobile/UniverseBackdrop.tsx`, `src/mobile/mobile.css`

**Interfaces:**
- Consumes: `ObjectStage` (Task 4), `useReducedMotion()` from `src/mobile/useReducedMotion.ts`.
- Produces:
  - `scrollHero(scrollTop, heroHeight): { y; rx }`
  - `dragTilt(dx, dy, size): { rx; ry }`
  - `isDrag(dx, dy): boolean`
  - `useHeroMotion(ref, enabled)`
  - `Beacon({ signal })`
  - CSS variables on `.mb-orbit`: `--hero-y`, `--hero-rx`, `--hero-drx`, `--hero-dry`
  - classes `is-dragging` and `.mb-hero__ripple`

- [ ] **Step 1: Write the failing test** `src/mobile/objects/heroMotion.test.ts`:

```ts
import { DRAG_THRESHOLD, MAX_DRAG_TILT, MAX_SCROLL_TILT, dragTilt, isDrag, scrollHero } from './heroMotion';

test('constants', () => {
  expect([DRAG_THRESHOLD, MAX_DRAG_TILT, MAX_SCROLL_TILT]).toEqual([8, 12, 8]);
});

test('scrollHero drifts at 0.4x the scroll (the hero moves 0.6x as fast as the page), clamped, and tilts back up to 8 degrees', () => {
  expect(scrollHero(0, 300)).toEqual({ y: 0, rx: 0 });
  const mid = scrollHero(100, 300);
  expect(mid.y).toBeCloseTo(40);
  expect(mid.rx).toBeCloseTo(8 / 3);
  expect(scrollHero(1000, 300)).toEqual({ y: 75, rx: 8 });
  expect(scrollHero(-50, 300)).toEqual({ y: 0, rx: 0 });
  expect(scrollHero(100, 0)).toEqual({ y: 0, rx: 0 });
});

test('dragTilt follows the finger up to 12 degrees', () => {
  expect(dragTilt(0, 0, 300)).toEqual({ rx: 0, ry: 0 });
  expect(dragTilt(75, 0, 300)).toEqual({ rx: 0, ry: 6 });
  expect(dragTilt(600, -600, 300)).toEqual({ rx: 12, ry: 12 });
  expect(dragTilt(-600, 600, 300)).toEqual({ rx: -12, ry: -12 });
  expect(dragTilt(50, 50, 0)).toEqual({ rx: 0, ry: 0 });
});

test('isDrag needs 8 px of movement', () => {
  expect(isDrag(5, 5)).toBe(false);
  expect(isDrag(6, 6)).toBe(true);
  expect(isDrag(0, -8)).toBe(true);
});
```

Run `CI=true npx react-scripts test --watchAll=false src/mobile/objects/heroMotion`. Expected: FAIL.

- [ ] **Step 2: Implement `src/mobile/objects/heroMotion.ts`**

```ts
export const DRAG_THRESHOLD = 8;
export const MAX_DRAG_TILT = 12;
export const MAX_SCROLL_TILT = 8;
const DRIFT = 0.4; // the hero lags the page: it moves at 0.6x the scroll speed
const MAX_DRIFT = 0.25; // of the hero's height

const clamp = (v: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, v));

/** Scroll drift: translateY (px) and backward tilt (deg) for the hero at this scroll offset. */
export function scrollHero(scrollTop: number, heroHeight: number): { y: number; rx: number } {
  if (heroHeight <= 0 || scrollTop <= 0) return { y: 0, rx: 0 };
  return {
    y: Math.min(scrollTop * DRIFT, heroHeight * MAX_DRIFT),
    rx: clamp(scrollTop / heroHeight, 0, 1) * MAX_SCROLL_TILT,
  };
}

/** Drag tilt (deg): dragging right turns the hero right, dragging up tilts it back. */
export function dragTilt(dx: number, dy: number, size: number): { rx: number; ry: number } {
  if (size <= 0) return { rx: 0, ry: 0 };
  return {
    rx: -clamp((dy / size) * 2) * MAX_DRAG_TILT || 0,
    ry: clamp((dx / size) * 2) * MAX_DRAG_TILT || 0,
  };
}

export function isDrag(dx: number, dy: number): boolean {
  return Math.hypot(dx, dy) >= DRAG_THRESHOLD;
}
```

Run the test. Expected: PASS.

- [ ] **Step 3: Create `src/mobile/objects/useHeroMotion.ts`**

```ts
import { RefObject, useEffect } from 'react';
import { dragTilt, isDrag, scrollHero } from './heroMotion';

const BOOST_RATE = 3;
const BOOST_MS = 1000;
const RIPPLE_MS = 900;

/**
 * Hero object motion, written as CSS custom properties (no React re-renders):
 * scroll drift (--hero-y, --hero-rx), drag tilt (--hero-drx, --hero-dry; springs back on release),
 * and a ripple plus a brief orbit speed-up on a tap in empty space. A drag never also selects a planet.
 */
export function useHeroMotion(ref: RefObject<HTMLElement>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const scroller = el.closest<HTMLElement>('.mb-universe__scroll');
    const timers: number[] = [];
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const m = scrollHero(scroller ? scroller.scrollTop : 0, el.offsetHeight);
        el.style.setProperty('--hero-y', `${m.y}px`);
        el.style.setProperty('--hero-rx', `${m.rx}deg`);
      });
    };

    let start: { x: number; y: number; id: number } | null = null;
    let dragged = false;
    let suppressClick = false;
    const setTilt = (rx: number, ry: number) => {
      el.style.setProperty('--hero-drx', `${rx}deg`);
      el.style.setProperty('--hero-dry', `${ry}deg`);
    };
    const onDown = (e: PointerEvent) => {
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      dragged = false;
      suppressClick = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!dragged && !isDrag(dx, dy)) return;
      dragged = true;
      el.classList.add('is-dragging');
      const t = dragTilt(dx, dy, el.offsetWidth);
      setTilt(t.rx, t.ry);
    };
    const onEnd = () => {
      if (!start) return;
      start = null;
      el.classList.remove('is-dragging');
      setTilt(0, 0);
      suppressClick = dragged;
    };
    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('button, a')) return;
      const anims = typeof el.getAnimations === 'function' ? el.getAnimations({ subtree: true }) : [];
      anims.forEach((a) => {
        a.playbackRate = BOOST_RATE;
      });
      timers.push(window.setTimeout(() => anims.forEach((a) => { a.playbackRate = 1; }), BOOST_MS));
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'mb-hero__ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      el.appendChild(ripple);
      timers.push(window.setTimeout(() => ripple.remove(), RIPPLE_MS));
    };

    scroller?.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('pointerdown', onDown, { passive: true });
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerup', onEnd, { passive: true });
    el.addEventListener('pointercancel', onEnd, { passive: true });
    el.addEventListener('click', onClickCapture, true);
    el.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      scroller?.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onEnd);
      el.removeEventListener('pointercancel', onEnd);
      el.removeEventListener('click', onClickCapture, true);
      el.removeEventListener('click', onClick);
      ['--hero-y', '--hero-rx', '--hero-drx', '--hero-dry'].forEach((v) => el.style.removeProperty(v));
      el.classList.remove('is-dragging');
    };
  }, [ref, enabled]);
}
```

- [ ] **Step 4: Replace `src/mobile/objects/ObjectStage.tsx`**

```tsx
import React, { useRef, useState } from 'react';
import { useReducedMotion } from '../useReducedMotion';
import { useHeroMotion } from './useHeroMotion';

export interface ObjectStageProps {
  /** Accessible name; without one the stage is decorative (aria-hidden). */
  label?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Square stage for an interactive space object (the universe's hero). Orbits pause while it is pressed so
 * targets hold still; it drifts with scroll, tilts when dragged and ripples on a tap (all off with reduced motion).
 */
export const ObjectStage: React.FC<ObjectStageProps> = ({ label, id, className, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [held, setHeld] = useState(false);
  useHeroMotion(ref, !reducedMotion);
  const release = () => setHeld(false);
  return (
    <div
      ref={ref}
      id={id}
      className={`mb-orbit${className ? ` ${className}` : ''}${held ? ' is-held' : ''}`}
      role={label ? 'group' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onPointerDown={() => setHeld(true)}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
    >
      {children}
    </div>
  );
};
```

- [ ] **Step 5: Create `src/mobile/objects/Beacon.tsx`**

```tsx
import React, { useState } from 'react';
import { ObjectStage } from './ObjectStage';

/** Contact's hero: a signal tower. Tap the lamp for a pulse; each successful send (signal++) flares it too. */
export const Beacon: React.FC<{ signal: number }> = ({ signal }) => {
  const [pulses, setPulses] = useState(0);
  const key = pulses + signal;
  return (
    <ObjectStage label="Signal beacon" className="mb-beacon">
      <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M38,96 L50,34 L62,96 Z" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        <path d="M42,76 L58,76 M45,58 L55,58" stroke="var(--accent)" strokeWidth="1.2" />
        <path d="M30,30 Q50,12 70,30" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M22,22 Q50,-2 78,22" fill="none" stroke="var(--accent)" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {key > 0 && <span key={key} className="mb-beacon__pulse" aria-hidden="true" />}
      <button className="mb-orbit__node mb-beacon__light" style={{ left: '50%', top: '30%' }} aria-label="Send a signal pulse" onClick={() => setPulses((n) => n + 1)}>
        <span className="mb-beacon__lamp" />
      </button>
    </ObjectStage>
  );
};
```

- [ ] **Step 6: Use the heroes in the sections.**
  - `src/mobile/sections/HomeSection.tsx`: add `import { ObjectStage } from '../objects/ObjectStage';`, and replace `<SolarHero />` with:

```tsx
      <ObjectStage className="mb-solar-stage">
        <SolarHero />
      </ObjectStage>
```

  - `src/mobile/sections/ContactSection.tsx`: add `import { Beacon } from '../objects/Beacon';`. Inside `<div className="mb-contact__head">`, after `<SectionHeading … />`, add `<Beacon signal={beam} />`.
    - The success beam (`.mb-beam`) stays in the form, where the visitor is looking when they send.
    - The beacon flares on the same success signal.
    - This placement is deliberate: the beacon is usually scrolled out of view while sending, so a beam fired only from it would go unseen.

- [ ] **Step 7: Reduce `src/mobile/UniverseBackdrop.tsx` to nebula only.**

```tsx
import React from 'react';
import { MobileSectionId } from './sections';

/** Decorative per-universe space: two drifting nebula glows in the accent. The hero object carries the signature. */
export const UniverseBackdrop: React.FC<{ id: MobileSectionId }> = ({ id }) => (
  <div className="mb-backdrop" data-universe-backdrop={id} aria-hidden="true">
    <span className="mb-backdrop__nebula mb-backdrop__nebula--a" />
    <span className="mb-backdrop__nebula mb-backdrop__nebula--b" />
  </div>
);
```

- [ ] **Step 8: Update `src/mobile/mobile.css`.**
  - In the backdrop section, delete the `.mb-backdrop__object { … }`, `.mb-spin { … }`, `.mb-spin--slow { … }` and `.mb-pulse { … }` rules.
  - Change the two reduced-motion lines that list `.mb-backdrop__nebula, .mb-spin, .mb-pulse` so they list only `.mb-backdrop__nebula`.
  - **Keep** `@keyframes mb-spin`, `mb-pulse` and `mb-drift`.
  - Then append:

```css
/* ---------- hero reactions ---------- */
.mb-orbit {
  transform: translateY(var(--hero-y, 0px)) perspective(900px)
    rotateX(calc(var(--hero-rx, 0deg) + var(--hero-drx, 0deg))) rotateY(var(--hero-dry, 0deg));
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.mb-orbit.is-dragging { transition: none; }
.mb-hero__ripple {
  position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px; border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.7); pointer-events: none; animation: mb-ripple 0.8s ease-out forwards;
}
@keyframes mb-ripple { to { transform: scale(9); opacity: 0; } }
.mb-solar-stage { width: 256px; margin: 8px auto 12px; }
.mb-solar-stage .mb-solar { margin: 0; }
.mb-beacon { width: min(100%, 200px); margin: 4px auto 12px; }
.mb-beacon__lamp { width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 0 16px 6px var(--accent); }
.mb-beacon__pulse {
  position: absolute; left: 50%; top: 30%; width: 44%; aspect-ratio: 1 / 1; transform: translate(-50%, -50%);
  border-radius: 50%; border: 2px solid var(--accent); pointer-events: none; animation: mb-beacon-pulse 1.6s ease-out forwards;
}
@keyframes mb-beacon-pulse { from { transform: translate(-50%, -50%) scale(0.4); opacity: 1; } to { transform: translate(-50%, -50%) scale(2.2); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .mb-orbit { transform: none; transition: none; } .mb-beacon__pulse { animation: none; opacity: 0; } }
.mb.is-reduced .mb-orbit { transform: none; transition: none; }
.mb.is-reduced .mb-beacon__pulse { animation: none; opacity: 0; }
```

- [ ] **Step 9: Create `$SCRATCH/shots/hero-check.js`**

```js
const L = require('./cosmos-lib');
const vars = (p, sel) => p.evaluate((s) => { const el = document.querySelector(s); const cs = el.style; return { y: cs.getPropertyValue('--hero-y'), dry: cs.getPropertyValue('--hero-dry') }; }, sel);

L.run({
  async drag(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#skills', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    const box = await (await p.$('.mb-skills-orbit')).boundingBox();
    const x0 = box.x + 12;
    const y0 = box.y + 12;
    await p.touchscreen.touchStart(x0, y0);
    for (let i = 1; i <= 6; i++) await p.touchscreen.touchMove(x0 + i * 15, y0);
    await L.wait(50);
    const mid = await vars(p, '.mb-skills-orbit');
    await p.touchscreen.touchEnd();
    await L.wait(100);
    const after = await vars(p, '.mb-skills-orbit');
    if (!mid.dry || mid.dry === '0deg') L.fail(`drag did not tilt: ${JSON.stringify(mid)}`);
    if (after.dry !== '0deg') L.fail(`tilt did not spring back: ${JSON.stringify(after)}`);
    await p.evaluate(() => document.querySelector('.mb-orbit__node[aria-label="Tools skills"]').click());
    await L.wait(150);
    if (!(await p.evaluate(() => document.querySelector('.mb-orbit-panel').innerText.includes('Tools')))) L.fail('tap after a drag did not select a planet');
    console.log('drag: ok', JSON.stringify(mid));
    await L.done(p);
  },
  async scroll(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#skills', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    await p.evaluate(() => { document.querySelector('.mb-universe__scroll').scrollTop = 200; });
    await L.wait(200);
    const v = await vars(p, '.mb-skills-orbit');
    if (!v.y || parseFloat(v.y) <= 0) L.fail(`scroll drift not applied: ${JSON.stringify(v)}`);
    console.log('scroll: ok', JSON.stringify(v));
    await L.done(p);
  },
  async 'vertical-scroll'(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#skills', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    const box = await (await p.$('.mb-skills-orbit')).boundingBox();
    const x0 = box.x + 12;
    const y0 = box.y + box.height - 20;
    await p.touchscreen.touchStart(x0, y0);
    for (let i = 1; i <= 8; i++) await p.touchscreen.touchMove(x0, y0 - i * 25);
    await p.touchscreen.touchEnd();
    await L.wait(400);
    const top = await p.evaluate(() => document.querySelector('.mb-universe__scroll').scrollTop);
    if (top <= 0) L.fail('a vertical swipe starting on the hero did not scroll the universe (if synthetic touch cannot scroll here, say so in the report with evidence)');
    console.log('vertical-scroll: scrollTop', top);
    await L.done(p);
  },
  async ripple(b) {
    const p = await L.openPage(b);
    await p.goto(L.base, { waitUntil: 'networkidle0' });
    await L.wait(1000);
    const box = await (await p.$('.mb-solar-stage')).boundingBox();
    await p.mouse.click(box.x + 10, box.y + 10);
    await L.wait(80);
    if (!(await p.$('.mb-solar-stage .mb-hero__ripple'))) L.fail('tap on the Home hero made no ripple');
    console.log('ripple: ok');
    await L.done(p);
  },
  async beacon(b) {
    const p = await L.openPage(b);
    await p.goto(L.base + '#contact', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    await p.click('.mb-beacon__light');
    await L.wait(80);
    if (!(await p.$('.mb-beacon__pulse'))) L.fail('beacon tap made no pulse');
    if ((await p.$$('.mb-backdrop__object')).length) L.fail('backdrop signature objects still present');
    console.log('beacon: ok');
    await L.done(p);
  },
  async reduced(b) {
    const p = await L.openPage(b, { reduced: true });
    await p.goto(L.base + '#skills', { waitUntil: 'networkidle0' });
    await L.wait(1000);
    await p.evaluate(() => { document.querySelector('.mb-universe__scroll').scrollTop = 200; });
    await L.wait(200);
    const v = await vars(p, '.mb-skills-orbit');
    if (v.y) L.fail(`reduced motion still drifts: ${JSON.stringify(v)}`);
    console.log('reduced: ok');
    await L.done(p);
  },
});
```

- [ ] **Step 10: Verify.**
  - Run the heroMotion test and the full suite. tsc is clean, and the CI build prints `Compiled successfully.`
  - Serve, then run:
    - `node hero-check.js`
    - `node skills-check.js`
    - `node galaxy-check.js galaxy`
    - `node map-check.js travel`
    - `node mh-check.js tour,swipe,contact`
  - All must report passed.
  - Read `mh/390x844-home.png` and `mh/390x844-contact.png`. Expect: the Home solar hero is unchanged in look; Contact shows the beacon under the heading; no corner signature objects in the backdrops.
  - Stop the server and restore build/.

- [ ] **Step 11: Commit**

```bash
git add src/mobile/objects/heroMotion.ts src/mobile/objects/heroMotion.test.ts src/mobile/objects/useHeroMotion.ts src/mobile/objects/ObjectStage.tsx src/mobile/objects/Beacon.tsx src/mobile/sections/HomeSection.tsx src/mobile/sections/ContactSection.tsx src/mobile/UniverseBackdrop.tsx src/mobile/mobile.css
git commit -m "feat(mobile): touch-reactive hero objects and the Contact beacon"
```

---

### Task 9: Full verification, stage-4 Lighthouse, regressions

**Files:**
- Modify: `src/mobile/*`, only for fixes the checks reveal. List each one in the report.

- [ ] **Step 1: Every check.**
  - Build, serve on 3005, and from `$SCRATCH/shots` run:
    - `node bh-check.js`
    - `node map-check.js`
    - `node skills-check.js`
    - `node galaxy-check.js`
    - `node origin-check.js`
    - `node hero-check.js`
    - `node mh-check.js all`
  - Each must print its all-passed line.
  - Read every screenshot in `$SCRATCH/shots/cosmos/` and `$SCRATCH/shots/mh/`.
  - Fix any failure at its root cause with the smallest change, then re-run.
- [ ] **Step 2: Stage 4 Lighthouse.** Run the LH command twice and append the lines under `stage 4 (heroes)`. Print `$SCRATCH/shots/lh-cosmos.txt` into the report, so baseline, stage 1, stage 2, stage 3 and stage 4 sit side by side. Don't make risky changes for the score. If stage 4 is more than 10 points below the baseline average, report the top 3 Lighthouse opportunities.
- [ ] **Step 3: Regressions.**
  - `node mv-check.js http://localhost:3005/ $SCRATCH/shots/regress-cosmos 10` → 10 panel lines, then `no console errors`.
  - `node classic-check.js http://localhost:3005/#classic` → `all sections OK`.
  - `node mv-interact.js reduced-motion` → `reduced motion → classic`.
  - Stop the server.
- [ ] **Step 4: Final gates.**
  - `CI=true npx react-scripts test --watchAll=false` → all pass.
  - `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"` → `Compiled successfully.`
  - `grep -rn "from 'three'\|@react-three\|from 'maath'" src/mobile` → no output.
  - Restore build/.
- [ ] **Step 5: Commit** any fixes (skip if there are none):

```bash
git add <the files you changed>
git commit -m "fix(mobile): cosmos objects polish from device verification"
```
