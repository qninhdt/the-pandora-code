import { ChaptersLibrary } from "@/components/chapters/chapters-library";
import { ContinueReading } from "@/components/engagement/continue-reading";
import { type Locale, isLocale } from "@/i18n/config";
import { listPublishedChapters } from "@/lib/content/loader/chapter-loader";
import { getChapterCoverImage } from "@/lib/content/loader/cover-image";
import { getOutlineWithStatus } from "@/lib/content/outline";
import type { ChapterMeta } from "@/lib/content/schemas/chapter-meta";
import type { ClassificationKind } from "@/lib/content/schemas/shared";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface ChaptersPageProps {
  params: Promise<{ locale: string }>;
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
  const metaBySlug = new Map(listPublishedChapters(loc).map((c) => [c.meta.slug, c.meta]));

  let done = 0;
  let total = 0;
  let totalReadingMin = 0;

  const parts = getOutlineWithStatus(loc).map((part) => ({
    id: part.id,
    label: part.label[loc],
    chapters: part.chapters.map((ch) => {
      total += 1;
      const meta = metaBySlug.get(ch.slug);
      if (ch.published) done += 1;
      if (meta) totalReadingMin += meta.reading_time_min;
      return {
        slug: ch.slug,
        href: `/${loc}/chapters/${ch.slug}`,
        title: ch.title[loc],
        payload: ch.payload[loc],
        plateNo: ch.plateNo,
        published: ch.published,
        coverSrc: ch.published ? (getChapterCoverImage(ch.slug) ?? null) : null,
        readingMin: meta?.reading_time_min ?? null,
        tier: meta ? dominantTier(meta) : null,
      };
    }),
  }));

  return (
    <>
      <div className="pt-24">
        <ContinueReading
          locale={loc}
          labels={{ heading: t("engagement.continueHeading"), resume: t("engagement.resume") }}
        />
      </div>
      <ChaptersLibrary
        locale={loc}
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
          readingUnit: loc === "vi" ? "phút" : "min",
        }}
      />
    </>
  );
}
