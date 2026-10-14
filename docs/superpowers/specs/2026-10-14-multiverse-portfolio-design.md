# Multiverse Portfolio: Design Spec

**Date:** 2026-10-14
**Status:** Approved in conversation; awaiting written-spec review
**Owner:** Sudhir Vishwakarma
**Reference prototype:** `src/lab/` (served at `/#lab`); to be removed when this ships

## 1. Goal

Replace the current portfolio with an immersive 3D "solar system and multiverse" experience, similar in feel to igloo.inc and lusion.co. It must show **all** of the existing portfolio content and keep **all** of its features. Recruiters must still be able to read, select and click everything.

### Success criteria
- Every piece of content listed in §4 is reachable and readable in the multiverse.
- Every existing feature still works: the typing words, the CV viewer and download, the social links, the certificate viewer, project Live Demo links, and the SMTP contact form.
- Moving between universes is a hyperspeed jump through a portal. Moving within a universe is a smooth camera glide.
- The classic site is still available, and visitors who can't run the 3D get it automatically.
- The site runs smoothly on a typical laptop GPU. There are no shader-compile stutters mid-warp.
- `npm run build` passes, and the unit tests in §9 pass.

### Non-goals
- No 3D on phones. Phones get the classic site (see §3).
- No CMS or backend for content. Content stays in a TypeScript file.
- No custom 3D models from artists. Visuals are procedural (shaders, particles, geometry).
- No deployment as part of this work. The owner commits, pushes and deploys.

## 2. Decisions made

