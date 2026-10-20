# Mobile Multiverse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phones run the desktop 3D Multiverse, framed for portrait, with a floating title + "Read more" overlay; the old `src/mobile/` site is removed.

**Architecture:** One `Multiverse` for every device. Portrait framing is a pure function of (step, aspect) used by `CameraRig`. Compact UI is CSS (`max-width: 767px`) plus a `useCompact()` hook for the few components that render differently; "Read more" is a store modal that renders the existing desktop panel.

**Tech Stack:** React 18, TypeScript, @react-three/fiber, zustand 3, Jest via react-scripts.

**Spec:** `docs/superpowers/specs/2026-10-20-mobile-multiverse-design.md`

## Global Constraints

- Desktop (aspect ≥ 1, width ≥ 768) must render and behave exactly as before.
- Portrait camera keeps the desktop pose's x/y (the portal line) and never goes past local z = `PORTAL_OFFSET - 8`.
- Compact breakpoint: `(max-width: 767px)`.
- Test command: `CI=true npx react-scripts test --watchAll=false`.

## Review Focus

- Warp on a phone must still fly through the portal centre (x/y unchanged) — pinned by a `framePose` test.
- Swipes inside the open "Read more" sheet must never travel — `go()` is blocked while any modal is open (existing store test covers `go` with a modal; add one for `details`).
- Rotating a tablet / resizing across 767px switches between compact and desktop overlay without reload — `useCompact` listens to `matchMedia` change.
- Typing in the contact form inside the sheet must not trigger travel — existing `isFormField` guard; sheet carries `data-capture-scroll`.
- A deep link `#projects` on a phone lands on Projects in compact framing — `framePose` is used from the first frame.

---

### Task 1: Portrait camera framing

**Files:** Modify `src/multiverse/journey.ts`, `src/multiverse/camera/CameraRig.tsx`; Test `src/multiverse/journey.test.ts`

**Interfaces — Produces:** `Step.focus: Vec3` (subject, local); `framePose(i: number, aspect: number): { pos: Vec3; look: Vec3; fov: number }`.

- [ ] Tests: `framePose(i, 1.6)` equals `{ ...worldPose(i), fov: 55 }` for every step; for `aspect = 0.46` every step keeps `pos[0]`/`pos[1]` of `worldPose`, has `look` = universe origin + `focus`, `fov > 55`, and local `pos[2] <= PORTAL_OFFSET - 8`.
- [ ] Run, see FAIL.
- [ ] Implement: focus = `[0,0,0]` for every stop except work (`WORK_STOPS[i]`) and contact (`[0,1,0]`). Narrowness `n = clamp((1 - aspect) / 0.55, 0, 1)`; pull back z distance by `1 + 0.9n`, fov `55 + 20n` (tune in Task 4).
- [ ] CameraRig: use `framePose(step, size.width / size.height)`; fov base comes from the pose; pointer parallax scaled by `aspect < 1 ? 0.3 : 1`.
- [ ] Run, see PASS. Commit.

### Task 2: Route every device to the Multiverse; delete the old mobile site

**Files:** Modify `src/routing/mode.ts`, `src/routing/mode.test.ts`, `src/App.tsx`; Delete `src/mobile/`

- [ ] Tests: phone envs (`width 390, coarsePointer`) → `'multiverse'`; phone with no WebGL2 / reduced motion / `deviceMemory 2` → `'classic'`. `AppMode` = `'classic' | 'multiverse'`.
- [ ] Run, see FAIL; implement; remove `MobileApp` lazy import; `git rm -r src/mobile`.
- [ ] Run full suite, see PASS. Commit.

### Task 3: Compact overlay

**Files:** Create `src/multiverse/useCompact.ts`, `src/multiverse/overlay/Caption.tsx`, `src/multiverse/overlay/caption.ts` (+ `caption.test.ts`); Modify `store.ts` (+test), `overlay/ModalHost.tsx`, `overlay/ScrollHint.tsx`, `overlay/TopBar.tsx`, `Multiverse.tsx`, `multiverse.css`

**Interfaces — Produces:** `Modal` gains `{ kind: 'details' }`; `stepCaption(i: number): { kicker: string; title: string }`; `touchHint(hint: string): string`; `useCompact(): boolean`.

- [ ] Tests: `stepCaption(0)` → `{ kicker: "HELLO I'M", title: 'SUDHIR VISHWAKARMA' }`; work step 5 → title = `experience[0].role`, kicker contains company; `touchHint('Scroll to warp to About')` → `'Swipe up to warp to About'`, `'Scroll up to travel back'` → `'Swipe down to travel back'`, `'Click a star · Scroll …'` → starts `'Tap a star · Swipe up'`; store: `openModal({kind:'details'})` then `go(1)` leaves step unchanged.
- [ ] Run, see FAIL; implement.
- [ ] `Caption`: shown when compact, booted, not moving; kicker + title + "Read more" (opens details) + Home-only "View CV".
- [ ] ModalHost: `details` renders `PANELS[universe]` for the current step, full-screen sheet.
- [ ] CSS `@media (max-width: 767px)`: hide `.mv-panel` and `.mv-nav`; topbar shows `SV`, current universe + `n/7`, Classic link; caption over bottom fade; modals full-screen; bigger dot hit-areas; credits shrink.
- [ ] Run suite, PASS. Commit.

### Task 4: Drive it on a phone viewport and tune

- [ ] Headless Chrome at 390×844, mobile + touch emulation: screenshot every step, a warp mid-flight, Read more, View CV.
- [ ] Tune Task 1 constants until each subject is centred and fully visible; re-run tests. Commit.
