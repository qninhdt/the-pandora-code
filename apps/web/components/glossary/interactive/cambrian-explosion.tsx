"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Forty million years, compressed. Around 538 Mya almost every major animal body
// plan shows up in the fossil record in one geological blink. The twist: it came
// with almost no new genes — the toolkit already existed in the common ancestor,
// and the explosion was that toolkit redeployed through regulatory rewiring. Play
// the clock and watch the disparity of forms bloom from a single point; pause to
// inspect the sudden crowd of plans that appears near the threshold.
const FORMS = [
  { at: 0.08, x: 24, y: 40 },
  { at: 0.16, x: 70, y: 32 },
  { at: 0.3, x: 40, y: 62 },
  { at: 0.42, x: 78, y: 58 },
  { at: 0.5, x: 16, y: 66 },
  { at: 0.58, x: 56, y: 40 },
  { at: 0.66, x: 34, y: 30 },
  { at: 0.74, x: 84, y: 44 },
  { at: 0.82, x: 62, y: 68 },
  { at: 0.9, x: 46, y: 48 },
];

export default function CambrianExplosion() {
  const t = useTranslations("viz.cambrian-explosion");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [playing, setPlaying] = useState(true);
  const clock = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      if (playing) {
        clock.current = (clock.current + dt * 0.16) % 1.15;
        force((n) => (n + 1) % 1_000_000);
      }
    },
    { active: inView && playing },
  );

  const tt = Math.min(1, clock.current);
  const mya = Math.round(541 - tt * 41);
  const emerged = FORMS.filter((f) => f.at <= tt);

  const seed = (i: number) => {
    // pseudo-distinct body-plan glyph per index
    const arms = 3 + (i % 4);
    return arms;
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        clock.current = 0;
        setPlaying(true);
      }}
      onPlayPause={() => setPlaying((p) => !p)}
      isPlaying={playing}
      allowFullscreen={false}
      caption={
        <span>
          {t("bodyPlans")}: <span className="text-teal">{emerged.length}</span> · {mya} {t("mya")}
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
          {/* the seed point of light */}
          <circle
            cx="50"
            cy="50"
            r={3 + (1 - tt) * 6}
            fill="var(--foreground)"
            opacity={0.3 + (1 - tt) * 0.5}
          />

          {/* emerged body plans — each a distinct radial glyph */}
          {emerged.map((f, i) => {
            const age = Math.min(1, (tt - f.at) / 0.12);
            const arms = seed(i);
            return (
              <g key={i} transform={`translate(${f.x} ${f.y})`} opacity={0.3 + age * 0.6}>
                {Array.from({ length: arms }, (_, a) => {
                  const ang = (a / arms) * Math.PI * 2;
                  return (
                    <line
                      key={a}
                      x1="0"
                      y1="0"
                      x2={Math.cos(ang) * (2 + age * 3)}
                      y2={Math.sin(ang) * (2 + age * 3)}
                      stroke={i % 3 === 0 ? "var(--teal)" : "var(--cyan)"}
                      strokeWidth="0.7"
                    />
                  );
                })}
                <circle cx="0" cy="0" r={1.4} fill={i % 3 === 0 ? "var(--teal)" : "var(--cyan)"} />
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("disparity")} value={emerged.length} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("geologicClock")}
            value={tt}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => {
              clock.current = v;
              setPlaying(false);
            }}
            display={`${mya} ${t("mya")}`}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
