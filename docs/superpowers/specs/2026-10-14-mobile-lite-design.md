# Mobile Multiverse Lite: Design Spec

**Date:** 2026-10-14
**Status:** Approved in conversation; awaiting written-spec review
**Owner:** Sudhir Vishwakarma
**Builds on:** `docs/superpowers/specs/2026-10-14-multiverse-portfolio-design.md` (the desktop multiverse)
**Branch:** `worktree-multiverse` (local only; the owner pushes and deploys)

## 1. Goal

Phones and touch tablets currently get the classic site, which reads as a squeezed desktop page:
- a huge photo with floating decorative shapes
- unlabelled icon navigation
- nested cards
- a 7,000 px project list whose lower cards render faded

Replace it with a **professional, phone-first "multiverse lite"**: the same space brand as the desktop 3D site, built for touch, readability and speed.

### Success criteria
- Every piece of portfolio content and every feature is reachable on a phone:
  - Home: typing intro, CV view and download, social links
  - About and Education
  - Certifications (with a viewer)
  - Skills
  - Work: all 3 jobs, all bullets
  - Projects: all 23, with full details and links
  - Contact: the working SMTP form
- No horizontal scrolling at 360, 390 and 768 px widths, or at 844×390 landscape.
- Every tap target is at least 44 px. Text contrast meets WCAG AA.
- The mobile code path does not load `three` or any `@react-three/*` package.
- Lighthouse mobile performance aim: 90 or more.
- `CI=true npm run build` ends with "Compiled successfully." and all tests pass.
- The desktop multiverse and the classic site keep working (no regressions).

### Non-goals
- No WebGL on mobile.
- No changes to the desktop multiverse's behaviour.
- No content changes. Content comes only from `src/data/portfolio.ts`.
- No deployment.

## 2. Decisions made

| Decision | Choice |
|---|---|
| Direction | A mobile multiverse lite (space-themed, lightweight), not a plain redesign and not full 3D |
| Devices | Phones and touch tablets: any viewport under 768 px, or a coarse primary pointer |
| Approach | One vertical scroll page, a 2D canvas starfield, a CSS/SVG solar-system hero, hyperspeed streaks on nav taps, reveal-on-scroll |
| Certifications | Inside the About section, so the bottom nav has 6 items |

## 3. Routing (`src/routing/mode.ts`)

Replace the boolean with a three-way decision: `chooseMode(env: DeviceEnv, hash: string): 'classic' | 'mobile' | 'multiverse'`.

Rules, in order:
1. `hash === '#classic'` → `'classic'`
2. `env.width < 768 || env.coarsePointer` → `'mobile'` (including reduced-motion phones)
3. `!env.webgl2 || env.reducedMotion || (env.deviceMemory !== undefined && env.deviceMemory < 4)` → `'classic'`
4. otherwise → `'multiverse'`

`shouldUseClassic` is replaced by `chooseMode`. Its existing tests are rewritten to cover all four rules.

`App.tsx` lazy-loads `src/mobile/MobileApp.tsx` as its own chunk, just as it does for the multiverse. A crash in the mobile app (ErrorBoundary) falls back to classic, at the current hash's section.

## 4. Architecture (`src/mobile/`)

```
mobile/
  MobileApp.tsx          page shell: starfield, top bar, sections, bottom nav, warp overlay, sheets
  mobile.css             all mobile styles (design tokens as CSS custom properties)
  sections.ts            section ids, labels, nav icons, palette accent per section (pure)
  projectFilter.ts       pure: filter by constellation, featured ordering, initial-visible slice (tested)
  bullets.ts             pure: visibleBullets(bullets, expanded, n = 2) (tested)
  useReveal.ts           IntersectionObserver: adds .is-revealed once an element is 15% visible
  useActiveSection.ts    IntersectionObserver: current section id; history.replaceState(hash)
  StarfieldCanvas.tsx    2D canvas starfield (≈250 stars, slow drift, twinkle)
  WarpOverlay.tsx        0.6 s hyperspeed streak flash (2D canvas, mounted only while playing)
  SolarHero.tsx          CSS/SVG sun with circular profile photo plus 3 orbiting planets
  BottomNav.tsx          6 labelled items with the active state
  Sheet.tsx              bottom sheet / full-screen viewer (close: ✕, backdrop, swipe-down, Back, Esc)
  sections/
    HomeSection.tsx
    AboutSection.tsx         (summary + education + certifications)
    SkillsSection.tsx
    WorkSection.tsx
    ProjectsSection.tsx
    ContactSection.tsx
    Footer.tsx
```

