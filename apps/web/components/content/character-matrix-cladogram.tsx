"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { branchPath, tipYs } from "@/components/content/viz/tree";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

type Localized = { vi: string; en: string };

// Scientific data stays in code: the five diagnostic characters scored against a
// hypothetical marine-chordate outgroup. State 0 is the outgroup/ancestral
// condition; higher integers are derived states. The carbon-fibre skeleton and
// the neural queue are the synapomorphies that bind the bestiary into one clade.
interface CharCol {
  key: string;
  short: Localized;
}

const CHARS: CharCol[] = [
  { key: "limbs", short: { vi: "Chi", en: "Limbs" } },
  { key: "eyes", short: { vi: "Mắt", en: "Eyes" } },
  { key: "resp", short: { vi: "Hô hấp", en: "Resp." } },
  { key: "queue", short: { vi: "Queue", en: "Queue" } },
  { key: "bone", short: { vi: "Xương", en: "Bone" } },
];

interface Taxon {
  id: string;
  name: Localized;
  states: [number, number, number, number, number];
}

const TAXA: Taxon[] = [
  { id: "outgroup", name: { vi: "Ngoại nhóm", en: "Outgroup" }, states: [0, 1, 1, 0, 0] },
  { id: "ilu", name: { vi: "Ilu", en: "Ilu" }, states: [0, 0, 1, 1, 1] },
  { id: "direhorse", name: { vi: "Pa'li", en: "Direhorse" }, states: [0, 0, 0, 1, 1] },
  { id: "prolemuris", name: { vi: "Prolemuris", en: "Prolemuris" }, states: [1, 1, 0, 1, 1] },
  { id: "navi", name: { vi: "Na'vi", en: "Na'vi" }, states: [2, 1, 1, 1, 1] },
];

const W = 420;
const H = 300;

type Layout = "parsimony" | "phenetic";

// Tip order per layout. Parsimony nests Na'vi beside prolemuris deep in the
// ingroup; phenetic yanks Na'vi up beside the outgroup — a polyphyletic grouping
// that forces the killer synapomorphies to evolve twice.
const TIP_ORDER: Record<Layout, string[]> = {
  parsimony: ["outgroup", "ilu", "direhorse", "prolemuris", "navi"],
  phenetic: ["outgroup", "navi", "ilu", "direhorse", "prolemuris"],
};

interface CharacterMatrixCladogramProps {
  caption?: string;
  className?: string;
}

