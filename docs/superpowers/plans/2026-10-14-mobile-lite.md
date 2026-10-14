# Mobile Multiverse Lite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give phones and touch tablets a professional, space-themed, phone-first portfolio: one vertical scroll page with a 2D starfield, a CSS solar-system hero, a labelled bottom nav, hyperspeed nav transitions, and every piece of portfolio content.

**Architecture:**
- **Routing:** `src/routing/mode.ts` gains a three-way `chooseMode`. `App.tsx` lazy-loads `src/mobile/MobileApp.tsx` for mobile devices; the chunk contains no three.js.
- **Logic:** pure helper modules (`sections.ts`, `projectFilter.ts`, `bullets.ts`, `src/data/certificateSource.ts`) hold the testable logic.
- **Sections:** components register in `sections/registry.ts`, the same pattern as the desktop multiverse registries.
- **Shared code:** content, hooks and social icons are shared with the desktop and classic sites.

**Tech Stack:** CRA 5 (react-scripts 5.0.1), React 18, TypeScript 4.9, Jest 27 (bundled). The 2D Canvas API and IntersectionObserver/MutationObserver come with the browser, so no new dependencies are needed.

**Spec:** `docs/superpowers/specs/2026-10-14-mobile-lite-design.md`

## Global Constraints

- **Git:**
  - Work only on branch `worktree-multiverse`, in `/home/sudhirvishwakarma/Documents/Landing Pages/Second-Portfolio-Sudhir/.claude/worktrees/multiverse`.
  - Make local commits; never `git push`, never deploy.
  - Before every commit, run `git checkout -- build` and then `git clean -fdq build`, and stage files explicitly.
- **Build:** `CI=true npm run build` must end with **"Compiled successfully."** (zero warnings).
- **Tests:** run with `CI=true npx react-scripts test --watchAll=false <path>`.
- **Mobile chunk imports:** nothing under `src/mobile/` may import `three`, `@react-three/*`, `maath`, or any `.tsx` file under `src/multiverse/`. `src/multiverse/fx/palettes.ts` and `src/multiverse/journey.ts` are pure and allowed.
- **Content:** strings come only from `src/data/portfolio.ts`, verbatim. No new runtime dependencies.
- **Design tokens:**

  | Token | Value |
  |---|---|
  | background | `#000004` |
  | accent | `#FF7A00` |
  | text | `#F5F5F5` |
  | muted text | `rgba(255,255,255,0.72)` |
  | card background | `rgba(255,255,255,0.04)` |
  | card border | `rgba(255,255,255,0.10)` |
  | radius | 16px |
  | gutter | 20px |
  | section spacing | 72px |
- **Layout and accessibility:**
  - Tap targets are at least 44×44px.
  - Contrast meets WCAG AA.
  - Use `env(safe-area-inset-*)` on the top bar, the bottom nav and sheets.
- **Section ids and labels** (the bottom nav order): `home, about, skills, work, projects, contact` with labels Home · About · Skills · Work · Projects · Contact.
  - Each section's accent colour is `PALETTES[id].atmos`.
  - The hash `#certifications` maps to section `about`, anchor `certifications`.
- **Scripts:**
  - `$SCRATCH` = `/tmp/claude-1002/-home-sudhirvishwakarma-Documents-Landing-Pages-Second-Portfolio-Sudhir/01c9bdce-01ed-4d1b-ae64-6685ae80a718/scratchpad`.
  - `puppeteer-core` is installed in `$SCRATCH/shots`.
  - Serve builds with `npx -y serve@14.2.4 -s build -l 3005` (in the background), and stop the server afterwards.
  - Never send real email; mock `/api/contact`.

## Review Focus

1. **Narrow phones (320px) and long strings** (LinkedIn URL, long tech names, project titles) must not cause sideways scrolling. Pinned by the 320px overflow assertion in `mobile-check.js` (Task 9), plus `overflow-wrap: anywhere` in Task 2's base CSS.
2. **Items rendered after the first paint** ("Show all 23", "Show more" bullets, a filter change) must become visible. The classic site's faded-cards bug must not recur. Pinned by the `useReveal` MutationObserver test in Task 3.
3. **The phone's Back button while a sheet is open** must close the sheet, not leave the site. Pinned by the `back-closes-sheet` scenario in `mobile-check.js` (Task 9).
4. **Deep links** such as `#certifications`, `#work` or an unknown `#foo` on a phone must land on the right section, or stay at the top. Pinned by the `sectionForHash` tests in Task 1.
5. **Reduced-motion phones** must still get the mobile site, with no warp animation and static stars. Pinned by the `chooseMode` precedence test in Task 2 and the reduced-motion scenario in Task 9.

---

## File Structure

```
src/data/certificateSource.ts (+ .test.ts)   moved from src/multiverse/overlay/
src/routing/mode.ts (+ .test.ts)             chooseMode replaces shouldUseClassic
src/App.tsx                                  three-way routing, lazy MobileApp
src/mobile/
  sections.ts (+ .test.ts)        section ids/labels/accents, sectionForHash
  projectFilter.ts (+ .test.ts)   filters, ordering, initial slice, topTech
  bullets.ts (+ .test.ts)         visibleBullets, hasHiddenBullets
  useReducedMotion.ts             prefers-reduced-motion hook
  useReveal.ts (+ .test.tsx)      reveal-on-scroll incl. late-added nodes
  useActiveSection.ts             active section + replaceState hash
  MobileApp.tsx                   page shell
  mobile.css                      all styles
  BottomNav.tsx, TopBar.tsx, SectionHeading.tsx, Sheet.tsx
  StarfieldCanvas.tsx, WarpOverlay.tsx, SolarHero.tsx
  sections/registry.ts, GenericSection.tsx, Footer.tsx
  sections/HomeSection.tsx, AboutSection.tsx, SkillsSection.tsx,
  sections/WorkSection.tsx, ProjectsSection.tsx, ContactSection.tsx
```

---

### Task 1: Pure helpers and the certificate-source move

**Files:**
- Move: `src/multiverse/overlay/certificateSource.ts` → `src/data/certificateSource.ts`; `src/multiverse/overlay/certificateSource.test.ts` → `src/data/certificateSource.test.ts`
- Modify: `src/multiverse/overlay/modals/CertificateModal.tsx` (import path)
- Create: `src/mobile/sections.ts`, `src/mobile/projectFilter.ts`, `src/mobile/bullets.ts`
- Test: `src/mobile/sections.test.ts`, `src/mobile/projectFilter.test.ts`, `src/mobile/bullets.test.ts`

**Interfaces:**
- Produces:
  - `MobileSectionId`, `MobileSection { id; label; accent }`, `MOBILE_SECTIONS`, `sectionForHash(hash): { id: MobileSectionId; anchor: string } | null`
  - `ProjectFilter`, `FILTERS`, `INITIAL_VISIBLE = 6`, `filterProjects(items, filter)`, `visibleProjects(list, showAll)`, `topTech(p, n = 3)`
  - `COLLAPSED_BULLETS = 2`, `visibleBullets(bullets, expanded, n?)`, `hasHiddenBullets(bullets, n?)`
  - `resolveCertificateSource` and `CertificateSource`, now in `src/data/certificateSource.ts`

- [ ] **Step 1: Move the certificate module and its test**

```bash
git mv src/multiverse/overlay/certificateSource.ts src/data/certificateSource.ts
git mv src/multiverse/overlay/certificateSource.test.ts src/data/certificateSource.test.ts
```

In `src/data/certificateSource.ts`, change the import to `import { Certification } from './portfolio';`.
In `src/multiverse/overlay/modals/CertificateModal.tsx`, change the import to `import { CertificateSource, resolveCertificateSource } from '../../../data/certificateSource';`.

Run: `CI=true npx react-scripts test --watchAll=false src/data` → PASS (portfolio and certificateSource suites).

- [ ] **Step 2: Write the failing tests**

`src/mobile/sections.test.ts`:

```ts
import { MOBILE_SECTIONS, sectionForHash } from './sections';
import { PALETTES } from '../multiverse/fx/palettes';

test('six sections in nav order with labels and accents', () => {
  expect(MOBILE_SECTIONS.map((s) => s.id)).toEqual(['home', 'about', 'skills', 'work', 'projects', 'contact']);
  expect(MOBILE_SECTIONS.map((s) => s.label)).toEqual(['Home', 'About', 'Skills', 'Work', 'Projects', 'Contact']);
  MOBILE_SECTIONS.forEach((s) => expect(s.accent).toBe(PALETTES[s.id].atmos));
});

test('deep links land on the right section', () => {
  expect(sectionForHash('#work')).toEqual({ id: 'work', anchor: 'work' });
  expect(sectionForHash('#certifications')).toEqual({ id: 'about', anchor: 'certifications' });
  expect(sectionForHash('#home')).toEqual({ id: 'home', anchor: 'home' });
});

test('empty, classic and unknown hashes are ignored', () => {
  expect(sectionForHash('')).toBeNull();
  expect(sectionForHash('#')).toBeNull();
  expect(sectionForHash('#classic')).toBeNull();
  expect(sectionForHash('#foo')).toBeNull();
});
```

`src/mobile/projectFilter.test.ts`:

```ts
import { FILTERS, INITIAL_VISIBLE, filterProjects, visibleProjects, topTech } from './projectFilter';
import { projects } from '../data/portfolio';

test('All returns every project, newest first', () => {
  const all = filterProjects(projects, 'All');
  expect(all).toHaveLength(23);
  expect(all[0].title).toBe('Shubhdhanam CRM');
  expect(all[all.length - 1].title).toBe('Weather App');
});

test('each constellation filter returns its projects', () => {
  expect(filterProjects(projects, 'CRM Platforms')).toHaveLength(2);
  expect(filterProjects(projects, 'Salesforce Portals')).toHaveLength(4);
  expect(filterProjects(projects, 'Real Estate')).toHaveLength(4);
  expect(filterProjects(projects, 'Web Apps')).toHaveLength(13);
});

test('filters are labelled for the chips', () => {
  expect(FILTERS.map((f) => f.label)).toEqual(['All', 'CRM', 'Salesforce', 'Real Estate', 'Web Apps']);
});

test('initially shows 6, show all reveals the rest', () => {
  const all = filterProjects(projects, 'All');
  expect(INITIAL_VISIBLE).toBe(6);
  expect(visibleProjects(all, false)).toHaveLength(6);
  expect(visibleProjects(all, true)).toHaveLength(23);
  expect(visibleProjects(filterProjects(projects, 'CRM Platforms'), false)).toHaveLength(2);
});

test('topTech trims and limits technologies', () => {
  const p = { ...projects[0], technologies: [' API Integration ', 'React', '', 'Next', 'MySQL'] };
  expect(topTech(p)).toEqual(['API Integration', 'React', 'Next']);
  expect(topTech(p, 5)).toEqual(['API Integration', 'React', 'Next', 'MySQL']);
});
```