**Reused from shared code:**
- `src/data/portfolio.ts` for all content
- `useTypewriter` and `useContactForm` (from `src/hooks/`)
- `SocialIcons`
- `resolveCertificateSource`, moved from `src/multiverse/overlay/` to `src/data/certificateSource.ts`, with the multiverse import updated and its test moved alongside
- `PALETTES` from `src/multiverse/fx/palettes.ts` (pure, no three)

`sections.ts` IDs match the desktop universe hashes: `home, about, skills, work, projects, contact`. On mobile, `#certifications` resolves to the About section (it scrolls to the certifications block inside it).

## 5. Visual design

- **Tokens:**
  - background `#000004`
  - accent `#FF7A00`
  - text `#F5F5F5` / `rgba(255,255,255,0.72)`
  - card background `rgba(255,255,255,0.04)` with a `rgba(255,255,255,0.10)` border
  - radius 16 px
  - side gutter 20 px
  - section spacing 72 px
- **Typography:** use `clamp()`: hero name `clamp(2.4rem, 11vw, 3.2rem)`, section headings 1.6 rem, body 0.95 rem / 1.65 line height.
- **Section accent:** each section uses its desktop universe's palette (`PALETTES[id].atmos`) for a soft radial glow behind the heading, the kicker colour, and active nav tinting.
- **Top bar:** slim and translucent, holding the "SV" monogram, which scrolls to Home.
- **Bottom nav:**
  - fixed; height 64 px plus `env(safe-area-inset-bottom)`; translucent blur
  - Home · About · Skills · Work · Projects · Contact, each with an icon and a label
  - the active item is tinted with its section accent

### Sections
- **Home:**
  - SolarHero, about 240 px square, with the profile photo cropped into a circle inside a glowing sun and 3 planets on CSS-animated orbits
  - "HELLO I'M", the name, then "A PASSIONATE" plus the typing words
  - the bio
  - **View CV** opens `profile.cvUrl` in a new tab, so the phone's native PDF viewer handles it
  - **Download CV** uses the `download` attribute
  - the social icons row
- **About:**
  - the summary card
  - the Education vertical timeline (4 items, glowing dots)
  - Certifications as 4 compact cards. **View** opens Sheet full-screen with the certificate image. When `resolveCertificateSource` returns `pdf`, the sheet also shows an **Open PDF** link (new tab). Opening a tab directly after the async check would be blocked as a popup.
- **Skills:** the 5 group headings, each with a colour dot, and skill chips.
- **Work:**
  - a vertical timeline with 3 entries, each showing role, company and `start – end`
  - the first 2 bullets show, and a **Show more / Show less** toggle (`aria-expanded`) reveals the rest
- **Projects:**
  - filter chips: All · CRM · Salesforce · Real Estate · Web Apps, mapped to the constellations
  - compact cards: title, ★ if featured, short description, up to 3 trimmed tech badges, **Live Demo** (new tab) and **Details**
  - the order is newest first (`newestFirst`)
  - the initial view shows 6 cards; **Show all N** expands the rest
  - **Details** opens Sheet (bottom sheet): title, type, status, `descriptionParagraphs`, all tech, and the links
