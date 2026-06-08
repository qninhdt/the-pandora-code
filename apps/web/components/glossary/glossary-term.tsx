"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GlossaryTermProps {
  slug: string;
  /** Resolved from the glossary by the chapter page; falls back to children. */
  term?: string;
  /** Resolved from the glossary by the chapter page (locale-correct). */
  definition?: string;
  /** Optional glossary cover image resolved server-side. */
  coverSrc?: string;
  locale?: "vi" | "en";
  className?: string;
  children?: React.ReactNode;
}

export function GlossaryTerm({
  slug,
  term,
  definition,
  coverSrc,
  locale = "vi",
  className,
  children,
}: GlossaryTermProps) {
  const label = children ?? term ?? slug;
  const triggerClass = cn(
    "rounded px-0.5 align-baseline font-medium text-[color:var(--accent)] underline decoration-dotted underline-offset-4 cursor-help",
    className,
  );
  const renderPreview = () =>
    coverSrc ? (
      <div className="mb-3 overflow-hidden rounded-lg border border-[color:var(--border)]">
        <img src={coverSrc} alt="" className="aspect-[16/10] w-full object-cover" />
      </div>
    ) : (
      <div
        aria-hidden
        className="mb-3 aspect-[16/10] w-full rounded-lg border border-[color:var(--border)]"
        style={{
          background:
            "radial-gradient(70% 60% at 30% 25%, color-mix(in oklab, var(--cyan) 22%, transparent), transparent 60%), radial-gradient(60% 60% at 85% 90%, color-mix(in oklab, var(--magenta) 14%, transparent), transparent 60%), var(--surface)",
        }}
      />
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
            className="max-w-sm bg-[color:var(--background)] text-[color:var(--foreground)] border border-[color:var(--border)]"
          >
            {renderPreview()}
            <p className="text-xs font-mono uppercase tracking-wide mb-1 text-[color:var(--muted)]">
              {term}
            </p>
            <p className="text-sm leading-relaxed">{definition}</p>
          </TooltipContent>
        </Tooltip>
      </span>
      <span className="sm:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <button type="button" className={triggerClass}>
              {label}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            {renderPreview()}
            <DialogTitle className="font-mono text-xs uppercase tracking-wide text-[color:var(--muted)]">
              {term}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[color:var(--foreground)]">
              {definition}
            </DialogDescription>
            <a
              href={`/${locale}/glossary#${slug}`}
              className="mt-1 text-xs font-medium text-[color:var(--accent)]"
            >
              {locale === "vi" ? "Xem trong từ điển →" : "View in glossary →"}
            </a>
          </DialogContent>
        </Dialog>
      </span>
    </>
  );
}
