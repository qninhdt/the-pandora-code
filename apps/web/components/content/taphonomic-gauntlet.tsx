"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  GATES,
  SETTINGS,
  SETTING_ODDS,
  type SettingKey,
  formatOneIn,
  logBarFraction,
  runGauntlet,
} from "./taphonomic-gauntlet-model";

const W = 340;
const H = 214;
const PAD_L = 74;
const PAD_R = 44;
const PAD_T = 14;
const PAD_B = 22;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

const BAR_GAP = 8;
const barH = (plotH - BAR_GAP * (GATES.length - 1)) / GATES.length;

const SETTING_TONE: Record<SettingKey, string> = {
  forestFloor: "var(--magenta)",
  uplandLedge: "var(--amber)",
  sulfidicLagoon: "var(--teal)",
  ashFall: "var(--cyan)",
};

const FIGURE_TONE: Record<SettingKey, "cyan" | "teal" | "magenta" | "amber"> = {
  forestFloor: "magenta",
  uplandLedge: "amber",
  sulfidicLagoon: "teal",
  ashFall: "cyan",
};

interface TaphonomicGauntletProps {
  caption?: string;
  className?: string;
}

// Choose where a Pandoran animal dies and watch the five gates between a body and
// a described specimen. Each bar is one gate's pass rate on a log scale; the
// readout multiplies them. The lesson is in the spread between settings: the same
// animal is four orders of magnitude more likely to survive in ash than on the
// forest floor it actually lives on.
export function TaphonomicGauntlet({ caption, className }: TaphonomicGauntletProps) {
  const uid = useId();
  const t = useTranslations("viz.taphonomicGauntlet");
  const [setting, setSetting] = useState<SettingKey>("forestFloor");

  const out = useMemo(() => runGauntlet(setting), [setting]);
  const tone = SETTING_TONE[setting];
  const odds = SETTING_ODDS[setting];

  const yOf = (index: number) => PAD_T + index * (barH + BAR_GAP);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${setting}`)}
      caption={caption}
      tone={FIGURE_TONE[setting]}
      className={className}
      controls={
        <SegmentedToggle<SettingKey>
          options={SETTINGS.map((s) => ({
            value: s,
            label: t(`setting.${s}`),
            tone: SETTING_TONE[s],
          }))}
          value={setting}
          onChange={setSetting}
          ariaLabel={t("controls.setting")}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria.chart")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {GATES.map((gate, i) => {
            const y = yOf(i);
            const width = Math.max(1.5, logBarFraction(odds[gate]) * plotW);
            const isBottleneck = gate === out.bottleneck;
            return (
              <g key={gate}>
                {/* the full width a gate would occupy if nothing were lost */}
                <rect
                  x={PAD_L}
                  y={y}
                  width={plotW}
                  height={barH}
                  rx={2}
                  fill="var(--void)"
                  fillOpacity={0.45}
                  stroke="var(--border)"
                  strokeWidth={0.5}
                />
                {/* what actually passes this gate */}
                <rect
                  x={PAD_L}
                  y={y}
                  width={width}
                  height={barH}
                  rx={2}
                  fill={tone}
                  fillOpacity={isBottleneck ? 0.85 : 0.5}
                  filter={isBottleneck ? glowUrl(uid, "bloom") : undefined}
                />
                <VizText
                  x={PAD_L - 6}
                  y={y + barH / 2 + 3}
                  size="small"
                  anchor="end"
                  tone={isBottleneck ? tone : "var(--muted)"}
                  weight={isBottleneck ? 700 : 400}
                >
                  {t(`gate.${gate}`)}
                </VizText>
                <VizText
                  x={PAD_L + plotW + 6}
                  y={y + barH / 2 + 3}
                  size="micro"
                  tone={isBottleneck ? tone : "var(--subtle)"}
                  numeric
                >
                  {odds[gate] >= 0.01
                    ? `${Math.round(odds[gate] * 100)}%`
                    : `${(odds[gate] * 100).toFixed(2)}%`}
                </VizText>
              </g>
            );
          })}

          <VizText
            x={PAD_L + plotW / 2}
            y={H - 6}
            size="micro"
            anchor="middle"
            tone="var(--subtle)"
          >
            {t("axis.pass")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.overall")}
            value={`1 : ${formatOneIn(out.oneIn)}`}
            note={t(`verdict.${setting}`)}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("readout.bottleneck")}
            value={t(`gate.${out.bottleneck}`)}
            note={t(`bottleneckNote.${out.bottleneck}`)}
            tone={tone}
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("units")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
