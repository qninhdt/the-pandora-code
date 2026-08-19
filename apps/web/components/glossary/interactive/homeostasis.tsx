"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// A temperature line living inside a "safe band". Punch it with a heat or cool
// spike and watch the feedback haul it back inside — the signature of a system
// that holds a stable internal state against outside change. Your body at 37°C,
// a planet holding its climate: same loop. The Na'vi call it "keeping the
// balance of life."
export default function Homeostasis() {
  const t = useTranslations("viz.homeostasis");
  const { ref, inView } = useInView<HTMLDivElement>();
  const temp = useRef(0); // deviation from set point
  const trail = useRef<number[]>(Array(110).fill(0));
  const acc = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      // negative feedback pulls temp toward 0
      temp.current += -temp.current * 1.6 * dt;
      acc.current += dt;
      if (acc.current > 0.03) {
        acc.current = 0;
        trail.current.push(temp.current);
        if (trail.current.length > 110) trail.current.shift();
      }
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const perturb = (dir: number) => {
    temp.current += dir * 0.9;
  };

  const MIDY = 50;
  const AMP = 26;
  const BAND = 0.32; // safe-range half-width (fraction)
  const inBand = Math.abs(temp.current) < BAND;

  const path = trail.current
    .map((p, i) => `${i === 0 ? "M" : "L"}${8 + (i / 110) * 86} ${MIDY - p * AMP}`)
    .join(" ");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        temp.current = 0;
        trail.current = Array(110).fill(0);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("status")}:{" "}
          <span className={inBand ? "text-teal" : "text-amber"}>
            {inBand ? t("balanced") : t("correcting")}
          </span>
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
          {/* safe band */}
          <rect
            x="8"
            y={MIDY - BAND * AMP}
            width="86"
            height={BAND * AMP * 2}
            fill="var(--teal)"
            opacity="0.12"
          />
          <line
            x1="8"
            y1={MIDY}
            x2="94"
            y2={MIDY}
            stroke="var(--teal)"
            strokeWidth="0.4"
            strokeDasharray="2 1.5"
            opacity="0.5"
          />
          <text
            x="9"
            y={MIDY - BAND * AMP - 1.5}
            className="fill-teal"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("safeRange")}
          </text>

          {path && (
            <path
              d={path}
              fill="none"
              stroke={inBand ? "var(--cyan)" : "var(--amber)"}
              strokeWidth="1"
              opacity="0.9"
            />
          )}
          {/* current dot + restoring arrow */}
          {(() => {
            const cx = 8 + ((trail.current.length - 1) / 110) * 86;
            const cy = MIDY - temp.current * AMP;
            return (
              <g>
                <circle cx={cx} cy={cy} r="1.9" fill={inBand ? "var(--teal)" : "var(--amber)"} />
                {!inBand && (
                  <line
                    x1={cx}
                    y1={cy}
                    x2={cx}
                    y2={cy + Math.sign(temp.current) * 5}
                    stroke="var(--amber)"
                    strokeWidth="0.6"
                    markerEnd=""
                    opacity="0.7"
                  />
                )}
              </g>
            );
          })()}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("deviation")}
            value={`${(temp.current * 10).toFixed(1)}`}
            accent={inBand ? "teal" : "amber"}
          />
        </div>

        <div className="absolute left-3 top-16 flex flex-col gap-1.5">
          <ControlButton variant="accent" onClick={() => perturb(1)}>
            {t("heatSpike")}
          </ControlButton>
          <ControlButton onClick={() => perturb(-1)}>{t("coolSpike")}</ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
