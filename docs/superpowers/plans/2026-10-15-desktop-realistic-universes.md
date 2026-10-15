# Desktop Realistic Universes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every universe of the desktop 3D multiverse look like real space, NASA-photo style, and truly 3D:
- photo-mapped planets lit by a star, with day and night sides, relief, atmospheres and ring shadows
- a real Sun and a Milky Way sky
- stars with realistic colours
- rocky asteroids, metal satellites and a radio dish

**Architecture:**
- **Images:** 11 shared 2K maps in `public/textures/` load once, behind the existing loader.
- **Rendering:** custom GLSL shaders light each body from its universe's explicit light position. All universes stay mounted in one scene, so scene lights would leak between them.
- **Fallback:** every textured body sits inside `WithTextures` (an error boundary plus Suspense). While loading, or if an image fails, it falls back to today's procedural `Planet`.
- **Universe files:** they swap visuals only. Labels, handlers, portals and camera paths stay.

**Tech Stack:** CRA 5, React 18.3, TypeScript 4.9, three 0.165, @react-three/fiber 8.16, drei 9.108, @react-three/postprocessing 2.16, maath, Jest 27. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-15-desktop-realistic-universes-design.md`

## Global Constraints

- **Git:**
  - Work on branch `worktree-multiverse` in `/home/sudhirvishwakarma/Documents/Landing Pages/Second-Portfolio-Sudhir/.claude/worktrees/multiverse`.
  - Local commits only. Never `git push` or deploy.
  - Use plain, separate git commands: no `&&` chains, no `git -C`.
  - Before every commit run `git checkout -- build` then `git clean -fdq build`, and stage files explicitly.
  - Commit messages end with a blank line, then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Build:** `CI=true npm run build` must end with **"Compiled successfully."** (zero warnings).
- **Tests and types:** tests run with `CI=true npx react-scripts test --watchAll=false [path]`; `npx tsc --noEmit -p .` must be clean.
- **Scope:** only `src/multiverse/**`, `public/textures/**` and the docs change. The mobile chunk (`src/mobile/**`) and the classic site must not change, and nothing under `src/mobile/` may import from `src/multiverse/` except `fx/palettes.ts` and `journey.ts` (already the case).
- **Imagery:** exactly these 11 files, from Wikimedia Commons `https://commons.wikimedia.org/wiki/Special:FilePath/Solarsystemscope_texture_2k_<name>`. They are Solar System Scope maps, CC BY 4.0. Expected byte sizes:

  | File | Bytes |
  |---|---|
  | `2k_sun.jpg` | 822427 |
  | `2k_earth_daymap.jpg` | 463087 |
  | `2k_earth_nightmap.jpg` | 255287 |
  | `2k_earth_clouds.jpg` | 965676 |
  | `2k_moon.jpg` | 1053869 |
  | `2k_mars.jpg` | 750547 |
  | `2k_jupiter.jpg` | 498976 |
  | `2k_saturn.jpg` | 199916 |
  | `2k_saturn_ring_alpha.png` | 12119 |
  | `2k_neptune.jpg` | 241580 |
  | `2k_stars_milky_way.jpg` | 251454 |

  The owner approved this list in chat before Task 1 ran. Download nothing else.
- **Credit (verbatim):** "Planet imagery: Solar System Scope (CC BY 4.0)", linking to `https://www.solarsystemscope.com/textures/`.
- **Rendering rules:**
  - Celestial bodies are lit only through a shader uniform `uLightPos` (world space). Never add `pointLight`s.
  - Every custom fragment shader ends with `#include <colorspace_fragment>`.
  - Textures use `THREE.SRGBColorSpace` and anisotropy 4.
  - Bloom `luminanceThreshold` is 1.0. Lit planet surfaces stay at or below about 1.0 so only emissive sources (sun, stars, city lights) bloom.
- **Interaction parity:** keep every existing hover, click, label (`Html`), plaque, modal, portal, beam, camera pose, beat timing and exported constant name (`BEAM_MS`, `MOON_DELAY_MS`, `MOON_STAGGER_MS`, `SKILL_COLORS`, `CONSTELLATION_COLORS`, …).
- **Headless checks:**
  - `$SCRATCH` = `/tmp/claude-1002/-home-sudhirvishwakarma-Documents-Landing-Pages-Second-Portfolio-Sudhir/01c9bdce-01ed-4d1b-ae64-6685ae80a718/scratchpad`. puppeteer-core 23 lives in `$SCRATCH/shots`; run node scripts from there.
  - Serve with the Bash tool's `run_in_background`: `npx -y serve@14.2.4 -s build -l 3005` from the worktree root. Wait for HTTP 200.
  - Stop the server by PID: `pgrep -f "serve@14.2.4"`, then `kill`. Never `pkill -f`.
  - Never touch port 3000 (the owner's dev server).
  - WebGL in headless Chrome needs `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
- **LH-D command** (desktop Lighthouse; run it twice and append both lines to `$SCRATCH/shots/lh-real.txt` under a stage label):
  ```bash
  npx -y lighthouse@12.2.1 http://localhost:3005/ --only-categories=performance --preset=desktop --chrome-flags="--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist" --chrome-path=/usr/bin/google-chrome --quiet --output=json --output-path=$SCRATCH/shots/lh-real.json
  node -e "const r=require('$SCRATCH/shots/lh-real.json');console.log('performance', Math.round(r.categories.performance.score*100), '| LCP', r.audits['largest-contentful-paint'].displayValue, '| TBT', r.audits['total-blocking-time'].displayValue, '| bytes', r.audits['total-byte-weight'].displayValue)"
  ```
  Results are recorded, not gated.

## Review Focus

1. **A blocked or slow planet image:** the page must not throw or go blank; that body shows today's procedural look. Pinned by `real-shots.js block` (Tasks 3, 9).
2. **Hover, click and labels on the new bodies:** Home portal planets jump on click; Projects stars open the project modal; Skills asteroids show labels; the certificate viewer opens. Pinned by `mv-interact.js project,certificate,cv,contact,keyboard` plus a scripted Home planet click in `real-shots.js home-click` (Tasks 5, 7, 9).
3. **Portal previews lit from the wrong side or missing the sky:** previews render the same universe at its world origin, so world-space light positions must match. Pinned by the `portal` shot in `real-shots.js`, which is reviewed by eye (Tasks 4, 5).
4. **Bloom washing out day sides:** with threshold 1.0, lit surfaces must keep detail. Pinned by screenshot review of every universe (Tasks 5–8) and by the explicit check in Task 9.
5. **Motion that reveals depth:** pointer parallax and idle drift must visibly shift near bodies against far ones. Pinned by `real-shots.js parallax` (mean pixel difference above 4) (Tasks 4, 9).

---

## File Structure

```
public/textures/            11 maps + CREDITS.txt (Task 1)
src/multiverse/fx/
  textures.ts (+ .test.ts)  NEW pure: keys → URLs, per-universe key lists
  starColor.ts (+ .test.ts) NEW pure: blackbody colour
  rock.ts (+ .test.ts)      NEW pure: deterministic rock displacement
  useRealTextures.ts        NEW: drei useTexture + sRGB/anisotropy prep
  WithTextures.tsx          NEW: error boundary + Suspense with a fallback
  realShaders.ts            NEW: body, ring, atmosphere, earth, clouds, sun shaders
  RealPlanet.tsx            NEW: RealPlanet, Atmosphere, bodyUniforms, BodyProps
  RealEarth.tsx             NEW
  RealSun.tsx               NEW
  MilkyWaySky.tsx           NEW
  Asteroid.tsx, Satellite.tsx, RadioDish.tsx   NEW
  SceneLights.tsx, PostFX.tsx, Starfield.tsx, Portal.tsx   tuned
src/multiverse/camera/CameraRig.tsx            parallax + idle drift
src/multiverse/Multiverse.tsx, multiverse.css  sky + credits
src/multiverse/universes/*Universe.tsx         realistic visuals
$SCRATCH/shots/real-shots.js                   headless shots / parallax / block / home-click
```

---

### Task 1: Imagery, credits, texture manifest, and the desktop Lighthouse baseline

**Files:**
- Create: `public/textures/*` (11 images), `public/textures/CREDITS.txt`, `src/multiverse/fx/textures.ts`, `src/multiverse/fx/textures.test.ts`

**Interfaces:**
- Produces:
  - `TEXTURES: Record<TextureKey, string>`, where `TextureKey = 'sun' | 'earthDay' | 'earthNight' | 'earthClouds' | 'moon' | 'mars' | 'jupiter' | 'saturn' | 'saturnRing' | 'neptune' | 'milkyWay'`
  - `textureUrl(key): string`
  - `UNIVERSE_TEXTURES: Record<UniverseId, TextureKey[]>`
  - `ALL_TEXTURE_KEYS: TextureKey[]`

- [ ] **Step 0: Desktop Lighthouse baseline (before any change).**
  - Run `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"`.
  - Serve on 3005 and run the LH-D command twice.
  - Append both lines under `baseline (before realistic universes)`.
  - Stop the server and restore build/.

- [ ] **Step 1: Download the 11 approved maps** (owner-approved list; nothing else). From the worktree root, run each command separately:

```bash
mkdir -p public/textures
for n in sun earth_daymap earth_nightmap earth_clouds moon mars jupiter saturn neptune stars_milky_way; do curl -fsSL -A "portfolio-texture-fetch/1.0" -o "public/textures/2k_${n}.jpg" "https://commons.wikimedia.org/wiki/Special:FilePath/Solarsystemscope_texture_2k_${n}.jpg"; done
curl -fsSL -A "portfolio-texture-fetch/1.0" -o "public/textures/2k_saturn_ring_alpha.png" "https://commons.wikimedia.org/wiki/Special:FilePath/Solarsystemscope_texture_2k_saturn_ring_alpha.png"
ls -l public/textures
file public/textures/*
```

  Expected:
  - The byte sizes match the table in Global Constraints exactly.
  - `file` reports JPEG for the `.jpg` files and PNG (RGBA) for the ring.
  - If any size or type differs, stop and report NEEDS_CONTEXT. Do not keep a mismatched file.

- [ ] **Step 2: Create `public/textures/CREDITS.txt`**

```
Planet imagery: Solar System Scope (https://www.solarsystemscope.com/textures/), licensed CC BY 4.0
(https://creativecommons.org/licenses/by/4.0/). Based on NASA mission data.
Files fetched from Wikimedia Commons (Solarsystemscope_texture_2k_*). Unmodified.
```

- [ ] **Step 3: Write the failing test** `src/multiverse/fx/textures.test.ts`

```ts
import fs from 'fs';
import path from 'path';
import { ALL_TEXTURE_KEYS, TEXTURES, UNIVERSE_TEXTURES, textureUrl } from './textures';
import { UNIVERSES } from '../journey';

const dir = path.join(__dirname, '../../../public/textures');

test('every texture key points at a file that exists', () => {
  expect(ALL_TEXTURE_KEYS).toHaveLength(11);
  ALL_TEXTURE_KEYS.forEach((k) => expect(fs.existsSync(path.join(dir, TEXTURES[k]))).toBe(true));
});

test('urls are served from /textures/', () => {
  expect(textureUrl('moon')).toBe(`${process.env.PUBLIC_URL ?? ''}/textures/2k_moon.jpg`);
});

test('every universe lists only known keys, and every key is used somewhere', () => {
  expect(Object.keys(UNIVERSE_TEXTURES).sort()).toEqual([...UNIVERSES].sort());
  const used = new Set<string>(['milkyWay']); // the sky is global
  UNIVERSES.forEach((u) => UNIVERSE_TEXTURES[u].forEach((k) => {
    expect(ALL_TEXTURE_KEYS).toContain(k);
    used.add(k);
  }));
  expect([...used].sort()).toEqual([...ALL_TEXTURE_KEYS].sort());
});
```

  Run `CI=true npx react-scripts test --watchAll=false src/multiverse/fx/textures`. Expected: FAIL (module not found).

- [ ] **Step 4: Implement `src/multiverse/fx/textures.ts`**

```ts
// fx/textures.ts — the shared planet maps (Solar System Scope, CC BY 4.0) and where each universe uses them
import { UniverseId } from '../journey';

export const TEXTURES = {
  sun: '2k_sun.jpg',
  earthDay: '2k_earth_daymap.jpg',
  earthNight: '2k_earth_nightmap.jpg',
  earthClouds: '2k_earth_clouds.jpg',
  moon: '2k_moon.jpg',
  mars: '2k_mars.jpg',
  jupiter: '2k_jupiter.jpg',
  saturn: '2k_saturn.jpg',
  saturnRing: '2k_saturn_ring_alpha.png',
  neptune: '2k_neptune.jpg',
  milkyWay: '2k_stars_milky_way.jpg',
} as const;

export type TextureKey = keyof typeof TEXTURES;
export const ALL_TEXTURE_KEYS = Object.keys(TEXTURES) as TextureKey[];

export const textureUrl = (key: TextureKey) => `${process.env.PUBLIC_URL ?? ''}/textures/${TEXTURES[key]}`;

/** Which maps each universe draws (the Milky Way sky is global). One request per file, shared everywhere. */
export const UNIVERSE_TEXTURES: Record<UniverseId, TextureKey[]> = {
  home: ['sun', 'earthDay', 'earthNight', 'earthClouds', 'jupiter', 'moon', 'mars', 'saturn', 'saturnRing', 'neptune'],
  about: ['earthDay', 'earthNight', 'earthClouds', 'moon'],
  skills: ['jupiter', 'moon'],
  certifications: ['moon'],
  work: ['saturn', 'saturnRing', 'jupiter', 'mars'],
  projects: [],
  contact: ['moon', 'earthDay', 'earthNight', 'earthClouds'],
};
```

  Run the test. Expected: PASS (3 tests). Run the full suite.

- [ ] **Step 5: Commit** (restore build/ first)

```bash
git add public/textures src/multiverse/fx/textures.ts src/multiverse/fx/textures.test.ts
git commit -m "feat(multiverse): NASA-based planet maps (Solar System Scope, CC BY 4.0) and texture manifest"
```

---

### Task 2: Pure helpers: star colour and rock shape

**Files:**
- Create: `src/multiverse/fx/starColor.ts` and `.test.ts`, `src/multiverse/fx/rock.ts` and `.test.ts`

**Interfaces:**
- Produces:
  - `starColor(kelvin: number): [number, number, number]`, giving 0..1 sRGB-ish values
  - `displaceRock(positions: Float32Array, seed: number, amount: number): void`, which mutates positions in place. It is deterministic per seed and depends only on each vertex's direction, so duplicated vertices stay identical.

- [ ] **Step 1: Write the failing tests**

`src/multiverse/fx/starColor.test.ts`:

```ts
import { starColor } from './starColor';

