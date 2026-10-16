import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RenderTexture, Sparkles } from '@react-three/drei';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SceneLights } from './SceneLights';
import { MilkyWaySky } from './MilkyWaySky';
import { glowTexture } from './glow';
import { edgeSegments, honeycombRing, openEdges, perimeterPath, Segment, sharedEdge } from './hexGate';
import { UniverseId, portalCenter, universeOrigin } from '../journey';

const PORTAL_RADIUS = 5;
const VISIBLE_RANGE = 260;
const PREVIEW_SIZE = 512;
// Portals are only ever seen mid-warp (resting poses sit beyond VISIBLE_RANGE), so these span most of the visible run.
const APPROACH = 240; // camera distance over which the honeycomb lights up
const OPEN_AT = 35; // camera distance at which the outer cells start sliding away
const IDLE_LIGHT = 0.5; // cell brightness before its light-up, so the gate already glows at first sight
const BAR_WIDTH = 0.14;
const BAR_DEPTH = 0.05;

// HDR colours (bloom threshold is 1.0, so only these edges glow); identical for every portal.
const ORANGE = new THREE.Vector3(3.0, 1.25, 0.3);
const CYAN = new THREE.Vector3(0.55, 2.0, 2.6);

const R = PORTAL_RADIUS;
const RING = honeycombRing(R);

/** Thin bars along `segs`, merged into one geometry; `aCell` tags every vertex with its cell (-1 = centre). */
function barGeometry(segs: { seg: Segment; cell: number }[]): THREE.BufferGeometry {
  const parts = segs.map(({ seg: [[ax, ay], [bx, by]], cell }) => {
    const g = new THREE.BoxGeometry(Math.hypot(bx - ax, by - ay) + BAR_WIDTH, BAR_WIDTH, BAR_DEPTH);
    g.rotateZ(Math.atan2(by - ay, bx - ax));
    g.translate((ax + bx) / 2, (ay + by) / 2, 0.03);
    g.setAttribute('aCell', new THREE.Float32BufferAttribute(new Array(g.attributes.position.count).fill(cell), 1));
    return g;
  });
  return mergeGeometries(parts)!;
}

// Built once and shared by all six portals (the gate is identical everywhere): app-lifetime singletons, never disposed.
const RIM_GEOMETRY = barGeometry(edgeSegments([0, 0], R, []).map((seg) => ({ seg, cell: -1 })));
// Each edge shared by neighbours k and k+1 is drawn once, by k+1.
const CELL_EDGE_GEOMETRY = barGeometry(
  RING.flatMap((c, k) => edgeSegments(c, R, [...openEdges(k), sharedEdge(k)]).map((seg) => ({ seg, cell: k })))
);
const NET_GEOMETRY = mergeGeometries(
  RING.map(([x, y], k) => {
    const g = new THREE.CircleGeometry(R * 0.97, 6);
    g.translate(x, y, -0.02);
    g.setAttribute('aCell', new THREE.Float32BufferAttribute(new Array(g.attributes.position.count).fill(k), 1));
    return g;
  })
)!;
const PERIMETER = perimeterPath(R);

