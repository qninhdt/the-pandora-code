"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Built lamp layers: photocyte, reflector, lens, pigment shutter.
const LAYERS = ["photocyte", "reflector", "lens", "pigment"] as const;

export default function Photophore() {
  const t = useTranslations("viz.photophore");
  const [on, setOn] = useState<Record<(typeof LAYERS)[number], boolean>>({
    photocyte: true,
    reflector: true,
    lens: true,
    pigment: false,
  });
  const beam = on.photocyte && !on.pigment ? (on.lens ? 1 : 0.5) * (on.reflector ? 1.2 : 0.7) : 0;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOn({ photocyte: true, reflector: true, lens: true, pigment: false })}
      allowFullscreen={false}
      caption={<span className="text-teal">beam {beam.toFixed(1)}</span>}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {on.reflector && (
            <path d="M30 60 Q 50 20 70 60" fill="none" stroke="var(--amber)" strokeWidth="1.2" />
          )}
          {on.photocyte && (
            <circle
              cx="50"
              cy="52"
              r="8"
              fill="var(--teal)"
              opacity="0.8"
              style={{ filter: "drop-shadow(0 0 8px var(--teal))" }}
            />
          )}
          {on.lens && <ellipse cx="50" cy="40" rx="10" ry="4" fill="var(--cyan)" opacity="0.35" />}
          {on.pigment && (
            <rect
              x="38"
              y="34"
              width="24"
              height="6"
              fill="var(--void)"
              stroke="var(--magenta)"
              strokeWidth="0.6"
            />
          )}
          {beam > 0 && (
            <path
              d={`M50 34 L${50 - 10 * beam} 12 L${50 + 10 * beam} 12 Z`}
              fill="var(--cyan)"
              opacity={0.25 * beam}
            />
          )}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label="beam" value={beam.toFixed(1)} accent="teal" />
        </div>
        <div className="absolute inset-x-2 bottom-11 flex flex-wrap justify-center gap-1">
          {LAYERS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setOn((s) => ({ ...s, [k]: !s[k] }))}
              className="rounded-lg border px-2 py-1 font-mono text-[9px] uppercase"
              style={{
                borderColor: on[k] ? "var(--cyan)" : "var(--border-strong)",
                color: on[k] ? "var(--cyan)" : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {t(k)}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
