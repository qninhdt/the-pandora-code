import { LightboxImage } from "@/components/content/lightbox";
import { cn } from "@/lib/utils";

interface FigureGridItem {
  src: string;
  caption?: { vi: string; en: string } | string;
  alt?: string;
}

interface FigureGridProps {
  items: FigureGridItem[];
  locale?: "vi" | "en";
  /** Columns on md+ (2 or 3). */
  cols?: 2 | 3;
  className?: string;
}

// A small gallery of related figures laid out side by side, each with its own
// bilingual caption. Breaks out wider than the reading column.
export function FigureGrid({ items, locale = "vi", cols = 2, className }: FigureGridProps) {
  return (
    <div
      className={cn(
        "my-8 grid gap-4 lg:-mx-16",
        cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        className,
      )}
    >
      {items.map((it) => {
        const text = typeof it.caption === "string" ? it.caption : it.caption?.[locale];
        return (
          <figure key={it.src} className="m-0">
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <LightboxImage
                src={it.src}
                alt={it.alt ?? text ?? ""}
                className="w-full object-cover"
              />
            </div>
            {text && (
              <figcaption className="mt-2 font-serif text-xs italic leading-snug text-muted">
                {text}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
