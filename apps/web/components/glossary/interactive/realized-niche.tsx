"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Realized niche = fundamental minus biotic enemies. Toggle competitors and
// predators independently; usable zone shrinks on each axis.
export default function RealizedNiche() {
  const t = useTranslations("viz.realized-niche");
  const [competitors, setCompetitors] = useState(false);
  const [predators, setPredators] = useState(false);

  // base fundamental rectangle in niche space
  const base = { x: 18, y: 22, w: 64, h: 42 };
  let x = base.x;
  let y = base.y;
  let w = base.w;
  let h = base.h;
  if (competitors) {
    // competitors bite the warm/rich corner
    w *= 0.55;
    x = base.x;
  }
  if (predators) {
    // predators exclude open/exposed band
    h *= 0.55;
    y = base.y + base.h * 0.35;
  }

  const area = (w * h) / (base.w * base.h);
  const enemies = competitors || predators;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setCompetitors(false);
        setPredators(false);
      }}
      allowFullscreen={false}
      caption={
        <span className={enemies ? "text-magenta" : "text-teal"}>
          {t("realized")} {(area * 100).toFixed(0)}%
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
          <line x1="14" y1="70" x2="88" y2="70" stroke="var(--border-strong)" strokeWidth="0.4" />
          <line x1="14" y1="18" x2="14" y2="70" stroke="var(--border-strong)" strokeWidth="0.4" />

          {/* fundamental outline */}
          <rect
            x={base.x}
            y={base.y}
            width={base.w}
            height={base.h}
            fill="var(--cyan)"
            opacity="0.1"
            stroke="var(--cyan)"
            strokeWidth="0.6"
            strokeDasharray="2 1.5"
          />

          {/* realized fill */}
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill="var(--teal)"
            opacity="0.4"
            stroke="var(--teal)"
            strokeWidth="0.9"
          />

          {competitors && (
            <g>
              <rect
                x={base.x + base.w * 0.55}
                y={base.y}
                width={base.w * 0.45}
                height={base.h}
                fill="var(--magenta)"
                opacity="0.18"
              />
              <text
                x={base.x + base.w * 0.78}
                y={base.y + base.h * 0.5}
                textAnchor="middle"
                style={{ fontSize: 2.5, fontFamily: "monospace", fill: "var(--magenta)" }}
              >
                C
              </text>
            </g>
          )}

          {predators && (
            <g>
              <rect
                x={base.x}
                y={base.y}
                width={base.w}
                height={base.h * 0.35}
                fill="var(--amber)"
                opacity="0.18"
              />
              <text
                x={base.x + base.w * 0.5}
                y={base.y + base.h * 0.2}
                textAnchor="middle"
                style={{ fontSize: 2.5, fontFamily: "monospace", fill: "var(--amber)" }}
              >
                P
              </text>
            </g>
          )}

          <text
            x={x + w / 2}
            y={y + h / 2 + 1}
            textAnchor="middle"
            style={{ fontSize: 2.8, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            R
          </text>
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout
            label={t("realized")}
            value={`${(area * 100).toFixed(0)}%`}
            accent={enemies ? "magenta" : "teal"}
          />
          <ControlButton
            variant={competitors ? "active" : "default"}
            onClick={() => setCompetitors((c) => !c)}
            className="px-2.5 py-1.5"
          >
            C
          </ControlButton>
          <ControlButton
            variant={predators ? "active" : "default"}
            onClick={() => setPredators((p) => !p)}
            className="px-2.5 py-1.5"
          >
            P · {t("enemies")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
