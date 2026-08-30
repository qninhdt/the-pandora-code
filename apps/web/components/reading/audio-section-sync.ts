"use client";

import type { Locale } from "@/i18n/config";
import type { ChapterAudio } from "@/lib/content/loader/audio-loader";
import {
  clearAudio,
  loadAudio,
  sectionIndexAt,
  seekAudio,
  useAudioState,
} from "@/lib/engagement/audio-store";
import { useEffect, useMemo, useState } from "react";
import type { TocHeading } from "./table-of-contents";

/** Scroll-spy shared by the visible table of contents and audio follow mode. */
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

function sectionOrdinal(sectionId: string): number | null {
  const match = /^sec-(\d+)$/.exec(sectionId);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

function chapterHeadings(headings: TocHeading[]): TocHeading[] {
  return headings.filter((heading) => heading.depth === 2);
}

/** Maps each audio section id to its corresponding top-level chapter heading. */
export function buildAudioHeadingMap(
  headings: TocHeading[],
  sectionIds: string[],
): Map<string, string> {
  const topLevel = chapterHeadings(headings);
  return new Map(
    sectionIds.flatMap((sectionId) => {
      const ordinal = sectionOrdinal(sectionId);
      const heading = ordinal === null || ordinal === 0 ? undefined : topLevel[ordinal - 1];
      return heading ? [[sectionId, heading.id] as const] : [];
    }),
  );
}

/** Marker index whose section corresponds to the given heading, or -1. */
export function audioIndexForHeading(
  headings: TocHeading[],
  sectionIds: string[],
  activeHeading: string,
): number {
  const headingPosition = headings.findIndex((heading) => heading.id === activeHeading);
  if (headingPosition < 0) return -1;

  let ordinal = 0;
  for (let index = 0; index <= headingPosition; index += 1) {
    if (headings[index].depth === 2) ordinal += 1;
  }
  if (ordinal === 0) return -1;
  return sectionIds.findIndex((sectionId) => sectionOrdinal(sectionId) === ordinal);
}

export function useAudioSectionSync(
  chapterSlug: string,
  chapterLocale: Locale,
  headings: TocHeading[],
  track: ChapterAudio | null,
) {
  const activeHeading = useActiveHeading(headings);
  const audio = useAudioState();
  const sectionIds = useMemo(() => audio.sections.map((s) => s.sectionId), [audio.sections]);
  const headingMap = useMemo(
    () => buildAudioHeadingMap(headings, sectionIds),
    [headings, sectionIds],
  );

  // Clearing on unmount is what keeps the player off every non-chapter page.
  useEffect(() => {
    loadAudio(chapterSlug, chapterLocale, track);
    return () => clearAudio();
  }, [chapterLocale, chapterSlug, track]);

  // Follow mode maps the heading being read onto the matching marker. Playback
  // position drives the label, so no separate section selection is needed.
  useEffect(() => {
    if (!audio.followReading || !activeHeading || audio.sections.length === 0) return;
    const index = audioIndexForHeading(headings, sectionIds, activeHeading);
    if (index < 0) return;
    if (index === sectionIndexAt(audio.sections, audio.currentTime)) return;
    seekAudio(audio.sections[index].start);
  }, [activeHeading, audio.currentTime, audio.followReading, audio.sections, headings, sectionIds]);

  return headingMap;
}

interface AudioSectionSyncProps {
  chapterSlug: string;
  chapterLocale: Locale;
  headings: TocHeading[];
  track: ChapterAudio | null;
}

/** Client-only page bridge that loads chapter audio and keeps it aligned. */
export function AudioSectionSync({
  chapterSlug,
  chapterLocale,
  headings,
  track,
}: AudioSectionSyncProps): null {
  useAudioSectionSync(chapterSlug, chapterLocale, headings, track);
  return null;
}
