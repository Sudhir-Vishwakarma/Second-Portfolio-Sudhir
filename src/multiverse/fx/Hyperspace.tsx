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
