"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// One ancestral lineage fanning out to fill a world of empty jobs. Toggle a niche
// open and a descendant lineage rushes in to claim it, adapted to that role; close
// it and the lineage that depended on it fades to extinction. Pandora's whole
// bestiary reads this way — one enormous radiation off a single six-limbed stock,
// each branch shaped to a different corner of the moon.
const NICHES = [
  { key: "canopy", angle: -75, color: "var(--teal)" },
  { key: "understory", angle: -45, color: "var(--cyan)" },
  { key: "ground", angle: -15, color: "var(--teal)" },
  { key: "river", angle: 15, color: "var(--cyan)" },
  { key: "coast", angle: 45, color: "var(--teal)" },
  { key: "air", angle: 75, color: "var(--amber)" },
];

export default function AdaptiveRadiation() {
  const t = useTranslations("viz.adaptive-radiation");
  const [open, setOpen] = useState<boolean[]>([true, true, true, false, true, false]);

  const filled = open.filter(Boolean).length;
  const ax = 50;
  const ay = 86;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOpen([true, true, true, false, true, false])}
      allowFullscreen={false}
      caption={
        <span>
          {t("lineages")}: <span className="text-teal">{filled}</span> / {NICHES.length} ·{" "}
          {t("tapNiche")}
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
          {/* branches to each niche */}
          {NICHES.map((n, i) => {
            const rad = (n.angle * Math.PI) / 180;
            const len = 58;
            const ex = ax + Math.sin(rad) * len;
            const ey = ay - Math.cos(rad) * len;
            const on = open[i];
            return (
              <g key={n.key}>
                <line
                  x1={ax}
                  y1={ay}
                  x2={ex}
                  y2={ey}
                  stroke={on ? n.color : "var(--border-strong)"}
                  strokeWidth={on ? 1.1 : 0.5}
                  opacity={on ? 0.8 : 0.3}
                  strokeDasharray={on ? undefined : "2 2"}
                />
                {/* descendant node — a small creature glyph */}
                <circle
                  cx={ex}
                  cy={ey}
                  r={on ? 4.2 : 2.6}
                  fill={on ? n.color : "var(--surface)"}
                  opacity={on ? 0.9 : 0.25}
                  stroke={on ? n.color : "var(--border-strong)"}
                  strokeWidth="0.5"
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={t(n.key)}
                  aria-pressed={on}
                  onClick={() => setOpen((p) => p.map((v, j) => (j === i ? !v : v)))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpen((p) => p.map((v, j) => (j === i ? !v : v)));
                    }
                  }}
                />
                <text
                  x={ex}
                  y={ey - 6}
                  textAnchor="middle"
                  style={{
                    fontSize: 3,
                    fontFamily: "monospace",
                    fill: on ? n.color : "var(--muted)",
                    opacity: on ? 0.9 : 0.4,
                  }}
                >
                  {t(n.key)}
                </text>
              </g>
            );
          })}

          {/* ancestral stock at the root */}
          <circle cx={ax} cy={ay} r="5" fill="var(--foreground)" opacity="0.9" />
          <text
            x={ax}
            y={ay + 10}
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("ancestor")}
          </text>
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("nichesFilled")} value={`${filled}/${NICHES.length}`} accent="teal" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
