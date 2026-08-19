"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// The species that time forgot. Most lineages on a geologically restless world are
// forced to keep changing; a few sit almost unchanged for aeons. Scrub the deep-
// time ticker and this creature barely shifts while ghost-layers of epochs sweep
// past. In canon the Na'vi appeared ~12 Myr ago and have scarcely changed since —
// a stillness Eywa is said to actively hold, with no Earthly precedent. When
// selection is weak or the niche is stable, stasis, not transformation, is the rule.
export default function EvolutionaryStasis() {
  const t = useTranslations("viz.evolutionary-stasis");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [myr, setMyr] = useState(0); // 0..400 million years elapsed
  const drift = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      drift.current = (drift.current + dt * 0.3) % 1;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  // morphological change is tiny even across 400 Myr — that's the whole point
  const change = (myr / 400) * 6; // max 6% wobble

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMyr(0)}
      allowFullscreen={false}
      caption={
        <span>
          {t("morphChange")}: <span className="text-teal">{change.toFixed(1)}%</span> · {t("over")}{" "}
          {Math.round(myr)} {t("myr")}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* ghost time-layers drifting past — epochs sweeping by */}
          {Array.from({ length: 5 }, (_, i) => {
            const gx = ((i * 22 + drift.current * 22 + (myr / 400) * 40) % 110) - 5;
            return (
              <line
                key={i}
                x1={gx}
                y1="18"
                x2={gx}
                y2="80"
                stroke="var(--border-strong)"
                strokeWidth="0.4"
                opacity="0.2"
              />
            );
          })}

          {/* the barely-changing creature at centre */}
          <g transform="translate(50 50)">
            {/* body — perturbed only by `change` */}
            <ellipse
              cx="0"
              cy="0"
              rx={16 + change * 0.2}
              ry={9 + change * 0.1}
              fill="var(--surface)"
              stroke="var(--teal)"
              strokeWidth="0.7"
              opacity="0.9"
            />
            <ellipse cx="0" cy="0" rx={16} ry={9} fill="var(--teal)" opacity="0.14" />
            {/* eyes — fixed */}
            <circle cx="-7" cy="-2" r="1.8" fill="var(--cyan)" />
            <circle cx="7" cy="-2" r="1.8" fill="var(--cyan)" />
            {/* six limbs, hardly moving */}
            {[-10, 0, 10].map((lx, i) => (
              <g key={i}>
                <line
                  x1={lx}
                  y1="8"
                  x2={lx + Math.sin(drift.current * 6 + i) * change * 0.3}
                  y2="16"
                  stroke="var(--teal)"
                  strokeWidth="0.8"
                  opacity="0.7"
                />
                <line
                  x1={lx}
                  y1="-8"
                  x2={lx + Math.sin(drift.current * 6 + i + 3) * change * 0.3}
                  y2="-16"
                  stroke="var(--teal)"
                  strokeWidth="0.8"
                  opacity="0.7"
                />
              </g>
            ))}
          </g>

          {/* stability marker */}
          <text
            x="50"
            y="90"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {change < 2 ? t("weakSelection") : t("slowDrift")}
          </text>
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("changeLabel")} value={`${change.toFixed(1)}%`} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("deepTime")}
            value={myr}
            min={0}
            max={400}
            step={1}
            onChange={setMyr}
            display={`${Math.round(myr)} ${t("myr")}`}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
