import { CanonBadge } from "@/components/classification/canon-badge";
import { AnatomyPlate } from "@/components/content/anatomy-plate";
import { DiagramFigure } from "@/components/content/diagram-figure";
import { Figure } from "@/components/content/figure";
import { FigureGrid } from "@/components/content/figure-grid";
import { GlossaryTerm } from "@/components/glossary/glossary-term";
import { ChapterBackground } from "@/components/reading/chapter-background";
import { ChapterHero } from "@/components/reading/chapter-hero";
import { ChapterShell } from "@/components/reading/chapter-shell";
import { ContinueReadingPrompt } from "@/components/reading/continue-reading-prompt";
import { OfflineChapterButton } from "@/components/reading/offline-chapter-button";
import { ReadingPreferences } from "@/components/reading/reading-preferences";
import { ReadingProgress } from "@/components/reading/reading-progress";
import type { RelatedChapterCard } from "@/components/reading/related-chapters";
import { type RelatedGlossaryChip, RelatedMaterials } from "@/components/reading/related-materials";
import { TableOfContents, type TocHeading } from "@/components/reading/table-of-contents";
import { JsonLd } from "@/components/seo/json-ld";
import { SourceList } from "@/components/sources/source-list";
import { type Locale, isLocale, locales } from "@/i18n/config";
import { getChapterBackgroundImage } from "@/lib/content/loader/chapter-background";
import { getPublishedChapter, listPublishedChapters } from "@/lib/content/loader/chapter-loader";
import { getChapterCoverImage } from "@/lib/content/loader/cover-image";
import { getGlossaryCoverImage } from "@/lib/content/loader/glossary-cover";
import { listGlossaryTerms } from "@/lib/content/loader/glossary-loader";
import { getChapterMDX } from "@/lib/content/render/mdx-source";
import { getMDXComponents } from "@/lib/mdx-components";
import { buildPageMetadata, clampDescription } from "@/lib/seo/page-metadata";
import { createArticleSchema, createBreadcrumbListSchema } from "@/lib/seo/structured-data";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ComponentProps, type ReactNode, isValidElement } from "react";

interface ChapterPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Chapter documents are public, filesystem-backed book content. Render them
// as static artifacts so the offline engine can safely cache the hard HTML
// navigation without storing personalized/no-store responses.
export const dynamic = "force-static";
export const revalidate = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    listPublishedChapters(locale).map((chapter) => ({ locale, slug: chapter.meta.slug })),
  );
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const loc = locale as Locale;
  const chapter = getPublishedChapter(slug, loc);
  if (!chapter) return {};
  // hreflang only for locales whose MDX actually exists.
  const available = locales.filter((l) => getPublishedChapter(slug, l) !== null);
  const cover = getChapterCoverImage(slug);
  return buildPageMetadata({
    locale: loc,
    path: `/chapters/${slug}`,
    title: chapter.title,
    description: clampDescription(chapter.hook),
    availableLocales: available,
    ogImage: cover,
    pageType: "article",
  });
}

// Map fumadocs TOC items to the reader's TocHeading shape (depth 2–3 only).
function flattenNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenNodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return flattenNodeText(node.props.children);
  }
  return "";
}

