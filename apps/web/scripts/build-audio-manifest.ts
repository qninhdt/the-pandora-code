import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { type Locale, locales } from "../i18n/config";
import type { AudioSection, ChapterAudio } from "../lib/content/loader/audio-loader";
import { staticUrl } from "../lib/static-url";

const WEB_ROOT = path.resolve(process.cwd());
const REPO_ROOT = path.resolve(WEB_ROOT, "../..");
const AUDIO_ROOT = path.resolve(process.env.PANDORA_AUDIO_ROOT ?? path.join(REPO_ROOT, "tts-out"));
const MANIFEST_PATH = path.join(WEB_ROOT, "lib/content/loader/audio-manifest.json");
const LOCAL_AUDIO_ROOT = path.join(WEB_ROOT, "public/audio");

export interface AudioManifest {
  chapters: Record<string, Partial<Record<Locale, ChapterAudio>>>;
}

export interface BuildAudioManifestOptions {
  audioRoot?: string;
  manifestPath?: string;
  localAudioRoot?: string | null;
}

/** Section markers emitted beside the chapter MP3 by the TTS pipeline. */
interface SectionSidecar {
  duration?: number;
  sections?: Array<{ sectionId?: unknown; title?: unknown; start?: unknown; end?: unknown }>;
}

function readWavDuration(file: string): number | null {
  if (!fs.existsSync(file)) return null;
  const buffer = fs.readFileSync(file);
  if (buffer.subarray(0, 4).toString() !== "RIFF" || buffer.subarray(8, 12).toString() !== "WAVE") {
    return null;
  }

  let offset = 12;
  let byteRate: number | undefined;
  let dataBytes: number | undefined;
  while (offset + 8 <= buffer.length) {
    const chunk = buffer.subarray(offset, offset + 4).toString();
    const size = buffer.readUInt32LE(offset + 4);
    if (chunk === "fmt " && size >= 16 && offset + 8 + size <= buffer.length) {
      byteRate = buffer.readUInt32LE(offset + 8 + 8);
    }
    if (chunk === "data") {
      dataBytes = Math.min(size, buffer.length - offset - 8);
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (!byteRate || !dataBytes) return null;
  return dataBytes / byteRate;
}

function probeDuration(file: string): number | null {
  try {
    const output = execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        file,
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const duration = Number.parseFloat(output.trim());
    if (Number.isFinite(duration) && duration >= 0) return duration;
  } catch {
    // CI/build environments may not install ffprobe. The TTS pipeline keeps the
    // source WAV beside each MP3, so use its PCM header as a fallback.
  }
  return readWavDuration(file.replace(/\.mp3$/i, ".wav"));
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function chapterDirectories(
  root: string,
): Array<{ slug: string; locale: Locale; directory: string }> {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) return [];
    const match = /^(.+)\.(en|vi)$/.exec(entry.name);
    if (!match || !locales.includes(match[2] as Locale)) return [];
    return [{ slug: match[1], locale: match[2] as Locale, directory: path.join(root, entry.name) }];
  });
}

function normalizeSections(sidecar: SectionSidecar, duration: number): AudioSection[] {
  const sections = (sidecar.sections ?? []).flatMap((section): AudioSection[] => {
    if (typeof section.sectionId !== "string" || typeof section.start !== "number") return [];
    if (!Number.isFinite(section.start) || section.start < 0) return [];
    const start = Math.min(section.start, duration);
    const rawEnd =
      typeof section.end === "number" && Number.isFinite(section.end) ? section.end : duration;
    const end = Math.min(rawEnd, duration);
    if (end <= start) return [];
    return [
      {
        sectionId: section.sectionId,
        title: typeof section.title === "string" ? section.title : null,
        start: round(start),
        end: round(end),
      },
    ];
  });
  return sections.sort((left, right) => left.start - right.start);
}

