"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// A step disturbance hits a system with a negative-feedback controller. The loop
// senses the deviation and pushes back, pulling the signal home to the set
// point. Raise the gain and the return sharpens — too much and it overshoots and
// rings (underdamped); too little and it crawls back (overdamped). This is the
// engine of all self-regulation, from a thermostat to Earth's carbon cycle.
export default function NegativeFeedback() {
  const t = useTranslations("viz.negative-feedback");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [gain, setGain] = useState(1.4);
  // second-order system state: value + velocity, pulled toward setpoint
  const y = useRef(1); // start displaced by a step
  const v = useRef(0);
  const trail = useRef<number[]>([]);
  const time = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      const k = gain * 12; // spring
      const damp = 3.2; // fixed damping → gain controls the regime
      const a = -k * y.current - damp * v.current;
      v.current += a * dt;
      y.current += v.current * dt;
      time.current += dt;
      if (time.current > 0.03) {
        time.current = 0;
        trail.current.push(y.current);
        if (trail.current.length > 100) trail.current.shift();
      }
      // gently re-inject the step so the loop keeps demonstrating
      if (Math.abs(y.current) < 0.01 && Math.abs(v.current) < 0.05) {
        y.current = 1;
        v.current = 0;
      }
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const overshoot = trail.current.some((p) => p < -0.05);
  const regime = gain > 2.2 ? t("underdamped") : gain < 0.7 ? t("overdamped") : t("critical");

  const MIDY = 50;
  const AMP = 30;
  const path = trail.current
    .map((p, i) => `${i === 0 ? "M" : "L"}${10 + (i / 100) * 84} ${MIDY + p * AMP}`)
    .join(" ");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        y.current = 1;
        v.current = 0;
        trail.current = [];
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("response")}: <span className="text-teal">{regime}</span>
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
          {/* set-point line */}
          <line
            x1="10"
            y1={MIDY}
            x2="94"
            y2={MIDY}
            stroke="var(--teal)"
            strokeWidth="0.4"
            strokeDasharray="2 1.5"
            opacity="0.5"
          />
          <text
            x="11"
            y={MIDY - 1.5}
            className="fill-teal"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("setPoint")}
          </text>

          {/* the response trace */}
          {path && <path d={path} fill="none" stroke="var(--cyan)" strokeWidth="1" opacity="0.9" />}
          {/* current value dot */}
          {trail.current.length > 0 && (
            <circle
              cx={10 + ((trail.current.length - 1) / 100) * 84}
              cy={MIDY + trail.current[trail.current.length - 1] * AMP}
              r="1.8"
              fill="var(--cyan)"
            />
          )}

          {/* feedback loop glyph — opposing arrow */}
          <g transform="translate(50 84)" opacity="0.75">
            <path d="M-12 0 A 12 6 0 1 1 12 0" fill="none" stroke="var(--teal)" strokeWidth="0.8" />
            <path d="M12 0 l -2.5 -2 l 0 4 Z" fill="var(--teal)" />
            <text
              x="0"
              y="9"
              textAnchor="middle"
              className="fill-muted"
              style={{ fontSize: 2.6, fontFamily: "monospace" }}
            >
              {t("opposes")}
            </text>
          </g>
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("gain")}
            value={gain.toFixed(1)}
            accent={overshoot ? "amber" : "teal"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("feedbackGain")}
            value={gain}
            min={0.3}
            max={3.2}
            step={0.1}
            onChange={setGain}
            display={regime}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
