"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// The ocean's fast thermostat (Charlson-Lovelock-Andreae-Warren). Warm the sea
// and plankton bloom, venting a sulphur compound that drifts up and seeds bright
// clouds; clouds reflect sunlight and cool the sea — a stabilising loop, life
// adjusting the planet's albedo. But push the warming too far and Lovelock's
// dark twin appears: the plankton collapse instead of bloom, the cooling clouds
// fail, and the loop flips from brake to runaway.
export default function ClawHypothesis() {
  const t = useTranslations("viz.claw-hypothesis");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [warming, setWarming] = useState(0.4); // 0..1 imposed sea warming
  const drift = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      drift.current = (drift.current + dt * 0.5) % 1;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  // plankton peak at moderate warmth, collapse past a threshold
  const COLLAPSE = 0.72;
  const collapsed = warming > COLLAPSE;
  const plankton = collapsed
    ? Math.max(0, 1 - (warming - COLLAPSE) / (1 - COLLAPSE))
    : Math.min(1, warming / COLLAPSE + 0.15);
  const cloud = plankton; // cloud brightness tracks plankton
  const cooling = cloud; // more cloud → more cooling

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setWarming(0.4)}
      allowFullscreen={false}
      caption={
        collapsed ? (
          <span className="text-magenta">{t("runawayFlip")}</span>
        ) : (
          <span className="text-teal">{t("stabilising")}</span>
        )
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={t("title")}
        >
          {/* sky */}
          <rect x="0" y="0" width="100" height="58" fill="#070c16" />
          {/* sea, warmth-tinted */}
          <rect x="0" y="58" width="100" height="42" fill="#0a2438" />
          <rect
            x="0"
            y="58"
            width="100"
            height="42"
            fill={collapsed ? "var(--magenta)" : "var(--amber)"}
            opacity={warming * 0.22}
          />
          <line x1="0" y1="58" x2="100" y2="58" stroke="var(--border-strong)" strokeWidth="0.4" />

          {/* bright reflective cloud deck (brightness ~ cloud) */}
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse
              key={i}
              cx={10 + i * 13}
              cy={18 + (i % 2) * 6}
              rx="9"
              ry="4"
              fill="#dfeffb"
              opacity={0.08 + cloud * 0.42}
            />
          ))}
          {/* reflected sunlight arrows (cooling) when clouds are bright */}
          {cooling > 0.3 &&
            Array.from({ length: 4 }, (_, i) => (
              <line
                key={i}
                x1={20 + i * 18}
                y1="14"
                x2={26 + i * 18}
                y2="4"
                stroke="var(--cyan)"
                strokeWidth="0.5"
                opacity={cooling * 0.7}
              />
            ))}

          {/* sulphur wisps rising from plankton */}
          {plankton > 0.15 &&
            Array.from({ length: 8 }, (_, i) => {
              const x = 8 + i * 11;
              const y = 58 - ((i * 6 + drift.current * 40) % 34);
              return (
                <circle key={i} cx={x} cy={y} r="0.9" fill="var(--teal)" opacity={plankton * 0.6} />
              );
            })}

          {/* plankton in the sea (density ~ plankton) */}
          {Array.from({ length: 30 }, (_, i) => {
            const x = (i * 17) % 100;
            const y = 64 + ((i * 13) % 32);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1"
                fill="var(--teal)"
                opacity={i / 30 < plankton ? 0.6 : 0.05}
              />
            );
          })}

          {/* collapse skull-hint: dark patches when collapsed */}
          {collapsed &&
            Array.from({ length: 6 }, (_, i) => (
              <circle
                key={i}
                cx={12 + i * 15}
                cy={80}
                r="2.4"
                fill="var(--magenta)"
                opacity="0.25"
              />
            ))}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout
            label={t("plankton")}
            value={`${Math.round(plankton * 100)}%`}
            accent={collapsed ? "magenta" : "teal"}
          />
          <Readout
            label={t("cloudCooling")}
            value={`${Math.round(cooling * 100)}%`}
            accent="cyan"
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("seaWarming")}
            value={warming}
            min={0}
            max={1}
            step={0.01}
            onChange={setWarming}
            display={collapsed ? t("tooFar") : `${Math.round(warming * 100)}%`}
            thumb={collapsed ? "magenta" : "teal"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
