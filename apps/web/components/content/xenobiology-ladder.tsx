"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import type { ClassificationKind } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// The token color for each epistemic tier, matching CanonBadge / TierLegend.
const tierVar: Record<ClassificationKind, string> = {
  canon: "--canon",
  inference: "--inference",
  speculation: "--speculation",
  real_science: "--real-science",
};

// Where each tier sits on the forced→forbidden spectrum (0 left … 1 right) and
// which survival verdict its claims earn when run through the chapter's test.
const tierPos: Record<ClassificationKind, number> = {
  real_science: 0.12,
  canon: 0.12,
  inference: 0.5,
  speculation: 0.9,
};
type Verdict = "survives" | "costly" | "shatters";
const tierVerdict: Record<ClassificationKind, Verdict> = {
  real_science: "survives",
  canon: "survives",
  inference: "costly",
  speculation: "shatters",
};

interface LadderRung {
  /** Epistemic tier; sets the rung's hue and spectrum position. */
  tier: ClassificationKind;
  /** Short plausibility verdict, e.g. "All but forced" / "Physically impossible". */
  verdict: string;
  /** The Pandoran biological claim being graded. */
  claim: string;
  /** The Earth analog or principle the claim is read against. */
  analog: string;
  /** The reasoning revealed when the rung is selected. */
  note: string;
}

interface XenobiologyLadderProps {
  rungs: LadderRung[];
  /** Optional heading. */
  title?: string;
  /** Optional lead-in paragraph below the heading. */
  intro?: string;
  /** Label for the analog row inside the detail panel (localized per MDX file). */
  analogLabel?: string;
  className?: string;
}

const W = 320;
const H = 132;
const PAD_X = 20;
const AXIS_Y = 96;
const SPAN = W - PAD_X * 2;
const nodeX = (tier: ClassificationKind) => PAD_X + tierPos[tier] * SPAN;

