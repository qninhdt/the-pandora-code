"use client";

import type { Locale } from "@/i18n/config";
import type { AudioSection, ChapterAudio } from "@/lib/content/loader/audio-loader";
import {
  READER_STORAGE_KEYS,
  clampNumber,
  finiteNumber,
  isRecord,
  readReaderStorage,
  safeString,
  writeReaderStorage,
} from "./storage";
import { createReaderStore, useReaderStore } from "./use-reader-store";

export const AUDIO_PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
export type AudioPlaybackRate = (typeof AUDIO_PLAYBACK_RATES)[number];

export interface AudioPlayerState {
  chapterSlug: string | null;
  chapterLocale: Locale | null;
  /** The single chapter track; null until a chapter with audio is loaded. */
  audioUrl: string | null;
  duration: number;
  /** Labelled spans inside that track, used for the segmented scrubber. */
  sections: AudioSection[];
  currentTime: number;
  isPlaying: boolean;
  /** The player is a reader-invoked surface: hidden until explicitly opened. */
  isOpen: boolean;
  playbackRate: AudioPlaybackRate;
  volume: number;
}

const EMPTY_AUDIO_STATE: AudioPlayerState = {
  chapterSlug: null,
  chapterLocale: null,
  audioUrl: null,
  duration: 0,
  sections: [],
  currentTime: 0,
  isPlaying: false,
  isOpen: false,
  playbackRate: 1,
  volume: 1,
};

let activeTrack: ChapterAudio | null = null;
let activeChapterKey: string | null = null;

function chapterKey(slug: string | null, locale: Locale | null): string | null {
  return slug && locale ? `${locale}\u0000${slug}` : null;
}

function nearestPlaybackRate(value: unknown): AudioPlaybackRate {
  if (!finiteNumber(value)) return EMPTY_AUDIO_STATE.playbackRate;
  return AUDIO_PLAYBACK_RATES.reduce((best, rate) =>
    Math.abs(rate - value) < Math.abs(best - value) ? rate : best,
  );
}

function normalizePersistedState(
  value: unknown,
): Pick<
  AudioPlayerState,
  "chapterSlug" | "chapterLocale" | "currentTime" | "playbackRate" | "volume"
> {
  if (!isRecord(value)) {
    return {
      chapterSlug: null,
      chapterLocale: null,
      currentTime: 0,
      playbackRate: EMPTY_AUDIO_STATE.playbackRate,
      volume: EMPTY_AUDIO_STATE.volume,
    };
  }
  const locale =
    value.chapterLocale === "en" || value.chapterLocale === "vi" ? value.chapterLocale : null;
  return {
    chapterSlug: safeString(value.chapterSlug, 180),
    chapterLocale: locale,
    currentTime: clampNumber(value.currentTime, 0, 86_400_000, 0),
    playbackRate: nearestPlaybackRate(value.playbackRate),
    volume: clampNumber(value.volume, 0, 1, EMPTY_AUDIO_STATE.volume),
  };
}

function readAudioState(): AudioPlayerState {
  const persisted = readReaderStorage(
    READER_STORAGE_KEYS.audio,
    (value) => normalizePersistedState(value),
    normalizePersistedState(null),
  );
  const track =
    chapterKey(persisted.chapterSlug, persisted.chapterLocale) === activeChapterKey
      ? activeTrack
      : null;
  const duration = track?.duration ?? 0;
  return {
    ...EMPTY_AUDIO_STATE,
    ...persisted,
    audioUrl: track?.audioUrl ?? null,
    sections: track?.sections ?? [],
    duration,
    currentTime: duration > 0 ? Math.min(persisted.currentTime, duration) : persisted.currentTime,
  };
}

// Neither playback intent nor visibility is persisted: reopening a chapter must
// never start audio the reader did not ask for on this visit.
function persistAudioState(state: AudioPlayerState): boolean {
  return writeReaderStorage(READER_STORAGE_KEYS.audio, {
    chapterSlug: state.chapterSlug,
    chapterLocale: state.chapterLocale,
    currentTime: state.currentTime,
    playbackRate: state.playbackRate,
    volume: state.volume,
  });
}

const audioStore = createReaderStore<AudioPlayerState>({
  key: READER_STORAGE_KEYS.audio,
  fallback: EMPTY_AUDIO_STATE,
  read: readAudioState,
  write: persistAudioState,
  mergeExternal: (current, persisted) => {
    const persistedKey = chapterKey(persisted.chapterSlug, persisted.chapterLocale);
    // A second tab can remember another chapter, but this tab's page has the
    // only track it can play. Keep the active page stable until its own
    // navigation supplies the corresponding manifest entry.
    if (activeChapterKey && persistedKey !== activeChapterKey) return current;
    const sameChapter =
      current.chapterSlug === persisted.chapterSlug &&
      current.chapterLocale === persisted.chapterLocale;
    return {
      ...persisted,
      audioUrl: sameChapter ? current.audioUrl : persisted.audioUrl,
      sections: sameChapter && current.sections.length > 0 ? current.sections : persisted.sections,
      duration: sameChapter ? current.duration : persisted.duration,
      isPlaying: sameChapter ? current.isPlaying : false,
      isOpen: sameChapter ? current.isOpen : false,
    };
  },
  equals: (left, right) =>
    left.chapterSlug === right.chapterSlug &&
    left.chapterLocale === right.chapterLocale &&
    left.audioUrl === right.audioUrl &&
    left.sections === right.sections &&
    left.currentTime === right.currentTime &&
    left.duration === right.duration &&
    left.isPlaying === right.isPlaying &&
    left.isOpen === right.isOpen &&
    left.playbackRate === right.playbackRate &&
    left.volume === right.volume,
});

