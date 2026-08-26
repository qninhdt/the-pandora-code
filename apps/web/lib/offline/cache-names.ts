import type { OfflineLocale } from "./types";

export const OFFLINE_CACHE_PREFIX = "pandora-offline";
export const OFFLINE_SHELL_CACHE = `${OFFLINE_CACHE_PREFIX}:shell:v1`;
export const OFFLINE_INDEX_CACHE = `${OFFLINE_CACHE_PREFIX}:indexes:v1`;
export const OFFLINE_BUILD_CACHE_PREFIX = `${OFFLINE_CACHE_PREFIX}:build:`;
export const OFFLINE_CHAPTER_CACHE_PREFIX = `${OFFLINE_CACHE_PREFIX}:chapter:`;
export const OFFLINE_STAGING_CACHE_PREFIX = `${OFFLINE_CACHE_PREFIX}:staging:`;

/** Content-hashed build output: immutable, shared by every route. */
export const STATIC_ASSET_CACHE = "pandora-next-static-v1";
/** Optimized image responses from the /_next/image endpoint. */
export const OPTIMIZED_IMAGE_CACHE = "pandora-next-images-v1";
/** Original files under /images, served straight from public/. */
export const STATIC_IMAGE_CACHE = "pandora-static-images-v1";

function safePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._~-]/g, "-").slice(0, 160);
}

export function chapterCacheName(locale: OfflineLocale, slug: string, contentHash: string): string {
  return `${OFFLINE_CHAPTER_CACHE_PREFIX}${locale}:${safePart(slug)}:${safePart(contentHash)}`;
}

export function stagingCacheName(locale: OfflineLocale, slug: string, opId: number): string {
  return `${OFFLINE_STAGING_CACHE_PREFIX}${locale}:${safePart(slug)}:${opId}`;
}

export function isOwnedOfflineCache(name: string): boolean {
  return (
    name === OFFLINE_SHELL_CACHE ||
    name === OFFLINE_INDEX_CACHE ||
    name === STATIC_ASSET_CACHE ||
    name === OPTIMIZED_IMAGE_CACHE ||
    name === STATIC_IMAGE_CACHE ||
    name.startsWith(OFFLINE_BUILD_CACHE_PREFIX) ||
    name.startsWith(OFFLINE_CHAPTER_CACHE_PREFIX) ||
    name.startsWith(OFFLINE_STAGING_CACHE_PREFIX)
  );
}
