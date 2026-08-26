/// <reference lib="webworker" />

import { NetworkOnly, type RuntimeCaching, Serwist } from "serwist";
import {
  OFFLINE_INDEX_CACHE,
  OFFLINE_SHELL_CACHE,
  OPTIMIZED_IMAGE_CACHE,
  STATIC_ASSET_CACHE,
  STATIC_IMAGE_CACHE,
  chapterCacheName,
  isOwnedOfflineCache,
  stagingCacheName,
} from "../lib/offline/cache-names";
import {
  deleteChapterRecord,
  deleteIntent,
  getChapterRecord,
  listChapterRecords,
  listIntents,
  putChapterRecord,
  putIntent,
  reconcileOfflineIntents,
} from "../lib/offline/db";
import {
  OFFLINE_PROTOCOL_VERSION,
  type OfflineAsset,
  type OfflineChapterManifest,
  type OfflineChapterRecord,
  type OfflineLocale,
  type OfflineManifestFile,
  type OfflineRequest,
  type OfflineResponse,
  isOfflineLocale,
  isOfflineRequest,
  offlineRecordId,
} from "../lib/offline/types";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<{ url: string; revision?: string }>;
};

const MAX_ASSET_BYTES = 80 * 1024 * 1024;
const MAX_CHAPTER_BYTES = 80 * 1024 * 1024;
const MAX_ASSETS = 128;
const OFFLINE_FALLBACK_URL = "/offline.html";
const SHELL_LOCALES: OfflineLocale[] = ["en", "vi"];
const SHELL_PATHS = ["", "/chapters", "/glossary", "/timeline", "/author", "/offline"];
const manifestCache = new Map<OfflineLocale, Promise<OfflineManifestFile>>();
const activeOperations = new Map<
  string,
  { opId: number; controller: AbortController; done: Promise<void> }
>();

function originUrl(url: string): URL | null {
  try {
    const parsed = new URL(url, self.location.origin);
    return parsed.origin === self.location.origin ? parsed : null;
  } catch {
    return null;
  }
}

function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) && !slug.includes(".");
}

function chapterPath(locale: OfflineLocale, slug: string): string {
  return `/${locale}/chapters/${slug}`;
}

