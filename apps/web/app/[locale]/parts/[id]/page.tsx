import { type Locale, isLocale } from "@/i18n/config";
import { getPart, listPartIds } from "@/lib/content/loader/part-loader";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface PartDetailProps {
  params: Promise<{ locale: string; id: string }>;
}

export function generateStaticParams() {
  const ids = listPartIds();
  return ["vi", "en"].flatMap((locale) => ids.map((id) => ({ locale, id })));
}

export default async function PartDetail({ params }: PartDetailProps) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const part = getPart(id, locale as Locale);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header>
        <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--muted)]">
          {locale === "vi" ? "Phần" : "Part"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{part?.title ?? id}</h1>
        {part ? <p className="mt-2 text-[color:var(--muted)]">{part.description}</p> : null}
      </header>
    </main>
  );
}
