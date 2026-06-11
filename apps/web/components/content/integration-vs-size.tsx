"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { MESH_NODES, connectionCount, phi, verdictKey } from "./integration-model";

interface IntegrationVsSizeProps {
  caption?: string;
  className?: string;
}

type Mode = "mesh" | "loop";

const W = 360;
const H = 220;

interface Pt {
  x: number;
  y: number;
}

// Why a bigger network is not a more conscious one. A single recurrence dial
// rewires the *same* large population from a one-way feed-forward MESH (signal
// enters, passes through, exits — the cerebellum's 69 billion neurons, Φ≈0)
// into a densely recurrent web where every node talks back (the cortex's trick,
// Φ high). Drag it and watch the connection count barely move while Φ climbs:
// architecture, not headcount, is what counts. The mesh/loop toggle snaps the
// dial to its extremes. The signal pulse runs on usePhaseLoop; reduced motion
// freezes it. The Φ metric lives in integration-model.ts.
export function IntegrationVsSize({ caption, className }: IntegrationVsSizeProps) {
  const uid = useId();
  const t = useTranslations("viz.integrationVsSize");

  // recurrence r ∈ [0,1]: 0 = pure feed-forward mesh, 1 = fully recurrent loop.
  const [r, setR] = useState(0);
  const { phase } = usePhaseLoop({ period: 3.2, playing: true, initial: 0 });

  const isMeshish = r < 0.5;
  const mode: Mode = isMeshish ? "mesh" : "loop";

  // Feed-forward mesh: columns wired strictly left→right.
  const mesh = useMemo(() => {
    const cols = 5;
    const perCol = 6;
    const layers: Pt[][] = [];
    const marginX = 36;
    const marginY = 26;
    const gapX = (W - marginX * 2) / (cols - 1);
    const gapY = (H - marginY * 2) / (perCol - 1);
    for (let c = 0; c < cols; c++) {
      const col: Pt[] = [];
      for (let row = 0; row < perCol; row++)
        col.push({ x: marginX + c * gapX, y: marginY + row * gapY });
      layers.push(col);
    }
    return { layers, cols, perCol };
  }, []);

  // Recurrent ring overlaid on the mesh centroid: every node wired to every other.
  const loop = useMemo(() => {
    const n = 6;
    const cx = W / 2;
    const cy = H / 2;
    const radius = 78;
    const pts: Pt[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      pts.push({ x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius });
    }
    return { pts, n };
  }, []);

  const count = connectionCount(r);
  const phiVal = phi(r);
  const vKey = verdictKey(r);
  const p = phase;

  // Cross-fade the two topologies by opacity so the morph reads continuously.
  const meshOpacity = Math.max(0, 1 - r * 1.4);
  const loopOpacity = Math.max(0, (r - 0.25) * 1.5);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={isMeshish ? "amber" : "teal"}
      hint={isMeshish ? t("meshNote") : t("loopNote")}
      controls={
        <SegmentedToggle<Mode>
          ariaLabel={t("modeLabel")}
          value={mode}
          onChange={(m) => setR(m === "mesh" ? 0 : 1)}
          options={[
            { value: "mesh", label: t("mesh"), tone: "var(--amber)" },
            { value: "loop", label: t("loop"), tone: "var(--teal)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["teal", "amber"]} />

          {/* feed-forward layer (fades out as recurrence rises) */}
          <g opacity={meshOpacity} style={{ transition: "opacity 0.25s ease" }}>
            {mesh.layers
              .slice(0, -1)
              .map((col, ci) =>
                col.map((a, ai) =>
                  mesh.layers[ci + 1].map((b, bi) => (
                    <line
                      key={`m-${ci}-${ai}-${bi}`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="var(--border)"
                      strokeWidth={0.5}
                      strokeOpacity={0.4}
                    />
                  )),
                ),
              )}
            {mesh.layers.map((col, ci) => {
              const colPhase = (p + ci / mesh.cols) % 1;
              const active = colPhase < 0.5;
              return col.map((pt, ri) => (
                <circle
                  key={`mn-${ci}-${ri}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={3.4}
                  fill={
                    active ? "var(--amber)" : "color-mix(in oklab, var(--amber) 22%, var(--void))"
                  }
                  opacity={active ? 0.95 : 0.6}
                  filter={active ? glowUrl(uid, "bloom") : undefined}
                />
              ));
            })}
            <VizText x={W / 2} y={H - 6} size="micro" tone="amber" anchor="middle">
              {t("oneWay")}
            </VizText>
          </g>

          {/* recurrent ring (fades in as recurrence rises) */}
          <g opacity={loopOpacity} style={{ transition: "opacity 0.25s ease" }}>
            {loop.pts.map((a, ai) =>
              loop.pts.map((b, bi) => {
                if (bi <= ai) return null;
                return (
                  <line
                    key={`l-${ai}-${bi}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="var(--teal)"
                    strokeWidth={1.2}
                    strokeOpacity={0.45}
                  />
                );
              }),
            )}
            {loop.pts.map((pt, i) => {
              // pulse circulates both ways once recurrent — reverberation, not a sweep
              const nodePhase = (p + i / loop.n) % 1;
              const back = (1 - p + i / loop.n) % 1;
              const active = nodePhase < 0.4 || back < 0.3;
              return (
                <circle
                  key={`ln-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={6}
                  fill={
                    active ? "var(--teal)" : "color-mix(in oklab, var(--teal) 26%, var(--void))"
                  }
                  stroke="var(--teal)"
                  strokeWidth={1}
                  strokeOpacity={0.6}
                  opacity={active ? 1 : 0.7}
                  filter={active ? glowUrl(uid, "bloom") : undefined}
                />
              );
            })}
            <VizText x={W / 2} y={H / 2} size="micro" tone="teal" anchor="middle">
              {t("talksBack")}
            </VizText>
          </g>
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout
            label={t("countLabel")}
            value={count}
            tone="var(--amber)"
            note={`${MESH_NODES}+ ${t("nodesNote")}`}
          />
          <VizReadout
            label={t("phiLabel")}
            value={phiVal < 0.05 ? "≈ 0" : phiVal.toFixed(1)}
            tone={isMeshish ? "var(--amber)" : "var(--teal)"}
            tinted
            note={isMeshish ? t("phiZero") : t("phiHigh")}
          />
          <VizReadout
            label={t("verdictLabel")}
            value={vKey === "unconscious" ? t("unconscious") : t("conscious")}
            tone={vKey === "unconscious" ? "var(--amber)" : "var(--teal)"}
            tinted
          />
          <VizSlider
            label={t("recurrenceLabel")}
            display={`${Math.round(r * 100)}%`}
            min={0}
            max={1}
            step={0.01}
            value={r}
            onChange={setR}
            tone={isMeshish ? "var(--amber)" : "var(--teal)"}
            className="mt-1"
          />
        </div>
      </div>
    </VizFigure>
  );
}
