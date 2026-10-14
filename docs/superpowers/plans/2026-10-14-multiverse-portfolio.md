# Multiverse Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the portfolio's main experience with a 3D solar-system/multiverse journey that shows all existing content and features. The current site stays as a classic fallback.

**Architecture:** One React Three Fiber canvas holds seven "universes" spaced 400 units apart along −z. A pure `journey.ts` defines 10 ordered steps (each a universe, a content beat and a camera pose), and a zustand store tracks the current step. The camera glides within a universe and warps (hyperspeed) through portals between universes. All readable content lives in HTML panels layered over the canvas and reads from one shared data file (`src/data/portfolio.ts`). The classic site reads that file too.

**Tech Stack:** CRA 5 (react-scripts 5.0.1), React 18, TypeScript 4.9, three 0.165.0, @react-three/fiber 8.16.8, @react-three/drei 9.108.3, @react-three/postprocessing 2.16.2, maath 0.10.8, zustand 3.7.2, Jest (bundled with react-scripts).

**Spec:** `docs/superpowers/specs/2026-10-14-multiverse-portfolio-design.md`

## Global Constraints

- **No `git commit`, `git push`, or deploys.** The owner commits, pushes and deploys. Every task ends with a checkpoint instead of a commit.
- `CI=true npm run build` must end with **"Compiled successfully."** (zero warnings). Vercel builds in CI mode.
- Run tests with `CI=true npx react-scripts test --watchAll=false <path>`.
- Content strings are copied **verbatim** from the current components. Never reword the owner's text.
- Realatte employment is **Feb 2026 – Nov 2026**.
- The classic site's look and behaviour must not change, apart from reading shared data and the Realatte date.
- Accent colour `#FF7A00`; multiverse background `#000004`.
- Universe ids, in order: `home, about, skills, certifications, work, projects, contact`. Spacing 400. Portal 60 units in front of each universe origin.
- Modules that Jest imports (`journey.ts`, `store.ts`, `input.ts`, `layout.ts`, `mode.ts`, the data and hooks) **must not import `three`** or any `@react-three/*` package. Jest does not transform ESM `node_modules`.
- Scratch directory for verification scripts: `SCRATCH=/tmp/claude-1002/-home-sudhirvishwakarma-Documents-Landing-Pages-Second-Portfolio-Sudhir/01c9bdce-01ed-4d1b-ae64-6685ae80a718/scratchpad`. `puppeteer-core` is already installed in `$SCRATCH/shots`.

## Review Focus

1. **Trackpad inertia:** one swipe on a Mac trackpad fires dozens of wheel events. A swipe must advance exactly one step, including the events that arrive just after the camera settles. Pinned by the `SETTLE_MS` tests in Task 6.
2. **Typing in the contact form:** Space, the arrow keys and PageUp/PageDown inside inputs and textareas must type or move the caret, not move the journey. Pinned by `isFormField` tests in Task 8.
3. **Scrolling inside an overflowing panel** (the project list, a long job description on a short screen) must scroll the panel, not warp. Pinned by `insideScrollable` tests in Task 8.
4. **Unknown or legacy hashes** (`#foo`, `#lab`, `#classic`, the empty hash): the empty hash means Home, and unknown hashes must not crash or jump. Pinned by `stepForHash` tests in Task 5 and `classicSectionFor` tests in Task 4.
5. **Shared project array mutation:** the classic site used to call `projects.reverse()`, which on a shared module array would flip the order on every render. Pinned by the `newestFirst` non-mutation test in Task 1.

---

## File Structure

```
src/
  data/portfolio.ts              all content + helpers (newestFirst, descriptionParagraphs)
  data/portfolio.test.ts
  hooks/typewriter.ts            pure typewriter steps + useTypewriter
  hooks/typewriter.test.ts
  hooks/contact.ts               submitContact (pure, injectable fetch) + useContactForm
  hooks/contact.test.ts
  components/SocialIcons.tsx     shared social icon links (classic + multiverse)
  components/{Dashboard,About,Skills,Projects,Contact}.tsx   classic, refactored to shared data
  routing/mode.ts                shouldUseClassic, detectEnv, classicSectionFor, CLASSIC_HASH
  routing/mode.test.ts
  routing/ErrorBoundary.tsx
  ClassicApp.tsx                 the previous App body (sidebar + sections)
  App.tsx                        chooses classic vs multiverse
  multiverse/
    Multiverse.tsx               canvas + overlay root
    multiverse.css
    journey.ts / journey.test.ts pure step model
    store.ts / store.test.ts     zustand store
    input.ts / input.test.ts     wheel/key/touch → store
    useHashSync.ts               URL hash <-> store
    camera/CameraRig.tsx
    fx/{rig,glow,shaders,palettes}.ts
    fx/{Starfield,Hyperspace,Nebula,Planet,GlowSprite,Portal,PostFX}.tsx
    world/World.tsx              mounts universe slots + portals near the camera
    universes/index.ts           registry UniverseId → component
    universes/layout.ts / layout.test.ts   ringLayout, layoutGalaxy (pure)
    universes/{Basic,Home,About,Skills,Certifications,Work,Projects,Contact}Universe.tsx
    overlay/{TopBar,Progress,ScrollHint,Loader,PanelFrame,Panels,ModalHost}.tsx
    overlay/panels/index.ts      registry UniverseId → panel
    overlay/panels/{Generic,Home,About,Skills,Certifications,Work,Projects,Contact}Panel.tsx
    overlay/modals/{CvModal,CertificateModal,ProjectDetail}.tsx
    overlay/certificateSource.ts / certificateSource.test.ts
```

---

## Phase 1: Foundations

### Task 1: Shared content data and a warning-free build

**Files:**
- Modify: `package.json` (build script)
- Create: `src/data/portfolio.ts`
- Test: `src/data/portfolio.test.ts`

**Interfaces:**
- Produces: `profile`, `socials`, `aboutSummary`, `skills`, `education`, `certifications`, `experience`, `projects`, `newestFirst<T>(items: readonly T[]): T[]`, `descriptionParagraphs(description: string): string[]`, `CONSTELLATIONS`, `SKILL_GROUPS`, and the types `Profile, Social, SocialId, Skill, SkillGroup, Education, Certification, Experience, Project, Constellation`.

- [ ] **Step 1: Make builds warning-free.** In `package.json`, change the build script:

```json
"build": "GENERATE_SOURCEMAP=false react-scripts build",
```

Run: `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"`
Expected: `Compiled successfully.`

- [ ] **Step 2: Write the failing test** `src/data/portfolio.test.ts`:

```ts
import {
  profile, socials, aboutSummary, skills, education, certifications, experience, projects,
  newestFirst, descriptionParagraphs, CONSTELLATIONS, SKILL_GROUPS,
} from './portfolio';

describe('portfolio data', () => {
  it('has the profile essentials', () => {
    expect(profile.firstName).toBe('SUDHIR');
    expect(profile.lastName).toBe('VISHWAKARMA');
    expect(profile.typingWords).toEqual(['FULL-STACK DEVELOPER', 'REACT.JS/NEXT.JS', 'STRAPI/FIREBASE']);
    expect(profile.cvUrl).toBe('/Sudhir-Profile2.pdf');
    expect(profile.bio.startsWith('A highly driven Front-End Engineer')).toBe(true);
    expect(aboutSummary.startsWith('Results-driven developer')).toBe(true);
  });

  it('has four https social links in classic order', () => {
    expect(socials.map((s) => s.id)).toEqual(['facebook', 'instagram', 'linkedin', 'github']);
    socials.forEach((s) => expect(s.url.startsWith('https://')).toBe(true));
  });

  it('has 20 skills split across the 5 groups', () => {
    expect(skills).toHaveLength(20);
    const count = (g: string) => skills.filter((s) => s.group === g).length;
    expect(SKILL_GROUPS.map(count)).toEqual([5, 7, 3, 2, 3]);
  });

  it('has 4 education entries, 4 certifications and 3 jobs newest first', () => {
    expect(education).toHaveLength(4);
    expect(certifications).toHaveLength(4);
    expect(experience.map((e) => e.company)).toEqual(['Realatte', 'Starz Ventures Pvt Ltd', 'Entrance1.com']);
    expect(experience[0]).toMatchObject({ start: 'Feb 2026', end: 'Nov 2026' });
  });

  it('has 23 complete projects in 4 constellations', () => {
    expect(projects).toHaveLength(23);
    projects.forEach((p) => {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.technologies.length).toBeGreaterThan(0);
      expect(CONSTELLATIONS).toContain(p.constellation);
    });
    const count = (c: string) => projects.filter((p) => p.constellation === c).length;
    expect(CONSTELLATIONS.map(count)).toEqual([2, 4, 4, 13]);
  });

  it('newestFirst returns a reversed copy and never mutates the source', () => {
    const before = projects.map((p) => p.title);
    const reversed = newestFirst(projects);
    expect(reversed[0].title).toBe('Shubhdhanam CRM');
    newestFirst(projects);
    expect(projects.map((p) => p.title)).toEqual(before);
  });

  it('descriptionParagraphs matches the classic modal splitting', () => {
    expect(descriptionParagraphs('One. Tech Stack: A, B. Last one')).toEqual(['One.', 'Tech Stack: A, B', 'Last one']);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/data`
Expected: FAIL — `Cannot find module './portfolio'`.

- [ ] **Step 4: Create `src/data/portfolio.ts`.** Everything except the project entries is shown in full below. For `projects`:
  - Move the 23 object literals from `src/components/Projects.tsx` lines 22–234 (inside `const projects: Project[] = [ … ];`) into the `projects` array **verbatim**.
  - Then add a `constellation` field to each object using the table that follows the code.

```ts
export type SocialId = 'facebook' | 'instagram' | 'linkedin' | 'github';
export type SkillGroup = 'Frontend' | 'Backend' | 'Database' | 'Cloud & DevOps' | 'Tools';
export type Constellation = 'CRM Platforms' | 'Salesforce Portals' | 'Real Estate' | 'Web Apps';

export const SKILL_GROUPS: SkillGroup[] = ['Frontend', 'Backend', 'Database', 'Cloud & DevOps', 'Tools'];
export const CONSTELLATIONS: Constellation[] = ['CRM Platforms', 'Salesforce Portals', 'Real Estate', 'Web Apps'];

export interface Profile {
  firstName: string;
  lastName: string;
  greeting: string;
  titlePrefix: string;
  typingWords: string[];
  bio: string;
  photo: string;
  cvUrl: string;
  cvDownloadName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
}
export interface Social { id: SocialId; label: string; url: string }
export interface Skill { name: string; group: SkillGroup }
export interface Education { years: string; title: string; school: string }
export interface Certification { title: string; provider: string; image: string; pdf?: string }
export interface Experience { role: string; company: string; start: string; end: string; bullets: string[] }
export interface Project {
  title: string;
  description: string;
  shortDescription: string;
  technologies: string[];
  status: 'Completed' | 'In Progress' | 'Planning';
  type: 'Web App' | 'Mobile App' | 'API' | 'Library' | 'Desktop App';
  demoUrl?: string;
  codeUrl?: string;
  featured?: boolean;
  constellation: Constellation;
}

export const profile: Profile = {
  firstName: 'SUDHIR',
  lastName: 'VISHWAKARMA',
  greeting: "HELLO I'M",
  titlePrefix: 'A PASSIONATE',
  typingWords: ['FULL-STACK DEVELOPER', 'REACT.JS/NEXT.JS', 'STRAPI/FIREBASE'],
  bio: 'A highly driven Front-End Engineer specializing in React.js and Next.js, focused on building scalable, production-grade applications that power real business ecosystems. Proven expertise in crafting advanced CRM platforms, integrating complex APIs, and deploying secure, high-performance solutions at scale. Committed to pushing technical boundaries, delivering impactful user experiences, and evolving into a full-stack leader who engineers products that drive measurable growth and innovation.',
  photo: '/Images/crop4.png',
  cvUrl: '/Sudhir-Profile2.pdf',
  cvDownloadName: 'Sudhir_Vishwakarma_Resume.pdf',
  email: 'karmasudhir48@gmail.com',
  phone: '+91 7710945924',
  location: 'Mumbai, India',
  linkedinUrl: 'https://www.linkedin.com/in/sudhir-vishwakarma-6b660017b/',
};

export const socials: Social[] = [
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/sudhir.vishwakarma.792/' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/sudhirwishwakarma/' },
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/sudhir-vishwakarma-6b660017b/' },
  { id: 'github', label: 'GitHub', url: 'https://github.com/Sudhir-Vishwakarma' },
];

export const aboutSummary =
  'Results-driven developer with hands-on experience in building scalable web applications and CRM systems, including real-time chat, authentication, and multi-service integrations. Proven ability to integrate complex APIs, manage dynamic data flows, and deploy production-ready applications on live servers using secure remote access. Seeking to contribute to impactful, high-growth projects while continuously advancing in full-stack development and solving real-world problems at scale.';

// Same order as the classic About page.
export const skills: Skill[] = [
  { name: 'Next.js', group: 'Frontend' },
  { name: 'TypeScript', group: 'Frontend' },
  { name: 'NodeJS', group: 'Backend' },
  { name: 'ExpressJS', group: 'Backend' },
  { name: 'React/Redux', group: 'Frontend' },
  { name: 'JavaScript', group: 'Frontend' },
  { name: 'Bootstrap', group: 'Frontend' },
  { name: 'Firebase', group: 'Database' },
  { name: 'Git', group: 'Tools' },
  { name: 'GitHub', group: 'Tools' },
  { name: 'GitLab', group: 'Tools' },
  { name: 'PHP', group: 'Backend' },
  { name: 'MongoDB', group: 'Database' },
  { name: 'MySQL', group: 'Database' },
  { name: 'C/C++', group: 'Backend' },
  { name: 'Google Cloud Server', group: 'Cloud & DevOps' },
  { name: 'Middleware Serverless REST API', group: 'Backend' },
  { name: 'API', group: 'Backend' },
  { name: 'Strapi', group: 'Backend' },
  { name: 'Linux', group: 'Cloud & DevOps' },
];

export const education: Education[] = [
  { years: '2022 - 2023', title: 'Web-Development Front-End', school: 'Great Learning' },
  { years: '2013 - 2016', title: 'E-Commerce/Electronic Commerce', school: 'Nirmala Memorial Foundation College of Commerce & Science' },
  { years: '2011 - 2013', title: 'HSC', school: 'Shree MumbaiDevi Junior College' },
  { years: '1999 - 2010', title: 'SSC', school: 'Shree Raghuveer English High School' },
];

// Add `pdf: '/certificates/<file>.pdf'` once the owner copies PDFs into public/certificates/.
export const certifications: Certification[] = [
  { title: 'HTML5 Application Development Fundamentals', provider: 'Great Learning', image: '/Images/HTML.png' },
  { title: 'Introduction to Programming Using JavaScript', provider: 'Great Learning', image: '/Images/Javascript.png' },
  { title: 'Programming in CSS3', provider: 'Great Learning', image: '/Images/CSS.png' },
  { title: 'ReactJS', provider: 'Great Learning', image: '/Images/Reactjs.png' },
];

// Newest first.
export const experience: Experience[] = [
  {
    role: 'FullStack Developer',
    company: 'Realatte',
    start: 'Feb 2026',
    end: 'Nov 2026',
    bullets: [
      'Built a web application using React and Next.js, integrated with Strapi for dynamic content management',
      'Managed API integration and nested data flow for efficient frontend & CRM rendering',
      'Deployed and maintained the app on a live server via Ubuntu terminal using SSH (root access)',
    ],
  },
  {
    role: 'Frontend Developer',
    company: 'Starz Ventures Pvt Ltd',
    start: 'Mar 2025',
    end: 'Dec 2025',
    bullets: [
      'Developed high-performance web applications using front-end technologies with responsive UI',
      'Created and deployed a custom Serverless Middleware REST API on Google Cloud',
      'Integrated multiple APIs to improve data flow and system reliability across the app',
      'Managed Firebase Database to securely handle and sync client data in real time',
      'Collaborated with teams to troubleshoot, optimize workflows, and deliver production-ready solutions',
    ],
  },
  {
    role: 'Frontend Developer',
    company: 'Entrance1.com',
    start: 'Nov 2023',
    end: 'Dec 2024',
    bullets: [
      'Built responsive and user-friendly UI components using modern front-end technologies',
      'Converted design mockups into clean, pixel-perfect web interfaces for improved UX',
      'Optimized front-end performance by enhancing layouts and reducing load times',
    ],
  },
];

// Oldest first (the classic page shows newestFirst(projects)).
export const projects: Project[] = [
  // ⟵ the 23 object literals moved verbatim from src/components/Projects.tsx lines 22–234,
  //    each with a `constellation` field added per the table in Task 1 Step 4.
];

/** Reversed copy — never mutates the shared array. */
export function newestFirst<T>(items: readonly T[]): T[] {
  return [...items].reverse();
}

/** Splits a description into paragraphs exactly like the classic project modal. */
export function descriptionParagraphs(description: string): string[] {
  const parts = description.split('. ');
  return parts
    .map((s, i) => {
      const t = s.trim();
      if (!t) return '';
      return t.includes(':') || i === parts.length - 1 ? t : `${t}.`;
    })
    .filter(Boolean);
}
```

Constellation for each project, by `title`:

| constellation | titles |
|---|---|
| `'CRM Platforms'` | STARZAi CRM, Shubhdhanam CRM |
| `'Salesforce Portals'` | Space Group GRE, Space Group CP LP, Space Group Customer Portal, Space Group Channel Partner Portal |
| `'Real Estate'` | Harmony Infra Ventures, Darsh Group, Oriom Group, Eeshanya |
| `'Web Apps'` | Weather App, Calendar App, Random User Generator, Random Quote Generator (React), Quiz App (React), Quiz App (Vanilla JS), Note App, Landing Page, Interior Decorator, Image Search App, Expense Tracker, Crypto Currency App, Digital Kundali |

(The placeholder comment inside `projects` is replaced by the moved literals. No comment remains.)

- [ ] **Step 5: Run the test to verify it passes**

Run: `CI=true npx react-scripts test --watchAll=false src/data`
Expected: PASS (7 tests).

- [ ] **Step 6: Checkpoint.** `Projects.tsx` still has its own array (Task 3 removes it). Run `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"` → `Compiled successfully.` Do not commit.

---

### Task 2: Shared hooks — typewriter, contact submit, social icons

**Files:**
- Create: `src/hooks/typewriter.ts`, `src/hooks/contact.ts`, `src/components/SocialIcons.tsx`
- Test: `src/hooks/typewriter.test.ts`, `src/hooks/contact.test.ts`

**Interfaces:**
- Consumes: `profile.typingWords`, `socials`, `SocialId` from Task 1.
- Produces:
  - `TypewriterState { wordIndex: number; text: string; deleting: boolean }`
  - `nextTypewriterState(s, words): TypewriterState`, `typewriterDelay(s, words): number`
  - `useTypewriter(words: readonly string[]): string`
  - `ContactForm { name; email; subject; message }`, `EMPTY_FORM`, `FALLBACK_ERROR`
  - `submitContact(form, fetchImpl?): Promise<{ ok: true } | { ok: false; error: string }>`
  - `useContactForm(onSent?: () => void)` → `{ form, sending, error, showToast, handleChange, handleSubmit }`
  - default export `SocialIcons({ className?, linkClassName?, size? })`

- [ ] **Step 1: Write the failing tests.**

`src/hooks/typewriter.test.ts`:

```ts
import { nextTypewriterState, typewriterDelay, TYPE_MS, DELETE_MS, HOLD_MS, TypewriterState } from './typewriter';

const words = ['AB', 'C'];
const run = (s: TypewriterState, n: number) => {
  const seen: string[] = [];
  for (let i = 0; i < n; i++) { s = nextTypewriterState(s, words); seen.push(`${s.text}${s.deleting ? '<' : ''}`); }
  return seen;
};

test('types, holds, deletes, then moves to the next word', () => {
  expect(run({ wordIndex: 0, text: '', deleting: false }, 7)).toEqual(['A', 'AB', 'AB<', 'A<', '<', '', 'C']);
});

test('uses the classic timings', () => {
  expect(typewriterDelay({ wordIndex: 0, text: 'A', deleting: false }, words)).toBe(TYPE_MS);
  expect(typewriterDelay({ wordIndex: 0, text: 'AB', deleting: false }, words)).toBe(HOLD_MS);
  expect(typewriterDelay({ wordIndex: 0, text: 'A', deleting: true }, words)).toBe(DELETE_MS);
  expect([TYPE_MS, DELETE_MS, HOLD_MS]).toEqual([100, 50, 2000]);
});

test('wraps around the word list', () => {
  expect(nextTypewriterState({ wordIndex: 1, text: '', deleting: true }, words)).toEqual({ wordIndex: 0, text: '', deleting: false });
});
```

