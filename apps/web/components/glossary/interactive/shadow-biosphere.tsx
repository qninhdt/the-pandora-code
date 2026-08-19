"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// A second life we might be blind to. A shadow biosphere is a hypothetical,
// independent microbial life running on a different biochemistry — a different
// genetic backbone, a mirror-image hand, another solvent — coexisting with us yet
// undetected, because our instruments are all tuned to standard life. Feed the dish
// standard nutrients and only the familiar cyan colony blooms; feed it shadow-
// compatible nutrients and the magenta one does. Neither can cross-feed the other:
// two lives sharing a world, invisible to each other's chemistry.
export default function ShadowBiosphere() {
  const t = useTranslations("viz.shadow-biosphere");
  const { ref, inView } = useInView<HTMLDivElement>();
  // -1 = fully shadow nutrient, +1 = fully standard nutrient
  const [nutrient, setNutrient] = useState(0.3);
  const normal = useRef(0.3);
  const shadow = useRef(0.3);
  const t0 = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      t0.current += dt;
      // standard colony grows when nutrient>0, shadow when nutrient<0; neither feeds the other
      const stdFood = Math.max(0, nutrient);
      const shdFood = Math.max(0, -nutrient);
      normal.current += (stdFood - normal.current * 0.4) * dt * 0.8;
      shadow.current += (shdFood - shadow.current * 0.4) * dt * 0.8;
      normal.current = Math.max(0.02, Math.min(1, normal.current));
      shadow.current = Math.max(0.02, Math.min(1, shadow.current));
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const nrm = normal.current;
  const shd = shadow.current;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setNutrient(0.3);
        normal.current = 0.3;
        shadow.current = 0.3;
      }}
      allowFullscreen={false}
      caption={
        nutrient > 0.1 ? (
          <span className="text-cyan">{t("standardBlooms")}</span>
        ) : nutrient < -0.1 ? (
          <span className="text-magenta">{t("shadowBlooms")}</span>
        ) : (
          <span className="text-muted">{t("noCrossFeed")}</span>
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
          {/* petri dish rim */}
          <circle
            cx="50"
            cy="48"
            r="38"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.7"
            opacity="0.5"
          />
          <circle
            cx="50"
            cy="48"
            r="38"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            opacity="0.3"
          />

          {/* standard (cyan) colony — left cluster, density ~ nrm */}
          {Array.from({ length: 40 }, (_, i) => {
            const a = (i / 40) * Math.PI * 2 * 3.3;
            const r = ((i * 11) % 30) * (0.4 + nrm * 0.6);
            const x = 38 + Math.cos(a) * r * 0.7;
            const y = 48 + Math.sin(a) * r;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.2"
                fill="var(--cyan)"
                opacity={i / 40 < nrm ? 0.7 : 0.05}
              />
            );
          })}

          {/* shadow (magenta) colony — right cluster, density ~ shd */}
          {Array.from({ length: 40 }, (_, i) => {
            const a = (i / 40) * Math.PI * 2 * 2.7;
            const r = ((i * 13) % 30) * (0.4 + shd * 0.6);
            const x = 62 + Math.cos(a) * r * 0.7;
            const y = 48 + Math.sin(a) * r;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.2"
                fill="var(--magenta)"
                opacity={i / 40 < shd ? 0.6 : 0.05}
              />
            );
          })}

          {/* the invisible divide */}
          <line
            x1="50"
            y1="14"
            x2="50"
            y2="82"
            stroke="var(--border-strong)"
            strokeWidth="0.3"
            strokeDasharray="1.5 2"
            opacity="0.3"
          />
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout label={t("standard")} value={`${Math.round(nrm * 100)}%`} accent="cyan" />
          <Readout label={t("shadow")} value={`${Math.round(shd * 100)}%`} accent="magenta" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("nutrientType")}
            value={nutrient}
            min={-1}
            max={1}
            step={0.01}
            onChange={setNutrient}
            display={
              nutrient > 0.1 ? t("standardFood") : nutrient < -0.1 ? t("shadowFood") : t("neutral")
            }
            thumb={nutrient < -0.1 ? "magenta" : "cyan"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
