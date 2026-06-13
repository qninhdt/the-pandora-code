import { AuthorProfile } from "@/components/authors/author-profile";
import { type Locale, isLocale } from "@/i18n/config";
import { listAuthors } from "@/lib/content/loader/author-loader";
import { getPageBackground } from "@/lib/content/loader/page-background";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface AuthorPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/author",
    title: t("page.authors.title"),
    description: t("page.authors.subtitle"),
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;

  const author = listAuthors(loc)[0];
  if (!author) notFound();

  return <AuthorProfile author={author} locale={loc} bgSrc={getPageBackground("authors")} />;
}
