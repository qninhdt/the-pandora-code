"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type Hemisphere = "north" | "south";
type Wind = "equatorward" | "poleward";

interface CoastalUpwellingExplorerProps {
  caption?: string;
  className?: string;
}

export function CoastalUpwellingExplorer({ caption, className }: CoastalUpwellingExplorerProps) {
  const t = useTranslations("viz.coastalUpwellingExplorer");
  const uid = useId();
  const [hemisphere, setHemisphere] = useState<Hemisphere>("north");
  const [wind, setWind] = useState<Wind>("equatorward");
  const upwelling = wind === "equatorward";
  const windDown = hemisphere === "north" ? wind === "equatorward" : wind === "poleward";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(upwelling ? "hint.upwelling" : "hint.downwelling")}
      caption={caption}
      tone={upwelling ? "teal" : "amber"}
      className={className}
      controls={
        <SegmentedToggle
          options={[
            { value: "north", label: t("hemisphere.north"), tone: "var(--cyan)" },
            { value: "south", label: t("hemisphere.south"), tone: "var(--magenta)" },
          ]}
          value={hemisphere}
          onChange={setHemisphere}
          ariaLabel={t("hemisphereLabel")}
        />
      }
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(14rem,0.6fr)]">
        <svg
          viewBox="0 0 600 310"
          className="min-h-64 w-full rounded-xl border border-border/60 bg-void/50"
          role="img"
          aria-label={t("aria", { state: t(upwelling ? "state.upwelling" : "state.downwelling") })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />
          <defs>
            <linearGradient id={`${uid}-ocean`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--cyan)" stopOpacity="0.42" />
              <stop offset="1" stopColor="var(--abyss)" stopOpacity="0.96" />
            </linearGradient>
          </defs>
          <path d="M18 74 H456 C500 84 532 104 582 128 V292 H18Z" fill={`url(#${uid}-ocean)`} />
          <path d="M456 74 C499 84 534 105 582 128 V18 H456Z" fill="var(--muted)" opacity="0.62" />
          <path
            d="M456 74 C498 83 535 106 582 128"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="2"
            opacity="0.75"
          />

          <g
            stroke={upwelling ? "var(--teal)" : "var(--amber)"}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
          >
            <path
              d={upwelling ? "M428 76 C354 74 294 74 220 74" : "M218 74 C294 74 354 74 428 76"}
            />
            <path d={upwelling ? "M238 64 l-20 10 20 10" : "M408 66 l20 10-20 10"} />
          </g>
          <VizText x={265} y={58} size="small" tone={upwelling ? "var(--teal)" : "var(--amber)"}>
            {t("ekman")}
          </VizText>

          <g stroke="var(--foreground)" fill="none" strokeWidth="3" opacity="0.75">
            <path d={windDown ? "M505 38 v54" : "M505 91 V37"} />
            <path d={windDown ? "M498 80 l7 13 7-13" : "M498 50 l7-13 7 13"} />
          </g>
          <VizText x={523} y={62} size="small" tone="var(--foreground)">
            {t(`wind.${wind}`)}
          </VizText>

          {upwelling ? (
            <g>
              <path
                d="M390 272 C392 222 407 178 439 134 C450 119 454 98 454 80"
                fill="none"
                stroke="var(--teal)"
                strokeWidth="10"
                opacity="0.62"
                filter={glowUrl(uid, "bloom")}
              />
              <path d="M444 99 l10-21 10 21Z" fill="var(--teal)" />
              {[120, 146, 170, 198, 226].map((y, index) => (
                <circle
                  key={y}
                  cx={400 + index * 9}
                  cy={y}
                  r="3"
                  fill="var(--teal)"
                  opacity="0.85"
                />
              ))}
              <path
                d="M120 93 C184 79 249 101 322 88"
                fill="none"
                stroke="var(--teal)"
                strokeWidth="2"
                strokeDasharray="4 5"
              />
            </g>
          ) : (
            <g>
              <path
                d="M446 84 C447 134 427 177 397 218 C382 239 375 259 372 276"
                fill="none"
                stroke="var(--amber)"
                strokeWidth="10"
                opacity="0.56"
                filter={glowUrl(uid, "bloom")}
              />
              <path d="M361 256 l11 22 12-20Z" fill="var(--amber)" />
              <path
                d="M130 122 C215 135 310 112 425 126"
                fill="none"
                stroke="var(--magenta)"
                strokeWidth="2"
                strokeDasharray="4 5"
                opacity="0.6"
              />
            </g>
          )}

          <VizText x={42} y={286} size="small" tone="var(--muted)">
            {t("deepWater")}
          </VizText>
          <VizText x={473} y={151} size="small" tone="var(--muted)">
            {t("coast")}
          </VizText>
          <VizText x={80} y={105} size="small" tone={upwelling ? "var(--teal)" : "var(--magenta)"}>
            {t(upwelling ? "bloom" : "clearSurface")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-3">
          <SegmentedToggle
            options={[
              { value: "equatorward", label: t("wind.equatorward"), tone: "var(--teal)" },
              { value: "poleward", label: t("wind.poleward"), tone: "var(--amber)" },
            ]}
            value={wind}
            onChange={setWind}
            ariaLabel={t("windLabel")}
            className="self-start"
          />
          <VizReadout
            label={t("readout.transport")}
            value={t(upwelling ? "transport.offshore" : "transport.onshore")}
            tone={upwelling ? "var(--teal)" : "var(--amber)"}
          />
          <VizReadout
            label={t("readout.vertical")}
            value={t(upwelling ? "vertical.rising" : "vertical.sinking")}
            tone={upwelling ? "var(--cyan)" : "var(--magenta)"}
          />
          <VizReadout
            label={t("readout.result")}
            value={t(upwelling ? "state.upwelling" : "state.downwelling")}
            note={t(upwelling ? "result.productive" : "result.suppressed")}
            tone={upwelling ? "var(--teal)" : "var(--amber)"}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
