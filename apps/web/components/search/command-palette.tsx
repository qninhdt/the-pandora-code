"use client";

import type { Locale } from "@/i18n/config";
import { type SearchHit, search } from "@/lib/search/search-index";
import { cn } from "@/lib/utils";
import { FileText, Hash, Search, Tag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchHotkey } from "./use-search-hotkey";

const TYPE_ICON = {
  chapter: FileText,
  glossary: Hash,
  topic: Tag,
} as const;

// ⌘K command palette: searches the build-time index (chapters + glossary +
// topics) for the current locale, groups hits by type, and navigates on select.
// Full keyboard support: ↑↓ to move, Enter to open, Esc to close (Esc handled
// by the Radix dialog). Index loads lazily on first open.
export function CommandPalette() {
  const locale = useLocale() as Locale;
  const t = useTranslations("search");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggle = useCallback(() => setOpen((o) => !o), []);
  useSearchHotkey(toggle);

  // Debounced query → search. Resets active row on every new result set.
  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => {
      search(locale, query).then((results) => {
        setHits(results);
        setActive(0);
      });
    }, 120);
    return () => clearTimeout(handle);
  }, [query, locale, open]);

  // Reset transient state when the palette closes; focus the input on open
  // (ref-based rather than autoFocus, which the a11y linter forbids).
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setHits([]);
      setActive(0);
    }
  }, [open]);

  const go = useCallback(
    (hit: SearchHit) => {
      setOpen(false);
      router.push(hit.href);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      go(hits[active]);
    }
  };

  // Keep the active row scrolled into view.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const groupLabel = (type: SearchHit["type"]) =>
    type === "chapter"
      ? t("groupChapter")
      : type === "glossary"
        ? t("groupGlossary")
        : t("groupTopic");

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={t("trigger")}
          className="grid size-9 place-items-center rounded-full border border-border text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          <Search size={17} />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onKeyDown={onKeyDown}
          className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface text-foreground shadow-2xl outline-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">{t("title")}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t("hint")}
          </DialogPrimitive.Description>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search size={18} className="shrink-0 text-subtle" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="w-full bg-transparent py-4 font-sans text-base text-foreground outline-none placeholder:text-subtle"
            />
          </div>
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
            {query.trim() === "" ? (
              <p className="px-3 py-8 text-center font-sans text-sm text-subtle">{t("hint")}</p>
            ) : hits.length === 0 ? (
              <p className="px-3 py-8 text-center font-sans text-sm text-subtle">{t("empty")}</p>
            ) : (
              hits.map((hit, idx) => {
                const Icon = TYPE_ICON[hit.type];
                return (
                  <button
                    type="button"
                    key={hit.id}
                    data-idx={idx}
                    onClick={() => go(hit)}
                    onMouseEnter={() => setActive(idx)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      idx === active ? "bg-surface-overlay" : "hover:bg-surface-overlay/60",
                    )}
                  >
                    <Icon size={16} className="shrink-0 text-cyan" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-sans text-sm font-medium text-foreground">
                        {hit.title}
                      </span>
                      {hit.summary && (
                        <span className="block truncate font-sans text-xs text-muted">
                          {hit.summary}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-sans text-[0.65rem] uppercase tracking-wider text-subtle">
                      {groupLabel(hit.type)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
