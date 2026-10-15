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
