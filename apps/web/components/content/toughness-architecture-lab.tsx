"use client";

import {
  ARCHITECTURES,
  type Architecture,
  SPECS,
  crackPath,
  toughness,
} from "@/components/content/toughness-architecture-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

// Drive a crack through the same mineral arranged four ways. The point is that
// nothing about the ingredient changes between the panels — only where it is put —
// and yet the crack goes from a free straight run to a corkscrew that has to
// manufacture surface the whole way. This is the mechanism that lets a shell made
// of chalk outlast the chalk.

const W = 320;
const H = 96;
/** Platelet rows drawn behind the crack, so the architecture is visible. */
const ROWS = 7;

const DEFAULT_PROGRESS = 0.55;

interface ToughnessArchitectureLabProps {
  caption?: string;
  className?: string;
}

export function ToughnessArchitectureLab({ caption, className }: ToughnessArchitectureLabProps) {
  const uid = useId();
  const t = useTranslations("viz.toughnessArchitectureLab");
  const [arch, setArch] = useState<Architecture>("monolithic");
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);

  const spec = SPECS[arch];
  const tone = `var(--${spec.tone})`;
  const result = useMemo(() => toughness(arch), [arch]);
  const points = useMemo(() => crackPath(arch, progress, W, H), [arch, progress]);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={spec.tone}
      caption={caption}
      hint={t(`hint.${arch}`)}
      className={className}
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-1.5">
          {ARCHITECTURES.map((key) => {
            const active = key === arch;
            const keyTone = `var(--${SPECS[key].tone})`;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setArch(key)}
                aria-pressed={active}
                className="rounded-md border px-2.5 py-1.5 font-sans text-xs font-600 transition-all duration-200"
                style={{
                  borderColor: active
                    ? `color-mix(in oklab, ${keyTone} 55%, transparent)`
                    : "var(--border)",
                  background: active
                    ? `color-mix(in oklab, ${keyTone} 16%, transparent)`
                    : "transparent",
                  color: active ? keyTone : "var(--subtle)",
                }}
              >
                {t(`architecture.${key}`)}
              </button>
            );
          })}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={t("aria", { architecture: t(`architecture.${arch}`) })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {/* the block of mineral, arranged as the chosen architecture */}
          <rect
            x={0}
            y={0}
            width={W}
            height={H}
            rx={4}
            fill="color-mix(in oklab, var(--void) 55%, transparent)"
            stroke="var(--border)"
            strokeWidth={0.5}
          />
          {spec.turnsPerSpan > 0 ? (
            <PlateletBed twist={spec.twistFactor > 1} />
          ) : (
            <text
              x={W / 2}
              y={H - 8}
              textAnchor="middle"
              className="font-sans"
              style={{ fill: "var(--subtle)", fontSize: 8 }}
            >
              {t("solidBlock")}
            </text>
          )}

          {/* the crack itself */}
          <path
            d={d}
            fill="none"
            stroke={tone}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={glowUrl(uid, "bloom")}
          />
          {/* the tip, so the reader can see how far it got */}
          {points.length > 0 ? (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={3}
              fill={tone}
              filter={glowUrl(uid, "bloom-strong")}
            />
          ) : null}
        </svg>

        <VizSlider
          label={t("progressLabel")}
          display={t("progressValue", { pct: Math.round(progress * 100) })}
          min={0.05}
          max={1}
          step={0.01}
          value={progress}
          onChange={setProgress}
          tone={tone}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <VizReadout
            label={t("readout.tortuosity")}
            value={t("readout.times", { value: result.tortuosity.toFixed(2) })}
            note={t("readout.tortuosityNote")}
            tone={tone}
          />
          <VizReadout
            label={t("readout.tipDrive")}
            value={t("readout.percent", { value: Math.round(result.tipDriveShare * 100) })}
            note={t("readout.tipDriveNote", { angle: spec.deflectionDeg })}
            tone={tone}
          />
          <VizReadout
            label={t("readout.energy")}
            value={t("readout.times", { value: formatRatio(result.energyRatio) })}
            note={t("readout.energyNote")}
            tone={tone}
            tinted
          />
        </div>

        <p className="font-sans text-xs leading-relaxed text-muted">{t(`verdict.${arch}`)}</p>
      </div>
    </VizFigure>
  );
}

/** Round the energy ratio the way a reader would say it aloud. */
function formatRatio(ratio: number): string {
  if (ratio < 10) return ratio.toFixed(0);
  if (ratio < 100) return `${Math.round(ratio / 5) * 5}`;
  return `${Math.round(ratio / 100) * 100}`;
}

/** The platelet rows behind the crack — offset per row, tilted if the stack twists. */
function PlateletBed({ twist }: { twist: boolean }) {
  const rowH = H / ROWS;
  const plateW = 34;
  return (
    <g opacity={0.5}>
      {Array.from({ length: ROWS }, (_, r) => {
        const y = r * rowH + 1;
        // Brick-and-mortar: every other row is offset by half a platelet, so no
        // vertical seam runs through the block.
        const offset = (r % 2) * (plateW / 2);
        const angle = twist ? ((r * 18) % 40) - 20 : 0;
        return Array.from({ length: Math.ceil(W / plateW) + 1 }, (_, c) => {
          const x = c * plateW - offset;
          if (x > W) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={x + 1}
              y={y}
              width={plateW - 2}
              height={rowH - 2}
              rx={1}
              fill="color-mix(in oklab, var(--subtle) 22%, transparent)"
              stroke="var(--border-strong)"
              strokeWidth={0.4}
              transform={angle ? `rotate(${angle} ${x + plateW / 2} ${y + rowH / 2})` : undefined}
            />
          );
        });
      })}
    </g>
  );
}
