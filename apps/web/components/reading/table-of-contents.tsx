"use client";

import { cn } from "@/lib/utils";
import { List, X } from "lucide-react";
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

function TocList({
  headings,
  active,
  onNavigate,
}: {
  headings: TocHeading[];
  active: string | null;
  onNavigate?: () => void;
}) {
  return (
    <nav>
      <ul className="space-y-1 border-l border-border/80">
        {headings.map((h) => {
          const on = active === h.id;
          return (
            <li key={h.id} className={h.depth === 3 ? "pl-3" : ""}>
              <a
                href={`#${h.id}`}
                onClick={onNavigate}
                className={cn(
                  "-ml-px block border-l-2 py-1.5 pl-4 font-sans text-[0.8125rem] leading-snug transition-colors",
                  on
                    ? "border-cyan text-foreground"
                    : "border-transparent text-foreground/72 hover:border-border-strong hover:text-foreground",
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
  const [open, setOpen] = useState(false);
  if (headings.length === 0) return null;
  const heading = label ?? "On this page";

  return (
    <>
      {/* Desktop: inline list (the shell supplies sticky positioning). */}
      <div className={cn("hidden lg:block", className)} aria-label={heading}>
        <div className="rounded-xl border border-border bg-surface/70 p-5 backdrop-blur-sm">
          <p className="mb-4 font-sans text-[0.6875rem] uppercase tracking-wider text-foreground/82">
            {heading}
          </p>
          <TocList headings={headings} active={active} />
        </div>
      </div>

      {/* Mobile: a fixed round button at the bottom-left. Tapping it opens a
          centered bottom sheet over a dim backdrop (no lopsided left-edge box,
          no side drawer). */}
      <div className="lg:hidden">
        {/* Dim backdrop focuses the sheet and catches taps to close. */}
        <button
          type="button"
          aria-hidden={!open}
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className={cn(
            "fixed inset-0 z-40 bg-void/60 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />

        {/* Centered bottom sheet. */}
        <div
          className={cn(
            "fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md transition-all duration-300 ease-out",
            open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
          )}
        >
          <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-cyan/30 bg-void/95 p-5 backdrop-blur-xl">
            <p className="mb-3 font-sans text-[0.6875rem] uppercase tracking-wider text-cyan">
              {heading}
            </p>
            <TocList headings={headings} active={active} onNavigate={() => setOpen(false)} />
          </div>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-label={heading}
          onClick={() => setOpen((v) => !v)}
          className="fixed bottom-5 left-5 z-40 grid size-12 place-items-center rounded-full border border-cyan/50 bg-void/85 text-cyan backdrop-blur-xl"
          style={{ boxShadow: "0 8px 32px -8px color-mix(in oklab, var(--cyan) 60%, transparent)" }}
        >
          {open ? <X size={20} /> : <List size={20} />}
        </button>
      </div>
    </>
  );
}