// Asset URLs are discovered from serialized HTML rather than a live DOM. The
// HTML serializer escapes query-string ampersands as `&amp;`; fetching that
// literal value makes Next's image optimizer see `amp;w`/`amp;q` parameters and
// return a validation error. Decode only the five named entities that are
// valid in an HTML attribute so the URL stays otherwise untouched.
function decodeHtmlAttribute(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function chapterManifest(locale: OfflineLocale, slug: string): Promise<OfflineChapterManifest> {
  let pending = manifestCache.get(locale);
  if (!pending) {
    pending = fetch(`/offline/chapters-${locale}.json`, {
      credentials: "omit",
      cache: "no-store",
    }).then(async (response) => {
      if (!response.ok || response.redirected || response.type !== "basic")
        throw new Error("Offline manifest is unavailable");
      const manifest = (await response.json()) as OfflineManifestFile;
      if (
        manifest.schemaVersion !== 1 ||
        manifest.locale !== locale ||
        !Array.isArray(manifest.chapters)
      ) {
        throw new Error("Offline manifest schema mismatch");
      }
      return manifest;
    });
    manifestCache.set(locale, pending);
  }
  return pending.then((manifest) => {
    const chapter = manifest.chapters.find(
      (entry) => entry.slug === slug && entry.locale === locale,
    );
    if (!chapter) throw new Error("This chapter is not available for offline download");
    validateManifestChapter(chapter);
    return chapter;
  });
}

function validateManifestChapter(manifest: OfflineChapterManifest): void {
  if (
    manifest.schemaVersion !== 1 ||
    !isOfflineLocale(manifest.locale) ||
    !isSafeSlug(manifest.slug)
  ) {
    throw new Error("Invalid offline chapter manifest");
  }
  if (manifest.url !== chapterPath(manifest.locale, manifest.slug))
    throw new Error("Invalid chapter URL");
  if (!manifest.contentHash || !/^[a-f0-9]{32,128}$/i.test(manifest.contentHash))
    throw new Error("Invalid chapter hash");
  if (
    !Array.isArray(manifest.assets) ||
    manifest.assets.length === 0 ||
    manifest.assets.length > MAX_ASSETS
  ) {
    throw new Error("Invalid chapter asset count");
  }
  if (!manifest.assets.some((asset) => asset.kind === "document" && asset.url === manifest.url)) {
    throw new Error("Offline manifest has no chapter document");
  }
  const seen = new Set<string>();
  for (const asset of manifest.assets) {
    if (seen.has(asset.url)) throw new Error(`Duplicate offline asset: ${asset.url}`);
    seen.add(asset.url);
    const parsed = originUrl(asset.url);
    if (!parsed || parsed.search || parsed.hash || parsed.pathname.includes(".."))
      throw new Error(`Unsafe offline asset: ${asset.url}`);
    if (
      asset.url !== manifest.url &&
      !asset.url.startsWith("/_next/static/") &&
      !asset.url.startsWith(`/images/chapters/${manifest.slug}/`) &&
      !asset.url.startsWith("/search/") &&
      !asset.url.startsWith("/fonts/")
    ) {
      throw new Error(`Offline asset is outside the allowlist: ${asset.url}`);
    }
    if (
      asset.bytes !== undefined &&
      (!Number.isInteger(asset.bytes) || asset.bytes < 0 || asset.bytes > MAX_ASSET_BYTES)
    ) {
      throw new Error(`Offline asset exceeds the byte limit: ${asset.url}`);
    }
    if (asset.sha256 && !/^[a-f0-9]{64}$/i.test(asset.sha256))
      throw new Error(`Invalid asset digest: ${asset.url}`);
  }
  if (
    !Number.isFinite(manifest.estimatedBytes) ||
    manifest.estimatedBytes < 0 ||
    manifest.estimatedBytes > MAX_CHAPTER_BYTES
  ) {
    throw new Error("Offline chapter exceeds the byte budget");
  }
}

function publicResponse(response: Response, asset: OfflineAsset, expectedUrl: string): boolean {
  if (!response.ok || response.redirected || response.type !== "basic") return false;
  if (
    response.url &&
    new URL(response.url).pathname !== new URL(expectedUrl, self.location.origin).pathname
  )
    return false;
  const cacheControl = response.headers.get("cache-control")?.toLowerCase() ?? "";
  if (cacheControl.includes("private") || cacheControl.includes("no-store")) return false;
  if (
    response.headers.has("set-cookie") ||
    response.headers.get("vary")?.includes("*") ||
    response.headers.get("vary")?.toLowerCase().includes("cookie")
  ) {
    return false;
  }
  const expectedType = asset.contentType;
  if (
    expectedType &&
    !response.headers.get("content-type")?.toLowerCase().includes(expectedType.toLowerCase())
  )
    return false;
  return true;
}

async function digestBytes(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function fetchAsset(
  asset: OfflineAsset,
  signal: AbortSignal,
): Promise<{ response: Response; bytes: number }> {
  const url = originUrl(asset.url);
  if (!url) throw new Error(`Refusing cross-origin offline asset: ${asset.url}`);
  const response = await fetch(
    new Request(url.href, { credentials: "omit", cache: "no-store", signal }),
  );
  if (!publicResponse(response, asset, url.href))
    throw new Error(`Offline asset failed validation: ${asset.url}`);
  const buffer = await response.clone().arrayBuffer();
  const bytes = buffer.byteLength;
  if (bytes > MAX_ASSET_BYTES || (asset.bytes !== undefined && bytes !== asset.bytes))
    throw new Error(`Offline asset byte mismatch: ${asset.url}`);
  if (asset.sha256 && (await digestBytes(buffer)) !== asset.sha256)
    throw new Error(`Offline asset digest mismatch: ${asset.url}`);
  return { response, bytes };
}

function discoveredAsset(url: string, _locale: OfflineLocale, slug: string): OfflineAsset | null {
  const decodedUrl = decodeHtmlAttribute(url);
  const parsed = originUrl(decodedUrl);
  if (!parsed || parsed.hash) return null;
  const pathname = parsed.pathname;
  if (pathname === "/_next/image") {
    const source = parsed.searchParams.get("url");
    const sourceUrl = source ? originUrl(source) : null;
    if (
      !sourceUrl ||
      sourceUrl.search ||
      sourceUrl.hash ||
      !sourceUrl.pathname.startsWith("/images/")
    )
      return null;
    return { url: `${pathname}${parsed.search}`, kind: "image", required: true };
  }
  if (parsed.search) return null;
  if (
    !pathname.startsWith("/_next/static/") &&
    !pathname.startsWith(`/images/chapters/${slug}/`) &&
    !pathname.startsWith("/search/") &&
    !pathname.startsWith("/fonts/")
  ) {
    return null;
  }
  if (pathname.startsWith("/search/") && !/^\/search\/index-(?:en|vi)\.json$/.test(pathname))
    return null;
  if (pathname.startsWith(`/images/chapters/${slug}/`) && pathname.includes("..")) return null;
  const extension = pathname.split(".").pop()?.toLowerCase();
  const kind: OfflineAsset["kind"] =
    extension === "css"
      ? "stylesheet"
      : /^(?:woff2?|ttf|otf)$/.test(extension ?? "")
        ? "font"
        : extension && /^(?:mp4|webm|mp3|wav|ogg)$/.test(extension)
          ? "media"
          : pathname.startsWith("/search/")
            ? "search-index"
            : "image";
  const contentType =
    kind === "stylesheet"
      ? "text/css"
      : kind === "font"
        ? undefined
        : kind === "search-index"
          ? "application/json"
          : kind === "image"
            ? undefined
            : undefined;
  return { url: pathname, kind, contentType, required: true };
}

async function discoverDocumentAssets(
  response: Response,
  locale: OfflineLocale,
  slug: string,
): Promise<OfflineAsset[]> {
  const html = await response.clone().text();
  const discovered = new Set<string>();
  const attribute = /(?:src|href|poster)=["']([^"']+)["']/gi;
  for (const match of html.matchAll(attribute)) {
    const asset = discoveredAsset(match[1], locale, slug);
    if (asset) discovered.add(asset.url);
  }
  const cssUrls = /url\((?:["']?)([^)"']+)(?:["']?)\)/gi;
  for (const match of html.matchAll(cssUrls)) {
    const asset = discoveredAsset(match[1], locale, slug);
    if (asset) discovered.add(asset.url);
  }
  return [...discovered]
    .sort()
    .map((url) => discoveredAsset(url, locale, slug))
    .filter((asset): asset is OfflineAsset => asset !== null);
}

async function forEachConcurrent<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await worker(item);
    }
  });
  await Promise.all(runners);
}

