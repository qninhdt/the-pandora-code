"use client";

import { GlassPanel } from "@/components/codex/glass-panel";
import type { LocalizedGlossaryTerm } from "@/lib/content/loader/glossary-loader";
import { glossaryTagLabel } from "@/lib/content/schemas/glossary-tags";
import Link from "next/link";

interface GlossaryCardProps {
  term: LocalizedGlossaryTerm;
  cover: string | null;
  locale: "vi" | "en";
}

/** A visual glossary term card: cover banner + tag pills + label + definition. */
export function GlossaryCard({ term, cover, locale }: GlossaryCardProps) {
  return (
    <Link
      href={`/${locale}/glossary/${term.id}`}
      id={term.id}
      className="group block h-full scroll-mt-36 no-underline"
    >
      <GlassPanel
        depth={2}
        className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-border-strong"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div
              className="size-full"
              style={{
                background:
                  "radial-gradient(70% 60% at 30% 25%, color-mix(in oklab, var(--cyan) 22%, transparent), transparent 60%), radial-gradient(60% 60% at 85% 90%, color-mix(in oklab, var(--magenta) 14%, transparent), transparent 60%), var(--surface)",
              }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, var(--surface) 6%, transparent 55%)" }}
          />
          {term.tags.length > 0 ? (
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
              {term.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]/80 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide text-[color:var(--cyan)] backdrop-blur"
                >
                  {glossaryTagLabel(tag, locale)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-lg font-700 leading-snug text-foreground transition-colors group-hover:text-[color:var(--accent)]">
            {term.label}
          </h3>
          <p className="mt-1.5 line-clamp-2 font-serif text-sm text-muted">{term.definition}</p>
        </div>
      </GlassPanel>
    </Link>
  );
}
