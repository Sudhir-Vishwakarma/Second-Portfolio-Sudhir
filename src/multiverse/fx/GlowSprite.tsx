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
