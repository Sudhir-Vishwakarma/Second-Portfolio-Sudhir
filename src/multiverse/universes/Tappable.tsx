// universes/Tappable.tsx — finger-sized hit areas and the info card a tapped object shows
import React from 'react';
import { Html } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { Vec3 } from '../journey';

/** A press that travelled further than this (px) was a swipe or a drag, not a tap. */
const TAP_SLOP = 12;

export type TapHandler = (e: ThreeEvent<MouseEvent>) => void;

/** Wraps a tap callback: ignores swipes and stops the event reaching objects behind. */
export function onTap(enabled: boolean, fn: () => void): TapHandler {
  return (e) => {
    if (!enabled || e.delta > TAP_SLOP) return;
    e.stopPropagation();
    fn();
  };
}

/** An invisible sphere around a small object so a fingertip can hit it. */
export const HitArea: React.FC<{ radius: number; onClick: TapHandler; position?: Vec3 }> = ({ radius, onClick, position }) => (
  <mesh position={position} onClick={onClick}>
    <sphereGeometry args={[radius, 12, 12]} />
    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
  </mesh>
);

/** Info card pinned above a tapped object. */
export const InfoCard: React.FC<{ position: Vec3; children: React.ReactNode }> = ({ position, children }) => (
  <Html center position={position} className="mv-info" zIndexRange={[20, 10]}>
    {children}
  </Html>
);
