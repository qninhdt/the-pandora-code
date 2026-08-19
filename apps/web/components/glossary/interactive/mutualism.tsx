"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Two partners exchange benefits. Linked → both fitness high; severed → both drop.
// Scale shows cost/benefit balance.
export default function Mutualism() {
  const t = useTranslations("viz.mutualism");
  const [linked, setLinked] = useState(true);

  const baseA = 0.4;
  const baseB = 0.4;
  const bonus = linked ? 0.45 : 0;
  const fitA = baseA + bonus;
  const fitB = baseB + bonus;
  // scale tilt: positive = A heavier benefit side when linked balanced
  const tilt = linked ? 0 : -18;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setLinked(true)}
      allowFullscreen={false}
      caption={
        <span className={linked ? "text-teal" : "text-magenta"}>
          {linked ? t("linked") : t("severed")}
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
          {/* partner A — flower */}
          <g transform="translate(28 42)">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <ellipse
                key={deg}
                cx={Math.cos((deg * Math.PI) / 180) * 6}
                cy={Math.sin((deg * Math.PI) / 180) * 6}
                rx="3.5"
                ry="2.2"
                transform={`rotate(${deg})`}
                fill="var(--magenta)"
                opacity={0.4 + fitA * 0.55}
              />
            ))}
            <circle cx="0" cy="0" r="3" fill="var(--amber)" opacity={0.7 + fitA * 0.3} />
          </g>

          {/* partner B — pollinator */}
          <g transform="translate(72 42)">
            <ellipse
              cx="0"
              cy="0"
              rx="7"
              ry="4"
              fill="var(--cyan)"
              opacity={0.4 + fitB * 0.55}
            />
            <ellipse cx="-2" cy="-5" rx="4" ry="2" fill="var(--teal)" opacity="0.5" />
            <ellipse cx="2" cy="-5" rx="4" ry="2" fill="var(--teal)" opacity="0.5" />
            <circle cx="5" cy="0" r="1.2" fill="var(--foreground)" />
          </g>

          {/* link beam */}
          <path
            d="M38 42 Q50 30 62 42"
            fill="none"
            stroke={linked ? "var(--teal)" : "var(--magenta)"}
            strokeWidth={linked ? 1.4 : 0.6}
            strokeDasharray={linked ? undefined : "2 2"}
            opacity={linked ? 0.9 : 0.4}
          />
          {linked && (
            <>
              <circle cx="44" cy="36" r="1.2" fill="var(--amber)" opacity="0.8" />
              <circle cx="56" cy="36" r="1.2" fill="var(--cyan)" opacity="0.8" />
            </>
          )}

          {/* fitness meters */}
          <g transform="translate(28 68)">
            <text
              x="0"
              y="-4"
              textAnchor="middle"
              style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
            >
              {t("fitnessA")}
            </text>
            <rect x="-12" y="0" width="24" height="4" rx="1" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="0.3" />
            <rect x="-12" y="0" width={24 * fitA} height="4" rx="1" fill="var(--magenta)" opacity="0.85" />
          </g>
          <g transform="translate(72 68)">
            <text
              x="0"
              y="-4"
              textAnchor="middle"
              style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
            >
              {t("fitnessB")}
            </text>
            <rect x="-12" y="0" width="24" height="4" rx="1" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="0.3" />
            <rect x="-12" y="0" width={24 * fitB} height="4" rx="1" fill="var(--cyan)" opacity="0.85" />
          </g>

          {/* balance scale */}
          <g transform={`translate(50 88) rotate(${tilt})`}>
            <line x1="-16" y1="0" x2="16" y2="0" stroke="var(--amber)" strokeWidth="0.8" />
            <line x1="0" y1="0" x2="0" y2="-6" stroke="var(--amber)" strokeWidth="0.6" />
            <circle cx="-14" cy="2" r="2.5" fill="var(--magenta)" opacity="0.6" />
            <circle cx="14" cy="2" r="2.5" fill="var(--cyan)" opacity="0.6" />
          </g>
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("fitnessA")} value={`${Math.round(fitA * 100)}%`} accent="magenta" />
          <Readout label={t("fitnessB")} value={`${Math.round(fitB * 100)}%`} accent="cyan" />
        </div>

        <div className="absolute right-3 top-14">
          <ControlButton
            variant={linked ? "active" : "accent"}
            onClick={() => setLinked((v) => !v)}
            className="px-2.5 py-1.5"
          >
            {linked ? t("linked") : t("severed")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
