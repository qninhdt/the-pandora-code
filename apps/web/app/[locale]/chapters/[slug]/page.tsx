import { CanonBadge } from "@/components/classification/canon-badge";
import { AnatomyPlate } from "@/components/content/anatomy-plate";
import { ConfidenceMeter } from "@/components/content/confidence-meter";
import { Figure } from "@/components/content/figure";
import { FigureGrid } from "@/components/content/figure-grid";
import { GlossaryTerm } from "@/components/glossary/glossary-term";
import { ChapterBackground } from "@/components/reading/chapter-background";
import { ChapterHero } from "@/components/reading/chapter-hero";
import { ChapterShell } from "@/components/reading/chapter-shell";
import { ReadingProgress } from "@/components/reading/reading-progress";
import type { RelatedChapterCard } from "@/components/reading/related-chapters";
import { type RelatedGlossaryChip, RelatedMaterials } from "@/components/reading/related-materials";
import { TableOfContents, type TocHeading } from "@/components/reading/table-of-contents";
import { SourceList } from "@/components/sources/source-list";
import { type Locale, isLocale } from "@/i18n/config";
import { getChapterBackgroundImage } from "@/lib/content/loader/chapter-background";
import { getChapter, listChapterSlugs } from "@/lib/content/loader/chapter-loader";
import { getChapterCoverImage } from "@/lib/content/loader/cover-image";
import { getGlossaryCoverImage } from "@/lib/content/loader/glossary-cover";
import { listGlossaryTerms } from "@/lib/content/loader/glossary-loader";
import { getChapterMDX } from "@/lib/content/render/mdx-source";
import { getMDXComponents } from "@/lib/mdx-components";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ComponentProps, type ReactNode, isValidElement } from "react";

interface ChapterPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const slugs = listChapterSlugs();
  return ["vi", "en"].flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
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

function classificationLabel(
  kind: "canon" | "inference" | "speculation" | "real_science",
  locale: Locale,
) {
  const map = {
    canon: { vi: "Chính truyện", en: "Canon" },
    inference: { vi: "Suy luận", en: "Inference" },
    speculation: { vi: "Suy đoán", en: "Speculation" },
    real_science: { vi: "Khoa học thật", en: "Real science" },
  };
  return map[kind][locale];
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
  const coverImage = getChapterCoverImage(slug);
  const backgroundImage = getChapterBackgroundImage(slug);

  // Resolve glossary definitions server-side and key them by slug, so the MDX
  // only carries the slug - the locale-correct term + definition come from the
  // glossary YAML, never duplicated (and never wrong-language) in the prose.
  const glossary = new Map(listGlossaryTerms(loc).map((g) => [g.id, g]));
  const components = getMDXComponents({
    AnatomyPlate: (props: ComponentProps<typeof AnatomyPlate>) => (
      <AnatomyPlate {...props} locale={loc} />
    ),
    CanonBadge: (props: ComponentProps<typeof CanonBadge>) => (
      <CanonBadge {...props} locale={loc} />
    ),
    ConfidenceMeter: (props: ComponentProps<typeof ConfidenceMeter>) => (
      <ConfidenceMeter {...props} locale={loc} />
    ),
    Figure: (props: ComponentProps<typeof Figure>) => <Figure {...props} locale={loc} />,
    FigureGrid: (props: ComponentProps<typeof FigureGrid>) => (
      <FigureGrid {...props} locale={loc} />
    ),
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
          locale={loc}
        >
          {children}
        </GlossaryTerm>
      );
    },
    SourceList: (props: ComponentProps<typeof SourceList>) => (
      <SourceList {...props} locale={loc} />
    ),
  });
  const headings = toHeadings(mdx.data.toc ?? []);
  const cls = chapter.meta.classification;

  // Resolve "related materials" server-side from meta.yaml: cross-linked
  // chapters (skipping any slug that has no published locale file), the
  // glossary terms this chapter leans on, and its sources.
  const relatedChapters: RelatedChapterCard[] = chapter.meta.related_chapters
    .map((relSlug) => getChapter(relSlug, loc))
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .map((c) => ({
      slug: c.meta.slug,
      title: c.meta.title,
      hook: c.meta.hook,
      reading_time_min: c.meta.reading_time_min,
    }));
  const relatedGlossary: RelatedGlossaryChip[] = chapter.meta.glossary_terms
    .map((id) => glossary.get(id))
    .filter((g): g is NonNullable<typeof g> => g !== undefined)
    .map((g) => ({ id: g.id, label: g.label }));

  return (
    <>
      {backgroundImage && <ChapterBackground src={backgroundImage} />}
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
            imageSrc={coverImage}
          />
        }
        toc={<TableOfContents headings={headings} label={t("chapter.tableOfContents")} />}
        footer={
          <>
            <RelatedMaterials
              locale={loc}
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
                <CanonBadge kind="canon" locale={loc}>
                  {`${classificationLabel("canon", loc)} ${cls.canon_pct}%`}
                </CanonBadge>
                <CanonBadge
                  kind="inference"
                  locale={loc}
                >{`${classificationLabel("inference", loc)} ${cls.inference_pct}%`}</CanonBadge>
                <CanonBadge
                  kind="speculation"
                  locale={loc}
                >{`${classificationLabel("speculation", loc)} ${cls.speculation_pct}%`}</CanonBadge>
                <CanonBadge
                  kind="real_science"
                  locale={loc}
                >{`${classificationLabel("real_science", loc)} ${cls.real_science_pct}%`}</CanonBadge>
              </div>
            </div>
          </>
        }
      >
        <Body components={components} />
      </ChapterShell>
    </>
  );
}
