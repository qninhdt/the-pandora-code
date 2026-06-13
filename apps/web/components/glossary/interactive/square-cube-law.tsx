"use client";

import { useTranslations } from "next-intl";
import type React from "react";
import { useMemo, useState } from "react";
import { GlossaryFrame } from "./shared/frame";

interface SquareCubeLawProps {
  locale: string;
}

export default function SquareCubeLaw({ locale }: SquareCubeLawProps) {
  const t = useTranslations("viz.squareCubeLaw");

  const [scale, setScale] = useState(1.5); // Linear scale factor 1.0 to 3.0
  const [boneType, setBoneType] = useState<"earth" | "navi">("earth");

  // Calculations
  const heightMult = scale;
  const areaMult = scale * scale;
  const volumeMult = scale * scale * scale;

  // Bone stress is proportional to volume / area = scale
  // Standard human bone stress limit is around 1.8x
  const boneStress = Math.round(scale * 100);
  const limit = boneType === "earth" ? 175 : 320;
  const isCrushed = boneStress > limit;
  const isStrained = boneStress > 150 && !isCrushed;

  const handleReset = () => {
    setScale(1.5);
    setBoneType("earth");
  };

  // Render a 3D isometric projection of a split cube
  // Coordinates for isometric projection:
  // x_iso = x - y
  // y_iso = (x + y) / 2 - z
  const renderIsometricCube = () => {
    const size = Math.round(scale); // Grid divisions: 1, 2, or 3
    const originX = 100;
    const originY = 85;
    const u = 18; // Isometric unit size

    const paths: React.JSX.Element[] = [];

    // Projection helper
    const project = (gx: number, gy: number, gz: number) => {
      const px = originX + (gx - gy) * u;
      const py = originY + ((gx + gy) / 2 - gz) * u;
      return { x: px, y: py };
    };

    // Draw grid lines of the isometric cube
    // We draw faces in back-to-front order (z-index ordering)
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const isTopFace = z === size - 1;
          const isRightFace = y === size - 1;
          const isLeftFace = x === size - 1;

          if (!isTopFace && !isRightFace && !isLeftFace) continue;

          const p000 = project(x, y, z);
          const p100 = project(x + 1, y, z);
          const p010 = project(x, y + 1, z);
          const p001 = project(x, y, z + 1);
          const p110 = project(x + 1, y + 1, z);
          const p101 = project(x + 1, y, z + 1);
          const p011 = project(x, y + 1, z + 1);
          const p111 = project(x + 1, y + 1, z + 1);

          const keyPrefix = `${x}-${y}-${z}`;

          // Top face (Z=size)
          if (isTopFace) {
            paths.push(
              <polygon
                key={`${keyPrefix}-top`}
                points={`${p001.x},${p001.y} ${p101.x},${p101.y} ${p111.x},${p111.y} ${p011.x},${p011.y}`}
                className="fill-cyan/10 stroke-cyan/35 stroke-[0.8]"
              />,
            );
          }
          // Left face (X=size)
          if (isLeftFace) {
            paths.push(
              <polygon
                key={`${keyPrefix}-left`}
                points={`${p100.x},${p100.y} ${p110.x},${p110.y} ${p111.x},${p111.y} ${p101.x},${p101.y}`}
                className="fill-cyan/15 stroke-cyan/35 stroke-[0.8]"
              />,
            );
          }
          // Right face (Y=size)
          if (isRightFace) {
            paths.push(
              <polygon
                key={`${keyPrefix}-right`}
                points={`${p010.x},${p010.y} ${p110.x},${p110.y} ${p111.x},${p111.y} ${p011.x},${p011.y}`}
                className="fill-cyan/20 stroke-cyan/35 stroke-[0.8]"
              />,
            );
          }
        }
      }
    }

    return paths;
  };

  const statusColor = isCrushed ? "text-magenta" : isStrained ? "text-amber" : "text-teal";

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={handleReset}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Isometric Grid Model */}
        <div className="w-full flex-1 flex flex-col justify-start pb-32 pt-2">
          <div className="relative w-full h-full bg-void/50 border border-border/20 rounded-xl overflow-hidden flex flex-row p-3 gap-3">
            {/* Visual Column */}
            <div className="flex-1 h-full relative flex items-center justify-center">
              <svg viewBox="0 0 200 120" className="h-full select-none">
                <title>Square-Cube Law isometric grid scaling</title>
                {renderIsometricCube()}
              </svg>
              {/* Display grid count indicator */}
              <div className="absolute bottom-2 left-2 text-[7.5px] font-mono text-muted">
                {locale === "vi"
                  ? "Lớp lưới biểu diễn thể tích"
                  : "Isometric grid division (volume)"}
              </div>
            </div>

            {/* Stats list */}
            <div className="w-1/3 border-l border-border/15 pl-3 flex flex-col justify-between h-full text-[8px] font-mono">
              <div className="flex flex-col gap-1.5">
                <div>
                  <span className="text-muted block uppercase">
                    {t("heightLabel") || "Height"}:
                  </span>
                  <span className="text-foreground font-bold text-[10px]">
                    {heightMult.toFixed(1)}x
                  </span>
                </div>
                <div className="border-t border-border/10 pt-1">
                  <span className="text-muted block uppercase">
                    {t("areaLabel") || "Surface Area (x²)"}:
                  </span>
                  <span className="text-cyan font-bold text-[10px]">{areaMult.toFixed(1)}x</span>
                </div>
                <div className="border-t border-border/10 pt-1">
                  <span className="text-muted block uppercase">
                    {t("volumeLabel") || "Mass/Volume (x³)"}:
                  </span>
                  <span className="text-magenta font-bold text-[10px]">
                    {volumeMult.toFixed(1)}x
                  </span>
                </div>
                <div className="border-t border-border/10 pt-1">
                  <span className="text-muted block uppercase">
                    {t("statusLabel") || "Status"}:
                  </span>
                  <span className={`font-bold text-[9px] ${statusColor}`}>
                    {isCrushed
                      ? t("statusCrushed") || "Crushed"
                      : isStrained
                        ? t("statusStrained") || "Strained"
                        : t("statusStable") || "Stable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono">
          {/* Controls row */}
          <div className="flex gap-2 items-center">
            {/* Bone Type toggle */}
            <div className="flex flex-1 gap-1">
              <button
                type="button"
                onClick={() => setBoneType("earth")}
                className="flex-1 py-0.5 px-1 rounded border font-mono text-[8px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
                style={{
                  backgroundColor: boneType === "earth" ? "var(--muted)" : "transparent",
                  color: boneType === "earth" ? "var(--background)" : "var(--foreground)",
                  borderColor: boneType === "earth" ? "var(--muted)" : "var(--border)",
                }}
              >
                {locale === "vi" ? "Xương người thường" : "Human Bone"}
              </button>

              <button
                type="button"
                onClick={() => setBoneType("navi")}
                className="flex-1 py-0.5 px-1 rounded border font-mono text-[8px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
                style={{
                  backgroundColor: boneType === "navi" ? "var(--teal)" : "transparent",
                  color: boneType === "navi" ? "var(--background)" : "var(--foreground)",
                  borderColor: boneType === "navi" ? "var(--teal)" : "var(--border)",
                  boxShadow: boneType === "navi" ? "0 0 6px rgba(43, 212, 168, 0.3)" : "none",
                }}
              >
                {locale === "vi" ? "Xương Na'vi gia cố" : "Na'vi Carbon Bone"}
              </button>
            </div>
          </div>

          {/* Scale Slider */}
          <div className="flex items-center gap-3 border-t border-border/15 pt-2">
            <span className="text-[9px] font-mono text-muted w-24 truncate uppercase">
              {t("scaleSlider") || "Linear Scale"}:
            </span>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(Number.parseFloat(e.target.value))}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-foreground w-10 text-right font-bold">{scale.toFixed(1)}x</span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