export function getAudioState(): AudioPlayerState {
  audioStore.hydrate();
  return audioStore.getSnapshot();
}

export function useAudioState(): AudioPlayerState {
  return useReaderStore(audioStore);
}

/** Index of the marker containing `time`, or -1 when the track has no markers. */
export function sectionIndexAt(sections: AudioSection[], time: number): number {
  if (sections.length === 0) return -1;
  for (let index = sections.length - 1; index >= 0; index -= 1) {
    if (time >= sections[index].start) return index;
  }
  return 0;
}

/**
 * Point the store at a chapter's track. Passing null clears audio, which is how
 * navigating to a chapter without audio (or to any other page) hides the player.
 */
export function loadAudio(chapterSlug: string, chapterLocale: Locale, track: ChapterAudio | null) {
  audioStore.hydrate();
  const current = audioStore.getSnapshot();
  const sameChapter =
    current.chapterSlug === chapterSlug && current.chapterLocale === chapterLocale;
  activeTrack = track;
  activeChapterKey = track ? chapterKey(chapterSlug, chapterLocale) : null;

  if (!track) {
    audioStore.update(EMPTY_AUDIO_STATE);
    return;
  }

  const currentTime = sameChapter ? Math.min(Math.max(current.currentTime, 0), track.duration) : 0;
  audioStore.update({
    ...current,
    chapterSlug,
    chapterLocale,
    audioUrl: track.audioUrl,
    duration: track.duration,
    sections: track.sections,
    currentTime,
    isPlaying: sameChapter ? current.isPlaying : false,
    isOpen: sameChapter ? current.isOpen : false,
  });
}

export function clearAudio() {
  activeTrack = null;
  activeChapterKey = null;
  const current = getAudioState();
  if (!current.chapterSlug && !current.audioUrl && !current.isOpen) return;
  audioStore.update(EMPTY_AUDIO_STATE);
}

/** Reveal the player. Opening is the reader's explicit request to listen. */
export function openAudio(play = true) {
  const current = getAudioState();
  if (!current.audioUrl) return;
  audioStore.update({ ...current, isOpen: true, isPlaying: play });
}

export function closeAudio() {
  const current = getAudioState();
  if (!current.isOpen && !current.isPlaying) return;
  audioStore.update({ ...current, isOpen: false, isPlaying: false });
}

export function playAudio() {
  const current = getAudioState();
  if (current.audioUrl) audioStore.update({ ...current, isOpen: true, isPlaying: true });
}

export function pauseAudio() {
  const current = getAudioState();
  if (current.isPlaying) audioStore.update({ ...current, isPlaying: false });
}

export function toggleAudio() {
  const current = getAudioState();
  if (!current.audioUrl) return;
  audioStore.update({ ...current, isOpen: true, isPlaying: !current.isPlaying });
}

export function seekAudio(time: number) {
  const current = getAudioState();
  audioStore.update({
    ...current,
    currentTime: clampNumber(time, 0, current.duration, 0),
  });
}

/** Seek to the start of a marker; out-of-range indices clamp to the track. */
export function goToAudioSection(index: number) {
  const current = getAudioState();
  if (current.sections.length === 0) return;
  const nextIndex = Math.min(Math.max(Math.trunc(index), 0), current.sections.length - 1);
  audioStore.update({ ...current, currentTime: current.sections[nextIndex].start });
}

export function skipAudioSection(delta: number) {
  const current = getAudioState();
  const index = sectionIndexAt(current.sections, current.currentTime);
  if (index < 0) return;
  goToAudioSection(index + Math.trunc(delta));
}

export function setAudioDuration(duration: number) {
  const current = getAudioState();
  if (!Number.isFinite(duration) || duration <= 0) return;
  audioStore.update({
    ...current,
    duration,
    currentTime: Math.min(current.currentTime, duration),
  });
}

export function setAudioPlaybackRate(rate: number) {
  const current = getAudioState();
  audioStore.update({ ...current, playbackRate: nearestPlaybackRate(rate) });
}

export function setAudioVolume(volume: number) {
  const current = getAudioState();
  audioStore.update({ ...current, volume: clampNumber(volume, 0, 1, current.volume) });
}

export function resetAudioState() {
  activeTrack = null;
  activeChapterKey = null;
  audioStore.reset();
}

// Short action names mirror the state contract used by the player design while
// the explicit Audio suffix keeps call sites self-documenting alongside the
// other reader stores.
export const load = loadAudio;
export const play = playAudio;
export const pause = pauseAudio;
export const toggle = toggleAudio;
export const seek = seekAudio;
export const skipSection = skipAudioSection;
export const goToSection = goToAudioSection;
export const setPlaybackRate = setAudioPlaybackRate;
export const setVolume = setAudioVolume;

export { EMPTY_AUDIO_STATE };