function post(port: MessagePort | undefined, message: OfflineResponse): void {
  port?.postMessage(message);
}

// ─────────────────────────────────────────────────────────────────────
// Shell precaching
//
// The worker installs on a reader's FIRST visit but does not control that page
// (skipWaiting/clientsClaim are off so a running reader is never swapped
// mid-session). Nothing the first page loads therefore passes through a fetch
// handler, and the landing page — the one a reader is most likely to reopen —
// would stay uncached until they happened to visit it a second time. That is
// what made the site look entirely offline-hostile: the very first URL always
// missed. So the install step fetches the navigation shell itself, for both
// locales, plus the build assets those documents reference.
// ─────────────────────────────────────────────────────────────────────

function shellUrls(): string[] {
  return SHELL_LOCALES.flatMap((locale) => SHELL_PATHS.map((path) => `/${locale}${path}`));
}

/** Cache one shell document plus the /_next/static bundle it references. */
async function precacheShellDocument(cache: Cache, path: string): Promise<void> {
  const url = new URL(path, self.location.origin);
  const response = await fetch(new Request(url.href, { credentials: "omit", cache: "no-store" }));
  if (!response.ok || response.redirected || response.type !== "basic") return;
  await cache.put(new Request(url.href, { credentials: "omit" }), response.clone());

  // Build assets are content-hashed and shared across routes, so they live in
  // the long-lived static cache rather than being duplicated per document.
  const html = await response.text();
  const staticCache = await caches.open(STATIC_ASSET_CACHE);
  const assets = new Set<string>();
  for (const match of html.matchAll(/(?:src|href)=["'](\/_next\/static\/[^"']+)["']/gi)) {
    assets.add(decodeHtmlAttribute(match[1]));
  }
  await forEachConcurrent([...assets], 6, async (asset) => {
    const assetUrl = originUrl(asset);
    if (!assetUrl || (await staticCache.match(assetUrl.href))) return;
    const assetResponse = await fetch(
      new Request(assetUrl.href, { credentials: "omit", cache: "no-store" }),
    ).catch(() => null);
    if (assetResponse?.ok && !assetResponse.redirected && assetResponse.type === "basic") {
      await staticCache.put(assetUrl.href, assetResponse);
    }
  });
}

