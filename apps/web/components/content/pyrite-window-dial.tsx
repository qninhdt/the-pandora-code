"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  PRESETS,
  type PresetKey,
  WINDOW_BOUNDS,
  evaluateWindow,
  resolutionFor,
} from "./pyrite-window-model";

const W = 320;
const H = 226;
const PAD_L = 42;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 38;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

const REGIME_TONE = {
  barren: "var(--subtle)",
  ironStarved: "var(--amber)",
  carbonPoisoned: "var(--magenta)",
  pyriteWindow: "var(--cyan)",
} as const;

interface PyriteWindowDialProps {
  caption?: string;
  className?: string;
}

// The map is sulfide across, reactive iron up; the shaded rectangle is the region
// where a carcass gets cast in pyrite. Carbon is the third dial, and raising it
// closes the window from above — the counter-intuitive part, since more organic
// matter makes preservation worse, not better. The preset toggle is the chapter's
// argument in one gesture: Earth's carcass waits on bacteria for its sulfide and
// sits outside the window; Pandora's arrives in water the air already charged.
export function PyriteWindowDial({ caption, className }: PyriteWindowDialProps) {
  const uid = useId();
  const t = useTranslations("viz.pyriteWindow");
  const [preset, setPreset] = useState<PresetKey>("earth");
  const [sulfide, setSulfide] = useState(PRESETS.earth.sulfide);
  const [iron, setIron] = useState(PRESETS.earth.iron);
  const [carbon, setCarbon] = useState(PRESETS.earth.carbon);

  function applyPreset(key: PresetKey) {
    setPreset(key);
    setSulfide(PRESETS[key].sulfide);
    setIron(PRESETS[key].iron);
    setCarbon(PRESETS[key].carbon);
  }

  const out = useMemo(() => evaluateWindow({ sulfide, iron, carbon }), [sulfide, iron, carbon]);
  const resolution = resolutionFor(out);
  const tone = REGIME_TONE[out.regime];
  const open = out.regime === "pyriteWindow";

  const xOf = (v: number) => PAD_L + (v / 100) * plotW;
  const yOf = (v: number) => PAD_T + (1 - v / 100) * plotH;

  // Carbon squeezes the window's usable height: past the ceiling it shuts entirely.
  const carbonShare = Math.min(1, Math.max(0, (carbon - 20) / (WINDOW_BOUNDS.carbonCeiling - 20)));
  const windowTop = carbon > WINDOW_BOUNDS.carbonCeiling ? yOf(WINDOW_BOUNDS.ironFloor) : yOf(100);
  const windowBottom = yOf(WINDOW_BOUNDS.ironFloor);
  const windowLeft = xOf(WINDOW_BOUNDS.sulfideFloor);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={open ? t(`hint.${preset}`) : t(`hint.${out.regime}`)}
      caption={caption}
      tone={open ? "cyan" : out.regime === "carbonPoisoned" ? "magenta" : "amber"}
      className={className}
      controls={
        <div className="flex w-full flex-col items-end gap-2">
          <SegmentedToggle<PresetKey>
            options={[
              { value: "earth", label: t("preset.earth"), tone: "var(--amber)" },
              { value: "pandora", label: t("preset.pandora"), tone: "var(--cyan)" },
            ]}
            value={preset}
            onChange={applyPreset}
            ariaLabel={t("controls.preset")}
          />
          <div className="flex w-40 flex-col gap-2 sm:w-52">
            <VizSlider
              label={t("controls.sulfide")}
              display={`${sulfide}`}
              min={0}
              max={100}
              step={1}
              value={sulfide}
              onChange={setSulfide}
              tone="var(--cyan)"
            />
            <VizSlider
              label={t("controls.iron")}
              display={`${iron}`}
              min={0}
              max={100}
              step={1}
              value={iron}
              onChange={setIron}
              tone="var(--teal)"
            />
            <VizSlider
              label={t("controls.carbon")}
              display={`${carbon}`}
              min={0}
              max={100}
              step={1}
              value={carbon}
              onChange={setCarbon}
              tone="var(--magenta)"
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t(`aria.${out.regime}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          <rect
            x={PAD_L}
            y={PAD_T}
            width={plotW}
            height={plotH}
            fill={glowUrl(uid, "grid")}
            fillOpacity={0.5}
          />

          {/* the region where soft tissue gets replaced by pyrite */}
          {carbon <= WINDOW_BOUNDS.carbonCeiling ? (
            <rect
              x={windowLeft}
              y={windowTop}
              width={PAD_L + plotW - windowLeft}
              height={windowBottom - windowTop}
              fill="var(--cyan)"
              fillOpacity={0.1 + 0.14 * (1 - carbonShare)}
              stroke="var(--cyan)"
              strokeWidth={1}
              strokeOpacity={0.5}
              strokeDasharray="4 3"
            />
          ) : (
            <rect
              x={windowLeft}
              y={yOf(100)}
              width={PAD_L + plotW - windowLeft}
              height={windowBottom - yOf(100)}
              fill="var(--magenta)"
              fillOpacity={0.08}
              stroke="var(--magenta)"
              strokeWidth={1}
              strokeOpacity={0.4}
              strokeDasharray="2 4"
            />
          )}

          {/* axes */}
          <line
            x1={PAD_L}
            y1={PAD_T + plotH}
            x2={PAD_L + plotW}
            y2={PAD_T + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <VizTick x={PAD_L} y={PAD_T + plotH + 12}>
            0
          </VizTick>
          <VizTick x={PAD_L + plotW} y={PAD_T + plotH + 12}>
            100
          </VizTick>
          <VizText
            x={PAD_L + plotW / 2}
            y={PAD_T + plotH + 26}
            size="small"
            anchor="middle"
            tone="var(--muted)"
          >
            {t("axis.sulfide")}
          </VizText>
          <VizText
            x={12}
            y={PAD_T + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 12 ${PAD_T + plotH / 2})`}
          >
            {t("axis.iron")}
          </VizText>

          {/* where this carcass sits */}
          <circle
            cx={xOf(sulfide)}
            cy={yOf(iron)}
            r={14}
            fill={glowUrl(uid, open ? "wash-cyan" : "wash-amber")}
          />
          <circle
            cx={xOf(sulfide)}
            cy={yOf(iron)}
            r={4.5}
            fill={tone}
            filter={glowUrl(uid, "bloom")}
          />
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.regime")}
            value={t(`regime.${out.regime}`)}
            note={t(`regimeNote.${out.regime}`)}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("readout.fidelity")}
            value={`${out.fidelity}`}
            note={t(`resolution.${resolution}`)}
            tone={tone}
          />
          <VizReadout
            label={t("readout.limiting")}
            value={t(`limiting.${out.limiting}`)}
            tone={out.limiting === "none" ? "var(--teal)" : "var(--amber)"}
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("units")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
