import { CodexCell } from "@/components/codex/codex-cell";
import { CodexGrid } from "@/components/codex/codex-grid";
import { GlassPanel } from "@/components/codex/glass-panel";
import { SpecimenPlate } from "@/components/codex/specimen-plate";
import { PageBackground } from "@/components/layout/page-background";
import { type Locale, isLocale } from "@/i18n/config";
import { getPageBackground } from "@/lib/content/loader/page-background";
import { listParts } from "@/lib/content/loader/part-loader";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface PartsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PartsPage({ params }: PartsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations({ locale });
  const parts = listParts(loc);
  const bg = getPageBackground("parts");

  return (
    <>
      {bg && <PageBackground src={bg} />}
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-32">
        <header className="mb-12 max-w-3xl">
          <h1 className="font-display text-5xl font-800 leading-tight tracking-tight text-foreground">
            {t("page.parts.title")}
          </h1>
          <p className="mt-4 font-serif text-lg text-muted">{t("page.parts.subtitle")}</p>
        </header>

        {parts.length === 0 ? (
          <GlassPanel depth={2} className="grid min-h-48 place-items-center p-10 text-center">
            <p className="font-serif text-lg text-muted">{t("common.noResults")}</p>
          </GlassPanel>
        ) : (
          <CodexGrid variant="mosaic">
            {parts.map((p) => (
              <CodexCell key={p.id} span={3}>
                <SpecimenPlate
                  href={`/${loc}/parts/${p.id}`}
                  title={p.title}
                  subtitle={p.description}
                  plateNo={String(p.order).padStart(2, "0")}
                  locale={loc}
                />
              </CodexCell>
            ))}
          </CodexGrid>
        )}
      </main>
    </>
  );
}
