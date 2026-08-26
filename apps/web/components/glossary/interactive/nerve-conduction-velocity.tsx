"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Myelin turns crawl into leap — saltatory vs continuous conduction speed.
export default function NerveConductionVelocity() {
  const t = useTranslations("viz.nerve-conduction-velocity");
  const [myelin, setMyelin] = useState(true);
  const speed = myelin ? 80 : 12;
  const nodes = myelin ? 5 : 0;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMyelin(true)}
      allowFullscreen={false}
      caption={
        <span className={myelin ? "text-cyan" : "text-muted"}>
          {myelin ? t("myelin") : t("bare")} · {speed} m/s
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
          <line x1="12" y1="48" x2="88" y2="48" stroke="var(--border-strong)" strokeWidth="2" />
          {myelin
            ? Array.from({ length: nodes }, (_, i) => (
                <g key={i}>
                  <rect
                    x={18 + i * 14}
                    y="40"
                    width="10"
                    height="16"
                    rx="2"
                    fill="var(--teal)"
                    opacity="0.75"
                  />
                  <circle
                    cx={30 + i * 14}
                    cy="48"
                    r="3"
                    fill="var(--cyan)"
                    style={{ filter: "drop-shadow(0 0 4px var(--cyan))" }}
                  />
                </g>
              ))
            : Array.from({ length: 12 }, (_, i) => (
                <circle
                  key={i}
                  cx={16 + i * 6}
                  cy="48"
                  r="2"
                  fill="var(--amber)"
                  opacity={0.4 + (i % 3) * 0.2}
                />
              ))}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("speed")} value={`${speed} m/s`} accent={myelin ? "cyan" : "amber"} />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setMyelin(true)}
            className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{
              borderColor: myelin ? "var(--cyan)" : "var(--border-strong)",
              color: myelin ? "var(--cyan)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("myelin")}
          </button>
          <button
            type="button"
            onClick={() => setMyelin(false)}
            className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{
              borderColor: !myelin ? "var(--amber)" : "var(--border-strong)",
              color: !myelin ? "var(--amber)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("bare")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
