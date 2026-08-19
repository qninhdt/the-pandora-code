"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Earth's deep thermostat as a closed ring: volcano exhales CO₂ → warms air →
// rain weathers silicate rock → rivers carry it to sea → shells bury it as
// carbonate → subduction cooks it → volcano again. Click "inject CO₂" to spike
// the greenhouse; watch weathering speed up and draw it back down. The feedback
// is in the reaction rate — warm rock in acid rain weathers faster — so the loop
// self-corrects with no one steering.
const STAGES = [
  { key: "volcano", color: "var(--amber)" },
  { key: "atmosphere", color: "var(--cyan)" },
  { key: "weathering", color: "var(--teal)" },
  { key: "ocean", color: "#4a90d9" },
  { key: "burial", color: "#7a8290" },
  { key: "subduction", color: "var(--magenta)" },
];

function stagePos(i: number): [number, number] {
  const a = -Math.PI / 2 + (i / STAGES.length) * Math.PI * 2;
  return [50 + Math.cos(a) * 30, 46 + Math.sin(a) * 30];
}

export default function CarbonateSilicateCycle() {
  const t = useTranslations("viz.carbonate-silicate-cycle");
  const { ref, inView } = useInView<HTMLDivElement>();
  const co2 = useRef(1); // 1 = baseline greenhouse
  const flow = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      // weathering rate rises with CO2 (temperature) → pulls CO2 back to 1
      const weathering = 0.4 * co2.current;
      co2.current += (0.4 - weathering) * dt; // equilibrium at co2=1
      flow.current = (flow.current + dt * (0.2 + co2.current * 0.25)) % 1;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const inject = () => {
    co2.current = Math.min(2.6, co2.current + 0.9);
  };

  const level = co2.current;
  const warm = level > 1.3;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        co2.current = 1;
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("co2")}:{" "}
          <span className={warm ? "text-amber" : "text-teal"}>
            {level > 1.3 ? t("elevated") : level < 0.85 ? t("low") : t("balanced")}
          </span>{" "}
          · {t("selfCorrecting")}
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
          {/* the ring path */}
          <circle
            cx="50"
            cy="46"
            r="30"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={0.6 + (level - 1) * 0.6}
            opacity="0.5"
          />
          {/* greenhouse glow scales with CO2 */}
          <circle
            cx="50"
            cy="46"
            r="18"
            fill="var(--amber)"
            opacity={Math.max(0, (level - 1) * 0.18)}
          />

          {/* flowing carbon packets around the ring */}
          {Array.from({ length: 10 }, (_, i) => {
            const f = (i / 10 + flow.current) % 1;
            const a = -Math.PI / 2 + f * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={50 + Math.cos(a) * 30}
                cy={46 + Math.sin(a) * 30}
                r="1.3"
                fill={warm ? "var(--amber)" : "var(--teal)"}
                opacity="0.8"
              />
            );
          })}

          {/* stage nodes */}
          {STAGES.map((s, i) => {
            const [x, y] = stagePos(i);
            const isWeather = s.key === "weathering";
            const pulse = isWeather && warm;
            return (
              <g key={s.key}>
                <circle
                  cx={x}
                  cy={y}
                  r={pulse ? 6.5 : 5.5}
                  fill="var(--void)"
                  stroke={s.color}
                  strokeWidth={pulse ? 1.4 : 0.8}
                  opacity={pulse ? 1 : 0.85}
                />
                <circle cx={x} cy={y} r="2.4" fill={s.color} opacity="0.7" />
                <text
                  x={x}
                  y={y + 10}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.7,
                    fontFamily: "monospace",
                    fill: pulse ? s.color : "var(--muted)",
                  }}
                >
                  {t(s.key)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("weatheringRate")}
            value={warm ? t("fast") : t("normal")}
            accent={warm ? "amber" : "teal"}
          />
        </div>

        <div className="absolute left-3 top-16">
          <ControlButton variant="accent" onClick={inject}>
            {t("injectCo2")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
