"use client";

import { designTokens } from "@/lib/design-tokens";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// A generic vector/flux field: rings of points orbiting a core, evoking
// magnetic field lines / vortices (magnetism, superconductor content). Light:
// one THREE.Points, additive, one draw call. Mounted only through Scene3D.
export function FieldViz() {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const rings = 6;
    const perRing = 90;
    const positions = new Float32Array(rings * perRing * 3);
    let i = 0;
    for (let r = 0; r < rings; r++) {
      const radius = 0.6 + r * 0.42;
      const tilt = (r / rings) * Math.PI * 0.5;
      for (let p = 0; p < perRing; p++) {
        const a = (p / perRing) * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius * Math.cos(tilt);
        const z = Math.sin(a) * radius * Math.sin(tilt);
        positions[i++] = x;
        positions[i++] = y;
        positions[i++] = z;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.05,
        color: new THREE.Color(designTokens.biolum.cyan),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.25;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.2;
    }
  });

  return (
    <>
      <points ref={pointsRef} geometry={geometry} material={material} />
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color={designTokens.biolum.teal} />
      </mesh>
    </>
  );
}