test('cool stars are orange-red, sun-like stars near white, hot stars blue-white', () => {
  const [r1, g1, b1] = starColor(1500);
  expect(r1).toBe(1);
  expect(g1).toBeLessThan(0.6);
  expect(b1).toBeLessThan(0.3);
  starColor(6600).forEach((v) => expect(v).toBeGreaterThan(0.9));
  const [r3, , b3] = starColor(10000);
  expect(b3).toBe(1);
  expect(r3).toBeLessThan(0.85);
});

test('blueness rises with temperature and inputs are clamped', () => {
  let last = -Infinity;
  for (let k = 2000; k <= 20000; k += 1000) {
    const [r, , b] = starColor(k);
    const ratio = b / r;
    expect(ratio).toBeGreaterThanOrEqual(last);
    last = ratio;
  }
  expect(starColor(-5)).toEqual(starColor(1000));
  expect(starColor(1e9)).toEqual(starColor(40000));
});
```

`src/multiverse/fx/rock.test.ts`:

```ts
import { displaceRock } from './rock';

const sphere = () => {
  // 3 directions, the first duplicated (like non-indexed geometry), radius 1
  return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0]);
};
const radii = (p: Float32Array) => Array.from({ length: p.length / 3 }, (_, i) => Math.hypot(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]));

test('deterministic per seed, different across seeds', () => {
  const a = sphere();
  const b = sphere();
  const c = sphere();
  displaceRock(a, 7, 0.3);
  displaceRock(b, 7, 0.3);
  displaceRock(c, 8, 0.3);
  expect(Array.from(a)).toEqual(Array.from(b));
  expect(Array.from(a)).not.toEqual(Array.from(c));
});

test('radii stay within 1 ± amount and duplicated vertices stay welded', () => {
  const p = sphere();
  displaceRock(p, 3, 0.25);
  radii(p).forEach((r) => {
    expect(r).toBeGreaterThanOrEqual(0.75 - 1e-6);
    expect(r).toBeLessThanOrEqual(1.25 + 1e-6);
  });
  expect([p[0], p[1], p[2]]).toEqual([p[9], p[10], p[11]]);
});
```

  Run `CI=true npx react-scripts test --watchAll=false src/multiverse/fx/starColor src/multiverse/fx/rock`. Expected: FAIL.

- [ ] **Step 2: Implement `src/multiverse/fx/starColor.ts`**

```ts
/** Approximate blackbody colour (Tanner Helland's fit), 1000–40000 K, as 0..1 RGB. */
export function starColor(kelvin: number): [number, number, number] {
  const t = Math.min(40000, Math.max(1000, kelvin)) / 100;
  let r: number;
  let g: number;
  let b: number;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  const c = (v: number) => Math.min(255, Math.max(0, v)) / 255;
  return [c(r), c(g), c(b)];
}
```

- [ ] **Step 3: Implement `src/multiverse/fx/rock.ts`**

```ts
// Deterministic lumpy-rock displacement: a sum of a few random directional waves, so it depends
// only on a vertex's direction (duplicated vertices of non-indexed geometry stay welded).
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WAVES = 5;

export function displaceRock(positions: Float32Array, seed: number, amount: number): void {
  const rand = mulberry32(seed);
  const waves = Array.from({ length: WAVES }, () => {
    const z = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - z * z);
    return { x: s * Math.cos(a), y: s * Math.sin(a), z, freq: 1.5 + rand() * 3.5, phase: rand() * Math.PI * 2, amp: 0.4 + rand() * 0.6 };
  });
  const total = waves.reduce((sum, w) => sum + w.amp, 0);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    const r = Math.hypot(x, y, z) || 1;
    const dx = x / r;
    const dy = y / r;
    const dz = z / r;
    let f = 0;
    for (const w of waves) f += w.amp * Math.cos(w.freq * (dx * w.x + dy * w.y + dz * w.z) * Math.PI + w.phase);
    const k = 1 + amount * (f / total);
    positions[i] = x * k;
    positions[i + 1] = y * k;
    positions[i + 2] = z * k;
  }
}
```

  Run the tests. Expected: PASS. Run the full suite and tsc.

- [ ] **Step 4: Commit**

```bash
git add src/multiverse/fx/starColor.ts src/multiverse/fx/starColor.test.ts src/multiverse/fx/rock.ts src/multiverse/fx/rock.test.ts
git commit -m "feat(multiverse): blackbody star colours and deterministic rock shapes"
```

---

### Task 3: Real body shaders, RealPlanet (relief, atmosphere, ring and ring shadows), texture fallback, and real-shots.js

**Files:**
- Create: `src/multiverse/fx/useRealTextures.ts`, `src/multiverse/fx/WithTextures.tsx`, `src/multiverse/fx/realShaders.ts`, `src/multiverse/fx/RealPlanet.tsx`, `$SCRATCH/shots/real-shots.js`

**Interfaces:**
- Consumes: `TextureKey`, `textureUrl` (Task 1); `Planet`, `Palette`, `Vec3` (existing); `noise` from `fx/shaders.ts` (existing).
- Produces:
  - `useRealTextures(keys: TextureKey[]): THREE.Texture[]`
  - `WithTextures({ fallback, children })`
  - shaders `bodyShader`, `ringShader`, `atmosphereShader`, `earthShader`, `cloudShader`, `sunShader2`
  - `BodyProps`: `{ radius; lightPos: Vec3; highlight?; position?; tilt?; spin?; onPointerOver?; onPointerOut?; onClick?; fallback: Palette }`
  - `RealPlanet(props: BodyProps & { map: TextureKey; atmos?: string; atmosStrength?: number; bump?: number; ring?: boolean })`
  - `Atmosphere({ radius, color, lightPos, strength? })`
  - `bodyUniforms(tex, lightPos, { atmos?, atmosStrength?, bump? })`
  - `RING_INNER = 1.24`, `RING_OUTER = 2.27`
  - the headless script `real-shots.js`

- [ ] **Step 1: Create `src/multiverse/fx/useRealTextures.ts`**

```ts
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { TextureKey, textureUrl } from './textures';

const prepare = (t: THREE.Texture) => {
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
};

/** Suspends until the maps load (one request per file, cached and shared); throws if one fails. */
export function useRealTextures(keys: TextureKey[]): THREE.Texture[] {
  return useTexture(keys.map(textureUrl), (t) => (Array.isArray(t) ? t : [t]).forEach(prepare)) as THREE.Texture[];
}
```

- [ ] **Step 2: Create `src/multiverse/fx/WithTextures.tsx`**

```tsx
import React, { Suspense } from 'react';

interface Props { fallback: React.ReactNode; children: React.ReactNode }

class TextureBoundary extends React.Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // A missing or blocked image: keep the procedural look instead of failing the whole scene.
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Renders `fallback` while the children's textures load, and permanently if one fails. */
export const WithTextures: React.FC<Props> = ({ fallback, children }) => (
  <TextureBoundary fallback={fallback}>
    <Suspense fallback={fallback}>{children}</Suspense>
  </TextureBoundary>
);
```

- [ ] **Step 3: Create `src/multiverse/fx/realShaders.ts`**

```ts
// fx/realShaders.ts — photoreal bodies lit from an explicit world-space light (uLightPos)
import { noise } from './shaders';

const bodyVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vAxis;
varying vec3 vPos;
void main(){
  vUv=uv;
  vPos=position;
  vec4 wp=modelMatrix*vec4(position,1.0);
  vWorldPos=wp.xyz;
  vNormal=normalize(mat3(modelMatrix)*normal);
  vAxis=normalize(mat3(modelMatrix)*vec3(0.0,1.0,0.0));
  gl_Position=projectionMatrix*viewMatrix*wp;
}`;

const bodyVaryings = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vAxis;
varying vec3 vPos;
float lum(vec3 c){return dot(c,vec3(0.299,0.587,0.114));}
// East (T) / north (B) on the sphere from the body's spin axis, for map-derived relief.
void sphereFrame(vec3 N, vec3 axis, out vec3 T, out vec3 B){
  vec3 up=abs(dot(N,axis))>0.999?vec3(1.0,0.0,0.0):axis;
  T=normalize(cross(up,N));
  B=cross(N,T);
}
float rimOf(vec3 N){
  vec3 V=normalize(cameraPosition-vWorldPos);
  return pow(1.0-max(dot(V,N),0.0),3.0);
}`;

export const bodyShader = {
  vertexShader: bodyVertex,
  fragmentShader: /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uLightPos;
uniform vec3 uAtmos;
uniform float uAtmosStrength;
uniform float uBump;
uniform float uHover;
uniform vec2 uTexel;
uniform float uHasRing;
uniform sampler2D uRingMap;
uniform vec3 uRingCenter;
uniform vec3 uRingNormal;
uniform float uRingInner;
uniform float uRingOuter;
${bodyVaryings}
void main(){
  vec3 albedo=texture2D(uMap,vUv).rgb;
  vec3 N=normalize(vNormal);
  vec3 T; vec3 B; sphereFrame(N,vAxis,T,B);
  float h0=lum(albedo);
  float hu=lum(texture2D(uMap,vUv+vec2(uTexel.x,0.0)).rgb);
  float hv=lum(texture2D(uMap,vUv+vec2(0.0,uTexel.y)).rgb);
  vec3 Nb=normalize(N-uBump*((hu-h0)*T+(hv-h0)*B));
  vec3 L=normalize(uLightPos-vWorldPos);
  float diff=max(dot(Nb,L),0.0)*smoothstep(-0.05,0.12,dot(N,L));
  vec3 col=albedo*(0.012+diff*0.95);
  if(uHasRing>0.5){
    float d=dot(L,uRingNormal);
    if(abs(d)>0.001){
      float t=dot(uRingCenter-vWorldPos,uRingNormal)/d;
      if(t>0.0){
        float r=length(vWorldPos+L*t-uRingCenter);
        float k=(r-uRingInner)/(uRingOuter-uRingInner);
        if(k>0.0&&k<1.0) col*=1.0-0.8*texture2D(uRingMap,vec2(k,0.5)).a;
      }
    }
  }
  float rim=rimOf(N);
  col+=uAtmos*rim*(uAtmosStrength*smoothstep(-0.25,0.45,dot(N,L))+uHover*1.2);
  gl_FragColor=vec4(col,1.0);
  #include <colorspace_fragment>
}`,
};

export const ringShader = {
  vertexShader: /* glsl */ `
varying vec2 vLocal;
varying vec3 vWorldPos;
void main(){
  vLocal=position.xy;
  vec4 wp=modelMatrix*vec4(position,1.0);
  vWorldPos=wp.xyz;
  gl_Position=projectionMatrix*viewMatrix*wp;
}`,
  fragmentShader: /* glsl */ `
uniform sampler2D uRingMap;
uniform float uInner;
uniform float uOuter;
uniform vec3 uLightPos;
uniform vec3 uCenter;
uniform float uRadius;
varying vec2 vLocal;
varying vec3 vWorldPos;
void main(){
  float k=(length(vLocal)-uInner)/(uOuter-uInner);
  if(k<0.0||k>1.0) discard;
  vec4 ring=texture2D(uRingMap,vec2(k,0.5));
  vec3 L=normalize(uLightPos-vWorldPos);
  vec3 oc=vWorldPos-uCenter;
  float b=dot(oc,L);
  float c=dot(oc,oc)-uRadius*uRadius;
  float lit=(b<0.0&&b*b-c>0.0)?0.08:1.0; // the planet shades the ring behind it
  gl_FragColor=vec4(ring.rgb*0.9*lit,ring.a);
  #include <colorspace_fragment>
}`,
};

export const atmosphereShader = {
  vertexShader: /* glsl */ `
varying vec3 vWorldPos;
varying vec3 vViewNormal;
void main(){
  vec4 wp=modelMatrix*vec4(position,1.0);
  vWorldPos=wp.xyz;
  vViewNormal=normalize(normalMatrix*normal);
  gl_Position=projectionMatrix*viewMatrix*wp;
}`,
  fragmentShader: /* glsl */ `
uniform vec3 uColor;
uniform vec3 uLightPos;
uniform vec3 uCenter;
uniform float uStrength;
varying vec3 vWorldPos;
varying vec3 vViewNormal;
void main(){
  float halo=pow(max(0.0,0.72-vViewNormal.z),3.0);
  float day=smoothstep(-0.35,0.5,dot(normalize(vWorldPos-uCenter),normalize(uLightPos-uCenter)));
  gl_FragColor=vec4(uColor*halo*day*uStrength,1.0);
  #include <colorspace_fragment>
}`,
};

export const earthShader = {
  vertexShader: bodyVertex,
  fragmentShader: /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform vec3 uLightPos;
uniform vec3 uAtmos;
uniform float uHover;
${bodyVaryings}
void main(){
  vec3 N=normalize(vNormal);
  vec3 L=normalize(uLightPos-vWorldPos);
  float ndl=dot(N,L);
  vec3 day=texture2D(uDay,vUv).rgb;
  vec3 night=texture2D(uNight,vUv).rgb;
  vec3 dayCol=day*(0.012+max(ndl,0.0)*0.95);
  float water=smoothstep(0.02,0.1,day.b-max(day.r,day.g))*(1.0-smoothstep(0.3,0.5,lum(day)));
  vec3 V=normalize(cameraPosition-vWorldPos);
  vec3 H=normalize(L+V);
  float glint=pow(max(dot(N,H),0.0),70.0)*water*step(0.0,ndl)*0.8;
  vec3 col=mix(night*vec3(1.0,0.8,0.55)*1.8,dayCol,smoothstep(-0.15,0.15,ndl))+vec3(1.0,0.96,0.88)*glint;
  float rim=rimOf(N);
  col+=uAtmos*rim*(0.9*smoothstep(-0.25,0.45,ndl)+uHover*1.2);
  gl_FragColor=vec4(col,1.0);
  #include <colorspace_fragment>
}`,
};

export const cloudShader = {
  vertexShader: bodyVertex,
  fragmentShader: /* glsl */ `
uniform sampler2D uClouds;
uniform vec3 uLightPos;
${bodyVaryings}
void main(){
  float a=lum(texture2D(uClouds,vUv).rgb);
  vec3 N=normalize(vNormal);
  vec3 L=normalize(uLightPos-vWorldPos);
  float diff=max(dot(N,L),0.0);
  gl_FragColor=vec4(vec3(0.015+diff*0.95),a*0.85);
  #include <colorspace_fragment>
}`,
};

export const sunShader2 = {
  vertexShader: bodyVertex,
  fragmentShader: /* glsl */ `
uniform sampler2D uMap;
uniform float uTime;
${bodyVaryings}
${noise}
void main(){
  vec3 base=texture2D(uMap,vUv+vec2(uTime*0.002,0.0)).rgb;
  float flick=1.0+0.18*snoise(normalize(vPos)*3.0+vec3(uTime*0.15));
  vec3 N=normalize(vNormal);
  vec3 V=normalize(cameraPosition-vWorldPos);
  float limb=mix(0.55,1.0,pow(max(dot(V,N),0.0),0.45)); // real limb darkening
  gl_FragColor=vec4(base*flick*limb*2.6,1.0);
  #include <colorspace_fragment>
}`,
};
```

- [ ] **Step 4: Create `src/multiverse/fx/RealPlanet.tsx`**

```tsx
// fx/RealPlanet.tsx — a photo-mapped planet lit by its universe's star, with relief, atmosphere and optional ring
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { Planet } from './Planet';
import { Palette } from './palettes';
import { Vec3 } from '../journey';
import { TextureKey } from './textures';
import { useRealTextures } from './useRealTextures';
import { WithTextures } from './WithTextures';
import { atmosphereShader, bodyShader, ringShader } from './realShaders';

export const RING_INNER = 1.24;
export const RING_OUTER = 2.27;

export interface BodyProps {
  radius: number;
  /** World-space position of the star that lights this body. */
  lightPos: Vec3;
  highlight?: number;
  position?: Vec3;
  tilt?: number;
  spin?: number;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  /** Procedural colours shown while the image loads, or if it fails. */
  fallback: Palette;
}

export interface RealPlanetProps extends BodyProps {
  map: TextureKey;
  atmos?: string;
  atmosStrength?: number;
  bump?: number;
  ring?: boolean;
}

export function bodyUniforms(tex: THREE.Texture, [lx, ly, lz]: Vec3, o: { atmos?: string; atmosStrength?: number; bump?: number } = {}) {
  const img = tex.image as { width?: number; height?: number } | undefined;
  return {
    uMap: { value: tex },
    uLightPos: { value: new THREE.Vector3(lx, ly, lz) },
    uAtmos: { value: new THREE.Color(o.atmos ?? '#000000') },
    uAtmosStrength: { value: o.atmos ? o.atmosStrength ?? 0.6 : 0 },
    uBump: { value: o.bump ?? 1.5 },
    uHover: { value: 0 },
    uTexel: { value: new THREE.Vector2(1 / (img?.width || 2048), 1 / (img?.height || 1024)) },
    uHasRing: { value: 0 },
    uRingMap: { value: tex },
    uRingCenter: { value: new THREE.Vector3() },
    uRingNormal: { value: new THREE.Vector3(0, 1, 0) },
    uRingInner: { value: 0 },
    uRingOuter: { value: 0 },
  };
}

/** Thin glowing shell, brightest on the lit limb (Earth-blue, Mars-orange, …). */
export const Atmosphere: React.FC<{ radius: number; color: string; lightPos: Vec3; strength?: number }> = ({ radius, color, lightPos, strength = 0.6 }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const [lx, ly, lz] = lightPos;
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(color) }, uLightPos: { value: new THREE.Vector3(lx, ly, lz) }, uCenter: { value: new THREE.Vector3() }, uStrength: { value: strength } }),
    [color, lx, ly, lz, strength]
  );
  useFrame(() => mesh.current.getWorldPosition(uniforms.uCenter.value));
  return (
    <mesh ref={mesh} scale={1.08} raycast={() => null}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial args={[atmosphereShader]} uniforms={uniforms} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
};

