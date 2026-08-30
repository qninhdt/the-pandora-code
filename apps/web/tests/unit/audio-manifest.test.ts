import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildAudioManifest } from "@/scripts/build-audio-manifest";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllEnvs());

function writeOneSecondWav(file: string) {
  const sampleRate = 8_000;
  const dataBytes = sampleRate * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);
  fs.writeFileSync(file, buffer);
}

describe("buildAudioManifest", () => {
  it("reads the chapter track plus its markers and falls back to WAV duration", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "pandora-audio-manifest-"));
    const slug = "sample-chapter";
    const audioDir = path.join(root, `${slug}.vi`);
    const manifestPath = path.join(root, "audio-manifest.json");
    fs.mkdirSync(audioDir);
    // An unreadable MP3 forces the WAV-header fallback used on ffprobe-less CI.
    fs.writeFileSync(path.join(audioDir, `${slug}.vi.mp3`), "not-an-mp3");
    writeOneSecondWav(path.join(audioDir, `${slug}.vi.wav`));
    fs.writeFileSync(
      path.join(audioDir, `${slug}.vi.sections.json`),
      JSON.stringify({
        duration: 1,
        sections: [
          { sectionId: "sec-00", title: null, start: 0, end: 0.4 },
          { sectionId: "sec-01", title: "First", start: 0.4, end: 9 },
        ],
      }),
    );
    vi.stubEnv("NEXT_PUBLIC_STATIC_BASE", "https://cdn.example.com");

    try {
      const manifest = buildAudioManifest({ audioRoot: root, manifestPath });
      expect(manifest.chapters[slug]?.vi).toEqual({
        audioUrl: `https://cdn.example.com/audio/chapters/${slug}/vi/${slug}.vi.mp3`,
        duration: 1,
        // The out-of-range marker end is clamped to the real track duration.
        sections: [
          { sectionId: "sec-00", title: null, start: 0, end: 0.4 },
          { sectionId: "sec-01", title: "First", start: 0.4, end: 1 },
        ],
      });
      expect(JSON.parse(fs.readFileSync(manifestPath, "utf8"))).toEqual(manifest);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("skips a chapter whose markers are missing", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "pandora-audio-manifest-"));
    const audioDir = path.join(root, "sample.vi");
    const manifestPath = path.join(root, "audio-manifest.json");
    fs.mkdirSync(audioDir);
    fs.writeFileSync(path.join(audioDir, "sample.vi.mp3"), "not-an-mp3");

    try {
      expect(buildAudioManifest({ audioRoot: root, manifestPath })).toEqual({ chapters: {} });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps an existing manifest when a production build has no local audio root", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "pandora-audio-manifest-"));
    const manifestPath = path.join(root, "audio-manifest.json");
    const existing = {
      chapters: {
        sample: {
          en: {
            audioUrl: "/audio/chapters/sample/en/sample.en.mp3",
            duration: 10,
            sections: [{ sectionId: "sec-00", title: null, start: 0, end: 10 }],
          },
        },
      },
    };
    fs.writeFileSync(manifestPath, `${JSON.stringify(existing)}\n`);
    vi.stubEnv("NEXT_PUBLIC_STATIC_BASE", "https://cdn.example.com");
    const expected = {
      chapters: {
        sample: {
          en: {
            ...existing.chapters.sample.en,
            audioUrl: "https://cdn.example.com/audio/chapters/sample/en/sample.en.mp3",
          },
        },
      },
    };

    try {
      expect(buildAudioManifest({ audioRoot: path.join(root, "missing"), manifestPath })).toEqual(
        expected,
      );
      expect(fs.readFileSync(manifestPath, "utf8")).toBe(`${JSON.stringify(expected, null, 2)}\n`);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
