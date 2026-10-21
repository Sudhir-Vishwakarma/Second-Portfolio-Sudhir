import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { framePose, universeAtZ, universeOf, universeOrigin, Vec3 } from '../journey';
import { useJourney } from '../store';
import { rig } from '../fx/rig';
import { GALAXY_RADIUS, clampFocus, zoomedPose } from '../zoom';

const GALAXY_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/** Mount FIRST inside <Canvas> so camera-following objects never lag a frame behind. */
export const CameraRig: React.FC = () => {
  const ready = useRef(false);
  const look = useMemo(() => new THREE.Vector3(), []);
  const goalLook = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const last = useMemo(() => new THREE.Vector3(), []);
  const zoom = useRef(1);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const s = useJourney.getState();
    const aspect = state.size.width / Math.max(state.size.height, 1);
    let pose = framePose(s.step, aspect);

    // Project Galaxy pinch zoom: a new pinch picks the galaxy point under the fingers, then the camera closes in on it.
    easing.damp(zoom, 'current', s.zoom, 0.2, dt);
    if (universeOf(s.step) === 'projects') {
      const o = universeOrigin('projects');
      if (s.zoomAnchor) {
        ray.setFromCamera(new THREE.Vector2(...s.zoomAnchor), cam);
        GALAXY_PLANE.constant = -o[1];
        if (ray.ray.intersectPlane(GALAXY_PLANE, hit)) s.setZoomFocus(clampFocus([hit.x - o[0], 0, hit.z - o[2]], GALAXY_RADIUS));
        else s.setZoomFocus(s.zoomFocus);
      }
      const f: Vec3 = [o[0] + s.zoomFocus[0], o[1] + s.zoomFocus[1], o[2] + s.zoomFocus[2]];
      pose = { ...pose, ...zoomedPose(pose, zoom.current, f) };
    }

    if (!ready.current) {
      cam.position.set(...pose.pos);
      cam.fov = pose.fov;
      look.set(...pose.look);
      last.copy(cam.position);
      ready.current = true;
    }

    // Stronger pointer parallax plus a slow idle drift, so near bodies visibly move against far ones.
    // Touch screens move the pointer on every tap, so portrait keeps the parallax subtle.
    const sway = aspect < 1 ? 0.3 : 1;
    const t = state.clock.elapsedTime;
    const driftX = s.moving ? 0 : Math.sin(t * 0.11) * 1.2;
    const driftY = s.moving ? 0 : Math.cos(t * 0.09) * 0.6;
    target.set(pose.pos[0] + state.pointer.x * 2.4 * sway + driftX, pose.pos[1] + state.pointer.y * 1.5 * sway + driftY, pose.pos[2]);
    goalLook.set(...pose.look);
    const warping = s.moving && s.moveKind === 'warp';
    easing.damp3(cam.position, target, warping ? 0.85 : 0.6, dt);
    easing.damp3(look, goalLook, 0.5, dt);
    cam.lookAt(look);

    const speed = cam.position.distanceTo(last) / Math.max(dt, 1e-4);
    last.copy(cam.position);
    easing.damp(rig, 'warp', warping ? THREE.MathUtils.clamp((speed - 25) / 160, 0, 1) : 0, 0.15, dt);
    easing.damp(cam, 'fov', pose.fov + rig.warp * 38, 0.25, dt);
    cam.rotation.z += (Math.random() - 0.5) * 0.012 * rig.warp;
    cam.updateProjectionMatrix();

    if (s.moving && cam.position.distanceTo(target) < 0.5) s.arrive();
    s.setCameraUniverse(universeAtZ(cam.position.z));
  });

  return null;
};
