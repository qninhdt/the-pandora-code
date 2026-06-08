import { CodexCell } from "@/components/codex/codex-cell";
import { CodexGrid } from "@/components/codex/codex-grid";
import { GlassPanel } from "@/components/codex/glass-panel";
import { SpecimenPlate } from "@/components/codex/specimen-plate";
import { type Locale, isLocale } from "@/i18n/config";
import { listAuthors } from "@/lib/content/loader/author-loader";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface AuthorsIndexProps {
  params: Promise<{ locale: string }>;
}

export default async function AuthorsIndex({ params }: AuthorsIndexProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations({ locale });
  const authors = listAuthors(loc);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-32">
      <header className="mb-12 max-w-3xl">
        <h1 className="font-display text-5xl font-800 leading-tight tracking-tight text-foreground">
          {t("page.authors.title")}
        </h1>
        <p className="mt-4 font-serif text-lg text-muted">{t("page.authors.subtitle")}</p>
      </header>

      {authors.length === 0 ? (
        <GlassPanel depth={2} className="grid min-h-48 place-items-center p-10 text-center">
          <p className="font-serif text-lg text-muted">{t("common.noResults")}</p>
        </GlassPanel>
      ) : (
        <CodexGrid variant="mosaic">
          {authors.map((a, i) => (
            <CodexCell key={a.id} span={3}>
              <SpecimenPlate
                href={`/${loc}/authors/${a.id}`}
                title={a.name}
                subtitle={`${a.title} · ${a.domain}`}
                plateNo={String(i + 1).padStart(2, "0")}
                locale={loc}
              />
            </CodexCell>
          ))}
        </CodexGrid>
      )}
    </main>
  );
}
