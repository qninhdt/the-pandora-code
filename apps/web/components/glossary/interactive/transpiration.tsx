"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Stomata + vapor flux; humidity/temp/wind drive the rate gauge.
export default function Transpiration() {
  const t = useTranslations("viz.transpiration");
  const [humidity, setHumidity] = useState(0.4);
  const [temp, setTemp] = useState(0.55);
  const [wind, setWind] = useState(0.35);

  const rate = useMemo(() => {
    // VPD-ish: high temp & low humidity raise demand; wind strips boundary layer
    const vpd = Math.max(0, temp * 1.2 - humidity);
    return Math.min(1, vpd * (0.4 + wind * 0.8));
  }, [humidity, temp, wind]);

  const open = rate > 0.2;
  const aperture = 0.5 + rate * 2.5;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setHumidity(0.4);
        setTemp(0.55);
        setWind(0.35);
      }}
      allowFullscreen={false}
      caption={
        <span className={open ? "text-cyan" : "text-magenta"}>
          {open ? t("open") : t("closed")} · {t("rate")} {Math.round(rate * 100)}%
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
          {/* leaf blade */}
          <ellipse
            cx="48"
            cy="44"
            rx="30"
            ry="18"
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth="1"
          />
          <line
            x1="22"
            y1="44"
            x2="72"
            y2="44"
            stroke="var(--teal)"
            strokeWidth="0.5"
            opacity={0.5}
          />
          {/* stomata pair */}
          {[0, 1, 2].map((i) => {
            const x = 36 + i * 12;
            return (
              <g key={i}>
                <ellipse
                  cx={x}
                  cy="50"
                  rx={2.2}
                  ry={aperture}
                  fill="var(--void)"
                  stroke="var(--cyan)"
                  strokeWidth="0.6"
                />
                <ellipse
                  cx={x}
                  cy={50 - aperture - 1}
                  rx="2.4"
                  ry="1.2"
                  fill="var(--teal)"
                  opacity={0.5}
                />
                <ellipse
                  cx={x}
                  cy={50 + aperture + 1}
                  rx="2.4"
                  ry="1.2"
                  fill="var(--teal)"
                  opacity={0.5}
                />
              </g>
            );
          })}
          {/* vapor plumes */}
          {open &&
            [0, 1, 2, 3, 4].map((i) => (
              <circle
                key={i}
                cx={34 + i * 7 + wind * 6}
                cy={36 - rate * 12 - i * 2}
                r={1 + rate}
                fill="var(--cyan)"
                opacity={0.25 + rate * 0.45}
              />
            ))}
          {/* water column tug */}
          <rect
            x="46"
            y="62"
            width="4"
            height={10 + rate * 12}
            fill="var(--cyan)"
            opacity={0.45 + rate * 0.4}
          />
          <text
            x="56"
            y="74"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            {t("stomata")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("rate")}
            value={`${Math.round(rate * 100)}`}
            unit="%"
            accent={open ? "cyan" : "magenta"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10 space-y-1.5">
          <ControlSlider
            label={t("humidity")}
            value={humidity}
            min={0}
            max={1}
            step={0.01}
            display={`${Math.round(humidity * 100)}%`}
            onChange={setHumidity}
            thumb="cyan"
          />
          <ControlSlider
            label={t("temp")}
            value={temp}
            min={0}
            max={1}
            step={0.01}
            display={`${Math.round(10 + temp * 30)}°C`}
            onChange={setTemp}
            thumb="amber"
          />
          <ControlSlider
            label={t("wind")}
            value={wind}
            min={0}
            max={1}
            step={0.01}
            display={`${Math.round(wind * 20)} m/s`}
            onChange={setWind}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