`src/mobile/bullets.test.ts`:

```ts
import { COLLAPSED_BULLETS, visibleBullets, hasHiddenBullets } from './bullets';

const five = ['a', 'b', 'c', 'd', 'e'];

test('collapsed shows the first two, expanded shows all', () => {
  expect(COLLAPSED_BULLETS).toBe(2);
  expect(visibleBullets(five, false)).toEqual(['a', 'b']);
  expect(visibleBullets(five, true)).toEqual(five);
});

test('short lists are unchanged and report nothing hidden', () => {
  expect(visibleBullets(['a'], false)).toEqual(['a']);
  expect(hasHiddenBullets(['a', 'b'])).toBe(false);
  expect(hasHiddenBullets(five)).toBe(true);
});

test('never mutates the input', () => {
  const src = [...five];
  visibleBullets(src, true).push('x');
  expect(src).toEqual(five);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/mobile`
Expected: FAIL — modules not found.

- [ ] **Step 4: Implement**

`src/mobile/sections.ts`:

```ts
import { PALETTES } from '../multiverse/fx/palettes';

export type MobileSectionId = 'home' | 'about' | 'skills' | 'work' | 'projects' | 'contact';
export interface MobileSection { id: MobileSectionId; label: string; accent: string }

const LABELS: Record<MobileSectionId, string> = {
  home: 'Home',
  about: 'About',
  skills: 'Skills',
  work: 'Work',
  projects: 'Projects',
  contact: 'Contact',
};

export const MOBILE_SECTIONS: MobileSection[] = (['home', 'about', 'skills', 'work', 'projects', 'contact'] as MobileSectionId[]).map(
  (id) => ({ id, label: LABELS[id], accent: PALETTES[id].atmos })
);

/** Map a URL hash to the section (and in-page anchor) to scroll to. */
export function sectionForHash(hash: string): { id: MobileSectionId; anchor: string } | null {
  const key = hash.replace(/^#/, '');
  if (key === 'certifications') return { id: 'about', anchor: 'certifications' };
  const match = MOBILE_SECTIONS.find((s) => s.id === key);
  return match ? { id: match.id, anchor: match.id } : null;
}
```

`src/mobile/projectFilter.ts`:

```ts
import { Constellation, Project, newestFirst } from '../data/portfolio';

export type ProjectFilter = 'All' | Constellation;

export const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'CRM Platforms', label: 'CRM' },
  { id: 'Salesforce Portals', label: 'Salesforce' },
  { id: 'Real Estate', label: 'Real Estate' },
  { id: 'Web Apps', label: 'Web Apps' },
];

export const INITIAL_VISIBLE = 6;

export function filterProjects(items: readonly Project[], filter: ProjectFilter): Project[] {
  const ordered = newestFirst(items);
  return filter === 'All' ? ordered : ordered.filter((p) => p.constellation === filter);
}

export function visibleProjects(list: Project[], showAll: boolean): Project[] {
  return showAll ? list : list.slice(0, INITIAL_VISIBLE);
}

export function topTech(p: Project, n = 3): string[] {
  return p.technologies.map((t) => t.trim()).filter(Boolean).slice(0, n);
}
```

`src/mobile/bullets.ts`:

```ts
export const COLLAPSED_BULLETS = 2;

export function visibleBullets(bullets: readonly string[], expanded: boolean, n = COLLAPSED_BULLETS): string[] {
  return expanded ? [...bullets] : bullets.slice(0, n);
}

export function hasHiddenBullets(bullets: readonly string[], n = COLLAPSED_BULLETS): boolean {
  return bullets.length > n;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/mobile src/data`
Expected: PASS (5 suites).

- [ ] **Step 6: Commit**

`CI=true npm run build 2>&1 | grep -E "Compiled|Failed"` → `Compiled successfully.` Restore build/, then:

```bash
git add src/data/certificateSource.ts src/data/certificateSource.test.ts src/multiverse/overlay/modals/CertificateModal.tsx src/mobile/sections.ts src/mobile/sections.test.ts src/mobile/projectFilter.ts src/mobile/projectFilter.test.ts src/mobile/bullets.ts src/mobile/bullets.test.ts
git commit -m "feat(mobile): pure section, project filter and bullet helpers; share certificate source"
```

(`git mv` already staged the deletions of the old paths.)

---

### Task 2: Three-way routing and the mobile page shell

**Files:**
- Modify: `src/routing/mode.ts`, `src/routing/mode.test.ts`, `src/App.tsx`
- Create:
  - `src/mobile/MobileApp.tsx`, `src/mobile/mobile.css`
  - `src/mobile/TopBar.tsx`, `src/mobile/BottomNav.tsx`, `src/mobile/SectionHeading.tsx`
  - `src/mobile/useActiveSection.ts`
  - `src/mobile/sections/registry.ts`, `src/mobile/sections/GenericSection.tsx`, `src/mobile/sections/Footer.tsx`

**Interfaces:**
- Consumes: `MOBILE_SECTIONS`, `MobileSectionId`, `sectionForHash` (Task 1); `SocialIcons` (default export; props `className`, `linkClassName`, `size`).
- Produces:
  - `AppMode = 'classic' | 'mobile' | 'multiverse'`, `chooseMode(env, hash): AppMode` (replaces `shouldUseClassic`)
  - `SectionProps { section: MobileSection }`
  - `SECTION_COMPONENTS: Record<MobileSectionId, React.FC<SectionProps>>` (mutable registry; Tasks 4–8 replace entries)
  - `SectionHeading({ kicker, title })`
  - `useActiveSection(ids): MobileSectionId`
  - `BottomNav({ active, onSelect })`
  - `MobileApp` exposes `navigate(id)` internally; Task 3 adds the warp

- [ ] **Step 1: Rewrite `src/routing/mode.test.ts` (failing first)**

```ts
import { chooseMode, classicSectionFor, DeviceEnv } from './mode';

const desktop: DeviceEnv = { webgl2: true, reducedMotion: false, width: 1440, coarsePointer: false, deviceMemory: 8 };

test('a capable desktop gets the multiverse', () => {
  expect(chooseMode(desktop, '')).toBe('multiverse');
  expect(chooseMode({ ...desktop, deviceMemory: undefined }, '#about')).toBe('multiverse');
});

test('#classic always wins', () => {
  expect(chooseMode(desktop, '#classic')).toBe('classic');
  expect(chooseMode({ ...desktop, width: 390, coarsePointer: true }, '#classic')).toBe('classic');
});

test.each([
  ['narrow viewport', { width: 767 }],
  ['touch-first device', { coarsePointer: true }],
  ['reduced-motion phone', { width: 390, coarsePointer: true, reducedMotion: true }],
  ['phone without WebGL2', { width: 390, coarsePointer: true, webgl2: false }],
])('%s gets the mobile site', (_name, patch) => {
  expect(chooseMode({ ...desktop, ...patch }, '')).toBe('mobile');
});

test.each([
  ['no WebGL2', { webgl2: false }],
  ['reduced motion', { reducedMotion: true }],
  ['low memory', { deviceMemory: 2 }],
])('desktop with %s gets the classic site', (_name, patch) => {
  expect(chooseMode({ ...desktop, ...patch }, '')).toBe('classic');
});

test('maps universe hashes onto classic sections', () => {
  expect(classicSectionFor('#about')).toBe('about');
  expect(classicSectionFor('#skills')).toBe('about');
  expect(classicSectionFor('#certifications')).toBe('about');
  expect(classicSectionFor('#work')).toBe('work');
  expect(classicSectionFor('#projects')).toBe('projects');
  expect(classicSectionFor('#contact')).toBe('contacts');
  expect(classicSectionFor('')).toBe('home');
  expect(classicSectionFor('#classic')).toBe('home');
  expect(classicSectionFor('#foo')).toBe('home');
});
```

Run: `CI=true npx react-scripts test --watchAll=false src/routing` → FAIL (`chooseMode` is not exported).

- [ ] **Step 2: Replace `shouldUseClassic` with `chooseMode` in `src/routing/mode.ts`.** Delete the `shouldUseClassic` function and add:

```ts
export type AppMode = 'classic' | 'mobile' | 'multiverse';

export function chooseMode(env: DeviceEnv, hash: string): AppMode {
  if (hash === CLASSIC_HASH) return 'classic';
  if (env.width < 768 || env.coarsePointer) return 'mobile';
  if (!env.webgl2 || env.reducedMotion || (env.deviceMemory !== undefined && env.deviceMemory < 4)) return 'classic';
  return 'multiverse';
}
```

Run: `CI=true npx react-scripts test --watchAll=false src/routing` → PASS.

- [ ] **Step 3: Rewrite `src/App.tsx` for three modes**

```tsx
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import ClassicApp from './ClassicApp';
import { CLASSIC_HASH, chooseMode, classicSectionFor, detectEnv } from './routing/mode';
import { ErrorBoundary } from './routing/ErrorBoundary';

const Multiverse = lazy(() => import('./multiverse/Multiverse'));
const MobileApp = lazy(() => import('./mobile/MobileApp'));

const App: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);
  const [failed, setFailed] = useState(false);
  // Device capability is decided once; only #classic is hash-driven.
  const deviceMode = useMemo(() => chooseMode(detectEnv(), ''), []);

  useEffect(() => {
    const onNav = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onNav);
    window.addEventListener('popstate', onNav);
    return () => {
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('popstate', onNav);
    };
  }, []);

  const mode = failed || hash === CLASSIC_HASH ? 'classic' : deviceMode;

  if (mode === 'classic') {
    // The multiverse and mobile sites move the hash without hashchange events, so a fallback reads the live URL.
    const sectionHash = failed && hash !== CLASSIC_HASH ? window.location.hash : hash;
    return <ClassicApp initialSection={classicSectionFor(sectionHash)} />;
  }

  return (
    <ErrorBoundary onError={() => setFailed(true)}>
      <Suspense fallback={<div className="mv-boot" />}>
        {mode === 'mobile' ? <MobileApp /> : <Multiverse onFail={() => setFailed(true)} />}
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
```

- [ ] **Step 4: Create the shell components**

`src/mobile/SectionHeading.tsx`:

```tsx
import React from 'react';

export const SectionHeading: React.FC<{ kicker: string; title: string }> = ({ kicker, title }) => (
  <header className="mb-heading" data-reveal>
    <span className="mb-kicker">{kicker}</span>
    <h2 className="mb-h2">{title}</h2>
  </header>
);
```

