# Mobile Hyperspeed Universes: Design Spec

**Date:** 2026-10-15
**Status:** Approved in conversation; awaiting written-spec review
**Owner:** Sudhir Vishwakarma
**Builds on:** `docs/superpowers/specs/2026-10-14-mobile-lite-design.md` (the current mobile site)
**Branch:** `worktree-multiverse` (local only; the owner pushes and deploys)

## 1. Goal

The owner likes the current mobile layout but wants the **desktop feel**. Each section should be its own **universe**, and moving between universes should be a full **hyperspeed jump** like desktop. Today it is a single scrolling page with a brief 0.6 s flash.

### Success criteria
- **Universes:** the mobile site shows one universe at a time, in order: Home, About (with Certifications), Skills, Work, Projects, Contact. Each fills the screen and scrolls internally.
- **Jumps:** travelling between universes plays a ~1.2 s hyperspeed: stars accelerate into streaks, the colour shifts from the old universe's accent to the new one's, a flash, and then deceleration on arrival.
- **Triggers:**
  - a swipe up (pull of 80 px or more) past the bottom of a universe, or the **"Next: <name> ↓"** button → the next universe
  - a swipe down (pull of 80 px or more) past the top → the previous universe
  - a bottom-nav tap → any universe
  - the phone's Back button → the previous universe (after closing an open sheet first)
- **Backdrops:** each universe has its own colour backdrop with a drifting nebula and a signature object.
- **Reduced motion:** a short fade replaces the warp and zoom, and the stars are static.
- **Everything else stays:**
  - all existing content and features: sections, Sheet, the SMTP form, deep links, the bottom nav
  - every tap target at least 44 px, with no sideways scrolling at 320, 390 and 768 px or at 844×390
  - no three.js in the mobile chunk
  - a Lighthouse mobile aim of 90 or more
  - zero-warning `CI=true` build, passing tests
  - no regressions on the desktop or classic sites

### Non-goals
- No WebGL on mobile.
- No changes to the desktop multiverse or the classic site.
- No content changes.
- No deployment.

## 2. Decisions made

| Decision | Choice |
|---|---|
| Navigation | Swipe and tap between universes, with normal scrolling inside a universe |
| Hyperspeed | A stronger 2D canvas warp, about 1.2 s (approach A), not WebGL |
| Universe order | home, about, skills, work, projects, contact (unchanged ids and hashes) |
| History | Each jump pushes a history entry; Back travels to the previous universe; an open sheet closes first |

## 3. Architecture (changes inside `src/mobile/`)

### New
- **`universePager.ts`:** pure and unit-tested.
  - `UNIVERSE_ORDER: MobileSectionId[]`, `nextIndex(i)`, `prevIndex(i)` (both clamped)
  - `travelDirection(input): 'next' | 'prev' | null`. It takes `{ atTop, atBottom, pull, threshold = 80 }`, where `pull` is positive when dragging up past the bottom and negative when dragging down past the top. It returns `'next'` when `atBottom && pull >= threshold`, `'prev'` when `atTop && -pull >= threshold`, and `null` otherwise.
  - `WARP_MS = 1200`
  - `warpFrame(t: number)`: for elapsed `t` in ms, returns `{ phase, speed, streak, flash, mix, done }`:
    - `phase` is `'launch' | 'hyperspace' | 'arrival' | 'idle'`
    - `speed` and `streak` are 0..1
    - `flash` is 0..1, peaking at the hyperspace → arrival boundary
    - `mix` is the 0..1 colour blend from the old accent to the new
    - `done` is true once `t >= WARP_MS`
    - Phases are launch 0–350 ms, hyperspace 350–750 ms, arrival 750–1200 ms. The universe swaps at 750 ms (the flash peak).
  - `universeForHash(hash)`: maps a hash to `{ index, anchor }`, reusing `sectionForHash` (`#certifications` → about with anchor `certifications`, unknown → null).
- **`useUniversePager.ts`:**
  - State: `{ index, target, warping, startedAt }`.
  - `travelTo(i, { push = true })`:
    - It is ignored while warping, or when `i === index`.
    - With reduced motion it does a 250 ms fade instead.
    - At the swap moment it sets `index`, pushes the history entry `{ mbUniverse: id }` with hash `#id` (unless `push` is false, as for Back), and moves focus to the new universe's heading.
  - On `popstate`: if `history.state?.mbSheet` it does nothing (the Sheet handles it). Otherwise it resolves `location.hash` and travels there with `push: false`.
  - On mount: it starts at `universeForHash(location.hash)` without a warp, `replaceState`s `{ mbUniverse }`, clears any stale `mbSheet` state, and scrolls inside to the anchor if one was given.
  - It exposes `warpRef: { t0: number | null; from: string; to: string }`, which SpaceCanvas reads each frame.
