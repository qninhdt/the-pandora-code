import { chapterPosition, partLabel, partNumberLabel } from "@/lib/content/outline";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import Link from "next/link";

// Prose never hard-codes a chapter number. It names a slug, and the number is
// derived from the chapter's position in OUTLINE at render time, so resequencing
// the book can never leave a sentence pointing at the wrong chapter.
//
// Renders "IV.3 — Why Banshees Get to Be Big" by default, linked to the chapter.
// `numberOnly` gives the bare "IV.3" for mid-sentence citation; `titleOnly` gives
// the title alone when the surrounding prose already supplies the number.

interface ChapterRefProps {
  slug: string;
  /** Render just the "IV.3" label. */
  numberOnly?: boolean;
  /** Render just the localized title. */
  titleOnly?: boolean;
  className?: string;
}

export function ChapterRef({ slug, numberOnly, titleOnly, className }: ChapterRefProps) {
  const locale = useLocale() as "vi" | "en";
  const position = chapterPosition(slug);

  // An unknown slug means the outline and the prose disagree. Render the slug
  // plainly rather than throwing, and let the content validator fail the build.
  if (!position) return <span className={className}>{slug}</span>;

  const title = position.title[locale];
  const label = position.label;

  let text: string;
  if (titleOnly || !label) text = title;
  else if (numberOnly) text = label;
  else text = `${label} — ${title}`;

  return (
    <Link
      href={`/${locale}/chapters/${slug}`}
      className={cn("text-accent underline-offset-4 hover:underline", className)}
    >
      {text}
    </Link>
  );
}

interface PartRefProps {
  id: string;
  /** Render just the roman numeral, e.g. "IV". */
  numberOnly?: boolean;
  className?: string;
}

export function PartRef({ id, numberOnly, className }: PartRefProps) {
  const locale = useLocale() as "vi" | "en";
  const label = partLabel(id);
  if (!label) return <span className={className}>{id}</span>;
  const roman = partNumberLabel(id);
  return <span className={className}>{numberOnly && roman ? roman : label[locale]}</span>;
}
