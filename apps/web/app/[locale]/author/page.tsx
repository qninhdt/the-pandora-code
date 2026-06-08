import { AuthorProfile } from "@/components/authors/author-profile";
import { type Locale, isLocale } from "@/i18n/config";
import { listAuthors } from "@/lib/content/loader/author-loader";
import { getPageBackground } from "@/lib/content/loader/page-background";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface AuthorPageProps {
  params: Promise<{ locale: string }>;
}

// The book has a single storyteller, so /author presents them directly — no
// directory, no per-id route.
export default async function AuthorPage({ params }: AuthorPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;

  const author = listAuthors(loc)[0];
  if (!author) notFound();

  return <AuthorProfile author={author} locale={loc} bgSrc={getPageBackground("authors")} />;
}
