"use client";

import { removeBookmark } from "@/lib/engagement/storage";
import { useBookmarks } from "@/lib/engagement/use-engagement";
import { FileText, Hash, X } from "lucide-react";
import Link from "next/link";

interface SavedListProps {
  locale: "vi" | "en";
  labels: { empty: string; removeLabel: string; groupChapter: string; groupGlossary: string };
}

const HREF = {
  chapter: (locale: string, slug: string) => `/${locale}/chapters/${slug}`,
  glossary: (locale: string, slug: string) => `/${locale}/glossary/${slug}`,
} as const;

// Client-rendered bookmark list. Reads from localStorage after mount (via
// useBookmarks → useSyncExternalStore) so there is no hydration mismatch.
// Shows only bookmarks for the current locale.
export function SavedList({ locale, labels }: SavedListProps) {
  const bookmarks = useBookmarks().filter((b) => b.locale === locale);

  if (bookmarks.length === 0) {
    return <p className="font-serif text-base text-muted">{labels.empty}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {bookmarks.map((b) => {
        const Icon = b.type === "chapter" ? FileText : Hash;
        return (
          <li
            key={`${b.type}:${b.slug}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 p-3 transition-colors hover:border-border-strong"
          >
            <Icon size={16} className="shrink-0 text-cyan" />
            <Link
              href={HREF[b.type](locale, b.slug)}
              className="min-w-0 flex-1 truncate font-sans text-sm font-medium text-foreground no-underline hover:text-cyan"
            >
              {b.title}
            </Link>
            <span className="shrink-0 font-sans text-[0.65rem] uppercase tracking-wider text-subtle">
              {b.type === "chapter" ? labels.groupChapter : labels.groupGlossary}
            </span>
            <button
              type="button"
              onClick={() => removeBookmark(b.type, b.locale, b.slug)}
              aria-label={labels.removeLabel}
              title={labels.removeLabel}
              className="grid size-7 shrink-0 place-items-center rounded-full text-subtle transition-colors hover:bg-void/40 hover:text-foreground"
            >
              <X size={15} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
