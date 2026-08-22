"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A ball in a landscape of two basins. Push it far enough and it drops into the
// second valley — and easing the pressure back does not lift it out again.
export default function AlternativeStableState() {
  const t = useTranslations("viz.alternative-stable-state");
  const [pressure, setPressure] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Once the tipping threshold is crossed, the state is latched: relaxing the
  // pressure leaves the system in the degraded basin. That hysteresis is the point.
  const threshold = 0.62;
  const isFlipped = flipped;

  const applyPressure = (v: number) => {
    setPressure(v);
    if (v >= threshold) setFlipped(true);
  };

  const tone = isFlipped ? "var(--magenta)" : "var(--cyan)";
  const ballX = isFlipped ? 70 : 30;
  const ballY = isFlipped ? 44 : 40;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setPressure(0);
        setFlipped(false);
      }}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{isFlipped ? t("verdictFlipped") : t("verdictHolding")}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 78" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* the stability landscape: two basins, one deeper and poorer */}
          <path d="M12 34 Q22 50 30 44 Q40 34 50 32 Q60 34 70 48 Q78 54 88 44"
            fill="none" stroke="var(--border-strong)" strokeWidth="0.7" opacity={0.75} />
          <path d="M12 34 Q22 50 30 44 Q40 34 50 32 Q60 34 70 48 Q78 54 88 44 L88 60 L12 60 Z"
            fill="var(--void)" opacity={0.35} />

          {/* the ball */}
          <circle cx={ballX} cy={ballY} r="3.2" fill={tone} opacity={0.95}
            style={{ filter: `drop-shadow(0 0 5px ${tone})` }} />

          {/* the pressure being applied */}
          <line x1={ballX - 10 - pressure * 4} y1={ballY} x2={ballX - 5} y2={ballY} stroke="var(--amber)" strokeWidth={0.4 + pressure * 1.4} opacity={0.7} />

          <text x="30" y="66" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}>{t("basinA")}</text>
          <text x="70" y="66" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}>{t("basinB")}</text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("state")} value={isFlipped ? t("degraded") : t("intact")} accent={isFlipped ? "magenta" : "cyan"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("pressure")}
            value={pressure}
            min={0}
            max={1}
            step={0.01}
            onChange={applyPressure}
            display={`${Math.round(pressure * 100)}%`}
            thumb={isFlipped ? "magenta" : "amber"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
