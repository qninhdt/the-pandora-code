"use client";

import { cn } from "@/lib/utils";
import { List, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useActiveHeading } from "./audio-section-sync";

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

function TocList({
  headings,
  active,
  onNavigate,
  ariaLabel,
}: {
  headings: TocHeading[];
  active: string | null;
  onNavigate?: () => void;
  ariaLabel?: string;
}) {
  return (
    <nav aria-label={ariaLabel ?? "Table of contents"}>
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
  const sheetId = useId();
  const labelId = `${sheetId}-label`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable = sheetRef.current?.querySelector<HTMLElement>(
      "a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    focusable?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !sheetRef.current) return;
      const elements = [
        ...sheetRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])",
        ),
      ];
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus();
      else triggerRef.current?.focus();
    };
  }, [open]);
  if (headings.length === 0) return null;
  const heading = label ?? "On this page";

  return (
    <>
      {/* Desktop: inline list (the shell supplies sticky positioning). */}
      <div className={cn("hidden lg:block", className)}>
        <div className="rounded-xl border border-border bg-surface/70 p-5 backdrop-blur-sm">
          <p className="mb-4 font-sans text-[0.6875rem] uppercase tracking-wider text-foreground/82">
            {heading}
          </p>
          <TocList headings={headings} active={active} ariaLabel={heading} />
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
        <dialog
          className={cn(
            "m-0 fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md transition-all duration-300 ease-out",
            open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
          )}
          ref={sheetRef}
          id={sheetId}
          open={open}
          aria-modal={open ? "true" : undefined}
          aria-hidden={!open}
          inert={!open}
          aria-labelledby={labelId}
        >
          <div className="max-h-[55vh] overscroll-contain overflow-y-auto rounded-2xl border border-cyan/30 bg-void/95 p-5 backdrop-blur-xl">
            <p
              id={labelId}
              className="mb-3 font-sans text-[0.6875rem] uppercase tracking-wider text-cyan"
            >
              {heading}
            </p>
            <TocList
              headings={headings}
              active={active}
              onNavigate={() => setOpen(false)}
              ariaLabel={heading}
            />
          </div>
        </dialog>

        <button
          type="button"
          ref={triggerRef}
          aria-expanded={open}
          aria-controls={sheetId}
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
