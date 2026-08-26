"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Four tiers of this book: Canon / Inference / Speculation / Real-science.
// Place claims on the ladder — speculation grants one premise, then pays full price.
const TIERS = ["canon", "inference", "speculation", "realScience"] as const;
const CLAIMS = [
  { id: 0, home: 0 },
  { id: 1, home: 1 },
  { id: 2, home: 2 },
  { id: 3, home: 3 },
];

export default function Speculation() {
  const t = useTranslations("viz.speculation");
  const [places, setPlaces] = useState(CLAIMS.map((c) => c.home));

  const cycle = (i: number) => {
    setPlaces((prev) => {
      const next = [...prev];
      next[i] = (next[i] + 1) % TIERS.length;
      return next;
    });
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPlaces(CLAIMS.map((c) => c.home))}
      allowFullscreen={false}
      caption={<span className="text-muted">{t("hint")}</span>}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {TIERS.map((tier, ti) => {
            const y = 22 + ti * 16;
            const col =
              tier === "canon"
                ? "var(--teal)"
                : tier === "inference"
                  ? "var(--cyan)"
                  : tier === "speculation"
                    ? "var(--amber)"
                    : "var(--magenta)";
            return (
              <g key={tier}>
                <rect
                  x="10"
                  y={y - 6}
                  width="80"
                  height="12"
                  rx="1.5"
                  fill="var(--surface)"
                  stroke={col}
                  strokeWidth="0.5"
                  opacity="0.55"
                />
                <text
                  x="14"
                  y={y + 1.5}
                  style={{ fontSize: 2.5, fontFamily: "monospace", fill: col }}
                >
                  {t(tier)}
                </text>
              </g>
            );
          })}

          {CLAIMS.map((c, i) => {
            const tier = places[i];
            const y = 22 + tier * 16;
            const x = 48 + i * 10;
            const col =
              tier === 0
                ? "var(--teal)"
                : tier === 1
                  ? "var(--cyan)"
                  : tier === 2
                    ? "var(--amber)"
                    : "var(--magenta)";
            return (
              <g key={c.id} onClick={() => cycle(i)} style={{ cursor: "pointer" }}>
                <circle
                  cx={x}
                  cy={y}
                  r="3.4"
                  fill={col}
                  stroke="var(--border-strong)"
                  strokeWidth="0.5"
                />
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.4,
                    fontFamily: "monospace",
                    fill: "var(--void)",
                  }}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("speculation")}
            value={String(places.filter((p) => p === 2).length)}
            accent="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
