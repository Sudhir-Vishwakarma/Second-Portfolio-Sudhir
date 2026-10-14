# Mobile Cosmos Objects: Design Spec

**Date:** 2026-10-15
**Status:** Approved in conversation; awaiting written-spec review
**Owner:** Sudhir Vishwakarma
**Builds on:** `docs/superpowers/specs/2026-10-15-mobile-hyperspeed-design.md` (full-screen universes with hyperspeed jumps)
**Branch:** `worktree-multiverse` (local only; the owner pushes and deploys)

## 1. Goal

The owner wants planets, galaxies, a black hole and the multiverse to **do something** on the mobile site, not just decorate the background. Four features, built as four shippable stages:

1. **Black hole jump:** a ~1.6 s black-hole transition for map jumps and far jumps.
2. **Multiverse map:** a full-screen map of the six universes; tap one to travel there.
3. **Object views:** Skills, Projects, Work and About open on interactive objects (planets, a galaxy, a career path, an origin system), with an **Orbit | List** switch back to today's cards.
4. **Hero reactions:** the big object at the top of each universe reacts to touch and scroll.

### Success criteria
- All four features work at 320×640, 390×844, 768×1024 and 844×390.
- All content stays reachable, both in Orbit view and in List view.
- Tap targets are at least 44×44 px, contrast meets WCAG AA, and nothing scrolls sideways.
- Object views and the map are fully usable by keyboard and screen reader.
- Reduced motion turns every jump into the existing short fade and stops all orbit, tilt, drift and ripple motion. Everything stays tappable.
- No new runtime dependencies, and no `three`, `@react-three/*` or `maath` in the mobile chunk.
- `CI=true npm run build` → "Compiled successfully.", and all tests pass.
- The desktop multiverse and the classic site have no regressions.
- Lighthouse mobile performance is measured on the commit before this work and after each stage, and both numbers are reported.

### Non-goals
- No WebGL on mobile, and no phone-tilt (gyroscope) control.
- No content changes. All strings come from `src/data/portfolio.ts`.
- No changes to the desktop or classic sites, and no deployment.

## 2. Decisions made

| Decision | Choice |
|---|---|
| Role of the objects | All four: a navigation map, content on objects, a black hole jump, and touch-reactive heroes |
| Rendering | A "lite 3D" look: SVG with gradient shading for objects, and the existing 2D canvas for the black hole. No WebGL. |
| Map placement | Its own full-screen screen, opened from a "Map" button in the top bar. Home is unchanged. |
| Cards | Object view by default, plus an **Orbit / List** switch. List shows today's cards exactly. The choice is remembered per section. |
| Black hole use | Map jumps, and any jump of distance > 1. Next/previous jumps keep hyperspeed. |
| Build approach | SVG/CSS objects in which every tappable object is a real `<button>` or a focusable SVG element. The black hole is drawn by `SpaceCanvas`. |

## 3. Stage 1: the black hole jump

### Behaviour
- **Timeline** (`BH_MS = 1600`):
  - **pull-in, 0–600 ms:** the current universe spirals into the centre (CSS: scale 1 → 0.05, rotate up to 180°, blur, fade). On the canvas, stars curve inward along spirals toward the centre. A black event-horizon disc grows, ringed by an accretion ring tinted between the brand orange and the old universe's accent.
  - **collapse, 600–800 ms:** the screen is near-black and the ring flares. The universe swaps at 800 ms (`BH_SWAP_MS`).
  - **emerge, 800–1600 ms:** stars burst outward, as in hyperspeed's arrival, tinted with the new accent. The new universe zooms out from the centre (CSS: scale 0.6 → 1, fade in).
- **Choosing the effect:** a pure function `jumpKind({ from, to, via })` returns `'blackhole'` when `via === 'map'` or `|to − from| > 1`, and `'hyperspeed'` otherwise.
- **Reduced motion:** every jump stays the existing 250 ms fade (swap at 125 ms).
- **Unchanged:** history entries, the pending Back/Forward replay, the post-jump settle, the popup guard, and the hidden-tab catch-up all behave exactly as today. Only the timings depend on the effect.

### Architecture
- **New `src/mobile/blackHole.ts`** (pure, unit-tested):
  - `BH_MS`, `BH_PULL_MS = 600`, `BH_SWAP_MS = 800`
  - `blackHoleFrame(t)` → `{ phase: 'pull' | 'collapse' | 'emerge' | 'idle', pull, horizon, spin, flare, burst, mix, done }`. All values are 0..1 except `spin` (radians). `flare` peaks at the swap and `mix` never decreases.
  - `jumpKind`
- **`universePager.ts`:** `WarpState` gains `kind: 'hyperspeed' | 'blackhole'`.
- **`useUniversePager`:**
  - `travelTo(target, { push, source, via? })` picks the kind.
  - It uses `SWAP_MS`/`WARP_MS` for hyperspeed and `BH_SWAP_MS`/`BH_MS` for the black hole.
  - It sets `warpRef.kind`, and exposes `jumpKind` so the views can pick their CSS classes.
