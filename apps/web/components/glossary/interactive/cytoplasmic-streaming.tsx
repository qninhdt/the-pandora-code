"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Organelles ride a looping cytoplasmic current; velocity controls distribution.
export default function CytoplasmicStreaming() {
  const t = useTranslations("viz.cytoplasmic-streaming");
  const [velocity, setVelocity] = useState(0.55);
  const stalled = velocity < 0.12;
  const phase = velocity * 6.5;

  const organelles = useMemo(() => {
    // Parametric loop around cell interior
    return [0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2 + phase;
      const rx = 22;
      const ry = 14;
      return {
        x: 50 + Math.cos(a) * rx,
        y: 46 + Math.sin(a) * ry,
        r: 1.6 + (i % 3) * 0.4,
      };
    });
  }, [phase]);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setVelocity(0.55)}
      allowFullscreen={false}
      caption={
        <span className={stalled ? "text-magenta" : "text-cyan"}>
          {stalled ? t("stall") : velocity > 0.7 ? t("fast") : t("flow")}
        </span>
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
          {/* cell wall */}
          <ellipse
            cx="50"
            cy="46"
            rx="34"
            ry="26"
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth="1.1"
            opacity={0.9}
          />
          {/* vacuole */}
          <ellipse
            cx="50"
            cy="46"
            rx="14"
            ry="10"
            fill="var(--void)"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
            opacity={0.7}
          />
          {/* streaming path */}
          <ellipse
            cx="50"
            cy="46"
            rx="22"
            ry="14"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="0.6"
            strokeDasharray={stalled ? "1 2" : "3 2"}
            opacity={0.35 + velocity * 0.5}
          />
          {/* flow arrows */}
          {!stalled &&
            [0.2, 0.7, 1.3, 1.9, 2.5, 3.3].map((a, i) => {
              const x = 50 + Math.cos(a + phase * 0.3) * 22;
              const y = 46 + Math.sin(a + phase * 0.3) * 14;
              return <circle key={i} cx={x} cy={y} r="0.8" fill="var(--cyan)" opacity={0.5} />;
            })}
          {/* organelles */}
          {organelles.map((o, i) => (
            <circle
              key={i}
              cx={o.x}
              cy={o.y}
              r={o.r}
              fill={i % 2 === 0 ? "var(--amber)" : "var(--magenta)"}
              opacity={stalled ? 0.35 : 0.85}
            />
          ))}
          <text
            x="50"
            y="80"
            textAnchor="middle"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("organelles")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("velocity")}
            value={stalled ? t("stall") : `${Math.round(velocity * 100)}`}
            unit={stalled ? undefined : "µm/s"}
            accent={stalled ? "magenta" : "cyan"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("velocity")}
            value={velocity}
            min={0}
            max={1}
            step={0.01}
            display={`${Math.round(velocity * 80)} µm/s`}
            onChange={setVelocity}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