function readExistingManifest(file: string): AudioManifest {
  const manifest: AudioManifest = { chapters: {} };
  if (!fs.existsSync(file)) return manifest;
  try {
    const value = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
    const chapters = value.chapters;
    if (typeof chapters !== "object" || chapters === null || Array.isArray(chapters))
      return manifest;
    for (const [slug, chapterValue] of Object.entries(chapters as Record<string, unknown>)) {
      if (
        typeof chapterValue !== "object" ||
        chapterValue === null ||
        Array.isArray(chapterValue)
      ) {
        continue;
      }
      for (const locale of locales) {
        const entry = (chapterValue as Record<string, unknown>)[locale];
        if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
        const candidate = entry as Record<string, unknown>;
        if (typeof candidate.audioUrl !== "string" || typeof candidate.duration !== "number")
          continue;
        if (!Number.isFinite(candidate.duration) || candidate.duration <= 0) continue;
        const sections = normalizeSections(candidate as SectionSidecar, candidate.duration);
        if (sections.length === 0) continue;
        manifest.chapters[slug] ??= {};
        manifest.chapters[slug][locale] = {
          audioUrl: staticUrl(candidate.audioUrl),
          duration: round(candidate.duration),
          sections,
        };
      }
    }
  } catch {
    return { chapters: {} };
  }
  return manifest;
}

function mirrorLocalAudio(
  source: string,
  slug: string,
  locale: Locale,
  file: string,
  localAudioRoot: string | null,
): void {
  if (!localAudioRoot || process.env.NEXT_PUBLIC_STATIC_BASE?.trim()) return;
  const destination = path.join(localAudioRoot, "chapters", slug, locale, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (!fs.existsSync(destination) || fs.statSync(destination).size !== fs.statSync(source).size) {
    fs.copyFileSync(source, destination);
  }
}

export function buildAudioManifest(options: BuildAudioManifestOptions = {}): AudioManifest {
  const audioRoot = options.audioRoot ?? AUDIO_ROOT;
  const manifestPath = options.manifestPath ?? MANIFEST_PATH;
  const localAudioRoot =
    options.localAudioRoot !== undefined
      ? options.localAudioRoot
      : options.audioRoot === undefined
        ? LOCAL_AUDIO_ROOT
        : null;

  // Production builds may have the committed manifest but not the local render
  // working tree. Keep that manifest intact so R2-backed audio stays
  // discoverable; a populated local audio root still regenerates it below.
  const manifest = readExistingManifest(manifestPath);
  const directories = chapterDirectories(audioRoot);

  for (const { slug, locale, directory } of directories) {
    const mp3File = path.join(directory, `${slug}.${locale}.mp3`);
    const sidecarFile = path.join(directory, `${slug}.${locale}.sections.json`);
    if (!fs.existsSync(mp3File) || !fs.existsSync(sidecarFile)) {
      console.warn(`[audio-manifest] Skipping ${slug}/${locale}: missing chapter MP3 or markers`);
      continue;
    }

    const sidecar = JSON.parse(fs.readFileSync(sidecarFile, "utf8")) as SectionSidecar;
    const duration = probeDuration(mp3File) ?? sidecar.duration ?? null;
    if (duration === null || !Number.isFinite(duration) || duration <= 0) {
      throw new Error(
        `Unable to determine audio duration for ${mp3File}; install ffprobe or keep its WAV source`,
      );
    }
    const sections = normalizeSections(sidecar, duration);
    if (sections.length === 0) {
      console.warn(`[audio-manifest] Skipping ${slug}/${locale}: no usable section markers`);
      continue;
    }

    manifest.chapters[slug] ??= {};
    manifest.chapters[slug][locale] = {
      audioUrl: staticUrl(`/audio/chapters/${slug}/${locale}/${path.basename(mp3File)}`),
      duration: round(duration),
      sections,
    };
    mirrorLocalAudio(mp3File, slug, locale, path.basename(mp3File), localAudioRoot);
  }

  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const result = buildAudioManifest();
  const tracks = Object.values(result.chapters).reduce(
    (count, chapter) => count + Object.keys(chapter).length,
    0,
  );
  const markers = Object.values(result.chapters).reduce(
    (count, chapter) =>
      count + Object.values(chapter).reduce((sum, entry) => sum + (entry?.sections.length ?? 0), 0),
    0,
  );
  console.log(
    `[audio-manifest] Built: ${Object.keys(result.chapters).length} chapter(s), ${tracks} track(s), ${markers} section marker(s).`,
  );
}
