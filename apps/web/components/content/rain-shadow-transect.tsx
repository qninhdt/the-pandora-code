"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { RainShadowScene, SCENE_H, SCENE_W } from "./rain-shadow-scene";
import { PHYSICS, type World, runTransect } from "./rain-shadow-transect-model";

// Where a world keeps its dry country, once you know it is not a latitude band.
// The chapter has already widened Pandora's wet belt and exiled the subtropical
// deserts; this figure answers the question that leaves hanging — dryness on this
// moon has to be *made*, locally, by a mountain range standing across a sea wind.
// The reader raises the range and slides it poleward, and two things should land.
// First, that the lee is dry not because the ridge blocked the wind but because
// the air arrives on the far side hotter and thirstier than it left the sea.
// Second, that Pandora resists the whole trick: gentler gravity and heavy,
// heat-rich air make rising air cool so slowly that a ridge which turns an
// Earthly plain to desert leaves the Pandoran one merely grassy. Switch worlds at
// the same crest height and the same latitude to feel it. Maths lives in
// rain-shadow-transect-model.ts; the cross-section is drawn by rain-shadow-scene.tsx.

const DEFAULT_RIDGE = 2.6; // km — the crest height canon gives Mons Veritatis
// Poleward of the wet belt's rainy core but well inside the Pandoran cell: the
// setting that reproduces canon's semi-arid Upper Plains, and where the same
// ridge on Earth would already have made a desert.
const DEFAULT_LAT = 34;

const VERDICT_TONE = {
  wetBoth: "teal",
  gentle: "cyan",
  grassland: "amber",
  desert: "magenta",
} as const;

export function RainShadowTransect({
  caption,
  className,
}: { caption?: string; className?: string }) {
  const t = useTranslations("viz.rainShadowTransect");
  const uid = useId();
  const [world, setWorld] = useState<World>("pandora");
  const [ridgeKm, setRidgeKm] = useState(DEFAULT_RIDGE);
  const [lat, setLat] = useState(DEFAULT_LAT);

  const result = useMemo(() => runTransect(world, ridgeKm, lat), [world, ridgeKm, lat]);
  const otherWorld: World = world === "earth" ? "pandora" : "earth";
  const other = useMemo(() => runTransect(otherWorld, ridgeKm, lat), [otherWorld, ridgeKm, lat]);
  const tone = VERDICT_TONE[result.verdict];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      hint={t(`verdict.${result.verdict}`)}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle<World>
          ariaLabel={t("worldLabel")}
          value={world}
          onChange={setWorld}
          options={[
            { value: "earth", label: t("earth"), tone: "var(--muted)" },
            { value: "pandora", label: t("pandora"), tone: "var(--teal)" },
          ]}
        />
      }
    >
      <svg
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        className="w-full"
        role="img"
        aria-label={t("aria", {
          windward: Math.round(result.windwardCm),
          lee: Math.round(result.leeCm),
        })}
      >
        <RainShadowScene
          uid={uid}
          ridgeKm={ridgeKm}
          cloudBaseKm={result.cloudBaseKm}
          windwardCm={result.windwardCm}
          leeCm={result.leeCm}
          leeC={result.leeC}
          tone={tone}
          labels={{
            sea: t("sea"),
            windward: t("windward"),
            lee: t("lee"),
            crest: t("crest"),
            cloudBase: t("cloudBase"),
            wind: t("wind"),
            descent: t("descent"),
            rainUnit: t("rainUnit"),
          }}
        />
      </svg>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("supply")}
          value={`${Math.round(result.supplyCm)} ${t("rainUnit")}`}
          tone="var(--cyan)"
          note={t("supplyNote", { lat })}
        />
        <VizReadout
          label={t("leeRain")}
          value={`${Math.round(result.leeCm)} ${t("rainUnit")}`}
          tone={`var(--${tone})`}
          note={t("leeNote", { rh: Math.round(result.leeRh * 100) })}
          tinted
        />
        <VizReadout
          label={t("foehn")}
          value={`+${Math.max(0, result.leeC - result.coastC).toFixed(1)} °C`}
          tone="var(--amber)"
          note={t("foehnNote")}
        />
      </div>

      <div className="mt-3 space-y-3">
        <VizSlider
          label={t("ridgeLabel")}
          display={t("ridgeDisplay", { km: ridgeKm.toFixed(1) })}
          min={0.2}
          max={5}
          step={0.1}
          value={ridgeKm}
          onChange={setRidgeKm}
          tone="var(--muted)"
        />
        <VizSlider
          label={t("latLabel")}
          display={t("latDisplay", { lat })}
          min={0}
          max={70}
          step={1}
          value={lat}
          onChange={setLat}
          tone="var(--cyan)"
        />
      </div>

      <p className="mt-3 font-sans text-xs leading-relaxed text-muted">
        {t("crossCheck", {
          world: otherWorld === "earth" ? t("earth") : t("pandora"),
          lee: Math.round(other.leeCm),
          unit: t("rainUnit"),
          thisLapse: PHYSICS[world].dryLapse.toFixed(1),
          otherLapse: PHYSICS[otherWorld].dryLapse.toFixed(1),
        })}
      </p>
    </VizFigure>
  );
}
