"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// β-barrel lamp: blue in, green out. Sweep excitation wavelength.
export default function GreenFluorescentProtein() {
  const t = useTranslations("viz.green-fluorescent-protein");
  const [ex, setEx] = useState(480);
  const on = ex > 420 && ex < 520;
  const emission = on ? 508 : 0;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setEx(480)}
      allowFullscreen={false}
      caption={
        <span className={on ? "text-teal" : "text-muted"}>
          {t("emission")}: {emission || "—"} nm
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
          <ellipse
            cx="50"
            cy="44"
            rx="18"
            ry="22"
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth="1"
          />
          <circle
            cx="50"
            cy="44"
            r="6"
            fill={on ? "var(--teal)" : "var(--void)"}
            opacity={on ? 0.9 : 0.4}
            style={on ? { filter: "drop-shadow(0 0 10px var(--teal))" } : undefined}
          />
          <line x1="12" y1="44" x2="30" y2="44" stroke="var(--cyan)" strokeWidth="1.2" />
          <text
            x="12"
            y="38"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            {t("excitation")}
          </text>
          {on && (
            <line
              x1="70"
              y1="44"
              x2="90"
              y2="44"
              stroke="var(--teal)"
              strokeWidth="1.4"
              style={{ filter: "drop-shadow(0 0 4px var(--teal))" }}
            />
          )}
          <text
            x="50"
            y="78"
            textAnchor="middle"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("barrel")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("emission")} value={on ? `${emission}` : "—"} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("excitation")}
            value={ex}
            min={350}
            max={600}
            step={5}
            display={`${ex} nm`}
            onChange={setEx}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