const RealPlanetBody: React.FC<RealPlanetProps> = ({
  radius, lightPos, highlight = 0, position, tilt = 0.2, spin = 0.08, map, atmos, atmosStrength = 0.6, bump = 1.5, ring,
  onPointerOver, onPointerOut, onClick,
}) => {
  const [tex, ringTex] = useRealTextures(ring ? [map, 'saturnRing'] : [map]);
  const body = useRef<THREE.Mesh>(null!);
  const ringMesh = useRef<THREE.Mesh>(null!);
  const [lx, ly, lz] = lightPos;
  const uniforms = useMemo(() => {
    const u = bodyUniforms(tex, [lx, ly, lz], { atmos, atmosStrength, bump });
    if (ring && ringTex) {
      u.uHasRing.value = 1;
      u.uRingMap.value = ringTex;
    }
    return u;
  }, [tex, ringTex, ring, lx, ly, lz, atmos, atmosStrength, bump]);
  const ringUniforms = useMemo(
    () => ({
      uRingMap: { value: ringTex ?? tex },
      uInner: { value: radius * RING_INNER },
      uOuter: { value: radius * RING_OUTER },
      uLightPos: { value: new THREE.Vector3(lx, ly, lz) },
      uCenter: { value: new THREE.Vector3() },
      uRadius: { value: radius },
    }),
    [ringTex, tex, radius, lx, ly, lz]
  );
  const scale = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    easing.damp(uniforms.uHover, 'value', highlight, 0.2, dt);
    body.current.rotation.y += dt * spin;
    easing.damp3(body.current.scale, 1 + highlight * 0.25, 0.2, dt);
    if (ring) {
      const m = ringMesh.current;
      m.getWorldPosition(uniforms.uRingCenter.value);
      ringUniforms.uCenter.value.copy(uniforms.uRingCenter.value);
      m.getWorldDirection(uniforms.uRingNormal.value);
      const s = m.getWorldScale(scale).x;
      uniforms.uRingInner.value = radius * RING_INNER * s;
      uniforms.uRingOuter.value = radius * RING_OUTER * s;
      ringUniforms.uRadius.value = radius * s * body.current.scale.x;
    }
  });

  return (
    <group position={position}>
      <group rotation-z={tilt}>
        <mesh ref={body} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
          <sphereGeometry args={[radius, 64, 64]} />
          <shaderMaterial args={[bodyShader]} uniforms={uniforms} />
        </mesh>
        {ring && (
          <mesh ref={ringMesh} rotation-x={-Math.PI / 2} raycast={() => null}>
            <ringGeometry args={[radius * RING_INNER, radius * RING_OUTER, 128]} />
            <shaderMaterial args={[ringShader]} uniforms={ringUniforms} transparent side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        )}
      </group>
      {atmos && atmosStrength > 0 && <Atmosphere radius={radius} color={atmos} lightPos={lightPos} strength={atmosStrength} />}
    </group>
  );
};

export const RealPlanet: React.FC<RealPlanetProps> = (props) => (
  <WithTextures
    fallback={
      <Planet
        radius={props.radius}
        palette={props.fallback}
        bands={8}
        lightPos={props.lightPos}
        highlight={props.highlight}
        ring={props.ring}
        position={props.position}
        onPointerOver={props.onPointerOver}
        onPointerOut={props.onPointerOut}
        onClick={props.onClick}
      />
    }
  >
    <RealPlanetBody {...props} />
  </WithTextures>
);
```

- [ ] **Step 5: Create `$SCRATCH/shots/real-shots.js`.** It is shared by later tasks, and its modes are explained in the header comment.

```js
// node real-shots.js shots [hash,hash,...]   → real/<hash>.jpg for each universe ('' = home)
// node real-shots.js parallax [hash]         → two shots with the pointer at opposite corners + mean pixel diff
// node real-shots.js block <file> [hash]     → that image request is aborted; expect no page error and a rendered scene
// node real-shots.js home-click              → click the Home "Projects" planet; expect hash #projects
// node real-shots.js portal                  → the About portal disc seen from Home's exit step
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:3005/';
const OUT = __dirname + '/real';
fs.mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ALL = ['', 'about', 'skills', 'certifications', 'work', 'projects', 'contact'];
let failures = 0;
const fail = (m) => { failures++; console.log('FAIL', m); };

