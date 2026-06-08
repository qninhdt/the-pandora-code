import { TimelineJourney } from "@/components/content/timeline-journey";
import { PageBackground } from "@/components/layout/page-background";
import { type Locale, isLocale } from "@/i18n/config";
import { listChapters } from "@/lib/content/loader/chapter-loader";
import { getPageBackground } from "@/lib/content/loader/page-background";
import { listParts } from "@/lib/content/loader/part-loader";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface TimelinePageProps {
  params: Promise<{ locale: string }>;
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
  const chapters = listChapters(loc);
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
    const order = meta?.order ?? i + 1;
    const partChapters = chapters.filter((c) => c.meta.part === partId);
    if (!meta && partChapters.length === 0) return [];
    return [
      {
        id: `part-${partId}`,
        date: `Part ${order}`,
        title: meta?.title ?? humanize(partId),
        description: meta?.description,
        kind: "canon" as const,
      },
      ...partChapters.map((c) => ({
        id: `ch-${c.meta.slug}`,
        date: `${order}.${c.meta.order}`,
        title: c.title,
        description: c.subtitle ?? c.hook,
        kind: "inference" as const,
      })),
    ];
  });

  return (
    <>
      {bg && <PageBackground src={bg} />}
      <main className="mx-auto max-w-5xl px-6 pb-28 pt-32">
        <header className="mb-14 max-w-3xl">
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-cyan">
            {t("page.timeline.kicker")}
          </p>
          <h1 className="font-display text-5xl font-800 leading-[1.02] tracking-tight text-foreground sm:text-6xl">
            {t("page.timeline.title")}
          </h1>
          <p className="mt-5 font-serif text-lg leading-relaxed text-muted sm:text-xl">
            {t("page.timeline.subtitle")}
          </p>
        </header>

        {events.length === 0 ? (
          <p className="font-serif text-muted">{t("common.noResults")}</p>
        ) : (
          <TimelineJourney events={events} locale={loc} />
        )}
      </main>
    </>
  );
}
