"use client";

import { ChapterRow, type ChapterRowData } from "@/components/chapters/chapter-row";
import { GlassPanel } from "@/components/codex/glass-panel";
import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface LibraryPart {
  id: string;
  label: string;
  chapters: ChapterRowData[];
}

interface ChaptersLibraryProps {
  title: string;
  subtitle: string;
  parts: LibraryPart[];
  totals: { done: number; total: number; totalReadingMin: number };
  /** "Continue reading" bar, placed under the header inside the page container. */
  continueReading?: React.ReactNode;
  labels: {
    search: string;
    allParts: string;
    statusAll: string;
    statusPublished: string;
    statusComing: string;
    jumpTo: string;
    comingSoon: string;
    statsDone: string;
    readingTotal: string;
    noMatches: string;
    readingUnit: string;
  };
}

type StatusFilter = "all" | "published" | "coming";

// Strip diacritics + lowercase so a search for "eywa" matches "Eywa" and
// VI accents don't block matches.
function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");
}

export function ChaptersLibrary({
  title,
  subtitle,
  parts,
  totals,
  continueReading,
  labels,
}: ChaptersLibraryProps) {
  const [query, setQuery] = useState("");
  const [activePart, setActivePart] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [partsOpen, setPartsOpen] = useState(false);

  const pct = totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;

  // Apply all three filters, dropping empty parts from the result.
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return parts
      .filter((p) => activePart === "all" || p.id === activePart)
      .map((p) => ({
        ...p,
        chapters: p.chapters.filter((c) => {
          if (status === "published" && !c.published) return false;
          if (status === "coming" && c.published) return false;
          if (!q) return true;
          return normalize(`${c.title} ${c.payload}`).includes(q);
        }),
      }))
      .filter((p) => p.chapters.length > 0);
  }, [parts, query, activePart, status]);

  const matchCount = filtered.reduce((n, p) => n + p.chapters.length, 0);

  const activePartLabel =
    activePart === "all"
      ? labels.allParts
      : (parts.find((p) => p.id === activePart)?.label ?? labels.allParts);

  const statusOptions: { key: StatusFilter; label: string }[] = [
    { key: "all", label: labels.statusAll },
    { key: "published", label: labels.statusPublished },
    { key: "coming", label: labels.statusComing },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
      {/* header + library stats */}
      <FadeInOnScroll>
        <header className="mb-8">
          <h1 className="font-display text-4xl font-700 tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl font-serif text-base leading-relaxed text-muted">
            {subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 font-sans text-xs uppercase tracking-[0.18em] text-cyan">
            <span className="tabular-nums">{labels.statsDone}</span>
            <span
              aria-hidden
              className="relative h-1 w-24 overflow-hidden rounded-full"
              style={{ background: "color-mix(in oklab, var(--cyan) 18%, transparent)" }}
            >
              <span
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, var(--teal), var(--cyan))",
                  boxShadow: "0 0 10px 0 color-mix(in oklab, var(--cyan) 80%, transparent)",
                }}
              />
            </span>
            <span className="tabular-nums text-foreground/70 normal-case tracking-normal">
              {labels.readingTotal}
            </span>
          </div>
        </header>
      </FadeInOnScroll>

      {continueReading ? <div className="mb-8">{continueReading}</div> : null}

      {/* filter bar — not sticky: a second sticky layer fought the jump-rail
          and slid under it on scroll. Lives inline in the scroll flow. */}
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
              placeholder={labels.search}
              className="w-full rounded-lg border border-border bg-void/40 py-2.5 pl-9 pr-3 font-sans text-sm text-foreground placeholder:text-subtle focus:border-cyan/60 focus:outline-none focus:ring-1 focus:ring-cyan/40"
            />
          </div>

          {/* part filter — on mobile it collapses behind a single toggle so the
              long part list doesn't pile up nine rows tall; tapping reveals the
              chips. From sm up the chips are always shown and wrap freely. */}
          <div>
            {/* mobile toggle: shows the active part, expands the chip set */}
            <button
              type="button"
              onClick={() => setPartsOpen((v) => !v)}
              aria-expanded={partsOpen}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-void/40 px-3 py-2.5 font-sans text-sm text-foreground transition-colors hover:border-border-strong sm:hidden"
            >
              <span className="truncate">{activePartLabel}</span>
              <ChevronDown
                aria-hidden
                size={16}
                className={cn(
                  "shrink-0 text-subtle transition-transform duration-200",
                  partsOpen && "rotate-180",
                )}
              />
            </button>

            <div className={cn("flex-wrap gap-2 sm:flex", partsOpen ? "mt-2 flex" : "hidden")}>
              <Chip
                active={activePart === "all"}
                onClick={() => {
                  setActivePart("all");
                  setPartsOpen(false);
                }}
              >
                {labels.allParts}
              </Chip>
              {parts.map((p) => (
                <Chip
                  key={p.id}
                  active={activePart === p.id}
                  onClick={() => {
                    setActivePart(p.id);
                    setPartsOpen(false);
                  }}
                >
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* status segmented control on its own row */}
          <div className="inline-flex self-start rounded-lg border border-border p-0.5">
            {statusOptions.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setStatus(o.key)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-sans text-xs transition-colors",
                  status === o.key
                    ? "bg-surface-overlay text-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </GlassPanel>

      <div className="lg:flex lg:gap-10">
        {/* part jump-rail */}
        <aside className="hidden lg:block lg:w-44 lg:shrink-0">
          <nav className="sticky top-32 max-h-[calc(100dvh-10rem)] space-y-1 overflow-y-auto pr-1">
            <p className="mb-2 font-sans text-[0.65rem] uppercase tracking-[0.22em] text-subtle">
              {labels.jumpTo}
            </p>
            {parts.map((p) => {
              const count = p.chapters.filter((c) => c.published).length;
              return (
                <a
                  key={p.id}
                  href={`#part-${p.id}`}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 font-sans text-xs text-muted no-underline transition-colors hover:bg-surface hover:text-foreground"
                >
                  <span className="truncate">{p.label}</span>
                  <span className="shrink-0 tabular-nums text-subtle">{count}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* grouped chapter list */}
        <div className="min-w-0 flex-1">
          {matchCount === 0 ? (
            <GlassPanel depth={1} className="p-10 text-center">
              <p className="font-serif text-muted">{labels.noMatches}</p>
            </GlassPanel>
          ) : (
            <div className="space-y-12">
              {filtered.map((part) => (
                <section key={part.id} id={`part-${part.id}`} className="scroll-mt-44">
                  <h2 className="mb-4 flex items-center gap-3 font-display text-lg font-600 text-foreground">
                    <span
                      aria-hidden
                      className="h-px w-6"
                      style={{ background: "color-mix(in oklab, var(--cyan) 60%, transparent)" }}
                    />
                    {part.label}
                    <span className="font-sans text-xs tabular-nums text-subtle">
                      {part.chapters.length}
                    </span>
                  </h2>
                  <div className="space-y-3">
                    {part.chapters.map((c) => (
                      <ChapterRow
                        key={c.slug}
                        chapter={c}
                        comingLabel={labels.comingSoon}
                        readingUnit={labels.readingUnit}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
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
    </button>
  );
}
