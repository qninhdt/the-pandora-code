"use client";

import { GlassPanel } from "@/components/codex/glass-panel";
import type { LocalizedGlossaryTerm } from "@/lib/content/loader/glossary-loader";
import { GLOSSARY_TAGS, glossaryTagLabel } from "@/lib/content/schemas/glossary-tags";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { GlossaryCard } from "./glossary-card";
import { useLocale } from "next-intl";

interface GlossaryBrowserProps {
  terms: LocalizedGlossaryTerm[];
  covers: Record<string, string | null>;
  labels: {
    searchPlaceholder: string;
    allTags: string;
    noResults: string;
    resultCount: string; // contains {count}
    untagged: string;
  };
}

/** Strip diacritics + lowercase for accent-insensitive matching. */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function GlossaryBrowser({ terms, covers, labels }: GlossaryBrowserProps) {
  const locale = useLocale() as "vi" | "en";
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tagsOpen, setTagsOpen] = useState(false);

  // Tag -> count across the full term set (chips always show totals).
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of terms) for (const tag of t.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    // Keep canonical vocabulary order, drop tags with no terms.
    return GLOSSARY_TAGS.filter((tag) => counts.has(tag)).map(
      (tag) => [tag, counts.get(tag) ?? 0] as const,
    );
  }, [terms]);

  // Search filter applied first; tag selection scopes which sections render.
  const searched = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return terms;
    return terms.filter(
      (t) => normalize(t.label).includes(q) || normalize(t.definition).includes(q),
    );
  }, [terms, query]);

  // Group searched terms by tag (a term appears under each of its tags).
  const sections = useMemo(() => {
    const byTag = new Map<string, LocalizedGlossaryTerm[]>();
    const untagged: LocalizedGlossaryTerm[] = [];
    for (const t of searched) {
      if (t.tags.length === 0) untagged.push(t);
      for (const tag of t.tags) {
        const arr = byTag.get(tag);
        if (arr) arr.push(t);
        else byTag.set(tag, [t]);
      }
    }
    const ordered: { tag: string; items: LocalizedGlossaryTerm[] }[] = GLOSSARY_TAGS.filter((tag) =>
      byTag.has(tag),
    ).map((tag) => ({
      tag,
      items: byTag.get(tag) ?? [],
    }));
    if (untagged.length > 0) ordered.push({ tag: "__untagged__", items: untagged });
    return ordered;
  }, [searched]);

  const visibleSections = activeTag ? sections.filter((s) => s.tag === activeTag) : sections;
  const matchCount = searched.length;

  const activeTagLabel = activeTag === null ? labels.allTags : glossaryTagLabel(activeTag, locale);

  return (
    <div>
      <p className="mb-6 font-sans text-xs uppercase tracking-[0.18em] text-cyan tabular-nums">
        {labels.resultCount.replace("{count}", String(matchCount))}
      </p>

      {/* filter bar — search + tag chips on a single frosted panel, matching
          the chapters library. Not sticky so it can't fight the page on scroll. */}
      <GlassPanel depth={2} className="mb-10 p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search
              aria-hidden
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="w-full rounded-lg border border-border bg-void/40 py-2.5 pl-9 pr-3 font-sans text-sm text-foreground placeholder:text-subtle focus:border-cyan/60 focus:outline-none focus:ring-1 focus:ring-cyan/40"
            />
          </div>

          {/* tag filter — on mobile it collapses behind a single toggle showing
              the active tag; tapping reveals the chips. From sm up the chips are
              always shown and wrap freely. */}
          <div>
            <button
              type="button"
              onClick={() => setTagsOpen((v) => !v)}
              aria-expanded={tagsOpen}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-void/40 px-3 py-2.5 font-sans text-sm text-foreground transition-colors hover:border-border-strong sm:hidden"
            >
              <span className="truncate">{activeTagLabel}</span>
              <ChevronDown
                aria-hidden
                size={16}
                className={cn(
                  "shrink-0 text-subtle transition-transform duration-200",
                  tagsOpen && "rotate-180",
                )}
              />
            </button>

            <div className={cn("flex-wrap gap-2 sm:flex", tagsOpen ? "mt-2 flex" : "hidden")}>
              <Chip
                active={activeTag === null}
                count={terms.length}
                onClick={() => {
                  setActiveTag(null);
                  setTagsOpen(false);
                }}
              >
                {labels.allTags}
              </Chip>
              {tagCounts.map(([tag, count]) => (
                <Chip
                  key={tag}
                  active={activeTag === tag}
                  count={count}
                  onClick={() => {
                    setActiveTag(activeTag === tag ? null : tag);
                    setTagsOpen(false);
                  }}
                >
                  {glossaryTagLabel(tag, locale)}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </GlassPanel>

      {matchCount === 0 ? (
        <GlassPanel depth={1} className="grid min-h-40 place-items-center p-10 text-center">
          <p className="font-serif text-lg text-muted">{labels.noResults}</p>
        </GlassPanel>
      ) : (
        <div className="space-y-14">
          {visibleSections.map(({ tag, items }) => (
            <section key={tag} id={`tag-${tag}`} className="scroll-mt-36">
              <div className="mb-5 flex items-baseline gap-3 border-b border-[color:var(--border)] pb-3">
                <h2 className="font-display text-2xl font-700 text-[color:var(--accent)]">
                  {tag === "__untagged__" ? labels.untagged : glossaryTagLabel(tag, locale)}
                </h2>
                <span className="font-mono text-xs text-muted">{items.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((term) => (
                  <GlossaryCard
                    key={`${tag}-${term.id}`}
                    term={term}
                    cover={covers[term.id] ?? null}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 font-sans text-xs transition-colors",
        active
          ? "border-cyan/50 bg-cyan/10 text-cyan"
          : "border-border text-muted hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
      <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
    </button>
  );
}
