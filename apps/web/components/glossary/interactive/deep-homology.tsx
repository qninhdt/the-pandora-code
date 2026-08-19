"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The same ancient switch behind structures that look nothing alike. An insect's
// compound eye and a vertebrate's camera eye are built on utterly different plans,
// yet both are booted by one master gene, Pax6 — so deeply shared that a mouse's
// Pax6 can grow eyes on a fruit fly. Toggle Pax6 and both eyes light or go dark
// together: proof that "different structure" can hide a common deep-homologous
// genetic origin.
export default function DeepHomology() {
  const t = useTranslations("viz.deep-homology");
  const [pax6, setPax6] = useState(true);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPax6(true)}
      allowFullscreen={false}
      caption={
        pax6 ? (
          <span className="text-cyan">{t("bothEyesForm")}</span>
        ) : (
          <span className="text-muted">{t("noEyes")}</span>
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
          {/* the shared master gene at top, wiring down to both organisms */}
          <rect
            x="42"
            y="14"
            width="16"
            height="8"
            rx="1.5"
            fill={pax6 ? "var(--amber)" : "var(--surface)"}
            stroke={pax6 ? "var(--amber)" : "var(--border-strong)"}
            strokeWidth="0.6"
            opacity={pax6 ? 0.95 : 0.5}
          />
          <text
            x="50"
            y="10"
            textAnchor="middle"
            style={{
              fontSize: 3.4,
              fontFamily: "monospace",
              fill: pax6 ? "var(--amber)" : "var(--muted)",
            }}
          >
            Pax6
          </text>

          {/* wires to each eye */}
          <path
            d="M44 22 Q 28 30 24 42"
            fill="none"
            stroke={pax6 ? "var(--amber)" : "var(--border-strong)"}
            strokeWidth="0.5"
            opacity={pax6 ? 0.6 : 0.25}
            strokeDasharray="1.5 1.5"
          />
          <path
            d="M56 22 Q 72 30 76 42"
            fill="none"
            stroke={pax6 ? "var(--amber)" : "var(--border-strong)"}
            strokeWidth="0.5"
            opacity={pax6 ? 0.6 : 0.25}
            strokeDasharray="1.5 1.5"
          />

          {/* LEFT: insect compound eye */}
          <text
            x="24"
            y="36"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("insect")}
          </text>
          <g transform="translate(24 56)">
            {/* hexagonal ommatidia grid */}
            {Array.from({ length: 19 }, (_, i) => {
              const cols = [3, 4, 5, 4, 3];
              let idx = i;
              let row = 0;
              for (let r = 0; r < cols.length; r++) {
                if (idx < cols[r]) {
                  row = r;
                  break;
                }
                idx -= cols[r];
              }
              const rowLen = cols[row];
              const cx = (idx - (rowLen - 1) / 2) * 5;
              const cy = (row - 2) * 5;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="2"
                  fill={pax6 ? "var(--cyan)" : "var(--void)"}
                  opacity={pax6 ? 0.7 : 0.25}
                  stroke={pax6 ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth="0.3"
                />
              );
            })}
          </g>

          {/* RIGHT: vertebrate camera eye */}
          <text
            x="76"
            y="36"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("vertebrate")}
          </text>
          <g transform="translate(76 56)">
            <circle
              cx="0"
              cy="0"
              r="11"
              fill={pax6 ? "var(--surface)" : "var(--void)"}
              stroke={pax6 ? "var(--cyan)" : "var(--border-strong)"}
              strokeWidth="0.7"
              opacity={pax6 ? 0.9 : 0.4}
            />
            <circle
              cx="0"
              cy="0"
              r="6.5"
              fill={pax6 ? "var(--cyan)" : "var(--void)"}
              opacity={pax6 ? 0.6 : 0.2}
            />
            <circle cx="0" cy="0" r="3" fill={pax6 ? "var(--void)" : "var(--void)"} />
            {pax6 && <circle cx="-2.5" cy="-2.5" r="1.2" fill="var(--foreground)" opacity="0.8" />}
          </g>
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("masterGene")}
            value={pax6 ? t("on") : t("off")}
            accent={pax6 ? "amber" : "foreground"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setPax6((p) => !p)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md transition-colors"
            style={{
              borderColor: pax6 ? "var(--amber)" : "var(--border-strong)",
              color: pax6 ? "var(--amber)" : "var(--muted)",
              background: pax6
                ? "color-mix(in oklab, var(--amber) 12%, transparent)"
                : "var(--void)",
            }}
          >
            {pax6 ? t("togglePax6Off") : t("togglePax6On")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
