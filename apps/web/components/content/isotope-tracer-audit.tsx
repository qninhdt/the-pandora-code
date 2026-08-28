"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { ControlToggleGrid } from "./isotope-tracer-audit-controls";
import {
  CONTROL_ORDER,
  type ControlId,
  RUNG_TONE,
  auditDesign,
} from "./isotope-tracer-audit-model";

interface IsotopeTracerAuditProps {
  caption?: string;
  className?: string;
}

// The chapter's honesty made operable. The reader builds the isotope-tracing
// experiment themselves, switching each control on or off, and the figure answers
// the only question that matters: what is the strongest claim this design has
// actually earned? Leave out the mesh barrier and every molecule you detect could
// have leaked through the soil; leave out the kin design and the mother-tree
// story is not yours to tell. The feeling to leave behind is the reason a true
// narrow result kept getting retold as a sweeping one — the claim outran the
// controls, one omission at a time.

const VIEW_W = 340;
const VIEW_H = 150;

export function IsotopeTracerAudit({ caption, className }: IsotopeTracerAuditProps) {
  const t = useTranslations("viz.isotopeTracerAudit");
  const uid = useId();

  const [controls, setControls] = useState<Record<ControlId, boolean>>({
    dualIsotope: true,
    meshBarrier: false,
    sourceSink: false,
    kinDesign: false,
    wildForest: false,
  });

  const audit = auditDesign(controls);
  const inPlace = CONTROL_ORDER.filter((id) => controls[id]).length;

  const rungTone = RUNG_TONE[audit.rung];
  // Figure chrome follows the same three-band reading as the rung hue: an
  // unearned claim burns magenta, the earned middle rungs read teal, the kin rung
  // reads amber because field ecology has never actually closed it.
  const figTone: "teal" | "magenta" | "amber" =
    audit.rung === "none" || audit.rung === "movement"
      ? "magenta"
      : audit.rung === "kin"
        ? "amber"
        : "teal";

  const sourceX = 62;
  const receiverX = VIEW_W - 62;
  const soilY = 96;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={figTone}
      hint={t(`confound.${audit.confound}`)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", { n: inPlace, total: CONTROL_ORDER.length })}
        >
          <GlowDefs idBase={uid} tones={["teal", "cyan", "magenta", "amber"]} />

          {/* the soil compartment both root systems share */}
          <rect
            x={18}
            y={soilY - 16}
            width={VIEW_W - 36}
            height={44}
            rx={8}
            fill="color-mix(in oklab, var(--void) 55%, transparent)"
            stroke="var(--border)"
          />

          {/* the labelled tracer route through the fungal bridge */}
          <path
            d={`M ${sourceX} ${soilY} C ${VIEW_W / 2 - 40} ${soilY + 20}, ${VIEW_W / 2 + 40} ${soilY + 20}, ${receiverX} ${soilY}`}
            fill="none"
            stroke={controls.meshBarrier ? "var(--teal)" : "var(--amber)"}
            strokeWidth={2.4}
            strokeOpacity={0.85}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
          />

          {/* the mesh barrier: severs hyphae, still passes soil solution */}
          {controls.meshBarrier && (
            <g>
              <line
                x1={VIEW_W / 2}
                y1={soilY - 14}
                x2={VIEW_W / 2}
                y2={soilY + 26}
                stroke="var(--cyan)"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <VizText x={VIEW_W / 2} y={soilY + 40} size="micro" tone="cyan" anchor="middle">
                {t("meshMarker")}
              </VizText>
            </g>
          )}

          {/* source tree (labelled) and receiver, shaded when the gradient is on */}
          <circle cx={sourceX} cy={soilY - 40} r={14} fill={glowUrl(uid, "wash-amber")} />
          <circle cx={sourceX} cy={soilY - 40} r={9} fill="var(--amber)" fillOpacity={0.9} />
          <circle
            cx={receiverX}
            cy={soilY - 40}
            r={14}
            fill={glowUrl(uid, controls.sourceSink ? "wash-teal" : "wash-cyan")}
          />
          <circle
            cx={receiverX}
            cy={soilY - 40}
            r={controls.sourceSink ? 6 : 9}
            fill={controls.sourceSink ? "var(--teal)" : "var(--cyan)"}
            fillOpacity={0.9}
          />

          <VizText x={sourceX} y={soilY - 60} size="small" tone="amber" anchor="middle">
            {t("source")}
          </VizText>
          <VizText
            x={receiverX}
            y={soilY - 60}
            size="small"
            tone={controls.sourceSink ? "teal" : "cyan"}
            anchor="middle"
          >
            {controls.sourceSink ? t("receiverShaded") : t("receiver")}
          </VizText>
          <VizText x={VIEW_W / 2} y={VIEW_H - 6} size="micro" anchor="middle">
            {t("routeLabel")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("claimLabel")}
            value={t(`rung.${audit.rung}`)}
            tone={rungTone}
            tinted
            note={t("claimNote")}
          />
          <VizReadout
            label={t("attributionLabel")}
            value={t(`attribution.${audit.attribution}`)}
            tone={controls.meshBarrier ? "var(--teal)" : "var(--magenta)"}
            tinted={!controls.meshBarrier}
          />
          <VizReadout
            label={t("controlsLabel")}
            value={`${inPlace} / ${CONTROL_ORDER.length}`}
            tone="var(--cyan)"
            note={t("controlsNote")}
          />
        </div>
      </div>

      <ControlToggleGrid
        controls={controls}
        onToggle={(id) => setControls((s) => ({ ...s, [id]: !s[id] }))}
        name={(id) => t(`control.${id}.name`)}
        detail={(id) => t(`control.${id}.detail`)}
        onLabel={t("state.on")}
        offLabel={t("state.off")}
      />
    </VizFigure>
  );
}
