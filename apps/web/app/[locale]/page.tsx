import { DiagonalBreak } from "@/components/codex/diagonal-break";
import { type BrowserPart, CodexBrowser } from "@/components/landing/codex-browser";
import { DescentSection } from "@/components/landing/descent-section";
import { HeroSurface } from "@/components/landing/hero-surface";
import { type Locale, isLocale } from "@/i18n/config";
import { getOutlineWithStatus } from "@/lib/content/outline";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface HomeProps {
  params: Promise<{ locale: string }>;
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
      href: `/${loc}/chapters/${c.slug}`,
      title: c.title[loc],
      payload: c.payload[loc],
      plateNo: c.plateNo,
      published: c.published,
    })),
  }));

  return (
    <>
      <HeroSurface
        eyebrow={t("site.name")}
        title={t("home.title")}
        intro={t("home.intro")}
        ctaChapters={t("home.ctaChapters")}
        ctaGlossary={t("nav.glossary")}
        chaptersHref={`/${loc}/chapters`}
        glossaryHref={`/${loc}/glossary`}
      />

      <DescentSection
        kicker={t("landing.descentKicker")}
        heading={t("landing.descentHeading")}
        body={t("landing.descentBody")}
        note={t("landing.descentNote")}
      />

      <DiagonalBreak tone="cyan" />

      <CodexBrowser
        kicker={t("landing.codexKicker")}
        heading={t("landing.codexHeading")}
        comingLabel={t("landing.coming")}
        parts={parts}
      />
    </>
  );
}