`src/mobile/sections/registry.ts`:

```ts
import React from 'react';
import { MobileSection, MobileSectionId } from '../sections';
import { GenericSection } from './GenericSection';

export interface SectionProps { section: MobileSection }

export const SECTION_COMPONENTS: Record<MobileSectionId, React.FC<SectionProps>> = {
  home: GenericSection,
  about: GenericSection,
  skills: GenericSection,
  work: GenericSection,
  projects: GenericSection,
  contact: GenericSection,
};
```

`src/mobile/sections/GenericSection.tsx` (shown until each section's task replaces it):

```tsx
import React from 'react';
import { SectionHeading } from '../SectionHeading';
import { SectionProps } from './registry';

export const GenericSection: React.FC<SectionProps> = ({ section }) => (
  <SectionHeading kicker={section.label} title={section.label} />
);
```

`src/mobile/sections/Footer.tsx`:

```tsx
import React from 'react';
import SocialIcons from '../../components/SocialIcons';

export const Footer: React.FC = () => (
  <footer className="mb-footer">
    <SocialIcons className="mb-socials" linkClassName="mb-social" size={18} />
    <a className="mb-footer__classic" href="#classic">Classic view</a>
    <p className="mb-footer__copy">© {new Date().getFullYear()} Sudhir Vishwakarma</p>
  </footer>
);
```

`src/mobile/TopBar.tsx`:

```tsx
import React from 'react';

export const TopBar: React.FC<{ onHome: () => void }> = ({ onHome }) => (
  <header className="mb-topbar">
    <button className="mb-mono" onClick={onHome} aria-label="Go to Home">SV</button>
  </header>
);
```

`src/mobile/BottomNav.tsx`:

```tsx
import React from 'react';
import { MOBILE_SECTIONS, MobileSectionId } from './sections';

// 24×24 outline icons (Heroicons-style paths)
const ICONS: Record<MobileSectionId, string> = {
  home: 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10',
  about: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  skills: 'M8 8 4 12l4 4M16 8l4 4-4 4M13.5 5l-3 14',
  work: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
  projects: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  contact: 'M3 6h18v12H3zM3 7l9 6 9-6',
};

interface BottomNavProps { active: MobileSectionId; onSelect: (id: MobileSectionId) => void }

export const BottomNav: React.FC<BottomNavProps> = ({ active, onSelect }) => (
  <nav className="mb-nav" aria-label="Sections">
    {MOBILE_SECTIONS.map((s) => (
      <button
        key={s.id}
        className={`mb-nav__item${s.id === active ? ' is-active' : ''}`}
        style={{ '--accent': s.accent } as React.CSSProperties}
        aria-current={s.id === active ? 'true' : undefined}
        onClick={() => onSelect(s.id)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={ICONS[s.id]} />
        </svg>
        <span>{s.label}</span>
      </button>
    ))}
  </nav>
);
```

`src/mobile/useActiveSection.ts`:

```ts
import { useEffect, useState } from 'react';
import { MobileSectionId } from './sections';

/** Tracks which section crosses the 40% line and mirrors it into the URL hash (no history entries). */
export function useActiveSection(ids: readonly MobileSectionId[]): MobileSectionId {
  const [active, setActive] = useState<MobileSectionId>(ids[0]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id as MobileSectionId);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);

  useEffect(() => {
    // An open sheet owns the current history entry; don't overwrite it.
    if (window.history.state && window.history.state.mbSheet) return;
    if (window.location.hash !== `#${active}`) window.history.replaceState(null, '', `#${active}`);
  }, [active]);

  return active;
}
```

- [ ] **Step 5: Create `src/mobile/MobileApp.tsx`**

```tsx
import React, { useCallback, useEffect } from 'react';
import { MOBILE_SECTIONS, MobileSectionId, sectionForHash } from './sections';
import { SECTION_COMPONENTS } from './sections/registry';
import { useActiveSection } from './useActiveSection';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { Footer } from './sections/Footer';
import './mobile.css';

const IDS = MOBILE_SECTIONS.map((s) => s.id);

export function scrollToAnchor(anchor: string, smooth: boolean): void {
  document.getElementById(anchor)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
}

const MobileApp: React.FC = () => {
  const active = useActiveSection(IDS);

  // Deep link on first load.
  useEffect(() => {
    const target = sectionForHash(window.location.hash);
    if (!target) return;
    const raf = requestAnimationFrame(() => scrollToAnchor(target.anchor, false));
    return () => cancelAnimationFrame(raf);
  }, []);

  const navigate = useCallback((id: MobileSectionId) => scrollToAnchor(id, false), []);

  return (
    <div className="mb">
      <TopBar onHome={() => navigate('home')} />
      <main className="mb-main">
        {MOBILE_SECTIONS.map((s) => {
          const Section = SECTION_COMPONENTS[s.id];
          return (
            <section key={s.id} id={s.id} className="mb-section" style={{ '--accent': s.accent } as React.CSSProperties} aria-label={s.label}>
              <Section section={s} />
            </section>
          );
        })}
        <Footer />
      </main>
      <BottomNav active={active} onSelect={navigate} />
    </div>
  );
};

export default MobileApp;
```

- [ ] **Step 6: Create `src/mobile/mobile.css` with the base styles**

```css
/* ---------- tokens + base ---------- */
.mb {
  --bg: #000004;
  --accent-brand: #ff7a00;
  --text: #f5f5f5;
  --muted: rgba(255, 255, 255, 0.72);
  --card: rgba(255, 255, 255, 0.04);
  --border: rgba(255, 255, 255, 0.1);
  --radius: 16px;
  --gutter: 20px;
  --nav-h: 64px;
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Ubuntu', -apple-system, 'Segoe UI', Roboto, sans-serif;
  overflow-x: hidden;
  overflow-wrap: anywhere;
}
.mb *, .mb *::before, .mb *::after { box-sizing: border-box; }
.mb :focus-visible { outline: 2px solid var(--accent-brand); outline-offset: 3px; border-radius: 6px; }
.mb a { color: inherit; }

.mb-main {
  position: relative;
  z-index: 1;
  padding: calc(64px + env(safe-area-inset-top)) var(--gutter) calc(var(--nav-h) + 32px + env(safe-area-inset-bottom));
}
.mb-section { scroll-margin-top: calc(72px + env(safe-area-inset-top)); padding: 8px 0 72px; position: relative; }
#certifications { scroll-margin-top: calc(72px + env(safe-area-inset-top)); }

/* ---------- top bar ---------- */
.mb-topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 20;
  display: flex; align-items: center;
  padding: calc(10px + env(safe-area-inset-top)) var(--gutter) 10px;
  background: linear-gradient(180deg, rgba(0, 0, 4, 0.85), rgba(0, 0, 4, 0));
}
.mb-mono {
  width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid rgba(255, 154, 60, 0.6); background: rgba(255, 122, 0, 0.1);
  color: #ffb15c; font-weight: 700; letter-spacing: 0.05em; font-size: 0.85rem;
}

/* ---------- section heading ---------- */
.mb-heading { position: relative; margin-bottom: 20px; }
.mb-heading::before {
  content: ''; position: absolute; left: -40px; top: -40px; width: 220px; height: 160px; z-index: -1;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--accent, #ff7a00) 35%, transparent), transparent);
  filter: blur(8px); pointer-events: none;
}
.mb-kicker { font-size: 0.72rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--accent, #ff9a3c); }
.mb-h2 { font-size: 1.6rem; line-height: 1.2; margin: 6px 0 0; letter-spacing: -0.01em; }
.mb-text { color: var(--muted); font-size: 0.95rem; line-height: 1.65; margin: 0; }

/* ---------- shared building blocks ---------- */
.mb-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; }
.mb-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 44px; padding: 0 20px; border-radius: 999px;
  background: var(--accent-brand); color: #fff; border: 1px solid var(--accent-brand);
  font: inherit; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.03em; text-decoration: none; cursor: pointer;
}
.mb-btn--ghost { background: transparent; color: #ffb15c; }
.mb-btn:disabled { opacity: 0.6; }
.mb-chip {
  display: inline-flex; align-items: center; min-height: 32px; padding: 4px 12px; border-radius: 999px;
  font-size: 0.8rem; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.14); color: rgba(255, 255, 255, 0.9);
}

/* ---------- bottom nav ---------- */
.mb-nav {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 30;
  display: grid; grid-template-columns: repeat(6, 1fr);
  height: calc(var(--nav-h) + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom);
  background: rgba(8, 8, 14, 0.82); border-top: 1px solid var(--border);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
}
.mb-nav__item {
  min-width: 44px; min-height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  background: none; border: 0; color: rgba(255, 255, 255, 0.55); font: inherit; font-size: 0.66rem; letter-spacing: 0.02em; cursor: pointer;
  transition: color 0.25s ease;
}
.mb-nav__item.is-active { color: var(--accent); }
.mb-nav__item.is-active svg { filter: drop-shadow(0 0 6px var(--accent)); }

/* ---------- footer ---------- */
.mb-footer { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 8px 0 16px; text-align: center; }
.mb-socials { display: flex; gap: 12px; justify-content: center; }
.mb-social {
  width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center;
  color: rgba(255, 255, 255, 0.85); border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.04);
}
.mb-footer__classic { color: var(--muted); font-size: 0.85rem; min-height: 44px; display: inline-flex; align-items: center; }
.mb-footer__copy { color: rgba(255, 255, 255, 0.45); font-size: 0.75rem; margin: 0; }
```

- [ ] **Step 7: Verify**
  - Full tests: `CI=true npx react-scripts test --watchAll=false` → all pass.
  - Build: `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"` → `Compiled successfully.`
  - Check that the mobile chunk has no three.js: `grep -l "three" build/static/js/*.chunk.js | xargs grep -l "mb-nav" || echo "mobile chunk is three-free"`. Expected: `mobile chunk is three-free`.
  - Create the per-task check script `$SCRATCH/shots/mb-scenarios.js`. Later tasks run it by scenario name; scenarios for sections not yet built simply report missing elements.

