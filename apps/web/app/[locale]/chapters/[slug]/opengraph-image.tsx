import { type Locale, isLocale } from "@/i18n/config";
import { getPublishedChapter } from "@/lib/content/loader/chapter-loader";
import { getOutlineWithStatus } from "@/lib/content/outline-status";
import { designTokens } from "@/lib/design-tokens";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The Pandora Code";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

// Pick a tier accent from the chapter's dominant classification, so the card's
// hue signals where the chapter sits between canon and real science.
function dominantAccent(chapter: NonNullable<ReturnType<typeof getPublishedChapter>>): string {
  const c = chapter.meta.classification;
  const entries: [keyof typeof designTokens.classification, number][] = [
    ["canon", c.canon_pct],
    ["inference", c.inference_pct],
    ["speculation", c.speculation_pct],
    ["real_science", c.real_science_pct],
  ];
  const top = entries.sort((a, b) => b[1] - a[1])[0][0];
  return designTokens.classification[top];
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const loc: Locale = isLocale(locale) ? locale : "en";
  const chapter = getPublishedChapter(slug, loc);
  if (!chapter) {
    return new Response(null, { status: 404 });
  }
  const part = getOutlineWithStatus(loc).find((p) => p.chapters.some((ch) => ch.slug === slug));
  return renderOgImage({
    kicker: part?.label[loc] ?? "The Pandora Code",
    title: chapter.title,
    accent: dominantAccent(chapter),
  });
}
