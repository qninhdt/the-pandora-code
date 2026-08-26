"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Plant ↔ fungus trading floor: carbon for phosphorus. Each side accepts when the
// other's offer beats its reservation price; otherwise it defects. Equilibrium is
// the knife-edge where both accept.
export default function BiologicalMarket() {
  const t = useTranslations("viz.biological-market");
  const [carbon, setCarbon] = useState(0.55);
  const [phosphorus, setPhosphorus] = useState(0.5);

  // Plant wants high P relative to C cost; fungus wants high C relative to P cost.
  const plantAccepts = phosphorus >= carbon * 0.85;
  const fungusAccepts = carbon >= phosphorus * 0.9;
  const equilibrium = plantAccepts && fungusAccepts;

  const tradeFlow = useMemo(() => {
    if (!equilibrium) return 0;
    return Math.min(carbon, phosphorus);
  }, [carbon, phosphorus, equilibrium]);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setCarbon(0.55);
        setPhosphorus(0.5);
      }}
      allowFullscreen={false}
      caption={
        <span className={equilibrium ? "text-teal" : "text-magenta"}>
          {equilibrium
            ? t("equilibrium")
            : `${plantAccepts ? "P" : "C"} / ${fungusAccepts ? "F" : "D"}`}
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
          {/* trading floor baseline */}
          <line
            x1="12"
            y1="52"
            x2="88"
            y2="52"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            strokeDasharray="1.5 1.5"
          />

          {/* plant (left) */}
          <g transform="translate(22 48)">
            <ellipse
              cx="0"
              cy="8"
              rx="10"
              ry="6"
              fill="var(--surface)"
              stroke="var(--teal)"
              strokeWidth="0.7"
            />
            <path
              d="M0 2 C-4 -10, -8 -14, 0 -18 C8 -14, 4 -10, 0 2"
              fill="var(--teal)"
              opacity={0.55 + carbon * 0.4}
            />
            <circle cx="0" cy="-16" r="2.2" fill="var(--teal)" />
            <text
              x="0"
              y="18"
              textAnchor="middle"
              style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--teal)" }}
            >
              C→
            </text>
          </g>

          {/* fungus (right) */}
          <g transform="translate(78 48)">
            <ellipse
              cx="0"
              cy="8"
              rx="10"
              ry="6"
              fill="var(--surface)"
              stroke="var(--amber)"
              strokeWidth="0.7"
            />
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1={-6 + i * 4}
                y1="4"
                x2={-8 + i * 5}
                y2={-10 - (i % 2) * 4}
                stroke="var(--amber)"
                strokeWidth="0.8"
                opacity={0.5 + phosphorus * 0.45}
              />
            ))}
            <text
              x="0"
              y="18"
              textAnchor="middle"
              style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--amber)" }}
            >
              ←P
            </text>
          </g>

          {/* exchange beams */}
          <path
            d={`M32 44 Q50 ${44 - tradeFlow * 18} 68 44`}
            fill="none"
            stroke="var(--teal)"
            strokeWidth={0.6 + carbon * 1.4}
            opacity={plantAccepts ? 0.85 : 0.15}
            strokeDasharray={fungusAccepts ? undefined : "2 2"}
          />
          <path
            d={`M68 56 Q50 ${56 + tradeFlow * 14} 32 56`}
            fill="none"
            stroke="var(--amber)"
            strokeWidth={0.6 + phosphorus * 1.4}
            opacity={fungusAccepts ? 0.85 : 0.15}
            strokeDasharray={plantAccepts ? undefined : "2 2"}
          />

          {/* deal marker */}
          <circle
            cx="50"
            cy="50"
            r={equilibrium ? 4 + tradeFlow * 3 : 2.5}
            fill={equilibrium ? "var(--cyan)" : "var(--magenta)"}
            opacity={equilibrium ? 0.7 : 0.35}
          />

          {/* accept / defect chips */}
          <g transform="translate(22 78)">
            <rect
              x="-12"
              y="-4"
              width="24"
              height="8"
              rx="1.5"
              fill="var(--void)"
              stroke={plantAccepts ? "var(--teal)" : "var(--magenta)"}
              strokeWidth="0.5"
            />
            <text
              x="0"
              y="1.5"
              textAnchor="middle"
              style={{
                fontSize: 2.8,
                fontFamily: "monospace",
                fill: plantAccepts ? "var(--teal)" : "var(--magenta)",
              }}
            >
              {plantAccepts ? t("accept") : t("defect")}
            </text>
          </g>
          <g transform="translate(78 78)">
            <rect
              x="-12"
              y="-4"
              width="24"
              height="8"
              rx="1.5"
              fill="var(--void)"
              stroke={fungusAccepts ? "var(--amber)" : "var(--magenta)"}
              strokeWidth="0.5"
            />
            <text
              x="0"
              y="1.5"
              textAnchor="middle"
              style={{
                fontSize: 2.8,
                fontFamily: "monospace",
                fill: fungusAccepts ? "var(--amber)" : "var(--magenta)",
              }}
            >
              {fungusAccepts ? t("accept") : t("defect")}
            </text>
          </g>
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout
            label={t("equilibrium")}
            value={equilibrium ? t("accept") : t("defect")}
            accent={equilibrium ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10 space-y-2">
          <ControlSlider
            label={t("carbon")}
            value={carbon}
            min={0.1}
            max={1}
            step={0.02}
            display={`${Math.round(carbon * 100)}%`}
            onChange={setCarbon}
            thumb="teal"
          />
          <ControlSlider
            label={t("phosphorus")}
            value={phosphorus}
            min={0.1}
            max={1}
            step={0.02}
            display={`${Math.round(phosphorus * 100)}%`}
            onChange={setPhosphorus}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
