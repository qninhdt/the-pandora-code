import { CanonBadge } from "@/components/classification/canon-badge";
import { ChapterHero } from "@/components/reading/chapter-hero";
import { ChapterShell } from "@/components/reading/chapter-shell";
import { ReadingProgress } from "@/components/reading/reading-progress";
import { TableOfContents, type TocHeading } from "@/components/reading/table-of-contents";
import { type Locale, isLocale } from "@/i18n/config";
import { getChapter, listChapterSlugs } from "@/lib/content/loader/chapter-loader";
import { getChapterMDX } from "@/lib/content/render/mdx-source";
import { getMDXComponents } from "@/lib/mdx-components";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface ChapterPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const slugs = listChapterSlugs();
  return ["vi", "en"].flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

// Map fumadocs TOC items to the reader's TocHeading shape (depth 2–3 only).
function toHeadings(toc: { depth: number; url: string; title: React.ReactNode }[]): TocHeading[] {
  return toc
    .filter((t) => t.depth === 2 || t.depth === 3)
    .map((t) => ({
      id: t.url.replace(/^#/, ""),
      text: typeof t.title === "string" ? t.title : "",
      depth: t.depth as 2 | 3,
    }));
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations({ locale });

  const chapter = getChapter(slug, loc);
  if (!chapter) notFound();

  const mdx = getChapterMDX(slug, loc);
  if (!mdx) notFound();
  const Body = mdx.data.body;
  const components = getMDXComponents();
  const headings = toHeadings(mdx.data.toc ?? []);
  const cls = chapter.meta.classification;

  return (
    <ChapterShell
      progress={<ReadingProgress />}
      hero={
        <ChapterHero
          locale={loc}
          title={chapter.meta.title}
          subtitle={chapter.meta.subtitle}
          hook={chapter.meta.hook}
          authors={chapter.meta.authors}
          readingTimeMin={chapter.meta.reading_time_min}
          classification={cls}
        />
      }
      toc={<TableOfContents headings={headings} label={t("chapter.tableOfContents")} />}
      footer={
        <div className="reading-column mt-16 border-t border-border pt-8">
          <p className="mb-3 font-sans text-xs uppercase tracking-wider text-subtle">
            {t("chapter.classification")}
          </p>
          <div className="flex flex-wrap gap-2">
            <CanonBadge kind="canon" locale={loc}>{`${cls.canon_pct}% canon`}</CanonBadge>
            <CanonBadge
              kind="inference"
              locale={loc}
            >{`${cls.inference_pct}% inference`}</CanonBadge>
            <CanonBadge
              kind="speculation"
              locale={loc}
            >{`${cls.speculation_pct}% speculation`}</CanonBadge>
            <CanonBadge
              kind="real_science"
              locale={loc}
            >{`${cls.real_science_pct}% real science`}</CanonBadge>
          </div>
        </div>
      }
    >
      <Body components={components} />
    </ChapterShell>
  );
}
