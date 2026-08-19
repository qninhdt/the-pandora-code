"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A single Pandoran zircon under simulated cathodoluminescence. Growth zones
// glow teal; each records a moment. Canon: the luminous CORE dates the moon's
// first crust (~4.5 Gyr); a paler OVERGROWTH RIM regrew around the ancient
// Mars-sized impact that forged unobtanium — a younger date in the same grain.
const ZONES = [
  { key: "core", rNorm: 0.28, ageGyr: 4.47, glow: 0.95, color: "var(--cyan)" },
  { key: "inner", rNorm: 0.5, ageGyr: 4.4, glow: 0.7, color: "var(--teal)" },
  { key: "band", rNorm: 0.72, ageGyr: 4.3, glow: 0.55, color: "var(--teal)" },
  { key: "rim", rNorm: 0.94, ageGyr: 4.02, glow: 0.4, color: "#8b7fd0" },
] as const;

type ZoneKey = (typeof ZONES)[number]["key"];

export default function Zircon() {
  const t = useTranslations("viz.zircon");
  const [selected, setSelected] = useState<ZoneKey>("core");
  const [angle, setAngle] = useState(18);
  const draggingRef = useRef<number | null>(null);

  const cur = ZONES.find((z) => z.key === selected) ?? ZONES[0];

  const onDown = (clientX: number) => {
    draggingRef.current = clientX;
  };
  const onMove = (clientX: number) => {
    if (draggingRef.current == null) return;
    const dx = clientX - draggingRef.current;
    draggingRef.current = clientX;
    setAngle((a) => a + dx * 0.4);
  };
  const onUp = () => {
    draggingRef.current = null;
  };

  // faceted hexagonal-prism zircon outline, tilted by `angle`
  const tilt = Math.cos((angle * Math.PI) / 180);
  const halfW = 22 * Math.max(0.35, Math.abs(tilt));

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setAngle(18);
        setSelected("core");
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t(cur.key)} · <span className="text-cyan">{cur.ageGyr.toFixed(2)}</span> {t("gyr")}
        </span>
      }
    >
      <div
        className="absolute inset-0 cursor-ew-resize"
        onMouseDown={(e) => onDown(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={(e) => onDown(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onUp}
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="zr-lum" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ambient cathodoluminescent halo */}
          <ellipse cx="50" cy="50" rx={halfW + 12} ry="46" fill="url(#zr-lum)" opacity="0.5" />

          {/* prism body: two pyramidal tips + a column, width breathes with tilt */}
          <polygon
            points={`50,6 ${50 + halfW},22 ${50 + halfW},78 50,94 ${50 - halfW},78 ${50 - halfW},22`}
            fill="#0a1420"
            stroke="var(--teal)"
            strokeWidth="0.7"
          />

          {/* concentric growth zones — click to read the age they record */}
          {[...ZONES].reverse().map((z) => {
            const on = z.key === selected;
            const w = halfW * z.rNorm;
            const topY = 22 - (22 - 6) * z.rNorm;
            const botY = 78 + (94 - 78) * z.rNorm;
            return (
              <polygon
                key={z.key}
                points={`50,${topY} ${50 + w},22 ${50 + w},78 50,${botY} ${50 - w},78 ${50 - w},22`}
                fill={z.color}
                fillOpacity={z.glow * (on ? 0.5 : 0.28)}
                stroke={z.color}
                strokeWidth={on ? 1 : 0.4}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(z.key);
                }}
                style={on ? { filter: `drop-shadow(0 0 4px ${z.color})` } : undefined}
              />
            );
          })}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout
            label={t("upbAge")}
            value={cur.ageGyr.toFixed(2)}
            unit={t("gyr")}
            accent="cyan"
          />
        </div>

        <div className="absolute left-3 top-16 max-w-[42%] rounded-lg border border-border/40 bg-void/70 px-2.5 py-1.5 font-mono text-[9px] leading-snug text-muted backdrop-blur-md">
          {t(`${cur.key}Note`)}
        </div>

        <span className="absolute bottom-12 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-wider text-muted">
          {t("dragHint")}
        </span>
      </div>
    </GlossaryFrame>
  );
}
