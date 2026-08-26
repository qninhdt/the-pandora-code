import { AuthorProfile } from "@/components/authors/author-profile";
import { JsonLd } from "@/components/seo/json-ld";
import { type Locale, isLocale } from "@/i18n/config";
import { listAuthors } from "@/lib/content/loader/author-loader";
import { getPageBackground } from "@/lib/content/loader/page-background";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { createBreadcrumbListSchema, createProfilePageSchema } from "@/lib/seo/structured-data";
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
  const t = await getTranslations({ locale });

  const author = listAuthors(loc)[0];
  if (!author) notFound();

  const breadcrumbs = createBreadcrumbListSchema([
    { name: t("nav.home"), item: `/${loc}` },
    { name: t("page.authors.title"), item: `/${loc}/author` },
  ]);
  const profile = createProfilePageSchema({
    url: `/${loc}/author`,
    name: author.name,
    description: author.bio,
    image: "/author.png",
  });
  return (
    <>
      <JsonLd data={[profile, breadcrumbs]} />
      <AuthorProfile author={author} bgSrc={getPageBackground("authors")} />
    </>
  );
}
