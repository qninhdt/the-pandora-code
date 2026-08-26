"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Fuel molecule of cold light — highlight the reactive oxidation site.
export default function Luciferin() {
  const t = useTranslations("viz.luciferin");
  const [show, setShow] = useState(false);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setShow(false)}
      allowFullscreen={false}
      caption={
        <span className={show ? "text-teal" : "text-muted"}>
          {show ? t("reactive") : t("structure")}
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
          {/* simple ring+tail glyph */}
          <polygon
            points="40,30 60,30 70,48 60,66 40,66 30,48"
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth="1"
          />
          <line x1="70" y1="48" x2="84" y2="40" stroke="var(--teal)" strokeWidth="1.2" />
          <line x1="70" y1="48" x2="84" y2="56" stroke="var(--teal)" strokeWidth="1.2" />
          <circle
            cx="50"
            cy="48"
            r="4"
            fill="var(--void)"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          {show && (
            <circle
              cx="78"
              cy="48"
              r="8"
              fill="none"
              stroke="var(--amber)"
              strokeWidth="1.2"
              style={{ filter: "drop-shadow(0 0 6px var(--amber))" }}
            />
          )}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("reactive")}
            value={show ? t("oxidize") : "—"}
            accent={show ? "amber" : "foreground"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase"
            style={{
              borderColor: show ? "var(--amber)" : "var(--border-strong)",
              color: show ? "var(--amber)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {show ? t("reactive") : t("oxidize")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
