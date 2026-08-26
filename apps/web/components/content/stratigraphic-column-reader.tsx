"use client";

import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  type FeatureId,
  PRINCIPLE_OF,
  READING_ORDER,
  type Relation,
  ageBracket,
  bracketCentre,
  bracketWidth,
  relate,
} from "./stratigraphic-column-model";
import { StratigraphicColumnPicker } from "./stratigraphic-column-picker";
import { StratigraphicColumnWall } from "./stratigraphic-column-wall";

// Read a rock wall the way a field geologist does, then watch how little of it
// two dated ash beds can actually pin down. Pick any feature and the wall sorts
// itself into what is provably older, provably younger, and — the point of the
// figure — what the geometry simply cannot rank, because the two features never
// touch. Then the numbers arrive: only the ash beds carry measured dates, and
// everything between them inherits a bracket that is wider than any reader
// expects. Relative order is cheap and certain; absolute years are expensive and
// come with edges. Ordering logic and the bracket arithmetic live in
// ./stratigraphic-column-model.ts.

const RELATION_TONE: Record<Relation, string> = {
  self: "var(--cyan)",
  older: "var(--amber)",
  younger: "var(--teal)",
  undetermined: "var(--magenta)",
};

// Sliders move the two dated beds; the older bed must stay older by this much
// so the bracket never inverts.
const MIN_SEPARATION = 0.2;

interface StratigraphicColumnReaderProps {
  caption?: string;
  className?: string;
}

export function StratigraphicColumnReader({ caption, className }: StratigraphicColumnReaderProps) {
  const uid = useId();
  const t = useTranslations("viz.stratigraphicColumn");

  const [selected, setSelected] = useState<FeatureId>("dike");
  const [lowerAsh, setLowerAsh] = useState(3.8); // Gyr ago, the deeper dated bed
  const [upperAsh, setUpperAsh] = useState(1.2); // Gyr ago, the shallower one
  const [sigmaMyr, setSigmaMyr] = useState(40); // analytical uncertainty, Myr

  const sigma = sigmaMyr / 1000;
  const bracket = ageBracket(selected, lowerAsh, upperAsh, sigma);
  const width = bracketWidth(bracket);
  const principle = PRINCIPLE_OF[selected];

  // How the wall splits around the current selection — the tally that makes the
  // "undetermined" category feel like a real limit rather than a caveat.
  const tally = useMemo(() => {
    const counts = { older: 0, younger: 0, undetermined: 0 };
    for (const id of READING_ORDER) {
      const rel = relate(selected, id);
      if (rel !== "self") counts[rel] += 1;
    }
    return counts;
  }, [selected]);

  const ambiguous = tally.undetermined > 0;
  const tone = ambiguous ? "magenta" : "cyan";

  // One statement per shape of evidence: a dated bed gets a figure, a bracketed
  // one gets two edges, and anything outside the dated pair gets a single bound.
  const centre = bracketCentre(bracket);
  const ageValue =
    bracket.kind === "measured" && centre !== null
      ? t("age.measured", { n: fmt(centre) })
      : bracket.kind === "between" && bracket.old !== null && bracket.young !== null
        ? t("age.between", { old: fmt(bracket.old), young: fmt(bracket.young) })
        : bracket.old !== null
          ? t("age.olderThan", { n: fmt(bracket.old) })
          : t("age.youngerThan", { n: fmt(bracket.young ?? 0) });

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={tone}
      hint={ambiguous ? t("hint.ambiguous") : t("hint.ordered")}
      caption={caption}
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="sm:w-1/2">
          <StratigraphicColumnWall
            uid={uid}
            toneOf={(id) => RELATION_TONE[relate(selected, id)]}
            isSelected={(id) => id === selected}
            younger={t("axis.younger")}
            older={t("axis.older")}
            ariaLabel={t("aria", { feature: t(`feature.${selected}`) })}
          />
        </div>

        <div className="flex flex-col gap-3 sm:w-1/2">
          <StratigraphicColumnPicker
            legend={t("pickLabel")}
            selected={selected}
            onSelect={setSelected}
            toneOf={(id) => RELATION_TONE[relate(selected, id)]}
            nameOf={(id) => t(`feature.${id}`)}
          />

          <VizReadout
            label={t("readout.principle")}
            value={t(`principle.${principle}`)}
            note={t(`principleNote.${principle}`)}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.age")}
            value={ageValue}
            note={
              width === null
                ? t("readout.oneSided")
                : t("readout.span", { n: Math.round(width * 1000) })
            }
            tone={bracket.kind === "measured" ? "var(--teal)" : "var(--amber)"}
            tinted
          />
          <div className="grid grid-cols-3 gap-2">
            <VizReadout label={t("readout.older")} value={tally.older} tone="var(--amber)" />
            <VizReadout label={t("readout.younger")} value={tally.younger} tone="var(--teal)" />
            <VizReadout
              label={t("readout.undetermined")}
              value={tally.undetermined}
              tone="var(--magenta)"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <VizSlider
          label={t("slider.lowerAsh")}
          display={t("gyrValue", { n: fmt(lowerAsh) })}
          min={1.4}
          max={4.5}
          step={0.05}
          value={lowerAsh}
          onChange={(v) => {
            setLowerAsh(v);
            if (v - upperAsh < MIN_SEPARATION) setUpperAsh(Number((v - MIN_SEPARATION).toFixed(2)));
          }}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("slider.upperAsh")}
          display={t("gyrValue", { n: fmt(upperAsh) })}
          min={0.2}
          max={4.2}
          step={0.05}
          value={upperAsh}
          onChange={(v) => {
            setUpperAsh(v);
            if (lowerAsh - v < MIN_SEPARATION) setLowerAsh(Number((v + MIN_SEPARATION).toFixed(2)));
          }}
          tone="var(--teal)"
        />
        <VizSlider
          label={t("slider.sigma")}
          display={t("myrValue", { n: sigmaMyr })}
          min={5}
          max={200}
          step={5}
          value={sigmaMyr}
          onChange={setSigmaMyr}
          tone="var(--cyan)"
        />
      </div>
    </VizFigure>
  );
}

function fmt(gyr: number): string {
  return gyr.toFixed(2);
}
