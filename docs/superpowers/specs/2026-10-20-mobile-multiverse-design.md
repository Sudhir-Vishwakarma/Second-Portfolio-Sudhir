# Mobile Multiverse — design

Date: 2026-10-20 · Status: approved in chat

## Intent

Sudhir dislikes the current mobile site (the 2D "cosmos" pager in `src/mobile/`) entirely. Phones should get
**the same realistic 3D experience as desktop**: the real Sun and textured planets with labels, the same seven
universes and ten stops, and the same hyperspace jump through the hex portal between universes — fitted to a
tall, narrow touch screen.

## Goals

- Phones and tablets with WebGL2 run the existing `Multiverse` (one scene, one journey, one store). No second 3D implementation.
- **Full-screen 3D on every stop.** The scene covers the whole screen edge to edge; no boxed card, no border.
- A small floating title over a soft dark fade at the bottom (approved mockup "C v2"): kicker + heading, a
  **Read more** button, and one secondary button where it matters (Home: View CV).
- **Read more** opens that stop's full content (the existing desktop panel component) in a full-screen sheet.
  Closing it returns to the 3D.
- **Swipe up = forward, swipe down = back** (already in `input.ts`). The progress dots stay on the right and are tappable.
- Portrait camera framing: the subject of each stop (sun + planets, education orbit, skill belt, archive,
  company planet, galaxy, station) is centred and fully visible instead of sitting to the right of a side panel.
- CV, certificate and project modals go full-screen on phones.
- Weak phones degrade automatically (existing `PerformanceMonitor`: DPR first, then bloom). Devices without
  WebGL2, with reduced motion, or with < 4 GB reported memory get the Classic site.

## Non-goals

- No changes to the desktop layout or behaviour beyond the shared fixes this needs.
- No new 3D content or new universes.

## Anti-goals

- Anything that looks like the old mobile site (2D cosmos objects, paging, bottom nav, map).
- Text panels covering most of the scene by default.

## Decisions

- **Routing** (`routing/mode.ts`): the `mobile` mode is removed. `chooseMode` returns `multiverse` or `classic` only,
  with the same capability rule for every device.
- **Compact UI** is decided at runtime by viewport (`max-width: 767px` or portrait with coarse pointer), via a
  small `useCompact()` hook, so rotating a tablet or resizing a window switches correctly.
- **Camera**: a pure function `framePose(step, aspect)` in `journey.ts`. At aspect ≥ 1 it returns the desktop pose
  unchanged. In portrait it keeps the camera's x/y on the portal line (so the warp still flies through the portal
  centre), aims at the stop's subject instead of the off-centre desktop look point, pulls back along z, and widens
  the FOV, both scaled by how narrow the screen is. The camera may never pass the universe's portal plane.
- **Read more** is a store modal (`{ kind: 'details' }`) so it reuses modal focus handling, blocks travel while
  open, and closes on Escape / jump.
- Hints read "Swipe up…/Tap a star…" in compact mode.
- `src/mobile/` and its tests are deleted.

## Left to the builder

- Exact portrait distances/FOV, tuned by looking at real renders at 390×844.
- Compact typography and spacing.
