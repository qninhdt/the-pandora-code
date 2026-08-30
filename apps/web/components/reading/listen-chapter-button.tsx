"use client";

import { openAudio, useAudioState } from "@/lib/engagement/audio-store";
import { Headphones } from "lucide-react";
import { useTranslations } from "next-intl";

function formatMinutes(seconds: number): number {
  return Math.max(1, Math.round(seconds / 60));
}

/**
 * Hero action that reveals the chapter player. The player itself stays hidden
 * until this is pressed, so audio is opt-in rather than a permanent overlay.
 * Icon-only: the headphones plus the run time say "listen" without a caption.
 */
export function ListenChapterButton() {
  const audio = useAudioState();
  const t = useTranslations();
  if (!audio.audioUrl) return null;

  return (
    <button
      type="button"
      onClick={() => openAudio()}
      aria-label={t("audio.listenChapter")}
      title={t("audio.listenChapter")}
      className="inline-flex items-center gap-1.5 rounded-full border border-cyan/45 bg-void/60 px-2.5 py-1.5 font-sans text-xs text-cyan transition-colors hover:border-cyan hover:bg-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
    >
      <Headphones size={14} aria-hidden />
      {audio.duration > 0 ? (
        <span className="font-mono text-[0.65rem] text-cyan/80">
          {t("audio.listenMinutes", { minutes: formatMinutes(audio.duration) })}
        </span>
      ) : null}
    </button>
  );
}
