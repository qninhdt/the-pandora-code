"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { AtmosphereSettings } from "./atmosphere-config";
import { SPORE_HUES } from "./atmosphere-config";
import type { PointerTarget } from "./use-pointer-uniform";

interface SporeFieldProps {
  settings: AtmosphereSettings;
  pointer: React.RefObject<PointerTarget>;
}

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uSpeed;
  uniform float uForce;
  attribute float aSeed;
  attribute float aScale;
  attribute vec3 aHue;
  varying vec3 vHue;
  varying float vAlpha;

  void main() {
    vHue = aHue;
    vec3 p = position;
    // Slow procedural drift — each spore on its own phase via aSeed.
    float t = uTime * uSpeed;
    p.x += sin(t * 0.3 + aSeed * 6.28) * 0.6;
    p.y += cos(t * 0.24 + aSeed * 4.19) * 0.5 + t * 0.04;
    p.z += sin(t * 0.18 + aSeed * 2.71) * 0.4;
    // Wrap vertically so the field never empties as it rises.
    p.y = mod(p.y + 7.0, 14.0) - 7.0;

    // Cursor repulsion in screen-ish space (xy plane).
    vec2 toP = p.xy - uPointer * 5.0;
    float d = length(toP);
    float push = uForce * exp(-d * 0.6) * 1.4;
    p.xy += normalize(toP + 0.0001) * push;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Visible motes, sized by depth but capped so they stay soft dots, not blobs.
    gl_PointSize = clamp(aScale * (60.0 / -mv.z), 5.0, 24.0);
    // Fade with depth so far spores melt into the dark.
    vAlpha = clamp(1.0 - (-mv.z - 2.0) / 12.0, 0.12, 0.9);
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;
  varying vec3 vHue;
  varying float vAlpha;

  void main() {
    // Star-like: a tight bright core plus a soft glowing halo falling off
    // exponentially — not a flat bubble.
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0) discard;
    float core = smoothstep(0.22, 0.0, r);   // small intense center
    float halo = exp(-r * 3.2) * 0.45;        // diffuse outer glow
    float a = clamp(core + halo, 0.0, 1.0);
    gl_FragColor = vec4(vHue, a * vAlpha);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// A single THREE.Points + additive shader = one draw call for thousands of
// bioluminescent spores that drift and scatter away from the cursor.
export function SporeField({ settings, pointer }: SporeFieldProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const smoothed = useRef({ x: 0, y: 0 });
  const invalidate = useThree((s) => s.invalidate);

  const geometry = useMemo(() => {
    const count = Math.floor(settings.spores);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const scales = new Float32Array(count);
    const hues = new Float32Array(count * 3);
    const rgbHues = SPORE_HUES.map(hexToRgb);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      seeds[i] = Math.random();
      scales[i] = 1.5 + Math.random() * 4.5;
      // Cool palette dominates (cyan/teal); the warm magenta accent is rare
      // (~8%), matching the STYLE BIBLE.
      const r = Math.random();
      const hue = r < 0.08 ? rgbHues[2] : r < 0.54 ? rgbHues[0] : rgbHues[1];
      hues[i * 3] = hue[0];
      hues[i * 3 + 1] = hue[1];
      hues[i * 3 + 2] = hue[2];
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aHue", new THREE.BufferAttribute(hues, 3));
    return geo;
  }, [settings.spores]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uSpeed: { value: settings.speed },
      uForce: { value: settings.pointerForce },
    }),
    [settings.speed, settings.pointerForce],
  );

  useFrame((_, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value += delta;
    // Ease the pointer so the scatter feels fluid.
    smoothed.current.x += (pointer.current.x - smoothed.current.x) * 0.06;
    smoothed.current.y += (pointer.current.y - smoothed.current.y) * 0.06;
    mat.uniforms.uPointer.value.set(smoothed.current.x, smoothed.current.y);
    invalidate();
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
