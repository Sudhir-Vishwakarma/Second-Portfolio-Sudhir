# Desktop Realistic Universes: Design Spec

**Date:** 2026-10-15
**Status:** Approved in conversation; awaiting written-spec review
**Owner:** Sudhir Vishwakarma
**Builds on:** `docs/superpowers/specs/2026-10-14-multiverse-portfolio-design.md` (the desktop 3D multiverse)
**Branch:** `worktree-multiverse` (local only; the owner pushes and deploys)

## 1. Goal

The desktop multiverse doesn't look realistic. Today's planets are code-drawn blotches lit evenly all round, moons are flat glowing discs, and every universe sits in coloured haze. The owner wants **every universe to look like real space, NASA-photo style**: real planet surfaces, lit by a star (a bright day side and a dark night side), thin atmospheres, a real Milky Way sky and a real Sun.

### Success criteria
- **Real look:** every one of the 7 desktop universes uses real planet imagery and physically based lighting, following the mapping in §3.
- **Unchanged behaviour:** content, panels, navigation, hyperspeed/portal jumps, camera paths, labels, hover and click interactions all work as before.
- **No regressions:** the phone site and classic site are untouched. The phone site downloads none of the new images.
- **Graceful failure:** a missing or slow image never breaks or blanks the scene; that object falls back to today's procedural look.
- **Build and tests:** `CI=true npm run build` → "Compiled successfully.", all tests pass, and the existing desktop, classic and mobile headless checks pass.
- **Speed:** desktop Lighthouse performance is measured before and after and reported.

### Non-goals
- No content changes; strings stay in `src/data/portfolio.ts`.
- No changes to the phone or classic sites.
- No cinematic extras (lens flare, film grain, depth of field), no new dependencies, and no deployment.

## 2. Decisions made

| Decision | Choice |
|---|---|
| Style | Photoreal, like NASA (not cinematic sci-fi) |
| Imagery | Free planet maps from Solar System Scope (CC BY 4.0, based on NASA data), downloaded only after the owner approves the exact file list |
| Resolution | 2K maps, one shared set (≈5.5 MB): a body that appears in several universes reuses the same file (revised during planning; the earlier 1K-copies idea would have added bytes, see §5) |
| Colour identity | Each universe keeps its feel through which real bodies and sky orientation it shows, not through coloured haze |

## 3. Universe mapping

| Universe | Realistic version |
|---|---|
| **Home** | The Sun (textured, corona) orbited by real planets that are the universe portals: Earth, Mars, Jupiter, Saturn (rings), Neptune, the Moon. Each portal planet keeps its current universe, label, hover and click. |
| **About** | Earth (day/night, city lights, ocean glint, clouds, atmosphere) orbited by 4 real cratered moons, one per education entry, with their current labels and interactions |
| **Skills** | A gas giant (Jupiter) with a rocky asteroid belt; each skill is a lit asteroid carrying its existing label and hover behaviour |
| **Certifications** | The Moon, orbited by metal satellites with solar panels; each carries its existing certificate plaque and viewer behaviour |
| **Work** | 3 real planets in career order: Mars (oldest), Jupiter, Saturn with rings (newest, Realatte), with the existing labels |
| **Projects** | A real star field: each project is a star coloured by a realistic star temperature (blue-white to orange; featured = hotter and brighter), with subtle diffraction spikes; existing labels, constellations and interactions stay |
| **Contact** | A radio telescope dish on the Moon's surface with Earth rising behind it; the existing signal and beam behaviour stays |

## 4. Architecture

### Imagery
- **Files:** `public/textures/` holds 11 maps at 2K: sun, earth day, earth night, earth clouds, moon, mars, jupiter, saturn, saturn ring (alpha), neptune, and the Milky Way.
  - **Source:** they come from Wikimedia Commons (`Solarsystemscope_texture_2k_*`), which hosts the same Solar System Scope maps under CC BY 4.0. Total ≈ 5.5 MB.
  - **Licence file:** `public/textures/CREDITS.txt` records source and licence.
- **Manifest:** `src/multiverse/fx/textures.ts` (pure, tested) maps texture keys to URLs and lists which keys each universe uses.
- **Credit:** a small "Credits" note on the desktop site reads "Planet imagery: Solar System Scope (CC BY 4.0), based on NASA data", with a link.

