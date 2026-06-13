import { type Locale, isLocale } from "@/i18n/config";
import { getGlossaryTerm } from "@/lib/content/loader/glossary-loader";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og-image";
import { getTranslations } from "next-intl/server";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The Pandora Code";

interface Props {
  params: Promise<{ locale: string; term: string }>;
}

export default async function Image({ params }: Props) {
  const { locale, term } = await params;
  const loc: Locale = isLocale(locale) ? locale : "en";
  const entry = getGlossaryTerm(term, loc);
  const t = await getTranslations({ locale: loc });
  const kicker = t("nav.glossary");
  return renderOgImage({
    kicker: entry ? `${kicker} · ${entry.category}` : kicker,
    title: entry?.label ?? term,
  });
}
