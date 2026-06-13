import { CanonBadge } from "@/components/classification/canon-badge";
import { type Locale, isLocale } from "@/i18n/config";
import { getChapter, listChapterSlugs } from "@/lib/content/loader/chapter-loader";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TopicPageProps {
  params: Promise<{ locale: string; tag: string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { locale, tag } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale });
  return buildPageMetadata({
    locale: locale as Locale,
    path: `/topics/${tag}`,
    title: t("page.topics.title", { tag }),
    description: t("page.topics.subtitle"),
  });
}

function collectTags(): string[] {
  const slugs = listChapterSlugs();
  const tags = new Set<string>();
  for (const slug of slugs) {
    const chapter = getChapter(slug, "vi");
    if (!chapter) continue;
    for (const tag of chapter.meta.tags ?? []) tags.add(tag);
  }
  return Array.from(tags);
}

export function generateStaticParams() {
  const tags = collectTags();
  return ["vi", "en"].flatMap((locale) => tags.map((tag) => ({ locale, tag })));
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { locale, tag } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("page.topics");

  const chapters = listChapterSlugs()
    .map((slug) => getChapter(slug, locale as Locale))
    .filter((c): c is NonNullable<typeof c> => c !== null && (c.meta.tags ?? []).includes(tag));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header>
        <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--muted)]">
          {t("topicKicker")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">#{tag}</h1>
      </header>

      {chapters.length === 0 ? (
        <p className="text-sm text-[color:var(--muted)]">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {chapters.map((c) => (
            <li
              key={c.meta.slug}
              className="rounded-[var(--radius-md)] border border-[color:var(--border)] p-4"
            >
              <Link
                href={`/${locale}/chapters/${c.meta.slug}`}
                className="no-underline text-[color:var(--foreground)]"
              >
                <h2 className="text-lg font-semibold">{c.title}</h2>
                <div className="mt-2">
                  <CanonBadge kind="canon">
                    {`Canon ${c.meta.classification.canon_pct}%`}
                  </CanonBadge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
