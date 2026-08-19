"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type BiomeKey = "desert" | "tundra" | "rainforest" | "pandora";

function pickBiome(temp: number, precip: number): BiomeKey {
  // temp 0..1 cold→hot, precip 0..1 dry→wet
  if (temp > 0.55 && precip > 0.7) return "pandora";
  if (temp > 0.45 && precip > 0.55) return "rainforest";
  if (temp < 0.35) return "tundra";
  return "desert";
}

const PALETTE: Record<BiomeKey, { sky: string; accent: string }> = {
  desert: { sky: "#2a1e12", accent: "var(--amber)" },
  tundra: { sky: "#121820", accent: "var(--cyan)" },
  rainforest: { sky: "#0c1a18", accent: "var(--teal)" },
  pandora: { sky: "#0a1020", accent: "var(--magenta)" },
};

const GROUND: Record<BiomeKey, string> = {
  desert: "#c4a36a",
  tundra: "#8aa0b8",
  rainforest: "#1a4a3a",
  pandora: "#14283a",
};

export default function Biome() {
  const t = useTranslations("viz.biome");
  const [temp, setTemp] = useState(0.7);
  const [precip, setPrecip] = useState(0.8);

  const key = useMemo(() => pickBiome(temp, precip), [temp, precip]);
  const pal = PALETTE[key];
  const ground = GROUND[key];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setTemp(0.7);
        setPrecip(0.8);
      }}
      allowFullscreen={false}
      caption={<span className="text-teal">{t(key)}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <rect x="0" y="0" width="100" height="100" fill={pal.sky} />
          <ellipse cx="50" cy="78" rx="48" ry="18" fill={ground} opacity={0.9} />
          {/* climate wheel */}
          <circle cx="78" cy="22" r="14" fill="var(--void)" stroke="var(--border-strong)" strokeWidth="0.6" />
          <circle cx="78" cy="22" r="10" fill="none" stroke="var(--cyan)" strokeWidth="0.4" opacity={0.5} />
          {/* dial needle from temp/precip angle */}
          {(() => {
            const ang = (temp * 0.7 + precip * 0.3) * Math.PI * 1.6 - Math.PI * 0.8;
            const x = 78 + Math.cos(ang) * 9;
            const y = 22 + Math.sin(ang) * 9;
            return <line x1="78" y1="22" x2={x} y2={y} stroke={pal.accent} strokeWidth="1.2" />;
          })()}
          <circle cx="78" cy="22" r="1.5" fill={pal.accent} />
          {/* silhouette by biome */}
          {key === "desert" && (
            <g fill={pal.accent} opacity={0.75}>
              <ellipse cx="30" cy="70" rx="14" ry="4" />
              <ellipse cx="55" cy="72" rx="18" ry="5" />
              <path d="M40 70 L42 52 L44 70" />
              <path d="M60 72 L62 58 L64 72" />
            </g>
          )}
          {key === "tundra" && (
            <g stroke={pal.accent} strokeWidth="0.8" fill="none" opacity={0.8}>
              <path d="M20 72 L28 58 L36 72" />
              <path d="M40 74 L46 62 L52 74" />
              <path d="M58 72 L68 54 L78 72" />
              <line x1="15" y1="76" x2="85" y2="76" stroke="var(--cyan)" strokeWidth="0.5" opacity={0.4} />
            </g>
          )}
          {key === "rainforest" && (
            <g fill={pal.accent} opacity={0.85}>
              {[28, 42, 56, 70].map((x, i) => (
                <g key={x}>
                  <rect x={x - 1.2} y={48 - i * 2} width="2.4" height={28 + i * 2} fill="var(--teal)" opacity={0.5} />
                  <ellipse cx={x} cy={46 - i * 2} rx={8 + (i % 2)} ry={6} />
                </g>
              ))}
            </g>
          )}
          {key === "pandora" && (
            <g>
              {[30, 48, 65].map((x, i) => (
                <g key={x}>
                  <rect x={x - 1.5} y={40 - i * 3} width="3" height={36 + i * 3} fill="var(--cyan)" opacity={0.35} />
                  <circle cx={x} cy={38 - i * 3} r={7 + i} fill="var(--magenta)" opacity={0.45} style={{ filter: "drop-shadow(0 0 4px var(--magenta))" }} />
                  <circle cx={x - 4} cy={50} r="1.2" fill="var(--teal)" opacity={0.9} />
                  <circle cx={x + 5} cy={56} r="1" fill="var(--cyan)" opacity={0.8} />
                </g>
              ))}
            </g>
          )}
        </svg>
        <div className="absolute left-3 top-14">
          <Readout label={t("biome")} value={t(key)} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10 space-y-2">
          <ControlSlider label={t("temp")} value={temp} min={0} max={1} step={0.01} display={`${Math.round(temp * 40 - 5)}°C`} onChange={setTemp} thumb="amber" />
          <ControlSlider label={t("precip")} value={precip} min={0} max={1} step={0.01} display={`${Math.round(precip * 4000)} mm`} onChange={setPrecip} thumb="cyan" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
