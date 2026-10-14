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
