import { TimelineJourney } from "@/components/content/timeline-journey";
import { PageBackground } from "@/components/layout/page-background";
import { JsonLd } from "@/components/seo/json-ld";
import { type Locale, isLocale } from "@/i18n/config";
import { chapterOrderPrefix } from "@/lib/content/loader/chapter-index";
import { listPublishedChapters } from "@/lib/content/loader/chapter-loader";
import { getPageBackground } from "@/lib/content/loader/page-background";
import { listParts } from "@/lib/content/loader/part-loader";
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

// "first-light" → "First Light", so part sections still read nicely even when a
// part has no metadata file yet and we only know its id from the chapters.
function humanize(id: string): string {
  return id
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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

  // Build the reading order from the Parts when they exist, but always fall
  // back to the part ids referenced by the chapters themselves — otherwise the
  // timeline is empty whenever the parts/ directory hasn't been authored yet.
  const partMeta = new Map(parts.map((p) => [p.id, p]));
  const sectionIds: string[] = parts.map((p) => p.id);
  for (const c of chapters) {
    if (!sectionIds.includes(c.meta.part)) sectionIds.push(c.meta.part);
  }

  const events = sectionIds.flatMap((partId, i) => {
    const meta = partMeta.get(partId);
    const partChapters = chapters.filter((c) => c.meta.part === partId);
    if (!meta && partChapters.length === 0) return [];
    // Part/chapter numbers come from the on-disk "N-M-" folder prefix (book
    // order), since meta.order is unreliable. Fall back to part metadata or
    // encounter index only when no chapter prefix is available.
    const partNo =
      chapterOrderPrefix(partChapters[0]?.meta.slug ?? "")?.part ?? meta?.order ?? i + 1;
    return [
      {
        id: `part-${partId}`,
        date: `Part ${partNo}`,
        title: meta?.title ?? humanize(partId),
        description: meta?.description,
        kind: "canon" as const,
      },
      ...partChapters.map((c, j) => {
        const prefix = chapterOrderPrefix(c.meta.slug);
        return {
          id: `ch-${c.meta.slug}`,
          date: `${prefix?.part ?? partNo}.${prefix?.order ?? j + 1}`,
          title: c.title,
          description: c.subtitle ?? c.hook,
          kind: "inference" as const,
        };
      }),
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
