"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

interface OpenQuestionItem {
  question: string;
  /** Optional answer revealed when the row is expanded. */
  answer?: string;
}

interface OpenQuestionsProps {
  title?: string;
  items: OpenQuestionItem[];
  className?: string;
}

// End-of-chapter open questions - what science (and canon) still can't answer.
// Each row expands on click to reveal an answer (or "what we can say so far"),
// so the reader can sit with the question before seeing the response.
export function OpenQuestions({ title, items, className }: OpenQuestionsProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      className={cn(
        "my-10 rounded-2xl border border-border bg-surface/40 p-6 backdrop-blur-sm",
        className,
      )}
    >
      {title && (
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-700 text-foreground">
          <HelpCircle size={18} className="text-magenta" />
          {title}
        </h3>
      )}
      <ul className="space-y-2">
        {items.map((item, i) => {
          const isOpen = open === i;
          const hasAnswer = Boolean(item.answer);
          return (
            <li
              key={i}
              className="rounded-xl border border-border/60 bg-void/20"
            >
              <button
                type="button"
                disabled={!hasAnswer}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-left",
                  hasAnswer && "cursor-pointer",
                )}
                aria-expanded={isOpen}
              >
                <span className="shrink-0 font-sans text-sm font-semibold text-magenta tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-serif text-[0.95rem] leading-relaxed text-foreground/90">
                  {item.question}
                </span>
                {hasAnswer && (
                  <ChevronDown
                    size={18}
                    className={cn(
                      "mt-0.5 shrink-0 text-muted transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                  />
                )}
              </button>
              {hasAnswer && (
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 pl-12 font-serif text-[0.9rem] leading-relaxed text-muted">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
