"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { H, NODE_COUNT, W, buildNetwork, cascadeFrames, finalCoverage } from "./quorum-model";

interface QuorumCascadeProps {
  caption?: string;
  className?: string;
}

// A planet-wide network that "decides" with no decider. Drop a distress signal
// into the most connected node (the Tree of Souls), set how many roused
// neighbours it takes to tip a quiet agent (the quorum threshold), and watch the
// alarm either fizzle locally or cascade across the whole network. Nothing
// chooses — local thresholds do all the work. The cascade is precomputed into
// frames (quorum-model.ts) so the reader can play it, step it tick by tick, or
// scrub straight to the settled state; reduced motion lands on the final frame.
export function QuorumCascade({ caption, className }: QuorumCascadeProps) {
  const uid = useId();
  const t = useTranslations("viz.quorumCascade");
  const reduced = useReducedMotionSafe();

  const { nodes, injection } = useMemo(buildNetwork, []);

  // quorum: how many roused neighbours flip a quiet node. Lower = spreads easily.
  const [quorum, setQuorum] = useState(2);
  // Precomputed cascade frames for the current quorum (frame 0 = seed only).
  const frames = useMemo(() => cascadeFrames(nodes, injection, quorum), [nodes, injection, quorum]);
  const lastFrame = frames.length - 1;

  // Which tick the reader is viewing. 0 = just injected; lastFrame = settled.
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  // Clamp the viewed tick whenever the frame set shrinks (quorum changed).
  useEffect(() => {
    setTick((tk) => Math.min(tk, lastFrame));
  }, [lastFrame]);

  // Auto-advance one tick per beat while playing; stop at the settled frame.
  useEffect(() => {
    if (!playing || reduced) return;
    if (tick >= lastFrame) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setTick((tk) => Math.min(tk + 1, lastFrame)), 420);
    return () => clearTimeout(id);
  }, [playing, reduced, tick, lastFrame]);

  const roused = frames[Math.min(tick, lastFrame)] ?? frames[0];
  // Wavefront: nodes newly roused on *this* tick (not present one frame earlier).
  const prev = tick > 0 ? frames[tick - 1] : new Set<number>();
  const wavefront = useMemo(() => {
    const w = new Set<number>();
    for (const id of roused) if (!prev.has(id)) w.add(id);
    return w;
  }, [roused, prev]);

  const inject = useCallback(() => {
    setStarted(true);
    setTick(0);
    if (reduced) {
      setTick(lastFrame);
      setPlaying(false);
      return;
    }
    setPlaying(true);
  }, [reduced, lastFrame]);

  const stepOnce = useCallback(() => {
    setStarted(true);
    setPlaying(false);
    setTick((tk) => Math.min(tk + 1, lastFrame));
  }, [lastFrame]);

  const reset = useCallback(() => {
    setPlaying(false);
    setStarted(false);
    setTick(0);
  }, []);

  const litCount = started ? roused.size : 0;
  const coverage = Math.round((litCount / NODE_COUNT) * 100);
  const settled = started && tick >= lastFrame;
  const final = useMemo(() => finalCoverage(nodes, injection, quorum), [nodes, injection, quorum]);
  const globalResponse = final >= 80;

  const verdict = !started
    ? t("idle")
    : !settled
      ? t("spreading")
      : globalResponse
        ? t("cascade")
        : t("contained");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={globalResponse && settled ? "magenta" : "cyan"}
      hint={settled ? (globalResponse ? t("cascadeNote") : t("containedNote")) : t("prompt")}
      controls={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={inject}
            className="rounded-md border px-3 py-2 font-sans text-xs font-600 transition-colors duration-200"
            style={{
              borderColor: "color-mix(in oklab, var(--magenta) 45%, transparent)",
              color: "var(--magenta)",
              background: "color-mix(in oklab, var(--magenta) 12%, transparent)",
            }}
          >
            {t("inject")}
          </button>
          {!reduced && (
            <button
              type="button"
              onClick={() =>
                playing ? setPlaying(false) : tick < lastFrame ? setPlaying(true) : undefined
              }
              aria-label={playing ? t("pause") : t("play")}
              disabled={!started || tick >= lastFrame}
              className="flex size-9 items-center justify-center rounded-full border border-border bg-void/40 text-magenta transition-all hover:border-magenta/60 hover:bg-void/70 active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "magenta"]} />

          {/* edges first, so nodes sit on top */}
          {nodes.map((node) =>
            node.neighbours
              .filter((n) => n > node.id) // draw each edge once
              .map((n) => {
                const other = nodes[n];
                const bothLit = roused.has(node.id) && roused.has(n);
                return (
                  <line
                    key={`${node.id}-${n}`}
                    x1={node.x}
                    y1={node.y}
                    x2={other.x}
                    y2={other.y}
                    stroke={bothLit ? "var(--magenta)" : "var(--border)"}
                    strokeWidth={bothLit ? 1.6 : 0.8}
                    strokeOpacity={bothLit ? 0.7 : 0.4}
                  />
                );
              }),
          )}

          {/* nodes — wavefront nodes flare brightest on the tick they ignite */}
          {nodes.map((node) => {
            const lit = roused.has(node.id);
            const isWave = wavefront.has(node.id);
            const isInjection = node.id === injection;
            const fill = lit
              ? "var(--magenta)"
              : "color-mix(in oklab, var(--cyan) 18%, var(--void))";
            return (
              <circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r={isInjection ? 6 : isWave ? 5.5 : 4}
                fill={fill}
                stroke={
                  isWave
                    ? "var(--magenta)"
                    : isInjection
                      ? "var(--magenta)"
                      : "var(--border-strong)"
                }
                strokeWidth={isWave || isInjection ? 1.6 : 0.8}
                opacity={lit ? 1 : 0.85}
                filter={lit ? glowUrl(uid, isWave ? "bloom-strong" : "bloom") : undefined}
              />
            );
          })}

          <VizText
            x={nodes[injection].x}
            y={nodes[injection].y - 12}
            size="micro"
            tone="magenta"
            anchor="middle"
          >
            {t("source")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout
            label={t("tickLabel")}
            value={started ? `${tick} / ${lastFrame}` : "—"}
            tone="var(--cyan)"
            note={wavefront.size > 0 ? `${t("wavefront")}: ${wavefront.size}` : undefined}
          />
          <VizReadout
            label={t("rousedLabel")}
            value={`${coverage}%`}
            tone="var(--magenta)"
            tinted={litCount > 0}
          />
          <VizReadout
            label={t("verdictLabel")}
            value={verdict}
            tone={globalResponse && settled ? "var(--magenta)" : "var(--cyan)"}
            tinted={settled}
            note={settled ? t("noDecider") : undefined}
          />
          <VizSlider
            label={t("quorumSlider")}
            display={`${quorum}`}
            min={1}
            max={4}
            step={1}
            value={quorum}
            onChange={(v) => {
              reset();
              setQuorum(v);
            }}
            tone="var(--cyan)"
            className="mt-1"
          />
          <p className="font-sans text-[0.7rem] uppercase tracking-wider text-subtle">
            {quorum <= 1 ? t("quorumLow") : quorum >= 3 ? t("quorumHigh") : t("quorumMid")}
          </p>
        </div>
      </div>

      {/* scrub timeline + step/reset — drag through the cascade tick by tick */}
      {!reduced && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={lastFrame}
            step={1}
            value={tick}
            disabled={!started}
            onChange={(e) => {
              setPlaying(false);
              setStarted(true);
              setTick(Number(e.target.value));
            }}
            aria-label={t("scrubLabel")}
            className="viz-range w-full cursor-pointer rounded-full outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            style={{
              background: `linear-gradient(to right, var(--magenta) ${lastFrame ? (tick / lastFrame) * 100 : 0}%, var(--border) ${lastFrame ? (tick / lastFrame) * 100 : 0}%)`,
              ["--viz-thumb" as string]: "var(--magenta)",
            }}
          />
          <button
            type="button"
            onClick={stepOnce}
            disabled={started && tick >= lastFrame}
            aria-label={t("step")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-all hover:border-cyan/60 hover:bg-void/70 active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <StepForward size={15} />
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label={t("reset")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-subtle transition-all hover:text-foreground active:scale-95"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      )}
    </VizFigure>
  );
}
