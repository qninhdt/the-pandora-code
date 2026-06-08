import { Timeline } from "@/components/content/timeline";
import { type Locale, isLocale } from "@/i18n/config";
import { listChapters } from "@/lib/content/loader/chapter-loader";
import { listParts } from "@/lib/content/loader/part-loader";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface TimelinePageProps {
  params: Promise<{ locale: string }>;
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const parts = listParts(locale as Locale);
  const chapters = listChapters(locale as Locale);

  const events = [
    ...parts.flatMap((p) => [
      {
        id: `part-${p.id}`,
        date: `Part ${p.order}`,
        title: p.title,
        description: p.description,
        kind: "canon" as const,
      },
      ...chapters
        .filter((c) => c.meta.part === p.id)
        .map((c) => ({
          id: `ch-${c.meta.slug}`,
          date: `${p.order}.${c.meta.order}`,
          title: c.title,
          description: c.subtitle ?? c.hook,
          kind: "inference" as const,
        })),
    ]),
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <header className="mb-12 max-w-3xl">
        <h1 className="font-display text-5xl font-800 leading-tight tracking-tight text-foreground">
          {t("page.timeline.title")}
        </h1>
        <p className="mt-4 font-serif text-lg text-muted">{t("page.timeline.subtitle")}</p>
      </header>
      {events.length === 0 ? (
        <p className="font-serif text-muted">{t("common.noResults")}</p>
      ) : (
        <Timeline events={events} />
      )}
    </main>
  );
}
