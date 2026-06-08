"use client";

import { designTokens } from "@/lib/design-tokens";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// The tidal-lock orbit clock. A moon rides once around a fixed central planet
// while keeping one face locked inward; a fixed off-frame sun lights it, so any
// point on the moon still wheels through day and night over a single orbit -
// and once per orbit the moon slips behind the planet and is eclipsed. Day =
// orbit, made visible. Light by design intent: low-poly spheres, a couple of
// lights, the eclipse simulated per-frame (the Scene3D Canvas has no shadow
// maps) by fading the moon's sunlight as it passes through the planet's shadow.

// Orbit geometry, in scene units. The sun sits far along +X.
const ORBIT_RADIUS = 2.6;
const SUN_DIRECTION = new THREE.Vector3(1, 0, 0);

export function OrbitClockScene() {
  const orbitGroup = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);
  const sunlightRef = useRef<THREE.PointLight>(null);
  const moonPos = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const group = orbitGroup.current;
    const moon = moonRef.current;
    if (!group || !moon) return;

    // Advance the moon around the planet. Because the moon is a child of the
    // orbiting group and its inward marker faces -X locally, rotating the group
    // keeps that same face pointed at the planet for the whole orbit: the
    // visual definition of synchronous rotation.
    group.rotation.y += delta * 0.45;

    // Eclipse: fade the moon's sunlight when it sits on the far side of the
    // planet from the sun (the planet's shadow). Compute the moon's world
    // position and compare its direction-from-planet against the sun direction.
    moon.getWorldPosition(moonPos.current);
    const towardSun = moonPos.current.clone().normalize().dot(SUN_DIRECTION);
    // towardSun = +1 between sun and planet (full day), -1 behind the planet.
    const eclipse = THREE.MathUtils.smoothstep(-towardSun, 0.86, 0.99);
    if (sunlightRef.current) {
      sunlightRef.current.intensity = THREE.MathUtils.lerp(26, 1.5, eclipse);
    }
  });

  return (
    <>
      {/* Faint fill so nothing is pure black; the directional read comes from
          the sun and planetshine below. */}
      <ambientLight intensity={0.18} color={designTokens.depth.surfaceOverlay} />

      {/* The fixed sun: a bright amber point far along +X, plus a directional
          key so the planet's day side is unambiguous. */}
      <directionalLight position={[8, 1.5, 2]} intensity={2.2} color={designTokens.biolum.amber} />
      <mesh position={[7, 0, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshBasicMaterial color={designTokens.biolum.amber} />
      </mesh>

      {/* The planet at the centre - warm, banded, the body the moon is locked
          to. A gentle planetshine point light spills onto the moon's night
          side, the reflected glow that keeps Pandora's nights from going black. */}
      <mesh rotation={[0.2, 0, 0.1]}>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshStandardMaterial
          color={designTokens.biolum.amber}
          roughness={0.85}
          metalness={0.1}
          emissive={designTokens.biolum.amber}
          emissiveIntensity={0.06}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3} distance={6} color={designTokens.biolum.cyan} />

      {/* The orbiting, tide-locked moon. */}
      <group ref={orbitGroup}>
        <group ref={moonRef} position={[ORBIT_RADIUS, 0, 0]}>
          {/* A dedicated sunlight on the moon, faded during eclipse. */}
          <pointLight ref={sunlightRef} position={[3.5, 1, 1.5]} intensity={26} distance={9} color={designTokens.biolum.amber} />
          <mesh>
            <sphereGeometry args={[0.42, 36, 36]} />
            <meshStandardMaterial
              color={designTokens.depth.surfaceRaised}
              roughness={0.6}
              metalness={0.25}
              emissive={designTokens.biolum.teal}
              emissiveIntensity={0.12}
            />
          </mesh>
          {/* The locked face marker: a small cyan patch on the moon's inward
              (-X) side. It always points at the planet, showing synchronous
              rotation directly. */}
          <mesh position={[-0.42, 0, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color={designTokens.biolum.cyan} />
          </mesh>
        </group>
      </group>

      {/* Let the reader drag to rotate the viewpoint; no zoom/pan so it stays
          framed. */}
      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
    </>
  );
}
