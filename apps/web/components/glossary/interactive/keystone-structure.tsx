"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// One tree in an empty field. Remove it and the crossing birds have no waypoint,
// the seed rain has no focus, the invertebrates have no island — a tiny footprint
// carrying a share of the life wildly out of proportion to its area.
export default function KeystoneStructure() {
  const t = useTranslations("viz.keystone-structure");
  const [present, setPresent] = useState(true);

  const tone = present ? "var(--cyan)" : "var(--magenta)";
  const species = present ? 24 : 5;

  // Birds route through the tree when it is there, and scatter when it is not.
  const hops = present
    ? [
        [12, 40, 46, 34],
        [46, 34, 84, 26],
        [14, 52, 46, 40],
        [46, 40, 86, 46],
      ]
    : [
        [12, 40, 30, 30],
        [58, 22, 74, 34],
        [16, 56, 34, 62],
        [66, 52, 84, 44],
      ];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPresent(true)}
      allowFullscreen={false}
      caption={
        <span style={{ color: tone }}>{present ? t("verdictPresent") : t("verdictGone")}</span>
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 78"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* the empty field */}
          <rect x="6" y="56" width="88" height="8" fill="var(--void)" opacity={0.5} />
          <line
            x1="6"
            y1="56"
            x2="94"
            y2="56"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
            opacity={0.6}
          />

          {present ? (
            <g>
              <line
                x1="50"
                y1="56"
                x2="50"
                y2="30"
                stroke={tone}
                strokeWidth="2.4"
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${tone})` }}
              />
              <ellipse cx="50" cy="28" rx="11" ry="6" fill={tone} opacity={0.35} />
              <ellipse cx="50" cy="56" rx="9" ry="2" fill={tone} opacity={0.2} />
              {/* seed rain focused under the crown */}
              {[-6, -2, 2, 6].map((dx, i) => (
                <circle key={i} cx={50 + dx} cy={53} r="0.9" fill="var(--teal)" opacity={0.8} />
              ))}
            </g>
          ) : (
            <g>
              <path d="M46 56 L48 51 L52 51 L54 56 Z" fill="var(--muted)" opacity={0.5} />
            </g>
          )}

          {/* movement paths across the gap */}
          {hops.map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={tone}
              strokeWidth="0.45"
              strokeDasharray="2 1.6"
              opacity={present ? 0.75 : 0.35}
            />
          ))}
          <text
            x="50"
            y="70"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("species")} value={species} accent={present ? "cyan" : "magenta"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlTabs
            options={[
              { value: "yes", label: t("modes.present") },
              { value: "no", label: t("modes.gone") },
            ]}
            value={present ? "yes" : "no"}
            onChange={(v) => setPresent(v === "yes")}
            ariaLabel={t("title")}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