```js
const puppeteer = require('puppeteer-core');
const [scenario, base = 'http://localhost:3005/'] = process.argv.slice(2);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clickText = (p, sel, text) => p.evaluate((s, t) => [...document.querySelectorAll(s)].find((x) => x.textContent.includes(t)).click(), sel, text);

(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new' });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const out = {};
  try {
    switch (scenario) {
      case 'smoke':
        await p.goto(base + '#work', { waitUntil: 'networkidle0' });
        await wait(1500);
        Object.assign(out, await p.evaluate(() => ({
          mobile: !!document.querySelector('.mb'),
          nav: [...document.querySelectorAll('.mb-nav__item span')].map((s) => s.textContent),
          active: document.querySelector('.mb-nav__item.is-active span')?.textContent,
          hash: location.hash,
          overflowX: document.documentElement.scrollWidth > innerWidth + 1,
        })));
        break;
      case 'warp':
        await p.goto(base, { waitUntil: 'networkidle0' });
        await wait(1000);
        await clickText(p, '.mb-nav__item', 'Projects');
        await wait(300);
        out.warpShown = await p.evaluate(() => !!document.querySelector('.mb-warp'));
        await wait(1500);
        Object.assign(out, await p.evaluate(() => ({ hash: location.hash, warpGone: !document.querySelector('.mb-warp'), stars: !!document.querySelector('.mb-stars') })));
        break;
      case 'home':
        await p.goto(base, { waitUntil: 'networkidle0' });
        await wait(1500);
        Object.assign(out, await p.evaluate(() => ({
          sunPhoto: !!document.querySelector('.mb-solar__sun img'),
          orbits: document.querySelectorAll('.mb-solar__orbit').length,
          cvButtons: [...document.querySelectorAll('.mb-home__actions a')].map((a) => a.textContent),
          socials: document.querySelectorAll('.mb-home .mb-social').length,
          overflowX: document.documentElement.scrollWidth > innerWidth + 1,
        })));
        await p.screenshot({ path: __dirname + '/mb-home.png' });
        out.screenshot = __dirname + '/mb-home.png';
        break;
      case 'about':
        await p.goto(base + '#certifications', { waitUntil: 'networkidle0' });
        await wait(1500);
        out.certsInView = await p.evaluate(() => { const r = document.getElementById('certifications').getBoundingClientRect(); return r.top >= 0 && r.top < 300; });
        await clickText(p, '.mb-cert .mb-btn', 'View');
        await wait(500);
        out.certSheet = await p.evaluate(() => !!document.querySelector('.mb-sheet img'));
        await p.goBack();
        await wait(600);
        Object.assign(out, await p.evaluate(() => ({ closedByBack: !document.querySelector('.mb-sheet'), stillMobile: !!document.querySelector('.mb') })));
        break;
      case 'work':
        await p.goto(base + '#skills', { waitUntil: 'networkidle0' });
        await wait(1200);
        Object.assign(out, await p.evaluate(() => ({
          groups: document.querySelectorAll('.mb-skill-group').length,
          chips: document.querySelectorAll('#skills .mb-chip').length,
          collapsed: document.querySelectorAll('.mb-job')[0].querySelectorAll('.mb-bullets li').length,
        })));
        await p.evaluate(() => document.querySelectorAll('.mb-job')[0].querySelector('.mb-link').click());
        await wait(200);
        Object.assign(out, await p.evaluate(() => {
          const job = document.querySelectorAll('.mb-job')[0];
          return { expanded: job.querySelectorAll('.mb-bullets li').length, aria: job.querySelector('.mb-link').getAttribute('aria-expanded') };
        }));
        break;
      case 'projects':
        await p.goto(base + '#projects', { waitUntil: 'networkidle0' });
        await wait(1500);
        Object.assign(out, await p.evaluate(() => ({
          initial: document.querySelectorAll('.mb-project').length,
          first: document.querySelector('.mb-project__title')?.firstChild?.textContent,
        })));
        await clickText(p, '.mb-showall', 'Show all');
        await wait(300);
        await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
        await wait(1000);
        Object.assign(out, await p.evaluate(() => ({ all: document.querySelectorAll('.mb-project').length, unrevealed: document.querySelectorAll('.mb-project:not(.is-revealed)').length })));
        await clickText(p, '.mb-filter', 'CRM');
        await wait(300);
        out.crm = await p.evaluate(() => document.querySelectorAll('.mb-project').length);
        await clickText(p, '.mb-project .mb-btn--ghost', 'Details');
        await wait(500);
        out.sheet = await p.evaluate(() => !!document.querySelector('.mb-sheet .mb-details'));
        await p.goBack();
        await wait(600);
        out.closedByBack = await p.evaluate(() => !document.querySelector('.mb-sheet') && !!document.querySelector('.mb'));
        break;
      case 'contact':
        await p.setRequestInterception(true);
        p.on('request', (r) => (r.method() === 'POST' && r.url().endsWith('/api/contact')
          ? r.respond({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
          : r.continue()));
        await p.goto(base + '#contact', { waitUntil: 'networkidle0' });
        await wait(1200);
        await p.type('.mb-form input[name=name]', 'Test User');
        await p.type('.mb-form input[name=email]', 'test@example.com');
        await p.select('.mb-form select[name=subject]', 'job');
        await p.type('.mb-form textarea[name=message]', 'Hello from the mobile test');
        await p.click('.mb-form .mb-btn');
        await wait(500);
        Object.assign(out, await p.evaluate(() => ({ toast: !!document.querySelector('.mb-toast'), beam: !!document.querySelector('.mb-beam') })));
        break;
      default:
        out.error = `unknown scenario "${scenario}"`;
        process.exitCode = 1;
    }
  } catch (e) {
    out.error = e.message;
    process.exitCode = 1;
  }
  console.log(scenario, JSON.stringify(out));
  await b.close();
})();
```

  - Serve on 3005 and run `node $SCRATCH/shots/mb-scenarios.js smoke`.
  - Expected: `"mobile":true`, nav `["Home","About","Skills","Work","Projects","Contact"]`, `"active":"Work"`, `"hash":"#work"`, `"overflowX":false`. Stop the server.

- [ ] **Step 8: Commit** (restore build/ first)

```bash
git add src/routing/mode.ts src/routing/mode.test.ts src/App.tsx src/mobile/MobileApp.tsx src/mobile/mobile.css src/mobile/TopBar.tsx src/mobile/BottomNav.tsx src/mobile/SectionHeading.tsx src/mobile/useActiveSection.ts src/mobile/sections/registry.ts src/mobile/sections/GenericSection.tsx src/mobile/sections/Footer.tsx
git commit -m "feat(mobile): three-way routing and mobile page shell with labelled bottom nav"
```

---

### Task 3: Space effects — starfield, hyperspeed warp, reveal-on-scroll

**Files:**
- Create: `src/mobile/useReducedMotion.ts`, `src/mobile/useReveal.ts`, `src/mobile/StarfieldCanvas.tsx`, `src/mobile/WarpOverlay.tsx`
- Modify: `src/mobile/MobileApp.tsx`, `src/mobile/mobile.css`
- Test: `src/mobile/useReveal.test.tsx`

**Interfaces:**
- Produces:
  - `useReducedMotion(): boolean`
  - `useReveal(rootRef: React.RefObject<HTMLElement>)`: adds `is-revealed` to every `[data-reveal]` element, including ones added later
  - `<StarfieldCanvas reducedMotion/>`
  - `<WarpOverlay accent onMidpoint onDone/>`
- `MobileApp.navigate(id)` now plays the warp unless motion is reduced.

- [ ] **Step 1: Write the failing test** `src/mobile/useReveal.test.tsx`. jsdom has no IntersectionObserver, which exercises the fallback path, and it does have MutationObserver.

```tsx
import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { useReveal } from './useReveal';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const Harness: React.FC<{ onReady: (add: () => void) => void }> = ({ onReady }) => {
  const root = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(['a']);
  useReveal(root);
  onReady(() => setItems((xs) => [...xs, `x${xs.length}`]));
  return (
    <div ref={root}>
      {items.map((i) => (
        <p key={i} data-reveal>{i}</p>
      ))}
    </div>
  );
};

test('reveals initial and late-added items (no IntersectionObserver)', async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  let add: () => void = () => {};
  await act(async () => {
    createRoot(host).render(<Harness onReady={(fn) => (add = fn)} />);
  });
  expect(host.querySelectorAll('[data-reveal].is-revealed')).toHaveLength(1);
  await act(async () => add());
  await act(async () => {}); // let the MutationObserver callback run
  expect(host.querySelectorAll('[data-reveal]')).toHaveLength(2);
  expect(host.querySelectorAll('[data-reveal]:not(.is-revealed)')).toHaveLength(0);
});
```

Run: `CI=true npx react-scripts test --watchAll=false src/mobile/useReveal` → FAIL (module not found).

- [ ] **Step 2: Implement the hooks**

`src/mobile/useReducedMotion.ts`:

```ts
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  const get = () => typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches;
  const [reduced, setReduced] = useState(get);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(QUERY);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}
```

`src/mobile/useReveal.ts`:

```ts
import { RefObject, useEffect } from 'react';

/** Adds `is-revealed` to [data-reveal] descendants as they scroll in, including nodes rendered later. */
export function useReveal(rootRef: RefObject<HTMLElement>): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reveal = (el: Element) => el.classList.add('is-revealed');
    const io =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) =>
              entries.forEach((e) => {
                if (e.isIntersecting) {
                  reveal(e.target);
                  io?.unobserve(e.target);
                }
              }),
            { threshold: 0.15 }
          );
    const track = (el: Element) => {
      if (el.classList.contains('is-revealed')) return;
      if (io) io.observe(el);
      else reveal(el);
    };
    root.querySelectorAll('[data-reveal]').forEach(track);
    const mo = new MutationObserver((records) =>
      records.forEach((r) =>
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches('[data-reveal]')) track(n);
          n.querySelectorAll('[data-reveal]').forEach(track);
        })
      )
    );
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io?.disconnect();
      mo.disconnect();
    };
  }, [rootRef]);
}
```

Run: `CI=true npx react-scripts test --watchAll=false src/mobile/useReveal` → PASS.

- [ ] **Step 3: Create the effects**

`src/mobile/StarfieldCanvas.tsx`:

```tsx
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

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

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
```

`src/mobile/WarpOverlay.tsx`:

