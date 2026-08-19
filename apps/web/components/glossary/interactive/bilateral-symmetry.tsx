"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The mirror axis that defines almost every animal you know. A bilaterian has a
// left and a right that reflect across one head-to-tail line — and that symmetry
// travels with a leading head, a forward direction, and a brain gathered at the
// front. Drag the corruption slider and the two halves drift out of register: the
// readout's symmetry score falls, and you can see why evolution keeps the mirror
// clean — a lopsided body has no honest "forward" to move or sense along.
export default function BilateralSymmetry() {
  const t = useTranslations("viz.bilateral-symmetry");
  const [corrupt, setCorrupt] = useState(0); // 0..1 asymmetry

  const symmetry = Math.round((1 - corrupt) * 100);
  const clean = corrupt < 0.08;

  // right-half features get displaced by the corruption amount
  const jx = corrupt * 10;
  const jy = corrupt * 6;

  // paired features: [x offset from axis, y]
  const pairs = [
    { dx: 8, y: 34, r: 3 }, // eyes upper
    { dx: 5, y: 42, r: 2 }, // eyes lower
    { dx: 12, y: 54, r: 2.4 }, // limbs upper
    { dx: 13, y: 68, r: 2.4 }, // limbs lower
  ];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCorrupt(0)}
      allowFullscreen={false}
      caption={
        clean ? (
          <span className="text-teal">{t("cleanAxis")}</span>
        ) : (
          <span className="text-magenta">{t("broken")}</span>
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
          {/* mirror axis */}
          <line
            x1="50"
            y1="20"
            x2="50"
            y2="82"
            stroke="var(--cyan)"
            strokeWidth="0.4"
            strokeDasharray="2 1.5"
            opacity={clean ? 0.7 : 0.3}
          />
          {clean && (
            <text
              x="52"
              y="24"
              className="fill-cyan"
              style={{ fontSize: 3, fontFamily: "monospace" }}
            >
              {t("axis")}
            </text>
          )}

          {/* body outline (left half fixed, right half distorts) */}
          <path
            d="M50 22 Q 38 30 40 48 Q 42 66 48 80 L 50 80 Z"
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth="0.6"
            opacity="0.9"
          />
          <path
            d={`M50 ${22 + jy} Q ${62 + jx} ${30 + jy} ${60 + jx} 48 Q ${58 + jx} ${66 - jy} ${52} 80 L 50 80 Z`}
            fill="var(--surface)"
            stroke={clean ? "var(--teal)" : "var(--magenta)"}
            strokeWidth="0.6"
            opacity="0.9"
          />

          {/* paired features */}
          {pairs.map((p, i) => (
            <g key={i}>
              {/* left (fixed) */}
              <circle cx={50 - p.dx} cy={p.y} r={p.r} fill="var(--cyan)" opacity="0.8" />
              {/* right (displaced by corruption) */}
              <circle
                cx={50 + p.dx + jx}
                cy={p.y + jy}
                r={p.r}
                fill={clean ? "var(--cyan)" : "var(--magenta)"}
                opacity="0.8"
              />
            </g>
          ))}

          {/* forward-direction arrow (meaningful only when symmetric) */}
          <g transform="translate(50 16)" opacity={clean ? 0.9 : 0.3}>
            <path
              d="M0 4 L0 -4 M-2 -1.5 L0 -4 L2 -1.5"
              stroke="var(--teal)"
              strokeWidth="0.7"
              fill="none"
            />
            <text
              x="4"
              y="0"
              className="fill-muted"
              style={{ fontSize: 2.6, fontFamily: "monospace" }}
            >
              {t("forward")}
            </text>
          </g>
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("symmetryLabel")}
            value={`${symmetry}%`}
            accent={clean ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("corruption")}
            value={corrupt}
            min={0}
            max={1}
            step={0.01}
            onChange={setCorrupt}
            display={clean ? t("symmetric") : `${Math.round(corrupt * 100)}%`}
            thumb={clean ? "teal" : "magenta"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
