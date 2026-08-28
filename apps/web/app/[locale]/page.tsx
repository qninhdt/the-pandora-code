import { DiagonalBreak } from "@/components/codex/diagonal-break";
import { ClosingCall } from "@/components/landing/closing-call";
import { type BrowserPart, CodexBrowser } from "@/components/landing/codex-browser";
import { DescentSection } from "@/components/landing/descent-section";
import { HeroSurface } from "@/components/landing/hero-surface";
import {
  ContinueReadingCard,
  type ContinueReadingItem,
} from "@/components/reading/continue-reading-card";
import { JsonLd } from "@/components/seo/json-ld";
import { type Locale, isLocale } from "@/i18n/config";
import { getChapterCoverImage } from "@/lib/content/loader/cover-image";
import { getOutlineWithStatus } from "@/lib/content/outline-status";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { createBreadcrumbListSchema, createWebSiteSchema } from "@/lib/seo/structured-data";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "",
    title: t("home.title"),
    description: t("home.intro"),
  });
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const loc = locale as Locale;

  const parts: BrowserPart[] = getOutlineWithStatus(loc).map((p) => ({
    id: p.id,
    label: p.label[loc],
    chapters: p.chapters.map((c) => ({
      slug: c.slug,
      locale: loc,
      href: `/${loc}/chapters/${c.slug}`,
      title: c.title[loc],
      payload: c.payload[loc],
      plateNo: c.plateNo,
      published: c.published,
      coverSrc: c.published ? getChapterCoverImage(c.slug) : undefined,
    })),
  }));

  const allChapters = parts.flatMap((p) => p.chapters);
  const chaptersTotal = allChapters.length;
  const chaptersDone = allChapters.filter((c) => c.published).length;
  const continueItems: ContinueReadingItem[] = allChapters
    .filter((c) => c.published)
    .map((c) => ({ locale: loc, slug: c.slug, title: c.title, href: c.href }));

  return (
    <>
      <JsonLd
        data={[
          createWebSiteSchema({
            name: t("site.name"),
            alternateName: "The Pandora Code",
            url: `/${loc}`,
          }),
          createBreadcrumbListSchema([{ name: t("site.name"), item: `/${loc}` }]),
        ]}
      />
      <HeroSurface
        progressLabel={t("home.decoding")}
        progressCount={t("home.decodingChapters", {
          done: chaptersDone,
          total: chaptersTotal,
        })}
        chaptersDone={chaptersDone}
        chaptersTotal={chaptersTotal}
        title={t("home.title")}
        intro={t("home.intro")}
        ctaChapters={t("home.ctaChapters")}
        ctaGlossary={t("nav.glossary")}
        chaptersHref={`/${loc}/chapters`}
        glossaryHref={`/${loc}/glossary`}
      />

      <div className="relative z-20 mx-auto h-0 w-full max-w-6xl px-6">
        <ContinueReadingCard
          items={continueItems}
          label={t("chapter.continueReading")}
          className="-translate-y-[calc(100%+1.5rem)]"
        />
      </div>

      <DescentSection
        kicker={t("landing.descentKicker")}
        heading={t("landing.descentHeading")}
        body={t("landing.descentBody")}
        note={t("landing.descentNote")}
      />

      {/* <DiagonalBreak tone="cyan" /> */}

      <CodexBrowser
        kicker={t("landing.codexKicker")}
        heading={t("landing.codexHeading")}
        comingLabel={t("landing.coming")}
        parts={parts}
      />

      {/* <DiagonalBreak tone="teal" flip /> */}

      <ClosingCall
        kicker={t("landing.closingKicker")}
        heading={t("landing.closingHeading")}
        body={t("landing.closingBody")}
        cta={t("home.ctaChapters")}
        secondaryCta={t("nav.glossary")}
        chaptersHref={`/${loc}/chapters`}
        glossaryHref={`/${loc}/glossary`}
      />
    </>
  );
}