```tsx
import React, { useEffect, useRef } from 'react';

const DURATION = 600;
const STREAKS = 140;

interface WarpOverlayProps { accent: string; onMidpoint: () => void; onDone: () => void }

/** A 0.6 s hyperspeed flash: streaks radiate from the centre while the screen dips to black at the midpoint. */
export const WarpOverlay: React.FC<WarpOverlayProps> = ({ accent, onMidpoint, onDone }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const mid = useRef(onMidpoint);
  const done = useRef(onDone);
  mid.current = onMidpoint;
  done.current = onDone;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      mid.current();
      done.current();
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.hypot(cx, cy);
    const streaks = Array.from({ length: STREAKS }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random() * 0.3, len: 0.15 + Math.random() * 0.35 }));
    let firedMid = false;
    let raf = 0;
    const t0 = performance.now();

    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION);
      const dip = Math.sin(p * Math.PI); // 0 → 1 → 0
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgba(0,0,4,${0.85 * dip})`;
      ctx.fillRect(0, 0, w, h);
      ctx.lineCap = 'round';
      for (const s of streaks) {
        const r0 = (s.r + p * 1.4) * maxR;
        const r1 = r0 + s.len * maxR * dip;
        ctx.strokeStyle = Math.random() > 0.5 ? accent : '#ffffff';
        ctx.globalAlpha = 0.9 * dip;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(s.a) * r0, cy + Math.sin(s.a) * r0);
        ctx.lineTo(cx + Math.cos(s.a) * r1, cy + Math.sin(s.a) * r1);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (!firedMid && p >= 0.5) {
        firedMid = true;
        mid.current();
      }
      if (p < 1) raf = requestAnimationFrame(frame);
      else done.current();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [accent]);

  return <canvas ref={ref} className="mb-warp" aria-hidden="true" />;
};
```

- [ ] **Step 4: Wire them into `MobileApp.tsx`.** Replace the file with:

```tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MOBILE_SECTIONS, MobileSectionId, sectionForHash } from './sections';
import { SECTION_COMPONENTS } from './sections/registry';
import { useActiveSection } from './useActiveSection';
import { useReducedMotion } from './useReducedMotion';
import { useReveal } from './useReveal';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { StarfieldCanvas } from './StarfieldCanvas';
import { WarpOverlay } from './WarpOverlay';
import { Footer } from './sections/Footer';
import './mobile.css';

const IDS = MOBILE_SECTIONS.map((s) => s.id);

export function scrollToAnchor(anchor: string, smooth: boolean): void {
  document.getElementById(anchor)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
}

const MobileApp: React.FC = () => {
  const active = useActiveSection(IDS);
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [warpTo, setWarpTo] = useState<MobileSectionId | null>(null);
  useReveal(rootRef);

  useEffect(() => {
    const target = sectionForHash(window.location.hash);
    if (!target) return;
    const raf = requestAnimationFrame(() => scrollToAnchor(target.anchor, false));
    return () => cancelAnimationFrame(raf);
  }, []);

  const navigate = useCallback(
    (id: MobileSectionId) => {
      if (reducedMotion) scrollToAnchor(id, false);
      else setWarpTo(id);
    },
    [reducedMotion]
  );

  const warpAccent = MOBILE_SECTIONS.find((s) => s.id === warpTo)?.accent ?? '#ff7a00';

  return (
    <div className={`mb${reducedMotion ? ' is-reduced' : ''}`} ref={rootRef}>
      <StarfieldCanvas reducedMotion={reducedMotion} />
      <TopBar onHome={() => navigate('home')} />
      <main className="mb-main">
        {MOBILE_SECTIONS.map((s) => {
          const Section = SECTION_COMPONENTS[s.id];
          return (
            <section key={s.id} id={s.id} className="mb-section" style={{ '--accent': s.accent } as React.CSSProperties} aria-label={s.label}>
              <Section section={s} />
            </section>
          );
        })}
        <Footer />
      </main>
      <BottomNav active={active} onSelect={navigate} />
      {warpTo && (
        <WarpOverlay
          accent={warpAccent}
          onMidpoint={() => scrollToAnchor(warpTo, false)}
          onDone={() => setWarpTo(null)}
        />
      )}
    </div>
  );
};

export default MobileApp;
```

- [ ] **Step 5: Append the styles to `mobile.css`**

```css
/* ---------- space effects ---------- */
.mb-stars { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 0; pointer-events: none; }
.mb-warp { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 40; pointer-events: none; }

