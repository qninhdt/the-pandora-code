"use client";

import { ReaderSettingsMenu } from "@/components/reading/reader-settings-menu";
import { pauseAudio, playAudio, useAudioState } from "@/lib/engagement/audio-store";
import { cn } from "@/lib/utils";
import { List, Pause, Play, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TableOfContentsList, type TocHeading } from "./table-of-contents-list";

interface MobileReaderDockProps {
  headings: TocHeading[];
  active: string | null;
  label: string;
}

export function MobileReaderDock({ headings, active, label }: MobileReaderDockProps) {
  const audio = useAudioState();
  const t = useTranslations();
  const [outlineOpen, setOutlineOpen] = useState(false);
  const sheetId = useId();
  const labelId = `${sheetId}-label`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const hasOutline = headings.length > 0;

  useEffect(() => {
    if (!outlineOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable = sheetRef.current?.querySelector<HTMLElement>(
      "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
    );
    focusable?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOutlineOpen(false);
        return;
      }
      if (event.key !== "Tab" || !sheetRef.current) return;
      const elements = [
        ...sheetRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
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
  }, [outlineOpen]);

  const outlineLayer =
    hasOutline && outlineOpen && typeof document !== "undefined"
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Close table of contents"
              onClick={() => setOutlineOpen(false)}
              className="fixed inset-0 z-[100] bg-void/60 backdrop-blur-sm"
            />
            <dialog
              ref={sheetRef}
              id={sheetId}
              open
              aria-modal="true"
              aria-labelledby={labelId}
              className="fixed inset-x-4 bottom-24 z-[110] m-0 mx-auto max-w-md"
            >
              <div className="max-h-[55vh] overflow-y-auto overscroll-contain rounded-2xl border border-cyan/30 bg-void/95 p-5 backdrop-blur-xl">
                <p
                  id={labelId}
                  className="mb-3 font-sans text-[0.6875rem] text-cyan uppercase tracking-wider"
                >
                  {label}
                </p>
                <TableOfContentsList
                  headings={headings}
                  active={active}
                  onNavigate={() => setOutlineOpen(false)}
                  ariaLabel={label}
                />
              </div>
            </dialog>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="lg:hidden" data-mobile-reader-dock>
      {outlineLayer}

      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-cyan/35 bg-void/92 p-1.5 text-cyan shadow-2xl backdrop-blur-xl print:hidden">
        {hasOutline ? (
          <button
            type="button"
            ref={triggerRef}
            aria-expanded={outlineOpen}
            aria-controls={sheetId}
            aria-label={label}
            title={label}
            onClick={() => setOutlineOpen((value) => !value)}
            className="grid size-11 place-items-center rounded-full transition-colors hover:bg-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
          >
            {outlineOpen ? <X size={19} aria-hidden /> : <List size={19} aria-hidden />}
          </button>
        ) : null}
        {audio.audioUrl ? (
          <button
            type="button"
            aria-label={audio.isPlaying ? t("audio.pause") : t("audio.play")}
            title={audio.isPlaying ? t("audio.pause") : t("audio.play")}
            onClick={() => (audio.isPlaying ? pauseAudio() : playAudio())}
            className="grid size-11 place-items-center rounded-full bg-cyan text-void transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
          >
            {audio.isPlaying ? (
              <Pause size={17} fill="currentColor" aria-hidden />
            ) : (
              <Play size={17} fill="currentColor" aria-hidden />
            )}
          </button>
        ) : null}
        <ReaderSettingsMenu variant="dock" />
      </div>
    </div>
  );
}
