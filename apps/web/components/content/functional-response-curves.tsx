"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";

interface FunctionalResponseCurvesProps {
  caption?: string;
  className?: string;
}

type Kind = "type1" | "type2" | "type3";

// The three Holling functional-response shapes — but the lesson is not the intake
// curve, it is the *per-capita* curve underneath it: the fraction of the prey
// population a single hunter removes at each density. That second curve is what
// reveals stability. For Type II it falls monotonically — rare prey are hit
// hardest, a destabilising drag toward zero. For Type III it rises then *falls* at
// low density: a dome whose left flank is the prey refuge, the pressure easing
// exactly when prey get scarce. A draggable density marker reads both curves live
// and the refuge band is shaded where the per-capita share is dropping. The maths
// stays in code; every visible string flows from translations.

const W = 340;
const H = 220;
const PAD_L = 22;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 26;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const A = 2.4; // attack rate
const TH = 1.8; // handling-time scale — tuned so the Type III per-capita dome peaks
const TYPE1_CAP = 0.72; // prey density at which the linear curve hits its ceiling

// intake(prey) — prey eaten per hunter per unit time, in [0, ~1]; prey in [0,1].
function intake(kind: Kind, x: number): number {
  if (kind === "type1") return Math.min(1, (x / TYPE1_CAP) * 0.96);
  if (kind === "type2") return (A * x) / (1 + A * TH * x);
  return (A * x * x) / (1 + A * TH * x * x);
}

// Per-capita predation = intake / prey density: the share of the prey population
// each hunter takes. This is the curve that teaches stability.
function perCapita(kind: Kind, x: number): number {
  if (x <= 1e-4) {
    // limit as x→0: Type III shares vanish (refuge), the others stay finite/high.
    if (kind === "type3") return 0;
    if (kind === "type2") return A;
    return 0.96 / TYPE1_CAP;
  }
  return intake(kind, x) / x;
}

const PCAP_MAX = A; // shared ceiling for the per-capita curve (Type II at origin)

const TONE: Record<Kind, string> = {
  type1: "var(--teal)",
  type2: "var(--amber)",
  type3: "var(--cyan)",
};

const px = (x: number) => PAD_L + x * PLOT_W;
const pyIntake = (v: number) => PAD_T + (1 - Math.min(0.98, v)) * PLOT_H;
const pyShare = (v: number) => PAD_T + (1 - Math.min(0.98, v / PCAP_MAX)) * PLOT_H;

function intakePath(kind: Kind): string {
  const N = 64;
  const peak = intake(kind, 1);
  const scale = peak > 0 ? 0.92 / peak : 1;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    d += `${i === 0 ? "M" : " L"} ${px(x).toFixed(1)} ${pyIntake(intake(kind, x) * scale).toFixed(1)}`;
  }
  return d;
}

function sharePath(kind: Kind): string {
  const N = 64;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    d += `${i === 0 ? "M" : " L"} ${px(x).toFixed(1)} ${pyShare(perCapita(kind, x)).toFixed(1)}`;
  }
  return d;
}

// Where the Type III per-capita dome peaks — left of it is the refuge (share
// rising with density means scarce prey are spared). Solve d/dx[intake/x]=0.
const TYPE3_REFUGE_X = Math.sqrt(1 / (A * TH));

