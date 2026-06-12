import { AtmosphereProvider } from "@/components/atmosphere/atmosphere-provider";
import { FloatingDock } from "@/components/layout/floating-dock";
import { SiteFooter } from "@/components/layout/site-footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type Locale, isLocale, locales } from "@/i18n/config";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale });

  const dockNav = {
    home: t("nav.home"),
    chapters: t("nav.chapters"),
    glossary: t("nav.glossary"),
    authors: t("nav.authors"),
    timeline: t("nav.timeline"),
    constellation: t("nav.constellation"),
    saved: t("engagement.saved"),
  };

  const searchLabels = {
    trigger: t("search.trigger"),
    placeholder: t("search.placeholder"),
    title: t("search.title"),
    empty: t("search.empty"),
    hint: t("search.hint"),
    groupChapter: t("search.groupChapter"),
    groupGlossary: t("search.groupGlossary"),
    groupTopic: t("search.groupTopic"),
  };

  return (
    <NextIntlClientProvider locale={locale as Locale} messages={messages}>
      <TooltipProvider delayDuration={150}>
        <AtmosphereProvider />
        <FloatingDock
          locale={locale as Locale}
          brand={t("site.name")}
          nav={dockNav}
          search={searchLabels}
        />
        <div>
          {children}
          <SiteFooter
            locale={locale as Locale}
            tagline={t("site.tagline")}
            copyright={t("footer.copyright", { year: new Date().getFullYear() })}
          />
        </div>
      </TooltipProvider>
    </NextIntlClientProvider>
  );
}
