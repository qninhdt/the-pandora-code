"use client";

import type { Locale } from "@/i18n/config";
import type { ChapterAudio } from "@/lib/content/loader/audio-loader";
import { clearAudio, loadAudio } from "@/lib/engagement/audio-store";
import { useEffect, useState } from "react";
import type { TocHeading } from "./table-of-contents";

/** Scroll-spy used by the visible table of contents. */
export function useActiveHeading(headings: TocHeading[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((acc, current) =>
            current.boundingClientRect.top < acc.boundingClientRect.top ? current : acc,
          );
          setActive(topmost.target.id);
        }
      },
      { rootMargin: "-80px 0% -70% 0%", threshold: [0, 1] },
    );
    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings]);

  return active;
}

export function useAudioSectionSync(
  chapterSlug: string,
  chapterLocale: Locale,
  track: ChapterAudio | null,
) {
  // Clearing on unmount is what keeps the player off every non-chapter page.
  useEffect(() => {
    loadAudio(chapterSlug, chapterLocale, track);
    return () => clearAudio();
  }, [chapterLocale, chapterSlug, track]);
}

interface AudioSectionSyncProps {
  chapterSlug: string;
  chapterLocale: Locale;
  track: ChapterAudio | null;
}

/** Client-only page bridge that loads chapter audio and keeps it aligned. */
export function AudioSectionSync({
  chapterSlug,
  chapterLocale,
  track,
}: AudioSectionSyncProps): null {
  useAudioSectionSync(chapterSlug, chapterLocale, track);
  return null;
}
