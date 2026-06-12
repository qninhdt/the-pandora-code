import { SavedList } from "@/components/engagement/saved-list";
import { type Locale, isLocale, locales } from "@/i18n/config";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface SavedPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function SavedPage({ params }: SavedPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);
  const t = await getTranslations({ locale });

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-32 space-y-6">
      <header>
        <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--muted)]">
          {t("page.saved.kicker")}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{t("page.saved.title")}</h1>
        <p className="mt-2 text-base text-[color:var(--muted)]">{t("page.saved.subtitle")}</p>
      </header>
      <SavedList
        locale={loc}
        labels={{
          empty: t("page.saved.empty"),
          removeLabel: t("page.saved.remove"),
          groupChapter: t("search.groupChapter"),
          groupGlossary: t("search.groupGlossary"),
        }}
      />
    </main>
  );
}