function toHeadings(toc: { depth: number; url: string; title: ReactNode }[]): TocHeading[] {
  return toc
    .filter((t) => t.depth === 2 || t.depth === 3)
    .map((t) => ({
      id: t.url.replace(/^#/, ""),
      text: flattenNodeText(t.title),
      depth: t.depth as 2 | 3,
    }));
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations({ locale });

  const chapter = getPublishedChapter(slug, loc);
  if (!chapter) notFound();

  const mdx = getChapterMDX(slug, loc);
  if (!mdx) notFound();
  const Body = mdx.data.body;
  const coverImage = getChapterCoverImage(slug);
  const backgroundImage = getChapterBackgroundImage(slug);

  // Resolve glossary definitions server-side and key them by slug, so the MDX
  // only carries the slug - the locale-correct term + definition come from the
  // glossary YAML, never duplicated (and never wrong-language) in the prose.
  const glossary = new Map(listGlossaryTerms(loc).map((g) => [g.id, g]));
  const components = getMDXComponents({
    AnatomyPlate: (props: ComponentProps<typeof AnatomyPlate>) => <AnatomyPlate {...props} />,
    CanonBadge: (props: ComponentProps<typeof CanonBadge>) => <CanonBadge {...props} />,
    DiagramFigure: (props: ComponentProps<typeof DiagramFigure>) => <DiagramFigure {...props} />,
    Figure: (props: ComponentProps<typeof Figure>) => <Figure {...props} />,
    FigureGrid: (props: ComponentProps<typeof FigureGrid>) => <FigureGrid {...props} />,
    GlossaryTerm: ({
      slug: termSlug,
      children,
    }: {
      slug: string;
      children?: ReactNode;
    }) => {
      const g = glossary.get(termSlug);
      return (
        <GlossaryTerm
          slug={termSlug}
          term={g?.label}
          definition={g?.definition}
          coverSrc={getGlossaryCoverImage(termSlug)}
          tags={g?.tags}
        >
          {children}
        </GlossaryTerm>
      );
    },
    SourceList: (props: ComponentProps<typeof SourceList>) => <SourceList {...props} />,
  });
  const headings = toHeadings(mdx.data.toc ?? []);
  const cls = chapter.meta.classification;

  // Resolve "related materials" server-side from meta.yaml: cross-linked
  // chapters (skipping any slug that has no published locale file), the
  // glossary terms this chapter leans on, and its sources.
  const relatedChapters: RelatedChapterCard[] = chapter.meta.related_chapters
    .map((relSlug) => getPublishedChapter(relSlug, loc))
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .map((c) => ({
      slug: c.meta.slug,
      title: c.meta.title,
      hook: c.meta.hook,
      readingTimeMin: c.readingTimeMin,
    }));
  const relatedGlossary: RelatedGlossaryChip[] = chapter.meta.glossary_terms
    .map((id) => glossary.get(id))
    .filter((g): g is NonNullable<typeof g> => g !== undefined)
    .map((g) => ({ id: g.id, label: g.label }));

  const canonicalPath = `/${loc}/chapters/${slug}`;
  const articleSchema = createArticleSchema({
    url: canonicalPath,
    headline: chapter.title,
    description: clampDescription(chapter.hook),
    image: coverImage ?? undefined,
    author: chapter.meta.authors.map((author) => ({ name: author })),
  });
  const breadcrumbSchema = createBreadcrumbListSchema([
    { name: t("nav.home"), item: `/${loc}` },
    { name: t("nav.chapters"), item: `/${loc}/chapters` },
    { name: chapter.title, item: canonicalPath },
  ]);

  return (
    <div className="relative">
      <JsonLd data={[articleSchema, breadcrumbSchema]} />
      {backgroundImage && <ChapterBackground src={backgroundImage} />}
      <ChapterShell
        progress={<ReadingProgress locale={loc} slug={slug} />}
        hero={
          <ChapterHero
            title={chapter.meta.title}
            subtitle={chapter.meta.subtitle}
            hook={chapter.meta.hook}
            authors={chapter.meta.authors}
            readingTimeMin={chapter.readingTimeMin}
            classification={cls}
            imageSrc={coverImage}
            actions={<OfflineChapterButton locale={loc} slug={slug} />}
          />
        }
        toc={<TableOfContents headings={headings} label={t("chapter.tableOfContents")} />}
        footer={
          <>
            <div className="reading-column mb-10 space-y-5">
              <ReadingPreferences title={t("chapter.readingPreferences")} compact />
            </div>
            <RelatedMaterials
              chapters={relatedChapters}
              glossary={relatedGlossary}
              sources={chapter.meta.sources}
              labels={{
                section: t("chapter.relatedMaterials"),
                relatedChapters: t("chapter.relatedChapters"),
                glossary: t("chapter.relatedGlossary"),
                sources: t("chapter.sources"),
              }}
            />
            <div className="reading-column mt-16 border-t border-border pt-8">
              <p className="mb-3 font-sans text-xs uppercase tracking-wider text-subtle">
                {t("chapter.classification")}
              </p>
              <div className="flex flex-wrap gap-2">
                <CanonBadge kind="canon">
                  {`${t("classification.canon")} ${cls.canon_pct}%`}
                </CanonBadge>
                <CanonBadge kind="inference">
                  {`${t("classification.inference")} ${cls.inference_pct}%`}
                </CanonBadge>
                <CanonBadge kind="speculation">
                  {`${t("classification.speculation")} ${cls.speculation_pct}%`}
                </CanonBadge>
                <CanonBadge kind="real_science">
                  {`${t("classification.real_science")} ${cls.real_science_pct}%`}
                </CanonBadge>
              </div>
            </div>
          </>
        }
      >
        <ContinueReadingPrompt
          locale={loc}
          slug={slug}
          label={t("chapter.continueReading")}
          busyLabel={t("chapter.restoringPosition")}
          progressLabel={t("chapter.readingProgressPercent", { percent: "__PERCENT__" })}
          className="mb-8"
        />
        <Body components={components} />
      </ChapterShell>
    </div>
  );
}