`src/hooks/contact.test.ts`:

```ts
import { submitContact, EMPTY_FORM, FALLBACK_ERROR } from './contact';

const form = { ...EMPTY_FORM, name: 'A', email: 'a@b.co', subject: 'job', message: 'hi' };
const fakeFetch = (status: number, body: unknown, throws = false) =>
  (jest.fn(async () => {
    if (throws) throw new Error('offline');
    return { ok: status < 400, status, json: async () => body } as Response;
  }) as unknown) as typeof fetch;

test('posts JSON to /api/contact and reports success', async () => {
  const f = fakeFetch(200, { ok: true });
  await expect(submitContact(form, f)).resolves.toEqual({ ok: true });
  expect(f).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST', body: JSON.stringify(form) }));
});

test('surfaces the server error message', async () => {
  await expect(submitContact(form, fakeFetch(400, { error: 'Please fill in all fields with a valid email.' })))
    .resolves.toEqual({ ok: false, error: 'Please fill in all fields with a valid email.' });
});

test('falls back to a friendly message on network failure or empty body', async () => {
  await expect(submitContact(form, fakeFetch(0, {}, true))).resolves.toEqual({ ok: false, error: FALLBACK_ERROR });
  await expect(submitContact(form, fakeFetch(500, {}))).resolves.toEqual({ ok: false, error: FALLBACK_ERROR });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/hooks`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement.**

`src/hooks/typewriter.ts`:

```ts
import { useEffect, useState } from 'react';

export const TYPE_MS = 100;
export const DELETE_MS = 50;
export const HOLD_MS = 2000;

export interface TypewriterState { wordIndex: number; text: string; deleting: boolean }

const wordAt = (s: TypewriterState, words: readonly string[]) => words[s.wordIndex % words.length];

export function nextTypewriterState(s: TypewriterState, words: readonly string[]): TypewriterState {
  const word = wordAt(s, words);
  if (!s.deleting && s.text === word) return { ...s, deleting: true };
  if (s.deleting && s.text === '') return { wordIndex: (s.wordIndex + 1) % words.length, text: '', deleting: false };
  if (s.deleting) return { ...s, text: s.text.slice(0, -1) };
  return { ...s, text: word.slice(0, s.text.length + 1) };
}

/** How long to wait before applying nextTypewriterState to `s`. */
export function typewriterDelay(s: TypewriterState, words: readonly string[]): number {
  if (!s.deleting && s.text === wordAt(s, words)) return HOLD_MS;
  return s.deleting ? DELETE_MS : TYPE_MS;
}

/** `words` must be a stable (module-level) array. */
export function useTypewriter(words: readonly string[]): string {
  const [state, setState] = useState<TypewriterState>({ wordIndex: 0, text: '', deleting: false });
  useEffect(() => {
    const t = setTimeout(() => setState((prev) => nextTypewriterState(prev, words)), typewriterDelay(state, words));
    return () => clearTimeout(t);
  }, [state, words]);
  return state.text;
}
```

`src/hooks/contact.ts`:

```ts
import React, { useState } from 'react';

export interface ContactForm { name: string; email: string; subject: string; message: string }
export const EMPTY_FORM: ContactForm = { name: '', email: '', subject: '', message: '' };
export const FALLBACK_ERROR = 'Could not send your message. Please email me directly.';

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function submitContact(form: ContactForm, fetchImpl: typeof fetch = fetch): Promise<ContactResult> {
  try {
    const res = await fetchImpl('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (data && data.error) || FALLBACK_ERROR };
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export function useContactForm(onSent?: () => void) {
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    const result = await submitContact(form);
    setSending(false);
    if (result.ok) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      setForm(EMPTY_FORM);
      onSent?.();
    } else {
      setError(result.error);
    }
  };

  return { form, sending, error, showToast, handleChange, handleSubmit };
}
```

`src/components/SocialIcons.tsx` (the SVG paths are copied from the current `Dashboard.tsx`):

```tsx
import React from 'react';
import { socials, SocialId } from '../data/portfolio';

const PATHS: Record<SocialId, string> = {
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  github: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
};

interface SocialIconsProps { className?: string; linkClassName?: string; size?: number }

const SocialIcons: React.FC<SocialIconsProps> = ({ className = 'social-icons', linkClassName = 'social-icon', size = 16 }) => (
  <div className={className}>
    {socials.map((s) => (
      <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className={linkClassName} aria-label={s.label}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={PATHS[s.id]} />
        </svg>
      </a>
    ))}
  </div>
);

export default SocialIcons;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/hooks`
Expected: PASS (6 tests).

- [ ] **Step 5: Checkpoint.** `CI=true npm run build` → `Compiled successfully.` Do not commit.

---

### Task 3: Classic site reads shared data

**Files:**
- Modify (full rewrite): `src/components/Dashboard.tsx`, `src/components/About.tsx`, `src/components/Skills.tsx`, `src/components/Contact.tsx`
- Modify: `src/components/Projects.tsx` (remove the local interface and array, import the shared ones)

**Interfaces:**
- Consumes: everything from Tasks 1–2.

- [ ] **Step 1: Rewrite `src/components/Dashboard.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { profile } from '../data/portfolio';
import { useTypewriter } from '../hooks/typewriter';
import SocialIcons from './SocialIcons';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const currentText = useTypewriter(profile.typingWords);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="dashboard">
      <div className="hero-split">
        <div className="hero-left">
          <div className={`hero-content ${isVisible ? 'animate-in' : ''}`}>
            <span className="greeting">{profile.greeting}</span>
            <h1 className="name">{profile.firstName}<br />{profile.lastName}</h1>
            <p className="title">{profile.titlePrefix} <span className="highlight glow-text">{currentText}</span><span className="cursor">|</span></p>
            <p className="description">{profile.bio}</p>
            <div className="action-buttons">
              <button className="cta-btn" onClick={() => setShowResumeModal(true)}>VIEW CV</button>
            </div>
            <SocialIcons />
          </div>
        </div>
        <div className="hero-right">
          <div className="background-effects">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
          </div>
          <div className={`hero-image ${isVisible ? 'animate-in' : ''}`}>
            <img src={profile.photo} alt={`${profile.firstName} ${profile.lastName}`} />
          </div>
        </div>
      </div>

      {showResumeModal && (
        <div className="resume-modal" onClick={() => setShowResumeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowResumeModal(false)}>×</button>
            <div className="resume-header">
              <h3>My Resume</h3>
              <a href={profile.cvUrl} download={profile.cvDownloadName} className="download-btn">
                Download PDF
              </a>
            </div>
            <div className="pdf-viewer">
              <iframe src={`${profile.cvUrl}#toolbar=1&navpanes=0&scrollbar=1`} width="100%" height="600px" title="Resume">
                <p>Your browser does not support PDFs. <a href={profile.cvUrl}>Download the PDF</a>.</p>
              </iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
```

The image `alt` was "Sudhir Vishwakarma" and is now "SUDHIR VISHWAKARMA". That's an accepted minor change; it isn't visible on the page.

- [ ] **Step 2: Rewrite `src/components/About.tsx`**

```tsx
import React, { useState, useEffect } from 'react';
import { aboutSummary, skills, education, certifications } from '../data/portfolio';
import './About.css';

