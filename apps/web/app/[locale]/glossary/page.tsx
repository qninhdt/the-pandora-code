import { CodexCell } from "@/components/codex/codex-cell";
import { CodexGrid } from "@/components/codex/codex-grid";
import { GlassPanel } from "@/components/codex/glass-panel";
import { PageBackground } from "@/components/layout/page-background";
import { type Locale, isLocale } from "@/i18n/config";
import { getGlossaryCoverImage } from "@/lib/content/loader/glossary-cover";
import { listGlossaryTerms } from "@/lib/content/loader/glossary-loader";
import { getPageBackground } from "@/lib/content/loader/page-background";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface GlossaryIndexProps {
  params: Promise<{ locale: string }>;
}

export default async function GlossaryIndex({ params }: GlossaryIndexProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations({ locale });
  const terms = listGlossaryTerms(loc);
  const bg = getPageBackground("glossary");

  return (
    <>
      {bg && <PageBackground src={bg} />}
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-32">
        <header className="mb-12 max-w-3xl">
          <h1 className="font-display text-5xl font-800 leading-tight tracking-tight text-foreground">
            {t("page.glossary.title")}
          </h1>
          <p className="mt-4 font-serif text-lg text-muted">{t("page.glossary.subtitle")}</p>
        </header>

        {terms.length === 0 ? (
          <GlassPanel depth={2} className="grid min-h-48 place-items-center p-10 text-center">
            <p className="font-serif text-lg text-muted">{t("common.noResults")}</p>
          </GlassPanel>
        ) : (
          <CodexGrid variant="mosaic">
            {terms.map((term) => {
              const cover = getGlossaryCoverImage(term.id);
              return (
                <CodexCell key={term.id} span={2}>
                  <Link href={`/${loc}/glossary/${term.id}`} id={term.id} className="block h-full">
                    <GlassPanel
                      depth={2}
                      className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-border-strong"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden">
                        {cover ? (
                          <img
                            src={cover}
                            alt=""
                            className="size-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                        ) : (
                          <div
                            className="size-full"
                            style={{
                              background:
                                "radial-gradient(70% 60% at 30% 25%, color-mix(in oklab, var(--cyan) 22%, transparent), transparent 60%), radial-gradient(60% 60% at 85% 90%, color-mix(in oklab, var(--magenta) 14%, transparent), transparent 60%), var(--surface)",
                            }}
                          />
                        )}
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, var(--surface) 4%, transparent 60%)",
                          }}
                        />
                      </div>
                      <div className="p-5">
                        <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-magenta">
                          {term.category}
                        </p>
                        <h2 className="mt-2 font-display text-xl font-700 text-foreground">
                          {term.label}
                        </h2>
                        <p className="mt-2 line-clamp-3 font-serif text-sm text-muted">
                          {term.definition}
                        </p>
                      </div>
                    </GlassPanel>
                  </Link>
                </CodexCell>
              );
            })}
          </CodexGrid>
        )}
      </main>
    </>
  );
}
