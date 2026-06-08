"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("page.notFound");
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--muted)]">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-6">
        <Link href="/" className="text-[color:var(--accent)] no-underline">
          ← {t("back")}
        </Link>
      </p>
    </main>
  );
}