/** Warm the navigation shell. Individual failures must not fail the install. */
async function precacheShell(): Promise<void> {
  const cache = await caches.open(OFFLINE_SHELL_CACHE);
  await forEachConcurrent(shellUrls(), 4, async (path) => {
    await precacheShellDocument(cache, path).catch(() => undefined);
  });
}

async function downloadChapter(
  request: Extract<OfflineRequest, { type: "DOWNLOAD_CHAPTER" }>,
  port?: MessagePort,
): Promise<OfflineResponse> {
  const id = offlineRecordId(request.locale, request.slug);
  const previous = activeOperations.get(id);
  if (previous)
    return {
      type: "RESULT",
      protocolVersion: OFFLINE_PROTOCOL_VERSION,
      requestType: request.type,
      ok: false,
      error: "A download is already in progress",
    };
  const opId = Date.now();
  const controller = new AbortController();
  let settleOperation: () => void = () => undefined;
  const done = new Promise<void>((resolve) => {
    settleOperation = resolve;
  });
  activeOperations.set(id, { opId, controller, done });
  const staging = stagingCacheName(request.locale, request.slug, opId);
  let target: string | undefined;
  let previousRecord: OfflineChapterRecord | undefined;
  let previousCacheAvailable = false;
  try {
    const manifest = await chapterManifest(request.locale, request.slug);
    previousRecord = await getChapterRecord(id);
    previousCacheAvailable = Boolean(
      previousRecord?.status === "ready" &&
        previousRecord.cacheName &&
        (await caches.has(previousRecord.cacheName)),
    );
    const declaredTotal = manifest.assets.reduce((sum, asset) => sum + (asset.bytes ?? 0), 0);
    if (declaredTotal > MAX_CHAPTER_BYTES)
      throw new Error("Chapter exceeds the offline storage budget");
    await putIntent({
      id,
      locale: request.locale,
      slug: request.slug,
      opId,
      state: "staging",
      stagingCache: staging,
      createdAt: Date.now(),
    });
    await putChapterRecord({
      id,
      locale: request.locale,
      slug: request.slug,
      title: manifest.title,
      status: "downloading",
      bytes: previousCacheAvailable ? (previousRecord?.bytes ?? 0) : 0,
      opId,
      updatedAt: Date.now(),
      ...(previousCacheAvailable
        ? {
            contentHash: previousRecord?.contentHash,
            cacheName: previousRecord?.cacheName,
          }
        : {}),
    });
    const stagingCache = await caches.open(staging);
    const documentAsset = manifest.assets.find(
      (asset) => asset.kind === "document" && asset.url === manifest.url,
    );
    if (!documentAsset) throw new Error("Offline manifest has no document asset");
    const document = await fetchAsset(documentAsset, controller.signal);
    await stagingCache.put(
      new Request(manifest.url, { credentials: "omit" }),
      document.response.clone(),
    );
    const discovered = await discoverDocumentAssets(
      document.response,
      request.locale,
      request.slug,
    );
    const assets = [
      ...manifest.assets.filter((asset) => asset.url !== documentAsset.url),
      ...discovered.filter((asset) => !manifest.assets.some((known) => known.url === asset.url)),
    ];
    const total = Math.max(
      declaredTotal + document.bytes,
      document.bytes + assets.reduce((sum, asset) => sum + (asset.bytes ?? 0), 0),
    );
    const estimate = await navigator.storage?.estimate?.();
    if (estimate?.quota && estimate.usage && estimate.quota - estimate.usage < total)
      throw new Error("Not enough storage for this chapter");
    let completed = 0;
    let completedBytes = document.bytes;
    post(port, {
      type: "PROGRESS",
      protocolVersion: OFFLINE_PROTOCOL_VERSION,
      locale: request.locale,
      slug: request.slug,
      opId,
      completed: 1,
      total: assets.length + 1,
      bytes: completedBytes,
      totalBytes: total,
    });
    await forEachConcurrent(assets, 4, async (asset) => {
      if (controller.signal.aborted) throw new Error("Download cancelled");
      const fetched = await fetchAsset(asset, controller.signal);
      await stagingCache.put(
        new Request(new URL(asset.url, self.location.origin).href),
        fetched.response.clone(),
      );
      completed += 1;
      completedBytes += fetched.bytes;
      if (completedBytes > MAX_CHAPTER_BYTES)
        throw new Error("Chapter exceeds the offline storage budget");
      post(port, {
        type: "PROGRESS",
        protocolVersion: OFFLINE_PROTOCOL_VERSION,
        locale: request.locale,
        slug: request.slug,
        opId,
        completed: completed + 1,
        total: assets.length + 1,
        bytes: completedBytes,
        totalBytes: total,
      });
    });
    target = chapterCacheName(request.locale, request.slug, manifest.contentHash);
    const finalCache = await caches.open(target);
    for (const request of await stagingCache.keys()) {
      const response = await stagingCache.match(request);
      if (response) await finalCache.put(request, response);
    }
    await putIntent({
      id,
      locale: request.locale,
      slug: request.slug,
      opId,
      state: "committing",
      stagingCache: staging,
      targetCache: target,
      contentHash: manifest.contentHash,
      createdAt: Date.now(),
    });
    const current = await getChapterRecord(id);
    if (!current || current.opId !== opId)
      throw new Error("Download superseded by a newer operation");
    const ready: OfflineChapterRecord = {
      ...current,
      status: "ready",
      contentHash: manifest.contentHash,
      cacheName: target,
      bytes: completedBytes,
      updatedAt: Date.now(),
    };
    await putChapterRecord(ready);
    await caches.delete(staging);
    await deleteIntent(id);
    if (current.cacheName && current.cacheName !== target) await caches.delete(current.cacheName);
    return {
      type: "RESULT",
      protocolVersion: OFFLINE_PROTOCOL_VERSION,
      requestType: request.type,
      ok: true,
      record: ready,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Offline download failed";
    controller.abort();
    const current = await getChapterRecord(id);
    const ownsCurrent = current?.opId === opId;
    const currentReady = Boolean(
      ownsCurrent && current?.status === "ready" && current.cacheName === target,
    );
    if (!currentReady) {
      await caches.delete(staging).catch(() => undefined);
      if (target) await caches.delete(target).catch(() => undefined);
    }
    const failed: OfflineChapterRecord = {
      id,
      locale: request.locale,
      slug: request.slug,
      title: current?.title ?? request.slug,
      status: "failed",
      bytes: 0,
      opId,
      error: message,
      updatedAt: Date.now(),
    };
    let resultRecord = failed;
    if (ownsCurrent && current.status === "downloading") {
      if (previousCacheAvailable && previousRecord?.cacheName) {
        const restored: OfflineChapterRecord = {
          ...current,
          status: "ready",
          contentHash: previousRecord.contentHash,
          cacheName: previousRecord.cacheName,
          bytes: previousRecord.bytes,
          updatedAt: Date.now(),
        };
        restored.error = undefined;
        await putChapterRecord(restored);
        resultRecord = restored;
      } else {
        await putChapterRecord(failed);
      }
    }
    const ownIntent = (await listIntents()).find(
      (intent) => intent.id === id && intent.opId === opId,
    );
    if (ownIntent && !currentReady) await deleteIntent(id);
    return {
      type: "RESULT",
      protocolVersion: OFFLINE_PROTOCOL_VERSION,
      requestType: request.type,
      ok: false,
      record: resultRecord,
      error: message,
    };
  } finally {
    if (activeOperations.get(id)?.opId === opId) activeOperations.delete(id);
    settleOperation();
  }
}

async function deleteChapter(
  request: Extract<OfflineRequest, { type: "DELETE_CHAPTER" }>,
): Promise<OfflineResponse> {
  const id = offlineRecordId(request.locale, request.slug);
  const operation = activeOperations.get(id);
  operation?.controller.abort();
  if (operation) await operation.done;
  const current = await getChapterRecord(id);
  if (current?.cacheName) await caches.delete(current.cacheName);
  await deleteChapterRecord(id);
  return {
    type: "RESULT",
    protocolVersion: OFFLINE_PROTOCOL_VERSION,
    requestType: request.type,
    ok: true,
  };
}

async function listCurrentRecords(filter?: { locale?: OfflineLocale }) {
  const records = await listChapterRecords(filter);
  const current: OfflineChapterRecord[] = [];
  for (const record of records) {
    if (record.status === "ready") {
      if (!record.cacheName || !(await caches.has(record.cacheName))) {
        await deleteChapterRecord(record.id);
        continue;
      }
    }
    current.push(record);
  }
  return current;
}

async function handleRequest(
  request: OfflineRequest,
  port?: MessagePort,
): Promise<OfflineResponse> {
  if (
    request.protocolVersion > OFFLINE_PROTOCOL_VERSION ||
    request.protocolVersion < OFFLINE_PROTOCOL_VERSION - 1
  ) {
    return {
      type: "RESULT",
      protocolVersion: OFFLINE_PROTOCOL_VERSION,
      requestType: request.type,
      ok: false,
      error: "Unsupported offline protocol version",
    };
  }
  if (request.type === "DOWNLOAD_CHAPTER") return downloadChapter(request, port);
  if (request.type === "DELETE_CHAPTER") return deleteChapter(request);
  if (request.type === "CANCEL_DOWNLOAD") {
    const id = offlineRecordId(request.locale, request.slug);
    const operation = activeOperations.get(id);
    operation?.controller.abort();
    if (operation) await operation.done;
    return {
      type: "RESULT",
      protocolVersion: OFFLINE_PROTOCOL_VERSION,
      requestType: request.type,
      ok: Boolean(operation),
    };
  }
  if (request.type === "GET_STATUS") {
    const records = await listCurrentRecords({ locale: request.locale });
    return {
      type: "STATUS",
      protocolVersion: OFFLINE_PROTOCOL_VERSION,
      records: request.slug ? records.filter((record) => record.slug === request.slug) : records,
    };
  }
  self.skipWaiting();
  return {
    type: "RESULT",
    protocolVersion: OFFLINE_PROTOCOL_VERSION,
    requestType: request.type,
    ok: true,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Runtime routing
//
// A downloaded chapter stores its figures in its own content-hashed cache, so a
// plain per-route cache lookup misses them: `/images/chapters/x/fig-01.webp`
// lives in `pandora-offline:chapter:...`, not in the shared image cache. Every
// asset handler therefore searches all caches we own before giving up, and the
// router-level catch handler turns an unreachable document into the offline
// page instead of a browser connection error.
// ─────────────────────────────────────────────────────────────────────

/** Look for a stored copy of this request in every cache this worker owns. */
async function matchOwnedCaches(
  request: Request,
  options?: CacheQueryOptions,
): Promise<Response | undefined> {
  for (const name of (await caches.keys()).filter(isOwnedOfflineCache)) {
    const hit = await (await caches.open(name)).match(request, options);
    if (hit) return hit;
  }
  return undefined;
}

/** Cache-first, but read across caches and write to one. */
function cacheFirstAcrossCaches(cacheName: string) {
  return async ({ request }: { request: Request }): Promise<Response> => {
    const cached = await matchOwnedCaches(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && !response.redirected && response.type === "basic") {
      await (await caches.open(cacheName)).put(request, response.clone());
    }
    return response;
  };
}

/**
 * The optimizer keys a response by width and quality, and `next/image` emits a
 * srcset the browser picks from by device pixel ratio. A chapter download only
 * stores the variants named in the served HTML, so a reader on a different DPR
 * asks for a width that was never cached. Any stored variant of the same source
 * image is a correct picture, so accept one rather than showing a broken image.
 */
async function matchOptimizedImage(url: URL): Promise<Response | undefined> {
  const source = url.searchParams.get("url");
  if (!source) return undefined;
  for (const name of (await caches.keys()).filter(isOwnedOfflineCache)) {
    const cache = await caches.open(name);
    for (const key of await cache.keys()) {
      const keyUrl = new URL(key.url);
      if (keyUrl.pathname !== "/_next/image") continue;
      if (keyUrl.searchParams.get("url") !== source) continue;
      const hit = await cache.match(key);
      if (hit) return hit;
    }
  }
  return undefined;
}

function optimizedImageHandler() {
  return async ({ request, url }: { request: Request; url: URL }): Promise<Response> => {
    const exact = await matchOwnedCaches(request);
    if (exact) return exact;
    try {
      const response = await fetch(request);
      if (response.ok && !response.redirected && response.type === "basic") {
        await (await caches.open(OPTIMIZED_IMAGE_CACHE)).put(request, response.clone());
      }
      return response;
    } catch (error) {
      const variant = await matchOptimizedImage(url);
      if (variant) return variant;
      throw error;
    }
  };
}

/** Network-first for content that can change, with a cross-cache read on failure. */
function networkFirstAcrossCaches(cacheName: string) {
  return async ({ request }: { request: Request }): Promise<Response> => {
    try {
      const response = await fetch(request);
      if (response.ok && !response.redirected && response.type === "basic") {
        await (await caches.open(cacheName)).put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await matchOwnedCaches(request);
      if (cached) return cached;
      throw error;
    }
  };
}

const runtimeCaching: RuntimeCaching[] = [
  {
    // RSC payloads are never cached: a stale flight response would desync the
    // router. Offline these fail fast, which makes App Router fall back to a
    // hard navigation the worker can answer from cache.
    matcher: ({ request, sameOrigin }) =>
      sameOrigin &&
      (request.headers.get("RSC") === "1" || new URL(request.url).searchParams.has("_rsc")),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && /^\/_next\/static\/.+\.(?:js|css|woff2?)$/i.test(url.pathname),
    handler: cacheFirstAcrossCaches(STATIC_ASSET_CACHE),
  },
  {
    matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname === "/_next/image",
    handler: optimizedImageHandler(),
  },
  {
    matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/search/"),
    handler: networkFirstAcrossCaches(OFFLINE_INDEX_CACHE),
  },
  {
    matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/images/"),
    handler: cacheFirstAcrossCaches(STATIC_IMAGE_CACHE),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: false,
  clientsClaim: false,
  runtimeCaching,
});

serwist.registerCapture(
  ({ request, url, sameOrigin }) =>
    sameOrigin &&
    request.mode === "navigate" &&
    request.headers.get("RSC") !== "1" &&
    /^\/(?:en|vi)\/chapters\/[^/]+\/?$/.test(url.pathname),
  async ({ request, url }) => {
    const [, localeValue, , slugValue] = url.pathname.split("/");
    if (!isOfflineLocale(localeValue) || !slugValue || !isSafeSlug(slugValue))
      return navigateOrShell(request, url);
    const record = await getChapterRecord(offlineRecordId(localeValue, slugValue));
    if (record?.status === "ready" && record.cacheName) {
      const cleanRequest = new Request(`${url.origin}${url.pathname}`, { method: "GET" });
      const cached = await (await caches.open(record.cacheName)).match(cleanRequest, {
        ignoreSearch: true,
      });
      // A downloaded chapter is authoritative offline and cheap online: serving
      // it from cache is what "available offline" is supposed to mean.
      if (cached) return cached;
    }
    return navigateOrShell(request, url);
  },
);

serwist.registerCapture(
  ({ request, sameOrigin }) =>
    sameOrigin && request.mode === "navigate" && request.headers.get("RSC") !== "1",
  async ({ request, url }) => navigateOrShell(request, url),
);

/** Fetch a document, falling back to the precached shell copy of that URL. */
async function navigateOrShell(request: Request, url: URL): Promise<Response> {
  const cleanRequest = new Request(`${url.origin}${url.pathname}`, { method: "GET" });
  try {
    const response = await fetch(request);
    if (response.ok && !response.redirected && response.type === "basic") {
      await (await caches.open(OFFLINE_SHELL_CACHE)).put(cleanRequest, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await matchOwnedCaches(cleanRequest, { ignoreSearch: true });
    if (cached) return cached;
    // The PWA's start_url is the bare origin, which online is a locale
    // redirect. Offline there is nothing to redirect to, so answer with a
    // cached locale home rather than the offline notice.
    if (url.pathname === "/" || url.pathname === "") {
      for (const locale of SHELL_LOCALES) {
        const home = await matchOwnedCaches(
          new Request(`${url.origin}/${locale}`, { method: "GET" }),
          { ignoreSearch: true },
        );
        if (home) return home;
      }
    }
    throw error;
  }
}

// Any route that cannot produce a response ends here. Documents get the
// offline page (so the reader sees the book's own message instead of the
// browser's error screen); other destinations fail quietly.
serwist.setCatchHandler(async ({ request }) => {
  if (request.destination === "document" || request.mode === "navigate") {
    const fallback =
      (await serwist.matchPrecache(OFFLINE_FALLBACK_URL)) ??
      (await caches.match(OFFLINE_FALLBACK_URL, { ignoreSearch: true }));
    if (fallback) return fallback;
  }
  return Response.error();
});

self.addEventListener("install", (event) => {
  event.waitUntil(precacheShell());
});

self.addEventListener("message", (event) => {
  const port = event.ports[0];
  if (!isOfflineRequest(event.data)) {
    post(port, {
      type: "RESULT",
      protocolVersion: OFFLINE_PROTOCOL_VERSION,
      requestType: "GET_STATUS",
      ok: false,
      error: "Invalid offline request",
    });
    return;
  }
  event.waitUntil(
    handleRequest(event.data, port)
      .then((response) => post(port, response))
      .catch((error) =>
        post(port, {
          type: "RESULT",
          protocolVersion: OFFLINE_PROTOCOL_VERSION,
          requestType: event.data.type,
          ok: false,
          error: error instanceof Error ? error.message : "Offline worker error",
        }),
      ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const committing = (await listIntents()).filter((intent) => intent.state === "committing");
      for (const intent of committing) {
        const current = await getChapterRecord(intent.id);
        const targetReady = Boolean(
          current?.status === "ready" &&
            current.cacheName === intent.targetCache &&
            intent.targetCache &&
            (await caches.has(intent.targetCache)),
        );
        if (targetReady) {
          await caches.delete(intent.stagingCache);
          await deleteIntent(intent.id);
          continue;
        }
        await Promise.all([
          caches.delete(intent.stagingCache),
          intent.targetCache ? caches.delete(intent.targetCache) : Promise.resolve(false),
        ]);
        if (current?.opId === intent.opId) await deleteChapterRecord(intent.id);
        await deleteIntent(intent.id);
      }
      const stale = await reconcileOfflineIntents();
      await Promise.all(stale.map((intent) => caches.delete(intent.stagingCache)));
      const records = await listCurrentRecords();
      const live = new Set(
        records
          .filter((record) => record.status === "ready" && record.cacheName)
          .map((record) => record.cacheName),
      );
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("pandora-offline:chapter:") && !live.has(name))
          .map((name) => caches.delete(name)),
      );
      // A new build renames every /_next/static asset, so the shell HTML cached
      // by the previous worker points at bundles that no longer exist. Refresh
      // it here; failures are tolerated because the old copy still renders.
      await precacheShell().catch(() => undefined);
    })(),
  );
});

// Keep this call last: custom lifecycle/message listeners above must be
// registered before Serwist installs its router listeners.
serwist.addEventListeners();
