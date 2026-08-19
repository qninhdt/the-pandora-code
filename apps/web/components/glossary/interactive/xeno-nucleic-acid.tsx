"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Our twisted ladder is not the only workable one. An XNA carries genetic
// information like DNA or RNA but on a different backbone — swap the sugar or the
// spine for a component Earth life never used, and information can still be stored
// and copied. Switch backbones and watch the two rails change chemistry while the
// rungs — the base-pairing logic — stay intact. A microbe built on XNA would be
// invisible to any tool that only knows how to read the familiar spine.
const BACKBONES = [
  { key: "dna", spine: "deoxyribose", railColor: "var(--cyan)" },
  { key: "tna", spine: "threose", railColor: "var(--teal)" },
  { key: "pna", spine: "peptide", railColor: "var(--amber)" },
  { key: "hna", spine: "hexitol", railColor: "var(--magenta)" },
];

export default function XenoNucleicAcid() {
  const t = useTranslations("viz.xeno-nucleic-acid");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [bb, setBb] = useState("dna");
  const spin = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      spin.current = (spin.current + dt * 0.6) % (Math.PI * 2);
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const active = BACKBONES.find((b) => b.key === bb) ?? BACKBONES[0];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setBb("dna")}
      allowFullscreen={false}
      caption={
        <span>
          {t("backbone")}: <span style={{ color: active.railColor }}>{t(active.spine)}</span> ·{" "}
          <span className="text-foreground">{t("pairingHolds")}</span>
        </span>
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
          {/* double helix: two rails (backbone) + rungs (base pairs) */}
          {Array.from({ length: 22 }, (_, i) => {
            const y = 18 + i * 2.9;
            const ph = spin.current + i * 0.55;
            const x1 = 50 + Math.sin(ph) * 14;
            const x2 = 50 - Math.sin(ph) * 14;
            const depth = Math.cos(ph); // for subtle z-shading
            return (
              <g key={i}>
                {/* rung — base pairing, always the same */}
                {i % 1 === 0 && (
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke="var(--foreground)"
                    strokeWidth="0.5"
                    opacity={0.25 + Math.abs(depth) * 0.25}
                  />
                )}
                {/* rail nodes — backbone chemistry, colored per XNA */}
                <circle
                  cx={x1}
                  cy={y}
                  r={1.3 + depth * 0.4}
                  fill={active.railColor}
                  opacity="0.85"
                />
                <circle
                  cx={x2}
                  cy={y}
                  r={1.3 - depth * 0.4}
                  fill={active.railColor}
                  opacity="0.85"
                />
              </g>
            );
          })}

          {/* rail labels */}
          <text
            x="50"
            y="90"
            textAnchor="middle"
            style={{ fontSize: 3, fontFamily: "monospace", fill: active.railColor }}
          >
            {t(active.spine)} {t("backboneShort")}
          </text>
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout label={t("rails")} value={t(active.spine)} accent="foreground" />
          <Readout label={t("rungs")} value={t("aTgC")} accent="foreground" />
        </div>

        <div className="absolute inset-x-3 top-14 flex justify-center">
          <ControlTabs
            options={BACKBONES.map((b) => ({ value: b.key, label: t(b.key) }))}
            value={bb}
            onChange={setBb}
            ariaLabel={t("backbone")}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
