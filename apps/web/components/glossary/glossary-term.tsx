"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GlossaryTermProps {
  slug: string;
  term: string;
  definition: string;
  locale?: "vi" | "en";
  className?: string;
  children?: React.ReactNode;
}

export function GlossaryTerm({
  slug,
  term,
  definition,
  locale = "vi",
  className,
  children,
}: GlossaryTermProps) {
  const label = children ?? term;
  const triggerClass = cn(
    "rounded px-0.5 align-baseline font-medium text-[color:var(--accent)] underline decoration-dotted underline-offset-4 cursor-help",
    className,
  );

  return (
    <>
      <span className="hidden sm:inline">
        <Tooltip>
          <TooltipTrigger asChild>
            <a href={`/${locale}/glossary#${slug}`} className={triggerClass}>
              {label}
            </a>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--border)]"
          >
            <p className="text-xs font-mono uppercase tracking-wide mb-1 text-[color:var(--muted)]">
              {term}
            </p>
            <p className="text-sm leading-relaxed">{definition}</p>
          </TooltipContent>
        </Tooltip>
      </span>
      <span className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className={triggerClass}>
              {label}
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            className="max-w-xs bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--border)]"
          >
            <p className="text-xs font-mono uppercase tracking-wide mb-1 text-[color:var(--muted)]">
              {term}
            </p>
            <p className="text-sm leading-relaxed mb-3">{definition}</p>
            <a
              href={`/${locale}/glossary#${slug}`}
              className="text-xs font-medium text-[color:var(--accent)]"
            >
              {locale === "vi" ? "Xem trong từ điển →" : "View in glossary →"}
            </a>
          </PopoverContent>
        </Popover>
      </span>
    </>
  );
}
