"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The curve's three regions: delay in early subjective night, advance in late
// subjective night, and a dead zone through subjective day where light does nothing.
export default function PhaseResponseCurve() {
  const t = useTranslations("viz.phase-response-curve");
  const [pulse, setPulse] = useState(0.62);

  // Shift in hours as a function of circadian phase (0..1). Zero across the
  // subjective day, negative (delay) in early night, positive (advance) late.
  function shiftAt(p: number): number {
    if (p < 0.45) return 0;
    if (p < 0.72) return -Math.sin(((p - 0.45) / 0.27) * Math.PI) * 1.6;
    return Math.sin(((p - 0.72) / 0.28) * Math.PI) * 1.9;
  }

  const shift = shiftAt(pulse);
  const kind = Math.abs(shift) < 0.08 ? "dead" : shift < 0 ? "delay" : "advance";
  const tone =
    kind === "dead" ? "var(--muted)" : kind === "delay" ? "var(--magenta)" : "var(--teal)";

  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const p = i / 200;
    pts.push(`${8 + p * 84},${(40 - shiftAt(p) * 9).toFixed(2)}`);
  }

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPulse(0.62)}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{t(`kinds.${kind}`)}</span>}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 78"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* subjective day / night bands */}
          <rect x="8" y="12" width={0.45 * 84} height="56" fill="var(--amber)" opacity={0.1} />
          <rect
            x={8 + 0.45 * 84}
            y="12"
            width={0.55 * 84}
            height="56"
            fill="var(--void)"
            opacity={0.5}
          />
          <line x1="8" y1="40" x2="92" y2="40" stroke="var(--border)" strokeWidth="0.4" />
          <polyline
            points={pts.join(" ")}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1.1"
            style={{ filter: "drop-shadow(0 0 3px var(--cyan))" }}
          />
          {/* the light pulse */}
          <line
            x1={8 + pulse * 84}
            y1="12"
            x2={8 + pulse * 84}
            y2="68"
            stroke={tone}
            strokeWidth="0.7"
            strokeDasharray="2 1.5"
          />
          <circle
            cx={8 + pulse * 84}
            cy={40 - shift * 9}
            r="2"
            fill={tone}
            style={{ filter: `drop-shadow(0 0 4px ${tone})` }}
          />
          <text
            x="50"
            y="75"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("shift")}
            value={`${shift >= 0 ? "+" : ""}${shift.toFixed(1)}`}
            unit="h"
            accent={kind === "delay" ? "magenta" : kind === "advance" ? "teal" : "foreground"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("pulseTime")}
            value={pulse}
            min={0}
            max={1}
            step={0.01}
            display={`${(pulse * 24).toFixed(1)} h`}
            onChange={setPulse}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
