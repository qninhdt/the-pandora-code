#!/usr/bin/env tsx
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { type Locale, locales } from "../i18n/config";
import { listPublishedChapters } from "../lib/content/loader/chapter-loader";
import type {
  OfflineAsset,
  OfflineChapterManifest,
  OfflineManifestFile,
} from "../lib/offline/types";

const PUBLIC_ROOT = path.resolve(process.cwd(), "public");
const OUT_DIR = path.join(PUBLIC_ROOT, "offline");
const MAX_ASSETS_PER_CHAPTER = 128;
const MAX_CHAPTER_BYTES = 80 * 1024 * 1024;
const ALLOWED_ASSET_ROOTS = ["/images/chapters/", "/search/", "/fonts/", "/_next/"];

function sha256(value: Buffer | string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function publicFile(url: string): string | null {
  if (!url.startsWith("/") || url.startsWith("//") || url.includes("..")) return null;
  const clean = url.split(/[?#]/, 1)[0];
  const file = path.resolve(PUBLIC_ROOT, `.${clean}`);
  if (
    !file.startsWith(`${PUBLIC_ROOT}${path.sep}`) ||
    !fs.existsSync(file) ||
    !fs.statSync(file).isFile()
  )
    return null;
  return file;
}

function assetKind(url: string): OfflineAsset["kind"] {
  if (url.startsWith("/search/")) return "search-index";
  if (/\.(?:css)$/i.test(url)) return "stylesheet";
  if (/\.(?:woff2?|ttf|otf)$/i.test(url)) return "font";
  if (/\.(?:mp4|webm|mp3|wav|ogg)$/i.test(url)) return "media";
  if (/\.(?:png|jpe?g|gif|webp|avif|svg|ico)$/i.test(url)) return "image";
  return "document";
}

function contentType(url: string): string | undefined {
  const ext = path.extname(url).toLowerCase();
  return {
    ".html": "text/html",
    ".css": "text/css",
    ".json": "application/json",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
  }[ext];
}

export function extractAssetUrls(source: string): string[] {
  const urls = new Set<string>();
  const attribute = /(?:src|poster|href|srcSet|srcset)\s*=\s*["']([^"']+)["']/gi;
  for (const match of source.matchAll(attribute)) {
    for (const candidate of match[1].split(/\s*,\s*|\s+/)) {
      const url = candidate.split(/\s+/)[0];
      if (url.startsWith("/")) urls.add(url);
    }
  }
  const markdown = /!\[[^\]]*\]\((\/[^)\s]+)(?:\s+[^)]*)?\)/g;
  for (const match of source.matchAll(markdown)) urls.add(match[1]);
  return [...urls];
}

function chapterAssets(_locale: Locale, slug: string, source: string): OfflineAsset[] {
  const urls = new Set<string>();
  for (const url of extractAssetUrls(source)) {
    if (ALLOWED_ASSET_ROOTS.some((root) => url.startsWith(root))) urls.add(url);
  }
  // Covers/backgrounds are loaded by the server-side reader shell rather than
  // the MDX body, so include the exact variants when they exist.
  for (const candidate of [
    `/images/chapters/${slug}/cover.webp`,
    `/images/chapters/${slug}/cover.png`,
    `/images/chapters/${slug}/fig-00-cover.webp`,
    `/images/chapters/${slug}/fig-00-cover.png`,
    `/images/chapters/${slug}/fig-99-background.png`,
  ]) {
    if (publicFile(candidate)) urls.add(candidate);
  }
  for (const searchLocale of locales) urls.add(`/search/index-${searchLocale}.json`);

  const assets: OfflineAsset[] = [];
  for (const url of [...urls].sort()) {
    const file = publicFile(url);
    if (!file) {
      // Search indexes are generated in an earlier prebuild step. Keep the
      // explicit URL so a missing index fails the build rather than silently
      // producing an incomplete offline package.
      if (url.startsWith("/search/"))
        throw new Error(`Offline manifest asset does not exist: ${url}`);
      continue;
    }
    const bytes = fs.statSync(file).size;
    const body = fs.readFileSync(file);
    assets.push({
      url,
      kind: assetKind(url),
      bytes,
      sha256: sha256(body),
      contentType: contentType(url),
      required: true,
    });
  }
  return assets;
}

