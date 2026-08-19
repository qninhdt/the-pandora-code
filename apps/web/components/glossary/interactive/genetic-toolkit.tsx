"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// One toolbox, endless forms. Nearly every animal shares the same ancient set of
// developmental regulators — the same eye-builder, the same limb-initiator, the
// same Hox address-makers. The staggering diversity of animal bodies comes not
// from each lineage inventing new tools but from using the shared kit differently.
// Line an Earth arthropod's genes against a Pandoran hexapod's: the conserved
// toolkit genes glow the same cyan across the gap, the species-specific extras
// stand apart. Tap a tool to trace it in both.
const TOOLKIT = [
  { key: "pax6", shared: true },
  { key: "distalless", shared: true },
  { key: "hox", shared: true },
  { key: "tinman", shared: true },
  { key: "wnt", shared: true },
];
const EARTH_ONLY = [{ key: "chitinSynth" }];
const PANDORA_ONLY = [{ key: "carbonFibre" }];

export default function GeneticToolkit() {
  const t = useTranslations("viz.genetic-toolkit");
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPicked(null)}
      allowFullscreen={false}
      caption={
        picked && TOOLKIT.some((g) => g.key === picked) ? (
          <span className="text-cyan">{t("conservedAcross")}</span>
        ) : (
          <span>
            <span className="text-cyan">{TOOLKIT.length}</span> {t("sharedTools")} · {t("tapTool")}
          </span>
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
          <text
            x="24"
            y="20"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("earthArthropod")}
          </text>
          <text
            x="76"
            y="20"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("pandoraHexapod")}
          </text>

          {/* shared toolkit genes — matched rows glowing the same cyan */}
          {TOOLKIT.map((g, i) => {
            const y = 28 + i * 9;
            const on = picked === g.key;
            return (
              <g key={g.key}>
                {/* connector across the gap */}
                <line
                  x1="34"
                  y1={y}
                  x2="66"
                  y2={y}
                  stroke="var(--cyan)"
                  strokeWidth={on ? 0.9 : 0.4}
                  opacity={on ? 0.8 : 0.35}
                  strokeDasharray="1.5 1.5"
                />
                {/* left copy */}
                <rect
                  x="16"
                  y={y - 3}
                  width="18"
                  height="6"
                  rx="1"
                  fill="var(--cyan)"
                  opacity={on ? 0.95 : 0.6}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={t(g.key)}
                  onClick={() => setPicked(g.key === picked ? null : g.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPicked(g.key === picked ? null : g.key);
                    }
                  }}
                />
                {/* right copy */}
                <rect
                  x="66"
                  y={y - 3}
                  width="18"
                  height="6"
                  rx="1"
                  fill="var(--cyan)"
                  opacity={on ? 0.95 : 0.6}
                />
                <text
                  x="50"
                  y={y + 1.2}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.4,
                    fontFamily: "monospace",
                    fill: on ? "var(--cyan)" : "var(--muted)",
                  }}
                >
                  {t(g.key)}
                </text>
              </g>
            );
          })}

          {/* species-specific genes at the bottom, in distinct colors, unmatched */}
          {EARTH_ONLY.map((g) => (
            <g key={g.key}>
              <rect x="16" y="76" width="18" height="6" rx="1" fill="var(--amber)" opacity="0.7" />
              <text
                x="25"
                y="86"
                textAnchor="middle"
                style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--amber)" }}
              >
                {t(g.key)}
              </text>
            </g>
          ))}
          {PANDORA_ONLY.map((g) => (
            <g key={g.key}>
              <rect
                x="66"
                y="76"
                width="18"
                height="6"
                rx="1"
                fill="var(--magenta)"
                opacity="0.7"
              />
              <text
                x="75"
                y="86"
                textAnchor="middle"
                style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--magenta)" }}
              >
                {t(g.key)}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("sharedLabel")} value={`${TOOLKIT.length}`} accent="cyan" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
