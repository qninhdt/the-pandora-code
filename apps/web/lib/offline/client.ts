import { isOwnedOfflineCache } from "./cache-names";
import { getChapterRecord, listChapterRecords } from "./db";
import {
  OFFLINE_PROTOCOL_VERSION,
  type OfflineLocale,
  type OfflineRequest,
  type OfflineResponse,
  isOfflineLocale,
} from "./types";

export const SERVICE_WORKER_URL = "/serwist/sw.js";
export const SERVICE_WORKER_SCOPE = "/";

const isDevelopment = process.env.NODE_ENV === "development";

function hasOfflineApis(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "caches" in window;
}

export function isOfflineSupported(): boolean {
  // A development build must never own the browser's asset cache. Next's dev
  // chunk URLs are not immutable, so cache-first would make HMR/reloads serve
  // yesterday's JavaScript until the developer clears site data.
  return !isDevelopment && hasOfflineApis();
}

/** Remove a worker/cache left by an older dev session after the PWA was enabled. */
export async function clearDevelopmentOfflineState(): Promise<boolean> {
  if (!isDevelopment || !hasOfflineApis()) return false;

  let changed = false;
  const scope = new URL(SERVICE_WORKER_SCOPE, window.location.href).href;
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    const scriptUrl =
      registration.active?.scriptURL ??
      registration.waiting?.scriptURL ??
      registration.installing?.scriptURL;
    if (registration.scope !== scope && !scriptUrl?.endsWith(SERVICE_WORKER_URL)) continue;
    changed = (await registration.unregister()) || changed;
  }

  for (const name of await caches.keys()) {
    if (isOwnedOfflineCache(name)) changed = (await caches.delete(name)) || changed;
  }
  return changed;
}

export async function registerOfflineWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isOfflineSupported()) return null;
  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
    scope: SERVICE_WORKER_SCOPE,
  });
  // `register()` can return an existing registration without performing a
  // timely update check. Ask the browser explicitly so a new deploy is found
  // during the current visit instead of waiting for a future navigation.
  await registration.update().catch(() => undefined);
  await navigator.serviceWorker.ready;
  return registration;
}

/** Activate an installed update and resolve only after it is safe to reload. */
export async function activateWaitingWorker(
  registration: ServiceWorkerRegistration,
): Promise<boolean> {
  const worker = registration.waiting;
  if (!worker) return false;

  const listenerController = new AbortController();
  const activated = new Promise<void>((resolve, reject) => {
    const onStateChange = () => {
      if (worker.state === "activated") {
        resolve();
      } else if (worker.state === "redundant") {
        reject(new Error("Offline worker update became redundant"));
      }
    };
    worker.addEventListener("statechange", onStateChange, { signal: listenerController.signal });
    onStateChange();
  });

  try {
    await Promise.all([
      sendOfflineRequest(
        { type: "ACTIVATE_UPDATE", protocolVersion: OFFLINE_PROTOCOL_VERSION },
        undefined,
        worker,
      ),
      activated,
    ]);
    return true;
  } finally {
    listenerController.abort();
  }
}

export async function sendOfflineRequest(
  request: OfflineRequest,
  onProgress?: (progress: Extract<OfflineResponse, { type: "PROGRESS" }>) => void,
  targetWorker?: ServiceWorker,
): Promise<Exclude<OfflineResponse, { type: "PROGRESS" }>> {
  if (!isOfflineSupported()) throw new Error("Offline storage is not supported in this browser");
  const registration = targetWorker ? null : await registerOfflineWorker();
  const worker = targetWorker ?? registration?.active ?? navigator.serviceWorker.controller;
  if (!worker) throw new Error("Offline worker is not ready yet");

  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    let timeout = window.setTimeout(() => {
      channel.port1.close();
      reject(new Error("Offline worker timed out"));
    }, 30_000);
    const refreshTimeout = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        channel.port1.close();
        reject(new Error("Offline worker timed out"));
      }, 30_000);
    };
    channel.port1.onmessage = (event: MessageEvent<OfflineResponse>) => {
      if (event.data.type === "PROGRESS") {
        refreshTimeout();
        onProgress?.(event.data);
        return;
      }
      window.clearTimeout(timeout);
      channel.port1.close();
      resolve(event.data);
    };
    worker.postMessage({ ...request, protocolVersion: OFFLINE_PROTOCOL_VERSION }, [channel.port2]);
  });
}

export async function getOfflineStatus(locale?: OfflineLocale) {
  const records = await listChapterRecords({ locale });
  const visible = records.filter(
    (record) =>
      record.status === "downloading" ||
      record.status === "failed" ||
      (record.status === "ready" && Boolean(record.cacheName)),
  );
  return Promise.all(
    visible.map(async (record) => {
      if (record.status !== "ready" || !record.cacheName) return record;
      return (await caches.has(record.cacheName)) ? record : null;
    }),
  ).then((items) =>
    items.filter((record): record is NonNullable<typeof record> => record !== null),
  );
}

export async function isChapterAvailableOffline(
  locale: OfflineLocale,
  slug: string,
): Promise<boolean> {
  const record = await getChapterRecord(`${locale}:${slug}`);
  return Boolean(
    record?.status === "ready" && record.cacheName && (await caches.has(record.cacheName)),
  );
}

export function parseOfflineLocale(value: string | undefined): OfflineLocale | undefined {
  return value && isOfflineLocale(value) ? value : undefined;
}
