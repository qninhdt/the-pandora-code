"use client";

import { AudioScrubber } from "@/components/reading/audio-scrubber";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AUDIO_PLAYBACK_RATES,
  closeAudio,
  pauseAudio,
  playAudio,
  sectionIndexAt,
  seekAudio,
  setAudioDuration,
  setAudioFollowReading,
  setAudioPlaybackRate,
  skipAudioSection,
  useAudioState,
} from "@/lib/engagement/audio-store";
import { cn } from "@/lib/utils";
import { Gauge, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(remainder)}`
    : `${pad(minutes)}:${pad(remainder)}`;
}

export function AudioPlayer() {
  const audio = useAudioState();
  const t = useTranslations();
  const audioRef = useRef<HTMLAudioElement>(null);
  const errorTimerRef = useRef<number | null>(null);
  const resumeTimeRef = useRef(audio.currentTime);
  resumeTimeRef.current = audio.currentTime;
  const [error, setError] = useState<string | null>(null);
  const activeIndex = sectionIndexAt(audio.sections, audio.currentTime);
  const activeSection = activeIndex >= 0 ? audio.sections[activeIndex] : undefined;
  const isMounted = audio.isOpen && Boolean(audio.audioUrl);

  const announceError = useCallback(() => {
    setError(t("audio.unavailable"));
    if (errorTimerRef.current !== null) window.clearTimeout(errorTimerRef.current);
    errorTimerRef.current = window.setTimeout(() => setError(null), 4_000);
  }, [t]);

  useEffect(
    () => () => {
      if (errorTimerRef.current !== null) window.clearTimeout(errorTimerRef.current);
    },
    [],
  );

  // The chapter is one file, so the source changes only on navigation. Restore
  // the persisted position once metadata is available, for both local and R2.
  useEffect(() => {
    const element = audioRef.current;
    if (!element || !audio.audioUrl) return;

    const restore = () => {
      if (Number.isFinite(element.duration) && element.duration > 0) {
        setAudioDuration(element.duration);
      }
      const limit = element.duration || audio.duration;
      element.currentTime =
        limit > 0 ? Math.min(resumeTimeRef.current, limit) : resumeTimeRef.current;
    };
    element.load();
    if (element.readyState >= 1) restore();
    else element.addEventListener("loadedmetadata", restore, { once: true });
    return () => element.removeEventListener("loadedmetadata", restore);
  }, [audio.audioUrl, audio.duration]);

  // Store actions are also used by the scrubber, keyboard shortcuts, and section
  // sync. Reflect those state changes in the native element so seeking never
  // becomes a visual-only update.
  useEffect(() => {
    const element = audioRef.current;
    if (!element || !audio.audioUrl || !Number.isFinite(audio.currentTime)) return;
    if (Math.abs(element.currentTime - audio.currentTime) < 0.25) return;
    try {
      element.currentTime = audio.currentTime;
    } catch {
      // Browsers can reject a seek before media metadata is available; the
      // source-loading effect will restore the same position after metadata.
    }
  }, [audio.audioUrl, audio.currentTime]);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) return;
    element.volume = audio.volume;
    element.playbackRate = audio.playbackRate;
  }, [audio.playbackRate, audio.volume]);

  // The store owns intent; this effect translates it into native media state.
  // A rejected play promise is surfaced as the same graceful-degradation toast
  // as a missing file, and the store returns to the paused state.
  useEffect(() => {
    const element = audioRef.current;
    if (!element || !audio.audioUrl) return;
    if (!audio.isPlaying) {
      element.pause();
      return;
    }

    const start = () => {
      void element.play().catch(() => {
        pauseAudio();
        announceError();
      });
    };
    if (element.readyState >= 1) start();
    else element.addEventListener("loadedmetadata", start, { once: true });
    return () => element.removeEventListener("loadedmetadata", start);
  }, [announceError, audio.audioUrl, audio.isPlaying]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Child controls (buttons, the scrubber) keep their own key semantics.
    if (event.target !== event.currentTarget) return;
    let handled = true;
    switch (event.key) {
      case " ":
      case "Spacebar":
        audio.isPlaying ? pauseAudio() : playAudio();
        break;
      case "ArrowLeft":
        seekAudio(audio.currentTime - 5);
        break;
      case "ArrowRight":
        seekAudio(audio.currentTime + 5);
        break;
      case "[":
        skipAudioSection(-1);
        break;
      case "]":
        skipAudioSection(1);
        break;
      case "Escape":
        closeAudio();
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
        setAudioPlaybackRate(AUDIO_PLAYBACK_RATES[Number(event.key) - 1]);
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  };

  if (!isMounted) return null;

  const label = activeSection?.title ?? t("audio.intro");
  const timeLabel = `${formatAudioTime(audio.currentTime)} / ${formatAudioTime(audio.duration)}`;
  const sectionPosition =
    audio.sections.length > 1 && activeIndex >= 0
      ? `${activeIndex + 1}/${audio.sections.length}`
      : null;

  return (
    <div
      // The bottom-left ToC and bottom-right settings buttons own the bottom row
      // (bottom-5, 3rem tall), so on narrow screens the player sits in its own
      // row above them; from `sm` it becomes a centered pill on that same row,
      // inset horizontally to clear both buttons.
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 print:hidden sm:inset-x-0 sm:bottom-5 sm:flex sm:justify-center sm:px-20"
    >
      {/* biome-ignore lint/a11y/useSemanticElements: A group of media controls is not a native element; role/keyboard semantics are provided explicitly. */}
      <div
        role="group"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: The custom keyboard shortcut group is intentionally focusable.
        tabIndex={0}
        aria-label={t("audio.player")}
        aria-keyshortcuts="Space ArrowLeft ArrowRight [ ] Escape 1 2 3 4 5"
        onKeyDown={handleKeyDown}
        className="relative flex w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-border bg-void/90 px-2.5 py-2 text-foreground shadow-2xl backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 sm:w-[min(46rem,100%)] sm:flex-nowrap sm:rounded-full sm:px-3"
        style={{ boxShadow: "0 12px 40px -16px color-mix(in oklab, var(--cyan) 55%, transparent)" }}
      >
        {/* The chapter transcript is the caption surface for this hidden media element. */}
        {/* biome-ignore lint/a11y/useMediaCaption: The visible chapter transcript captions this implementation-only audio element. */}
        <audio
          ref={audioRef}
          src={audio.audioUrl ?? undefined}
          preload="metadata"
          className="hidden"
          aria-label={label}
          onTimeUpdate={(event) => seekAudio(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration)}
          onEnded={() => {
            pauseAudio();
            seekAudio(0);
          }}
          onError={announceError}
        />

        {/* Transport. Order utilities let one DOM order serve both layouts:
            mobile wraps to [transport | label | close] then the scrubber row,
            while `sm` puts the scrubber before the close button in one row. */}
        <div className="order-1 flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label={audio.isPlaying ? t("audio.pause") : t("audio.play")}
            title={audio.isPlaying ? t("audio.pause") : t("audio.play")}
            onClick={() => (audio.isPlaying ? pauseAudio() : playAudio())}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-cyan text-void transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
          >
            {audio.isPlaying ? (
              <Pause size={15} fill="currentColor" aria-hidden />
            ) : (
              <Play size={15} fill="currentColor" aria-hidden />
            )}
          </button>
          <button
            type="button"
            aria-label={t("audio.prevSection")}
            title={t("audio.prevSection")}
            onClick={() => skipAudioSection(-1)}
            className="hidden size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 sm:grid"
          >
            <SkipBack size={15} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={t("audio.nextSection")}
            title={t("audio.nextSection")}
            onClick={() => skipAudioSection(1)}
            className="hidden size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 sm:grid"
          >
            <SkipForward size={15} aria-hidden />
          </button>
        </div>

        {/* Fixed-basis label: the section title changes while scrubbing, so it
            gets a reserved width and truncates instead of resizing the pill. */}
        <p className="order-2 min-w-0 flex-1 truncate font-sans text-xs text-foreground/85 sm:w-44 sm:flex-none">
          {sectionPosition ? (
            <span className="mr-1.5 font-mono text-[0.65rem] text-subtle">{sectionPosition}</span>
          ) : null}
          {label}
        </p>

        <div className="order-4 flex w-full min-w-0 items-center gap-2 sm:order-5 sm:w-auto sm:flex-1">
          <AudioScrubber
            duration={audio.duration}
            currentTime={audio.currentTime}
            sections={audio.sections}
            activeIndex={activeIndex}
            onSeek={seekAudio}
            ariaLabel={t("audio.currentTime")}
            valueText={timeLabel}
            className="sm:min-w-32"
          />
          <span className="shrink-0 font-mono text-[0.65rem] tabular-nums text-muted" aria-hidden>
            {timeLabel}
          </span>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={t("audio.speed")}
                title={t("audio.speed")}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-1.5 text-xs text-muted transition-colors hover:bg-surface hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
              >
                <Gauge size={14} aria-hidden />
                <span className="font-mono">{audio.playbackRate}x</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="end"
              sideOffset={10}
              collisionPadding={12}
              className="w-52 border-border bg-void/97 p-3"
            >
              <p className="mb-2 font-sans text-[0.65rem] uppercase tracking-wider text-subtle">
                {t("audio.speed")}
              </p>
              <fieldset className="grid grid-cols-5 gap-1">
                <legend className="sr-only">{t("audio.speed")}</legend>
                {AUDIO_PLAYBACK_RATES.map((rate) => (
                  <button
                    type="button"
                    key={rate}
                    aria-pressed={audio.playbackRate === rate}
                    onClick={() => setAudioPlaybackRate(rate)}
                    className={cn(
                      "rounded-md px-1 py-1.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50",
                      audio.playbackRate === rate
                        ? "bg-cyan text-void"
                        : "text-muted hover:bg-surface hover:text-foreground",
                    )}
                  >
                    {rate}x
                  </button>
                ))}
              </fieldset>
              <button
                type="button"
                role="switch"
                aria-checked={audio.followReading}
                onClick={() => setAudioFollowReading(!audio.followReading)}
                className="mt-3 flex w-full items-center justify-between border-t border-border pt-3 text-left font-sans text-xs text-muted transition-colors hover:text-foreground"
              >
                <span>{t("audio.followReading")}</span>
                <span
                  className={cn(
                    "size-2 rounded-full",
                    audio.followReading ? "bg-cyan" : "bg-subtle",
                  )}
                  aria-hidden
                />
              </button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Close is the last control in both layouts: end of the transport row on
            mobile (order 3, before the wrapped scrubber), end of the pill on `sm`. */}
        <button
          type="button"
          aria-label={t("audio.close")}
          title={t("audio.close")}
          onClick={() => closeAudio()}
          className="order-3 grid size-8 shrink-0 place-items-center rounded-full text-subtle transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 sm:order-6"
        >
          <X size={15} aria-hidden />
        </button>

        {error ? (
          <output
            aria-live="polite"
            className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-void/95 px-3 py-1.5 font-sans text-xs text-foreground shadow-xl"
          >
            {error}
          </output>
        ) : null}
      </div>
    </div>
  );
}
