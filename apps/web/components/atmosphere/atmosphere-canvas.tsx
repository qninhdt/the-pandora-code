"use client";

import { Canvas } from "@react-three/fiber";
import { type AtmosphereProfile, DPR_RANGE, resolveSettings } from "./atmosphere-config";
import { SporeField } from "./spore-field";
import { usePointerUniform } from "./use-pointer-uniform";
import { VolumetricHaze } from "./volumetric-haze";

interface AtmosphereCanvasProps {
  profile: AtmosphereProfile;
  weaker: boolean;
  paused: boolean;
}

// The WebGL atmosphere: a bioluminescent spore field over a volumetric haze.
// frameloop="demand" keeps it idle until something requests a frame; the field
// requests frames itself while drifting, and pauses entirely when the tab is
// hidden (paused). DPR is clamped so it never over-renders on retina/mobile.
export function AtmosphereCanvas({ profile, weaker, paused }: AtmosphereCanvasProps) {
  const pointer = usePointerUniform();
  const settings = resolveSettings(profile, weaker);

  return (
    <Canvas
      frameloop={paused ? "never" : "demand"}
      dpr={DPR_RANGE}
      gl={{ antialias: false, powerPreference: "low-power", alpha: true }}
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ width: "100%", height: "100%" }}
    >
      <VolumetricHaze opacity={settings.hazeOpacity} />
      <SporeField settings={settings} pointer={pointer} />
    </Canvas>
  );
}
