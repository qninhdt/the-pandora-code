import manifest from "./audio-manifest.json";

/** A labelled span inside the single chapter track. */
export interface AudioSection {
  sectionId: string;
  title: string | null;
  /** Seconds from the start of the chapter track. */
  start: number;
  /** Seconds from the start of the chapter track, exclusive. */
  end: number;
}

export interface ChapterAudio {
  audioUrl: string;
  duration: number;
  sections: AudioSection[];
}

interface AudioManifest {
  chapters: Record<string, Partial<Record<"en" | "vi", ChapterAudio>>>;
}

function isPositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

// Markers are sorted and clamped here rather than trusted from the manifest so
// a partially regenerated sidecar can never make the player seek backwards.
function normalizeSections(value: unknown, duration: number): AudioSection[] {
  if (!Array.isArray(value)) return [];
  const sections = value.flatMap((section): AudioSection[] => {
    if (typeof section !== "object" || section === null) return [];
    const candidate = section as Record<string, unknown>;
    if (typeof candidate.sectionId !== "string" || !isPositive(candidate.start)) return [];
    const start = Math.min(candidate.start, duration);
    const end = isPositive(candidate.end) ? Math.min(candidate.end, duration) : duration;
    if (end <= start) return [];
    return [
      {
        sectionId: candidate.sectionId,
        title: typeof candidate.title === "string" ? candidate.title : null,
        start,
        end,
      },
    ];
  });
  return sections.sort((left, right) => left.start - right.start);
}

/**
 * Resolve the pre-built chapter track. Missing or malformed entries
 * intentionally return null so chapters can ship before their audio.
 */
export function getChapterAudio(slug: string, locale: "en" | "vi"): ChapterAudio | null {
  const entry = (manifest as AudioManifest).chapters?.[slug]?.[locale] as
    | Record<string, unknown>
    | undefined;
  if (!entry || typeof entry.audioUrl !== "string" || !isPositive(entry.duration)) return null;
  const sections = normalizeSections(entry.sections, entry.duration);
  if (sections.length === 0) return null;
  return { audioUrl: entry.audioUrl, duration: entry.duration, sections };
}