### Reusable 3D pieces (`src/multiverse/fx/`)
- **`RealPlanet`:** a textured sphere with a custom shader (colour map, plus bump relief derived from the map's brightness).
  - Lit by its universe's star through an explicit light position, as today's `Planet` is. That way one universe's sun never lights another's planets: all universes stay mounted in one scene, so scene `pointLight`s would leak across them.
  - Optional atmosphere: a slightly larger back-face sphere with a fresnel rim shader in a given colour, brightest on the lit limb.
  - Optional ring: a ring geometry with the Saturn ring alpha map, receiving the planet's light.
  - It keeps the current `Planet` props for highlight, hover and click, so universes swap it in without behaviour changes.
- **`RealEarth`:** a custom shader that blends the day map and the night-lights map by the sun angle, adds ocean specular glint, and adds a separate slowly rotating cloud sphere and the blue atmosphere.
- **`RealSun`:** the sun map on an unlit, emissive sphere with limb darkening, plus a soft corona glow sprite. Its position is the light position for that universe's bodies.
- **`MilkyWaySky`:** a large inward-facing sphere with the Milky Way map. Rotation and a faint tint are set per universe. It replaces the coloured `Nebula` haze.
- **`Asteroid`:** code-shaped rock geometry (a displaced icosahedron, seeded per skill) with the moon map as surface.
- **`Satellite`:** a box body plus 2 solar-panel planes, with metallic and dark-blue panel materials.
- **`RadioDish`:** a lathe-geometry dish on a mast, metallic.
- **`starColor(temperatureK)`:** a pure, tested function giving a realistic blackbody RGB.

### Lighting and finish
- **Lights:**
  - Celestial bodies use their universe's explicit light position (shader uniform).
  - The global scene lights (`SceneLights`) drop to a very low ambient level so night sides read as dark. They keep one directional light for small man-made objects (satellites, the radio dish).
- **Colour:** ACES filmic tone mapping with correct colour spaces (sRGB maps).
- **Bloom:** the existing bloom is tuned so only emissive sources (sun, stars, city lights) glow.

### Universes
Each `src/multiverse/universes/*Universe.tsx` replaces its current visual objects with the pieces above, following §3. Labels, `Html` plaques, pointer handlers, portal targets and camera paths are kept as they are.

## 4a. Real 3D depth (owner requirement: "it is supposed to look 3D")

Photos are only surfaces. Everything stays a true 3D object in a 3D scene:
- **No flat stand-ins:** every celestial body is a real lit 3D mesh. Today's flat glowing discs (About moons, unlit `meshBasicMaterial` bodies) and flat dot sprites for project stars become lit spheres. Stars become small emissive spheres with glow, still in 3D space.
- **Relief:** bump mapping makes craters, mountains and canyons catch the light along the day/night line (the terminator), so surfaces show depth, not a printed picture.
- **Shadows:**
  - Saturn's ring casts a shadow band on the planet, and the planet shades the ring behind it (computed in the shaders, cheap).
  - Moons and satellites pass in front of and behind their planet correctly (depth-tested).
- **Motion that shows volume:**
  - Planets spin on tilted axes, and clouds drift slightly faster than the ground.
  - Asteroids tumble on random axes and satellites slowly rotate.
  - Rings are tilted so their ellipse reads as 3D.
- **Layered depth:**
  - Each universe places bodies at clearly different distances: a foreground body, the main body and distant bodies.
  - Star layers sit at several depths, with the Milky Way sky at infinity.
  - Moving the camera therefore produces real parallax.
- **Camera parallax:**
  - The existing pointer parallax (`CameraRig`: ±1.6 x, ±1.0 y) is raised to about ±2.4 x and ±1.5 y.
  - The camera gains a slow idle drift around the focus point, so visitors see around the planets.
  - Both are disabled under reduced motion (that path already routes to the classic site).

## 5. Loading and performance
- **One shared set, loaded once (revised during planning).** The world keeps every universe mounted at all times, so jumps never compile shaders or stutter. Each image is therefore requested once at start (drei `useTexture` inside Suspense; one request per URL, shared by every body that uses it).
  - The existing loading screen ("Igniting the sun…", which already tracks asset progress) waits for the set before revealing the scene.
  - Per-universe lazy loading and 1K copies were dropped: with every universe mounted they would add requests and bytes rather than save them.
  - Repeat visits load from the browser cache.
- **Texture settings:** sRGB colour space, mipmaps, anisotropy 4, and at most 2K per map.
- **Geometry budget:** sphere segments stay as today (64), with one asteroid per skill (today's crystal count).
- **Routing:** low-end and no-WebGL devices still get the classic site (unchanged routing).
- **Phone:** the mobile chunk never imports these modules.
- **Lighthouse:** desktop performance is measured on the commit before this work and after, and both are reported (recorded, not gated).

## 6. Error handling
- **Failed image:** each textured object sits in its own error boundary plus Suspense fallback. If its texture fails to load, the object renders today's procedural `Planet` (or equivalent), so the scene stays complete with no uncaught errors.
- **Crash:** the existing app-level ErrorBoundary still falls back to the classic site.

## 7. Testing
- **Unit (Jest):**
  - `starColor` (known temperatures map to expected hues, monotonic blue↔red)
  - the texture manifest (every key's file exists in `public/textures/`; every universe lists only known keys)
  - the asteroid layout (count, radius bounds, deterministic seeds)
- **Headless (puppeteer-core, WebGL via SwiftShader):**
  - a screenshot of every universe for visual review; each must show lit 3D bodies with a visible day/night line, relief and depth (no flat discs or dot sprites for bodies)
  - two screenshots of the same universe with the pointer at opposite corners, which must show parallax (near bodies shift more than far ones)
  - the existing `mv-check` journey (10 steps, no console errors) and interactions (hover, click, portals, panels, certificate viewer)
  - a check with one texture request blocked: no page error, and the fallback renders
- **Regression:** `classic-check`, `mv-interact reduced-motion`, and the mobile `mh-check` and cosmos checks still pass.
- **Build:** `CI=true npm run build` → "Compiled successfully."

## 8. Constraints
- Work on branch `worktree-multiverse` with local commits only. Never push or deploy.
- CRA 5, React 18, TypeScript 4.9, three 0.165, @react-three/fiber 8, drei 9. No new dependencies.
- Downloading the imagery requires the owner's explicit approval of the exact file list (names, source, sizes) at build time.
