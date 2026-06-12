import { ConstellationFallback } from "@/components/constellation/constellation-fallback";
import { ConstellationFigure } from "@/components/constellation/constellation-figure";
import { type Locale, isLocale, locales } from "@/i18n/config";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface ConstellationPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ConstellationPage({ params }: ConstellationPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);
  const t = await getTranslations({ locale });

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
      <header className="reading-column mb-8">
        <p className="font-mono text-xs uppercase tracking-wide text-[color:var(--accent)]">
          {t("page.constellation.kicker")}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {t("page.constellation.title")}
        </h1>
        <p className="mt-2 text-base text-[color:var(--muted)]">
          {t("page.constellation.subtitle")}
        </p>
      </header>
      <ConstellationFigure
        locale={loc}
        labels={{
          all: t("page.constellation.all"),
          loading: t("page.constellation.loading"),
          hint: t("page.constellation.hint"),
        }}
        fallback={<ConstellationFallback locale={loc} />}
      />
    </main>
  );
}
