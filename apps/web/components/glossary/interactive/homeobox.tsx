"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// The 180-letter grip found almost unchanged inside Hox genes and countless other
// developmental regulators. It encodes the part of the protein that clasps DNA and
// throws other genes on or off like a master switch. Finding this same short
// sequence in a fly, a mouse and a human — creatures split by 600 million years —
// is the discovery that opened evo-devo. Switch organisms and the homeobox motif
// stays identical while everything around it differs: conservation you can see.
const ORGANISMS = [
  { key: "fly", split: "600" },
  { key: "mouse", split: "600" },
  { key: "human", split: "0" },
];

export default function Homeobox() {
  const t = useTranslations("viz.homeobox");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [org, setOrg] = useState("fly");
  const spin = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      spin.current = (spin.current + dt * 0.7) % (Math.PI * 2);
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  // the homeobox 60-amino-acid domain, identical across organisms
  const CONSERVED = 60;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOrg("fly")}
      allowFullscreen={false}
      caption={
        <span>
          {t("inOrganism", { org: t(org) })} ·{" "}
          <span className="text-teal">{t("motifIdentical")}</span>
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
          {/* DNA double helix running vertically */}
          {Array.from({ length: 26 }, (_, i) => {
            const y = 16 + i * 2.6;
            const ph = spin.current + i * 0.5;
            const x1 = 50 + Math.sin(ph) * 10;
            const x2 = 50 - Math.sin(ph) * 10;
            return (
              <g key={i}>
                {i % 2 === 0 && (
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke="var(--border-strong)"
                    strokeWidth="0.4"
                    opacity="0.5"
                  />
                )}
                <circle cx={x1} cy={y} r="0.9" fill="var(--cyan)" opacity="0.7" />
                <circle cx={x2} cy={y} r="0.9" fill="var(--teal)" opacity="0.7" />
              </g>
            );
          })}

          {/* the homeobox protein clasping the major groove */}
          <g transform="translate(50 50)">
            {/* three alpha-helices of the homeodomain */}
            <ellipse
              cx="-13"
              cy="-4"
              rx="4"
              ry="7"
              fill="var(--amber)"
              opacity="0.55"
              transform="rotate(-25 -13 -4)"
            />
            <ellipse
              cx="-15"
              cy="6"
              rx="3.5"
              ry="6"
              fill="var(--amber)"
              opacity="0.55"
              transform="rotate(20 -15 6)"
            />
            {/* recognition helix reaching into the groove */}
            <ellipse
              cx="-6"
              cy="1"
              rx="3"
              ry="8"
              fill="var(--amber)"
              opacity="0.8"
              transform="rotate(70 -6 1)"
            />
            <text
              x="-16"
              y="-14"
              className="fill-amber"
              style={{ fontSize: 3, fontFamily: "monospace" }}
            >
              {t("homeodomain")}
            </text>
          </g>
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout label={t("conservedLabel")} value={`${CONSERVED} aa`} accent="teal" />
          <Readout
            label={t("splitLabel")}
            value={ORGANISMS.find((o) => o.key === org)?.split ?? "0"}
            unit={t("mya")}
            accent="foreground"
          />
        </div>

        <div className="absolute inset-x-3 top-14 flex justify-center">
          <ControlTabs
            options={ORGANISMS.map((o) => ({ value: o.key, label: t(o.key) }))}
            value={org}
            onChange={setOrg}
            ariaLabel={t("organism")}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
