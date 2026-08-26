import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Namespace files merged into one message tree per locale. `common` carries all
// site/UI chrome; each `viz-*` file owns one batch of interactive-figure labels
// under a shared top-level `viz` key, so they deep-merge into `viz.<component>`.
// Splitting by namespace lets parallel work touch different files without
// colliding on one giant catalog.
const NAMESPACES = [
  "common",
  "viz-physics",
  "viz-planetary",
  "viz-bio",
  "viz-evolution",
  "viz-time",
  "viz-wrappers",
  "viz-astronomy",
  "viz-geochronology",
  "viz-atmosphere",
  "viz-systematics",
  "viz-biomechanics",
  "viz-ecology",
  "viz-plant",
  "viz-network",
  "viz-mind",
  "viz-canon",
  "viz-chrono",
  "viz-ocean",
  "viz-culture",
  "viz-devbio",
  "viz-bioeconomics",
] as const;

type Json = Record<string, unknown>;

// Recursively merge plain objects; later sources win on scalar conflicts. Only
// needed because several files contribute keys under the same `viz` root.
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

async function loadMessages(locale: string): Promise<Json> {
  const parts = await Promise.all(
    NAMESPACES.map(async (ns) => {
      const mod = await import(`../messages/${locale}/${ns}.json`);
      return mod.default as Json;
    }),
  );
  return parts.reduce<Json>((acc, part) => deepMerge(acc, part), {});
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