- **Contact:**
  - tappable rows: `mailto:`, `tel:` with spaces stripped, and the LinkedIn profile (new tab)
  - the form uses `useContactForm` with the same fields and validation as the other versions, the "Sending…" label and the server error message
  - on success: the toast, plus a CSS light beam rising from the heading icon
- **Footer:** social icons, "Classic view" (`#classic`) and © year.

## 6. Behaviour

- **Scrolling:** native vertical scrolling, never hijacked.
- **Nav taps:**
  - play WarpOverlay (≈0.6 s; streaks radiate from the centre, accent tinted)
  - at the warp's midpoint, run `element.scrollIntoView({ behavior: 'instant' })` on the target section
  - with reduced motion, there is no warp, only `scrollIntoView({ behavior: 'auto' })`
- **Active section:**
  - `useActiveSection` observes the sections. The section crossing a 40% viewport line is active.
  - It updates the nav, then calls `history.replaceState(null, '', '#' + id)`. This never pushes history entries.
- **Initial hash:** on load, scroll to the section for `location.hash`, if valid. `#certifications` goes to About's certifications block.
- **Reveal:** elements with `data-reveal` fade and slide up 16 px when revealed. With reduced motion they fade only.
- **Sheets:**
  - lock body scroll while open
  - focus the close button on open, and restore focus to the opener on close
  - close on ✕, a backdrop tap, a swipe-down of more than 80 px on the handle, Esc, or the browser Back button. Opening a sheet pushes a `#sheet` history state; Back pops it and closes the sheet.
- **Starfield:**
  - devicePixelRatio is capped at 2
  - it resizes with the viewport
  - `requestAnimationFrame` pauses when `document.hidden`
  - with reduced motion it draws a single static frame
  - if a 2D context is unavailable, it renders nothing (a plain dark background)

## 7. Performance

- The mobile chunk must not import `three`, `@react-three/*`, `maath` or `src/multiverse/*` component modules. Pure modules such as `palettes.ts` and `journey.ts` types are fine.
- Images:
  - `loading="lazy"` on everything below the fold
  - the hero photo is eager-loaded and given explicit `width` and `height`
- No layout shift from fonts or images (explicit sizes).

## 8. Accessibility

- Tap targets are at least 44×44 px.
- Nav buttons have labels and `aria-current="true"` on the active one.
- Sheets use `role="dialog"`, `aria-modal`, and an `aria-label` naming the content.
- Toggle buttons expose `aria-expanded`.
- Focus is visible everywhere, with an orange outline.
- Contrast meets WCAG AA. Body text is at least 0.9 rem.
- Safe areas: `env(safe-area-inset-*)` on the top bar, the bottom nav and sheets.

## 9. Testing

- **Unit (Jest):**
  - `chooseMode`: all 4 rules plus precedence
  - `projectFilter`: All returns 23; each constellation count is 2, 4, 4 and 13; newest first; the initial slice is 6
  - `visibleBullets`: collapsed returns 2, expanded returns all, a short list is returned unchanged
  - `certificateSource`: the tests move with the module and still pass
- **Headless Chrome (puppeteer-core)**, at 360×740, 390×844, 768×1024 (touch) and 844×390 (landscape), checking:
  - the mobile version is chosen
  - no horizontal overflow
  - every section's key text is present
  - nav taps reach each section (the hash updates)
  - Projects: a filter, Show all, and Details open and close with Back
  - certificate viewer open and close
  - Show more toggles
  - the contact form with `/api/contact` mocked (toast appears)
  - full-page screenshots of each section, reviewed by eye
- **Regression:** re-run the desktop `mv-check.js` (10 steps) and `classic-check.js` (`#classic`).
- **Build:** `CI=true npm run build` → "Compiled successfully."

## 10. Constraints

- Work only on branch `worktree-multiverse`, with local commits. Never push or deploy.
- Stack: CRA 5, React 18, TypeScript 4.9. No new runtime dependencies.
- Content strings come only from `src/data/portfolio.ts`, verbatim.
