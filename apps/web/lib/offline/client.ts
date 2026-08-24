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

export function isOfflineSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "caches" in window;
}

export async function registerOfflineWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isOfflineSupported()) return null;
  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
    scope: SERVICE_WORKER_SCOPE,
  });
  await navigator.serviceWorker.ready;
  return registration;
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