/* reveal-on-scroll */
.mb [data-reveal] { opacity: 0; transform: translateY(16px); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.mb [data-reveal].is-revealed { opacity: 1; transform: none; }
.mb.is-reduced [data-reveal] { transform: none; transition: opacity 0.3s ease; }
@media (prefers-reduced-motion: reduce) {
  .mb [data-reveal] { transform: none; transition: opacity 0.3s ease; }
}
```

- [ ] **Step 6: Verify**
  - Run the full tests, then `CI=true npm run build` → `Compiled successfully.`
  - Serve on 3005 and run `node $SCRATCH/shots/mb-scenarios.js smoke` (still passes) and `node $SCRATCH/shots/mb-scenarios.js warp`.
  - Expected for `warp`: `{"warpShown":true,"hash":"#projects","warpGone":true,"stars":true}`. Stop the server.

- [ ] **Step 7: Commit** (restore build/ first)

```bash
git add src/mobile/useReducedMotion.ts src/mobile/useReveal.ts src/mobile/useReveal.test.tsx src/mobile/StarfieldCanvas.tsx src/mobile/WarpOverlay.tsx src/mobile/MobileApp.tsx src/mobile/mobile.css
git commit -m "feat(mobile): 2D starfield, hyperspeed nav warp and reveal-on-scroll"
```

---

### Task 4: Home — solar-system hero, intro, CV and socials

**Files:**
- Create: `src/mobile/SolarHero.tsx`, `src/mobile/sections/HomeSection.tsx`
- Modify: `src/mobile/sections/registry.ts` (`home`), `src/mobile/mobile.css`

**Interfaces:**
- Consumes: `profile` (data); `useTypewriter` (`src/hooks/typewriter`); `SocialIcons`; `SectionProps`.
- Produces: `SolarHero`, `HomeSection`.

- [ ] **Step 1: Create `src/mobile/SolarHero.tsx`**

```tsx
import React from 'react';
import { profile } from '../data/portfolio';
import { PALETTES } from '../multiverse/fx/palettes';

const ORBITS = [
  { size: 168, period: 9, color: PALETTES.about.atmos, planet: 10 },
  { size: 214, period: 14, color: PALETTES.projects.atmos, planet: 14 },
  { size: 256, period: 21, color: PALETTES.contact.atmos, planet: 9 },
];

/** CSS-only solar system: the profile photo glows inside the sun, three planets orbit it. */
export const SolarHero: React.FC = () => (
  <div className="mb-solar" aria-hidden="true">
    {ORBITS.map((o, i) => (
      <div
        key={i}
        className="mb-solar__orbit"
        style={{ width: o.size, height: o.size, animationDuration: `${o.period}s`, '--planet': o.color, '--planet-size': `${o.planet}px` } as React.CSSProperties}
      >
        <span className="mb-solar__planet" />
      </div>
    ))}
    <div className="mb-solar__sun">
      <img src={profile.photo} alt="" width={112} height={112} />
    </div>
  </div>
);
```

- [ ] **Step 2: Create `src/mobile/sections/HomeSection.tsx`**

```tsx
import React from 'react';
import { profile } from '../../data/portfolio';
import { useTypewriter } from '../../hooks/typewriter';
import SocialIcons from '../../components/SocialIcons';
import { SolarHero } from '../SolarHero';
import { SectionProps } from './registry';

export const HomeSection: React.FC<SectionProps> = () => {
  const word = useTypewriter(profile.typingWords);
  return (
    <div className="mb-home">
      <SolarHero />
      <span className="mb-kicker" data-reveal>{profile.greeting}</span>
      <h1 className="mb-h1" data-reveal>{profile.firstName}<br />{profile.lastName}</h1>
      <p className="mb-typing" data-reveal>
        {profile.titlePrefix} <span className="mb-typing__word">{word}</span>
        <span className="mb-typing__cursor" aria-hidden="true">|</span>
      </p>
      <p className="mb-text" data-reveal>{profile.bio}</p>
      <div className="mb-home__actions" data-reveal>
        <a className="mb-btn" href={profile.cvUrl} target="_blank" rel="noopener noreferrer">View CV</a>
        <a className="mb-btn mb-btn--ghost" href={profile.cvUrl} download={profile.cvDownloadName}>Download CV</a>
      </div>
      <div data-reveal>
        <SocialIcons className="mb-socials mb-socials--start" linkClassName="mb-social" size={18} />
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Register** — in `registry.ts`, add `import { HomeSection } from './HomeSection';` and set `home: HomeSection,`.

- [ ] **Step 4: Append the styles**

```css
/* ---------- home ---------- */
.mb-home { display: flex; flex-direction: column; gap: 12px; }
.mb-solar { position: relative; width: 256px; height: 256px; margin: 8px auto 12px; display: grid; place-items: center; }
.mb-solar__orbit {
  position: absolute; border-radius: 50%; border: 1px dashed rgba(255, 255, 255, 0.14);
  animation: mb-orbit linear infinite;
}
.mb-solar__planet {
  position: absolute; top: calc(var(--planet-size) / -2); left: 50%;
  width: var(--planet-size); height: var(--planet-size); margin-left: calc(var(--planet-size) / -2);
  border-radius: 50%; background: var(--planet); box-shadow: 0 0 12px var(--planet);
}
.mb-solar__sun {
  position: relative; width: 112px; height: 112px; border-radius: 50%; overflow: hidden;
  border: 2px solid rgba(255, 177, 92, 0.9);
  box-shadow: 0 0 24px rgba(255, 122, 0, 0.75), 0 0 64px rgba(255, 122, 0, 0.35);
  background: radial-gradient(circle at 40% 35%, #ffd27a, #ff7a00 60%, #7c2d12);
}
.mb-solar__sun img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
.mb-h1 {
  font-size: clamp(2.4rem, 11vw, 3.2rem); line-height: 0.98; margin: 0; letter-spacing: -0.02em;
  background: linear-gradient(120deg, #fff 30%, #ffb15c 60%, #ff6a00); -webkit-background-clip: text; background-clip: text; color: transparent;
}
.mb-typing { margin: 0; font-size: 0.95rem; letter-spacing: 0.1em; color: rgba(255, 255, 255, 0.85); min-height: 1.5em; }
.mb-typing__word { color: #ff9a3c; font-weight: 700; text-shadow: 0 0 14px rgba(255, 122, 0, 0.55); }
.mb-typing__cursor { color: #ff9a3c; animation: mb-blink 1s steps(1) infinite; margin-left: 2px; }
.mb-home__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }
.mb-socials--start { justify-content: flex-start; }
@keyframes mb-orbit { to { transform: rotate(360deg); } }
@keyframes mb-blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .mb-solar__orbit, .mb-typing__cursor { animation: none; }
}
```

- [ ] **Step 5: Verify.** Run the tests and the build. Serve, then run `node $SCRATCH/shots/mb-scenarios.js home`.
  - Expected: `"sunPhoto":true,"orbits":3,"cvButtons":["View CV","Download CV"],"socials":4,"overflowX":false`.
  - Read the printed screenshot path. Expected:
  - the round photo glowing inside the sun, with 3 orbits
  - the name, the typing line and the bio
  - the two CV buttons side by side
  - the social icons
  - no overflow

- [ ] **Step 6: Commit** (restore build/ first)

```bash
git add src/mobile/SolarHero.tsx src/mobile/sections/HomeSection.tsx src/mobile/sections/registry.ts src/mobile/mobile.css
git commit -m "feat(mobile): home section with CSS solar-system hero, typing intro, CV and socials"
```

---

### Task 5: About — summary, education timeline, certifications and the Sheet

**Files:**
- Create: `src/mobile/Sheet.tsx`, `src/mobile/sections/AboutSection.tsx`
- Modify: `src/mobile/sections/registry.ts` (`about`), `src/mobile/mobile.css`

**Interfaces:**
- Consumes: `aboutSummary`, `education`, `certifications`; `resolveCertificateSource` and `CertificateSource` (`src/data/certificateSource`); `SectionHeading`.
- Produces: `Sheet({ open, onClose, label, variant?: 'bottom' | 'full', children })`. It is reused by Task 7.

The Sheet behaviour (spec §6):
- It locks body scroll and focuses its close button.
- It restores focus to the opener on close.
- It closes on ✕, a backdrop tap, Esc, a swipe-down of more than 80 px, or the browser Back button. Opening pushes `{ mbSheet: true }` onto history; Back pops it.
- **Certificates:** a phone can't reliably embed a PDF, so the sheet shows the certificate **image** and, when `resolveCertificateSource` returns `pdf`, an **Open PDF** link (new tab). This avoids popup blockers, because `window.open` after an `await` is blocked.

- [ ] **Step 1: Create `src/mobile/Sheet.tsx`**

```tsx
import React, { useCallback, useEffect, useRef } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  label: string;
  variant?: 'bottom' | 'full';
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ open, onClose, label, variant = 'bottom', children }) => {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const touchY = useRef<number | null>(null);

  // Close through history when we own the top entry, so Back and ✕ behave the same.
  const requestClose = useCallback(() => {
    if (window.history.state && window.history.state.mbSheet) window.history.back();
    else onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    window.history.pushState({ mbSheet: true }, '');
    const onPop = () => onCloseRef.current();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && opener.isConnected) opener.focus();
    };
  }, [open, requestClose]);

  if (!open) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchY.current === null || !panel.current) return;
    const dy = Math.max(0, e.touches[0].clientY - touchY.current);
    panel.current.style.transform = `translateY(${dy}px)`;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchY.current === null || !panel.current) return;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchY.current = null;
    panel.current.style.transform = '';
    if (dy > 80) requestClose();
  };

  return (
    <div className={`mb-sheet mb-sheet--${variant}`} role="dialog" aria-modal="true" aria-label={label} onClick={requestClose}>
      <div className="mb-sheet__panel" ref={panel} onClick={(e) => e.stopPropagation()}>
        <div className="mb-sheet__handle" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <span />
        </div>
        <button ref={closeBtn} className="mb-sheet__close" aria-label="Close" onClick={requestClose}>×</button>
        <div className="mb-sheet__body">{children}</div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Create `src/mobile/sections/AboutSection.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { aboutSummary, certifications, education } from '../../data/portfolio';
import { CertificateSource, resolveCertificateSource } from '../../data/certificateSource';
import { SectionHeading } from '../SectionHeading';
import { Sheet } from '../Sheet';
import { SectionProps } from './registry';

const CertificateViewer: React.FC<{ index: number }> = ({ index }) => {
  const cert = certifications[index];
  const [source, setSource] = useState<CertificateSource | null>(null);
  useEffect(() => {
    let alive = true;
    resolveCertificateSource(cert).then((s) => alive && setSource(s));
    return () => {
      alive = false;
    };
  }, [cert]);
  return (
    <div className="mb-cert-viewer">
      <h3>{cert.title}</h3>
      <img src={cert.image} alt={`${cert.title} certificate`} />
      {source?.kind === 'pdf' && (
        <a className="mb-btn" href={source.url} target="_blank" rel="noopener noreferrer">Open PDF</a>
      )}
    </div>
  );
};

export const AboutSection: React.FC<SectionProps> = () => {
  const [openCert, setOpenCert] = useState<number | null>(null);
  return (
    <div>
      <SectionHeading kicker="About" title="About Me" />
      <p className="mb-card mb-text" data-reveal>{aboutSummary}</p>

      <h3 className="mb-h3" data-reveal>Education</h3>
      <ol className="mb-timeline">
        {education.map((e) => (
          <li key={e.years} data-reveal>
            <span className="mb-timeline__years">{e.years}</span>
            <strong>{e.title}</strong>
            <span className="mb-timeline__place">{e.school}</span>
          </li>
        ))}
      </ol>

      <h3 className="mb-h3" id="certifications" data-reveal>Certifications</h3>
      <ul className="mb-certs">
        {certifications.map((c, i) => (
          <li key={c.title} className="mb-card mb-cert" data-reveal>
            <div>
              <strong>{c.title}</strong>
              <span>{c.provider}</span>
            </div>
            <button className="mb-btn mb-btn--ghost" onClick={() => setOpenCert(i)}>View</button>
          </li>
        ))}
      </ul>

      <Sheet
        open={openCert !== null}
        onClose={() => setOpenCert(null)}
        label={openCert !== null ? certifications[openCert].title : 'Certificate'}
        variant="full"
      >
        {openCert !== null && <CertificateViewer index={openCert} />}
      </Sheet>
    </div>
  );
};
```

- [ ] **Step 3: Register** `about: AboutSection` (with its import) in `registry.ts`.

- [ ] **Step 4: Append the styles**

```css
/* ---------- about ---------- */
.mb-h3 { font-size: 1.05rem; margin: 32px 0 14px; letter-spacing: 0.02em; }
.mb-timeline { list-style: none; margin: 0; padding: 0 0 0 18px; border-left: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); }
.mb-timeline li { position: relative; display: flex; flex-direction: column; gap: 2px; padding: 0 0 20px 10px; }
.mb-timeline li::before {
  content: ''; position: absolute; left: -24px; top: 6px; width: 11px; height: 11px; border-radius: 50%;
  background: var(--accent); box-shadow: 0 0 12px var(--accent);
}
.mb-timeline__years { font-size: 0.72rem; letter-spacing: 0.18em; color: var(--accent); }
.mb-timeline__place { color: var(--muted); font-size: 0.88rem; }
.mb-certs { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.mb-cert { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; }
.mb-cert strong { display: block; font-size: 0.92rem; }
.mb-cert span { font-size: 0.8rem; color: var(--muted); }
.mb-cert .mb-btn { flex-shrink: 0; }

/* ---------- sheet ---------- */
.mb-sheet { position: fixed; inset: 0; z-index: 50; background: rgba(0, 0, 4, 0.7); display: flex; align-items: flex-end; animation: mb-fade 0.25s ease both; }
.mb-sheet__panel {
  position: relative; width: 100%; max-height: 88vh; display: flex; flex-direction: column;
  background: #0e0c16; border: 1px solid var(--border); border-radius: 20px 20px 0 0;
  padding: 0 var(--gutter) calc(20px + env(safe-area-inset-bottom));
  animation: mb-slide-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both; transition: transform 0.15s ease;
}
.mb-sheet--full .mb-sheet__panel { max-height: none; height: 100%; border-radius: 0; padding-top: env(safe-area-inset-top); }
.mb-sheet__handle { display: flex; justify-content: center; padding: 10px 0 6px; touch-action: none; }
.mb-sheet__handle span { width: 44px; height: 5px; border-radius: 3px; background: rgba(255, 255, 255, 0.25); }
.mb-sheet__close {
  position: absolute; top: calc(8px + env(safe-area-inset-top)); right: 12px; width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.06); color: #fff; font-size: 1.4rem;
}
.mb-sheet__body { overflow-y: auto; padding-top: 12px; -webkit-overflow-scrolling: touch; }
.mb-cert-viewer { display: flex; flex-direction: column; gap: 14px; align-items: center; padding-top: 32px; }
.mb-cert-viewer h3 { margin: 0; text-align: center; font-size: 1rem; padding: 0 44px; }
.mb-cert-viewer img { max-width: 100%; border-radius: 10px; background: #fff; }
@keyframes mb-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mb-slide-up { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .mb-sheet, .mb-sheet__panel { animation: none; } }
```

- [ ] **Step 5: Verify.**
  - Run the tests and the build. Serve.
  - Run `node $SCRATCH/shots/mb-scenarios.js about`.
  - Expected: `{"certsInView":true,"certSheet":true,"closedByBack":true,"stillMobile":true}`. Stop the server.

- [ ] **Step 6: Commit** (restore build/ first)

```bash
git add src/mobile/Sheet.tsx src/mobile/sections/AboutSection.tsx src/mobile/sections/registry.ts src/mobile/mobile.css
git commit -m "feat(mobile): about section with education timeline, certifications and back-closable sheet"
```

---

### Task 6: Skills and Work

**Files:**
- Create: `src/mobile/sections/SkillsSection.tsx`, `src/mobile/sections/WorkSection.tsx`
- Modify: `src/mobile/sections/registry.ts` (`skills`, `work`), `src/mobile/mobile.css`

**Interfaces:**
- Consumes: `skills`, `SKILL_GROUPS`, `SkillGroup`, `experience`; `visibleBullets`, `hasHiddenBullets` (Task 1); `SectionHeading`.

- [ ] **Step 1: Create `src/mobile/sections/SkillsSection.tsx`.** The group colours match the desktop Skills universe, but are defined here so that no three.js module is imported.

```tsx
import React from 'react';
import { SKILL_GROUPS, SkillGroup, skills } from '../../data/portfolio';
import { SectionHeading } from '../SectionHeading';
import { SectionProps } from './registry';

const GROUP_COLORS: Record<SkillGroup, string> = {
  Frontend: '#38bdf8',
  Backend: '#f97316',
  Database: '#a3e635',
  'Cloud & DevOps': '#c084fc',
  Tools: '#f472b6',
};

export const SkillsSection: React.FC<SectionProps> = () => (
  <div>
    <SectionHeading kicker="Technical Skills" title="My Tech Belt" />
    {SKILL_GROUPS.map((g) => (
      <div key={g} className="mb-skill-group" data-reveal>
        <h3 className="mb-skill-group__title">
          <span className="mb-dot" style={{ background: GROUP_COLORS[g], boxShadow: `0 0 8px ${GROUP_COLORS[g]}` }} />
          {g}
        </h3>
        <div className="mb-chips">
          {skills.filter((s) => s.group === g).map((s) => (
            <span key={s.name} className="mb-chip">{s.name}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
);
```

- [ ] **Step 2: Create `src/mobile/sections/WorkSection.tsx`**

```tsx
import React, { useState } from 'react';
import { experience } from '../../data/portfolio';
import { hasHiddenBullets, visibleBullets } from '../bullets';
import { SectionHeading } from '../SectionHeading';
import { SectionProps } from './registry';

const Job: React.FC<{ index: number }> = ({ index }) => {
  const job = experience[index];
  const [expanded, setExpanded] = useState(false);
  const listId = `job-${index}-bullets`;
  return (
    <li className="mb-job" data-reveal>
      <span className="mb-timeline__years">{job.start} – {job.end}</span>
      <h3 className="mb-job__role">{job.role}</h3>
      <p className="mb-job__company">{job.company}</p>
      <ul className="mb-bullets" id={listId}>
        {visibleBullets(job.bullets, expanded).map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      {hasHiddenBullets(job.bullets) && (
        <button className="mb-link" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show less' : `Show more (${job.bullets.length - 2})`}
        </button>
      )}
    </li>
  );
};

export const WorkSection: React.FC<SectionProps> = () => (
  <div>
    <SectionHeading kicker="Work Experience" title="Career Galaxy" />
    <ol className="mb-timeline mb-jobs">
      {experience.map((j, i) => (
        <Job key={j.company} index={i} />
      ))}
    </ol>
  </div>
);
```

- [ ] **Step 3: Register** `skills: SkillsSection` and `work: WorkSection` (with their imports).

- [ ] **Step 4: Append the styles**

```css
/* ---------- skills ---------- */
.mb-skill-group { margin-bottom: 18px; }
.mb-skill-group__title { display: flex; align-items: center; gap: 8px; font-size: 0.74rem; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 10px; color: rgba(255, 255, 255, 0.85); }
.mb-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.mb-chips { display: flex; flex-wrap: wrap; gap: 8px; }

/* ---------- work ---------- */
.mb-jobs > li.mb-job { padding-bottom: 28px; }
.mb-job__role { margin: 4px 0 0; font-size: 1.05rem; }
.mb-job__company { margin: 2px 0 10px; color: #ffb15c; font-size: 0.9rem; }
.mb-bullets { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; color: var(--muted); font-size: 0.92rem; line-height: 1.6; }
.mb-bullets li::marker { color: var(--accent); }
.mb-link {
  margin-top: 8px; min-height: 44px; padding: 0; background: none; border: 0;
  color: var(--accent); font: inherit; font-size: 0.88rem; font-weight: 600; text-align: left; cursor: pointer;
}
```

- [ ] **Step 5: Verify.**
  - Run the tests and the build. Serve.
  - Run `node $SCRATCH/shots/mb-scenarios.js work`.
  - Expected: `{"groups":5,"chips":20,"collapsed":2,"expanded":3,"aria":"true"}`. Stop the server.

- [ ] **Step 6: Commit** (restore build/ first)

```bash
git add src/mobile/sections/SkillsSection.tsx src/mobile/sections/WorkSection.tsx src/mobile/sections/registry.ts src/mobile/mobile.css
git commit -m "feat(mobile): skills chips by group and work timeline with show-more bullets"
```

---

### Task 7: Projects — filters, show all, details sheet

**Files:**
- Create: `src/mobile/sections/ProjectsSection.tsx`
- Modify: `src/mobile/sections/registry.ts` (`projects`), `src/mobile/mobile.css`

**Interfaces:**
- Consumes:
  - from `projectFilter.ts` (Task 1): `FILTERS`, `ProjectFilter`, `filterProjects`, `visibleProjects`, `topTech`
  - `projects`, `descriptionParagraphs`
  - `Sheet` (Task 5)
  - `SectionHeading`

- [ ] **Step 1: Create `src/mobile/sections/ProjectsSection.tsx`**

```tsx
import React, { useMemo, useState } from 'react';
import { Project, descriptionParagraphs, projects } from '../../data/portfolio';
import { FILTERS, ProjectFilter, filterProjects, topTech, visibleProjects } from '../projectFilter';
import { SectionHeading } from '../SectionHeading';
import { Sheet } from '../Sheet';
import { SectionProps } from './registry';

const ProjectDetails: React.FC<{ p: Project }> = ({ p }) => (
  <article className="mb-details">
    <span className="mb-kicker">{p.constellation}</span>
    <h2 className="mb-h2">{p.title}</h2>
    <div className="mb-chips">
      <span className="mb-chip">{p.type}</span>
      <span className="mb-chip">{p.status}</span>
    </div>
    {descriptionParagraphs(p.description).map((para, i) => (
      <p key={i} className="mb-text">{para}</p>
    ))}
    <div className="mb-chips">
      {p.technologies.map((t) => t.trim()).filter(Boolean).map((t) => (
        <span key={t} className="mb-chip">{t}</span>
      ))}
    </div>
    <div className="mb-details__actions">
      {p.demoUrl && <a className="mb-btn" href={p.demoUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}
      {p.codeUrl && <a className="mb-btn mb-btn--ghost" href={p.codeUrl} target="_blank" rel="noopener noreferrer">Code</a>}
    </div>
  </article>
);

export const ProjectsSection: React.FC<SectionProps> = () => {
  const [filter, setFilter] = useState<ProjectFilter>('All');
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<Project | null>(null);
  const list = useMemo(() => filterProjects(projects, filter), [filter]);
  const shown = visibleProjects(list, showAll);

  return (
    <div>
      <SectionHeading kicker="My Projects" title="Project Galaxy" />
      <div className="mb-filters" role="group" aria-label="Filter projects">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`mb-chip mb-filter${f.id === filter ? ' is-active' : ''}`}
            aria-pressed={f.id === filter}
            onClick={() => {
              setFilter(f.id);
              setShowAll(false);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mb-projects">
        {shown.map((p) => (
          <li key={p.title} className="mb-card mb-project" data-reveal>
            <h3 className="mb-project__title">
              {p.title}
              {p.featured && <span className="mb-star" aria-label="Featured">★</span>}
            </h3>
            <p className="mb-text">{p.shortDescription}</p>
            <div className="mb-chips">
              {topTech(p).map((t) => (
                <span key={t} className="mb-chip">{t}</span>
              ))}
            </div>
            <div className="mb-project__actions">
              {p.demoUrl && <a className="mb-btn" href={p.demoUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}
              <button className="mb-btn mb-btn--ghost" onClick={() => setOpen(p)}>Details</button>
            </div>
          </li>
        ))}
      </ul>

      {list.length > shown.length && (
        <button className="mb-btn mb-btn--ghost mb-showall" onClick={() => setShowAll(true)}>
          Show all {list.length}
        </button>
      )}

      <Sheet open={open !== null} onClose={() => setOpen(null)} label={open ? open.title : 'Project details'}>
        {open && <ProjectDetails p={open} />}
      </Sheet>
    </div>
  );
};
```

- [ ] **Step 2: Register** `projects: ProjectsSection` (with its import).

- [ ] **Step 3: Append the styles**

```css
/* ---------- projects ---------- */
.mb-filters { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 12px; margin: 0 calc(var(--gutter) * -1); padding-left: var(--gutter); padding-right: var(--gutter); scrollbar-width: none; }
.mb-filters::-webkit-scrollbar { display: none; }
.mb-filter { min-height: 44px; flex-shrink: 0; font: inherit; font-size: 0.85rem; cursor: pointer; }
.mb-filter.is-active { background: color-mix(in srgb, var(--accent) 25%, transparent); border-color: var(--accent); color: #fff; }
.mb-projects { list-style: none; margin: 4px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.mb-project { display: flex; flex-direction: column; gap: 10px; }
.mb-project__title { margin: 0; font-size: 1.05rem; display: flex; gap: 8px; align-items: baseline; }
.mb-star { color: #fcd34d; font-size: 0.9rem; }
.mb-project__actions, .mb-details__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; }
.mb-showall { width: 100%; margin-top: 16px; }
.mb-details { display: flex; flex-direction: column; gap: 12px; padding-bottom: 8px; }
.mb-details .mb-h2 { padding-right: 48px; }
```

- [ ] **Step 4: Verify.**
  - Run the tests and the build. Serve.
  - Run `node $SCRATCH/shots/mb-scenarios.js projects`.
  - Expected: `{"initial":6,"first":"Shubhdhanam CRM","all":23,"unrevealed":0,"crm":2,"sheet":true,"closedByBack":true}`. Stop the server.

- [ ] **Step 5: Commit** (restore build/ first)

```bash
git add src/mobile/sections/ProjectsSection.tsx src/mobile/sections/registry.ts src/mobile/mobile.css
git commit -m "feat(mobile): projects with constellation filters, show-all and details sheet"
```

---

### Task 8: Contact — tappable info, SMTP form, light beam

**Files:**
- Create: `src/mobile/sections/ContactSection.tsx`
- Modify: `src/mobile/sections/registry.ts` (`contact`); `src/mobile/sections/GenericSection.tsx` (delete, since it is no longer used); `src/mobile/mobile.css`

**Interfaces:**
- Consumes: `profile`; `useContactForm(onSent)` → `{ form, sending, error, showToast, handleChange, handleSubmit }`; `SectionHeading`.

- [ ] **Step 1: Create `src/mobile/sections/ContactSection.tsx`**

```tsx
import React, { useState } from 'react';
import { profile } from '../../data/portfolio';
import { useContactForm } from '../../hooks/contact';
import { SectionHeading } from '../SectionHeading';
import { SectionProps } from './registry';

export const ContactSection: React.FC<SectionProps> = () => {
  const [beam, setBeam] = useState(0);
  const { form, sending, error, showToast, handleChange, handleSubmit } = useContactForm(() => setBeam((n) => n + 1));
  return (
    <div className="mb-contact">
      <div className="mb-contact__head">
        <SectionHeading kicker="Contact" title="Let's Connect" />
        {beam > 0 && <span key={beam} className="mb-beam" aria-hidden="true" />}
      </div>
      <ul className="mb-contact__rows">
        <li data-reveal><a className="mb-card mb-row" href={`mailto:${profile.email}`}><span>Email</span>{profile.email}</a></li>
        <li data-reveal><a className="mb-card mb-row" href={`tel:${profile.phone.replace(/\s/g, '')}`}><span>Phone</span>{profile.phone}</a></li>
        <li data-reveal><div className="mb-card mb-row"><span>Location</span>{profile.location}</div></li>
        <li data-reveal><a className="mb-card mb-row" href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"><span>LinkedIn</span>sudhir-vishwakarma</a></li>
      </ul>
      <form className="mb-form mb-card" onSubmit={handleSubmit} data-reveal>
        <label>Your Name<input type="text" name="name" value={form.name} onChange={handleChange} required autoComplete="name" /></label>
        <label>Your Email<input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" /></label>
        <label>Subject
          <select name="subject" value={form.subject} onChange={handleChange} required>
            <option value="">Select Subject</option>
            <option value="project">Project Inquiry</option>
            <option value="job">Job Opportunity</option>
            <option value="collaboration">Collaboration</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>Your Message<textarea name="message" rows={5} value={form.message} onChange={handleChange} required /></label>
        {error && <p className="mb-form__error" role="alert">{error}</p>}
        <button type="submit" className="mb-btn" disabled={sending}>{sending ? 'Sending…' : 'Send Message'}</button>
      </form>
      {showToast && <div className="mb-toast" role="status">✅ Message sent successfully! I'll respond within 24 hours.</div>}
    </div>
  );
};
```

- [ ] **Step 2: Register** `contact: ContactSection`, which replaces the last `GenericSection` use. Remove the `GenericSection` import from `registry.ts`, then delete `src/mobile/sections/GenericSection.tsx` (`git rm`).

- [ ] **Step 3: Append the styles**

```css
/* ---------- contact ---------- */
.mb-contact__head { position: relative; }
.mb-beam {
  position: absolute; left: 24px; bottom: 100%; width: 3px; height: 0; border-radius: 3px;
  background: linear-gradient(0deg, var(--accent), transparent); box-shadow: 0 0 12px var(--accent);
  animation: mb-beam 1.4s ease-out forwards;
}
@keyframes mb-beam { 0% { height: 0; opacity: 1; } 60% { height: 60vh; opacity: 1; } 100% { height: 60vh; opacity: 0; } }
.mb-contact__rows { list-style: none; margin: 0 0 18px; padding: 0; display: grid; gap: 10px; }
.mb-row { display: flex; flex-direction: column; gap: 2px; min-height: 44px; padding: 12px 16px; text-decoration: none; font-size: 0.95rem; }
.mb-row span { font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); }
.mb-form { display: flex; flex-direction: column; gap: 14px; }
.mb-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.82rem; color: var(--muted); }
.mb-form input, .mb-form select, .mb-form textarea {
  width: 100%; min-height: 44px; padding: 11px 13px; border-radius: 10px; font: inherit; font-size: 16px; color: #fff;
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.16);
}
.mb-form select option { background: #111; }
.mb-form input:focus, .mb-form select:focus, .mb-form textarea:focus { outline: none; border-color: var(--accent-brand); box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.25); }
.mb-form__error { color: #ff6b6b; font-size: 0.85rem; margin: 0; }
.mb-toast {
  position: fixed; left: var(--gutter); right: var(--gutter); bottom: calc(var(--nav-h) + 16px + env(safe-area-inset-bottom)); z-index: 45;
  padding: 14px 16px; border-radius: 12px; background: rgba(16, 185, 129, 0.95); color: #fff; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  animation: mb-slide-up 0.3s ease both;
}
@media (prefers-reduced-motion: reduce) { .mb-beam { animation: none; opacity: 0; } }
```

(Inputs use `font-size: 16px` so iOS Safari doesn't zoom on focus.)

- [ ] **Step 4: Verify.**
  - Run the tests and the build. Serve.
  - Run `node $SCRATCH/shots/mb-scenarios.js contact`. The script mocks `/api/contact`, so no real email is sent.
  - Expected: `{"toast":true,"beam":true}`. Stop the server.

- [ ] **Step 5: Commit** (restore build/ first)

```bash
git add src/mobile/sections/ContactSection.tsx src/mobile/sections/registry.ts src/mobile/mobile.css
git rm src/mobile/sections/GenericSection.tsx
git commit -m "feat(mobile): contact rows, labelled SMTP form and success beam"
```

---

### Task 9: Responsive verification, Lighthouse and regressions

**Files:**
- Create: `$SCRATCH/shots/mobile-check.js` (a verification script outside the repo)
- Modify: `src/mobile/mobile.css` (only if checks reveal layout bugs; each change listed in the report)

- [ ] **Step 1: Create `$SCRATCH/shots/mobile-check.js`**

```js
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const BASE = process.argv[2] || 'http://localhost:3005/';
const OUT = __dirname + '/mobile-final';
fs.mkdirSync(OUT, { recursive: true });
const VIEWPORTS = [
  { name: '320x640', width: 320, height: 640 },
  { name: '360x740', width: 360, height: 740 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '844x390', width: 844, height: 390 },
];
const NEEDLES = ["HELLO I'M", 'A highly driven Front-End Engineer', 'Results-driven developer', 'Shree Raghuveer English High School',
  'ReactJS', 'Middleware Serverless REST API', 'Realatte', 'Entrance1.com', 'Shubhdhanam CRM', 'Send Message'];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new' });
  let failures = 0;
  const fail = (msg) => { failures++; console.log('FAIL', msg); };

  for (const v of VIEWPORTS) {
    const p = await b.newPage();
    await p.setViewport({ width: v.width, height: v.height, isMobile: true, hasTouch: true });
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(BASE, { waitUntil: 'networkidle0' });
    await wait(1200);
    // scroll through everything so reveals run
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
    await wait(800);
    const r = await p.evaluate((needles) => ({
      mobile: !!document.querySelector('.mb'),
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      missing: needles.filter((n) => !document.body.innerText.includes(n)),
      smallTargets: [...document.querySelectorAll('.mb button, .mb a')].filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && (rect.width < 43.5 || rect.height < 43.5) && !el.closest('.mb-chips');
      }).map((el) => el.textContent.trim().slice(0, 20) || el.getAttribute('aria-label')),
      unrevealed: document.querySelectorAll('[data-reveal]:not(.is-revealed)').length,
    }), NEEDLES);
    if (!r.mobile) fail(`${v.name}: mobile site not chosen`);
    if (r.overflowX) fail(`${v.name}: horizontal overflow`);
    if (r.missing.length) fail(`${v.name}: missing ${r.missing.join(', ')}`);
    if (r.smallTargets.length) fail(`${v.name}: small tap targets ${r.smallTargets.join(' | ')}`);
    if (r.unrevealed) fail(`${v.name}: ${r.unrevealed} unrevealed elements after full scroll`);
    if (errors.length) fail(`${v.name}: page errors ${errors.join(' | ')}`);
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.setViewport({ width: v.width, height: Math.min(h, 16000), isMobile: true, hasTouch: true });
    await wait(500);
    await p.screenshot({ path: `${OUT}/${v.name}.png` });
    console.log(v.name, JSON.stringify(r));
    await p.close();
  }

  // back-closes-sheet (Review Focus 3) + deep link (Review Focus 4)
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await p.goto(BASE + '#projects', { waitUntil: 'networkidle0' });
  await wait(1500);
  const inView = await p.evaluate(() => { const r = document.getElementById('projects').getBoundingClientRect(); return r.top < 200 && r.bottom > 0; });
  if (!inView) fail('deep link #projects did not scroll to Projects');
  await p.evaluate(() => [...document.querySelectorAll('.mb-project .mb-btn--ghost')][0].click());
  await wait(500);
  const open = await p.evaluate(() => !!document.querySelector('.mb-sheet'));
  await p.goBack();
  await wait(600);
  const closed = await p.evaluate(() => !document.querySelector('.mb-sheet') && !!document.querySelector('.mb'));
  if (!open || !closed) fail(`back-closes-sheet: open=${open} closed=${closed}`);
  console.log('deep link in view:', inView, '| sheet open:', open, '| closed by Back, still on site:', closed);
  await p.close();

  // reduced motion (Review Focus 5)
  const rm = await b.newPage();
  await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await rm.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await rm.goto(BASE, { waitUntil: 'networkidle0' });
  await wait(800);
  await rm.evaluate(() => [...document.querySelectorAll('.mb-nav__item')].find((x) => x.textContent.includes('Work')).click());
  await wait(200);
  const rmState = await rm.evaluate(() => ({ mobile: !!document.querySelector('.mb.is-reduced'), warp: !!document.querySelector('.mb-warp'), hash: location.hash }));
  await wait(800);
  rmState.hashAfter = await rm.evaluate(() => location.hash);
  if (!rmState.mobile || rmState.warp || rmState.hashAfter !== '#work') fail(`reduced motion: ${JSON.stringify(rmState)}`);
  console.log('reduced motion:', JSON.stringify(rmState));
  await rm.close();

  console.log(failures ? `${failures} FAILURE(S)` : 'ALL MOBILE CHECKS PASSED');
  await b.close();
})();
```

- [ ] **Step 2: Run it.** Build, serve on 3005, then run `node $SCRATCH/shots/mobile-check.js http://localhost:3005/`.
  - Expected: `ALL MOBILE CHECKS PASSED`.
  - For every FAIL, fix the cause in `mobile.css` or the owning component (smallest change), and re-run until it passes.
  - Read every screenshot in `$SCRATCH/shots/mobile-final/`. Expected: a polished layout with consistent gutters, no clipped text, the nav clear of content, and the hero centred.

- [ ] **Step 3: Lighthouse (mobile performance).** Run:

```bash
npx -y lighthouse@12.2.1 http://localhost:3005/ --only-categories=performance --form-factor=mobile --screenEmulation.mobile --chrome-flags="--headless=new" --chrome-path=/usr/bin/google-chrome --quiet --output=json --output-path=$SCRATCH/shots/lh-mobile.json
node -e "const r=require('$SCRATCH/shots/lh-mobile.json');console.log('performance', Math.round(r.categories.performance.score*100), '| LCP', r.audits['largest-contentful-paint'].displayValue, '| CLS', r.audits['cumulative-layout-shift'].displayValue)"
```

  Expected: performance ≥ 90 (the aim). If it is lower, report the top 3 opportunities from the JSON. Don't chase the number with risky changes; this plan treats the score as an aim, not a hard gate.

- [ ] **Step 4: Regression checks.** With the server still running:
  - `node $SCRATCH/shots/mv-check.js http://localhost:3005/ $SCRATCH/shots/regress 10` (desktop multiverse) → 10 panel lines with real content, then `no console errors`
  - `node $SCRATCH/shots/classic-check.js http://localhost:3005/#classic` → `all sections OK`
  - `node $SCRATCH/shots/mv-interact.js reduced-motion` → `reduced motion → classic` (desktop reduce-motion still gets the classic site)

  Stop the server.

- [ ] **Step 5: Final gates.**
  - `CI=true npx react-scripts test --watchAll=false` → all pass.
  - `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"` → `Compiled successfully.`
  - Restore build/.

- [ ] **Step 6: Commit** any CSS fixes from Step 2 (if there are none, skip this step):

```bash
git add src/mobile/mobile.css
git commit -m "fix(mobile): responsive polish from device-size verification"
```
