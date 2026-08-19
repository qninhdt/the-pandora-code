"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Full abiotic envelope (large translucent zone). Competitors ON clip it to the
// realized niche — the classic Hutchinson distinction, static view.
export default function FundamentalNiche() {
  const t = useTranslations("viz.fundamental-niche");
  const [competitors, setCompetitors] = useState(false);

  // fundamental ellipse
  const fx = 50;
  const fy = 44;
  const frx = 34;
  const fry = 22;
  // realized = fundamental minus competitor bite (right-upper quadrant)
  const rx = competitors ? 38 : 50;
  const ry = competitors ? 48 : 44;
  const rrx = competitors ? 18 : 34;
  const rry = competitors ? 14 : 22;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCompetitors(false)}
      allowFullscreen={false}
      caption={
        <span className={competitors ? "text-magenta" : "text-teal"}>
          {competitors ? t("shrink") : t("full")}
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
          {/* axes of niche space */}
          <line x1="12" y1="72" x2="88" y2="72" stroke="var(--border-strong)" strokeWidth="0.4" />
          <line x1="12" y1="18" x2="12" y2="72" stroke="var(--border-strong)" strokeWidth="0.4" />
          <text
            x="50"
            y="80"
            textAnchor="middle"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            resource
          </text>
          <text
            x="6"
            y="45"
            textAnchor="middle"
            transform="rotate(-90 6 45)"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            cond.
          </text>

          {/* fundamental always drawn */}
          <ellipse
            cx={fx}
            cy={fy}
            rx={frx}
            ry={fry}
            fill="var(--cyan)"
            opacity={competitors ? 0.1 : 0.22}
            stroke="var(--cyan)"
            strokeWidth="0.7"
            strokeDasharray={competitors ? "2 1.5" : undefined}
          />

          {/* realized */}
          <ellipse
            cx={rx}
            cy={ry}
            rx={rrx}
            ry={rry}
            fill="var(--teal)"
            opacity={competitors ? 0.35 : 0.2}
            stroke="var(--teal)"
            strokeWidth="0.9"
          />

          {competitors && (
            <>
              {/* competitor pressure wedges */}
              <ellipse
                cx="72"
                cy="32"
                rx="16"
                ry="12"
                fill="var(--magenta)"
                opacity="0.2"
                stroke="var(--magenta)"
                strokeWidth="0.5"
              />
              <text
                x="72"
                y="33"
                textAnchor="middle"
                style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--magenta)" }}
              >
                C
              </text>
            </>
          )}

          <text
            x={competitors ? rx : fx}
            y={competitors ? ry + 1 : fy + 1}
            textAnchor="middle"
            style={{
              fontSize: 2.6,
              fontFamily: "monospace",
              fill: competitors ? "var(--teal)" : "var(--cyan)",
            }}
          >
            {competitors ? "R" : "F"}
          </text>
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout
            label={competitors ? t("shrink") : t("full")}
            value={competitors ? "R ⊂ F" : "F"}
            accent={competitors ? "magenta" : "cyan"}
          />
          <ControlButton
            variant={competitors ? "active" : "default"}
            onClick={() => setCompetitors((c) => !c)}
            className="px-2.5 py-1.5"
          >
            {t("competitors")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
