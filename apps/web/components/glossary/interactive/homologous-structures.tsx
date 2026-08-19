"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Same bone order, three jobs: arm / flipper / wing. Reveal the shared scaffold
// and kinship goes real — the opposite of analogy's zero.
const FORMS = [
  { key: "arm", x: 22 },
  { key: "flipper", x: 50 },
  { key: "wing", x: 78 },
] as const;

// stylised 1-bone chain positions inside each glyph (relative)
const BONES = [
  { y: -10, w: 3.2 },
  { y: -2, w: 2.6 },
  { y: 5, w: 2.2 },
  { y: 12, w: 1.8 },
];

export default function HomologousStructures() {
  const t = useTranslations("viz.homologous-structures");
  const [show, setShow] = useState(false);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setShow(false)}
      allowFullscreen={false}
      caption={
        show ? (
          <span className="text-cyan">
            {t("sharedPlan")} · {t("kinship")}: {t("real")}
          </span>
        ) : (
          <span className="text-muted">{t("reveal")}</span>
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
          {FORMS.map((f) => (
            <g key={f.key} transform={`translate(${f.x} 48)`}>
              {/* outer silhouette differs per form */}
              <path
                d={
                  f.key === "arm"
                    ? "M0 -16 L6 -8 L5 4 L3 16 L-3 16 L-5 4 L-6 -8 Z"
                    : f.key === "flipper"
                      ? "M0 -14 L10 -4 L12 8 L4 16 L-4 16 L-12 8 L-10 -4 Z"
                      : "M0 -12 L14 -6 L18 4 L8 14 L0 10 L-8 14 L-18 4 L-14 -6 Z"
                }
                fill="var(--surface)"
                stroke="var(--border-strong)"
                strokeWidth="0.6"
                opacity="0.9"
              />
              {show &&
                BONES.map((b, i) => (
                  <rect
                    key={i}
                    x={-b.w / 2}
                    y={b.y}
                    width={b.w}
                    height="5"
                    rx="0.6"
                    fill="var(--cyan)"
                    opacity={0.95 - i * 0.1}
                  />
                ))}
              <text
                x="0"
                y="28"
                textAnchor="middle"
                style={{
                  fontSize: 2.8,
                  fontFamily: "monospace",
                  fill: show ? "var(--cyan)" : "var(--muted)",
                }}
              >
                {t(f.key)}
              </text>
            </g>
          ))}

          {show && (
            <path
              d="M28 48 Q 50 36 72 48"
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="0.6"
              strokeDasharray="1.5 1.5"
              opacity="0.7"
            />
          )}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("kinship")}
            value={show ? t("real") : "—"}
            accent={show ? "cyan" : "foreground"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md"
            style={{
              borderColor: show ? "var(--cyan)" : "var(--border-strong)",
              color: show ? "var(--cyan)" : "var(--muted)",
              background: show
                ? "color-mix(in oklab, var(--cyan) 12%, transparent)"
                : "var(--void)",
            }}
          >
            {show ? t("hide") : t("reveal")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
