"use client";

import { designTokens } from "@/lib/design-tokens";
import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

// Two slowly bobbing floating rock masses lit by a bioluminescent key, wreathed
// in a faint flux glow - the sample chapter's hero in 3D. Kept light: low-poly
// rocks + a couple of point lights, no postprocessing. Mounted only through
// Scene3D (lazy, capped DPR, demand frameloop).
export function FloatingMountainScene() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current)
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.15;
  });

  return (
    <group ref={group}>
      <ambientLight
        intensity={0.25}
        color={designTokens.depth.surfaceOverlay}
      />
      <pointLight
        position={[-3, 2, 3]}
        intensity={40}
        color={designTokens.biolum.cyan}
      />
      <pointLight
        position={[3, -1, 2]}
        intensity={25}
        color={designTokens.biolum.teal}
      />
      <pointLight
        position={[0, -2, -2]}
        intensity={12}
        color={designTokens.biolum.magenta}
      />

      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh position={[-1.4, 0.6, 0]} rotation={[0.3, 0.5, -0.2]}>
          <dodecahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial
            color={designTokens.depth.surfaceRaised}
            roughness={0.7}
            metalness={0.3}
            emissive={designTokens.biolum.cyan}
            emissiveIntensity={0.08}
          />
        </mesh>
      </Float>

      <Float speed={1} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh position={[1.5, -0.4, -0.5]} rotation={[-0.2, 0.8, 0.3]}>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial
            color={designTokens.depth.surface}
            roughness={0.65}
            metalness={0.35}
            emissive={designTokens.biolum.teal}
            emissiveIntensity={0.1}
          />
        </mesh>
      </Float>
    </group>
  );
}