export function CharacterMatrixCladogram({ caption, className }: CharacterMatrixCladogramProps) {
  const uid = useId();
  const t = useTranslations("viz.characterMatrix");
  const locale = useLocale() as "vi" | "en";
  const [layout, setLayout] = useState<Layout>("parsimony");
  const phenetic = layout === "phenetic";

  const order = TIP_ORDER[layout];
  const ys = tipYs(order.length, 20, H - 20);
  const yOf = (id: string) => ys[order.indexOf(id)];
  const tipById = (id: string) => TAXA.find((tx) => tx.id === id)!;

  const rootX = 0.08 * W;
  const tipX = 0.62 * W;
  const nodeX = 0.32 * W - 30;
  // The synapomorphy node sits between ilu and navi when parsimonious.
  const nodeY = phenetic ? yOf("ilu") : (yOf("ilu") + yOf("navi")) / 2;

  return (
    <VizFigure
      title={t("title")}
      caption={caption}
      className={className}
      tone={phenetic ? "magenta" : "cyan"}
      controls={
        <SegmentedToggle
          ariaLabel={t("placeNavi")}
          value={layout}
          onChange={setLayout}
          options={[
            { value: "parsimony", label: t("parsimony"), tone: "var(--canon)" },
            { value: "phenetic", label: t("phenetic"), tone: "var(--inference)" },
          ]}
        />
      }
      hint={phenetic ? t("hint") : t("synapNote")}
    >
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* The character matrix */}
        <div className="lg:w-[44%]">
          <p className="mb-1 font-sans text-xs uppercase tracking-wider text-subtle">
            {t("matrixHead")}
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="bg-void/40">
                  <th className="px-1 py-1 text-left font-sans text-xs font-700 text-subtle" />
                  {CHARS.map((c) => (
                    <th key={c.key} className="px-1 py-1 font-sans text-xs font-700 text-subtle">
                      {c.short[locale]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TAXA.map((tx) => (
                  <tr key={tx.id} className="border-t border-border/60">
                    <td className="px-1 py-1 text-left font-display text-xs font-700 text-foreground">
                      {tx.name[locale]}
                    </td>
                    {tx.states.map((s, i) => (
                      <td
                        key={CHARS[i].key}
                        className="px-1 py-1.5 font-mono text-sm tabular-nums"
                        style={{
                          color: s === 0 ? "var(--subtle)" : "var(--cyan)",
                          fontWeight: s > 0 ? 700 : 400,
                          background:
                            s > 0
                              ? "color-mix(in oklab, var(--cyan) 16%, transparent)"
                              : "color-mix(in oklab, var(--void) 25%, transparent)",
                          boxShadow:
                            s > 0
                              ? "inset 0 1px 0 0 color-mix(in oklab, var(--cyan) 30%, transparent)"
                              : "inset 0 0 0 1px color-mix(in oklab, var(--border) 50%, transparent)",
                        }}
                      >
                        {s}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* The cladogram */}
        <div className="lg:w-[56%]">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("ariaLabel")}>
            <GlowDefs idBase={uid} />

            {/* synapomorphy backbone — glows thick when parsimonious */}
            <path
              d={`M ${rootX} ${yOf("outgroup")} H ${nodeX} V ${nodeY}`}
              fill="none"
              stroke="var(--canon)"
              strokeWidth={phenetic ? 2 : 5}
              strokeOpacity={phenetic ? 0.4 : 0.85}
              strokeLinejoin="round"
              filter={phenetic ? undefined : glowUrl(uid, "bloom")}
            />

            {order.map((id) => {
              const tx = tipById(id);
              const by = yOf(id);
              const isNavi = id === "navi";
              const isOut = id === "outgroup";
              const stroke = isNavi || (phenetic && isOut) ? "var(--inference)" : "var(--canon)";
              // Na'vi (and, under phenetics, the outgroup) sits off the clean
              // synapomorphy clade — highlight that branch so the cost reads.
              const highlight = isNavi || (phenetic && isOut);
              const parent = isOut ? { x: rootX, y: by } : { x: nodeX, y: nodeY };
              return (
                <g key={id}>
                  <path
                    d={branchPath(parent, { x: tipX, y: by })}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={highlight ? 3 : 2.5}
                    strokeOpacity={highlight ? 0.9 : 0.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={highlight ? glowUrl(uid, "bloom") : undefined}
                  />
                  <circle cx={tipX} cy={by} r={13} fill={stroke} fillOpacity={0.12} />
                  <circle
                    cx={tipX}
                    cy={by}
                    r={5}
                    fill={stroke}
                    filter={glowUrl(uid, highlight ? "bloom-strong" : "bloom")}
                  />
                  <VizText x={tipX + 12} y={by + 4} size="small" tone="foreground" weight={700}>
                    {tx.name[locale]}
                  </VizText>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Step-count readout */}
      <div
        className="mt-3 rounded-lg border px-3 py-2"
        style={{
          borderColor: phenetic
            ? "color-mix(in oklab, var(--inference) 45%, transparent)"
            : "color-mix(in oklab, var(--canon) 45%, transparent)",
          background: phenetic
            ? "color-mix(in oklab, var(--inference) 10%, transparent)"
            : "color-mix(in oklab, var(--canon) 10%, transparent)",
        }}
      >
        <p className="font-sans text-xs uppercase tracking-wider text-subtle">{t("steps")}</p>
        <p className="font-sans text-xs text-muted">
          {phenetic ? t("stepsPhenetic") : t("stepsParsimony")}
        </p>
      </div>
    </VizFigure>
  );
}