function buildLocaleManifest(locale: Locale): OfflineManifestFile {
  const chapters: OfflineChapterManifest[] = [];
  for (const chapter of listPublishedChapters(locale)) {
    const source = fs.readFileSync(chapter.mdxPath, "utf8");
    const assets = chapterAssets(locale, chapter.meta.slug, source);
    if (assets.length > MAX_ASSETS_PER_CHAPTER) {
      throw new Error(
        `Offline manifest for ${locale}/${chapter.meta.slug} has ${assets.length} assets; limit is ${MAX_ASSETS_PER_CHAPTER}`,
      );
    }
    const estimatedBytes = assets.reduce((sum, asset) => sum + (asset.bytes ?? 0), 0);
    if (estimatedBytes > MAX_CHAPTER_BYTES) {
      throw new Error(
        `Offline manifest for ${locale}/${chapter.meta.slug} is ${estimatedBytes} bytes; limit is ${MAX_CHAPTER_BYTES}`,
      );
    }
    const contentHash = sha256(
      JSON.stringify({
        locale,
        slug: chapter.meta.slug,
        source,
        meta: chapter.meta,
        assets: assets.map(({ url, sha256: digest, bytes }) => ({ url, sha256: digest, bytes })),
      }),
    );
    chapters.push({
      schemaVersion: 1,
      locale,
      slug: chapter.meta.slug,
      title: chapter.title,
      url: `/${locale}/chapters/${chapter.meta.slug}`,
      contentHash,
      generatedAt: new Date().toISOString(),
      estimatedBytes,
      assets: [
        {
          url: `/${locale}/chapters/${chapter.meta.slug}`,
          kind: "document",
          contentType: "text/html",
          required: true,
        },
        ...assets,
      ],
      searchIndexVersion: sha256(
        locales
          .map((searchLocale) => {
            const file = path.join(PUBLIC_ROOT, "search", `index-${searchLocale}.json`);
            return fs.existsSync(file) ? fs.readFileSync(file) : Buffer.from("missing");
          })
          .reduce((parts, part) => Buffer.concat([parts, part]), Buffer.alloc(0)),
      ),
      searchIndexUrls: locales.map((searchLocale) => `/search/index-${searchLocale}.json`),
    });
  }
  const generatedAt = new Date().toISOString();
  const withoutHash = { schemaVersion: 1 as const, locale, generatedAt, chapters };
  return {
    ...withoutHash,
    manifestHash: sha256(JSON.stringify(withoutHash)),
  };
}

export function buildOfflineManifests(): OfflineManifestFile[] {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifests = locales.map(buildLocaleManifest);
  for (const manifest of manifests) {
    const target = path.join(OUT_DIR, `chapters-${manifest.locale}.json`);
    fs.writeFileSync(target, `${JSON.stringify(manifest)}\n`, "utf8");
    const bytes = fs.statSync(target).size;
    console.log(
      `[offline-manifest] ${manifest.locale}: ${manifest.chapters.length} chapters → ${(bytes / 1024).toFixed(1)}KB`,
    );
  }
  const index = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    manifests: manifests.map((manifest) => ({
      locale: manifest.locale,
      url: `/offline/chapters-${manifest.locale}.json`,
      manifestHash: manifest.manifestHash,
    })),
  };
  fs.writeFileSync(path.join(OUT_DIR, "index.json"), `${JSON.stringify(index)}\n`, "utf8");
  return manifests;
}

if (process.argv[1] === import.meta.filename) buildOfflineManifests();