// A forced→forbidden spectrum, not a list. Each of Pandora's signature claims is
// plotted as a node at the position its epistemic tier earns, along a gradient
// axis running from "all but forced" to "physically forbidden". Selecting a node
// runs the chapter's test — would this survive where it must live? — as a short
// verdict animation (survives / costly / shatters) plus the Earth analog and the
// reasoning. Rung copy arrives localized via props; the axis/test chrome comes from
// translations so the visual embodies the gradient instead of being an accordion.
export function XenobiologyLadder({
  rungs,
  title,
  intro,
  analogLabel,
  className,
}: XenobiologyLadderProps) {
  const uid = useId();
  const t = useTranslations("viz.xenobiologyLadder");
  const reduced = useReducedMotionSafe();
  const [sel, setSel] = useState(0);
  const active = rungs[sel];
  const c = active ? `var(${tierVar[active.tier]})` : "var(--cyan)";
  const verdict = active ? tierVerdict[active.tier] : "survives";

  // vertical stagger so two nodes sharing a tier (same x) never overlap
  const yOf = (i: number) => {
    const sameTier = rungs.filter((r) => tierPos[r.tier] === tierPos[rungs[i].tier]);
    const rank = sameTier.indexOf(rungs[i]);
    return AXIS_Y - 34 - rank * 22;
  };

  return (
    <section
      className={cn(
        "my-10 rounded-2xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      {title && <h3 className="mb-2 font-display text-lg font-700 text-foreground">{title}</h3>}
      {intro && (
        <p className="mb-4 font-serif text-[0.95rem] leading-relaxed text-muted">{intro}</p>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
        <defs>
          <linearGradient id={`${uid}-spectrum`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--real-science)" stopOpacity={0.7} />
            <stop offset="50%" stopColor="var(--inference)" stopOpacity={0.7} />
            <stop offset="100%" stopColor="var(--speculation)" stopOpacity={0.7} />
          </linearGradient>
          <filter id={`${uid}-glow`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* the spectrum axis */}
        <rect
          x={PAD_X}
          y={AXIS_Y - 2}
          width={SPAN}
          height={4}
          rx={2}
          fill={`url(#${uid}-spectrum)`}
        />
        {/* end + mid captions */}
        <text
          x={PAD_X}
          y={AXIS_Y + 18}
          textAnchor="start"
          className="font-sans"
          style={{ fill: "var(--real-science)", fontSize: 11, fontWeight: 600 }}
        >
          {t("forced")}
        </text>
        <text
          x={PAD_X + SPAN / 2}
          y={AXIS_Y + 18}
          textAnchor="middle"
          className="font-sans"
          style={{ fill: "var(--inference)", fontSize: 11, fontWeight: 600 }}
        >
          {t("conceivable")}
        </text>
        <text
          x={W - PAD_X}
          y={AXIS_Y + 18}
          textAnchor="end"
          className="font-sans"
          style={{ fill: "var(--speculation)", fontSize: 11, fontWeight: 600 }}
        >
          {t("forbidden")}
        </text>

        {/* nodes */}
        {rungs.map((r, i) => {
          const x = nodeX(r.tier);
          const y = yOf(i);
          const rc = `var(${tierVar[r.tier]})`;
          const isSel = i === sel;
          return (
            <g key={i} style={{ cursor: "pointer" }} onClick={() => setSel(i)}>
              {/* connector down to the axis */}
              <line
                x1={x}
                y1={y}
                x2={x}
                y2={AXIS_Y}
                stroke={rc}
                strokeOpacity={isSel ? 0.5 : 0.2}
                strokeWidth={1}
              />
              <circle
                cx={x}
                cy={y}
                r={isSel ? 8 : 5.5}
                fill={rc}
                fillOpacity={isSel ? 1 : 0.55}
                filter={isSel ? `url(#${uid}-glow)` : undefined}
                style={{ transition: "r 0.2s ease, fill-opacity 0.2s ease" }}
              />
              {isSel && (
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="none"
                  stroke={rc}
                  strokeWidth={1}
                  strokeOpacity={0.4}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* node selector chips — keyboard-accessible path to every claim */}
      <div role="tablist" aria-label={t("aria")} className="mt-3 flex flex-wrap gap-1.5">
        {rungs.map((r, i) => {
          const rc = `var(${tierVar[r.tier]})`;
          const isSel = i === sel;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isSel}
              onClick={() => setSel(i)}
              className="rounded-full px-2.5 py-1 font-sans text-xs font-600 transition-all"
              style={{
                color: isSel ? rc : "var(--subtle)",
                background: isSel ? `color-mix(in oklab, ${rc} 16%, transparent)` : "transparent",
                boxShadow: isSel
                  ? `inset 0 0 0 1px color-mix(in oklab, ${rc} 45%, transparent)`
                  : "none",
              }}
            >
              {r.verdict}
            </button>
          );
        })}
      </div>

      {/* detail panel for the selected claim */}
      {active && (
        <div
          className="mt-3 overflow-hidden rounded-xl border bg-void/30 p-4"
          style={{
            borderColor: `color-mix(in oklab, ${c} 30%, transparent)`,
            boxShadow: `0 0 28px -22px ${c}`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className="block font-sans text-xs font-semibold uppercase tracking-wider"
                style={{ color: c }}
              >
                {active.verdict}
              </span>
              <span className="mt-0.5 block font-serif text-[0.95rem] leading-snug text-foreground/90">
                {active.claim}
              </span>
            </div>
            <VerdictBadge
              verdict={verdict}
              tone={c}
              label={t(`verdict.${verdict}`)}
              reduced={reduced}
            />
          </div>
          <dl className="mt-3 space-y-3 border-t border-border/60 pt-3">
            <div>
              <dt className="font-sans text-xs uppercase tracking-[0.18em] text-subtle">
                {analogLabel ?? "Earth analog"}
              </dt>
              <dd className="mt-0.5 font-serif text-[0.88rem] leading-snug text-muted">
                {active.analog}
              </dd>
            </div>
            <p className="font-serif text-[0.9rem] leading-relaxed text-foreground/85">
              {active.note}
            </p>
          </dl>
        </div>
      )}
    </section>
  );
}

// The chapter's test made into a glyph: a token that passes clean (survives),
// passes under strain (costly), or shatters on contact (forbidden). Motion is a
// pure enhancement — reduced-motion shows the resting glyph.
function VerdictBadge({
  verdict,
  tone,
  label,
  reduced,
}: {
  verdict: Verdict;
  tone: string;
  label: string;
  reduced: boolean;
}) {
  const glyph = verdict === "survives" ? "✓" : verdict === "costly" ? "≈" : "✕";
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-700",
        !reduced && verdict === "shatters" && "animate-pulse",
      )}
      style={{
        color: tone,
        background: `color-mix(in oklab, ${tone} 14%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${tone} 40%, transparent)`,
      }}
    >
      <span aria-hidden style={{ fontSize: "0.95em" }}>
        {glyph}
      </span>
      {label}
    </span>
  );
}