- **`SpaceCanvas`:** when `kind === 'blackhole'` it draws the black hole frame:
  - spiral-in star paths
  - the horizon disc
  - the accretion ring with a flare
  - the emerge burst
  Otherwise it draws hyperspeed as today.
- **`UniverseView`:** `.is-leaving.is-blackhole` and `.is-arriving.is-blackhole` classes.

## 4. Stage 2: the multiverse map

### Behaviour
- **Opening:** a **Map** button (a galaxy icon, labelled "Multiverse map") in the top bar, next to "SV", opens a full-screen map. The map reuses `Sheet` with `variant="full"`, so Back, ✕ and Esc close it. Focus moves to the close button on open and is restored on close, as today.
- **Contents:**
  - a black hole at the core (decorative)
  - the six universes on a slowly rotating spiral around it, each drawn as its own object: Home a sun, About a planet with moons, Skills a crystal-ringed planet, Work three planets, Projects a spiral galaxy, Contact a beacon
  - faint dotted warp lanes linking them in universe order
  - the current universe marked with a pulsing ring and "You are here"
- **Travelling:** tapping a universe closes the map, then travels with `via: 'map'`, which means a black hole jump.
  - Tapping the current universe only closes the map.
  - **Close-then-travel order:** the map's sheet closes through history, which is async. MobileApp keeps the picked target and starts travel in an effect that runs once `mapOpen` is false, so the sheet's entry has been popped and the sheet has left the DOM. The pager's popup guard checks the DOM for `.mb-sheet`, so travel must not start while the sheet is still mounted. This keeps history correct.
- **Accessibility:** each universe is a `<button aria-label="Travel to Skills">`, and the current one has `aria-current="true"`. Rotation pauses while the map is touched, and under reduced motion.
- **Layout:** the map fits portrait, landscape and tablet. It is a square object area of `min(100vw − pads, 100dvh − top bar − labels)` with labels outside the objects.

### Architecture
- **New `src/mobile/map/MultiverseMap.tsx`:** an SVG map with button overlays. Its props are `{ current, onPick(index) }`.
- **New `src/mobile/map/mapLayout.ts`** (pure, tested): spiral positions for N universes, given a size and a rotation angle.
- **`TopBar`:** adds the Map button (44×44).
- **`MobileApp`:** owns `mapOpen` and the picked target, and wires the close-then-travel order.

## 5. Stage 3: object views with the Orbit / List switch

### Shared behaviour
- **The switch:** an **Orbit | List** segmented switch (two 44 px buttons with `aria-pressed`) sits at the top of Skills, Projects, Work and About.
  - Orbit is the default. List renders today's components unchanged.
  - The choice is stored per section in `localStorage` (`mb-view-<id>`). Every read and write is wrapped in try/catch, and Orbit is the fallback.
- **Layout:** each object view is an object area (SVG, square, `max-width: 360px`) above a detail panel. In landscape, or at width ≥ 700 px, the two sit side by side.
- **Selection:** something is always selected on entry, so the content is visible without a tap.
  - The detail panel has `aria-live="polite"`.
  - Selectable objects are buttons, or focusable SVG `<g role="button" tabindex="0">` with Enter/Space handling, each with an aria-label and `aria-pressed` when selected.
- **Gestures:** object areas are tap-only (no drag rotation). They are added to `isGestureExempt` (`.mb-orbit`), so pulls that start there never jump universes.
- **Reduced motion:** orbits are static.

### Skills: a solar system
- A central sun labelled "Skills", with the 5 skill groups as planets on slow concentric orbits, coloured by the group's existing colour dot.
- Selecting a planet highlights it. The panel shows the group title and its skill chips.
- The first group starts selected.

### Projects: the Project Galaxy
- **Layout:** a 4-arm spiral galaxy, one arm per category (CRM, Salesforce, Real Estate, Web Apps). The 23 projects are stars placed along their arm in newest-first order. Featured projects are larger and brighter.
- **Filter chips:** the existing filter chips highlight one arm and dim the others; "All" shows every arm.
- **Picking a star:**
  - The galaxy has one large hit surface; a tap selects the **nearest** star within 40 px.
  - **◀ ▶** buttons step through the visible stars in newest-first order.
  - The selected star has a ring and its title.
- **Panel:** a compact card with the title (★ if featured), short description, up to 3 tech badges, **Live Demo**, and **Details**, which opens the existing Details sheet.
- **Default:** the newest project starts selected.

### Work: the Career Path
- **Layout:** the 3 jobs are planets along a curved trajectory, oldest to newest. The newest (Realatte) is brightest, and a small ship marker sits at the current job.
- **Panel:** the job card: role, company, `start – end`, and bullets with the existing Show more / Show less.
- **Default:** the current job starts selected.

