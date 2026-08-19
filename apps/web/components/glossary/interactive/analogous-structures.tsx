"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Same job, unrelated origin. An insect's wing and a bat's wing both solve flight
// but are built from entirely different materials, on different lineages — analogy,
// the product of convergence, not inheritance. Tap the shared function and both
// solutions light in matching glow while the readout reminds you their kinship is
// zero. When a thanator wears a panther's build with no cat in its ancestry, this
// is analogy at planetary scale.
const FUNCTIONS = [
  { key: "flight", left: "insectWing", right: "bansheeWing" },
  { key: "swimming", left: "fishFin", right: "tulkunFluke" },
  { key: "grasping", left: "mantisClaw", right: "napalmGrip" },
];

export default function AnalogousStructures() {
  const t = useTranslations("viz.analogous-structures");
  const [fn, setFn] = useState(0);
  const active = FUNCTIONS[fn];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setFn(0)}
      allowFullscreen={false}
      caption={
        <span>
          {t("sharedFunction")}: <span className="text-amber">{t(active.key)}</span> ·{" "}
          <span className="text-magenta">{t("kinshipZero")}</span>
        </span>
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
          {/* dividing line — separate lineages */}
          <line
            x1="50"
            y1="18"
            x2="50"
            y2="78"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            strokeDasharray="2 2"
            opacity="0.5"
          />
          <text
            x="25"
            y="24"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("earthLineage")}
          </text>
          <text
            x="75"
            y="24"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("pandoraLineage")}
          </text>

          {/* left creature — abstract wing/fin/claw glyph */}
          <g transform="translate(25 48)">
            <path
              d="M0 0 L-14 -10 L-16 -4 L-12 2 L-15 8 L-9 6 L-4 12 L0 6 Z"
              fill="var(--teal)"
              opacity="0.85"
            />
            {/* veins */}
            {[-9, -5, -1].map((dx, i) => (
              <line
                key={i}
                x1="0"
                y1="0"
                x2={dx}
                y2={2 + i * 3}
                stroke="var(--void)"
                strokeWidth="0.3"
                opacity="0.5"
              />
            ))}
          </g>
          <text
            x="25"
            y="72"
            textAnchor="middle"
            style={{ fontSize: 2.8, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            {t(active.left)}
          </text>

          {/* right creature — mirrored, different material (magenta build) */}
          <g transform="translate(75 48) scale(-1 1)">
            <path
              d="M0 0 L-16 -8 L-20 -2 L-14 3 L-18 9 L-10 7 L-5 13 L0 7 Z"
              fill="var(--cyan)"
              opacity="0.85"
            />
            {[-11, -6, -2].map((dx, i) => (
              <line
                key={i}
                x1="0"
                y1="0"
                x2={dx}
                y2={3 + i * 3}
                stroke="var(--void)"
                strokeWidth="0.3"
                opacity="0.5"
              />
            ))}
          </g>
          <text
            x="75"
            y="72"
            textAnchor="middle"
            style={{ fontSize: 2.8, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            {t(active.right)}
          </text>

          {/* matching-function glow arc connecting them */}
          <path
            d="M33 44 Q 50 34 67 44"
            fill="none"
            stroke="var(--amber)"
            strokeWidth="0.8"
            strokeDasharray="1.5 1.5"
            opacity="0.7"
          />
          <text
            x="50"
            y="36"
            textAnchor="middle"
            style={{ fontSize: 3, fontFamily: "monospace", fill: "var(--amber)" }}
          >
            {t(active.key)}
          </text>
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("kinship")} value={t("none")} accent="magenta" />
        </div>

        {/* function selector chips */}
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {FUNCTIONS.map((f, i) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFn(i)}
              className="rounded-lg border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-md transition-colors"
              style={{
                borderColor: fn === i ? "var(--amber)" : "var(--border-strong)",
                color: fn === i ? "var(--amber)" : "var(--muted)",
                background:
                  fn === i ? "color-mix(in oklab, var(--amber) 12%, transparent)" : "var(--void)",
              }}
            >
              {t(f.key)}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
