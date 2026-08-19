"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The superconductor that lets the field in — on its own terms. A Type-I metal is
// an absolutist: full Meissner expulsion until the field wins and it collapses to
// normal, all-or-nothing. A Type-II material has two thresholds. Below the first
// (Hc1) it expels everything; above the second (Hc2) it dies; but in the wide
// mixed state between, it admits the field as a forest of discrete quantized
// threads — Abrikosov vortices in a hexagonal lattice — while the bulk between
// them stays superconducting. That tolerance for high fields is why every
// practical superconductor is Type-II, and where flux pinning gets its hooks.
export default function TypeIiSuperconductor() {
  const t = useTranslations("viz.type-ii-superconductor");
  const [field, setField] = useState(0.45); // 0..1 applied field (vertical axis)

  const HC1 = 0.28;
  const HC2 = 0.78;
  const regime = field < HC1 ? "meissner" : field < HC2 ? "mixed" : "normal";
  const mixed = regime === "mixed";

  // vortex count grows through the mixed state only. Above Hc2 superconductivity
  // is destroyed and there are no discrete quantized vortices at all — the field
  // floods the material uniformly, drawn separately below.
  const density = mixed ? (field - HC1) / (HC2 - HC1) : 0;

  // hexagonal Abrikosov lattice inside the sample box
  const BOX = { x: 12, y: 20, w: 52, h: 56 };
  const vortices: { x: number; y: number }[] = [];
  if (density > 0) {
    const cols = 6;
    const rows = 5;
    const dx = BOX.w / cols;
    const dy = BOX.h / rows;
    const maxV = cols * rows;
    const shown = Math.round(density * maxV);
    let count = 0;
    for (let r = 0; r < rows && count < shown; r++) {
      for (let c = 0; c < cols && count < shown; c++) {
        const x = BOX.x + dx * (c + 0.5) + (r % 2) * dx * 0.5;
        const y = BOX.y + dy * (r + 0.5);
        if (x < BOX.x + BOX.w - 2) {
          vortices.push({ x, y });
          count++;
        }
      }
    }
  }

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setField(0.45)}
      allowFullscreen={false}
      caption={
        regime === "meissner" ? (
          <span className="text-teal">{t("meissnerState")}</span>
        ) : regime === "mixed" ? (
          <span className="text-cyan">{t("mixedState")}</span>
        ) : (
          <span className="text-magenta">{t("normalState")}</span>
        )
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* the material sample */}
          <rect
            x={BOX.x}
            y={BOX.y}
            width={BOX.w}
            height={BOX.h}
            rx="2"
            fill={regime === "normal" ? "#3a4150" : "var(--surface)"}
            stroke={
              regime === "meissner"
                ? "var(--teal)"
                : regime === "mixed"
                  ? "var(--cyan)"
                  : "var(--magenta)"
            }
            strokeWidth="0.8"
          />
          <rect
            x={BOX.x}
            y={BOX.y}
            width={BOX.w}
            height={BOX.h}
            rx="2"
            fill={regime === "meissner" ? "var(--teal)" : "var(--cyan)"}
            opacity={regime === "meissner" ? 0.14 : mixed ? 0.06 : 0}
          />

          {/* Abrikosov vortices — quantized flux threads, mixed state only */}
          {vortices.map((v, i) => (
            <g key={i}>
              <circle
                cx={v.x}
                cy={v.y}
                r="2.6"
                fill="none"
                stroke="var(--cyan)"
                strokeWidth="0.4"
                opacity="0.5"
              />
              <circle cx={v.x} cy={v.y} r="1.1" fill="var(--cyan)" opacity="0.85" />
            </g>
          ))}

          {/* normal state: superconductivity destroyed — the field floods the
              dead material uniformly, no discrete vortices left */}
          {regime === "normal" &&
            Array.from({ length: 7 }, (_, i) => {
              const x = BOX.x + 4 + i * ((BOX.w - 8) / 6);
              return (
                <line
                  key={i}
                  x1={x}
                  y1={BOX.y + 2}
                  x2={x}
                  y2={BOX.y + BOX.h - 2}
                  stroke="var(--magenta)"
                  strokeWidth="0.5"
                  opacity="0.4"
                />
              );
            })}

          {/* meissner: field-excluded arrows arcing around the box */}
          {regime === "meissner" &&
            [22, 38, 54].map((y, i) => (
              <path
                key={i}
                d={`M4 ${y} Q ${BOX.x - 3} ${y} ${BOX.x - 3} ${y + 6}`}
                fill="none"
                stroke="var(--teal)"
                strokeWidth="0.4"
                opacity="0.5"
              />
            ))}

          {/* applied-field axis on the right */}
          <line x1="80" y1="76" x2="80" y2="20" stroke="var(--border-strong)" strokeWidth="0.5" />
          <path d="M80 20 l -1.6 3 l 3.2 0 Z" fill="var(--border-strong)" />
          <text
            x="80"
            y="82"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("appliedField")}
          </text>
          {/* threshold ticks */}
          {[
            { v: HC1, label: "Hc1", color: "var(--teal)" },
            { v: HC2, label: "Hc2", color: "var(--magenta)" },
          ].map((th) => {
            const y = 76 - th.v * 56;
            return (
              <g key={th.label}>
                <line x1="77" y1={y} x2="83" y2={y} stroke={th.color} strokeWidth="0.6" />
                <text
                  x="86"
                  y={y + 1}
                  className="fill-muted"
                  style={{ fontSize: 2.8, fontFamily: "monospace", fill: th.color }}
                >
                  {th.label}
                </text>
              </g>
            );
          })}
          {/* live field marker */}
          <circle cx="80" cy={76 - field * 56} r="1.8" fill="var(--foreground)" />
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("vorticesLabel")}
            value={vortices.length}
            accent={mixed ? "cyan" : "foreground"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("fieldStrength")}
            value={field}
            min={0}
            max={1}
            step={0.01}
            onChange={setField}
            display={t(`${regime}Short`)}
            thumb={regime === "meissner" ? "teal" : mixed ? "cyan" : "magenta"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
