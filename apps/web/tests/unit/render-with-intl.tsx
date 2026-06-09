import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";

import enCommon from "@/messages/en/common.json";
import enBio from "@/messages/en/viz-bio.json";
import enEvolution from "@/messages/en/viz-evolution.json";
import enPhysics from "@/messages/en/viz-physics.json";
import enPlanetary from "@/messages/en/viz-planetary.json";
import enTime from "@/messages/en/viz-time.json";
import enWrappers from "@/messages/en/viz-wrappers.json";

import viCommon from "@/messages/vi/common.json";
import viBio from "@/messages/vi/viz-bio.json";
import viEvolution from "@/messages/vi/viz-evolution.json";
import viPhysics from "@/messages/vi/viz-physics.json";
import viPlanetary from "@/messages/vi/viz-planetary.json";
import viTime from "@/messages/vi/viz-time.json";
import viWrappers from "@/messages/vi/viz-wrappers.json";

type Json = Record<string, unknown>;

// Mirror of i18n/request.ts deepMerge so tests resolve the same combined tree
// the app sees (viz.* sub-keys merge across namespace files).
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

const MESSAGES: Record<"en" | "vi", Json> = {
  en: [enCommon, enPhysics, enPlanetary, enBio, enEvolution, enTime, enWrappers].reduce<Json>(
    (acc, part) => deepMerge(acc, part as Json),
    {},
  ),
  vi: [viCommon, viPhysics, viPlanetary, viBio, viEvolution, viTime, viWrappers].reduce<Json>(
    (acc, part) => deepMerge(acc, part as Json),
    {},
  ),
};

// Render a component inside the real merged message catalog for a locale, so
// useTranslations() resolves exactly as it does in the app. Replaces the old
// `locale` prop the viz components no longer accept.
export function renderWithIntl(ui: ReactElement, locale: "en" | "vi" = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      {ui}
    </NextIntlClientProvider>,
  );
}