### About: the Origin System
- **Summary:** the summary card stays at the top, always visible, in both Orbit and List view.
- **Origin system:**
  - **Education:** a central planet with the 4 education entries as moons, labelled with years.
  - **Certifications:** the 4 certifications as satellites on an outer ring.
- **Panel:**
  - An education entry shows its timeline-card contents.
  - A certification shows its card with the existing **View** (certificate viewer sheet).
- **Default:** the most recent education entry starts selected.
- **`#certifications` deep link:** it switches the About view to show certifications. In Orbit, the first certification is selected and the system is scrolled into view; in List, it scrolls to the existing heading.

### Architecture
- **New `src/mobile/objects/`:**
  - `ViewToggle.tsx`
  - `useViewMode.ts` (storage, tested)
  - `SkillSystem.tsx`
  - `ProjectGalaxy.tsx`
  - `galaxyLayout.ts` (pure, tested: star positions per arm, counts per arm, nearest-star pick)
  - `CareerPath.tsx`
  - `OriginSystem.tsx`
- **Section components** (`SkillsSection`, `ProjectsSection`, `WorkSection`, `AboutSection`): render the toggle and either the object view or their existing list markup. The list markup is not changed.

## 6. Stage 4: hero reactions

### Behaviour
- **Which object is the hero:**
  - **Skills, Projects, Work, About:** the object area from Stage 3.
  - **Home:** the existing `SolarHero`.
  - **Contact:** a new beacon tower above the form. Tapping it emits a light pulse, and a successful send fires the existing beam from it.
- **Backdrop:** `UniverseBackdrop` keeps its nebula glows. Its signature objects are removed so nothing doubles up.
- **Reactions:**
  - **Scroll:** the hero translates at ~0.6× the scroll speed and tilts back up to 8° (`rotateX`) as the universe scrolls. Each universe has one passive scroll listener, applied in rAF.
  - **Drag:** press-and-drag on the hero tilts it in 3D (perspective; `rotateX`/`rotateY` up to ±12°), following the finger, and springs back on release (CSS transition). A drag starts only after 8 px of movement, so taps still select objects.
  - **Tap on empty space:** a soft ripple, and the orbit speed boosts briefly (~1 s).
- **Reduced motion:** no drift, tilt or ripple. Everything stays tappable.

### Architecture
- **New `src/mobile/objects/useHeroMotion.ts`:** it takes a scroll-root ref and a hero ref, writes CSS custom properties (`--hero-y`, `--hero-rx`, `--hero-ry`), and handles the 8 px drag threshold. The pure maths lives in `heroMotion.ts` and is tested.
- **New `src/mobile/objects/Beacon.tsx`** for Contact.

## 7. Error handling and fallbacks
- **Storage:** if `localStorage` is unavailable, the view falls back to Orbit and the choice isn't remembered.
- **Missing canvas:** if no 2D context is available, the black hole jump still swaps universes on its timers. Only the visuals are missing, as with hyperspeed today.
- **Lists:** List view is always one tap away, so a visual problem never blocks content.
- **Crashes:** the existing ErrorBoundary still falls back to the classic site on a crash.

## 8. Testing
- **Unit (Jest):**
  - `blackHoleFrame` boundaries at 0, 599, 600, 799, 800, 1599 and 1600, with `flare` peaking at 800 and `mix` monotonic
  - `jumpKind`
  - `mapLayout` positions stay inside the area and are unique
  - `galaxyLayout`: counts per arm (2/4/4/13), newest-first ordering along each arm, positions inside the area, and the nearest-star pick (in range, out of range, ties)
  - `useViewMode` (default, persist, throwing storage)
  - `heroMotion` (clamping, drag threshold)
  - pager: map jumps and far jumps use black hole timings; ±1 jumps stay hyperspeed
- **Headless (puppeteer-core)** at all four viewports:
  - **Map:** opens; Back closes it; tapping Contact on the map black-hole-jumps to Contact (hash, nav and focus correct); tapping the current universe only closes.
  - **Jump choice:** Home → Contact via the nav uses the black hole; Next uses hyperspeed. Includes a mid-black-hole canvas screenshot.
  - **Object views:** Skills planets, Projects stars (tap, ◀ ▶, filter, Details sheet), Work planets and About moons/satellites all show the right panel content.
  - **List and content:** the List switch shows today's cards and persists across reload. All content needles are present in both views.
  - **Hero:** dragging tilts and releases; taps still select.
  - **General:**
    - reduced motion: fades, no motion
    - no overflow; tap targets ≥ 44 px
    - the contact form, with `/api/contact` mocked
- **Regression:** the existing `mh-check` scenarios, desktop `mv-check`, and `classic-check`.
- **Performance:** Lighthouse mobile on the pre-work commit and after each stage. Report both runs.

## 9. Constraints
- Work on branch `worktree-multiverse` with local commits only. Never push or deploy.
- CRA 5, React 18, TypeScript 4.9, and no new runtime dependencies.
- Content strings come only from `src/data/portfolio.ts`.
