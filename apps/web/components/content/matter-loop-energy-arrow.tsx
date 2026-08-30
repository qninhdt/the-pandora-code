"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// The chapter's payload, and the one place the Na'vi precept half-fails. Step a
// carbon atom around the loop and it comes home: leaf, body, soil, air, leaf. Step
// a joule along the same path and it never does — it arrives as a low-entropy
// photon, does work, degrades at every hand-off, and leaves as infrared. Matter is
// borrowed and returned. Energy is spent.
//
// Two tracers on one diagram so the contrast is structural rather than asserted.
// Stepping is user-driven, so there is no animation loop and the initial frame is
// deterministic for SSR.

interface MatterLoopEnergyArrowProps {
  caption?: string;
  className?: string;
}

type Tracer = "matter" | "energy";

const VIEW_W = 340;
const VIEW_H = 210;
const CX = 150;
const CY = 108;
const RX = 92;
const RY = 66;

// Five stations on the ring, clockwise from the top. Matter visits all five and
// returns to the first; energy walks the same stations and then exits the frame.
const STATIONS = ["air", "leaf", "body", "soil", "microbe"] as const;

function stationPoint(index: number): { x: number; y: number } {
  // -90° puts the first station at the top of the ellipse.
  const angle = (index / STATIONS.length) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + RX * Math.cos(angle), y: CY + RY * Math.sin(angle) };
}

// The escape route: down and off the right-hand edge, as radiated heat.
const EXIT = { x: VIEW_W - 14, y: CY + RY + 22 };

// Energy degrades at every transfer, so the tracer dims as it walks. Roughly a
// tenth of the useful energy survives each biological hand-off.
const RETAINED_PER_STEP = 0.1;

export function MatterLoopEnergyArrow({ caption, className }: MatterLoopEnergyArrowProps) {
  const t = useTranslations("viz.matterLoopEnergyArrow");
  const uid = useId();

  const [tracer, setTracer] = useState<Tracer>("matter");
  const [step, setStep] = useState(0);

  const isMatter = tracer === "matter";
  const totalSteps = isMatter ? STATIONS.length : STATIONS.length + 1;
  const escaped = !isMatter && step >= STATIONS.length;

  // Matter wraps around the ring forever; energy runs off the end and stops.
  const stationIndex = escaped ? STATIONS.length - 1 : step % STATIONS.length;
  const point = escaped ? EXIT : stationPoint(stationIndex);

  const tone = isMatter ? "var(--teal)" : "var(--amber)";
  const figureTone = isMatter ? "teal" : "amber";
  const retained = escaped ? 0 : RETAINED_PER_STEP ** step;

  function advance() {
    setStep((s) => (isMatter ? (s + 1) % STATIONS.length : Math.min(s + 1, totalSteps - 1)));
  }

  function switchTracer(next: Tracer) {
    setTracer(next);
    setStep(0);
  }

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone={figureTone}
      className={className}
      hint={escaped ? t("hintEscaped") : t(isMatter ? "hintMatter" : "hintEnergy")}
      controls={
        <SegmentedToggle
          options={[
            { value: "matter", label: t("tracer.matter"), tone: "var(--teal)" },
            { value: "energy", label: t("tracer.energy"), tone: "var(--amber)" },
          ]}
          value={tracer}
          onChange={(v) => switchTracer(v as Tracer)}
          ariaLabel={t("toggleAria")}
        />
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={t(isMatter ? "ariaMatter" : "ariaEnergy")}
      >
        <GlowDefs idBase={uid} tones={["teal", "amber"]} />

        {/* the ring the atoms travel — closed, always */}
        <ellipse
          cx={CX}
          cy={CY}
          rx={RX}
          ry={RY}
          fill="none"
          stroke={isMatter ? "var(--teal)" : "var(--border-strong)"}
          strokeWidth={isMatter ? 2 : 1.2}
          strokeOpacity={isMatter ? 0.9 : 0.5}
          filter={isMatter ? glowUrl(uid, "bloom") : undefined}
        />

        {/* the incoming photon: energy's only entrance */}
        <line
          x1={14}
          y1={20}
          x2={stationPoint(1).x - 8}
          y2={stationPoint(1).y - 8}
          stroke="var(--amber)"
          strokeWidth={isMatter ? 1 : 2}
          strokeOpacity={isMatter ? 0.35 : 0.95}
          filter={isMatter ? undefined : glowUrl(uid, "bloom")}
        />
        <VizText x={16} y={14} size="micro" tone={isMatter ? "subtle" : "amber"}>
          {t("photonIn")}
        </VizText>

        {/* the exit: only energy takes it */}
        <line
          x1={stationPoint(3).x}
          y1={stationPoint(3).y + 10}
          x2={EXIT.x - 6}
          y2={EXIT.y}
          stroke="var(--amber)"
          strokeWidth={isMatter ? 1 : 2}
          strokeOpacity={isMatter ? 0.25 : 0.95}
          strokeDasharray={isMatter ? "3 4" : undefined}
          filter={isMatter ? undefined : glowUrl(uid, "bloom")}
        />
        <VizText
          x={EXIT.x}
          y={EXIT.y + 12}
          size="micro"
          tone={isMatter ? "subtle" : "amber"}
          anchor="end"
        >
          {t("heatOut")}
        </VizText>

        {/* stations */}
        {STATIONS.map((id, i) => {
          const p = stationPoint(i);
          const here = !escaped && i === stationIndex;
          return (
            <g key={id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={here ? 7 : 4.5}
                fill={here ? tone : `color-mix(in oklab, ${tone} 25%, var(--void))`}
                stroke={tone}
                strokeOpacity={here ? 1 : 0.5}
                filter={here ? glowUrl(uid, "bloom") : undefined}
              />
              <VizText
                x={p.x}
                y={p.y < CY ? p.y - 12 : p.y + 18}
                size="micro"
                tone={here ? tone : "subtle"}
                anchor="middle"
                weight={here ? 700 : undefined}
              >
                {t(`station.${id}`)}
              </VizText>
            </g>
          );
        })}

        {/* the tracer */}
        <circle
          cx={point.x}
          cy={point.y}
          r={escaped ? 4 : 9}
          fill="none"
          stroke={tone}
          strokeWidth={1.5}
          strokeOpacity={escaped ? 0.4 : 0.8}
        />
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={advance}
          className="rounded-md border px-3 py-2 font-sans text-xs font-600 transition-all duration-200"
          style={{
            borderColor: `color-mix(in oklab, ${tone} 45%, transparent)`,
            background: `color-mix(in oklab, ${tone} 12%, transparent)`,
            color: tone,
          }}
        >
          {escaped ? t("restart") : t("advance")}
        </button>
        <span className="font-sans text-xs text-subtle">
          {t("stepCounter", { step: Math.min(step + 1, totalSteps), total: totalSteps })}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <VizReadout
          label={t("returnsLabel")}
          value={isMatter ? t("returnsYes") : t("returnsNo")}
          note={t(isMatter ? "returnsNoteMatter" : "returnsNoteEnergy")}
          tone={tone}
          tinted
        />
        <VizReadout
          label={t("retainedLabel")}
          value={
            isMatter
              ? t("retainedConserved")
              : t("retainedPct", { pct: (retained * 100).toPrecision(2) })
          }
          note={t(isMatter ? "retainedNoteMatter" : "retainedNoteEnergy")}
        />
      </div>
    </VizFigure>
  );
}
