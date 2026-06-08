"use client";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";
import { useEffect, useState } from "react";

export interface TocHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

interface TableOfContentsProps {
  headings: TocHeading[];
  label?: string;
  className?: string;
}

// Scroll-spy: the heading nearest the top of the viewport is marked active.
function useActiveHeading(headings: TocHeading[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((acc, cur) =>
            cur.boundingClientRect.top < acc.boundingClientRect.top ? cur : acc,
          );
          setActive(topmost.target.id);
        }
      },
      { rootMargin: "-80px 0% -70% 0%", threshold: [0, 1] },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);
  return active;
}

function TocList({ headings, active }: { headings: TocHeading[]; active: string | null }) {
  return (
    <nav>
      <ul className="space-y-0.5 border-l border-border">
        {headings.map((h) => {
          const on = active === h.id;
          return (
            <li key={h.id} className={h.depth === 3 ? "pl-3" : ""}>
              <a
                href={`#${h.id}`}
                className={cn(
                  "-ml-px block border-l-2 py-1.5 pl-4 font-sans text-[0.8125rem] leading-snug transition-colors",
                  on
                    ? "border-cyan text-foreground"
                    : "border-transparent text-muted hover:border-border-strong hover:text-foreground",
                )}
                style={
                  on
                    ? { textShadow: "0 0 14px color-mix(in oklab, var(--cyan) 45%, transparent)" }
                    : undefined
                }
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TableOfContents({ headings, label, className }: TableOfContentsProps) {
  const active = useActiveHeading(headings);
  if (headings.length === 0) return null;
  const heading = label ?? "On this page";

  return (
    <>
      {/* Desktop: inline list (the shell supplies sticky positioning). */}
      <div className={cn("hidden lg:block", className)} aria-label={heading}>
        <p className="mb-4 font-sans text-[0.6875rem] uppercase tracking-wider text-subtle">
          {heading}
        </p>
        <TocList headings={headings} active={active} />
      </div>

      {/* Mobile: floating glowing button → drawer. */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label={heading}
            className="fixed bottom-5 right-5 z-30 inline-flex size-12 items-center justify-center rounded-full border border-border-strong bg-surface-raised/90 text-cyan backdrop-blur lg:hidden"
            style={{ boxShadow: "0 0 24px -6px color-mix(in oklab, var(--cyan) 70%, transparent)" }}
          >
            <List size={20} />
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-72 border-border bg-void/95 backdrop-blur-xl sm:w-80"
        >
          <SheetTitle className="font-sans text-xs uppercase tracking-wider text-subtle">
            {heading}
          </SheetTitle>
          <div className="mt-5 overflow-y-auto">
            <TocList headings={headings} active={active} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
