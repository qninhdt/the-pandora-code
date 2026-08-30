import { cn } from "@/lib/utils";

export interface TocHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

interface TableOfContentsListProps {
  headings: TocHeading[];
  active: string | null;
  onNavigate?: () => void;
  ariaLabel?: string;
}

export function TableOfContentsList({
  headings,
  active,
  onNavigate,
  ariaLabel,
}: TableOfContentsListProps) {
  return (
    <nav aria-label={ariaLabel ?? "Table of contents"}>
      <ul className="space-y-1 border-border/80 border-l">
        {headings.map((heading) => {
          const selected = active === heading.id;
          return (
            <li key={heading.id} className={heading.depth === 3 ? "pl-3" : ""}>
              <a
                href={`#${heading.id}`}
                onClick={onNavigate}
                className={cn(
                  "-ml-px block border-l-2 py-1.5 pl-4 font-sans text-[0.8125rem] leading-snug transition-colors",
                  selected
                    ? "border-cyan text-foreground"
                    : "border-transparent text-foreground/72 hover:border-border-strong hover:text-foreground",
                )}
                style={
                  selected
                    ? { textShadow: "0 0 14px color-mix(in oklab, var(--cyan) 45%, transparent)" }
                    : undefined
                }
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
