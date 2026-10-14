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