const About: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="about-page">
      <h1 className="section-title">About Me</h1>

      <div className="about-grid">
        <div className={`about-intro ${isVisible ? 'animate-in' : ''}`}>
          <h3>About Me</h3>
          <p>{aboutSummary}</p>
        </div>

        <div className={`skills-section ${isVisible ? 'animate-in' : ''}`}>
          <h3>Technical Skills</h3>
          <div className="skills-tags">
            {skills.map((s) => (
              <span key={s.name} className="skill-tag">{s.name}</span>
            ))}
          </div>
        </div>

        <div className={`education-section ${isVisible ? 'animate-in' : ''}`}>
          <h3>Education</h3>
          <div className="education-list">
            {education.map((e) => (
              <div key={e.years} className="education-item">
                <div className="edu-year">{e.years}</div>
                <div className="edu-content">
                  <h4>{e.title}</h4>
                  <p>{e.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`certifications-section ${isVisible ? 'animate-in' : ''}`}>
          <h3>Certifications</h3>
          <div className="cert-list">
            {certifications.map((cert) => (
              <div key={cert.title} className="cert-item">
                <div className="cert-content">
                  <h4>{cert.title}</h4>
                  <p>{cert.provider}</p>
                </div>
                <div className="cert-actions">
                  <button className="cert-btn view-btn" onClick={() => setSelectedCertificate(cert.pdf || cert.image)}>
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      {selectedCertificate && (
        <div className="certificate-modal" onClick={() => setSelectedCertificate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCertificate(null)}>×</button>
            {selectedCertificate.endsWith('.pdf') ? (
              <iframe src={selectedCertificate} title="Certificate" className="certificate-image" style={{ width: '80vw', height: '80vh', border: 0 }} />
            ) : (
              <img src={selectedCertificate} alt="Certificate" className="certificate-image" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
```

- [ ] **Step 3: Rewrite `src/components/Skills.tsx`** (the classic Work Experience page)

```tsx
import React, { useState, useEffect } from 'react';
import { experience } from '../data/portfolio';
import './Skills.css';

const Skills: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="skills-page">
      <h1 className="section-title">Work Experience</h1>

      <div className={`experience-section ${isVisible ? 'animate-in' : ''}`}>
        <div className="experience-list">
          {experience.map((job) => (
            <div key={job.company} className="experience-item">
              <div className="exp-left">
                <h4>{job.role} - {job.company}</h4>
              </div>
              <div className="exp-middle">
                <p>{job.start} - {job.end}</p>
              </div>
              <div className="exp-right">
                <ul>
                  {job.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skills;
```

- [ ] **Step 4: Rewrite `src/components/Contact.tsx`**

```tsx
import React from 'react';
import { profile } from '../data/portfolio';
import { useContactForm } from '../hooks/contact';
import './Contact.css';

const Contact: React.FC = () => {
  const { form, sending, error, showToast, handleChange, handleSubmit } = useContactForm();

  return (
    <div className="contact-page">
      <h1 className="section-title">Let's Connect</h1>

      <div className="contact-grid">
        <div className="contact-info">
          <div className="info-card">
            <h3>📧 Email</h3>
            <p>{profile.email}</p>
          </div>
          <div className="info-card">
            <h3>📱 Phone</h3>
            <p>{profile.phone}</p>
          </div>
          <div className="info-card">
            <h3>📍 Location</h3>
            <p>{profile.location}</p>
          </div>
          <div className="info-card">
            <h3>🔗 LinkedIn</h3>
            <p>{profile.linkedinUrl}</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Send me a message</h3>
          <div className="form-row">
            <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required />
          </div>
          <select name="subject" value={form.subject} onChange={handleChange} required>
            <option value="">Select Subject</option>
            <option value="project">Project Inquiry</option>
            <option value="job">Job Opportunity</option>
            <option value="collaboration">Collaboration</option>
            <option value="other">Other</option>
          </select>
          <textarea name="message" placeholder="Your Message" rows={6} value={form.message} onChange={handleChange} required></textarea>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn" disabled={sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {showToast && (
        <div className="toast">
          ✅ Message sent successfully! I'll respond within 24 hours.
        </div>
      )}
    </div>
  );
};

export default Contact;
```

- [ ] **Step 5: Edit `src/components/Projects.tsx`**
  - Delete the local `interface Project { … }` (lines 4–14).
  - Delete the local `const projects: Project[] = [ … ];` (lines 21–235).
  - Add the import below the React import:

```tsx
import { projects, newestFirst, descriptionParagraphs, Project } from '../data/portfolio';
```

  Replace `const filteredProjects = projects.reverse();` with:

```tsx
  const filteredProjects = newestFirst(projects);
```

  Replace the whole `<div className="description-content">…</div>` block in the modal with:

```tsx
              <div className="description-content">
                {descriptionParagraphs(selectedProject.description).map((p, index) => (
                  <p key={index} className="description-paragraph">{p}</p>
                ))}
              </div>
```

- [ ] **Step 6: Verify the classic site renders the same content.** Run `npm run build`, then serve and check the text of each section with this script, saved as `$SCRATCH/shots/classic-check.js`:

```js
const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new' });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 800 });
  await p.goto(process.argv[2] || 'http://localhost:3005/#classic', { waitUntil: 'networkidle0' });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const checks = [
    [0, ["HELLO I'M", 'VISHWAKARMA', 'A highly driven Front-End Engineer', 'VIEW CV']],
    [1, ['Results-driven developer', 'Google Cloud Server', 'Shree Raghuveer English High School', 'ReactJS']],
    [2, ['FullStack Developer - Realatte', 'Feb 2026 - Nov 2026', 'Entrance1.com']],
    [3, ['Shubhdhanam CRM', 'Space Group GRE', 'Weather App']],
    [4, ['karmasudhir48@gmail.com', 'Send me a message']],
  ];
  let failed = 0;
  for (const [i, needles] of checks) {
    await p.evaluate((n) => document.querySelectorAll('.sidebar .nav-item')[n].click(), i);
    await wait(900);
    const text = await p.evaluate(() => document.body.innerText);
    for (const n of needles) if (!text.includes(n)) { failed++; console.log(`section ${i}: MISSING "${n}"`); }
  }
  const order = await p.evaluate(() => [...document.querySelectorAll('.project-card h3')].map((h) => h.textContent));
  console.log(failed ? `${failed} missing` : 'all sections OK');
  await b.close();
})();
```

Run:

```bash
cd "/home/sudhirvishwakarma/Documents/Landing Pages/Second-Portfolio-Sudhir" && npm run build >/dev/null 2>&1
(npx -y serve@14.2.4 -s build -l 3005 >/dev/null 2>&1 &) ; sleep 3
node $SCRATCH/shots/classic-check.js http://localhost:3005/
```

Expected: `all sections OK`. The Projects page must still list Shubhdhanam CRM first. Before Task 4, the classic site is still at `/` (not `#classic`), which is why the URL above has no hash. Stop the server afterwards with `kill $(ss -ltnp | grep ':3005' | grep -oP 'pid=\K[0-9]+')`.

- [ ] **Step 7: Checkpoint.** Run `CI=true npm run build` → `Compiled successfully.`, then `CI=true npx react-scripts test --watchAll=false` → all pass. Do not commit.

---

### Task 4: Routing, fallback and error boundary

**Files:**
- Create: `src/routing/mode.ts`, `src/routing/ErrorBoundary.tsx`, `src/ClassicApp.tsx`, `src/multiverse/Multiverse.tsx` (temporary wrapper around the prototype)
- Modify (full rewrite): `src/App.tsx`; append to `src/App.css`
- Test: `src/routing/mode.test.ts`

**Interfaces:**
- Produces:
  - `DeviceEnv`, `shouldUseClassic(env: DeviceEnv): boolean`, `detectEnv(): DeviceEnv`
  - `ClassicSection = 'home'|'about'|'work'|'projects'|'contacts'`, `classicSectionFor(hash: string): ClassicSection`, `CLASSIC_HASH = '#classic'`
  - `ErrorBoundary({ onError, children })`, `ClassicApp({ initialSection })`
  - default export `Multiverse({ onFail: () => void })` — a temporary wrapper, replaced in Task 8

- [ ] **Step 1: Write the failing test** `src/routing/mode.test.ts`:

```ts
import { shouldUseClassic, classicSectionFor, DeviceEnv } from './mode';

const desktop: DeviceEnv = { webgl2: true, reducedMotion: false, width: 1440, coarsePointer: false, deviceMemory: 8 };

test('a capable desktop gets the multiverse', () => {
  expect(shouldUseClassic(desktop)).toBe(false);
  expect(shouldUseClassic({ ...desktop, deviceMemory: undefined })).toBe(false);
});

test.each([
  ['no WebGL2', { webgl2: false }],
  ['reduced motion', { reducedMotion: true }],
  ['narrow viewport', { width: 767 }],
  ['touch-first device', { coarsePointer: true }],
  ['low memory', { deviceMemory: 2 }],
])('%s gets the classic site', (_name, patch) => {
  expect(shouldUseClassic({ ...desktop, ...patch })).toBe(true);
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

- [ ] **Step 2: Run the test to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/routing`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/routing/mode.ts`**

```ts
export interface DeviceEnv {
  webgl2: boolean;
  reducedMotion: boolean;
  width: number;
  coarsePointer: boolean;
  deviceMemory?: number;
}

export const CLASSIC_HASH = '#classic';
export type ClassicSection = 'home' | 'about' | 'work' | 'projects' | 'contacts';

export function shouldUseClassic(env: DeviceEnv): boolean {
  return (
    !env.webgl2 ||
    env.reducedMotion ||
    env.width < 768 ||
    env.coarsePointer ||
    (env.deviceMemory !== undefined && env.deviceMemory < 4)
  );
}

export function detectEnv(): DeviceEnv {
  let webgl2 = false;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    webgl2 = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webgl2 = false;
  }
  const media = (q: string) => (typeof window.matchMedia === 'function' ? window.matchMedia(q).matches : false);
  return {
    webgl2,
    reducedMotion: media('(prefers-reduced-motion: reduce)'),
    width: window.innerWidth,
    coarsePointer: media('(pointer: coarse)'),
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
  };
}

export function classicSectionFor(hash: string): ClassicSection {
  switch (hash.replace(/^#/, '')) {
    case 'about':
    case 'skills':
    case 'certifications':
      return 'about';
    case 'work':
      return 'work';
    case 'projects':
      return 'projects';
    case 'contact':
      return 'contacts';
    default:
      return 'home';
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `CI=true npx react-scripts test --watchAll=false src/routing`
Expected: PASS (7 tests).

- [ ] **Step 5: Create `src/routing/ErrorBoundary.tsx`**

```tsx
import React from 'react';

interface Props { onError: () => void; children: React.ReactNode }
interface State { failed: boolean }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Multiverse crashed, switching to the classic site:', error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
```

- [ ] **Step 6: Create `src/ClassicApp.tsx`.** This is the previous App body with an `initialSection` prop.

```tsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import { ClassicSection } from './routing/mode';
import './App.css';

const ClassicApp: React.FC<{ initialSection: ClassicSection }> = ({ initialSection }) => {
  const [activeSection, setActiveSection] = useState<ClassicSection>(initialSection);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSectionChange = (section: ClassicSection) => {
    if (section === activeSection) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 100);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'about': return <About />;
      case 'work': return <Skills />;
      case 'projects': return <Projects />;
      case 'contacts': return <Contact />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeSection={activeSection} setActiveSection={handleSectionChange} />
      <main className={`main-content ${isTransitioning ? 'genie-out' : 'genie-in'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default ClassicApp;
```

- [ ] **Step 7: Create the temporary `src/multiverse/Multiverse.tsx`.** Until Task 8, the prototype serves as the multiverse:

```tsx
import React from 'react';
import Lab from '../lab/Lab';

const Multiverse: React.FC<{ onFail: () => void }> = () => <Lab />;

export default Multiverse;
```

- [ ] **Step 8: Rewrite `src/App.tsx`**

```tsx
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import ClassicApp from './ClassicApp';
import { CLASSIC_HASH, classicSectionFor, detectEnv, shouldUseClassic } from './routing/mode';
import { ErrorBoundary } from './routing/ErrorBoundary';

const Multiverse = lazy(() => import('./multiverse/Multiverse'));

const App: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);
  const [failed, setFailed] = useState(false);
  const forcedClassic = useMemo(() => shouldUseClassic(detectEnv()), []);

  useEffect(() => {
    const onNav = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onNav);
    window.addEventListener('popstate', onNav);
    return () => {
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('popstate', onNav);
    };
  }, []);

  if (forcedClassic || failed || hash === CLASSIC_HASH) {
    return <ClassicApp initialSection={classicSectionFor(hash)} />;
  }

  return (
    <ErrorBoundary onError={() => setFailed(true)}>
      <Suspense fallback={<div className="mv-boot" />}>
        <Multiverse onFail={() => setFailed(true)} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
```

Append to `src/App.css`:

```css
.mv-boot {
  position: fixed;
  inset: 0;
  background: #000004;
}
```

- [ ] **Step 9: Verify routing.** Run `npm run build` and serve on 3005 as in Task 3 Step 6.
  - `node $SCRATCH/shots/classic-check.js http://localhost:3005/#classic` → `all sections OK`.
  - Run this check, which uses a narrow viewport and expects the classic site:

```bash
node -e "
const puppeteer=require('$SCRATCH/shots/node_modules/puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new'});
const p=await b.newPage();await p.setViewport({width:600,height:900});
await p.goto('http://localhost:3005/#projects',{waitUntil:'networkidle0'});
console.log('narrow →', await p.evaluate(()=>document.querySelector('.sidebar')?'classic':'multiverse'),
  '| projects open:', await p.evaluate(()=>!!document.querySelector('.projects-page')));
await b.close();})();"
```

  Expected: `narrow → classic | projects open: true`. Stop the server.

- [ ] **Step 10: Checkpoint.** `CI=true npm run build` → `Compiled successfully.`; all tests pass. Do not commit.

---

## Phase 2: Engine

### Task 5: Journey model

**Files:**
- Create: `src/multiverse/journey.ts`
- Test: `src/multiverse/journey.test.ts`

**Interfaces:**
- Produces:
  - `UniverseId`, `Vec3 = [number, number, number]`, `UNIVERSES`, `UNIVERSE_LABELS`
  - `UNIVERSE_SPACING = 400`, `PORTAL_OFFSET = 60`, `WARMUP_MS = 1600`, `WORK_STOPS: Vec3[]`
  - `Step { universe; beat; pos: Vec3; look: Vec3; hint }`, `STEPS: Step[]`
  - `universeIndex(u): number`, `universeOrigin(u): Vec3`, `portalCenter(u): Vec3` (local, relative to the universe origin)
  - `worldPose(i): { pos: Vec3; look: Vec3 }`
  - `next(i)`, `prev(i)`, `firstStepOf(u)`, `universeOf(i): UniverseId`, `isWarp(from, to)`
  - `hashFor(i): string`, `stepForHash(hash): number | null`, `universeAtZ(z): number`

- [ ] **Step 1: Write the failing test** `src/multiverse/journey.test.ts`:

```ts
import {
  STEPS, UNIVERSES, worldPose, universeAtZ, universeIndex, next, prev, firstStepOf, universeOf,
  isWarp, hashFor, stepForHash, portalCenter, PORTAL_OFFSET, universeOrigin,
} from './journey';

test('steps follow the agreed order', () => {
  expect(STEPS.map((s) => `${s.universe}:${s.beat}`)).toEqual([
    'home:hero', 'about:summary', 'about:education', 'skills:belt', 'certifications:archive',
    'work:job-0', 'work:job-1', 'work:job-2', 'projects:galaxy', 'contact:station',
  ]);
});

test('every camera pose sits inside its own universe', () => {
  STEPS.forEach((s, i) => expect(universeAtZ(worldPose(i).pos[2])).toBe(universeIndex(s.universe)));
});

test('universeAtZ splits space at each portal plane', () => {
  expect(universeAtZ(1000)).toBe(0);
  expect(universeAtZ(-339.9)).toBe(0);
  expect(universeAtZ(-340)).toBe(1);
  expect(universeAtZ(-740)).toBe(2);
  expect(universeAtZ(-99999)).toBe(UNIVERSES.length - 1);
});

test('next/prev clamp at the ends', () => {
  expect(prev(0)).toBe(0);
  expect(next(0)).toBe(1);
  expect(next(STEPS.length - 1)).toBe(STEPS.length - 1);
});

test('warps only between universes', () => {
  expect(isWarp(0, 1)).toBe(true);
  expect(isWarp(1, 2)).toBe(false);
  expect(isWarp(5, 7)).toBe(false);
  expect(isWarp(0, 9)).toBe(true);
});

test('hash round trip for every universe', () => {
  UNIVERSES.forEach((u) => {
    const i = firstStepOf(u);
    expect(universeOf(i)).toBe(u);
    expect(stepForHash(hashFor(i))).toBe(i);
  });
  expect(hashFor(6)).toBe('#work');
});

test('empty hash is home, unknown hashes are ignored', () => {
  expect(stepForHash('')).toBe(0);
  expect(stepForHash('#')).toBe(0);
  expect(stepForHash('#classic')).toBeNull();
  expect(stepForHash('#lab')).toBeNull();
  expect(stepForHash('#foo')).toBeNull();
});

test('each portal sits on the camera line into its universe', () => {
  UNIVERSES.slice(1).forEach((u) => {
    const c = portalCenter(u);
    const first = STEPS[firstStepOf(u)];
    expect(c).toEqual([first.pos[0], first.pos[1], PORTAL_OFFSET]);
    expect(universeOrigin(u)[2]).toBe(-400 * universeIndex(u));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/multiverse/journey`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/multiverse/journey.ts`**

```ts
export type UniverseId = 'home' | 'about' | 'skills' | 'certifications' | 'work' | 'projects' | 'contact';
export type Vec3 = [number, number, number];

export const UNIVERSES: UniverseId[] = ['home', 'about', 'skills', 'certifications', 'work', 'projects', 'contact'];
export const UNIVERSE_LABELS: Record<UniverseId, string> = {
  home: 'Home',
  about: 'About',
  skills: 'Skills',
  certifications: 'Certifications',
  work: 'Work',
  projects: 'Projects',
  contact: 'Contact',
};

export const UNIVERSE_SPACING = 400;
export const PORTAL_OFFSET = 60;
/** Everything is mounted and visible this long at start (behind the loader) so shaders compile. */
export const WARMUP_MS = 1600;
/** Company planets in the Work universe, newest first (local coordinates). */
export const WORK_STOPS: Vec3[] = [[0, 0, 0], [-16, 3, -70], [14, -2, -140]];

export interface Step { universe: UniverseId; beat: string; pos: Vec3; look: Vec3; hint: string }

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const workStep = (i: number, hint: string): Step => ({
  universe: 'work',
  beat: `job-${i}`,
  pos: add(WORK_STOPS[i], [-9, 2.5, 18]),
  look: add(WORK_STOPS[i], [-6, 0, 0]),
  hint,
});

/** Camera poses are local to each universe's origin. */
export const STEPS: Step[] = [
  { universe: 'home', beat: 'hero', pos: [-7, 7, 30], look: [-7, 0, 0], hint: 'Scroll to warp to About' },
  { universe: 'about', beat: 'summary', pos: [-6, 2, 30], look: [-6, 0, 0], hint: 'Scroll for Education' },
  { universe: 'about', beat: 'education', pos: [-4, 9, 22], look: [-4, 0, 0], hint: 'Scroll to warp to Skills' },
  { universe: 'skills', beat: 'belt', pos: [-8, 8, 32], look: [-8, 0, 0], hint: 'Scroll to warp to Certifications' },
  { universe: 'certifications', beat: 'archive', pos: [-7, 3, 28], look: [-7, 0, 0], hint: 'Scroll to warp to Work' },
  workStep(0, 'Scroll for the next role'),
  workStep(1, 'Scroll for the next role'),
  workStep(2, 'Scroll to warp to Projects'),
  { universe: 'projects', beat: 'galaxy', pos: [0, 26, 50], look: [0, 0, 0], hint: 'Click a star · Scroll to warp to Contact' },
  { universe: 'contact', beat: 'station', pos: [-8, 3, 26], look: [-8, 1, 0], hint: 'Scroll up to travel back' },
];

const LAST = STEPS.length - 1;
const clamp = (i: number) => Math.max(0, Math.min(LAST, i));

export const universeIndex = (u: UniverseId) => UNIVERSES.indexOf(u);
export const universeOrigin = (u: UniverseId): Vec3 => [0, 0, -UNIVERSE_SPACING * universeIndex(u)];
export const universeOf = (i: number): UniverseId => STEPS[clamp(i)].universe;
export const firstStepOf = (u: UniverseId) => STEPS.findIndex((s) => s.universe === u);
export const next = (i: number) => clamp(i + 1);
export const prev = (i: number) => clamp(i - 1);
export const isWarp = (from: number, to: number) => universeOf(from) !== universeOf(to);

/** Portal ring centre, local to its universe: on the straight camera line into the first step. */
export function portalCenter(u: UniverseId): Vec3 {
  const first = STEPS[firstStepOf(u)];
  return [first.pos[0], first.pos[1], PORTAL_OFFSET];
}

export function worldPose(i: number): { pos: Vec3; look: Vec3 } {
  const s = STEPS[clamp(i)];
  const o = universeOrigin(s.universe);
  return { pos: add(o, s.pos), look: add(o, s.look) };
}

export const hashFor = (i: number) => `#${universeOf(i)}`;

export function stepForHash(hash: string): number | null {
  const id = hash.replace(/^#/, '');
  if (id === '') return 0;
  return (UNIVERSES as string[]).includes(id) ? firstStepOf(id as UniverseId) : null;
}

/** Which universe owns world-space z: universe n spans (portal n+1, portal n]. */
export function universeAtZ(z: number): number {
  const n = Math.floor((PORTAL_OFFSET - z) / UNIVERSE_SPACING);
  return Math.max(0, Math.min(UNIVERSES.length - 1, n));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `CI=true npx react-scripts test --watchAll=false src/multiverse/journey`
Expected: PASS (8 tests).

- [ ] **Step 5: Checkpoint.** All tests pass. Do not commit.

---

### Task 6: Journey store

**Files:**
- Modify: `package.json` (add `"zustand": "3.7.2"` to dependencies)
- Create: `src/multiverse/store.ts`
- Test: `src/multiverse/store.test.ts`

**Interfaces:**
- Consumes: `STEPS, isWarp, universeIndex, universeOf` (Task 5).
- Produces:
  - `useJourney` — a zustand hook with `getState`, `setState` and `subscribe`
  - `Modal = { kind: 'cv' } | { kind: 'certificate'; index: number } | { kind: 'project'; index: number }`
  - `MoveKind = 'glide' | 'warp'`, `SETTLE_MS = 400`
  - State fields: `step, moving, moveKind, arrivedAt, cameraUniverse, modal, beamAt, booted`
  - Actions: `go(dir, now?)`, `jump(target, now?)`, `arrive(now?)`, `setCameraUniverse(n)`, `openModal(m)`, `closeModal()`, `fireBeam(now?)`, `setBooted()`, `reset(step)`

- [ ] **Step 1: Pin zustand.** Run `npm install zustand@3.7.2 --save-exact --no-audit --no-fund`, then `grep '"zustand"' package.json` → `"zustand": "3.7.2"`.

- [ ] **Step 2: Write the failing test** `src/multiverse/store.test.ts`:

```ts
import { useJourney, SETTLE_MS } from './store';

const S = () => useJourney.getState();
beforeEach(() => S().reset(0));

test('go moves one step and warps between universes', () => {
  S().go(1, 1000);
  expect(S()).toMatchObject({ step: 1, moving: true, moveKind: 'warp' });
});

test('input is ignored while the camera is moving', () => {
  S().go(1, 1000);
  S().go(1, 1001);
  S().jump(8, 1002);
  expect(S().step).toBe(1);
});

test('trackpad inertia right after arriving is ignored', () => {
  S().go(1, 1000);
  S().arrive(2000);
  S().go(1, 2000 + SETTLE_MS - 1);
  expect(S().step).toBe(1);
  S().go(1, 2000 + SETTLE_MS);
  expect(S()).toMatchObject({ step: 2, moveKind: 'glide' });
});

test('clamps at both ends without starting a move', () => {
  S().go(-1, 1000);
  expect(S()).toMatchObject({ step: 0, moving: false });
  S().reset(9);
  S().go(1, 1000);
  expect(S()).toMatchObject({ step: 9, moving: false });
});

test('an open modal blocks go, but jump closes it', () => {
  S().openModal({ kind: 'cv' });
  S().go(1, 1000);
  expect(S().step).toBe(0);
  S().jump(8, 1000);
  expect(S()).toMatchObject({ step: 8, modal: null, moveKind: 'warp' });
});

test('reset puts the camera in the step universe', () => {
  S().reset(6);
  expect(S()).toMatchObject({ step: 6, cameraUniverse: 4, moving: false, modal: null });
});

test('setCameraUniverse, fireBeam and setBooted', () => {
  S().setCameraUniverse(3);
  S().fireBeam(1234);
  S().setBooted();
  expect(S()).toMatchObject({ cameraUniverse: 3, beamAt: 1234, booted: true });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/multiverse/store`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement `src/multiverse/store.ts`**

```ts
import create from 'zustand';
import { STEPS, isWarp, universeIndex, universeOf } from './journey';

export type Modal = { kind: 'cv' } | { kind: 'certificate'; index: number } | { kind: 'project'; index: number };
export type MoveKind = 'glide' | 'warp';

/** Ignore input this long after arriving (absorbs trackpad inertia). */
export const SETTLE_MS = 400;

export interface JourneyState {
  step: number;
  moving: boolean;
  moveKind: MoveKind;
  arrivedAt: number;
  cameraUniverse: number;
  modal: Modal | null;
  beamAt: number;
  booted: boolean;
  go: (dir: 1 | -1, now?: number) => void;
  jump: (target: number, now?: number) => void;
  arrive: (now?: number) => void;
  setCameraUniverse: (n: number) => void;
  openModal: (m: Modal) => void;
  closeModal: () => void;
  fireBeam: (now?: number) => void;
  setBooted: () => void;
  reset: (step: number) => void;
}

const clampStep = (i: number) => Math.max(0, Math.min(STEPS.length - 1, i));

export const useJourney = create<JourneyState>((set, get) => ({
  step: 0,
  moving: false,
  moveKind: 'glide',
  arrivedAt: -Infinity,
  cameraUniverse: 0,
  modal: null,
  beamAt: -Infinity,
  booted: false,

  go: (dir, now = performance.now()) => {
    const s = get();
    if (s.modal) return;
    s.jump(s.step + dir, now);
  },

  jump: (target, now = performance.now()) => {
    const s = get();
    const to = clampStep(target);
    if (s.moving || to === s.step || now - s.arrivedAt < SETTLE_MS) return;
    set({ step: to, moving: true, moveKind: isWarp(s.step, to) ? 'warp' : 'glide', modal: null });
  },

  arrive: (now = performance.now()) => {
    if (get().moving) set({ moving: false, arrivedAt: now });
  },

  setCameraUniverse: (n) => {
    if (get().cameraUniverse !== n) set({ cameraUniverse: n });
  },

  openModal: (m) => set({ modal: m }),
  closeModal: () => set({ modal: null }),
  fireBeam: (now = performance.now()) => set({ beamAt: now }),
  setBooted: () => set({ booted: true }),

  reset: (step) => {
    const to = clampStep(step);
    set({
      step: to,
      moving: false,
      moveKind: 'glide',
      arrivedAt: -Infinity,
      cameraUniverse: universeIndex(universeOf(to)),
      modal: null,
    });
  },
}));
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `CI=true npx react-scripts test --watchAll=false src/multiverse/store`
Expected: PASS (7 tests).

- [ ] **Step 6: Checkpoint.** All tests pass; `CI=true npm run build` → `Compiled successfully.` Do not commit.

---

### Task 7: Visual effects library

**Files:**
- Create: `src/multiverse/fx/rig.ts`, `glow.ts`, `shaders.ts`, `palettes.ts`, `Starfield.tsx`, `Hyperspace.tsx`, `Nebula.tsx`, `Planet.tsx`, `GlowSprite.tsx`, `PostFX.tsx`

**Interfaces:**
- Consumes: `UniverseId, Vec3` (Task 5).
- Produces:
  - `rig: { warp: number }`, `glowTexture: THREE.CanvasTexture`
  - `noise`, `sunShader`, `planetShader` (uniforms: `uTime, uColorA, uColorB, uAtmos, uBands, uHover, uLightPos`)
  - `Palette { a: string; b: string; atmos: string }`, `PALETTES: Record<UniverseId, Palette>`
  - Components:
    - `<Starfield/>`, `<Hyperspace/>`
    - `<Nebula palette radius? count? thickness? center?/>`
    - `<Planet radius palette bands lightPos highlight? ring? position? onPointerOver? onPointerOut? onClick?/>`
    - `<GlowSprite color scale opacity? position?/>`
    - `<PostFX bloom: boolean/>`

There is no unit test for this task: these are WebGL components, and Jest can't load `three`. Verification is the build plus the Task 8 visual check.

- [ ] **Step 1: Create `fx/rig.ts` and `fx/glow.ts`**

```ts
// fx/rig.ts — per-frame values written by CameraRig, read by effects
export const rig = { warp: 0 };
```

```ts
// fx/glow.ts — soft round sprite texture
import * as THREE from 'three';

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export const glowTexture = makeGlowTexture();
```

- [ ] **Step 2: Create `fx/shaders.ts`**

```ts
// 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT) + fbm
export const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){
  float f=0.0;float a=0.5;
  for(int i=0;i<5;i++){f+=a*snoise(p);p*=2.02;a*=0.5;}
  return f;
}
`;

const sphereVertex = /* glsl */ `
varying vec3 vPos;
varying vec3 vWorldPos;
varying vec3 vNormal;
void main(){
  vPos=position;
  vec4 wp=modelMatrix*vec4(position,1.0);
  vWorldPos=wp.xyz;
  vNormal=normalize(mat3(modelMatrix)*normal);
  gl_Position=projectionMatrix*viewMatrix*wp;
}
`;

export const sunShader = {
  vertexShader: sphereVertex,
  fragmentShader: /* glsl */ `
uniform float uTime;
varying vec3 vPos;
varying vec3 vWorldPos;
varying vec3 vNormal;
${noise}
void main(){
  vec3 p=normalize(vPos)*1.6;
  float n=fbm(p+vec3(uTime*0.06,uTime*0.04,-uTime*0.05));
  float n2=fbm(p*3.0-vec3(uTime*0.12));
  float heat=clamp(0.55+n*0.9+n2*0.35,0.0,1.0);
  vec3 col=mix(vec3(0.9,0.18,0.0),vec3(1.0,0.62,0.12),heat);
  col=mix(col,vec3(1.0,0.95,0.75),smoothstep(0.78,1.0,heat));
  vec3 viewDir=normalize(cameraPosition-vWorldPos);
  float rim=pow(1.0-max(dot(viewDir,vNormal),0.0),2.5);
  col+=vec3(1.0,0.45,0.05)*rim*1.2;
  gl_FragColor=vec4(col*1.25,1.0);
}
`,
};

export const planetShader = {
  vertexShader: sphereVertex,
  fragmentShader: /* glsl */ `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uAtmos;
uniform float uBands;
uniform float uHover;
uniform vec3 uLightPos;
varying vec3 vPos;
varying vec3 vWorldPos;
varying vec3 vNormal;
${noise}
void main(){
  vec3 p=normalize(vPos);
  float warp=fbm(p*2.0+uTime*0.03);
  float bands=sin(p.y*uBands+warp*4.0)*0.5+0.5;
  float detail=fbm(p*6.0)*0.5+0.5;
  vec3 col=mix(uColorA,uColorB,bands*0.8+detail*0.2);
  vec3 L=normalize(uLightPos-vWorldPos);
  float diff=max(dot(vNormal,L),0.0);
  vec3 viewDir=normalize(cameraPosition-vWorldPos);
  float rim=pow(1.0-max(dot(viewDir,vNormal),0.0),3.0);
  vec3 lit=col*(0.06+diff*1.1)+uAtmos*rim*(0.6+diff+uHover*1.5);
  gl_FragColor=vec4(lit,1.0);
}
`,
};
```

- [ ] **Step 3: Create `fx/palettes.ts`**

```ts
import { UniverseId } from '../journey';

export interface Palette { a: string; b: string; atmos: string }

export const PALETTES: Record<UniverseId, Palette> = {
  home: { a: '#7c2d12', b: '#fb923c', atmos: '#fdba74' },
  about: { a: '#1e3a8a', b: '#38bdf8', atmos: '#60a5fa' },
  skills: { a: '#065f46', b: '#2dd4bf', atmos: '#5eead4' },
  certifications: { a: '#78350f', b: '#fbbf24', atmos: '#fcd34d' },
  work: { a: '#7f1d1d', b: '#f97316', atmos: '#fb923c' },
  projects: { a: '#4c1d95', b: '#e879f9', atmos: '#c084fc' },
  contact: { a: '#064e3b', b: '#34d399', atmos: '#6ee7b7' },
};
```

- [ ] **Step 4: Create `fx/Starfield.tsx` and `fx/Hyperspace.tsx`**

```tsx
// fx/Starfield.tsx — a star sphere that travels with the camera
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

export const Starfield: React.FC = () => {
  const group = useRef<THREE.Group>(null!);
  useFrame(({ camera }) => group.current.position.copy(camera.position));
  return (
    <group ref={group}>
      <Stars radius={120} depth={60} count={6000} factor={4} saturation={0.4} fade speed={0.6} />
    </group>
  );
};
```

```tsx
// fx/Hyperspace.tsx — light streaks, strength driven by rig.warp
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { rig } from './rig';

const STREAKS = 1400;

export const Hyperspace: React.FC = () => {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(
    () =>
      Array.from({ length: STREAKS }, () => {
        const a = Math.random() * Math.PI * 2;
        const r = 2.5 + Math.pow(Math.random(), 0.7) * 45;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: -260 + Math.random() * 280 };
      }),
    []
  );

  useFrame(({ camera }, dt) => {
    const w = rig.warp;
    mesh.current.position.copy(camera.position);
    mesh.current.visible = w > 0.01;
    if (!mesh.current.visible) return;
    mat.current.opacity = Math.min(1, w * 1.6);
    const speed = 120 + w * 900;
    for (let i = 0; i < STREAKS; i++) {
      const d = data[i];
      d.z += speed * Math.min(dt, 0.05);
      if (d.z > 20) d.z -= 280;
      dummy.position.set(d.x, d.y, d.z);
      dummy.scale.set(1, 1, 1 + w * 38);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, STREAKS]} frustumCulled={false}>
      <boxGeometry args={[0.035, 0.035, 0.5]} />
      <meshBasicMaterial ref={mat} color={[1.6, 1.9, 3]} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  );
};
```

(`Math.min(dt, 0.05)` keeps streaks coherent when frames drop; the prototype's streaks scattered at low fps.)

- [ ] **Step 5: Create `fx/GlowSprite.tsx`, `fx/Nebula.tsx`, `fx/Planet.tsx`**

```tsx
// fx/GlowSprite.tsx
import React from 'react';
import * as THREE from 'three';
import { glowTexture } from './glow';
import { Vec3 } from '../journey';

interface GlowSpriteProps { color: THREE.ColorRepresentation; scale: number | Vec3; opacity?: number; position?: Vec3 }

export const GlowSprite: React.FC<GlowSpriteProps> = ({ color, scale, opacity = 1, position }) => (
  <sprite scale={scale} position={position}>
    <spriteMaterial map={glowTexture} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
  </sprite>
);
```

```tsx
// fx/Nebula.tsx — swirl of glowing points plus soft colour clouds
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { glowTexture } from './glow';
import { GlowSprite } from './GlowSprite';
import { Palette } from './palettes';
import { Vec3 } from '../journey';

interface NebulaProps { palette: Palette; radius?: number; count?: number; thickness?: number; center?: Vec3 }

export const Nebula: React.FC<NebulaProps> = ({ palette, radius = 60, count = 4000, thickness = 14, center = [0, 0, 0] }) => {
  const points = useRef<THREE.Points>(null!);
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const a = new THREE.Color(palette.a);
    const b = new THREE.Color(palette.b);
    const white = new THREE.Color('#ffffff');
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 6;
      const r = radius * (0.12 + (t / (Math.PI * 6)) * 0.88) + (Math.random() - 0.5) * radius * 0.15;
      pos[i * 3] = Math.cos(t) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * thickness * Math.exp(-r / radius);
      pos[i * 3 + 2] = Math.sin(t) * r;
      c.copy(a).lerp(b, Math.random()).lerp(white, Math.random() * Math.random() * 0.6);
      col.set([c.r * 1.6, c.g * 1.6, c.b * 1.6], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [palette, radius, count, thickness]);

  useFrame((_, dt) => {
    points.current.rotation.y += dt * 0.02;
  });

  return (
    <group position={center}>
      <points ref={points} geometry={geo}>
        <pointsMaterial size={0.55} map={glowTexture} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <GlowSprite
          key={i}
          color={i % 2 ? palette.a : palette.b}
          scale={radius * (0.5 + (i % 3) * 0.2)}
          opacity={0.2}
          position={[Math.cos(i * 1.05) * radius * 0.45, Math.sin(i * 2) * radius * 0.08, Math.sin(i * 1.05) * radius * 0.45 - radius * 0.3]}
        />
      ))}
    </group>
  );
};
```

```tsx
// fx/Planet.tsx — procedural banded planet lit from a world-space point
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { planetShader } from './shaders';
import { Palette } from './palettes';
import { Vec3 } from '../journey';

interface PlanetProps {
  radius: number;
  palette: Palette;
  bands: number;
  lightPos: Vec3;
  highlight?: number;
  ring?: boolean;
  position?: Vec3;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

export const Planet: React.FC<PlanetProps> = ({ radius, palette, bands, lightPos, highlight = 0, ring, position, onPointerOver, onPointerOut, onClick }) => {
  const body = useRef<THREE.Mesh>(null!);
  const [lx, ly, lz] = lightPos;
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(palette.a) },
      uColorB: { value: new THREE.Color(palette.b) },
      uAtmos: { value: new THREE.Color(palette.atmos) },
      uBands: { value: bands },
      uHover: { value: 0 },
      uLightPos: { value: new THREE.Vector3(lx, ly, lz) },
    }),
    [palette, bands, lx, ly, lz]
  );

  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    easing.damp(uniforms.uHover, 'value', highlight, 0.2, dt);
    body.current.rotation.y += dt * 0.25;
    easing.damp3(body.current.scale, 1 + highlight * 0.25, 0.2, dt);
  });

  return (
    <group position={position}>
      <mesh ref={body} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial args={[planetShader]} uniforms={uniforms} />
      </mesh>
      {ring && (
        <mesh rotation={[-Math.PI / 2.4, 0, 0.3]}>
          <ringGeometry args={[radius * 1.4, radius * 1.95, 128]} />
          <meshBasicMaterial color={palette.atmos} transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};
```

- [ ] **Step 6: Create `fx/PostFX.tsx`**

```tsx
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { rig } from './rig';

export const PostFX: React.FC<{ bloom: boolean }> = ({ bloom }) => {
  const ca = useRef<any>(null);
  const offset = useMemo(() => new THREE.Vector2(0, 0), []);
  useFrame(() => {
    const w = rig.warp * rig.warp;
    offset.set(0.0035 * w, 0.0035 * w);
    if (ca.current) ca.current.offset = offset;
  });
  const aberration = <ChromaticAberration ref={ca} offset={offset} radialModulation={false} modulationOffset={0} />;
  const vignette = <Vignette eskil={false} offset={0.25} darkness={0.85} />;
  return bloom ? (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.85} luminanceSmoothing={0.2} radius={0.75} />
      {aberration}
      {vignette}
    </EffectComposer>
  ) : (
    <EffectComposer multisampling={0}>
      {aberration}
      {vignette}
    </EffectComposer>
  );
};
```

- [ ] **Step 7: Checkpoint.** `CI=true npm run build` → `Compiled successfully.` These files aren't imported yet, so a type error only shows up once Task 8 imports them. Run `npx tsc --noEmit -p .` now to catch errors early. Expected: no output. Do not commit.

---

### Task 8: Camera, portals, world, input and the real canvas

**Files:**
- Create: `src/multiverse/camera/CameraRig.tsx`, `src/multiverse/fx/Portal.tsx`, `src/multiverse/world/World.tsx`, `src/multiverse/universes/index.ts`, `src/multiverse/universes/BasicUniverse.tsx`, `src/multiverse/input.ts`, `src/multiverse/multiverse.css`
- Modify (full rewrite): `src/multiverse/Multiverse.tsx`
- Delete: `src/lab/` (no longer referenced)
- Test: `src/multiverse/input.test.ts`

**Interfaces:**
- Consumes:
  - from `journey`: `worldPose, universeAtZ, universeOrigin, portalCenter, PORTAL_OFFSET, UNIVERSES, universeIndex, universeOf, stepForHash`
  - from `store`: `useJourney`
  - the fx components from Task 7
- Produces:
  - `UniverseProps { active: boolean; preview?: boolean }`
  - `UNIVERSE_COMPONENTS: Record<UniverseId, React.FC<UniverseProps>>` (mutable registry; later tasks replace entries)
  - `isFormField(target)`, `insideScrollable(target)`, `useJourneyInput()`

- [ ] **Step 1: Write the failing test** `src/multiverse/input.test.ts`:

```ts
import { isFormField, insideScrollable } from './input';

test('form fields swallow keys, other elements do not', () => {
  const input = document.createElement('input');
  const textarea = document.createElement('textarea');
  const div = document.createElement('div');
  document.body.append(input, textarea, div);
  expect(isFormField(input)).toBe(true);
  expect(isFormField(textarea)).toBe(true);
  expect(isFormField(div)).toBe(false);
  expect(isFormField(null)).toBe(false);
});

test('wheel inside an overflowing capture-scroll panel stays in the panel', () => {
  const panel = document.createElement('section');
  panel.setAttribute('data-capture-scroll', '');
  const child = document.createElement('p');
  panel.appendChild(child);
  document.body.appendChild(panel);
  Object.defineProperty(panel, 'clientHeight', { value: 200, configurable: true });
  Object.defineProperty(panel, 'scrollHeight', { value: 600, configurable: true });
  expect(insideScrollable(child)).toBe(true);
  Object.defineProperty(panel, 'scrollHeight', { value: 200, configurable: true });
  expect(insideScrollable(child)).toBe(false);
  expect(insideScrollable(document.body)).toBe(false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/multiverse/input`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/multiverse/input.ts`**

```ts
import { useEffect } from 'react';
import { STEPS } from './journey';
import { useJourney } from './store';

export function isFormField(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && typeof el.closest === 'function' && !!el.closest('input, textarea, select, [contenteditable="true"]');
}

/** True when the target is inside a [data-capture-scroll] element that actually overflows. */
export function insideScrollable(target: EventTarget | null): boolean {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    if (el.hasAttribute && el.hasAttribute('data-capture-scroll') && el.scrollHeight > el.clientHeight + 1) return true;
    el = el.parentElement;
  }
  return false;
}

export function useJourneyInput(): void {
  useEffect(() => {
    const store = useJourney.getState;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 20 || insideScrollable(e.target)) return;
      store().go(e.deltaY > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (isFormField(e.target)) return;
      const s = store();
      if (s.modal) {
        if (e.key === 'Escape') s.closeModal();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        s.go(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        s.go(-1);
      } else if (e.key === 'Home') {
        s.jump(0);
      } else if (e.key === 'End') {
        s.jump(STEPS.length - 1);
      }
    };

    let startY = 0;
    let startTarget: EventTarget | null = null;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startTarget = e.target;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40 && !insideScrollable(startTarget)) store().go(dy > 0 ? 1 : -1);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `CI=true npx react-scripts test --watchAll=false src/multiverse/input`
Expected: PASS (2 tests).

- [ ] **Step 5: Create `camera/CameraRig.tsx`.** It must be the first child of the Canvas.

```tsx
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { worldPose, universeAtZ } from '../journey';
import { useJourney } from '../store';
import { rig } from '../fx/rig';

/** Mount FIRST inside <Canvas> so camera-following objects never lag a frame behind. */
export const CameraRig: React.FC = () => {
  const ready = useRef(false);
  const look = useMemo(() => new THREE.Vector3(), []);
  const goalLook = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const last = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const s = useJourney.getState();
    const pose = worldPose(s.step);

    if (!ready.current) {
      cam.position.set(...pose.pos);
      look.set(...pose.look);
      last.copy(cam.position);
      ready.current = true;
    }

    target.set(pose.pos[0] + state.pointer.x * 1.6, pose.pos[1] + state.pointer.y * 1.0, pose.pos[2]);
    goalLook.set(...pose.look);
    const warping = s.moving && s.moveKind === 'warp';
    easing.damp3(cam.position, target, warping ? 0.85 : 0.6, dt);
    easing.damp3(look, goalLook, 0.5, dt);
    cam.lookAt(look);

    const speed = cam.position.distanceTo(last) / Math.max(dt, 1e-4);
    last.copy(cam.position);
    easing.damp(rig, 'warp', warping ? THREE.MathUtils.clamp((speed - 25) / 160, 0, 1) : 0, 0.15, dt);
    easing.damp(cam, 'fov', 55 + rig.warp * 38, 0.25, dt);
    cam.rotation.z += (Math.random() - 0.5) * 0.012 * rig.warp;
    cam.updateProjectionMatrix();

    if (s.moving && cam.position.distanceTo(target) < 0.5) s.arrive();
    s.setCameraUniverse(universeAtZ(cam.position.z));
  });

  return null;
};
```

- [ ] **Step 6: Create `fx/Portal.tsx`**

```tsx
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshPortalMaterial, Sparkles } from '@react-three/drei';
import { PALETTES } from './palettes';
import { UniverseId, portalCenter, universeOrigin } from '../journey';

const PORTAL_RADIUS = 5;
const VISIBLE_RANGE = 260;

interface PortalProps { universe: UniverseId; warm: boolean; children: React.ReactNode }

/** Ring at the entrance of a universe; its disc shows a live preview of that universe. */
export const Portal: React.FC<PortalProps> = ({ universe, warm, children }) => {
  const group = useRef<THREE.Group>(null!);
  const outer = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  const palette = PALETTES[universe];
  const glow = useMemo(() => new THREE.Color(palette.atmos).multiplyScalar(5), [palette]);
  const center = portalCenter(universe);
  const portalZ = universeOrigin(universe)[2] + center[2];

  useFrame((state, dt) => {
    const d = state.camera.position.z - portalZ;
    group.current.visible = warm || (d > 0 && d < VISIBLE_RANGE);
    outer.current.rotation.z += dt * 0.4;
    inner.current.rotation.z -= dt * 0.7;
  });

  return (
    <group ref={group} position={center}>
      <mesh>
        <circleGeometry args={[PORTAL_RADIUS, 96]} />
        <MeshPortalMaterial resolution={1024} blur={0}>
          <color attach="background" args={['#020108']} />
          <ambientLight intensity={0.4} />
          {/* undo the portal's offset so the preview lines up with the real universe */}
          <group position={[-center[0], -center[1], -center[2]]}>{children}</group>
        </MeshPortalMaterial>
      </mesh>
      <mesh ref={outer}>
        <torusGeometry args={[PORTAL_RADIUS + 0.05, 0.07, 16, 160]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[PORTAL_RADIUS + 0.4, 0.02, 8, 160, Math.PI * 1.4]} />
        <meshBasicMaterial color={glow} toneMapped={false} transparent opacity={0.7} />
      </mesh>
      <Sparkles count={90} scale={[13, 13, 3]} size={4} speed={0.6} color={palette.atmos} />
    </group>
  );
};
```

- [ ] **Step 7: Create the registry and the basic universe**

```tsx
// universes/BasicUniverse.tsx — a nebula in the universe's palette (used until each universe is built)
import React from 'react';
import { Nebula } from '../fx/Nebula';
import { PALETTES } from '../fx/palettes';
import { UniverseId } from '../journey';
import { UniverseProps } from './index';

export const makeBasicUniverse = (id: UniverseId): React.FC<UniverseProps> => {
  const Basic: React.FC<UniverseProps> = () => <Nebula palette={PALETTES[id]} />;
  Basic.displayName = `BasicUniverse(${id})`;
  return Basic;
};
```

```ts
// universes/index.ts
import React from 'react';
import { UniverseId } from '../journey';
import { makeBasicUniverse } from './BasicUniverse';

export interface UniverseProps {
  /** Camera is in this universe: enable labels and pointer interaction. */
  active: boolean;
  /** Rendered inside a portal disc: no labels, no interaction. */
  preview?: boolean;
}

export const UNIVERSE_COMPONENTS: Record<UniverseId, React.FC<UniverseProps>> = {
  home: makeBasicUniverse('home'),
  about: makeBasicUniverse('about'),
  skills: makeBasicUniverse('skills'),
  certifications: makeBasicUniverse('certifications'),
  work: makeBasicUniverse('work'),
  projects: makeBasicUniverse('projects'),
  contact: makeBasicUniverse('contact'),
};
```

- [ ] **Step 8: Create `world/World.tsx`**

```tsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { UNIVERSES, UniverseId, WARMUP_MS, universeAtZ, universeIndex, universeOf, universeOrigin } from '../journey';
import { useJourney } from '../store';
import { UNIVERSE_COMPONENTS } from '../universes';
import { Portal } from '../fx/Portal';

interface SlotProps { id: UniverseId; index: number; active: boolean; warm: boolean }

const UniverseSlot: React.FC<SlotProps> = ({ id, index, active, warm }) => {
  const content = useRef<THREE.Group>(null!);
  const Universe = UNIVERSE_COMPONENTS[id];
  useFrame(({ camera }) => {
    content.current.visible = warm || universeAtZ(camera.position.z) === index;
  });
  return (
    <group position={universeOrigin(id)}>
      <group ref={content}>
        <Universe active={active} />
      </group>
      {index > 0 && (
        <Portal universe={id} warm={warm}>
          <Universe active={false} preview />
        </Portal>
      )}
    </group>
  );
};

export const World: React.FC = () => {
  const cameraU = useJourney((s) => s.cameraUniverse);
  const targetU = useJourney((s) => universeIndex(universeOf(s.step)));
  const [warm, setWarm] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setWarm(false), WARMUP_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {UNIVERSES.map((id, n) =>
        warm || Math.abs(n - cameraU) <= 1 || Math.abs(n - targetU) <= 1 ? (
          <UniverseSlot key={id} id={id} index={n} active={!warm && n === cameraU} warm={warm} />
        ) : null
      )}
    </>
  );
};
```

- [ ] **Step 9: Rewrite `src/multiverse/Multiverse.tsx` and create `multiverse.css`**

```tsx
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { CameraRig } from './camera/CameraRig';
import { Starfield } from './fx/Starfield';
import { Hyperspace } from './fx/Hyperspace';
import { PostFX } from './fx/PostFX';
import { World } from './world/World';
import { useJourney } from './store';
import { stepForHash } from './journey';
import { useJourneyInput } from './input';
import './multiverse.css';

interface MultiverseProps { onFail: () => void }

const Multiverse: React.FC<MultiverseProps> = ({ onFail }) => {
  // Start at the universe named in the URL (before the first frame renders).
  useState(() => {
    useJourney.getState().reset(stepForHash(window.location.hash) ?? 0);
    return true;
  });
  useJourneyInput();

  return (
    <div className="mv">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 55, near: 0.1, far: 1200 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.domElement.addEventListener('webglcontextlost', onFail)}
      >
        <color attach="background" args={['#000004']} />
        <CameraRig />
        <Starfield />
        <Hyperspace />
        <World />
        <PostFX bloom />
        <Preload all />
      </Canvas>
    </div>
  );
};

export default Multiverse;
```

```css
/* multiverse.css — base */
.mv {
  position: fixed;
  inset: 0;
  background: #000004;
  color: #f5f5f5;
  overflow: hidden;
  font-family: 'Ubuntu', -apple-system, 'Segoe UI', Roboto, sans-serif;
}
.mv canvas {
  touch-action: none;
}
```

- [ ] **Step 10: Delete the prototype.** Run `rm -r src/lab` and `grep -rn "lab/" src` (expected: no output).

- [ ] **Step 11: Visual check.** Save `$SCRATCH/shots/mv-check.js`. It walks every step and captures both the canvas pixels (the reliable source) and the overlay text:

```js
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const [url = 'http://localhost:3005/', out = __dirname + '/mv', steps = '10'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage();
  await p.setViewport({ width: 960, height: 600 });
  await p.evaluateOnNewDocument(() => {
    const o = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, a) { return o.call(this, t, Object.assign({}, a, { preserveDrawingBuffer: true })); };
  });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto(url, { waitUntil: 'networkidle0' });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await wait(9000);
  for (let i = 0; i < Number(steps); i++) {
    if (i > 0) { await p.keyboard.press('ArrowDown'); await wait(7000); }
    const data = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/jpeg', 0.85));
    fs.writeFileSync(`${out}/step-${i}.jpg`, Buffer.from(data.split(',')[1], 'base64'));
    const panel = await p.evaluate(() => (document.querySelector('.mv-panel.is-shown') || {}).innerText || '(no panel)');
    console.log(`step ${i} | hash ${await p.evaluate(() => location.hash)} | ${panel.replace(/\s+/g, ' ').slice(0, 140)}`);
  }
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await b.close();
})();
```

Run:

```bash
cd "/home/sudhirvishwakarma/Documents/Landing Pages/Second-Portfolio-Sudhir" && npm run build >/dev/null 2>&1
(npx -y serve@14.2.4 -s build -l 3005 >/dev/null 2>&1 &) ; sleep 3
node $SCRATCH/shots/mv-check.js http://localhost:3005/ $SCRATCH/shots/mv 10
```

Expected:
- 10 lines printed, then `no console errors`.
- There are no panels yet, so every line shows `(no panel)`.
- Open `step-0.jpg`, `step-1.jpg`, `step-3.jpg` and `step-8.jpg` with the Read tool. Each shows a nebula in that universe's palette (orange, blue, teal, purple) and is not black.

Stop the server.

- [ ] **Step 12: Checkpoint.** `CI=true npm run build` → `Compiled successfully.`; all tests pass. Do not commit.

---

### Task 9: Overlay chrome — top bar, progress, hint, loader, panels, hash sync

**Files:**
- Create:
  - `src/multiverse/overlay/TopBar.tsx`, `Progress.tsx`, `ScrollHint.tsx`, `Loader.tsx`, `PanelFrame.tsx`, `Panels.tsx`
  - `src/multiverse/overlay/panels/index.ts`, `src/multiverse/overlay/panels/GenericPanel.tsx`
  - `src/multiverse/useHashSync.ts`
- Modify: `src/multiverse/Multiverse.tsx`; append to `multiverse.css`

**Interfaces:**
- Consumes: `STEPS, UNIVERSES, UNIVERSE_LABELS, firstStepOf, universeOf, hashFor, stepForHash` (Task 5); `useJourney` (Task 6); `WARMUP_MS` (Task 5).
- Produces:
  - `PanelProps { universe: UniverseId; beat: string }`
  - `PANELS: Record<UniverseId, React.FC<PanelProps>>` (mutable registry; later tasks replace entries)
  - `PanelFrame({ show, children })`
  - `<TopBar/> <Progress/> <ScrollHint/> <Loader/> <Panels/>`
  - `useHashSync()`

- [ ] **Step 1: Create the overlay components**

```tsx
// overlay/TopBar.tsx
import React from 'react';
import { UNIVERSES, UNIVERSE_LABELS, firstStepOf, universeOf } from '../journey';
import { useJourney } from '../store';

export const TopBar: React.FC = () => {
  const step = useJourney((s) => s.step);
  const jump = useJourney((s) => s.jump);
  const current = universeOf(step);
  return (
    <header className="mv-topbar">
      <button className="mv-mono" onClick={() => jump(0)} aria-label="Home">SV</button>
      <nav className="mv-nav" aria-label="Universes">
        {UNIVERSES.map((u) => (
          <button
            key={u}
            className={u === current ? 'is-current' : ''}
            aria-current={u === current ? 'true' : undefined}
            onClick={() => jump(firstStepOf(u))}
          >
            {UNIVERSE_LABELS[u]}
          </button>
        ))}
      </nav>
      <a className="mv-classic" href="#classic">Classic view</a>
    </header>
  );
};
```

```tsx
// overlay/Progress.tsx
import React from 'react';
import { STEPS, UNIVERSE_LABELS } from '../journey';
import { useJourney } from '../store';

export const Progress: React.FC = () => {
  const step = useJourney((s) => s.step);
  const jump = useJourney((s) => s.jump);
  return (
    <nav className="mv-progress" aria-label="Journey progress">
      {STEPS.map((s, i) => (
        <button
          key={i}
          className={`mv-progress__dot${i === step ? ' is-current' : ''}${i > 0 && STEPS[i - 1].universe !== s.universe ? ' is-new-universe' : ''}`}
          aria-label={`${UNIVERSE_LABELS[s.universe]}: ${s.beat}`}
          aria-current={i === step ? 'step' : undefined}
          onClick={() => jump(i)}
        />
      ))}
    </nav>
  );
};
```

```tsx
// overlay/ScrollHint.tsx
import React from 'react';
import { STEPS } from '../journey';
import { useJourney } from '../store';

export const ScrollHint: React.FC = () => {
  const step = useJourney((s) => s.step);
  const moving = useJourney((s) => s.moving);
  if (moving) return null;
  return (
    <div className="mv-hint" key={step}>
      <span className="mv-hint__mouse" aria-hidden="true" />
      {STEPS[step].hint}
    </div>
  );
};
```

```tsx
// overlay/Loader.tsx — black curtain with progress; lifts once assets load and shaders are warm
import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { useJourney } from '../store';
import { WARMUP_MS } from '../journey';

const TIMEOUT_MS = 10000;

export const Loader: React.FC = () => {
  const { active, progress, total } = useProgress();
  const setBooted = useJourney((s) => s.setBooted);
  const [elapsed, setElapsed] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => setElapsed(performance.now() - start), 100);
    return () => clearInterval(id);
  }, []);

  const assetsDone = !active && (total === 0 || progress >= 100);
  const ready = (assetsDone && elapsed >= WARMUP_MS) || elapsed >= TIMEOUT_MS;
  const pct = ready ? 100 : Math.min(99, Math.round(assetsDone ? (elapsed / WARMUP_MS) * 100 : progress));

  useEffect(() => {
    if (!ready) return;
    setBooted();
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [ready, setBooted]);

  if (gone) return null;
  return (
    <div className={`mv-loader${ready ? ' is-done' : ''}`} role="status" aria-live="polite">
      <span className="mv-loader__text">Igniting the sun… {pct}%</span>
      <div className="mv-loader__bar"><span style={{ transform: `scaleX(${pct / 100})` }} /></div>
    </div>
  );
};
```

```tsx
// overlay/PanelFrame.tsx
import React from 'react';

export const PanelFrame: React.FC<{ show: boolean; children: React.ReactNode }> = ({ show, children }) => (
  <section className={`mv-panel${show ? ' is-shown' : ''}`} aria-hidden={!show} data-capture-scroll>
    {children}
  </section>
);
```

```tsx
// overlay/panels/GenericPanel.tsx — used until each universe gets its real panel
import React from 'react';
import { UNIVERSE_LABELS } from '../../journey';
import { PanelProps } from './index';

export const GenericPanel: React.FC<PanelProps> = ({ universe }) => (
  <h2 className="mv-h2">{UNIVERSE_LABELS[universe]}</h2>
);
```

```ts
// overlay/panels/index.ts
import React from 'react';
import { UniverseId } from '../../journey';
import { GenericPanel } from './GenericPanel';

export interface PanelProps { universe: UniverseId; beat: string }

export const PANELS: Record<UniverseId, React.FC<PanelProps>> = {
  home: GenericPanel,
  about: GenericPanel,
  skills: GenericPanel,
  certifications: GenericPanel,
  work: GenericPanel,
  projects: GenericPanel,
  contact: GenericPanel,
};
```

```tsx
// overlay/Panels.tsx — shows the panel for the step the camera has arrived at
import React, { useEffect, useState } from 'react';
import { STEPS } from '../journey';
import { useJourney } from '../store';
import { PANELS } from './panels';
import { PanelFrame } from './PanelFrame';

export const Panels: React.FC = () => {
  const step = useJourney((s) => s.step);
  const moving = useJourney((s) => s.moving);
  const booted = useJourney((s) => s.booted);
  const [shown, setShown] = useState(step);

  useEffect(() => {
    if (!moving) setShown(step);
  }, [moving, step]);

  const { universe, beat } = STEPS[shown];
  const Panel = PANELS[universe];
  return (
    <PanelFrame key={shown} show={booted && !moving && shown === step}>
      <Panel universe={universe} beat={beat} />
    </PanelFrame>
  );
};
```

```ts
// useHashSync.ts — URL hash follows the universe; Back/Forward and hash links travel
import { useEffect } from 'react';
import { hashFor, stepForHash, universeOf } from './journey';
import { useJourney } from './store';

export function useHashSync(): void {
  useEffect(() => {
    const unsubscribe = useJourney.subscribe((s, prev) => {
      if (prev.moving && !s.moving) {
        const h = hashFor(s.step);
        if (window.location.hash !== h) window.history.pushState(null, '', h);
      }
    });
    const onNav = () => {
      const target = stepForHash(window.location.hash);
      const s = useJourney.getState();
      if (target !== null && universeOf(target) !== universeOf(s.step)) s.jump(target);
    };
    window.addEventListener('popstate', onNav);
    window.addEventListener('hashchange', onNav);
    return () => {
      unsubscribe();
      window.removeEventListener('popstate', onNav);
      window.removeEventListener('hashchange', onNav);
    };
  }, []);
}
```

- [ ] **Step 2: Wire the overlay into `Multiverse.tsx`.** Add the imports:

```tsx
import { TopBar } from './overlay/TopBar';
import { Progress } from './overlay/Progress';
import { ScrollHint } from './overlay/ScrollHint';
import { Loader } from './overlay/Loader';
import { Panels } from './overlay/Panels';
import { useHashSync } from './useHashSync';
```

Add `useHashSync();` directly after `useJourneyInput();`, and in the JSX, directly after `</Canvas>` add:

```tsx
      <UiLayer />
      <Loader />
```

Then define this above `Multiverse` in the same file:

```tsx
const UiLayer: React.FC = () => {
  const booted = useJourney((s) => s.booted);
  return (
    <div className={`mv-ui${booted ? ' is-booted' : ''}`}>
      <TopBar />
      <Panels />
      <Progress />
      <ScrollHint />
    </div>
  );
};
```

- [ ] **Step 3: Append the overlay styles to `multiverse.css`**

```css
/* ---------- overlay layer ---------- */
.mv-ui {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.8s ease 0.2s;
}
.mv-ui.is-booted { opacity: 1; }
.mv-ui a, .mv-ui button, .mv-ui input, .mv-ui select, .mv-ui textarea, .mv-panel.is-shown { pointer-events: auto; }
.mv :focus-visible { outline: 2px solid #ff9a3c; outline-offset: 3px; }

/* top bar */
.mv-topbar {
  position: absolute; top: 0; left: 0; right: 0;
  display: flex; align-items: center; gap: 24px;
  padding: 18px clamp(16px, 4vw, 48px);
  background: linear-gradient(180deg, rgba(0,0,4,0.75), rgba(0,0,4,0));
}
.mv-mono {
  width: 40px; height: 40px; border-radius: 50%;
  border: 1px solid rgba(255,154,60,0.6); background: rgba(255,122,0,0.08);
  color: #ffb15c; font-weight: 700; letter-spacing: 0.05em; cursor: pointer;
}
.mv-nav { display: flex; gap: 4px; flex-wrap: wrap; }
.mv-nav button {
  background: none; border: 0; cursor: pointer;
  color: rgba(255,255,255,0.6); font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase;
  padding: 8px 10px; border-radius: 999px; transition: color 0.25s, background 0.25s;
}
.mv-nav button:hover { color: #fff; }
.mv-nav button.is-current { color: #fff; background: rgba(255,122,0,0.18); box-shadow: inset 0 0 0 1px rgba(255,122,0,0.5); }
.mv-classic { margin-left: auto; color: rgba(255,255,255,0.6); font-size: 0.75rem; letter-spacing: 0.1em; text-decoration: none; }
.mv-classic:hover { color: #ff9a3c; }

/* progress */
.mv-progress {
  position: absolute; right: clamp(16px, 2.5vw, 32px); top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 10px;
}
.mv-progress__dot {
  width: 9px; height: 9px; border-radius: 50%; cursor: pointer; padding: 0;
  border: 1px solid rgba(255,255,255,0.45); background: transparent; transition: all 0.3s ease;
}
.mv-progress__dot.is-new-universe { margin-top: 10px; }
.mv-progress__dot.is-current { background: #ff7a00; border-color: #ff7a00; box-shadow: 0 0 12px #ff7a00; transform: scale(1.35); }

/* scroll hint */
.mv-hint {
  position: absolute; bottom: clamp(18px, 4vh, 40px); left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 12px; white-space: nowrap;
  font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.7);
  animation: mv-fade-up 0.6s ease both 0.3s;
}
.mv-hint__mouse { width: 18px; height: 28px; border: 1.5px solid rgba(255,255,255,0.7); border-radius: 10px; position: relative; }
.mv-hint__mouse::after {
  content: ''; position: absolute; left: 50%; top: 5px; width: 3px; height: 6px; margin-left: -1.5px;
  border-radius: 2px; background: #ff9a3c; animation: mv-scroll 1.6s ease-in-out infinite;
}

/* loader */
.mv-loader {
  position: absolute; inset: 0; background: #000; z-index: 50;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  transition: opacity 0.9s ease;
}
.mv-loader.is-done { opacity: 0; pointer-events: none; }
.mv-loader__text { font-size: 0.78rem; letter-spacing: 0.3em; text-transform: uppercase; color: #ff9a3c; }
.mv-loader__bar { width: min(260px, 60vw); height: 2px; background: rgba(255,255,255,0.12); overflow: hidden; }
.mv-loader__bar span { display: block; height: 100%; background: #ff7a00; transform-origin: left; transition: transform 0.2s linear; }

/* content panel */
.mv-panel {
  position: absolute; left: clamp(16px, 5vw, 72px); top: 96px; bottom: 96px;
  width: min(520px, 42vw); overflow-y: auto; padding-right: 8px;
  display: flex; flex-direction: column; justify-content: center;
  opacity: 0; transform: translateY(12px); filter: blur(6px);
  transition: opacity 0.25s ease, transform 0.25s ease, filter 0.25s ease;
  scrollbar-width: thin; scrollbar-color: rgba(255,122,0,0.5) transparent;
}
.mv-panel.is-shown { opacity: 1; transform: none; filter: none; animation: mv-panel-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.mv-panel > * { flex-shrink: 0; }

/* shared typography */
.mv-kicker { font-size: 0.72rem; letter-spacing: 0.32em; text-transform: uppercase; color: #ff9a3c; }
.mv-h1 {
  font-size: clamp(2.2rem, 5.4vw, 4.4rem); line-height: 0.95; letter-spacing: -0.02em; margin: 10px 0 14px;
  background: linear-gradient(120deg, #fff 30%, #ffb15c 60%, #ff6a00); -webkit-background-clip: text; background-clip: text; color: transparent;
}
.mv-h2 { font-size: clamp(1.6rem, 3vw, 2.4rem); margin: 8px 0 16px; letter-spacing: -0.01em; }
.mv-text { color: rgba(255,255,255,0.78); line-height: 1.7; font-size: 0.95rem; }
.mv-btn {
  display: inline-flex; align-items: center; gap: 8px; padding: 11px 20px; border-radius: 999px;
  background: #ff7a00; color: #fff; border: 1px solid #ff7a00; font-size: 0.85rem; font-weight: 600;
  letter-spacing: 0.06em; text-decoration: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
}
.mv-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,122,0,0.4); }
.mv-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.mv-btn--ghost { background: transparent; color: #ffb15c; }
.mv-tag {
  display: inline-block; padding: 6px 12px; margin: 0 6px 8px 0; border-radius: 999px; font-size: 0.78rem;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.88);
}

/* 3D labels (drei <Html>) */
.mv-label { pointer-events: none; white-space: nowrap; text-align: center; font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; text-shadow: 0 0 10px rgba(0,0,0,0.9); }
.mv-label small { display: block; letter-spacing: 0.05em; text-transform: none; color: rgba(255,255,255,0.65); font-size: 0.68rem; }

@keyframes mv-panel-in { from { opacity: 0; transform: translateY(18px); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes mv-fade-up { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes mv-scroll { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(10px); opacity: 0; } }
@keyframes mv-stagger { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: none; } }
```

- [ ] **Step 4: Visual check.** Build, serve on 3005, and run `node $SCRATCH/shots/mv-check.js http://localhost:3005/ $SCRATCH/shots/mv 10`. Expected:
  - Panel text for each step is the universe label: `Home`, `About`, `About`, `Skills`, `Certifications`, `Work`, `Work`, `Work`, `Projects`, `Contact`.
  - Hashes: steps 1–2 show `#about`, step 8 shows `#projects`, and so on.
  - `no console errors`.

  Then check deep links. With the server still running:

```bash
node -e "
const puppeteer=require('$SCRATCH/shots/node_modules/puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage();await p.setViewport({width:1280,height:800});
await p.goto('http://localhost:3005/#work',{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,9000));
console.log('deep link →', await p.evaluate(()=>document.querySelector('.mv-nav .is-current')?.textContent));
await p.evaluate(()=>{location.hash='#classic'});await new Promise(r=>setTimeout(r,1500));
console.log('classic link →', await p.evaluate(()=>document.querySelector('.sidebar')?'classic':'multiverse'));
await p.goBack();await new Promise(r=>setTimeout(r,9000));
console.log('back →', await p.evaluate(()=>document.querySelector('.mv-nav .is-current')?.textContent));
await b.close();})();"
```

  Expected: `deep link → Work`, `classic link → classic`, `back → Work`. Stop the server.

- [ ] **Step 5: Create the interaction checker.** Later tasks run it by scenario name. Save it as `$SCRATCH/shots/mv-interact.js`:

```js
const puppeteer = require('puppeteer-core');
const [scenario, base = 'http://localhost:3005/'] = process.argv.slice(2);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 800 });
  const has = (sel) => p.evaluate((s) => !!document.querySelector(s), sel);
  const text = (sel) => p.evaluate((s) => (document.querySelector(s)?.textContent || '').trim() || null, sel);
  const open = async (hash) => { await p.goto(base + hash, { waitUntil: 'networkidle0' }); await wait(9000); };
  try {
    switch (scenario) {
      case 'cv':
        await open('#home');
        await p.click('.mv-actions .mv-btn');
        await wait(500);
        console.log('cv modal open:', await has('.mv-modal iframe[title="Resume"]'));
        await p.keyboard.press('Escape');
        await wait(300);
        console.log('closed by Esc:', !(await has('.mv-modal')));
        break;
      case 'certificate':
        await open('#certifications');
        await p.click('.mv-card .mv-btn');
        await wait(800);
        console.log('certificate image:', await has('.mv-modal img.mv-doc__img'));
        break;
      case 'project':
        await open('#projects');
        await p.evaluate(() => [...document.querySelectorAll('.mv-projects .mv-btn')].find((x) => x.textContent.includes('View as list')).click());
        await wait(300);
        await p.click('.mv-list button');
        await wait(500);
        console.log('detail:', await text('.mv-modal--sheet h2'));
        console.log('live demo new tab:', await p.evaluate(() =>
          [...document.querySelectorAll('.mv-modal--sheet a')].some((a) => a.textContent === 'Live Demo' && a.target === '_blank')));
        await p.keyboard.press('Escape');
        await wait(300);
        console.log('closed:', !(await has('.mv-modal')));
        break;
      case 'contact': {
        await p.setRequestInterception(true);
        p.on('request', (r) => (r.method() === 'POST' && r.url().endsWith('/api/contact')
          ? r.respond({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
          : r.continue()));
        await open('#contact');
        const before = await p.evaluate(() => location.hash);
        await p.type('.mv-form input[name=name]', 'Test User');
        await p.type('.mv-form input[name=email]', 'test@example.com');
        await p.select('.mv-form select[name=subject]', 'job');
        await p.type('.mv-form textarea[name=message]', 'Hello there from the test');
        await p.keyboard.press('ArrowDown');
        await wait(1500);
        console.log('hash unchanged while typing:', (await p.evaluate(() => location.hash)) === before);
        await p.click('.mv-form .mv-btn');
        await wait(500);
        console.log('toast:', await has('.mv-toast'));
        break;
      }
      case 'keyboard': {
        await open('');
        const stops = [];
        for (let i = 0; i < 12; i++) {
          await p.keyboard.press('Tab');
          stops.push(await p.evaluate(() => {
            const el = document.activeElement;
            return (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 24);
          }));
        }
        console.log('tab order:', stops.join(' | '));
        await p.evaluate(() => document.activeElement && document.activeElement.blur());
        await p.keyboard.press('End');
        await wait(9000);
        console.log('End →', await text('.mv-nav .is-current'));
        await p.keyboard.press('Home');
        await wait(9000);
        console.log('Home →', await text('.mv-nav .is-current'));
        break;
      }
      case 'reduced-motion':
        await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
        await p.goto(base, { waitUntil: 'networkidle0' });
        await wait(1500);
        console.log('reduced motion →', (await has('.sidebar')) ? 'classic' : 'multiverse');
        break;
      default:
        console.log(`unknown scenario "${scenario}"`);
        process.exitCode = 1;
    }
  } finally {
    await b.close();
  }
})();
```

Usage (with the server on 3005): `node $SCRATCH/shots/mv-interact.js <cv|certificate|project|contact|keyboard|reduced-motion>`.

- [ ] **Step 6: Checkpoint.** `CI=true npm run build` → `Compiled successfully.`; all tests pass. Do not commit.

---

## Phase 3: The universes

Each task replaces one entry in `UNIVERSE_COMPONENTS` and one in `PANELS`. To register them, edit the two registry files:
- In `universes/index.ts`, import the new component and set its key, e.g. `home: HomeUniverse,`.
- In `overlay/panels/index.ts`, do the same, e.g. `home: HomePanel,`.

### Task 10: Home — solar system, hero panel, CV modal

**Files:**
- Create: `src/multiverse/universes/HomeUniverse.tsx`, `src/multiverse/overlay/panels/HomePanel.tsx`, `src/multiverse/overlay/ModalHost.tsx`, `src/multiverse/overlay/modals/CvModal.tsx`
- Modify: `universes/index.ts` (`home`), `overlay/panels/index.ts` (`home`), `Multiverse.tsx` (add `<ModalHost/>` in `UiLayer`), `multiverse.css`

**Interfaces:**
- Consumes:
  - fx: `Planet`, `GlowSprite`, `sunShader`, `PALETTES`
  - journey: `firstStepOf`, `UNIVERSE_LABELS`
  - store: `useJourney`
  - data and hooks: `profile`, `useTypewriter`, `SocialIcons`
- Produces: `HomeUniverse`, `HomePanel`, `ModalHost` (handles `cv`; Tasks 13 and 15 add cases), `CvModal`

- [ ] **Step 1: Create `universes/HomeUniverse.tsx`**

```tsx
import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { easing } from 'maath';
import { sunShader } from '../fx/shaders';
import { GlowSprite } from '../fx/GlowSprite';
import { Planet } from '../fx/Planet';
import { PALETTES } from '../fx/palettes';
import { UniverseId, UNIVERSE_LABELS, WARMUP_MS, firstStepOf } from '../journey';
import { useJourney } from '../store';
import { UniverseProps } from './index';

interface OrbitDef { universe: UniverseId; orbit: number; size: number; speed: number; bands: number; ring?: boolean; tagline: string }

const ORBITS: OrbitDef[] = [
  { universe: 'about', orbit: 7, size: 0.7, speed: 0.22, bands: 6, tagline: 'Who I am' },
  { universe: 'skills', orbit: 9.5, size: 0.8, speed: 0.17, bands: 9, tagline: 'What I build with' },
  { universe: 'certifications', orbit: 12, size: 0.75, speed: 0.13, bands: 7, tagline: "What I've earned" },
  { universe: 'work', orbit: 14.5, size: 0.95, speed: 0.1, bands: 10, tagline: "Where I've built" },
  { universe: 'projects', orbit: 17.5, size: 1.25, speed: 0.08, bands: 14, ring: true, tagline: "Everything I've made" },
  { universe: 'contact', orbit: 20.5, size: 0.8, speed: 0.06, bands: 8, tagline: 'Open a channel' },
];

const Sun: React.FC = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    // ignite once the loader lifts
    easing.damp3(mesh.current.scale, state.clock.elapsedTime * 1000 > WARMUP_MS ? 1 : 0.001, 1.0, dt);
    mesh.current.rotation.y += dt * 0.03;
  });
  return (
    <group>
      <mesh ref={mesh} scale={0.001}>
        <sphereGeometry args={[3, 96, 96]} />
        <shaderMaterial args={[sunShader]} uniforms={uniforms} toneMapped={false} />
      </mesh>
      <GlowSprite color={[1.3, 0.45, 0.08]} scale={15} />
    </group>
  );
};

const OrbitingPlanet: React.FC<{ def: OrbitDef; index: number; active: boolean; preview?: boolean }> = ({ def, index, active, preview }) => {
  const pivot = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const interactive = active && !preview;

  useFrame((state) => {
    pivot.current.rotation.y = index * 1.7 + state.clock.elapsedTime * def.speed;
  });

  return (
    <>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[def.orbit - 0.015, def.orbit + 0.015, 192]} />
        <meshBasicMaterial color={PALETTES[def.universe].atmos} transparent opacity={hovered ? 0.55 : 0.14} side={THREE.DoubleSide} />
      </mesh>
      <group ref={pivot}>
        <group position={[def.orbit, 0, 0]}>
          <Planet
            radius={def.size}
            palette={PALETTES[def.universe]}
            bands={def.bands}
            ring={def.ring}
            lightPos={[0, 0, 0]}
            highlight={hovered ? 1 : 0}
            onPointerOver={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHovered(false);
              document.body.style.cursor = '';
            }}
            onClick={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              document.body.style.cursor = '';
              useJourney.getState().jump(firstStepOf(def.universe));
            }}
          />
          {interactive && (
            <Html center position={[0, def.size + 0.9, 0]} className="mv-label" style={{ transform: hovered ? 'scale(1.15)' : undefined }}>
              {UNIVERSE_LABELS[def.universe]}
              {hovered && <small>{def.tagline}</small>}
            </Html>
          )}
        </group>
      </group>
    </>
  );
};

export const HomeUniverse: React.FC<UniverseProps> = ({ active, preview }) => (
  <group rotation-x={0.08}>
    <Sun />
    {ORBITS.map((def, i) => (
      <OrbitingPlanet key={def.universe} def={def} index={i} active={active} preview={preview} />
    ))}
  </group>
);
```

- [ ] **Step 2: Create `overlay/panels/HomePanel.tsx`**

```tsx
import React from 'react';
import { profile } from '../../../data/portfolio';
import { useTypewriter } from '../../../hooks/typewriter';
import SocialIcons from '../../../components/SocialIcons';
import { useJourney } from '../../store';
import { PanelProps } from './index';

export const HomePanel: React.FC<PanelProps> = () => {
  const text = useTypewriter(profile.typingWords);
  const openModal = useJourney((s) => s.openModal);
  return (
    <div className="mv-home">
      <span className="mv-kicker">{profile.greeting}</span>
      <h1 className="mv-h1">{profile.firstName}<br />{profile.lastName}</h1>
      <p className="mv-typing">
        {profile.titlePrefix} <span className="mv-typing__word">{text}</span>
        <span className="mv-typing__cursor" aria-hidden="true">|</span>
      </p>
      <p className="mv-text">{profile.bio}</p>
      <div className="mv-actions">
        <button className="mv-btn" onClick={() => openModal({ kind: 'cv' })}>View CV</button>
        <a className="mv-btn mv-btn--ghost" href={profile.cvUrl} download={profile.cvDownloadName}>Download CV</a>
      </div>
      <SocialIcons className="mv-socials" linkClassName="mv-social" size={18} />
    </div>
  );
};
```

- [ ] **Step 3: Create `overlay/modals/CvModal.tsx` and `overlay/ModalHost.tsx`**

```tsx
// overlay/modals/CvModal.tsx
import React from 'react';
import { profile } from '../../../data/portfolio';

export const CvModal: React.FC = () => (
  <div className="mv-doc">
    <div className="mv-doc__head">
      <h3>My Resume</h3>
      <a className="mv-btn" href={profile.cvUrl} download={profile.cvDownloadName}>Download PDF</a>
    </div>
    <iframe className="mv-doc__frame" src={`${profile.cvUrl}#toolbar=1&navpanes=0&scrollbar=1`} title="Resume" />
  </div>
);
```

```tsx
// overlay/ModalHost.tsx
import React, { useEffect, useRef } from 'react';
import { useJourney } from '../store';
import { CvModal } from './modals/CvModal';

export const ModalHost: React.FC = () => {
  const modal = useJourney((s) => s.modal);
  const close = useJourney((s) => s.closeModal);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modal) closeBtn.current?.focus();
  }, [modal]);

  if (!modal) return null;

  let body: React.ReactNode = null;
  let sheet = false;
  switch (modal.kind) {
    case 'cv':
      body = <CvModal />;
      break;
    default:
      return null;
  }

  return (
    <div className={`mv-modal${sheet ? ' mv-modal--sheet' : ''}`} role="dialog" aria-modal="true" onClick={close}>
      <div className="mv-modal__box" onClick={(e) => e.stopPropagation()} data-capture-scroll>
        <button ref={closeBtn} className="mv-modal__close" aria-label="Close" onClick={close}>×</button>
        {body}
      </div>
    </div>
  );
};
```

(`sheet` is set to `true` by the `project` case added in Task 15.)

- [ ] **Step 4: Register and mount.**
  - `universes/index.ts`: add `import { HomeUniverse } from './HomeUniverse';` and set `home: HomeUniverse,`.
  - `overlay/panels/index.ts`: add `import { HomePanel } from './HomePanel';` and set `home: HomePanel,`.
  - `Multiverse.tsx`: add `import { ModalHost } from './overlay/ModalHost';` and render `<ModalHost />` as the last child of the `mv-ui` div.

- [ ] **Step 5: Append the styles to `multiverse.css`**

```css
/* home */
.mv-typing { font-size: clamp(0.95rem, 1.6vw, 1.15rem); letter-spacing: 0.12em; margin-bottom: 14px; color: rgba(255,255,255,0.85); }
.mv-typing__word { color: #ff9a3c; text-shadow: 0 0 18px rgba(255,122,0,0.6); font-weight: 700; }
.mv-typing__cursor { color: #ff9a3c; animation: mv-blink 1s steps(1) infinite; margin-left: 2px; }
.mv-actions { display: flex; gap: 12px; flex-wrap: wrap; margin: 22px 0 18px; }
.mv-socials { display: flex; gap: 10px; }
.mv-social {
  width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
  color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.04);
  transition: all 0.25s ease;
}
.mv-social:hover { color: #fff; border-color: #ff7a00; background: rgba(255,122,0,0.18); transform: translateY(-3px); }
@keyframes mv-blink { 50% { opacity: 0; } }

/* modals */
.mv-modal {
  position: absolute; inset: 0; z-index: 40; pointer-events: auto;
  background: rgba(0,0,4,0.65); backdrop-filter: blur(6px);
  display: grid; place-items: center; animation: mv-fade 0.3s ease both;
}
.mv-modal__box {
  position: relative; width: min(960px, 92vw); max-height: 88vh; overflow-y: auto;
  background: rgba(14,12,22,0.92); border: 1px solid rgba(255,255,255,0.12); border-radius: 18px;
  padding: 28px; box-shadow: 0 30px 80px rgba(0,0,0,0.6); animation: mv-pop 0.35s cubic-bezier(0.2,0.8,0.2,1) both;
}
.mv-modal__close {
  position: absolute; top: 12px; right: 14px; width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: #fff; font-size: 1.3rem; cursor: pointer;
}
.mv-modal__close:hover { border-color: #ff7a00; color: #ff9a3c; }
.mv-doc__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 0 48px 16px 0; }
.mv-doc__frame { width: 100%; height: 70vh; border: 0; border-radius: 10px; background: #fff; }
.mv-doc__img { display: block; max-width: 100%; max-height: 72vh; margin: 0 auto; border-radius: 10px; }
@keyframes mv-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mv-pop { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: none; } }
```

- [ ] **Step 6: Visual check.** Run `mv-check.js` with `steps` = `1`.
  - Expected panel text includes `HELLO I'M SUDHIR VISHWAKARMA A PASSIONATE` and `A highly driven Front-End Engineer`.
  - `step-0.jpg` shows the sun with orbiting planets on the right side.
  - Then run `node $SCRATCH/shots/mv-interact.js cv`.
  - Expected: `cv modal open: true`, `closed by Esc: true`.

- [ ] **Step 7: Checkpoint.** `CI=true npm run build` → `Compiled successfully.`; all tests pass. Do not commit.

---

### Task 11: About — Origin Nebula with education moons

**Files:**
- Create: `src/multiverse/universes/AboutUniverse.tsx`, `src/multiverse/overlay/panels/AboutPanel.tsx`
- Modify: both registries (`about`); `multiverse.css`

**Interfaces:**
- Consumes:
  - `Nebula`, `Planet`, `PALETTES`
  - `STEPS`, `universeOrigin`
  - `useJourney` (`step`, `moving`, `arrivedAt`)
  - `aboutSummary`, `education`
- Produces: `AboutUniverse`, `AboutPanel`. Moon timing constants `MOON_DELAY_MS = 200` and `MOON_STAGGER_MS = 250` must match the CSS stagger.

- [ ] **Step 1: Create `universes/AboutUniverse.tsx`**

```tsx
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Nebula } from '../fx/Nebula';
import { Planet } from '../fx/Planet';
import { GlowSprite } from '../fx/GlowSprite';
import { PALETTES } from '../fx/palettes';
import { STEPS, universeOrigin, Vec3 } from '../journey';
import { useJourney } from '../store';
import { UniverseProps } from './index';

export const MOON_DELAY_MS = 200;
export const MOON_STAGGER_MS = 250;
const ORBIT_RADIUS = 11;
const MOON_ANGLES = [0.5, 2.1, 3.7, 5.2];
const palette = PALETTES.about;
const origin = universeOrigin('about');
const light: Vec3 = [origin[0] + 25, origin[1] + 15, origin[2] + 25];

const Moon: React.FC<{ index: number }> = ({ index }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const dim = useMemo(() => new THREE.Color('#1e293b'), []);
  const bright = useMemo(() => new THREE.Color(palette.atmos).multiplyScalar(3), []);
  const a = MOON_ANGLES[index];

  useFrame((_, dt) => {
    const s = useJourney.getState();
    const step = STEPS[s.step];
    const lit = step.universe === 'about' && step.beat === 'education' && !s.moving &&
      performance.now() - s.arrivedAt > MOON_DELAY_MS + index * MOON_STAGGER_MS;
    mat.current.color.lerp(lit ? bright : dim, Math.min(1, dt * 6));
    const target = lit ? 1.4 : 1;
    mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, target, Math.min(1, dt * 6)));
  });

  return (
    <mesh ref={mesh} position={[Math.cos(a) * ORBIT_RADIUS, 0, Math.sin(a) * ORBIT_RADIUS]}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshBasicMaterial ref={mat} color={dim} toneMapped={false} />
    </mesh>
  );
};

export const AboutUniverse: React.FC<UniverseProps> = () => (
  <>
    <Nebula palette={palette} radius={70} />
    <GlowSprite color={palette.b} scale={26} opacity={0.35} />
    <Planet radius={4} palette={palette} bands={6} lightPos={light} />
    <group rotation={[0.35, 0, 0.12]}>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ORBIT_RADIUS - 0.03, ORBIT_RADIUS + 0.03, 192]} />
        <meshBasicMaterial color={palette.atmos} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      {MOON_ANGLES.map((_, i) => (
        <Moon key={i} index={i} />
      ))}
    </group>
  </>
);
```

- [ ] **Step 2: Create `overlay/panels/AboutPanel.tsx`**

```tsx
import React from 'react';
import { aboutSummary, education } from '../../../data/portfolio';
import { PanelProps } from './index';

export const AboutPanel: React.FC<PanelProps> = ({ beat }) =>
  beat === 'education' ? (
    <div>
      <span className="mv-kicker">About · 2 / 2</span>
      <h2 className="mv-h2">Education</h2>
      <ol className="mv-timeline">
        {education.map((e, i) => (
          <li key={e.years} style={{ '--i': i } as React.CSSProperties}>
            <span className="mv-timeline__years">{e.years}</span>
            <strong>{e.title}</strong>
            <span className="mv-timeline__place">{e.school}</span>
          </li>
        ))}
      </ol>
    </div>
  ) : (
    <div>
      <span className="mv-kicker">About · 1 / 2</span>
      <h2 className="mv-h2">About Me</h2>
      <p className="mv-text">{aboutSummary}</p>
    </div>
  );
```

- [ ] **Step 3: Register** `about: AboutUniverse` and `about: AboutPanel` (with their imports) in the two registries.

- [ ] **Step 4: Append the styles.** The stagger matches `MOON_DELAY_MS` and `MOON_STAGGER_MS`.

```css
/* about — education timeline */
.mv-timeline { list-style: none; margin: 0; padding: 0 0 0 20px; border-left: 1px solid rgba(96,165,250,0.4); }
.mv-timeline li {
  position: relative; display: flex; flex-direction: column; gap: 2px; padding: 0 0 18px 8px;
  opacity: 0; animation: mv-stagger 0.6s ease both; animation-delay: calc(200ms + var(--i) * 250ms);
}
.mv-timeline li::before {
  content: ''; position: absolute; left: -26px; top: 6px; width: 11px; height: 11px; border-radius: 50%;
  background: #60a5fa; box-shadow: 0 0 12px #60a5fa;
}
.mv-timeline__years { font-size: 0.72rem; letter-spacing: 0.2em; color: #93c5fd; }
.mv-timeline__place { color: rgba(255,255,255,0.65); font-size: 0.88rem; }
```

- [ ] **Step 5: Visual check.** Run `mv-check.js` with `steps` = `3`. Expected:
  - step 1 panel starts `About · 1 / 2 About Me Results-driven developer`
  - step 2 panel shows `Education 2022 - 2023 Web-Development Front-End`
  - `step-2.jpg` shows the blue planet with 4 bright moons on the orbit ring

- [ ] **Step 6: Checkpoint.** Build is clean, tests pass. Do not commit.

---

### Task 12: Skills — Tech Asteroid Belt

**Files:**
- Create: `src/multiverse/universes/layout.ts`, `src/multiverse/universes/SkillsUniverse.tsx`, `src/multiverse/overlay/panels/SkillsPanel.tsx`
- Modify: both registries (`skills`); `multiverse.css`
- Test: `src/multiverse/universes/layout.test.ts`

**Interfaces:**
- Consumes: `skills, SKILL_GROUPS, SkillGroup`; fx components.
- Produces: `ringLayout(n: number, radius: number): Vec3[]`, `SKILL_COLORS: Record<SkillGroup, string>` (exported from `SkillsUniverse.tsx`), `SkillsUniverse`, `SkillsPanel`.

- [ ] **Step 1: Write the failing test** `src/multiverse/universes/layout.test.ts`:

```ts
import { ringLayout } from './layout';

test('ringLayout puts n points on a ring of the given radius', () => {
  const pts = ringLayout(20, 12);
  expect(pts).toHaveLength(20);
  pts.forEach(([x, , z]) => expect(Math.hypot(x, z)).toBeCloseTo(12, 6));
  const angles = new Set(pts.map(([x, , z]) => Math.atan2(z, x).toFixed(4)));
  expect(angles.size).toBe(20);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/multiverse/universes`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `universes/layout.ts`.** It must not import `three`; Task 15 adds `layoutGalaxy` to this file.

```ts
import { Vec3 } from '../journey';

/** n points evenly around a ring in the XZ plane, with a gentle vertical wave. */
export function ringLayout(n: number, radius: number): Vec3[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * radius, Math.sin(a * 3) * 1.2, Math.sin(a) * radius] as Vec3;
  });
}
```

- [ ] **Step 4: Run it to verify it passes.** Same command → PASS.

- [ ] **Step 5: Create `universes/SkillsUniverse.tsx`**

```tsx
import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { easing } from 'maath';
import { Nebula } from '../fx/Nebula';
import { GlowSprite } from '../fx/GlowSprite';
import { PALETTES } from '../fx/palettes';
import { skills, SkillGroup } from '../../data/portfolio';
import { ringLayout } from './layout';
import { Vec3 } from '../journey';
import { UniverseProps } from './index';

export const SKILL_COLORS: Record<SkillGroup, string> = {
  Frontend: '#38bdf8',
  Backend: '#f97316',
  Database: '#a3e635',
  'Cloud & DevOps': '#c084fc',
  Tools: '#f472b6',
};

const positions = ringLayout(skills.length, 12);

const Crystal: React.FC<{ name: string; color: string; position: Vec3; interactive: boolean }> = ({ name, color, position, interactive }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  useFrame((state, dt) => {
    mesh.current.rotation.y += dt * 0.8;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime + position[0]) * 0.4;
    easing.damp3(mesh.current.scale, hovered ? 1.6 : 1, 0.15, dt);
  });
  return (
    <group position={position}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.6 : 0.7} flatShading metalness={0.3} roughness={0.2} />
      </mesh>
      <GlowSprite color={color} scale={hovered ? 4 : 2.4} opacity={0.5} />
      {interactive && hovered && (
        <Html center position={[0, 1.5, 0]} className="mv-label">{name}</Html>
      )}
    </group>
  );
};

export const SkillsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const belt = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    belt.current.rotation.y += dt * 0.05;
    core.current.rotation.y -= dt * 0.3;
    core.current.rotation.x += dt * 0.1;
  });
  const palette = PALETTES.skills;
  return (
    <>
      <Nebula palette={palette} radius={75} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={250} distance={60} color={palette.atmos} />
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[2.6, 0]} />
          <meshStandardMaterial color={palette.atmos} emissive={palette.a} emissiveIntensity={0.8} flatShading metalness={0.4} roughness={0.15} />
        </mesh>
        <mesh scale={1.35}>
          <icosahedronGeometry args={[2.6, 1]} />
          <meshBasicMaterial color={[1.6, 2.4, 2.2]} wireframe transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>
      <GlowSprite color={palette.b} scale={14} opacity={0.4} />
      <group ref={belt}>
        {skills.map((s, i) => (
          <Crystal key={s.name} name={s.name} color={SKILL_COLORS[s.group]} position={positions[i]} interactive={active && !preview} />
        ))}
      </group>
    </>
  );
};
```

- [ ] **Step 6: Create `overlay/panels/SkillsPanel.tsx`**

```tsx
import React from 'react';
import { skills, SKILL_GROUPS } from '../../../data/portfolio';
import { SKILL_COLORS } from '../../universes/SkillsUniverse';
import { PanelProps } from './index';

export const SkillsPanel: React.FC<PanelProps> = () => (
  <div>
    <span className="mv-kicker">Technical Skills</span>
    <h2 className="mv-h2">My Tech Belt</h2>
    {SKILL_GROUPS.map((g) => (
      <div key={g} className="mv-skill-group">
        <h3 style={{ color: SKILL_COLORS[g] }}>{g}</h3>
        {skills.filter((s) => s.group === g).map((s) => (
          <span key={s.name} className="mv-tag">{s.name}</span>
        ))}
      </div>
    ))}
  </div>
);
```

- [ ] **Step 7: Register** `skills` in both registries. Append the styles:

```css
/* skills */
.mv-skill-group { margin-bottom: 12px; }
.mv-skill-group h3 { font-size: 0.74rem; letter-spacing: 0.22em; text-transform: uppercase; margin: 0 0 8px; }
```

- [ ] **Step 8: Visual check.** Run `mv-check.js` with `steps` = `4`.
  - Step 3 panel shows `Technical Skills My Tech Belt FRONTEND Next.js TypeScript …` (the group headings are uppercase via CSS).
  - `step-3.jpg` shows the teal core inside a ring of coloured crystals.

- [ ] **Step 9: Checkpoint.** Build is clean, tests pass. Do not commit.

---

### Task 13: Certifications — Archive of Light

**Files:**
- Create: `src/multiverse/overlay/certificateSource.ts`, `src/multiverse/universes/CertificationsUniverse.tsx`, `src/multiverse/overlay/panels/CertificationsPanel.tsx`, `src/multiverse/overlay/modals/CertificateModal.tsx`
- Modify: both registries (`certifications`); `ModalHost.tsx` (add the `certificate` case); `multiverse.css`
- Test: `src/multiverse/overlay/certificateSource.test.ts`

**Interfaces:**
- Consumes: `certifications`, `Certification`; `sunShader`, `GlowSprite`, `PALETTES`; `useJourney.openModal`.
- Produces: `CertificateSource = { kind: 'pdf' | 'image'; url: string }`, `resolveCertificateSource(cert, fetchImpl?): Promise<CertificateSource>`.

- [ ] **Step 1: Write the failing test** `src/multiverse/overlay/certificateSource.test.ts`:

```ts
import { resolveCertificateSource } from './certificateSource';

const cert = { title: 'ReactJS', provider: 'Great Learning', image: '/Images/Reactjs.png', pdf: '/certificates/react.pdf' };
const head = (status: number, type: string, throws = false) =>
  (jest.fn(async () => {
    if (throws) throw new Error('offline');
    return { ok: status < 400, status, headers: { get: () => type } } as unknown as Response;
  }) as unknown) as typeof fetch;

test('no pdf configured → image, without a request', async () => {
  const f = head(200, 'application/pdf');
  await expect(resolveCertificateSource({ ...cert, pdf: undefined }, f)).resolves.toEqual({ kind: 'image', url: cert.image });
  expect(f).not.toHaveBeenCalled();
});

test('pdf exists → pdf', async () => {
  await expect(resolveCertificateSource(cert, head(200, 'application/pdf'))).resolves.toEqual({ kind: 'pdf', url: cert.pdf });
});

test('missing pdf (404, SPA html fallback, or offline) → image', async () => {
  await expect(resolveCertificateSource(cert, head(404, 'text/html'))).resolves.toEqual({ kind: 'image', url: cert.image });
  await expect(resolveCertificateSource(cert, head(200, 'text/html'))).resolves.toEqual({ kind: 'image', url: cert.image });
  await expect(resolveCertificateSource(cert, head(0, '', true))).resolves.toEqual({ kind: 'image', url: cert.image });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/multiverse/overlay`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `overlay/certificateSource.ts`**

```ts
import { Certification } from '../../data/portfolio';

export interface CertificateSource { kind: 'pdf' | 'image'; url: string }

/** Use the PDF only if it really exists (dev servers answer unknown paths with index.html). */
export async function resolveCertificateSource(cert: Certification, fetchImpl: typeof fetch = fetch): Promise<CertificateSource> {
  const image: CertificateSource = { kind: 'image', url: cert.image };
  if (!cert.pdf) return image;
  try {
    const res = await fetchImpl(cert.pdf, { method: 'HEAD' });
    const type = res.headers.get('content-type') || '';
    return res.ok && type.includes('pdf') ? { kind: 'pdf', url: cert.pdf } : image;
  } catch {
    return image;
  }
}
```

- [ ] **Step 4: Run it to verify it passes.** Same command → PASS (3 tests).

- [ ] **Step 5: Create `universes/CertificationsUniverse.tsx`**

```tsx
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Nebula } from '../fx/Nebula';
import { GlowSprite } from '../fx/GlowSprite';
import { sunShader } from '../fx/shaders';
import { PALETTES } from '../fx/palettes';
import { certifications } from '../../data/portfolio';
import { UniverseProps } from './index';

const palette = PALETTES.certifications;
const RADIUS = 8;

export const CertificationsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const orbit = useRef<THREE.Group>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const box = useMemo(() => new THREE.BoxGeometry(3.2, 2.2, 0.08), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(box), [box]);

  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    orbit.current.rotation.y += dt * 0.12;
  });

  return (
    <>
      <Nebula palette={palette} radius={65} />
      <ambientLight intensity={0.35} />
      <pointLight intensity={300} distance={50} color="#fcd34d" />
      <mesh>
        <sphereGeometry args={[2.2, 64, 64]} />
        <shaderMaterial args={[sunShader]} uniforms={uniforms} toneMapped={false} />
      </mesh>
      <GlowSprite color={[1.4, 1.0, 0.3]} scale={12} opacity={0.8} />
      <group ref={orbit}>
        {certifications.map((c, i) => {
          const a = (i / certifications.length) * Math.PI * 2;
          return (
            <group key={c.title} position={[Math.cos(a) * RADIUS, Math.sin(a * 2) * 1.2, Math.sin(a) * RADIUS]} rotation-y={-a + Math.PI / 2}>
              <mesh geometry={box}>
                <meshStandardMaterial color="#fcd34d" emissive="#b45309" emissiveIntensity={0.6} transparent opacity={0.22} metalness={0.6} roughness={0.2} side={THREE.DoubleSide} />
              </mesh>
              <lineSegments geometry={edges}>
                <lineBasicMaterial color={[2.4, 1.8, 0.6]} toneMapped={false} />
              </lineSegments>
              {active && !preview && (
                <Html center transform distanceFactor={8} className="mv-plaque">{c.title}</Html>
              )}
            </group>
          );
        })}
      </group>
    </>
  );
};
```

- [ ] **Step 6: Create the panel and the modal**

```tsx
// overlay/panels/CertificationsPanel.tsx
import React from 'react';
import { certifications } from '../../../data/portfolio';
import { useJourney } from '../../store';
import { PanelProps } from './index';

export const CertificationsPanel: React.FC<PanelProps> = () => {
  const openModal = useJourney((s) => s.openModal);
  return (
    <div>
      <span className="mv-kicker">Certifications</span>
      <h2 className="mv-h2">Archive of Light</h2>
      <ul className="mv-cards">
        {certifications.map((c, i) => (
          <li key={c.title} className="mv-card" style={{ '--i': i } as React.CSSProperties}>
            <div>
              <strong>{c.title}</strong>
              <span>{c.provider}</span>
            </div>
            <button className="mv-btn mv-btn--ghost" onClick={() => openModal({ kind: 'certificate', index: i })}>View</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

```tsx
// overlay/modals/CertificateModal.tsx
import React, { useEffect, useState } from 'react';
import { certifications } from '../../../data/portfolio';
import { CertificateSource, resolveCertificateSource } from '../certificateSource';

export const CertificateModal: React.FC<{ index: number }> = ({ index }) => {
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
    <div className="mv-doc">
      <div className="mv-doc__head">
        <h3>{cert.title}</h3>
      </div>
      {!source && <p className="mv-text">Loading…</p>}
      {source?.kind === 'pdf' && <iframe className="mv-doc__frame" src={source.url} title={cert.title} />}
      {source?.kind === 'image' && <img className="mv-doc__img" src={source.url} alt={`${cert.title} certificate`} />}
    </div>
  );
};
```

In `ModalHost.tsx`, add `import { CertificateModal } from './modals/CertificateModal';` and add this case to the switch:

```tsx
    case 'certificate':
      body = <CertificateModal index={modal.index} />;
      break;
```

- [ ] **Step 7: Register** `certifications` in both registries. Append the styles:

```css
/* cards (certifications) */
.mv-cards { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.mv-card {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 14px 16px; border-radius: 14px; background: rgba(252,211,77,0.06); border: 1px solid rgba(252,211,77,0.25);
  opacity: 0; animation: mv-stagger 0.6s ease both; animation-delay: calc(150ms + var(--i) * 120ms);
}
.mv-card strong { display: block; font-size: 0.95rem; }
.mv-card span { font-size: 0.8rem; color: rgba(255,255,255,0.6); }
.mv-plaque { width: 150px; text-align: center; font-size: 11px; color: #fde68a; text-shadow: 0 0 8px rgba(0,0,0,0.9); pointer-events: none; }
```

- [ ] **Step 8: Visual check.**
  - Run `mv-check.js` with `steps` = `5`. Step 4 panel shows `Certifications Archive of Light HTML5 Application Development Fundamentals …`.
  - Run `node $SCRATCH/shots/mv-interact.js certificate`. There are no PDFs yet, so the image shows.
  - Expected: `certificate image: true`.

- [ ] **Step 9: Checkpoint.** Build is clean, tests pass. Do not commit.

---

### Task 14: Work — Career Galaxy

**Files:**
- Create: `src/multiverse/universes/WorkUniverse.tsx`, `src/multiverse/overlay/panels/WorkPanel.tsx`
- Modify: both registries (`work`); `multiverse.css`

**Interfaces:**
- Consumes: `WORK_STOPS`, `universeOrigin` (Task 5); `experience`; `Planet`, `Nebula`, `PALETTES`.
- Produces: `WorkUniverse`, `WorkPanel`. The beat format is `job-<index>`.

- [ ] **Step 1: Create `universes/WorkUniverse.tsx`**

```tsx
import React from 'react';
import { Html, Line } from '@react-three/drei';
import { Nebula } from '../fx/Nebula';
import { Planet } from '../fx/Planet';
import { GlowSprite } from '../fx/GlowSprite';
import { Palette, PALETTES } from '../fx/palettes';
import { WORK_STOPS, universeOrigin, Vec3 } from '../journey';
import { experience } from '../../data/portfolio';
import { UniverseProps } from './index';

const JOB_PALETTES: Palette[] = [
  PALETTES.work,
  { a: '#312e81', b: '#f472b6', atmos: '#f9a8d4' },
  { a: '#134e4a', b: '#facc15', atmos: '#fde68a' },
];
const origin = universeOrigin('work');
const lightFor = (p: Vec3): Vec3 => [origin[0] + p[0] + 18, origin[1] + p[1] + 12, origin[2] + p[2] + 22];

export const WorkUniverse: React.FC<UniverseProps> = ({ active, preview }) => (
  <>
    <Nebula palette={PALETTES.work} radius={110} center={[0, 0, -70]} />
    <Line points={WORK_STOPS} color={PALETTES.work.atmos} lineWidth={1} transparent opacity={0.35} />
    {WORK_STOPS.map((p, i) => (
      <group key={experience[i].company} position={p}>
        <Planet radius={3.2} palette={JOB_PALETTES[i]} bands={8 + i * 3} lightPos={lightFor(p)} />
        <GlowSprite color={JOB_PALETTES[i].b} scale={16} opacity={0.25} />
        {active && !preview && (
          <Html center position={[0, 4.6, 0]} className="mv-label">
            {experience[i].company}
            <small>{experience[i].start} – {experience[i].end}</small>
          </Html>
        )}
      </group>
    ))}
  </>
);
```

- [ ] **Step 2: Create `overlay/panels/WorkPanel.tsx`**

```tsx
import React from 'react';
import { experience } from '../../../data/portfolio';
import { PanelProps } from './index';

export const WorkPanel: React.FC<PanelProps> = ({ beat }) => {
  const index = Number(beat.replace('job-', '')) || 0;
  const job = experience[index];
  return (
    <div>
      <span className="mv-kicker">Work Experience · {index + 1} / {experience.length}</span>
      <h2 className="mv-h2">{job.role}</h2>
      <p className="mv-job__meta"><strong>{job.company}</strong> · {job.start} – {job.end}</p>
      <ul className="mv-bullets">
        {job.bullets.map((b, i) => (
          <li key={b} style={{ '--i': i } as React.CSSProperties}>{b}</li>
        ))}
      </ul>
    </div>
  );
};
```

- [ ] **Step 3: Register** `work` in both registries. Append the styles:

```css
/* work */
.mv-job__meta { color: #ffb15c; margin: -6px 0 16px; letter-spacing: 0.04em; }
.mv-bullets { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 10px; }
.mv-bullets li {
  color: rgba(255,255,255,0.8); line-height: 1.6; font-size: 0.93rem;
  opacity: 0; animation: mv-stagger 0.6s ease both; animation-delay: calc(150ms + var(--i) * 110ms);
}
.mv-bullets li::marker { color: #ff7a00; }
```

- [ ] **Step 4: Visual check.** Run `mv-check.js` with `steps` = `8`. Expected:
  - step 5: `Work Experience · 1 / 3 FullStack Developer Realatte · Feb 2026 – Nov 2026`
  - step 6: `2 / 3 … Starz Ventures Pvt Ltd`
  - step 7: `3 / 3 … Entrance1.com`
  - Each `step-5.jpg` to `step-7.jpg` shows a different planet in front.

- [ ] **Step 5: Checkpoint.** Build is clean, tests pass. Do not commit.

---

### Task 15: Projects — Project Galaxy

**Files:**
- Modify: `src/multiverse/universes/layout.ts` (add `layoutGalaxy`), `src/multiverse/universes/layout.test.ts`
- Create: `src/multiverse/universes/ProjectsUniverse.tsx`, `src/multiverse/overlay/panels/ProjectsPanel.tsx`, `src/multiverse/overlay/modals/ProjectDetail.tsx`
- Modify: both registries (`projects`); `ModalHost.tsx` (the `project` case, as a sheet); `multiverse.css`

**Interfaces:**
- Consumes: `projects, CONSTELLATIONS, Constellation, newestFirst, descriptionParagraphs`; `GlowSprite`, `PALETTES`; `useJourney.openModal`.
- Produces:
  - `layoutGalaxy(items: { constellation: Constellation; featured?: boolean }[]): { positions: Vec3[]; centers: Record<Constellation, Vec3> }`
  - `CONSTELLATION_COLORS: Record<Constellation, string>` (exported from `ProjectsUniverse.tsx`)
  - `ProjectsUniverse`, `ProjectsPanel`, `ProjectDetail({ index })`

- [ ] **Step 1: Add the failing tests to `layout.test.ts`**

```ts
import { layoutGalaxy } from './layout';
import { projects, CONSTELLATIONS } from '../../data/portfolio';

describe('layoutGalaxy', () => {
  const { positions, centers } = layoutGalaxy(projects);

  test('one position per project, all inside the galaxy', () => {
    expect(positions).toHaveLength(projects.length);
    positions.forEach(([x, y, z]) => expect(Math.hypot(x, y, z)).toBeLessThan(30));
  });

  test('no two stars overlap', () => {
    for (let i = 0; i < positions.length; i++)
      for (let j = i + 1; j < positions.length; j++) {
        const [a, b] = [positions[i], positions[j]];
        expect(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])).toBeGreaterThan(1);
      }
  });

  test('four distinct constellation centres, deterministic', () => {
    expect(Object.keys(centers).sort()).toEqual([...CONSTELLATIONS].sort());
    expect(layoutGalaxy(projects).positions).toEqual(positions);
  });
});
```

Run: `CI=true npx react-scripts test --watchAll=false src/multiverse/universes` → FAIL (`layoutGalaxy` is not exported).

- [ ] **Step 2: Add `layoutGalaxy` to `layout.ts`**

```ts
import { Constellation, CONSTELLATIONS } from '../../data/portfolio';

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Constellations sit at the four compass points; stars spiral out from each centre (sunflower pattern). */
export function layoutGalaxy(items: { constellation: Constellation }[]): { positions: Vec3[]; centers: Record<Constellation, Vec3> } {
  const centers = {} as Record<Constellation, Vec3>;
  CONSTELLATIONS.forEach((c, i) => {
    const a = (i / CONSTELLATIONS.length) * Math.PI * 2 + Math.PI / 4;
    centers[c] = [Math.cos(a) * 16, 0, Math.sin(a) * 16];
  });
  const seen: Record<string, number> = {};
  const positions = items.map(({ constellation }) => {
    const j = (seen[constellation] = (seen[constellation] ?? -1) + 1);
    const r = 2 + 1.6 * Math.sqrt(j);
    const a = j * GOLDEN;
    const [cx, cy, cz] = centers[constellation];
    return [cx + Math.cos(a) * r, cy + ((j % 3) - 1) * 1.2, cz + Math.sin(a) * r] as Vec3;
  });
  return { positions, centers };
}
```

Run the same command → PASS.

- [ ] **Step 3: Create `universes/ProjectsUniverse.tsx`**

```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { easing } from 'maath';
import { GlowSprite } from '../fx/GlowSprite';
import { glowTexture } from '../fx/glow';
import { PALETTES } from '../fx/palettes';
import { projects, CONSTELLATIONS, Constellation } from '../../data/portfolio';
import { layoutGalaxy } from './layout';
import { useJourney } from '../store';
import { Vec3 } from '../journey';
import { UniverseProps } from './index';

export const CONSTELLATION_COLORS: Record<Constellation, string> = {
  'CRM Platforms': '#f97316',
  'Salesforce Portals': '#a78bfa',
  'Real Estate': '#38bdf8',
  'Web Apps': '#f472b6',
};

const { positions, centers } = layoutGalaxy(projects);

const GalaxyDust: React.FC = () => {
  const geo = useMemo(() => {
    const n = 6000;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const a = new THREE.Color(PALETTES.projects.a);
    const b = new THREE.Color(PALETTES.projects.b);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const arm = i % 3;
      const d = Math.pow(Math.random(), 0.6) * 34;
      const t = d * 0.18 + (arm * Math.PI * 2) / 3 + (Math.random() - 0.5) * 0.5;
      pos.set([Math.cos(t) * d, (Math.random() - 0.5) * 2.4 * Math.exp(-d / 20), Math.sin(t) * d], i * 3);
      c.copy(a).lerp(b, d / 34).multiplyScalar(1.4);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.35} map={glowTexture} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
};

const Star: React.FC<{ index: number; interactive: boolean }> = ({ index, interactive }) => {
  const p = projects[index];
  const color = CONSTELLATION_COLORS[p.constellation];
  const bright = useMemo(() => new THREE.Color(color).multiplyScalar(3), [color]);
  const group = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const size = p.featured ? 0.55 : 0.32;

  useFrame((state, dt) => {
    const twinkle = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.08;
    easing.damp3(group.current.scale, (hovered ? 1.8 : 1) * twinkle, 0.15, dt);
  });

  return (
    <group ref={group} position={positions[index]}>
      <mesh
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = '';
        }}
        onClick={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          document.body.style.cursor = '';
          useJourney.getState().openModal({ kind: 'project', index });
        }}
      >
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial color={bright} toneMapped={false} />
      </mesh>
      <GlowSprite color={color} scale={p.featured ? 5 : 2.6} opacity={0.8} />
      {p.featured && <GlowSprite color={color} scale={[9, 0.5, 1]} opacity={0.6} />}
      {interactive && hovered && (
        <Html center position={[0, size + 1.1, 0]} className="mv-label">
          {p.title}
          <small>{p.shortDescription}</small>
        </Html>
      )}
    </group>
  );
};

export const ProjectsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const galaxy = useRef<THREE.Group>(null!);
  const drag = useRef({ down: false, x: 0, target: 0 });
  const interactive = active && !preview;

  useEffect(() => {
    if (!interactive) return;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).tagName !== 'CANVAS') return;
      drag.current.down = true;
      drag.current.x = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.down) return;
      const d = drag.current;
      d.target = THREE.MathUtils.clamp(d.target + (e.clientX - d.x) * 0.004, -0.8, 0.8);
      d.x = e.clientX;
    };
    const onUp = () => {
      drag.current.down = false;
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [interactive]);

  useFrame((state, dt) => {
    easing.damp(galaxy.current.rotation, 'y', drag.current.target + state.clock.elapsedTime * 0.01, 0.4, dt);
  });

  const lines = useMemo(
    () => CONSTELLATIONS.map((c) => ({ c, pts: projects.map((p, i) => (p.constellation === c ? positions[i] : null)).filter(Boolean) as Vec3[] })),
    []
  );

  return (
    <group ref={galaxy}>
      <GalaxyDust />
      <GlowSprite color={PALETTES.projects.b} scale={18} opacity={0.5} />
      {lines.map(({ c, pts }) => (
        <Line key={c} points={pts} color={CONSTELLATION_COLORS[c]} lineWidth={1} transparent opacity={0.25} />
      ))}
      {projects.map((p, i) => (
        <Star key={p.title} index={i} interactive={interactive} />
      ))}
      {interactive &&
        CONSTELLATIONS.map((c) => (
          <Html key={c} center position={[centers[c][0], centers[c][1] + 6, centers[c][2]]} className="mv-label">
            <span style={{ color: CONSTELLATION_COLORS[c] }}>{c}</span>
          </Html>
        ))}
    </group>
  );
};
```

- [ ] **Step 4: Create the panel and the detail sheet**

```tsx
// overlay/panels/ProjectsPanel.tsx
import React, { useState } from 'react';
import { projects, newestFirst, CONSTELLATIONS } from '../../../data/portfolio';
import { CONSTELLATION_COLORS } from '../../universes/ProjectsUniverse';
import { useJourney } from '../../store';
import { PanelProps } from './index';

export const ProjectsPanel: React.FC<PanelProps> = () => {
  const openModal = useJourney((s) => s.openModal);
  const [showList, setShowList] = useState(false);
  return (
    <div className="mv-projects">
      <span className="mv-kicker">My Projects</span>
      <h2 className="mv-h2">Project Galaxy</h2>
      <p className="mv-text">{projects.length} projects across {CONSTELLATIONS.length} constellations. Hover a star to see its name, click to open it, drag to turn the galaxy.</p>
      <ul className="mv-legend">
        {CONSTELLATIONS.map((c) => (
          <li key={c}><span style={{ background: CONSTELLATION_COLORS[c] }} />{c}</li>
        ))}
      </ul>
      <button className="mv-btn mv-btn--ghost" onClick={() => setShowList((v) => !v)} aria-expanded={showList}>
        {showList ? 'Hide list' : 'View as list'}
      </button>
      {showList && (
        <ul className="mv-list" data-capture-scroll>
          {newestFirst(projects).map((p) => (
            <li key={p.title}>
              <button onClick={() => openModal({ kind: 'project', index: projects.indexOf(p) })}>
                <span className="mv-list__dot" style={{ background: CONSTELLATION_COLORS[p.constellation] }} />
                <strong>{p.title}</strong>
                <em>{p.shortDescription}</em>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

```tsx
// overlay/modals/ProjectDetail.tsx
import React from 'react';
import { projects, descriptionParagraphs } from '../../../data/portfolio';
import { CONSTELLATION_COLORS } from '../../universes/ProjectsUniverse';

export const ProjectDetail: React.FC<{ index: number }> = ({ index }) => {
  const p = projects[index];
  return (
    <article className="mv-detail">
      <span className="mv-kicker" style={{ color: CONSTELLATION_COLORS[p.constellation] }}>{p.constellation}</span>
      <h2 className="mv-h2">{p.title}</h2>
      <div className="mv-detail__badges">
        <span className="mv-tag">{p.type}</span>
        <span className="mv-tag">{p.status}</span>
      </div>
      {descriptionParagraphs(p.description).map((para, i) => (
        <p key={i} className="mv-text">{para}</p>
      ))}
      <div className="mv-detail__tech">
        {p.technologies.map((t) => (
          <span key={t} className="mv-tag">{t.trim()}</span>
        ))}
      </div>
      <div className="mv-actions">
        {p.demoUrl && <a className="mv-btn" href={p.demoUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}
        {p.codeUrl && <a className="mv-btn mv-btn--ghost" href={p.codeUrl} target="_blank" rel="noopener noreferrer">Code</a>}
      </div>
    </article>
  );
};
```

In `ModalHost.tsx`:
- add `import { ProjectDetail } from './modals/ProjectDetail';`
- add the case:

```tsx
    case 'project':
      body = <ProjectDetail index={modal.index} />;
      sheet = true;
      break;
```

- [ ] **Step 5: Register** `projects` in both registries. Append the styles:

```css
/* projects */
.mv-legend { list-style: none; padding: 0; margin: 4px 0 16px; display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 0.8rem; color: rgba(255,255,255,0.75); }
.mv-legend span { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 6px; box-shadow: 0 0 8px currentColor; }
.mv-list { list-style: none; margin: 14px 0 0; padding: 0 6px 0 0; max-height: 46vh; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
.mv-list button {
  width: 100%; text-align: left; display: grid; grid-template-columns: 12px 1fr; column-gap: 10px; row-gap: 2px;
  padding: 10px 12px; border-radius: 12px; cursor: pointer; color: #fff;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); transition: border-color 0.2s, background 0.2s;
}
.mv-list button:hover { border-color: #ff7a00; background: rgba(255,122,0,0.1); }
.mv-list__dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 6px; grid-row: span 2; }
.mv-list strong { font-size: 0.9rem; }
.mv-list em { font-style: normal; font-size: 0.76rem; color: rgba(255,255,255,0.6); }
.mv-modal--sheet { place-items: stretch end; }
.mv-modal--sheet .mv-modal__box { width: min(560px, 94vw); max-height: none; height: 100%; border-radius: 18px 0 0 18px; animation: mv-sheet 0.4s cubic-bezier(0.2,0.8,0.2,1) both; }
.mv-detail__badges, .mv-detail__tech { margin: 6px 0 14px; }
@keyframes mv-sheet { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }
```

- [ ] **Step 6: Visual check.** Run `mv-check.js` with `steps` = `9`.
  - Step 8 panel shows `My Projects Project Galaxy 23 projects across 4 constellations.`
  - `step-8.jpg` shows a purple spiral with coloured stars in four clusters.
  - Run `node $SCRATCH/shots/mv-interact.js project`.
  - Expected: `detail: Shubhdhanam CRM`, `live demo new tab: true`, `closed: true`.

- [ ] **Step 7: Checkpoint.** Build is clean, tests pass. Do not commit.

---

### Task 16: Contact — Transmission Station

**Files:**
- Create: `src/multiverse/universes/ContactUniverse.tsx`, `src/multiverse/overlay/panels/ContactPanel.tsx`
- Modify: both registries (`contact`); `multiverse.css`

**Interfaces:**
- Consumes: `useContactForm(onSent)` (Task 2); `useJourney.fireBeam` and `beamAt`; `profile`; fx.
- Produces: `ContactUniverse`, `ContactPanel`, and `BEAM_MS = 2500`.

- [ ] **Step 1: Create `universes/ContactUniverse.tsx`**

```tsx
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Nebula } from '../fx/Nebula';
import { GlowSprite } from '../fx/GlowSprite';
import { PALETTES } from '../fx/palettes';
import { useJourney } from '../store';
import { UniverseProps } from './index';

export const BEAM_MS = 2500;
const palette = PALETTES.contact;
const DISH: [number, number, number] = [0, 3.4, 0];

export const ContactUniverse: React.FC<UniverseProps> = () => {
  const dish = useRef<THREE.Group>(null!);
  const lights = useRef<THREE.Group>(null!);
  const beam = useRef<THREE.Mesh>(null!);
  const beamMat = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame((state, dt) => {
    dish.current.rotation.y += dt * 0.4;
    lights.current.children.forEach((child, i) => {
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      const on = Math.sin(state.clock.elapsedTime * 3 + i * 2) > 0.3;
      m.color.setScalar(on ? 3 : 0.3);
    });
    const t = performance.now() - useJourney.getState().beamAt;
    const live = t >= 0 && t < BEAM_MS;
    beam.current.visible = live;
    if (live) {
      beam.current.scale.y = Math.min(1, t / 400);
      beamMat.current.opacity = 1 - t / BEAM_MS;
    }
  });

  return (
    <>
      <Nebula palette={palette} radius={65} />
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 8, 10]} intensity={200} distance={60} color={palette.atmos} />
      {/* tower */}
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[0.35, 0.8, 9, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} emissive={palette.a} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 1.8, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.6, 0.08, 12, 64]} />
        <meshBasicMaterial color={[0.8, 2.4, 1.6]} toneMapped={false} />
      </mesh>
      {/* rotating dish */}
      <group ref={dish} position={DISH}>
        <mesh rotation={[-Math.PI / 3, 0, 0]}>
          <sphereGeometry args={[2.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.7} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.9, -0.5]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color={[0.6, 3, 2]} toneMapped={false} />
        </mesh>
      </group>
      {/* blinking lights */}
      <group ref={lights}>
        {[[-0.9, -4, 0.6], [0.9, -1, 0.6], [0, 5.6, 0]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color={[3, 3, 3]} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <GlowSprite color={palette.b} scale={10} opacity={0.35} position={DISH} />
      {/* transmission beam */}
      <group position={DISH} rotation={[-0.6, 0, 0.35]}>
        <mesh ref={beam} visible={false}>
          <cylinderGeometry args={[0.12, 0.7, 220, 16, 1, true]} />
          <meshBasicMaterial ref={beamMat} color={[1.2, 3, 2.2]} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
};
```

(A cylinder grows from its centre. The beam reads as shooting outward because its far half is much brighter against space, which is acceptable for the effect.)

- [ ] **Step 2: Create `overlay/panels/ContactPanel.tsx`**

```tsx
import React from 'react';
import { profile } from '../../../data/portfolio';
import { useContactForm } from '../../../hooks/contact';
import { useJourney } from '../../store';
import { PanelProps } from './index';

export const ContactPanel: React.FC<PanelProps> = () => {
  const fireBeam = useJourney((s) => s.fireBeam);
  const { form, sending, error, showToast, handleChange, handleSubmit } = useContactForm(() => fireBeam());
  return (
    <div>
      <span className="mv-kicker">Contact</span>
      <h2 className="mv-h2">Let's Connect</h2>
      <ul className="mv-contact">
        <li><span>Email</span><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
        <li><span>Phone</span><a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a></li>
        <li><span>Location</span>{profile.location}</li>
        <li><span>LinkedIn</span><a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">sudhir-vishwakarma</a></li>
      </ul>
      <form className="mv-form" onSubmit={handleSubmit}>
        <div className="mv-form__row">
          <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required aria-label="Your name" />
          <input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required aria-label="Your email" />
        </div>
        <select name="subject" value={form.subject} onChange={handleChange} required aria-label="Subject">
          <option value="">Select Subject</option>
          <option value="project">Project Inquiry</option>
          <option value="job">Job Opportunity</option>
          <option value="collaboration">Collaboration</option>
          <option value="other">Other</option>
        </select>
        <textarea name="message" placeholder="Your Message" rows={4} value={form.message} onChange={handleChange} required aria-label="Your message" />
        {error && <p className="mv-form__error" role="alert">{error}</p>}
        <button type="submit" className="mv-btn" disabled={sending}>{sending ? 'Transmitting…' : 'Send Message'}</button>
      </form>
      {showToast && <div className="mv-toast" role="status">✅ Message sent successfully! I'll respond within 24 hours.</div>}
    </div>
  );
};
```

- [ ] **Step 3: Register** `contact` in both registries. Append the styles:

```css
/* contact */
.mv-contact { list-style: none; padding: 0; margin: 0 0 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; font-size: 0.88rem; }
.mv-contact span { display: block; font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: #6ee7b7; }
.mv-contact a { color: #fff; text-decoration: none; }
.mv-contact a:hover { color: #ff9a3c; }
.mv-form { display: flex; flex-direction: column; gap: 10px; }
.mv-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mv-form input, .mv-form select, .mv-form textarea {
  width: 100%; padding: 11px 13px; border-radius: 10px; font: inherit; font-size: 0.88rem; color: #fff;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.16); transition: border-color 0.2s, box-shadow 0.2s;
}
.mv-form select option { background: #111; }
.mv-form input:focus, .mv-form select:focus, .mv-form textarea:focus { outline: none; border-color: #ff7a00; box-shadow: 0 0 0 3px rgba(255,122,0,0.2); }
.mv-form textarea { resize: vertical; }
.mv-form .mv-btn { align-self: flex-start; }
.mv-form__error { color: #ff6b6b; font-size: 0.85rem; margin: 0; }
.mv-toast {
  position: fixed; top: 84px; right: 24px; z-index: 45; padding: 14px 18px; border-radius: 12px;
  background: rgba(16,185,129,0.9); color: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.4); animation: mv-pop 0.35s ease both;
}
```

- [ ] **Step 4: Verify.** Run `mv-check.js` with `steps` = `10`. Step 9 panel shows `Contact Let's Connect Email karmasudhir48@gmail.com …`.

  Then test the form **without sending real email**: `node $SCRATCH/shots/mv-interact.js contact`. The script answers `POST /api/contact` itself. It types into every field, including a space and an ArrowDown in the textarea (Review Focus 2, end to end), then submits.

  Expected: `hash unchanged while typing: true`, `toast: true`. The beam is checked by eye in Task 18 on the owner's GPU, because it lasts only 2.5 s.

- [ ] **Step 5: Checkpoint.** Build is clean, tests pass. Do not commit.

---

## Phase 4: Polish

### Task 17: Adaptive performance and resilience

**Files:**
- Modify: `src/multiverse/Multiverse.tsx`

**Interfaces:**
- Consumes: `PostFX({ bloom })`, drei `PerformanceMonitor`.

- [ ] **Step 1: Add adaptive quality to `Multiverse.tsx`.**
  - Change the React import to `import React, { useCallback, useRef, useState } from 'react';`.
  - Add `PerformanceMonitor` to the drei import: `import { PerformanceMonitor, Preload } from '@react-three/drei';`.
  - Inside `Multiverse`, before `return`, add:

```tsx
  const [dpr, setDpr] = useState(1.75);
  const [bloom, setBloom] = useState(true);
  const dprRef = useRef(1.75);
  const decline = useCallback(() => {
    if (dprRef.current > 1) {
      dprRef.current = 1;
      setDpr(1);
    } else {
      setBloom(false);
    }
  }, []);
  const fallback = useCallback(() => {
    dprRef.current = 1;
    setDpr(1);
    setBloom(false);
  }, []);
```

  - Change `dpr={[1, 1.75]}` to `dpr={dpr}`.
  - Change `<PostFX bloom />` to `<PostFX bloom={bloom} />`.
  - Add `<PerformanceMonitor onDecline={decline} onFallback={fallback} flipflops={3} />` directly before `<Preload all />`.

- [ ] **Step 2: Verify the WebGL context-loss fallback.** Build, serve on 3005, then:

```bash
node -e "
const puppeteer=require('$SCRATCH/shots/node_modules/puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage();await p.setViewport({width:1280,height:800});
await p.goto('http://localhost:3005/#projects',{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,8000));
await p.evaluate(()=>{const c=document.querySelector('canvas');const gl=c.getContext('webgl2');gl.getExtension('WEBGL_lose_context').loseContext();});
await new Promise(r=>setTimeout(r,1500));
console.log('after context loss →', await p.evaluate(()=>document.querySelector('.sidebar')?'classic':'multiverse'),
  '| projects open:', await p.evaluate(()=>!!document.querySelector('.projects-page')));
await b.close();})();"
```

  Expected: `after context loss → classic | projects open: true`. Stop the server.

- [ ] **Step 3: Checkpoint.** Build is clean, tests pass. Do not commit.

---

### Task 18: Accessibility, metadata and final verification

**Files:**
- Modify: `public/index.html`, `src/multiverse/multiverse.css`

- [ ] **Step 1: Update the page metadata in `public/index.html`.** Replace the `<meta name="description" …>` and `<title>` lines:

```html
    <meta name="description" content="Sudhir Vishwakarma — Full-stack developer (React, Next.js, Salesforce). Explore my work, skills and projects as a journey through a solar system and multiverse." />
    <meta name="theme-color" content="#000004" />
    <title>Sudhir Vishwakarma · Full-Stack Developer</title>
```

Also delete the existing `<meta name="theme-color" content="#000000" />` line so the tag isn't duplicated.

- [ ] **Step 2: Add the remaining accessibility styles.** Append to `multiverse.css`:

```css
/* accessibility: visible focus everywhere, and comfortable reading widths */
.mv-nav button:focus-visible, .mv-progress__dot:focus-visible, .mv-btn:focus-visible, .mv-list button:focus-visible { outline: 2px solid #ff9a3c; outline-offset: 3px; }
.mv-panel .mv-text { max-width: 60ch; }
@media (max-height: 720px) {
  .mv-panel { top: 80px; bottom: 70px; }
  .mv-h1 { font-size: clamp(2rem, 4.4vw, 3.4rem); }
}
```

- [ ] **Step 3: Keyboard pass.** In headless Chrome on the built site:
  - Run `node $SCRATCH/shots/mv-interact.js keyboard`.
  - Expected tab order: `SV`, the 7 universe buttons, `Classic view`, then panel controls (View CV, Download CV, the social links) and the progress dots. No stop should land on a hidden element.
  - Press `End` and assert the Contact universe is reached (`.mv-nav .is-current` → `Contact`).
  - Press `Home` and assert Home.

- [ ] **Step 4: Full verification.**
  - `CI=true npx react-scripts test --watchAll=false` → all suites pass.
  - `CI=true npm run build` → `Compiled successfully.`
  - Serve, then run `node $SCRATCH/shots/mv-check.js http://localhost:3005/ $SCRATCH/shots/final 10`.
  - Expected:
    - all 10 panel lines show real content, and `no console errors`
    - read every `final/step-*.jpg`: each shows its universe, and none is black
  - Run `classic-check.js` against `/#classic` → `all sections OK`.
  - Run `node $SCRATCH/shots/mv-interact.js reduced-motion` → `reduced motion → classic`.
  - Stop the server.

- [ ] **Step 5: Hand-off.** Report to the owner:
  - the list of changed and new files (`git status --short`)
  - the test and build results
  - the screenshots
  - a reminder that they commit, push and deploy themselves, and that certificate PDFs go in `public/certificates/` with a `pdf:` field added in `src/data/portfolio.ts`

  Do not commit.