const previewVertex = /* glsl */ `
varying vec2 vP;
void main() {
  vP = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// The preview is rendered with the main camera, so sampling it in screen space makes the hexagon a window.
// A faint orange haze (at most 0.35) is added on top of the preview, hugging the hexagonal rim.
const previewFragment = /* glsl */ `
uniform sampler2D map;
uniform vec2 uResolution;
uniform float uRim;
uniform float uRadius;
varying vec2 vP;
void main() {
  vec2 a = abs(vP);
  float hd = max(a.y, dot(a, vec2(0.8660254, 0.5))) / (0.8660254 * uRadius);
  vec3 haze = vec3(1.0, 0.42, 0.1) * pow(clamp(hd, 0.0, 1.0), 10.0) * 0.35 * uRim;
  gl_FragColor = vec4(texture2D(map, gl_FragCoord.xy / uResolution).rgb + haze, 1.0);
}`;

// Shared by the cyan edges and the net: per-cell brightness, and the outward slide when the gate opens.
const cellVertex = /* glsl */ `
attribute float aCell;
uniform float uLight[6];
uniform float uSpread;
varying float vLight;
varying vec2 vP;
void main() {
  int i = int(aCell + 0.5);
  float ang = 0.5235988 + aCell * 1.0471976;
  vec3 p = position;
  p.xy += vec2(cos(ang), sin(ang)) * uSpread;
  vLight = uLight[i];
  vP = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const edgeFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uFade;
varying float vLight;
void main() {
  gl_FragColor = vec4(uColor * vLight, uFade);
  #include <colorspace_fragment>
}`;

// Fine flat-top hexagonal tiling: faint cyan lines over dark, semi-transparent cell interiors.
const netFragment = /* glsl */ `
uniform float uCellSize;
uniform float uFade;
varying float vLight;
varying vec2 vP;
const vec2 S = vec2(1.0, 1.7320508);
float hexDist(vec2 p) { p = abs(p); return max(dot(p, S * 0.5), p.x); }
vec2 hexLocal(vec2 uv) {
  vec4 c = floor(vec4(uv, uv - vec2(0.5, 1.0)) / S.xyxy) + 0.5;
  vec2 a = uv - c.xy * S;
  vec2 b = uv - (c.zw + 0.5) * S;
  return dot(a, a) < dot(b, b) ? a : b;
}
void main() {
  vec2 uv = vP.yx / uCellSize; // swap axes so the fine cells are flat-top like the gate
  float e = 0.5 - hexDist(hexLocal(uv));
  float w = fwidth(e);
  float line = 1.0 - smoothstep(0.03, 0.03 + 1.5 * w, e);
  float lit = 0.55 + 0.45 * vLight;
  vec3 col = mix(vec3(0.0, 0.025, 0.04), vec3(0.3, 0.85, 1.0) * lit, line);
  gl_FragColor = vec4(col, mix(0.25, 0.35, line) * lit * uFade);
  #include <colorspace_fragment>
}`;

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

interface PortalProps { universe: UniverseId; warm: boolean; children: React.ReactNode }

/** Hexagonal honeycomb gate at the entrance of a universe; its centre hexagon shows a live, low-resolution preview. */
export const Portal: React.FC<PortalProps> = ({ universe, warm, children }) => {
  const group = useRef<THREE.Group>(null!);
  const spark = useRef<THREE.Sprite>(null!);
  const preview = useMemo(
    () => ({
      map: { value: null as THREE.Texture | null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uRim: { value: 0.5 },
      uRadius: { value: R },
    }),
    []
  );
  const rim = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(ORANGE.x, ORANGE.y, ORANGE.z), toneMapped: false }), []);
  useEffect(() => () => rim.dispose(), [rim]);
  const cells = useMemo(
    () => ({
      uLight: { value: [0, 0, 0, 0, 0, 0] },
      uSpread: { value: 0 },
      uFade: { value: 1 },
      uColor: { value: CYAN.clone() },
      uCellSize: { value: R / 7 },
    }),
    []
  );
  const [near, setNear] = useState(true);
  const center = portalCenter(universe);
  const origin = universeOrigin(universe);
  const portalZ = origin[2] + center[2];

  useFrame((state) => {
    const d = state.camera.position.z - portalZ;
    const isNear = warm || (d > 0 && d < VISIBLE_RANGE);
    group.current.visible = isNear;
    if (isNear !== near) setNear(isNear);
    if (!isNear) return;
    state.gl.getDrawingBufferSize(preview.uResolution.value);

    const t = state.clock.elapsedTime;
    const a = Math.min(1, Math.max(0, 1 - d / APPROACH));
    const open = smooth(OPEN_AT, 2, d);
    const pulse = 1 + 0.15 * Math.sin(t * 2.2);
    for (let k = 0; k < 6; k++) {
      const on = (k / 6) * 0.8;
      cells.uLight.value[k] = (IDLE_LIGHT + (1 - IDLE_LIGHT) * smooth(on, on + 0.12, a)) * pulse;
    }
    cells.uSpread.value = open * 1.5 * R;
    cells.uFade.value = 1 - 0.9 * open;
    preview.uRim.value = 0.5 + 0.5 * a;
    rim.color.setRGB(ORANGE.x, ORANGE.y, ORANGE.z).multiplyScalar(0.6 + 0.6 * a);

    // spark running along the honeycomb outline, one lap every 9 s
    const u = ((t / 9) % 1) * PERIMETER.length;
    const i = Math.floor(u);
    const [x0, y0] = PERIMETER[i];
    const [x1, y1] = PERIMETER[(i + 1) % PERIMETER.length];
    spark.current.position.set(x0 + (x1 - x0) * (u - i), y0 + (y1 - y0) * (u - i), 0.08);
    (spark.current.material as THREE.SpriteMaterial).opacity = 1 - open;
  });

  return (
    <group ref={group} position={center}>
      {/* nebula wisp: dark teal smoke behind the gate (normal blending, so it never glows) */}
      {([[-6, 4, -6, 46, 0.6], [7, -3, -8, 40, 0.5], [1, 8, -10, 34, 0.45]] as const).map(([x, y, z, s, o], i) => (
        <sprite key={i} position={[x, y, z]} scale={[s, s * 0.6, 1]}>
          <spriteMaterial map={glowTexture} color="#1b5c68" transparent opacity={o} depthWrite={false} />
        </sprite>
      ))}
      <mesh>
        <circleGeometry args={[R, 6]} />
        <shaderMaterial uniforms={preview} vertexShader={previewVertex} fragmentShader={previewFragment} toneMapped={false}>
          <RenderTexture attach="uniforms-map-value" width={PREVIEW_SIZE} height={PREVIEW_SIZE} samples={0} frames={near ? Infinity : 0}>
            <color attach="background" args={['#020108']} />
            <SceneLights />
            <MilkyWaySky universe={universe} />
            {/* RenderTexture's scene is detached from this mesh, so place the preview at the universe's world origin
                (the parent offset plus the -center undo); it then lines up with the real universe */}
            <group position={origin}>{near && children}</group>
          </RenderTexture>
        </shaderMaterial>
      </mesh>
      <mesh geometry={RIM_GEOMETRY} material={rim} />
      <mesh geometry={NET_GEOMETRY}>
        <shaderMaterial uniforms={cells} vertexShader={cellVertex} fragmentShader={netFragment} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={CELL_EDGE_GEOMETRY}>
        <shaderMaterial uniforms={cells} vertexShader={cellVertex} fragmentShader={edgeFragment} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <sprite ref={spark} scale={1.6}>
        <spriteMaterial map={glowTexture} color={[2.4, 3.2, 3.6]} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <Sparkles count={60} scale={[32, 28, 6]} size={3} speed={0.4} color="#7fe8ff" />
    </group>
  );
};
