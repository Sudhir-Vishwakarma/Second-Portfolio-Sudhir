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
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.35} />
      </mesh>
      <group ref={dishRef} position={dishPos}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <mesh geometry={dishGeo}>
            <meshStandardMaterial color="#e5e7eb" metalness={0.55} roughness={0.45} side={THREE.DoubleSide} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[Math.cos((k * Math.PI * 2) / 3) * 0.9, 1.0, Math.sin((k * Math.PI * 2) / 3) * 0.9]} rotation={[0, 0, Math.cos((k * Math.PI * 2) / 3) * 0.6]}>
              <cylinderGeometry args={[0.025, 0.025, 1.9, 6]} />
              <meshStandardMaterial color="#d1d5db" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0, 1.85, 0]}>
            <cylinderGeometry args={[0.12, 0.16, 0.35, 12]} />
            <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      </group>
    </>
  );
};