| Decision | Choice |
|---|---|
| Site role | The multiverse replaces the main site. Classic stays as a fallback at `/#classic`. |
| Navigation | A guided scroll journey through every universe, plus an always-visible menu and planet clicks to jump anywhere |
| Approach | One continuous 3D world, moved through in discrete steps (not scroll-scrubbed) |
| Home | The solar system itself; the sun is Sudhir and the 6 planets are the other universes |
| Realatte dates | **Feb 2026 – Nov 2026** (the owner's latest value; the current code says Apr 2026) |

## 3. Routing and fallback (`src/App.tsx`)

Rules are checked in this order:
1. `#classic` → classic site.
2. `shouldUseClassic()` is true → classic site. This is true when any of these hold:
   - WebGL2 isn't available
   - `prefers-reduced-motion: reduce`
   - the viewport is narrower than 768px or the primary input is coarse (touch)
   - `navigator.deviceMemory` is below 4, where the browser reports it
3. Otherwise → the multiverse (`React.lazy`, loaded as its own chunk).

Universe deep links use the hash: `#home`, `#about`, `#skills`, `#certifications`, `#work`, `#projects`, `#contact`. They open the multiverse at that universe. If a fallback rule applies, the same hash opens the matching classic section (the classic site's `activeSection`): `home`→Home, `about`/`skills`/`certifications`→About, `work`→Work, `projects`→Projects, `contact`→Contacts.

An `ErrorBoundary` wraps the multiverse, and a `webglcontextlost` listener is attached. Either one switches to the classic site, so visitors never see a broken page.

## 4. Content model (`src/data/portfolio.ts`)

This is the single source of truth. The classic components (`Dashboard`, `About`, `Skills`, `Projects`, `Contact`) are refactored to read from it, with identical rendered output.

```ts
profile:        { firstName, lastName, greeting: "HELLO I'M", typingWords: string[], bio, title,
                  cvUrl: "/Sudhir-Profile2.pdf", cvDownloadName, photo: "/Images/crop4.png",
                  email, phone, location, linkedinUrl }
socials:        { id: 'facebook'|'linkedin'|'instagram'|'github', label, url }[]
aboutSummary:   string
skills:         { name, group: 'Frontend'|'Backend'|'Database'|'Cloud & DevOps'|'Tools' }[]   // 20 items
education:      { years, title, school }[]                                                    // 4 items
certifications: { title, provider, image, pdf?: string }[]                                    // 4 items
experience:     { role, company, start, end, bullets: string[] }[]                            // 3 items
projects:       { title, shortDescription, description, technologies, status, type,
                  demoUrl?, codeUrl?, featured?, constellation }[]                            // all projects
```

The content is copied exactly from the current components; the owner's text is not reworded. `constellation` is one of `'CRM Platforms' | 'Real Estate' | 'Salesforce Portals' | 'Web Apps'`.

Certificate PDFs go in `public/certificates/`. `pdf` is set per certificate once the files exist. Until then, **View** shows `image`.

## 5. Multiverse architecture (`src/multiverse/`)

```
multiverse/
  Multiverse.tsx       root: Canvas + overlay + loader + error/context-loss handling
  journey.ts           ordered steps + pure navigation helpers (unit-tested)
  store.ts             zustand store: stepIndex, isMoving, modal state, go()/jump()
  input.ts             wheel / key / touch → store, with a movement lock
  camera/CameraRig.tsx damped camera to the current step's pose; warp strength; FOV & shake
  fx/                  Starfield, Hyperspace streaks, Portal, PostFX (bloom, CA, vignette), shaders
  universes/           Home, About, Skills, Certifications, Work, Projects, Contact (3D only)
  overlay/             HTML panels per universe/beat, TopBar menu, progress, modals
  multiverse.css
```

### 5.1 Journey (`journey.ts`)
Each step is `{ universe, beat, camera: { pos, look } }`. The order is fixed:

| # | Universe | Beat |
|---|---|---|
| 0 | home | hero |
| 1 | about | summary |
| 2 | about | education |
| 3 | skills | belt |
| 4 | certifications | archive |
| 5 | work | job 0 (newest: Realatte) |
| 6 | work | job 1 (Starz Ventures) |
| 7 | work | job 2 (Entrance1.com) |
| 8 | projects | galaxy |
| 9 | contact | station |

Universes are spaced 400 units apart along −z. Universe *n*'s origin is `(0, 0, −400·n)`, and its portal stands at the entrance, 14 units in front of the origin. Moving to a step in the **same** universe is a glide. Moving to a **different** universe is a warp. The camera passes through that universe's portal, and the portal shows a live preview of the universe behind it.

The helpers are pure functions, unit-tested: `next(i)`, `prev(i)`, `firstStepOf(universe)`, `universeOf(i)`, `isWarp(from, to)`, `hashFor(i)`, `stepForHash(hash)`.

### 5.2 State and input
- The `zustand` store (added explicitly to `package.json`) holds `stepIndex`, `isMoving` and `openModal`.
- `go(±1)` and `jump(i)` are ignored while `isMoving`.
- Wheel uses `|deltaY| > 20`. Keys: arrows, PageUp/PageDown, Space, Home, End. Touch swipe uses a threshold of more than 40px.
- **Esc** closes a modal if one is open; otherwise it does nothing.
- Input is ignored while a modal is open, or while focus is in a form field (so the contact form can be typed in and scrolled).
- A jump across several universes is one continuous warp straight to the target portal, not several hops.
- The hash updates on arrival. `hashchange` and browser Back/Forward call `jump()`.

### 5.3 Camera and transitions
- **Glide** (same universe): damped toward the target with smoothTime ≈ 0.6s, which settles in about 0.9s.
- **Warp** (new universe): smoothTime ≈ 0.85s, which settles in about 1.6s. Warp strength comes from camera speed and drives:
  - the length and opacity of the streaks
  - the FOV, from 55° up to 93°
  - camera shake
  - the strength of the chromatic aberration
- **Mouse parallax** on every step.
- **`isMoving` clears** when the camera is within 0.5 units of its target.
- **`CameraRig` mounts first** in the canvas, so camera-following objects never lag behind it. This was a bug found in the prototype.

### 5.4 Rendering budget
- `dpr` is capped at `[1, 1.75]`.
- Only the current universe ±1 is mounted visible and animating; the others are `visible=false` and their `useFrame` work returns early.
- Shaders are compiled up front: `<Preload all />` for the main scene, and every portal is shown briefly behind the intro curtain (a prototype fix).
- drei `PerformanceMonitor`: when frame rate falls, step the dpr down to 1, then disable Bloom.
- Postprocessing: Bloom (mipmapBlur), ChromaticAberration tied to warp strength, and Vignette.

## 6. The universes

Each universe has a distinct palette and its own planets and stars. HTML panels sit in the overlay layer, not in WebGL. They animate in once the camera settles on the step and out when the camera leaves.

### 6.1 Home: the solar system (step 0)
- **3D:** a procedural sun shader with bloom, and 6 planets on orbits, one per other universe, each with its own palette and a ring on Projects. Hovering a planet enlarges it, brightens its atmosphere and shows a label with a tagline. Clicking it calls `jump(firstStepOf(universe))`.
- **Panel (left):** "HELLO I'M", the name in large type, "A PASSIONATE" plus the **auto-typing words** (the same words and timing as today: type 100ms, delete 50ms, pause 2s), the bio, **View CV** (opens the PDF viewer modal with a Download button inside) and **Download CV** (direct download), and the 4 social icons.

### 6.2 About: Origin Nebula (steps 1–2)
- **3D:** a blue and cyan nebula (particles plus glow sprites), and a central planet with an **education orbit path holding 4 moons**.
- **Step 1 panel:** the "About Me" summary.
- **Step 2:** the camera glides along the orbit. The panel shows the Education timeline (4 entries). The moon for each entry lights up as its entry animates in.

### 6.3 Technical Skills: Tech Asteroid Belt (step 3)
- **3D:** a glowing core with **20 skill crystals** in a ring, coloured by group, rotating slowly. Hovering a crystal shows its name in 3D and scales it up.
- **Panel:** the skills as tags, grouped under the 5 group headings.

### 6.4 Certifications: Archive of Light (step 4)
- **3D:** a golden star with **4 holographic plaques** orbiting it.
- **Panel:** the 4 certificates (title, provider and a **View** button). View opens a modal showing the PDF in an iframe when `pdf` is set, otherwise the image. The modal closes on ×, a click on the backdrop, or Esc.

### 6.5 Work Experience: Career Galaxy (steps 5–7)
- **3D:** **3 company planets** along a gently curving path, with a faint trail connecting them. The camera flies to each planet in turn, newest first.
- **Panel per step:** role, company, dates and all bullet points, with a "1/3" indicator.

### 6.6 My Projects: Project Galaxy (step 8)
- **3D:** a spiral galaxy of background particles. **Every project is a star.** Featured projects are larger and brighter with a flare sprite. Stars are grouped into 4 **constellations** joined by faint lines, each with a constellation label. Dragging rotates the galaxy within limits.
- **Hovering a star** shows the project title as a 3D label.
- **Clicking a star** opens a **detail panel**: title, type, status, the full description (split into paragraphs as the classic modal does), all tech badges, and **Live Demo** and **Code** links in a new tab.
- **"View as list"** toggle: a scrollable HTML list of every project, opening the same detail panel. This lets visitors reach every project without hunting for stars.

### 6.7 Contact: Transmission Station (step 9)
- **3D:** a beacon station with a rotating dish and blinking lights.
- **Panel:** email, phone, location and LinkedIn, plus the **SMTP form**. It posts to `/api/contact` with the same fields and validation as the classic site, shows a "Sending…" state, and shows the server's error message on failure.
- **On success:** the toast appears, and **a beam of light fires from the dish into space**.

## 7. Overlay UI
- **Top bar:**
  - the "SV" monogram, which goes to Home
  - the 7 universe links (Home, About, Skills, Certifications, Work, Projects, Contact) with the current one highlighted
  - a "Classic view" link (`#classic`)
- **Right edge:** a progress indicator with 10 dots, grouped by universe. Clicking a dot jumps to that step.
- **Bottom:** a scroll hint that changes per step ("Scroll to warp to About", "Scroll for Education", …).
- **Loader:** a full-screen black layer with drei `useProgress` percentage ("Igniting the sun… 64%"). It fades out over the sun ignition once everything is loaded and compiled.

## 8. Error handling
- **3D crash:** the `ErrorBoundary` or a `webglcontextlost` event sets classic mode, so the visitor gets the classic site.
- **Contact form:** existing behaviour — a network or server error shows the message under the form.
- **Missing certificate PDF:** if the PDF responds 404 (checked once when the modal opens), the image is shown instead.
- **Broken image or asset loads:** a component with a missing texture still renders its untextured material. Nothing should block the loader for more than 10s; after 10s the loader proceeds anyway.

## 9. Testing
- **Unit (Jest via `react-scripts test`):**
  - `journey.ts`: step order, `next`/`prev` limits, `isWarp`, hash↔step round trip, `firstStepOf`
  - `shouldUseClassic()`: each rule, using mocked `matchMedia`, the WebGL check and the viewport
  - `portfolio.ts`: required fields present, 20 skills, 4 education entries, 4 certifications, 3 jobs, and every project has a title, description, at least one technology and a constellation
- **Build:** `npm run build` passes after every phase.
- **Visual:** headless Chrome (puppeteer-core plus the system Chrome with SwiftShader) captures every step **from the canvas** (`preserveDrawingBuffer` injected), plus the overlay screenshot. Headless compositor screenshots can show black frames that aren't real, so canvas captures are the source of truth.
- **Manual:** the owner checks the feel and smoothness on their own GPU.

## 10. Delivery phases
1. **Foundations:** `portfolio.ts`, classic components refactored to use it (the output looks the same), routing, `shouldUseClassic`, `#classic`, ErrorBoundary. Tests for the data and the routing.
2. **Engine:** journey, store, input, CameraRig, Starfield, Hyperspace, the generic Portal, PostFX, top bar, progress and hint. Placeholder universes. Tests for the journey.
3. **Universes, one at a time:** Home → About → Skills → Certifications → Work → Projects → Contact, each with its panels and modals.
4. **Polish:** PerformanceMonitor tuning, accessibility pass (focus order, labels, Esc), title and meta in `index.html`, removal of `src/lab/`, final visual pass.

Each phase ends with a passing build and tests, and a runnable site.

## 11. Constraints
- **No commits, pushes or deploys by Claude.** The owner does these.
- Stack: CRA 5, React 18, TypeScript 4.9, three 0.165, @react-three/fiber 8, drei 9, @react-three/postprocessing 2, maath, plus `zustand`.
- The classic site's look and behaviour must not change, apart from reading from the shared data file and using the corrected Realatte dates.
