import { ChaptersLibrary } from "@/components/chapters/chapters-library";
import {
  ContinueReadingCard,
  type ContinueReadingItem,
} from "@/components/reading/continue-reading-card";
import { JsonLd } from "@/components/seo/json-ld";
import { type Locale, isLocale } from "@/i18n/config";
import { listPublishedChapters } from "@/lib/content/loader/chapter-loader";
import { getChapterCoverImage } from "@/lib/content/loader/cover-image";
import { getOutlineWithStatus } from "@/lib/content/outline";
import type { ChapterMeta } from "@/lib/content/schemas/chapter-meta";
import type { ClassificationKind } from "@/lib/content/schemas/shared";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { createBreadcrumbListSchema } from "@/lib/seo/structured-data";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface ChaptersPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ChaptersPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/chapters",
    title: t("page.chapters.title"),
    description: t("page.chapters.subtitle"),
  });
}

// Pick the dominant epistemic tier from the classification percentages, so each
// chapter row can carry one badge that signals what kind of reading it is.
function dominantTier(meta: ChapterMeta): ClassificationKind {
  const c = meta.classification;
  const entries: [ClassificationKind, number][] = [
    ["canon", c.canon_pct],
    ["inference", c.inference_pct],
    ["speculation", c.speculation_pct],
    ["real_science", c.real_science_pct],
  ];
  return entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];
}

export default async function ChaptersPage({ params }: ChaptersPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);
  const t = await getTranslations({ locale });

  // Canonical book order + plate numbers + published status come from the
  // outline; reading time + classification come from the published meta.
  const chapterBySlug = new Map(listPublishedChapters(loc).map((c) => [c.meta.slug, c]));

  let done = 0;
  let total = 0;
  let totalReadingMin = 0;

  const parts = getOutlineWithStatus(loc).map((part) => ({
    id: part.id,
    label: part.label[loc],
    chapters: part.chapters.map((ch) => {
      total += 1;
      const chapter = chapterBySlug.get(ch.slug);
      const meta = chapter?.meta;
      if (ch.published) done += 1;
      if (chapter) totalReadingMin += chapter.readingTimeMin;
      return {
        slug: ch.slug,
        href: `/${loc}/chapters/${ch.slug}`,
        locale: loc,
        title: ch.title[loc],
        payload: ch.payload[loc],
        plateNo: ch.plateNo,
        published: ch.published,
        coverSrc: ch.published ? (getChapterCoverImage(ch.slug) ?? null) : null,
        readingMin: chapter?.readingTimeMin ?? null,
        tier: meta ? dominantTier(meta) : null,
      };
    }),
  }));
  const continueItems: ContinueReadingItem[] = parts
    .flatMap((part) => part.chapters)
    .filter((chapter) => chapter.published)
    .map((chapter) => ({
      locale: loc,
      slug: chapter.slug,
      title: chapter.title,
      href: chapter.href,
    }));

  return (
    <>
      <JsonLd
        data={createBreadcrumbListSchema([
          { name: t("nav.home"), item: `/${loc}` },
          { name: t("nav.chapters"), item: `/${loc}/chapters` },
        ])}
      />
      <div className="pt-24">
        <ContinueReadingCard items={continueItems} label={t("chapter.continueReading")} />
      </div>
      <ChaptersLibrary
        title={t("page.chapters.title")}
        subtitle={t("page.chapters.subtitle")}
        parts={parts}
        totals={{ done, total, totalReadingMin }}
        labels={{
          search: t("page.chapters.searchPlaceholder"),
          allParts: t("page.chapters.allParts"),
          statusAll: t("page.chapters.statusAll"),
          statusPublished: t("page.chapters.statusPublished"),
          statusComing: t("page.chapters.statusComing"),
          jumpTo: t("page.chapters.jumpTo"),
          comingSoon: t("page.chapters.comingSoon"),
          statsDone: t("page.chapters.statsDone", { done, total }),
          readingTotal: t("page.chapters.readingTotal", { minutes: totalReadingMin }),
          noMatches: t("page.chapters.noMatches"),
          readingUnit: t("page.chapters.readingUnit"),
        }}
      />
    </>
  );
}
