import type { Locale } from "./config";

import enCommon from "../messages/en/common.json";
import enAirsea from "../messages/en/viz-airsea.json";
import enAnatomy from "../messages/en/viz-anatomy.json";
import enAstronomy from "../messages/en/viz-astronomy.json";
import enAtmosphere from "../messages/en/viz-atmosphere.json";
import enBio from "../messages/en/viz-bio.json";
import enBiochemistry from "../messages/en/viz-biochemistry.json";
import enBioeconomics from "../messages/en/viz-bioeconomics.json";
import enBiogeochem from "../messages/en/viz-biogeochem.json";
import enBiomechanics from "../messages/en/viz-biomechanics.json";
import enCanon from "../messages/en/viz-canon.json";
import enChrono from "../messages/en/viz-chrono.json";
import enChronostrat from "../messages/en/viz-chronostrat.json";
import enCulture from "../messages/en/viz-culture.json";
import enDevbio from "../messages/en/viz-devbio.json";
import enEcology from "../messages/en/viz-ecology.json";
import enEpistemics from "../messages/en/viz-epistemics.json";
import enEvolution from "../messages/en/viz-evolution.json";
import enForestfloor from "../messages/en/viz-forestfloor.json";
import enGeochronology from "../messages/en/viz-geochronology.json";
import enGeodynamics from "../messages/en/viz-geodynamics.json";
import enHydrology from "../messages/en/viz-hydrology.json";
import enMarine from "../messages/en/viz-marine.json";
import enMaterials from "../messages/en/viz-materials.json";
import enMind from "../messages/en/viz-mind.json";
import enMycorrhiza from "../messages/en/viz-mycorrhiza.json";
import enNetwork from "../messages/en/viz-network.json";
import enOcean from "../messages/en/viz-ocean.json";
import enPhysics from "../messages/en/viz-physics.json";
import enPhysiology from "../messages/en/viz-physiology.json";
import enPlanetary from "../messages/en/viz-planetary.json";
import enPlant from "../messages/en/viz-plant.json";
import enSystematics from "../messages/en/viz-systematics.json";
import enTaphonomy from "../messages/en/viz-taphonomy.json";
import enTime from "../messages/en/viz-time.json";
import enWrappers from "../messages/en/viz-wrappers.json";
import enXenobotany from "../messages/en/viz-xenobotany.json";

import viCommon from "../messages/vi/common.json";
import viAirsea from "../messages/vi/viz-airsea.json";
import viAnatomy from "../messages/vi/viz-anatomy.json";
import viAstronomy from "../messages/vi/viz-astronomy.json";
import viAtmosphere from "../messages/vi/viz-atmosphere.json";
import viBio from "../messages/vi/viz-bio.json";
import viBiochemistry from "../messages/vi/viz-biochemistry.json";
import viBioeconomics from "../messages/vi/viz-bioeconomics.json";
import viBiogeochem from "../messages/vi/viz-biogeochem.json";
import viBiomechanics from "../messages/vi/viz-biomechanics.json";
import viCanon from "../messages/vi/viz-canon.json";
import viChrono from "../messages/vi/viz-chrono.json";
import viChronostrat from "../messages/vi/viz-chronostrat.json";
import viCulture from "../messages/vi/viz-culture.json";
import viDevbio from "../messages/vi/viz-devbio.json";
import viEcology from "../messages/vi/viz-ecology.json";
import viEpistemics from "../messages/vi/viz-epistemics.json";
import viEvolution from "../messages/vi/viz-evolution.json";
import viForestfloor from "../messages/vi/viz-forestfloor.json";
import viGeochronology from "../messages/vi/viz-geochronology.json";
import viGeodynamics from "../messages/vi/viz-geodynamics.json";
import viHydrology from "../messages/vi/viz-hydrology.json";
import viMarine from "../messages/vi/viz-marine.json";
import viMaterials from "../messages/vi/viz-materials.json";
import viMind from "../messages/vi/viz-mind.json";
import viMycorrhiza from "../messages/vi/viz-mycorrhiza.json";
import viNetwork from "../messages/vi/viz-network.json";
import viOcean from "../messages/vi/viz-ocean.json";
import viPhysics from "../messages/vi/viz-physics.json";
import viPhysiology from "../messages/vi/viz-physiology.json";
import viPlanetary from "../messages/vi/viz-planetary.json";
import viPlant from "../messages/vi/viz-plant.json";
import viSystematics from "../messages/vi/viz-systematics.json";
import viTaphonomy from "../messages/vi/viz-taphonomy.json";
import viTime from "../messages/vi/viz-time.json";
import viWrappers from "../messages/vi/viz-wrappers.json";
import viXenobotany from "../messages/vi/viz-xenobotany.json";

type Json = Record<string, unknown>;

function deepMerge(target: Json, source: Json): Json {
  for (const [key, value] of Object.entries(source)) {
    const existing = target[key];
    if (
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing) &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      target[key] = deepMerge({ ...(existing as Json) }, value as Json);
    } else {
      target[key] = value;
    }
  }
  return target;
}

const EN_PARTS = [
  enCommon,
  enPhysics,
  enPlanetary,
  enBio,
  enEvolution,
  enTime,
  enWrappers,
  enAstronomy,
  enGeochronology,
  enAtmosphere,
  enSystematics,
  enBiomechanics,
  enEcology,
  enPlant,
  enNetwork,
  enMind,
  enCanon,
  enChrono,
  enOcean,
  enCulture,
  enDevbio,
  enBioeconomics,
  enAirsea,
  enAnatomy,
  enBiochemistry,
  enChronostrat,
  enEpistemics,
  enForestfloor,
  enGeodynamics,
  enHydrology,
  enMarine,
  enMycorrhiza,
  enBiogeochem,
  enMaterials,
  enTaphonomy,
  enXenobotany,
  enPhysiology,
] as const;

const VI_PARTS = [
  viCommon,
  viPhysics,
  viPlanetary,
  viBio,
  viEvolution,
  viTime,
  viWrappers,
  viAstronomy,
  viGeochronology,
  viAtmosphere,
  viSystematics,
  viBiomechanics,
  viEcology,
  viPlant,
  viNetwork,
  viMind,
  viCanon,
  viChrono,
  viOcean,
  viCulture,
  viDevbio,
  viBioeconomics,
  viAirsea,
  viAnatomy,
  viBiochemistry,
  viChronostrat,
  viEpistemics,
  viForestfloor,
  viGeodynamics,
  viHydrology,
  viMarine,
  viMycorrhiza,
  viBiogeochem,
  viMaterials,
  viTaphonomy,
  viXenobotany,
  viPhysiology,
] as const;

const MESSAGES: Record<Locale, Json> = {
  en: EN_PARTS.reduce<Json>((acc, part) => deepMerge(acc, part as Json), {}),
  vi: VI_PARTS.reduce<Json>((acc, part) => deepMerge(acc, part as Json), {}),
};

export function getMessages(locale: Locale): Json {
  return MESSAGES[locale];
}