export function FunctionalResponseCurves({ caption, className }: FunctionalResponseCurvesProps) {
  const uid = useId();
  const t = useTranslations("viz.functionalResponse");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [kind, setKind] = useState<Kind>("type3");
  const [density, setDensity] = useState(0.32);
  const [dragging, setDragging] = useState(false);
  const tone = TONE[kind];

  const peak = intake(kind, 1);
  const scale = peak > 0 ? 0.92 / peak : 1;
  const intakeHere = intake(kind, density);
  const shareHere = perCapita(kind, density);
  const inRefuge = kind === "type3" && density < TYPE3_REFUGE_X;

  function pointTo(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    setDensity(Math.max(0.02, Math.min(1, (sx - PAD_L) / PLOT_W)));
  }

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      hint={t(`${kind}.note`)}
      tone={kind === "type2" ? "amber" : kind === "type1" ? "teal" : "cyan"}
      controls={
        <SegmentedToggle<Kind>
          ariaLabel={t("title")}
          value={kind}
          onChange={setKind}
          options={[
            { value: "type1", label: t("type1.tab"), tone: TONE.type1 },
            { value: "type2", label: t("type2.tab"), tone: TONE.type2 },
            { value: "type3", label: t("type3.tab"), tone: TONE.type3 },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none sm:w-2/3"
          role="img"
          aria-label={t(`${kind}.note`)}
          onPointerDown={(e) => {
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            pointTo(e);
          }}
          onPointerMove={(e) => dragging && pointTo(e)}
          onPointerUp={(e) => {
            setDragging(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        >
          <GlowDefs idBase={uid} tones={["cyan", "amber", "teal"]} />

          {/* refuge band — only on Type III, shaded left of the per-capita peak */}
          {kind === "type3" && (
            <rect
              x={PAD_L}
              y={PAD_T}
              width={px(TYPE3_REFUGE_X) - PAD_L}
              height={PLOT_H}
              fill="var(--cyan)"
              opacity={0.08}
            />
          )}

          {/* axes */}
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD_L}
            y1={PAD_T + PLOT_H}
            x2={PAD_L + PLOT_W}
            y2={PAD_T + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {/* the per-capita "share taken" curve — dashed, the stability story */}
          <path
            d={sharePath(kind)}
            fill="none"
            stroke={tone}
            strokeWidth={1.6}
            strokeDasharray="4 3"
            strokeOpacity={0.65}
          />
          {/* the intake curve — solid, the headline shape */}
          <path
            d={intakePath(kind)}
            fill="none"
            stroke={tone}
            strokeWidth={2.4}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "stroke 0.3s" }}
          />

          {/* draggable density marker */}
          <line
            x1={px(density)}
            y1={PAD_T}
            x2={px(density)}
            y2={PAD_T + PLOT_H}
            stroke="var(--foreground)"
            strokeOpacity={0.3}
            strokeWidth={1}
          />
          <circle
            cx={px(density)}
            cy={pyIntake(intakeHere * scale)}
            r={5}
            fill={tone}
            filter={glowUrl(uid, "bloom")}
          />
          <circle
            cx={px(density)}
            cy={pyShare(shareHere)}
            r={4}
            fill="none"
            stroke={tone}
            strokeWidth={2}
          />
          <circle
            cx={px(density)}
            cy={PAD_T + PLOT_H}
            r={5}
            fill={tone}
            filter={glowUrl(uid, "bloom")}
          />

          {/* axis labels */}
          <VizText x={PAD_L + PLOT_W / 2} y={H - 6} size="micro" tone="subtle" anchor="middle">
            {t("xAxis")}
          </VizText>
          <VizText
            x={9}
            y={PAD_T + PLOT_H / 2}
            size="micro"
            tone="subtle"
            anchor="middle"
            transform={`rotate(-90 9 ${PAD_T + PLOT_H / 2})`}
          >
            {t("yAxis")}
          </VizText>
          {kind === "type3" && (
            <VizText
              x={px(TYPE3_REFUGE_X / 2)}
              y={PAD_T + 14}
              size="micro"
              tone="cyan"
              anchor="middle"
            >
              {t("refuge")}
            </VizText>
          )}
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout label={t("intakeLabel")} value={intakeHere.toFixed(2)} tone={tone} />
          <VizReadout
            label={t("shareLabel")}
            value={shareHere.toFixed(2)}
            tone={tone}
            tinted={inRefuge}
            note={inRefuge ? t("refugeNote") : undefined}
          />
          <div
            className="mt-1 rounded-lg border px-3 py-3"
            style={{
              borderColor: `color-mix(in oklab, ${tone} 45%, transparent)`,
              background: `color-mix(in oklab, ${tone} 10%, var(--void))`,
            }}
          >
            <p className="font-sans text-xs uppercase tracking-wider text-subtle">
              {t("analogueLabel")}
            </p>
            <p className="font-display text-sm font-700 text-foreground">{t(`${kind}.animal`)}</p>
            <p className="mt-2 font-sans text-xs text-muted">{t(`${kind}.role`)}</p>
          </div>
        </div>
      </div>
    </VizFigure>
  );
}