- **`SpaceCanvas.tsx`:** replaces `StarfieldCanvas`. Same stars (about 250, dpr ≤ 2, `clientWidth`/`clientHeight` sizing, paused when the tab is hidden, static with reduced motion).
  - Each frame, if `warpRef.t0` is set, it applies `warpFrame(now - t0)`:
    - stars move outward from the centre at a speed scaled by `speed`
    - each is drawn as a line with length proportional to `streak`
    - colour is lerped between the `from` and `to` accents by `mix`
    - a full-screen white overlay is drawn at alpha `flash × 0.85`
  - When the warp is done it eases back to drift.
- **`UniverseView.tsx`:** one universe.
  - **Layout:** a full-viewport (`100dvh`, with a `100vh` fallback) container whose own scroll area holds the section component, plus a "Next: <label> ↓" button at the end (except Contact). Contact also renders the Footer at its end.
  - **Swipe detection:** touch start, move and end on the scroll area compute the pull beyond the scroll edges. A pull indicator at the edge shows progress, and on release `travelDirection` decides.
  - **Desktop testing:** wheel events at an edge accumulate a pull with the same threshold.
  - **Ignored gestures:** anything starting inside `[data-capture-scroll]` elements that can scroll, form fields, or an open sheet.
  - **Warp animation:** `.is-leaving` (scale 0.92, blur, fade) and `.is-arriving` (scale 1.08 → 1) classes.
- **`UniverseBackdrop.tsx`:** per-universe CSS/SVG backdrop. It has a nebula (two to three radial gradients in the universe accent, slowly drifting) and a signature object:
  - Home: none (SolarHero is already in the content)
  - About: a planet with 4 moons
  - Skills: a ring of crystals
  - Work: three planets on a path
  - Projects: a spiral galaxy
  - Contact: a beacon with a pulse
  It is decorative (`aria-hidden`), its animations pause with reduced motion, and it sits behind the content.

### Changed
- **`MobileApp.tsx`:** renders SpaceCanvas, the TopBar, the current UniverseView (plus the outgoing view during a warp), the BottomNav (`onSelect` → `travelTo`), and the Sheet host. It keeps the scroll-behaviour override from the current build.
- **`BottomNav`:** the active item is the pager's `index`.
- **The Footer** moves to the end of the Contact universe.
- **`mobile.css`:** universe container, edge indicators, leaving and arriving animations, backdrops, and the Next button.

### Removed
- `WarpOverlay.tsx`, `StarfieldCanvas.tsx`, `useActiveSection.ts` and `scrollToAnchor`. All are replaced.

### Unchanged
- Section components, `Sheet`, `SolarHero`, `TopBar`, `useReveal` (now rooted at each universe's scroll area), and the content data, hooks and routing.

## 4. Behaviour details
- **Swipes don't hijack reading:** a jump needs the scroll area to already be at its edge **and** a further deliberate 80 px pull.
- **Busy states:** while a warp is running, all travel input is ignored. Sheets block travel while open.
- **Hidden tab:** if the tab is hidden mid-warp, the warp completes instantly when the tab becomes visible again (it never sticks).
- **Ends of the journey:** at Home there is no previous universe (a top pull does nothing). At Contact there is no next one, so no button.
- **`#classic`:** the Footer link still switches to the classic site, and Back returns to the mobile site at the same universe.

## 5. Testing
- **Unit (Jest):**
  - `nextIndex`/`prevIndex` clamping
  - `travelDirection` edge cases: exactly at the threshold, not at the edge, either direction
  - `warpFrame` phase boundaries: 0, 349, 350, 749, 750, 1199, 1200
  - the flash peaking at 750, and `mix` being monotonic
  - `universeForHash`
- **Headless (puppeteer-core)**, at 320×640, 390×844, 768×1024 and 844×390, checking:
  - a single universe is visible
  - every universe's key text is reachable by jumping through all six
  - Next and nav jumps land on the right universe (hash, active nav, heading focused)
  - Back returns to the previous universe, and closes an open sheet first
  - a deep link to `#certifications` opens About scrolled to the certificates
  - no horizontal overflow
  - reduced motion uses the fade with no streak frame
  - the contact form works with `/api/contact` mocked
  - a mid-warp canvas screenshot shows streaks
- **Regression:** the desktop `mv-check` and `classic-check` pass.
- **Build:** `CI=true npm run build` → "Compiled successfully."

## 6. Constraints
- Work on branch `worktree-multiverse` with local commits only. Never push or deploy.
- CRA 5, React 18, TypeScript 4.9, no new runtime dependencies.
- Content strings come only from `src/data/portfolio.ts`.
