"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Selection without reproduction. Doolittle's loosening of the Darwinian frame:
// a system need not breed to be selected — it need only last longer. Candidate
// systems that stumble into stabilising feedback loops persist; those that don't
// collapse fast. Run geological time and the survivors are, trivially, the ones
// whose feedback held — "the song, not the singer". Raise the feedback strength
// and watch which of the candidates are still standing when the clock runs out.
export default function DifferentialPersistence() {
  const t = useTranslations("viz.differential-persistence");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [feedback, setFeedback] = useState(0.55); // stabilising feedback strength
  const clock = useRef(0);
  const force = useState(0)[1];

  // 6 candidate systems, each with an intrinsic stability (some below threshold)
  const SYSTEMS = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      x: 16 + (i % 3) * 34,
      y: i < 3 ? 40 : 66,
      intrinsic: [0.2, 0.5, 0.8, 0.35, 0.65, 0.9][i],
    })),
  ).current;

  useRafLoop(
    (dt) => {
      clock.current = (clock.current + dt * 0.14) % 1.2;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const age = Math.min(1, clock.current);
  // a system survives to time `age` if its total stability clears the collapse curve
  const survives = (intrinsic: number) => intrinsic + feedback * 0.5 >= 0.5 + age * 0.45;
  const surviving = SYSTEMS.filter((s) => survives(s.intrinsic)).length;
  const gyr = (age * 4).toFixed(1);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setFeedback(0.55);
        clock.current = 0;
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("surviving")}: <span className="text-teal">{surviving}</span> / {SYSTEMS.length} ·{" "}
          {gyr} {t("gyr")}
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
          {SYSTEMS.map((s, i) => {
            const alive = survives(s.intrinsic);
            const looping = s.intrinsic + feedback * 0.5 >= 0.6;
            const ang = clock.current * Math.PI * 2 * (looping ? 1 : 0);
            return (
              <g key={i} transform={`translate(${s.x} ${s.y})`} opacity={alive ? 1 : 0.2}>
                {/* stabilising feedback ring — only draws for looping systems */}
                {looping && alive && (
                  <circle
                    cx="0"
                    cy="0"
                    r="7"
                    fill="none"
                    stroke="var(--teal)"
                    strokeWidth="0.5"
                    opacity="0.5"
                    strokeDasharray="3 2"
                  />
                )}
                {/* orbiting feedback marker */}
                {looping && alive && (
                  <circle
                    cx={Math.cos(ang) * 7}
                    cy={Math.sin(ang) * 7}
                    r="1.1"
                    fill="var(--teal)"
                  />
                )}
                {/* the system core */}
                <circle
                  cx="0"
                  cy="0"
                  r="4"
                  fill={alive ? "var(--cyan)" : "var(--surface)"}
                  opacity={alive ? 0.85 : 0.4}
                  stroke={alive ? "var(--cyan)" : "var(--magenta)"}
                  strokeWidth="0.6"
                />
                {/* collapse cross for dead systems */}
                {!alive && (
                  <g stroke="var(--magenta)" strokeWidth="0.6" opacity="0.6">
                    <line x1="-3" y1="-3" x2="3" y2="3" />
                    <line x1="-3" y1="3" x2="3" y2="-3" />
                  </g>
                )}
              </g>
            );
          })}

          {/* time sweep bar */}
          <rect x="10" y="88" width="80" height="1.5" fill="var(--border-strong)" opacity="0.5" />
          <rect x="10" y="88" width={80 * age} height="1.5" fill="var(--teal)" opacity="0.7" />
          <text
            x="10"
            y="96"
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("geologicalTime")}
          </text>
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("persisted")} value={`${surviving}/${SYSTEMS.length}`} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("feedbackStrength")}
            value={feedback}
            min={0}
            max={1}
            step={0.01}
            onChange={setFeedback}
            display={
              feedback > 0.6 ? t("strongLoops") : feedback < 0.3 ? t("weakLoops") : t("someLoops")
            }
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
