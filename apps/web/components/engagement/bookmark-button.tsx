"use client";

import type { BookmarkEntry } from "@/lib/engagement/storage";
import { useBookmark } from "@/lib/engagement/use-engagement";
import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  entry: Omit<BookmarkEntry, "ts">;
  labels: { add: string; remove: string };
  className?: string;
}

// Toggle bookmark for a chapter or glossary term. Persists to localStorage via
// useBookmark; renders an un-filled icon on first paint (SSR-safe) and fills in
// once the stored state is read after mount.
export function BookmarkButton({ entry, labels, className }: BookmarkButtonProps) {
  const { bookmarked, toggle } = useBookmark(entry);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? labels.remove : labels.add}
      title={bookmarked ? labels.remove : labels.add}
      className={cn(
        "grid size-10 place-items-center rounded-full border transition-colors",
        bookmarked
          ? "border-cyan/50 bg-cyan/10 text-cyan"
          : "border-border bg-surface/50 text-muted hover:border-border-strong hover:text-foreground",
        className,
      )}
    >
      <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
    </button>
  );
}
