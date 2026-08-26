import { TimelineJourney } from "@/components/content/timeline-journey";
import { PageBackground } from "@/components/layout/page-background";
import { JsonLd } from "@/components/seo/json-ld";
import { type Locale, isLocale } from "@/i18n/config";
import { listPublishedChapters } from "@/lib/content/loader/chapter-loader";
import { getPageBackground } from "@/lib/content/loader/page-background";
import { listParts } from "@/lib/content/loader/part-loader";
import { OUTLINE, chapterPosition, partNumberLabel } from "@/lib/content/outline";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { createBreadcrumbListSchema } from "@/lib/seo/structured-data";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface TimelinePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TimelinePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/timeline",
    title: t("page.timeline.title"),
    description: t("page.timeline.subtitle"),
  });
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const loc = locale as Locale;

  const parts = listParts(loc);
  const chapters = listPublishedChapters(loc);
  const bg = getPageBackground("timeline");

  // OUTLINE is the single source of book order; parts/*.yaml only supplies prose
  // (title, description) for a part that has been authored.
  const partMeta = new Map(parts.map((p) => [p.id, p]));
  const bySlug = new Map(chapters.map((c) => [c.meta.slug, c]));

  const events = OUTLINE.flatMap((part) => {
    const meta = partMeta.get(part.id);
    const partChapters = part.chapters
      .map((ch) => bySlug.get(ch.slug))
      .filter((c): c is NonNullable<typeof c> => c !== undefined);
    if (!meta && partChapters.length === 0) return [];
    const roman = partNumberLabel(part.id);
    return [
      {
        id: `part-${part.id}`,
        date: roman ? `Part ${roman}` : part.label[loc],
        title: meta?.title ?? part.label[loc],
        description: meta?.description,
        kind: "canon" as const,
      },
      ...partChapters.map((c) => ({
        id: `ch-${c.meta.slug}`,
        date: chapterPosition(c.meta.slug)?.label ?? "",
        title: c.title,
        description: c.subtitle ?? c.hook,
        kind: "inference" as const,
      })),
    ];
  });

  return (
    <>
      <JsonLd
        data={createBreadcrumbListSchema([
          { name: t("nav.home"), item: `/${loc}` },
          { name: t("page.timeline.title"), item: `/${loc}/timeline` },
        ])}
      />
      {bg && <PageBackground src={bg} />}
      <main className="mx-auto max-w-5xl px-6 pb-28 pt-32">
        <header className="mb-14 max-w-3xl">
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-cyan">
            {t("page.timeline.kicker")}
          </p>
          <h1 className="font-display text-4xl font-700 tracking-tight text-foreground sm:text-5xl">
            {t("page.timeline.title")}
          </h1>
          <p className="mt-3 max-w-2xl font-serif text-base leading-relaxed text-muted">
            {t("page.timeline.subtitle")}
          </p>
        </header>

        {events.length === 0 ? (
          <p className="font-serif text-muted">{t("common.noResults")}</p>
        ) : (
          <TimelineJourney events={events} />
        )}
      </main>
    </>
  );
}