async function open(b, hash, block) {
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 800 });
  await p.evaluateOnNewDocument(() => {
    const o = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, a) { return o.call(this, t, Object.assign({}, a, { preserveDrawingBuffer: true })); };
  });
  const errors = [];
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  if (block) {
    await p.setRequestInterception(true);
    p.on('request', (r) => (r.url().includes(block) ? r.abort() : r.continue()));
  }
  await p.goto(BASE + (hash ? '#' + hash : ''), { waitUntil: 'networkidle0', timeout: 180000 });
  await wait(14000);
  return { p, errors };
}
const shot = async (p, name) => {
  const d = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/jpeg', 0.9));
  fs.writeFileSync(`${OUT}/${name || 'home'}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
};
const meanLuma = (p) => p.evaluate(() => {
  const c = document.querySelector('canvas');
  const o = document.createElement('canvas');
  o.width = 160; o.height = 100;
  const g = o.getContext('2d');
  g.drawImage(c, 0, 0, 160, 100);
  const d = g.getImageData(0, 0, 160, 100).data;
  let s = 0;
  for (let i = 0; i < d.length; i += 4) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  return s / (d.length / 4);
});

(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const [mode = 'shots', a1, a2] = process.argv.slice(2);
  if (mode === 'shots') {
    for (const h of a1 ? a1.split(',') : ALL) {
      const { p, errors } = await open(b, h);
      await shot(p, h);
      const pe = errors.filter((e) => e.startsWith('pageerror'));
      if (pe.length) fail(`${h || 'home'}: ${pe.join(' | ')}`);
      console.log(`${h || 'home'}: saved ${OUT}/${h || 'home'}.jpg, mean luma ${(await meanLuma(p)).toFixed(1)}, errors ${errors.length}`);
      await p.close();
    }
  } else if (mode === 'parallax') {
    const { p } = await open(b, a1 || 'work');
    await p.mouse.move(20, 20); await wait(3000);
    await p.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = 320; o.height = 200; o.getContext('2d').drawImage(c, 0, 0, 320, 200); window.__a = o.getContext('2d').getImageData(0, 0, 320, 200).data; });
    await shot(p, 'parallax-a');
    await p.mouse.move(1260, 780); await wait(3000);
    const diff = await p.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = 320; o.height = 200; o.getContext('2d').drawImage(c, 0, 0, 320, 200); const b2 = o.getContext('2d').getImageData(0, 0, 320, 200).data; let s = 0; for (let i = 0; i < b2.length; i += 4) s += Math.abs(b2[i] - window.__a[i]) + Math.abs(b2[i + 1] - window.__a[i + 1]) + Math.abs(b2[i + 2] - window.__a[i + 2]); return s / (b2.length / 4) / 3; });
    await shot(p, 'parallax-b');
    console.log('parallax mean pixel diff', diff.toFixed(2));
    if (diff <= 4) fail(`parallax too small: ${diff.toFixed(2)}`);
  } else if (mode === 'block') {
    const { p, errors } = await open(b, a2 || 'skills', a1);
    await shot(p, `blocked-${(a2 || 'skills')}`);
    const pe = errors.filter((e) => e.startsWith('pageerror'));
    const luma = await meanLuma(p);
    if (pe.length) fail(`blocked ${a1}: ${pe.join(' | ')}`);
    if (luma < 2) fail(`blocked ${a1}: scene looks blank (mean luma ${luma.toFixed(1)})`);
    console.log(`blocked ${a1}: page errors ${pe.length}, mean luma ${luma.toFixed(1)}`);
  } else if (mode === 'home-click') {
    const { p } = await open(b, '');
    let hit = false;
    for (let y = 120; y < 700 && !hit; y += 20) {
      for (let x = 80; x < 1200 && !hit; x += 20) {
        await p.mouse.move(x, y);
        const label = await p.evaluate(() => [...document.querySelectorAll('.mv-label')].map((e) => e.textContent).join('|'));
        if (/Everything I've made/.test(label)) {
          await p.mouse.click(x, y);
          await wait(6000);
          hit = (await p.evaluate(() => location.hash)) === '#projects';
        }
      }
    }
    if (!hit) fail('could not click the Projects planet on Home');
    console.log('home-click', hit ? 'ok' : 'failed');
  } else if (mode === 'portal') {
    const { p } = await open(b, '');
    await p.keyboard.press('ArrowDown');
    await wait(5000);
    await shot(p, 'portal');
    console.log('portal shot saved');
  }
  console.log(failures ? `${failures} FAILURE(S)` : 'ALL REAL CHECKS PASSED');
  await b.close();
})();
```

- [ ] **Step 6: Verify, using a temporary harness.**
  - No universe uses RealPlanet yet. To exercise it, temporarily add to `src/multiverse/universes/HomeUniverse.tsx`, inside the returned group: `<RealPlanet radius={2} map="jupiter" ring atmos="#f0dcb4" atmosStrength={0.3} lightPos={[0, 0, 0]} position={[0, 4, -6]} fallback={PALETTES.skills} />` (import it).
  - Run tsc, the tests and the CI build.
  - Serve and run `node real-shots.js shots ''`. Read `real/home.jpg`: a ringed, banded, photo-textured sphere, lit on the sun side and dark on the far side, with the ring shadow band.
  - Run `node real-shots.js block 2k_jupiter.jpg ''`. Expected: no page errors, scene not blank, and the procedural planet visible in its place in `real/blocked-.jpg`.
  - **Remove the temporary harness lines**, then rebuild and confirm `Compiled successfully.`
  - Stop the server and restore build/.

- [ ] **Step 7: Commit**

```bash
git add src/multiverse/fx/useRealTextures.ts src/multiverse/fx/WithTextures.tsx src/multiverse/fx/realShaders.ts src/multiverse/fx/RealPlanet.tsx
git commit -m "feat(multiverse): photoreal planet body with relief, atmosphere, ring shadows and texture fallback"
```

---

### Task 4: Earth, Sun, the Milky Way sky, lighting and bloom, and camera depth

**Files:**
- Create: `src/multiverse/fx/RealEarth.tsx`, `src/multiverse/fx/RealSun.tsx`, `src/multiverse/fx/MilkyWaySky.tsx`
- Modify: `src/multiverse/fx/SceneLights.tsx`, `src/multiverse/fx/PostFX.tsx`, `src/multiverse/fx/Starfield.tsx`, `src/multiverse/fx/Portal.tsx`, `src/multiverse/camera/CameraRig.tsx`, `src/multiverse/Multiverse.tsx`

**Interfaces:**
- Consumes:
  - `BodyProps`, `Atmosphere`, `WithTextures`, `useRealTextures` (Task 3)
  - `earthShader`, `cloudShader`, `sunShader2` (Task 3)
  - `GlowSprite`, `Planet`, `sunShader` (existing)
  - `UNIVERSES`, `UniverseId`, `WARMUP_MS` (journey)
  - `useJourney` (store)
- Produces:
  - `RealEarth(props: BodyProps)`
  - `RealSun({ radius, ignite? })`, where `ignite` grows the sun in after the loader, like today's Home sun
  - `MilkyWaySky({ universe? })`: without a `universe` prop it follows the camera's current universe

- [ ] **Step 1: Create `src/multiverse/fx/RealEarth.tsx`**

```tsx
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { Planet } from './Planet';
import { Atmosphere, BodyProps } from './RealPlanet';
import { useRealTextures } from './useRealTextures';
import { WithTextures } from './WithTextures';
import { cloudShader, earthShader } from './realShaders';

const EarthBody: React.FC<BodyProps> = ({ radius, lightPos, highlight = 0, position, tilt = 0.41, spin = 0.05, onPointerOver, onPointerOut, onClick }) => {
  const [day, night, clouds] = useRealTextures(['earthDay', 'earthNight', 'earthClouds']);
  const body = useRef<THREE.Mesh>(null!);
  const sky = useRef<THREE.Mesh>(null!);
  const [lx, ly, lz] = lightPos;
  const uniforms = useMemo(
    () => ({ uDay: { value: day }, uNight: { value: night }, uLightPos: { value: new THREE.Vector3(lx, ly, lz) }, uAtmos: { value: new THREE.Color('#6ab4ff') }, uHover: { value: 0 } }),
    [day, night, lx, ly, lz]
  );
  const cloudUniforms = useMemo(() => ({ uClouds: { value: clouds }, uLightPos: { value: new THREE.Vector3(lx, ly, lz) } }), [clouds, lx, ly, lz]);
  useFrame((_, dt) => {
    easing.damp(uniforms.uHover, 'value', highlight, 0.2, dt);
    body.current.rotation.y += dt * spin;
    sky.current.rotation.y += dt * spin * 1.25;
    easing.damp3(body.current.scale, 1 + highlight * 0.25, 0.2, dt);
    sky.current.scale.copy(body.current.scale);
  });
  return (
    <group position={position}>
      <group rotation-z={tilt}>
        <mesh ref={body} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
          <sphereGeometry args={[radius, 64, 64]} />
          <shaderMaterial args={[earthShader]} uniforms={uniforms} />
        </mesh>
        <mesh ref={sky} raycast={() => null}>
          <sphereGeometry args={[radius * 1.012, 64, 64]} />
          <shaderMaterial args={[cloudShader]} uniforms={cloudUniforms} transparent depthWrite={false} />
        </mesh>
      </group>
      <Atmosphere radius={radius} color="#6ab4ff" lightPos={lightPos} strength={0.9} />
    </group>
  );
};

/** Earth: day map lit by the sun, city lights on the night side, ocean glint, drifting clouds, blue atmosphere. */
export const RealEarth: React.FC<BodyProps> = (props) => (
  <WithTextures fallback={<Planet radius={props.radius} palette={props.fallback} bands={6} lightPos={props.lightPos} highlight={props.highlight} position={props.position} onPointerOver={props.onPointerOver} onPointerOut={props.onPointerOut} onClick={props.onClick} />}>
    <EarthBody {...props} />
  </WithTextures>
);
```

- [ ] **Step 2: Create `src/multiverse/fx/RealSun.tsx`**

```tsx
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { GlowSprite } from './GlowSprite';
import { sunShader } from './shaders';
import { sunShader2 } from './realShaders';
import { useRealTextures } from './useRealTextures';
import { WithTextures } from './WithTextures';
import { WARMUP_MS } from '../journey';

// HDR corona (components above 1 are intentional)
const CORONA = new THREE.Color(1.35, 0.95, 0.6);

const useIgnite = (mesh: React.MutableRefObject<THREE.Mesh>, ignite: boolean) =>
  useFrame((state, dt) => {
    if (ignite) easing.damp3(mesh.current.scale, state.clock.elapsedTime * 1000 > WARMUP_MS ? 1 : 0.001, 1.0, dt);
    mesh.current.rotation.y += dt * 0.03;
  });

const SunBody: React.FC<{ radius: number; ignite: boolean }> = ({ radius, ignite }) => {
  const [map] = useRealTextures(['sun']);
  const mesh = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({ uMap: { value: map }, uTime: { value: 0 } }), [map]);
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });
  useIgnite(mesh, ignite);
  return (
    <mesh ref={mesh} scale={ignite ? 0.001 : 1}>
      <sphereGeometry args={[radius, 96, 96]} />
      <shaderMaterial args={[sunShader2]} uniforms={uniforms} toneMapped={false} />
    </mesh>
  );
};

const ProceduralSun: React.FC<{ radius: number; ignite: boolean }> = ({ radius, ignite }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });
  useIgnite(mesh, ignite);
  return (
    <mesh ref={mesh} scale={ignite ? 0.001 : 1}>
      <sphereGeometry args={[radius, 96, 96]} />
      <shaderMaterial args={[sunShader]} uniforms={uniforms} toneMapped={false} />
    </mesh>
  );
};

/** The Sun: real photosphere map, limb darkening, soft corona. It is the light for its universe's bodies. */
export const RealSun: React.FC<{ radius: number; ignite?: boolean }> = ({ radius, ignite = false }) => (
  <group>
    <WithTextures fallback={<ProceduralSun radius={radius} ignite={ignite} />}>
      <SunBody radius={radius} ignite={ignite} />
    </WithTextures>
    <GlowSprite color={CORONA} scale={radius * 5} />
  </group>
);
```

- [ ] **Step 3: Create `src/multiverse/fx/MilkyWaySky.tsx`**

```tsx
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { UNIVERSES, UniverseId } from '../journey';
import { useJourney } from '../store';
import { useRealTextures } from './useRealTextures';
import { WithTextures } from './WithTextures';

const SKY_BRIGHTNESS = 0.6;
/** Each universe sees the galaxy from its own angle, with a faint tint, so they never look identical. */
export const SKY: Record<UniverseId, { x: number; y: number; tint: string }> = {
  home: { x: 0.35, y: 0.0, tint: '#ffffff' },
  about: { x: -0.2, y: 1.1, tint: '#cfe3ff' },
  skills: { x: 0.6, y: 2.2, tint: '#d9fff4' },
  certifications: { x: -0.5, y: 3.0, tint: '#fff3d6' },
  work: { x: 0.15, y: 4.0, tint: '#ffe2d0' },
  projects: { x: 1.0, y: 5.0, tint: '#f1e0ff' },
  contact: { x: -0.3, y: 5.8, tint: '#d8ffe9' },
};

const SkyBody: React.FC<{ universe?: UniverseId }> = ({ universe }) => {
  const [tex] = useRealTextures(['milkyWay']);
  const group = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const tint = useMemo(() => new THREE.Color(), []);
  useFrame(({ camera }, dt) => {
    group.current.position.copy(camera.position);
    const id = universe ?? UNIVERSES[useJourney.getState().cameraUniverse] ?? 'home';
    const s = SKY[id];
    easing.damp(group.current.rotation, 'x', s.x, 0.8, dt);
    easing.damp(group.current.rotation, 'y', s.y, 0.8, dt);
    tint.set(s.tint).multiplyScalar(SKY_BRIGHTNESS);
    easing.dampC(mat.current.color, tint, 0.8, dt);
  });
  return (
    <group ref={group}>
      <mesh renderOrder={-1} raycast={() => null}>
        <sphereGeometry args={[900, 64, 32]} />
        <meshBasicMaterial ref={mat} map={tex} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** The real Milky Way at infinity; follows the camera. With `universe`, it is pinned to that universe's view (portal previews). */
export const MilkyWaySky: React.FC<{ universe?: UniverseId }> = ({ universe }) => (
  <WithTextures fallback={null}>
    <SkyBody universe={universe} />
  </WithTextures>
);
```

- [ ] **Step 4: Global tuning.**
  - `src/multiverse/fx/SceneLights.tsx`: change `<ambientLight intensity={0.45} />` to `<ambientLight intensity={0.12} />`, and update the doc comment: "Only small man-made objects use these; celestial bodies are lit by their universe's star via uLightPos."
  - `src/multiverse/fx/PostFX.tsx`: change `luminanceThreshold={0.85}` to `luminanceThreshold={1.0}`.
  - `src/multiverse/fx/Starfield.tsx`: change `saturation={0.4}` to `saturation={0.1}` (real stars are only faintly coloured).
  - `src/multiverse/Multiverse.tsx`: add `import { MilkyWaySky } from './fx/MilkyWaySky';` and render `<MilkyWaySky />` right after `<CameraRig />`, before `<Starfield />`.
  - `src/multiverse/fx/Portal.tsx`: add `import { MilkyWaySky } from './MilkyWaySky';` and, inside `<RenderTexture …>` right after `<SceneLights />`, add `<MilkyWaySky universe={universe} />`.

- [ ] **Step 5: Camera depth** (`src/multiverse/camera/CameraRig.tsx`). Replace the `target.set(…)` line with:

```ts
    // Stronger pointer parallax plus a slow idle drift, so near bodies visibly move against far ones.
    const t = state.clock.elapsedTime;
    const driftX = s.moving ? 0 : Math.sin(t * 0.11) * 1.2;
    const driftY = s.moving ? 0 : Math.cos(t * 0.09) * 0.6;
    target.set(pose.pos[0] + state.pointer.x * 2.4 + driftX, pose.pos[1] + state.pointer.y * 1.5 + driftY, pose.pos[2]);
```

- [ ] **Step 6: Verify.**
  - Run tsc, the tests and the CI build.
  - Serve, then run:
    - `node real-shots.js shots ''`: the Milky Way band should be visible behind the Home scene.
    - `node real-shots.js parallax work`: expected diff above 4. Read `real/parallax-a.jpg` and `real/parallax-b.jpg` and confirm the near planet shifts more than the sky.
    - `node real-shots.js portal`: the About portal disc shows the sky.
    - `node mv-check.js http://localhost:3005/ $SCRATCH/shots/real-mv 10`: 10 steps, then `no console errors`.
  - Stop the server and restore build/.

- [ ] **Step 7: Commit**

```bash
git add src/multiverse/fx/RealEarth.tsx src/multiverse/fx/RealSun.tsx src/multiverse/fx/MilkyWaySky.tsx src/multiverse/fx/SceneLights.tsx src/multiverse/fx/PostFX.tsx src/multiverse/fx/Starfield.tsx src/multiverse/fx/Portal.tsx src/multiverse/camera/CameraRig.tsx src/multiverse/Multiverse.tsx
git commit -m "feat(multiverse): real Earth, Sun and Milky Way sky; darker ambient, bloom only for light sources; camera depth"
```

---

### Task 5: Home (the Sun and real portal planets) and About (Earth and cratered moons)

**Files:**
- Modify: `src/multiverse/universes/HomeUniverse.tsx`, `src/multiverse/universes/AboutUniverse.tsx`

**Interfaces:**
- Consumes: `RealSun`, `RealEarth`, `RealPlanet` (Tasks 3–4); `PALETTES`, `universeOrigin`, `UNIVERSE_LABELS`, `firstStepOf`, `STEPS`, `useJourney` (existing).
- Produces: unchanged exports (`HomeUniverse`, `AboutUniverse`, `MOON_DELAY_MS`, `MOON_STAGGER_MS`).

- [ ] **Step 1: Replace `src/multiverse/universes/HomeUniverse.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, useCursor } from '@react-three/drei';
import { RealSun } from '../fx/RealSun';
import { RealEarth } from '../fx/RealEarth';
import { RealPlanet } from '../fx/RealPlanet';
import { PALETTES } from '../fx/palettes';
import { UniverseId, UNIVERSE_LABELS, Vec3, firstStepOf, universeOrigin } from '../journey';
import { useJourney } from '../store';
import { UniverseProps } from './index';

type BodyKind = 'earth' | 'jupiter' | 'moon' | 'mars' | 'saturn' | 'neptune';
interface OrbitDef { universe: UniverseId; orbit: number; size: number; speed: number; body: BodyKind; ring?: boolean; tagline: string }

const ORBITS: OrbitDef[] = [
  { universe: 'about', orbit: 7, size: 0.7, speed: 0.22, body: 'earth', tagline: 'Who I am' },
  { universe: 'skills', orbit: 9.5, size: 0.9, speed: 0.17, body: 'jupiter', tagline: 'What I build with' },
  { universe: 'certifications', orbit: 12, size: 0.6, speed: 0.13, body: 'moon', tagline: "What I've earned" },
  { universe: 'work', orbit: 14.5, size: 0.8, speed: 0.1, body: 'mars', tagline: "Where I've built" },
  { universe: 'projects', orbit: 17.5, size: 1.15, speed: 0.08, body: 'saturn', ring: true, tagline: "Everything I've made" },
  { universe: 'contact', orbit: 20.5, size: 0.85, speed: 0.06, body: 'neptune', tagline: 'Open a channel' },
];
const ATMOS: Partial<Record<BodyKind, [string, number]>> = {
  mars: ['#e8a07a', 0.35],
  jupiter: ['#f0dcb4', 0.25],
  saturn: ['#f0e0b8', 0.2],
  neptune: ['#8fb8ff', 0.6],
};
// The Sun sits at Home's origin and lights every portal planet.
const SUN: Vec3 = universeOrigin('home');

const OrbitingPlanet: React.FC<{ def: OrbitDef; index: number; active: boolean; preview?: boolean }> = ({ def, index, active, preview }) => {
  const pivot = React.useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const interactive = active && !preview;

  useCursor(hovered && interactive);
  useEffect(() => {
    if (!interactive) setHovered(false);
  }, [interactive]);

  useFrame((state) => {
    pivot.current.rotation.y = index * 1.7 + state.clock.elapsedTime * def.speed;
  });

  const handlers = {
    onPointerOver: (e: { stopPropagation: () => void }) => {
      if (!interactive) return;
      e.stopPropagation();
      setHovered(true);
    },
    onPointerOut: () => setHovered(false),
    onClick: (e: { stopPropagation: () => void }) => {
      if (!interactive) return;
      e.stopPropagation();
      useJourney.getState().jump(firstStepOf(def.universe));
    },
  };
  const highlight = hovered ? 1 : 0;
  const fallback = PALETTES[def.universe];

  return (
    <>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[def.orbit - 0.015, def.orbit + 0.015, 192]} />
        <meshBasicMaterial color="#cbd5e1" transparent opacity={hovered ? 0.45 : 0.08} side={THREE.DoubleSide} />
      </mesh>
      <group ref={pivot}>
        <group position={[def.orbit, 0, 0]}>
          {def.body === 'earth' ? (
            <RealEarth radius={def.size} lightPos={SUN} highlight={highlight} fallback={fallback} {...handlers} />
          ) : (
            <RealPlanet
              radius={def.size}
              map={def.body}
              ring={def.ring}
              atmos={ATMOS[def.body]?.[0]}
              atmosStrength={ATMOS[def.body]?.[1]}
              lightPos={SUN}
              highlight={highlight}
              fallback={fallback}
              {...handlers}
            />
          )}
          {interactive && (
            <Html center position={[0, def.size + 0.9, 0]} className="mv-label">
              <span className="mv-label__inner" style={{ display: 'inline-block', transform: hovered ? 'scale(1.15)' : 'none', transition: 'transform 0.2s' }}>
                {UNIVERSE_LABELS[def.universe]}
                {hovered && <small>{def.tagline}</small>}
              </span>
            </Html>
          )}
        </group>
      </group>
    </>
  );
};

export const HomeUniverse: React.FC<UniverseProps> = ({ active, preview }) => (
  <group rotation-x={0.08}>
    <RealSun radius={3} ignite />
    {ORBITS.map((def, i) => (
      <OrbitingPlanet key={def.universe} def={def} index={i} active={active} preview={preview} />
    ))}
  </group>
);
```

  Note: the handler parameter types are kept loose (`{ stopPropagation }`) because the same object is spread onto both `RealEarth` and `RealPlanet`, whose props take `ThreeEvent` types. If tsc rejects the spread, type the handlers as `(e: ThreeEvent<PointerEvent>)` / `(e: ThreeEvent<MouseEvent>)`, imported from `@react-three/fiber`.

- [ ] **Step 2: Replace `src/multiverse/universes/AboutUniverse.tsx`**

```tsx
import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RealEarth } from '../fx/RealEarth';
import { RealPlanet } from '../fx/RealPlanet';
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

/** A real cratered moon; it brightens and grows as its education beat is reached. */
const Moon: React.FC<{ index: number }> = ({ index }) => {
  const [lit, setLit] = useState(false);
  const litRef = useRef(false);
  const a = MOON_ANGLES[index];
  useFrame(() => {
    const s = useJourney.getState();
    const step = STEPS[s.step];
    const now = step.universe === 'about' && step.beat === 'education' && !s.moving &&
      performance.now() - s.arrivedAt > MOON_DELAY_MS + index * MOON_STAGGER_MS;
    if (now !== litRef.current) {
      litRef.current = now;
      setLit(now);
    }
  });
  return (
    <RealPlanet
      radius={0.6}
      map="moon"
      bump={2}
      atmos="#9cc9ff"
      atmosStrength={0}
      tilt={0}
      spin={0.1}
      lightPos={light}
      highlight={lit ? 1 : 0}
      position={[Math.cos(a) * ORBIT_RADIUS, 0, Math.sin(a) * ORBIT_RADIUS]}
      fallback={palette}
    />
  );
};

export const AboutUniverse: React.FC<UniverseProps> = () => (
  <>
    <RealEarth radius={4} lightPos={light} fallback={palette} />
    <group rotation={[0.35, 0, 0.12]}>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ORBIT_RADIUS - 0.02, ORBIT_RADIUS + 0.02, 192]} />
        <meshBasicMaterial color="#cbd5e1" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      {MOON_ANGLES.map((_, i) => (
        <Moon key={i} index={i} />
      ))}
    </group>
  </>
);
```

- [ ] **Step 3: Verify.**
  - Run tsc, the tests and the CI build.
  - Serve, then run:
    - `node real-shots.js shots ',about'`
    - `node real-shots.js home-click`, expecting `home-click ok`
    - `node real-shots.js portal`
    - `node mv-interact.js keyboard`
    - `node mv-check.js http://localhost:3005/ $SCRATCH/shots/real-mv 4`, expecting `no console errors`
  - Read `real/home.jpg`, `real/about.jpg` and `real/portal.jpg`:
    - **Home:** a textured, limb-darkened Sun with corona; six real planets with lit day sides facing the Sun and dark night sides; Saturn's ring; the Milky Way behind.
    - **About:** Earth with clouds, city lights on the night side, a blue atmosphere on the lit limb, four grey cratered moons, and no coloured haze.
    - **Portal disc:** the About universe, lit from the same side as the real one.
  - Stop the server and restore build/.

- [ ] **Step 4: Commit**

```bash
git add src/multiverse/universes/HomeUniverse.tsx src/multiverse/universes/AboutUniverse.tsx
git commit -m "feat(multiverse): realistic Home (Sun + real portal planets) and About (Earth + moons)"
```

---

### Task 6: Skills (Jupiter and an asteroid belt) and Certifications (the Moon and satellites)

**Files:**
- Create: `src/multiverse/fx/Asteroid.tsx`, `src/multiverse/fx/Satellite.tsx`
- Modify: `src/multiverse/universes/SkillsUniverse.tsx`, `src/multiverse/universes/CertificationsUniverse.tsx`

**Interfaces:**
- Consumes:
  - `displaceRock` (Task 2)
  - `bodyUniforms`, `RealPlanet` (Task 3)
  - `bodyShader` (Task 3)
  - `useRealTextures`, `WithTextures` (Task 3)
- Produces:
  - `Asteroid({ seed, radius, color, lightPos, position, hovered, onPointerOver, onPointerOut })`
  - `Satellite({ position?, scale? })`

- [ ] **Step 1: Create `src/multiverse/fx/Asteroid.tsx`**

```tsx
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { displaceRock } from './rock';
import { bodyUniforms } from './RealPlanet';
import { bodyShader } from './realShaders';
import { useRealTextures } from './useRealTextures';
import { WithTextures } from './WithTextures';
import { Vec3 } from '../journey';

interface AsteroidProps {
  seed: number;
  radius: number;
  /** Skill-group colour, shown as a rim glow when hovered. */
  color: string;
  lightPos: Vec3;
  position: Vec3;
  hovered: boolean;
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: () => void;
}

const useRock = (seed: number, radius: number) => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(radius, 3);
    displaceRock(g.attributes.position.array as Float32Array, seed, 0.32);
    g.computeVertexNormals();
    return g;
  }, [seed, radius]);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
};

const useTumble = (mesh: React.MutableRefObject<THREE.Mesh>, seed: number, hovered: boolean) => {
  const axis = useMemo(() => new THREE.Vector3(Math.sin(seed * 12.9), Math.cos(seed * 78.2), Math.sin(seed * 3.7)).normalize(), [seed]);
  useFrame((_, dt) => {
    mesh.current.rotateOnAxis(axis, dt * (0.25 + (seed % 5) * 0.08));
    easing.damp3(mesh.current.scale, hovered ? 1.6 : 1, 0.15, dt);
  });
};

const RockBody: React.FC<AsteroidProps> = ({ seed, radius, color, lightPos, position, hovered, onPointerOver, onPointerOut }) => {
  const [tex] = useRealTextures(['moon']);
  const geo = useRock(seed, radius);
  const mesh = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => bodyUniforms(tex, lightPos, { atmos: color, atmosStrength: 0, bump: 1.2 }), [tex, lightPos, color]);
  useTumble(mesh, seed, hovered);
  useFrame((_, dt) => easing.damp(uniforms.uHover, 'value', hovered ? 1 : 0, 0.15, dt));
  return (
    <mesh ref={mesh} geometry={geo} position={position} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <shaderMaterial args={[bodyShader]} uniforms={uniforms} />
    </mesh>
  );
};

const PlainRock: React.FC<AsteroidProps> = ({ seed, radius, position, hovered, onPointerOver, onPointerOut }) => {
  const geo = useRock(seed, radius);
  const mesh = useRef<THREE.Mesh>(null!);
  useTumble(mesh, seed, hovered);
  return (
    <mesh ref={mesh} geometry={geo} position={position} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <meshStandardMaterial color="#8a8580" roughness={0.95} />
    </mesh>
  );
};

/** A tumbling, lumpy rock with a real lunar surface; one per skill. */
export const Asteroid: React.FC<AsteroidProps> = (props) => (
  <WithTextures fallback={<PlainRock {...props} />}>
    <RockBody {...props} />
  </WithTextures>
);
```

- [ ] **Step 2: Create `src/multiverse/fx/Satellite.tsx`**

```tsx
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Vec3 } from '../journey';

/** A small spacecraft: gold-foil body, two blue solar panels on a truss, an antenna dish. Lit by SceneLights. */
export const Satellite: React.FC<{ position?: Vec3; scale?: number }> = ({ position, scale = 1 }) => {
  const g = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    g.current.rotation.y += dt * 0.25;
  });
  return (
    <group ref={g} position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[0.7, 0.7, 1.1]} />
        <meshStandardMaterial color="#c9a227" metalness={1} roughness={0.35} />
      </mesh>
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.04, 0.04, 3.2, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.4} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.55, 0, 0]}>
          <boxGeometry args={[2.0, 0.04, 0.8]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.35} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.75]} rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.32, 0.25, 20, 1, true]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
```

- [ ] **Step 3: Replace `src/multiverse/universes/SkillsUniverse.tsx`**

```tsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { RealPlanet } from '../fx/RealPlanet';
import { Asteroid } from '../fx/Asteroid';
import { PALETTES } from '../fx/palettes';
import { skills, SkillGroup } from '../../data/portfolio';
import { ringLayout } from './layout';
import { Vec3, universeOrigin } from '../journey';
import { UniverseProps } from './index';

export const SKILL_COLORS: Record<SkillGroup, string> = {
  Frontend: '#38bdf8',
  Backend: '#f97316',
  Database: '#a3e635',
  'Cloud & DevOps': '#c084fc',
  Tools: '#f472b6',
};

const positions = ringLayout(skills.length, 12);
const origin = universeOrigin('skills');
const light: Vec3 = [origin[0] + 30, origin[1] + 18, origin[2] + 26];

const SkillRock: React.FC<{ name: string; color: string; position: Vec3; interactive: boolean; seed: number }> = ({ name, color, position, interactive, seed }) => {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!interactive) setHovered(false);
  }, [interactive]);
  return (
    <group position={position}>
      <Asteroid
        seed={seed}
        radius={0.7}
        color={color}
        lightPos={light}
        position={[0, 0, 0]}
        hovered={hovered}
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      />
      {interactive && hovered && (
        <Html center position={[0, 1.5, 0]} className="mv-label">{name}</Html>
      )}
    </group>
  );
};

export const SkillsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const belt = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    belt.current.rotation.y += dt * 0.05;
  });
  return (
    <>
      <RealPlanet radius={2.8} map="jupiter" atmos="#f0dcb4" atmosStrength={0.25} tilt={0.05} spin={0.12} lightPos={light} fallback={PALETTES.skills} />
      <group ref={belt}>
        {skills.map((s, i) => (
          <SkillRock key={s.name} name={s.name} color={SKILL_COLORS[s.group]} position={positions[i]} interactive={active && !preview} seed={i + 1} />
        ))}
      </group>
    </>
  );
};
```

  Note: the asteroids' world positions move with the belt's rotation, and the shader computes lighting in world space, so their lit sides always face the light.

- [ ] **Step 4: Replace `src/multiverse/universes/CertificationsUniverse.tsx`**

```tsx
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { RealPlanet } from '../fx/RealPlanet';
import { Satellite } from '../fx/Satellite';
import { PALETTES } from '../fx/palettes';
import { certifications } from '../../data/portfolio';
import { Vec3, universeOrigin } from '../journey';
import { UniverseProps } from './index';

const RADIUS = 8;
const origin = universeOrigin('certifications');
const light: Vec3 = [origin[0] + 24, origin[1] + 14, origin[2] + 22];

export const CertificationsUniverse: React.FC<UniverseProps> = ({ active, preview }) => {
  const orbit = useRef<THREE.Group>(null!);
  const box = useMemo(() => new THREE.BoxGeometry(3.2, 2.2, 0.08), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(box), [box]);
  useEffect(() => () => box.dispose(), [box]);
  useEffect(() => () => edges.dispose(), [edges]);

  useFrame((_, dt) => {
    orbit.current.rotation.y += dt * 0.12;
  });

  return (
    <>
      <RealPlanet radius={2.6} map="moon" bump={2} tilt={0.1} spin={0.04} lightPos={light} fallback={PALETTES.certifications} />
      <group ref={orbit}>
        {certifications.map((c, i) => {
          const a = (i / certifications.length) * Math.PI * 2;
          return (
            <group key={c.title} position={[Math.cos(a) * RADIUS, Math.sin(a * 2) * 1.2, Math.sin(a) * RADIUS]} rotation-y={-a + Math.PI / 2}>
              <mesh geometry={box}>
                <meshStandardMaterial color="#e2e8f0" transparent opacity={0.12} metalness={0.6} roughness={0.2} side={THREE.DoubleSide} />
              </mesh>
              <lineSegments geometry={edges}>
                <lineBasicMaterial color={[1.6, 1.6, 1.7]} toneMapped={false} />
              </lineSegments>
              <Satellite position={[0, -1.9, 0]} scale={0.6} />
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

- [ ] **Step 5: Verify.**
  - Run tsc, the tests and the CI build.
  - Serve, then run:
    - `node real-shots.js shots skills,certifications`
    - `node real-shots.js block 2k_moon.jpg skills`, expecting no page errors, rocks still visible (plain grey) and Jupiter textured
    - `node mv-interact.js certificate`, expecting the viewer to open
  - Read the shots:
    - **Skills:** banded Jupiter lit on one side, and a belt of lumpy grey tumbling rocks with lit and shadowed faces.
    - **Certifications:** a cratered Moon with clear relief along the terminator, and metal satellites with blue panels under each plaque.
  - Stop the server and restore build/.

- [ ] **Step 6: Commit**

```bash
git add src/multiverse/fx/Asteroid.tsx src/multiverse/fx/Satellite.tsx src/multiverse/universes/SkillsUniverse.tsx src/multiverse/universes/CertificationsUniverse.tsx
git commit -m "feat(multiverse): realistic Skills (Jupiter + asteroid belt) and Certifications (Moon + satellites)"
```

---

### Task 7: Work (Saturn, Jupiter, Mars) and Projects (real star colours)

**Files:**
- Modify: `src/multiverse/universes/WorkUniverse.tsx`, `src/multiverse/universes/ProjectsUniverse.tsx`

**Interfaces:**
- Consumes: `RealPlanet` (Task 3), `starColor` (Task 2), and the existing journey, data and `GlowSprite`.
- Produces: unchanged exports (`WorkUniverse`, `ProjectsUniverse`, `CONSTELLATION_COLORS`).

- [ ] **Step 1: Replace `src/multiverse/universes/WorkUniverse.tsx`**

```tsx
import React from 'react';
import { Html, Line } from '@react-three/drei';
import { RealPlanet } from '../fx/RealPlanet';
import { Palette, PALETTES } from '../fx/palettes';
import { TextureKey } from '../fx/textures';
import { WORK_STOPS, universeOrigin, Vec3 } from '../journey';
import { experience } from '../../data/portfolio';
import { UniverseProps } from './index';

const JOB_PALETTES: Palette[] = [
  PALETTES.work,
  { a: '#312e81', b: '#f472b6', atmos: '#f9a8d4' },
  { a: '#134e4a', b: '#facc15', atmos: '#fde68a' },
];
// experience is newest first: Realatte (newest) → Saturn, then Jupiter, then Mars (oldest).
const BODIES: { map: TextureKey; radius: number; ring?: boolean; atmos: [string, number] }[] = [
  { map: 'saturn', radius: 3.0, ring: true, atmos: ['#f0e0b8', 0.2] },
  { map: 'jupiter', radius: 3.4, atmos: ['#f0dcb4', 0.25] },
  { map: 'mars', radius: 2.4, atmos: ['#e8a07a', 0.35] },
];
const origin = universeOrigin('work');
const lightFor = (p: Vec3): Vec3 => [origin[0] + p[0] + 18, origin[1] + p[1] + 12, origin[2] + p[2] + 22];

export const WorkUniverse: React.FC<UniverseProps> = ({ active, preview }) => (
  <>
    <Line points={WORK_STOPS} color="#cbd5e1" lineWidth={1} transparent opacity={0.18} />
    {WORK_STOPS.map((p, i) => {
      const body = BODIES[i % BODIES.length];
      return (
        <group key={experience[i].company} position={p}>
          <RealPlanet
            radius={body.radius}
            map={body.map}
            ring={body.ring}
            atmos={body.atmos[0]}
            atmosStrength={body.atmos[1]}
            tilt={body.ring ? 0.47 : 0.1}
            spin={0.1}
            lightPos={lightFor(p)}
            fallback={JOB_PALETTES[i]}
          />
          {active && !preview && (
            <Html center position={[0, 4.6, 0]} className="mv-label">
              {experience[i].company}
              <small>{experience[i].start} – {experience[i].end}</small>
            </Html>
          )}
        </group>
      );
    })}
  </>
);
```

  Note: `lightFor(p)` is in world space, while `RealPlanet` sits inside a `group position={p}`. This matches today's behaviour (today's `Planet` used the same `lightFor`), because the shader receives world positions.

- [ ] **Step 2: Update `src/multiverse/universes/ProjectsUniverse.tsx`.** Re-read it first. Edit only the following:
  - Add `import { starColor } from '../fx/starColor';`.
  - Add, below `CONSTELLATION_COLORS`:

```ts
// Real star temperatures per constellation (featured projects burn hotter and brighter).
const STAR_TEMPS: Record<Constellation, number> = {
  'CRM Platforms': 4200,
  'Salesforce Portals': 9500,
  'Real Estate': 6000,
  'Web Apps': 7500,
};
const tempOf = (i: number) => STAR_TEMPS[projects[i].constellation] + (projects[i].featured ? 3000 : 0);
```

  - In `GalaxyDust`, replace the colour lines so the dust uses realistic star colours instead of the purple palette. Remove the `a`/`b` palette colours and use:

```ts
      const [r, g, bl] = starColor(3000 + Math.random() * 9000);
      const k = 1.25 * (1 - d / 34) + 0.35;
      col.set([r * k, g * k, bl * k], i * 3);
```

  Keep the `c`-free form: drop `const c = new THREE.Color()` and the `PALETTES` usage if they become unused, so that lint stays clean.
  - In `Star`, replace the `color` and `bright` lines with:

```ts
  const [sr, sg, sb] = useMemo(() => starColor(tempOf(index)), [index]);
  const color = useMemo(() => new THREE.Color(sr, sg, sb), [sr, sg, sb]);
  const bright = useMemo(() => color.clone().multiplyScalar(3.2), [color]);
```

  - Replace the two `GlowSprite` lines in `Star` with diffraction spikes:

```tsx
      <GlowSprite color={color} scale={p.featured ? 5 : 2.6} opacity={0.8} />
      <GlowSprite color={color} scale={[p.featured ? 8 : 5, 0.16, 1]} opacity={0.55} />
      <GlowSprite color={color} scale={[0.16, p.featured ? 8 : 5, 1]} opacity={0.55} />
```

  - Replace `<GlowSprite color={PALETTES.projects.b} scale={18} opacity={0.5} />` (the galaxy core) with `<GlowSprite color={new THREE.Color(1.2, 1.05, 0.9)} scale={18} opacity={0.45} />`. Hoist that colour to a module constant `CORE = new THREE.Color(1.2, 1.05, 0.9)`.
  - Keep `CONSTELLATION_COLORS` for the lines and labels, and keep all hover, click, drag and label code unchanged.

- [ ] **Step 3: Verify.**
  - Run tsc, the tests and the CI build.
  - Serve, then run:
    - `node real-shots.js shots work,projects`
    - `node mv-interact.js project`, expecting the project modal to open
    - `node mv-check.js http://localhost:3005/ $SCRATCH/shots/real-mv 10`, expecting `no console errors`
  - Read the shots:
    - **Work:** a ringed Saturn whose ring casts a shadow band and is shaded behind the planet; Jupiter and Mars visible down the path; day and night sides throughout.
    - **Projects:** a realistic galaxy of white, blue-white, yellow and orange stars with cross-shaped spikes, plus constellation lines and labels.
  - Stop the server and restore build/.

- [ ] **Step 4: Commit**

```bash
git add src/multiverse/universes/WorkUniverse.tsx src/multiverse/universes/ProjectsUniverse.tsx
git commit -m "feat(multiverse): realistic Work (Saturn, Jupiter, Mars) and Projects (blackbody star colours)"
```

---

### Task 8: Contact (a radio telescope on the Moon with Earth rising) and the credits

**Files:**
- Create: `src/multiverse/fx/RadioDish.tsx`
- Modify: `src/multiverse/universes/ContactUniverse.tsx`, `src/multiverse/Multiverse.tsx`, `src/multiverse/multiverse.css`

**Interfaces:**
- Consumes: `RealPlanet`, `RealEarth` (Tasks 3–4), and `BEAM_MS` / `beamAt` behaviour (existing).
- Produces: `RadioDish({ dishRef })`, and unchanged `ContactUniverse` / `BEAM_MS` exports.

- [ ] **Step 1: Create `src/multiverse/fx/RadioDish.tsx`**

```tsx
import React, { useMemo } from 'react';
import * as THREE from 'three';

/** A parabolic radio-telescope dish (lathe geometry) on a steel mast. The dish group is exposed for slewing. */
export const RadioDish: React.FC<{ dishRef: React.RefObject<THREE.Group>; dishPos: [number, number, number] }> = ({ dishRef, dishPos }) => {
  const dishGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const x = (i / 24) * 2.2;
      pts.push(new THREE.Vector2(x, (x * x) / 3.2));
    }
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  return (
    <>
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[0.28, 0.7, 9, 16]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.85} roughness={0.35} />
      </mesh>
      <group ref={dishRef} position={dishPos}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <mesh geometry={dishGeo}>
            <meshStandardMaterial color="#e5e7eb" metalness={0.55} roughness={0.45} side={THREE.DoubleSide} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[Math.cos((k * Math.PI * 2) / 3) * 0.9, 1.0, Math.sin((k * Math.PI * 2) / 3) * 0.9]} rotation={[0, 0, Math.cos((k * Math.PI * 2) / 3) * 0.6]}>
              <cylinderGeometry args={[0.025, 0.025, 1.9, 6]} />
              <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0, 1.85, 0]}>
            <cylinderGeometry args={[0.12, 0.16, 0.35, 12]} />
            <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.4} />
          </mesh>
        </group>
      </group>
    </>
  );
};
```

- [ ] **Step 2: Replace `src/multiverse/universes/ContactUniverse.tsx`**

```tsx
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RealPlanet } from '../fx/RealPlanet';
import { RealEarth } from '../fx/RealEarth';
import { RadioDish } from '../fx/RadioDish';
import { PALETTES } from '../fx/palettes';
import { useJourney } from '../store';
import { universeOrigin, Vec3 } from '../journey';
import { UniverseProps } from './index';

export const BEAM_MS = 2500;
const DISH: [number, number, number] = [0, 3.4, 0];
const origin = universeOrigin('contact');
// A low sun off to the right: long shadows on the lunar surface, Earth half-lit.
const SUN: Vec3 = [origin[0] + 90, origin[1] + 40, origin[2] + 45];

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
      m.color.setRGB(on ? 3 : 0.3, on ? 0.25 : 0.03, on ? 0.2 : 0.02); // red aviation beacons
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
      {/* lunar surface: the top of a huge Moon, the dish stands on it */}
      <RealPlanet radius={60} map="moon" bump={2.5} tilt={0} spin={0} lightPos={SUN} position={[0, -70, 0]} fallback={PALETTES.certifications} />
      {/* Earth rising behind the dish */}
      <RealEarth radius={7} lightPos={SUN} position={[-24, -2, -80]} spin={0.03} fallback={PALETTES.about} />
      <group scale={1.5}>
        <RadioDish dishRef={dish} dishPos={DISH} />
        <group ref={lights}>
          {[[-0.6, -4, 0.45], [0.6, -1, 0.45], [0, 5.6, 0]].map((p, i) => (
            <mesh key={i} position={p as [number, number, number]}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshBasicMaterial color={[3, 0.25, 0.2]} toneMapped={false} />
            </mesh>
          ))}
        </group>
        <group position={DISH} rotation={[-0.6, 0, 0.35]}>
          <mesh ref={beam} visible={false}>
            <cylinderGeometry args={[0.12, 0.7, 220, 16, 1, true]} />
            <meshBasicMaterial ref={beamMat} color={[1.2, 3, 2.2]} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </>
  );
};
```

  Placement note: the camera pose for Contact comes from `journey.ts`. If `real/contact.jpg` doesn't show Earth behind and beside the dish, adjust only the Earth `position` (and, if needed, the Moon centre y, so the dish base sits on the surface at about y = −10). Record the final values in the report.

- [ ] **Step 3: Credits.**
  - In `src/multiverse/Multiverse.tsx`, inside `UiLayer`'s `<div className="mv-ui…">`, after `<ModalHost />`, add:

```tsx
      <a className="mv-credits" href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noopener noreferrer">
        Planet imagery: Solar System Scope (CC BY 4.0)
      </a>
```

  - Append to `src/multiverse/multiverse.css`:

```css
/* image credit for the planet maps (CC BY 4.0) */
.mv-credits {
  position: absolute; left: 16px; bottom: 10px; z-index: 2;
  font-size: 0.68rem; letter-spacing: 0.02em; color: rgba(255, 255, 255, 0.5); text-decoration: none;
}
.mv-credits:hover, .mv-credits:focus-visible { color: rgba(255, 255, 255, 0.9); text-decoration: underline; }
```

- [ ] **Step 4: Verify.**
  - Run tsc, the tests and the CI build.
  - Serve, then run:
    - `node real-shots.js shots contact`
    - `node mv-interact.js contact`, expecting the form to work with `/api/contact` mocked (the script already mocks it) and the beam to fire
  - Read `real/contact.jpg`: a metal dish on a grey cratered lunar horizon, a half-lit Earth with clouds behind it, and red beacons.
  - Confirm the credits link is visible bottom-left and doesn't overlap the scroll hint or progress dots in `real/home.jpg` (re-shoot Home).
  - Stop the server and restore build/.

- [ ] **Step 5: Commit**

```bash
git add src/multiverse/fx/RadioDish.tsx src/multiverse/universes/ContactUniverse.tsx src/multiverse/Multiverse.tsx src/multiverse/multiverse.css
git commit -m "feat(multiverse): realistic Contact (radio telescope on the Moon, Earth rising) and image credits"
```

---

### Task 9: Full verification, Lighthouse, regressions, and clean-up

**Files:**
- Modify: `src/multiverse/**`, only for fixes the checks reveal (list each in the report). Delete `src/multiverse/fx/Nebula.tsx` and `src/multiverse/universes/BasicUniverse.tsx` only if nothing imports them any more (`grep -rn "Nebula\|makeBasicUniverse" src` → only their own files).

- [ ] **Step 1: Every visual check.**
  - Build, serve, and from `$SCRATCH/shots` run:
    - `node real-shots.js shots`
    - `node real-shots.js parallax work` (diff above 4)
    - `node real-shots.js portal`
    - `node real-shots.js home-click`
    - `node real-shots.js block 2k_jupiter.jpg skills`
    - `node real-shots.js block 2k_earth_daymap.jpg about`
    - `node real-shots.js block 2k_stars_milky_way.jpg ''`
  - All must report passed.
  - Read every image in `$SCRATCH/shots/real/`. For each universe confirm:
    - lit 3D bodies with a visible day/night line
    - relief on the Moon and Mars
    - no flat discs or dot sprites standing in for bodies
    - the Milky Way sky, and no coloured haze
    - day sides keep surface detail (not blown out by bloom)
  - Fix real problems at their root.
- [ ] **Step 2: Interactions and regressions.**
  - `node mv-check.js http://localhost:3005/ $SCRATCH/shots/real-mv 10` → 10 panel lines, then `no console errors`.
  - `node mv-interact.js cv,certificate,project,contact,keyboard,reduced-motion` → each passes. Read the script's argument handling first; if it takes one scenario per run, run each separately.
  - `node classic-check.js http://localhost:3005/#classic` → `all sections OK`.
  - `node mh-check.js all` and `node bh-check.js` → the mobile site is unaffected.
- [ ] **Step 3: Lighthouse.** Run the LH-D command twice under `after realistic universes`, and print `$SCRATCH/shots/lh-real.txt` (baseline vs after) in the report.
- [ ] **Step 4: Clean-up and gates.**
  - Remove `Nebula.tsx` and `BasicUniverse.tsx` if unused, as noted above.
  - `CI=true npx react-scripts test --watchAll=false` → all pass.
  - `npx tsc --noEmit -p .` → clean.
  - `CI=true npm run build 2>&1 | grep -E "Compiled|Failed"` → `Compiled successfully.`
  - `grep -rn "src/multiverse\|from '../multiverse\|from '../../multiverse" src/mobile | grep -v "fx/palettes\|journey"` → no output.
  - Stop the server and restore build/.
- [ ] **Step 5: Commit** any fixes and the clean-up (skip if there are none):

```bash
git add <changed files>
git commit -m "chore(multiverse): realistic universes polish and remove unused nebula haze"
```
