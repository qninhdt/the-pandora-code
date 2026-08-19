"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Development flowing down a pre-cut channel. Waddington's landscape: a marble
// rolls from the top and, however hard you shove it sideways, a deep enough canal
// funnels it to the same stable outcome — buffered against noise and small genetic
// wobble. Nudge the ball and raise the noise; while canalization is strong it
// still lands in the same basin. This is one reason body plans hold for hundreds
// of millions of years: the channel corrects the wander.
export default function Canalization() {
  const t = useTranslations("viz.canalization");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [depth, setDepth] = useState(0.7); // canal depth (buffering strength)
  const x = useRef(50);
  const vx = useRef(0);
  const y = useRef(18);
  const kick = useRef(0);
  const force = useState(0)[1];

  // the target basin centre at the bottom
  const BASIN = 50;

  useRafLoop(
    (dt) => {
      // vertical descent
      y.current += dt * 22;
      if (y.current > 82) {
        y.current = 18;
        x.current = 50 + (Math.random() - 0.5) * 4;
        vx.current = 0;
      }
      // lateral: canal restoring force grows with depth and descent; noise fights it
      const progress = (y.current - 18) / 64;
      const restore = depth * progress * 42;
      const noise = (1 - depth) * 34;
      const ax =
        -(x.current - BASIN) * restore * 0.04 +
        (kick.current + (Math.random() - 0.5) * noise) * 0.06;
      vx.current += ax * dt;
      vx.current *= 0.9;
      x.current += vx.current * dt;
      kick.current *= 0.85;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const landed = Math.abs(x.current - BASIN);
  const buffered = landed < 8;

  // draw the landscape: a funnel narrowing to one basin, walls scaled by depth
  const wallTop = 30;
  const spread = 34 * (1 - depth * 0.5);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setDepth(0.7);
        x.current = 50;
        vx.current = 0;
        y.current = 18;
      }}
      allowFullscreen={false}
      caption={
        buffered ? (
          <span className="text-teal">{t("buffered")}</span>
        ) : (
          <span className="text-magenta">{t("strayed")}</span>
        )
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
          {/* the canal walls — funnel to a single basin */}
          <path
            d={`M${50 - spread} ${wallTop} Q ${50 - spread * 0.3} 60 50 82 Q ${50 + spread * 0.3} 60 ${50 + spread} ${wallTop}`}
            fill="none"
            stroke="var(--teal)"
            strokeWidth="0.6"
            opacity={0.4 + depth * 0.4}
          />
          {/* side trickles that fade (alternative outcomes) */}
          <path
            d={`M${50 - spread} ${wallTop} Q ${50 - spread - 8} 55 ${50 - spread - 6} 80`}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            strokeDasharray="2 2"
            opacity="0.4"
          />
          <path
            d={`M${50 + spread} ${wallTop} Q ${50 + spread + 8} 55 ${50 + spread + 6} 80`}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            strokeDasharray="2 2"
            opacity="0.4"
          />

          {/* basin marker */}
          <ellipse cx="50" cy="82" rx="7" ry="2" fill="var(--teal)" opacity="0.3" />
          <text
            x="50"
            y="88"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("stableOutcome")}
          </text>

          {/* the rolling marble + trail */}
          <circle cx={x.current} cy={y.current} r="2.4" fill="var(--cyan)" />
          <circle
            cx={x.current}
            cy={y.current}
            r="4"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="0.4"
            opacity="0.4"
          />
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout
            label={t("drift")}
            value={`${Math.round(landed)}`}
            accent={buffered ? "teal" : "magenta"}
          />
          <button
            type="button"
            onClick={() => {
              kick.current = 60;
            }}
            className="rounded-lg border border-amber/50 bg-void/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-amber backdrop-blur-md transition-colors hover:bg-void"
          >
            {t("perturb")}
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("canalDepth")}
            value={depth}
            min={0.1}
            max={1}
            step={0.01}
            onChange={setDepth}
            display={depth > 0.6 ? t("strong") : depth < 0.35 ? t("weak") : t("moderate")}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
