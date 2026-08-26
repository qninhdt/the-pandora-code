"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE STRUCTURE — five rungs of consent, and where each real case sits
//
// Access-and-benefit-sharing law climbed one rung at a time:
//
//   0 open access     biodiversity as "common heritage"; no consent owed
//   1 sovereignty     CBD Art. 15 (1992): states own their biological resources
//   2 consent         Nagoya (2014): prior informed consent + mutually agreed terms
//   3 benefit-share   negotiated royalties reaching knowledge-holders
//   4 personhood      the resource is a rights-bearing subject, not property
//
// Every rung up to 3 still treats the organism as property belonging to someone.
// Rung 4 is a different instrument entirely, and it is where a sapient species
// belongs. Nagoya cannot reach it: a protocol for consenting *owners* has nothing
// to say when the resource is the party whose consent is required.
// ─────────────────────────────────────────────────────────────────────

interface Rung {
  id: string;
  /** Whether the amrita regime satisfies this rung. */
  amritaMeets: boolean;
  tone: string;
}

const RUNGS: Rung[] = [
  { id: "openAccess", amritaMeets: true, tone: "var(--subtle)" },
  { id: "sovereignty", amritaMeets: false, tone: "var(--cyan)" },
  { id: "consent", amritaMeets: false, tone: "var(--teal)" },
  { id: "benefit", amritaMeets: false, tone: "var(--amber)" },
  { id: "personhood", amritaMeets: false, tone: "var(--magenta)" },
];

const W = 320;
const H = 240;
const PAD_L = 26;
const PAD_R = 26;
const PAD_T = 16;
const PAD_B = 20;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

const STEP_H = plotH / RUNGS.length;
// Each rung is drawn narrower as it climbs, so the ladder reads as a stair.
const stepW = (i: number) => plotW * (0.5 + 0.1 * (RUNGS.length - 1 - i));

interface ConsentLadderProps {
  caption?: string;
  className?: string;
}

// Climb the rungs to see which legal instrument each one corresponds to, which
// real Earth case established it, and whether the amrita trade clears it. The
// regime clears exactly one rung: the bottom one.
export function ConsentLadder({ caption, className }: ConsentLadderProps) {
  const uid = useId();
  const t = useTranslations("viz.consentLadder");
  const [selected, setSelected] = useState("consent");

  const active = RUNGS.find((r) => r.id === selected) ?? RUNGS[2];
  const activeIndex = RUNGS.findIndex((r) => r.id === active.id);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={active.amritaMeets ? t("hint.cleared") : t("hint.failed")}
      caption={caption}
      tone={active.id === "personhood" ? "magenta" : "cyan"}
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria.chart", { rung: t(`rung.${active.id}.label`) })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {RUNGS.map((rung, i) => {
            // Index 0 is the bottom rung, so draw from the bottom up.
            const rowFromTop = RUNGS.length - 1 - i;
            const y = PAD_T + rowFromTop * STEP_H;
            const w = stepW(i);
            const isActive = rung.id === selected;
            const h = STEP_H - 6;
            return (
              <g key={rung.id}>
                <rect
                  x={PAD_L}
                  y={y}
                  width={plotW}
                  height={STEP_H}
                  fill="transparent"
                  className="cursor-pointer focus-visible:outline focus-visible:outline-1"
                  role="button"
                  tabIndex={0}
                  aria-label={t(`rung.${rung.id}.label`)}
                  aria-pressed={isActive}
                  onClick={() => setSelected(rung.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(rung.id);
                    }
                  }}
                />
                <rect
                  x={PAD_L}
                  y={y}
                  width={w}
                  height={h}
                  rx={3}
                  fill={rung.tone}
                  opacity={isActive ? 0.28 : 0.1}
                  stroke={rung.tone}
                  strokeWidth={isActive ? 1.6 : 0.8}
                  strokeOpacity={isActive ? 0.9 : 0.4}
                  strokeDasharray={rung.amritaMeets ? undefined : "4 3"}
                  filter={isActive ? glowUrl(uid, "bloom") : undefined}
                  className="pointer-events-none"
                />
                <VizText
                  x={PAD_L + 8}
                  y={y + h / 2 + 3}
                  size="small"
                  tone={isActive ? rung.tone : "var(--subtle)"}
                  className="pointer-events-none"
                >
                  {t(`rung.${rung.id}.label`)}
                </VizText>
                {/* A filled dot marks a rung the amrita regime actually clears. */}
                <circle
                  cx={PAD_L + w + 10}
                  cy={y + h / 2}
                  r={3}
                  fill={rung.amritaMeets ? "var(--teal)" : "none"}
                  stroke={rung.amritaMeets ? "var(--teal)" : "var(--magenta)"}
                  strokeWidth={1.2}
                  className="pointer-events-none"
                />
              </g>
            );
          })}
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.instrument")}
            value={t(`rung.${active.id}.instrument`)}
            tone={active.tone}
          />
          <VizReadout
            label={t("readout.precedent")}
            value={t(`rung.${active.id}.precedent`)}
            tone={active.tone}
          />
          <VizReadout
            label={t("readout.status")}
            value={active.amritaMeets ? t("status.met") : t("status.unmet")}
            note={t(`rung.${active.id}.why`)}
            tone={active.amritaMeets ? "var(--teal)" : "var(--magenta)"}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">
            {t("legend", { index: activeIndex + 1, total: RUNGS.length })}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}
