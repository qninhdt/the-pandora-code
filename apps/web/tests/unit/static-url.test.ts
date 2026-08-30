import { staticUrl } from "@/lib/static-url";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllEnvs());

describe("staticUrl", () => {
  it("keeps local public paths when no static origin is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_STATIC_BASE", "");
    expect(staticUrl("/images/chapters/sample/fig-00.webp")).toBe(
      "/images/chapters/sample/fig-00.webp",
    );
    expect(staticUrl("images/chapters/sample/fig-00.webp")).toBe(
      "/images/chapters/sample/fig-00.webp",
    );
  });

  it("prefixes relative paths and remains safe to call twice", () => {
    vi.stubEnv("NEXT_PUBLIC_STATIC_BASE", "https://cdn.example.com/media/");
    expect(staticUrl("/audio/chapters/sample/en/sec-00.mp3")).toBe(
      "https://cdn.example.com/media/audio/chapters/sample/en/sec-00.mp3",
    );
    expect(staticUrl("https://cdn.example.com/media/audio/file.mp3")).toBe(
      "https://cdn.example.com/media/audio/file.mp3",
    );
  });

  it("does not rewrite protocol-relative or data URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_STATIC_BASE", "https://cdn.example.com");
    expect(staticUrl("//images.example.com/figure.webp")).toBe("//images.example.com/figure.webp");
    expect(staticUrl("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP")).toBe(
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP",
    );
  });

  it("rejects the authenticated R2 S3 endpoint as a browser origin", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_STATIC_BASE",
      "https://de7f559c22914208b89b05e8c694006e.r2.cloudflarestorage.com/the-pandora-code",
    );
    expect(() => staticUrl("/images/pages/timeline.png")).toThrow("authenticated S3 API endpoint");
  });
});
