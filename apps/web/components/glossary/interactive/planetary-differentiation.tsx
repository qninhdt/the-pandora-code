"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Legend } from "./shared/legend";

// `time` 0 → undifferentiated melt; 1 → fully layered core/mantle/crust.
export default function PlanetaryDifferentiation() {
  const t = useTranslations("viz.planetary-differentiation");
  const [time, setTime] = useState(0);

  const R = 34;
  // Layer boundaries interpolate from "all mixed" to distinct shells.
  const coreR = 6 + time * 12; // grows as metal sinks
  const mantleR = R - (1 - time) * 0 - time * 6; // mantle outer edge
  const crustT = time * 3; // crust thickness

  // Mixed phase: blotchy overlay opacity fades as differentiation completes.
  const mixOpacity = (1 - time) * 0.85;

  const stage =
    time < 0.15 ? t("molten") : time > 0.85 ? t("layered") : `${(time * 100).toFixed(0)}%`;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      caption={<span>{stage}</span>}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="diff-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--amber)" />
              <stop offset="70%" stopColor="#d68a3c" />
              <stop offset="100%" stopColor="#9a5a2c" />
            </radialGradient>
            <radialGradient id="diff-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
            </radialGradient>
            <clipPath id="diff-clip">
              <circle cx="50" cy="50" r={R} />
            </clipPath>
          </defs>

          {/* crust (outer shell) */}
          <circle cx="50" cy="50" r={R} fill="#2c3858" />
          {/* mantle */}
          <circle cx="50" cy="50" r={mantleR} fill="#143b46" />
          {/* core glow */}
          <circle cx="50" cy="50" r={coreR + 5} fill="url(#diff-glow)" />
          {/* iron core */}
          <circle cx="50" cy="50" r={coreR} fill="url(#diff-core)" />

          {/* undifferentiated mix overlay — random metal blobs fading out */}
          <g clipPath="url(#diff-clip)" opacity={mixOpacity}>
            {Array.from({ length: 26 }, (_, i) => {
              const a = (i * 2.39996) % (Math.PI * 2);
              const rr = ((i * 7) % 28) + 3;
              const bx = 50 + Math.cos(a) * rr;
              const by = 50 + Math.sin(a) * rr;
              return (
                <circle key={i} cx={bx} cy={by} r={2 + (i % 3)} fill="var(--amber)" opacity="0.5" />
              );
            })}
          </g>

          {/* crust highlight ring appears late */}
          <circle
            cx="50"
            cy="50"
            r={R - crustT / 2}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth={crustT * 0.3}
            opacity={time * 0.5}
          />
        </svg>

        <div className="absolute left-3 top-16">
          <Legend
            vertical
            items={[
              { color: "var(--amber)", label: t("core") },
              { color: "#143b46", label: t("mantle") },
              { color: "#2c3858", label: t("crust") },
            ]}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("time")}
            value={time}
            min={0}
            max={1}
            step={0.01}
            onChange={setTime}
            display={`${(time * 100).toFixed(0)}%`}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
