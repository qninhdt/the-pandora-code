import type { OfflineChapterRecord, OfflineIntent, OfflineLocale } from "./types";

export const OFFLINE_DB_NAME = "pandora-offline";
export const OFFLINE_DB_VERSION = 1;

type StoreName = "chapters" | "intents" | "meta";

function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

export function openOfflineDb(): Promise<IDBDatabase | null> {
  if (!hasIndexedDb()) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("chapters")) {
        const store = db.createObjectStore("chapters", { keyPath: "id" });
        store.createIndex("by-status", "status");
        store.createIndex("by-locale", "locale");
      }
      if (!db.objectStoreNames.contains("intents")) {
        const store = db.createObjectStore("intents", { keyPath: "id" });
        store.createIndex("by-op", "opId");
      }
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open offline database"));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

export async function getChapterRecord(id: string): Promise<OfflineChapterRecord | undefined> {
  const db = await openOfflineDb();
  if (!db) return undefined;
  try {
    return await requestResult(
      db.transaction("chapters", "readonly").objectStore("chapters").get(id),
    );
  } finally {
    db.close();
  }
}

export async function listChapterRecords(filter?: { locale?: OfflineLocale }): Promise<
  OfflineChapterRecord[]
> {
  const db = await openOfflineDb();
  if (!db) return [];
  try {
    const store = db.transaction("chapters", "readonly").objectStore("chapters");
    const records = (await requestResult(store.getAll())) as OfflineChapterRecord[];
    return filter?.locale ? records.filter((record) => record.locale === filter.locale) : records;
  } finally {
    db.close();
  }
}

export async function putChapterRecord(record: OfflineChapterRecord): Promise<void> {
  const db = await openOfflineDb();
  if (!db) return;
  try {
    await requestResult(
      db.transaction("chapters", "readwrite").objectStore("chapters").put(record),
    );
  } finally {
    db.close();
  }
}

export async function deleteChapterRecord(id: string): Promise<void> {
  const db = await openOfflineDb();
  if (!db) return;
  try {
    await requestResult(db.transaction("chapters", "readwrite").objectStore("chapters").delete(id));
  } finally {
    db.close();
  }
}

export async function putIntent(intent: OfflineIntent): Promise<void> {
  const db = await openOfflineDb();
  if (!db) return;
  try {
    await requestResult(db.transaction("intents", "readwrite").objectStore("intents").put(intent));
  } finally {
    db.close();
  }
}

export async function deleteIntent(id: string): Promise<void> {
  const db = await openOfflineDb();
  if (!db) return;
  try {
    await requestResult(db.transaction("intents", "readwrite").objectStore("intents").delete(id));
  } finally {
    db.close();
  }
}

export async function listIntents(): Promise<OfflineIntent[]> {
  const db = await openOfflineDb();
  if (!db) return [];
  try {
    return (await requestResult(
      db.transaction("intents", "readonly").objectStore("intents").getAll(),
    )) as OfflineIntent[];
  } finally {
    db.close();
  }
}

export async function reconcileOfflineIntents(): Promise<OfflineIntent[]> {
  const intents = await listIntents();
  const stale = intents.filter((intent) => intent.state !== "committing");
  await Promise.all(stale.map((intent) => deleteIntent(intent.id)));
  return stale;
}
