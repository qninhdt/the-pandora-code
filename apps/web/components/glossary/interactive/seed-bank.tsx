"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type Event = "none" | "fire" | "flood" | "gap";

const SEEDS = [
  { x: 22, y: 48, depth: 0.3, cue: "fire" as const },
  { x: 38, y: 58, depth: 0.55, cue: "flood" as const },
  { x: 55, y: 44, depth: 0.2, cue: "gap" as const },
  { x: 70, y: 62, depth: 0.7, cue: "fire" as const },
  { x: 84, y: 52, depth: 0.4, cue: "gap" as const },
  { x: 48, y: 70, depth: 0.85, cue: "flood" as const },
];

export default function SeedBank() {
  const t = useTranslations("viz.seed-bank");
  const [event, setEvent] = useState<Event>("none");

  const germinating = SEEDS.filter((s) => event !== "none" && s.cue === event).length;
  const dormant = SEEDS.length - germinating;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setEvent("none")}
      allowFullscreen={false}
      caption={
        <span className={event === "none" ? "text-muted" : "text-teal"}>
          {event === "none" ? t("dormant") : t("germinate")}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* soil layers */}
          <rect x="8" y="36" width="84" height="44" fill="#1a140e" />
          <rect x="8" y="36" width="84" height="12" fill="#2a2218" opacity={0.7} />
          <rect x="8" y="48" width="84" height="14" fill="#1a140e" opacity={0.9} />
          <rect x="8" y="62" width="84" height="18" fill="#0e0c0a" />
          {/* surface */}
          <line x1="8" y1="36" x2="92" y2="36" stroke="var(--teal)" strokeWidth="0.6" opacity={0.4} />
          {/* event wash */}
          {event === "fire" && <rect x="8" y="20" width="84" height="16" fill="var(--amber)" opacity={0.25} />}
          {event === "flood" && <rect x="8" y="28" width="84" height="20" fill="var(--cyan)" opacity={0.2} />}
          {event === "gap" && (
            <polygon points="40,8 60,8 70,36 30,36" fill="var(--amber)" opacity={0.18} />
          )}
          {/* seeds */}
          {SEEDS.map((s, i) => {
            const awake = event !== "none" && s.cue === event;
            return (
              <g key={i}>
                <ellipse
                  cx={s.x}
                  cy={s.y}
                  rx={awake ? 2.4 : 1.8}
                  ry={awake ? 3.2 : 2.4}
                  fill={awake ? "var(--teal)" : "var(--amber)"}
                  opacity={awake ? 0.9 : 0.45}
                />
                {awake && (
                  <>
                    <line x1={s.x} y1={s.y - 3} x2={s.x} y2={s.y - 10} stroke="var(--teal)" strokeWidth="0.8" />
                    <ellipse cx={s.x} cy={s.y - 11} rx="3" ry="2" fill="var(--teal)" opacity={0.7} />
                  </>
                )}
              </g>
            );
          })}
          <text x="12" y="88" style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("depth")}
          </text>
        </svg>
        <div className="absolute right-3 top-14 space-y-1">
          <Readout label={t("germinate")} value={`${germinating}`} accent="teal" />
          <Readout label={t("dormant")} value={`${dormant}`} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10 flex justify-center gap-2">
          {(["fire", "flood", "gap"] as const).map((ev) => (
            <ControlButton
              key={ev}
              variant={event === ev ? "active" : "default"}
              onClick={() => setEvent((cur) => (cur === ev ? "none" : ev))}
              aria-label={t(ev)}
            >
              <span className="px-1 text-[11px] uppercase tracking-wider">{t(ev)}</span>
            </ControlButton>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
