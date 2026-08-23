"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { RotateCcw, Scissors } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useId, useState } from "react";

interface BioelectricMorphologyEditorProps {
  caption?: string;
  className?: string;
}

const W = 360;
const H = 200;

type Vmem = "polarized" | "flat";
// The worm's committed target morphology: one head or two.
type Target = "one-head" | "two-head";

// A planarian trunk fragment that regenerates toward a stored "target morphology."
// Leave the bioelectric gradient polarized (head-voltage at one end, tail at the
// other) and it rebuilds one head. Flatten the gradient by uncoupling gap junctions
// and it commits to TWO heads — and, the startling part, that rewritten target
// PERSISTS: re-cut the two-headed worm in plain water and it stays two-headed. The
// reader sets the voltage state, regenerates, and re-cuts to see the memory hold.
// No DNA is edited; only the electrical pattern. Deterministic, SSR-safe.
export function BioelectricMorphologyEditor({
  caption,
  className,
}: BioelectricMorphologyEditorProps) {
  const uid = useId();
  const t = useTranslations("viz.bioelectricMorphologyEditor");

  const [vmem, setVmem] = useState<Vmem>("polarized");
  // committed = the worm has regenerated and locked in a target morphology.
  const [committed, setCommitted] = useState<Target | null>(null);
  const [recut, setRecut] = useState(false);

  const regenerate = useCallback(() => {
    setCommitted(vmem === "polarized" ? "one-head" : "two-head");
    setRecut(false);
  }, [vmem]);

  const recutWorm = useCallback(() => {
    // A committed worm re-cut in plain spring water keeps its stored target.
    if (committed) setRecut(true);
  }, [committed]);

  const reset = useCallback(() => {
    setCommitted(null);
    setRecut(false);
    setVmem("polarized");
  }, []);

  // What the fragment currently shows: before regeneration, a bare trunk tinted
  // by its voltage state; after, the committed morphology.
  const shown: Target | "trunk" = committed ?? "trunk";
  const twoHead = shown === "two-head";

  // body geometry
  const cx = W / 2;
  const midY = 96;
  const bodyW = 150;
  const bodyH = 40;
  const leftX = cx - bodyW / 2;
  const rightX = cx + bodyW / 2;

  const headFill = "var(--cyan)";
  const tailFill = "var(--magenta)";

  // Head glyph at a given end (dir = -1 left, +1 right)
  const Head = ({ dir }: { dir: number }) => {
    const hx = dir < 0 ? leftX : rightX;
    return (
      <g filter={glowUrl(uid, "bloom")}>
        <circle cx={hx} cy={midY} r={15} fill={headFill} fillOpacity={0.85} />
        {/* two eyespots */}
        <circle cx={hx + dir * -4} cy={midY - 5} r={2.2} fill="var(--void)" />
        <circle cx={hx + dir * -4} cy={midY + 5} r={2.2} fill="var(--void)" />
      </g>
    );
  };

  const Tail = ({ dir }: { dir: number }) => {
    const txp = dir < 0 ? leftX : rightX;
    return (
      <path
        d={`M ${txp} ${midY - 10} L ${txp + dir * 16} ${midY} L ${txp} ${midY + 10} Z`}
        fill={tailFill}
        fillOpacity={0.7}
      />
    );
  };

  const verdict = !committed
    ? t("idle")
    : twoHead
      ? recut
        ? t("memoryHeld")
        : t("twoHead")
      : t("oneHead");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={twoHead ? "magenta" : "cyan"}
      hint={
        committed
          ? twoHead
            ? recut
              ? t("memoryNote")
              : t("twoHeadNote")
            : t("oneHeadNote")
          : t("prompt")
      }
      controls={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={regenerate}
            className="rounded-md border px-3 py-2 font-sans text-xs font-600 transition-colors duration-200"
            style={{
              borderColor: "color-mix(in oklab, var(--cyan) 45%, transparent)",
              color: "var(--cyan)",
              background: "color-mix(in oklab, var(--cyan) 12%, transparent)",
            }}
          >
            {t("regenerate")}
          </button>
          <button
            type="button"
            onClick={recutWorm}
            disabled={!committed}
            aria-label={t("recut")}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-void/40 text-magenta transition-all hover:border-magenta/60 hover:bg-void/70 active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta"
          >
            <Scissors size={15} />
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label={t("reset")}
            className="flex size-9 items-center justify-center rounded-full border border-border text-subtle transition-all hover:text-foreground active:scale-95"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full sm:w-2/3" role="img" aria-label={t("aria")}>
          <GlowDefs idBase={uid} tones={["cyan", "magenta"]} />

          {/* the trunk body — a voltage-tinted bar before regeneration */}
          <defs>
            <linearGradient id={`${uid}-vmem`} x1="0" y1="0" x2="1" y2="0">
              {vmem === "polarized" ? (
                <>
                  <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--magenta)" stopOpacity={0.55} />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0.5} />
                </>
              )}
            </linearGradient>
          </defs>

          <rect
            x={leftX}
            y={midY - bodyH / 2}
            width={bodyW}
            height={bodyH}
            rx={bodyH / 2}
            fill={`url(#${uid}-vmem)`}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {/* ends: heads/tails once committed, else voltage caps */}
          {shown === "trunk" ? (
            <>
              <VizText x={leftX} y={midY - bodyH / 2 - 6} size="micro" tone="cyan" anchor="middle">
                {vmem === "polarized" ? t("headEnd") : t("flatEnd")}
              </VizText>
              <VizText
                x={rightX}
                y={midY - bodyH / 2 - 6}
                size="micro"
                tone={vmem === "polarized" ? "magenta" : "cyan"}
                anchor="middle"
              >
                {vmem === "polarized" ? t("tailEnd") : t("flatEnd")}
              </VizText>
            </>
          ) : twoHead ? (
            <>
              <Head dir={-1} />
              <Head dir={1} />
            </>
          ) : (
            <>
              <Head dir={-1} />
              <Tail dir={1} />
            </>
          )}

          {recut && (
            <line
              x1={cx}
              y1={midY - bodyH / 2 - 14}
              x2={cx}
              y2={midY + bodyH / 2 + 14}
              stroke="var(--magenta)"
              strokeWidth={1.2}
              strokeDasharray="4 3"
              strokeOpacity={0.8}
            />
          )}

          <VizText x={cx} y={H - 10} size="small" tone="subtle" anchor="middle">
            {t("dnaNote")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <SegmentedToggle
            ariaLabel={t("vmemLabel")}
            value={vmem}
            onChange={(v) => {
              setVmem(v);
              setCommitted(null);
              setRecut(false);
            }}
            options={[
              { value: "polarized", label: t("polarized"), tone: "var(--cyan)" },
              { value: "flat", label: t("flat"), tone: "var(--magenta)" },
            ]}
          />
          <VizReadout
            label={t("vmemState")}
            value={vmem === "polarized" ? t("gradientOn") : t("gradientOff")}
            tone={vmem === "polarized" ? "var(--cyan)" : "var(--magenta)"}
            note={vmem === "polarized" ? t("gradientOnNote") : t("gradientOffNote")}
          />
          <VizReadout
            label={t("resultLabel")}
            value={verdict}
            tone={twoHead ? "var(--magenta)" : "var(--cyan)"}
            tinted={Boolean(committed)}
            note={recut ? t("recutTag") : undefined}
          />
        </div>
      </div>
    </VizFigure>
  );
}
