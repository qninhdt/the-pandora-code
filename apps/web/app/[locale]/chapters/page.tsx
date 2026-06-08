import { CodexCell } from "@/components/codex/codex-cell";
import { CodexGrid } from "@/components/codex/codex-grid";
import { GlassPanel } from "@/components/codex/glass-panel";
import { SpecimenPlate } from "@/components/codex/specimen-plate";
import { PageBackground } from "@/components/layout/page-background";
import { type Locale, isLocale } from "@/i18n/config";
import { listPublishedChapters } from "@/lib/content/loader/chapter-loader";
import { getChapterCoverImage } from "@/lib/content/loader/cover-image";
import { getPageBackground } from "@/lib/content/loader/page-background";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface ChaptersIndexProps {
  params: Promise<{ locale: string }>;
}

export default async function ChaptersIndex({ params }: ChaptersIndexProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations({ locale });
  const chapters = listPublishedChapters(loc);
  const bg = getPageBackground("chapters");

  return (
    <>
      {bg && <PageBackground src={bg} />}
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-32">
        <header className="mb-12 max-w-3xl">
          <h1 className="font-display text-5xl font-800 leading-tight tracking-tight text-foreground">
            {t("page.chapters.title")}
          </h1>
          <p className="mt-4 font-serif text-lg text-muted">{t("page.chapters.subtitle")}</p>
        </header>

        {chapters.length === 0 ? (
          <GlassPanel depth={2} className="grid min-h-48 place-items-center p-10 text-center">
            <p className="font-serif text-lg text-muted">{t("common.noResults")}</p>
          </GlassPanel>
        ) : (
          <CodexGrid variant="mosaic">
            {chapters.map((c, i) => (
              <CodexCell key={c.meta.slug} span={i % 3 === 0 ? 4 : 2} rowSpan={i % 3 === 0 ? 2 : 1}>
                <SpecimenPlate
                  href={`/${loc}/chapters/${c.meta.slug}`}
                  title={c.title}
                  subtitle={c.subtitle}
                  imageSrc={getChapterCoverImage(c.meta.slug)}
                  plateNo={String(i + 1).padStart(2, "0")}
                  tier="canon"
                  tierLabel={`${c.meta.reading_time_min} ${loc === "vi" ? "phút" : "min"}`}
                  locale={loc}
                />
              </CodexCell>
            ))}
          </CodexGrid>
        )}
      </main>
    </>
  );
}
