"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// A small perturbation fed through a loop that amplifies itself. Each cycle the
// signal is multiplied by the gain and looped back in. Below gain 1 it dies away
// (stable); at gain 1 it holds; above 1 it runs away, doubling and doubling into
// a blow-up — the ice-albedo and permafrost loops that turn a nudge into a
// tipping point. The bars climb until they saturate the ceiling, then reseed.
export default function PositiveFeedback() {
  const t = useTranslations("viz.positive-feedback");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [gain, setGain] = useState(1.25);
  const bars = useRef<number[]>([0.06]);
  const acc = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      acc.current += dt;
      if (acc.current > 0.55) {
        acc.current = 0;
        const last = bars.current[bars.current.length - 1];
        let next = last * gain;
        if (next > 1) next = 1;
        bars.current.push(next);
        if (bars.current.length > 16) bars.current.shift();
        // reseed once it saturates or fully decays, to keep looping
        if ((next >= 1 && last >= 0.999) || next < 0.005) {
          bars.current = [0.06];
        }
      }
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const runaway = gain > 1;
  const regime = gain > 1.05 ? t("runaway") : gain < 0.95 ? t("damped") : t("marginal");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        bars.current = [0.06];
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("perCycle")}:{" "}
          <span className={runaway ? "text-magenta" : "text-cyan"}>×{gain.toFixed(2)}</span> ·{" "}
          <span className={runaway ? "text-magenta" : "text-teal"}>{regime}</span>
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={t("title")}
        >
          {/* ceiling line */}
          <line
            x1="6"
            y1="18"
            x2="94"
            y2="18"
            stroke="var(--magenta)"
            strokeWidth="0.3"
            strokeDasharray="2 1.5"
            opacity="0.4"
          />
          {/* baseline */}
          <line x1="6" y1="84" x2="94" y2="84" stroke="var(--border-strong)" strokeWidth="0.4" />

          {bars.current.map((h, i) => {
            const x = 8 + i * 5.4;
            const barH = h * 64;
            const col = h > 0.7 ? "var(--magenta)" : h > 0.35 ? "var(--amber)" : "var(--cyan)";
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={84 - barH}
                  width="3.6"
                  height={barH}
                  fill={col}
                  opacity="0.85"
                  rx="0.4"
                />
                {/* amplify arrow from bar to next */}
                {i < bars.current.length - 1 && (
                  <line
                    x1={x + 3.6}
                    y1={84 - barH}
                    x2={x + 5.4}
                    y2={84 - bars.current[i + 1] * 64}
                    stroke="var(--border-strong)"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                )}
              </g>
            );
          })}

          {/* diverging spiral glyph */}
          <g transform="translate(50 92)" opacity="0.7">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="fill-muted"
              style={{ fontSize: 2.6, fontFamily: "monospace" }}
            >
              {t("amplifies")}
            </text>
          </g>
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("state")}
            value={runaway ? t("exploding") : t("fading")}
            accent={runaway ? "magenta" : "cyan"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("loopGain")}
            value={gain}
            min={0.6}
            max={1.6}
            step={0.01}
            onChange={setGain}
            display={`×${gain.toFixed(2)}`}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
