"use client";

import { designTokens } from "@/lib/design-tokens";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface VolumetricHazeProps {
  opacity: number;
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Cheap fake volumetrics: a single fullscreen quad of layered value-noise that
// scrolls at two rates for a sense of depth. Tinted by the biolum palette.
const FRAGMENT = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uCyan;
  uniform vec3 uTeal;
  uniform vec3 uMagenta;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    return 0.6 * noise(p) + 0.3 * noise(p * 2.1 + 5.0) + 0.1 * noise(p * 4.3);
  }

  void main() {
    vec2 uv = vUv;
    float n1 = fbm(uv * 3.0 + vec2(uTime * 0.02, uTime * 0.012));
    float n2 = fbm(uv * 5.0 - vec2(uTime * 0.015, uTime * 0.02));
    float n = mix(n1, n2, 0.5);

    // Drift hue across the frame, weighted to the lower-left depth.
    vec3 col = mix(uCyan, uTeal, smoothstep(0.2, 0.8, uv.x));
    col = mix(col, uMagenta, smoothstep(0.6, 1.0, n2) * 0.4);

    float density = smoothstep(0.35, 0.85, n) * uOpacity;
    // Vignette toward the void at the edges.
    float vig = smoothstep(1.1, 0.2, length(uv - 0.5));
    gl_FragColor = vec4(col, density * vig);
  }
`;

function hexToColor(hex: string) {
  return new THREE.Color(hex);
}

export function VolumetricHaze({ opacity }: VolumetricHazeProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uCyan: { value: hexToColor(designTokens.biolum.cyan) },
      uTeal: { value: hexToColor(designTokens.biolum.teal) },
      uMagenta: { value: hexToColor(designTokens.biolum.magenta) },
    }),
    [opacity],
  );

  useFrame((_, delta) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value += delta;
    invalidate();
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
