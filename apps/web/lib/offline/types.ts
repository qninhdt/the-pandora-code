export const OFFLINE_PROTOCOL_VERSION = 1 as const;
export const OFFLINE_SCHEMA_VERSION = 1 as const;

export type OfflineLocale = "en" | "vi";
export type OfflineChapterStatus = "downloading" | "ready" | "failed" | "deleting";

export type OfflineAssetKind =
  | "document"
  | "image"
  | "stylesheet"
  | "font"
  | "media"
  | "search-index";

export interface OfflineAsset {
  url: string;
  kind: OfflineAssetKind;
  bytes?: number;
  sha256?: string;
  contentType?: string;
  required?: boolean;
}

export interface OfflineChapterManifest {
  schemaVersion: typeof OFFLINE_SCHEMA_VERSION;
  locale: OfflineLocale;
  slug: string;
  title: string;
  url: string;
  contentHash: string;
  generatedAt: string;
  estimatedBytes: number;
  assets: OfflineAsset[];
  searchIndexVersion: string;
  searchIndexUrls: string[];
}

export interface OfflineManifestFile {
  schemaVersion: typeof OFFLINE_SCHEMA_VERSION;
  locale: OfflineLocale;
  generatedAt: string;
  manifestHash: string;
  chapters: OfflineChapterManifest[];
}

export interface OfflineChapterRecord {
  id: string;
  locale: OfflineLocale;
  slug: string;
  title: string;
  status: OfflineChapterStatus;
  contentHash?: string;
  cacheName?: string;
  buildId?: string;
  bytes: number;
  opId: number;
  error?: string;
  updatedAt: number;
}

export interface OfflineIntent {
  id: string;
  locale: OfflineLocale;
  slug: string;
  opId: number;
  state: "staging" | "committing" | "cleanup";
  stagingCache: string;
  targetCache?: string;
  contentHash?: string;
  createdAt: number;
}

export type OfflineRequest =
  | {
      type: "DOWNLOAD_CHAPTER";
      protocolVersion: number;
      locale: OfflineLocale;
      slug: string;
    }
  | {
      type: "DELETE_CHAPTER";
      protocolVersion: number;
      locale: OfflineLocale;
      slug: string;
    }
  | {
      type: "CANCEL_DOWNLOAD";
      protocolVersion: number;
      locale: OfflineLocale;
      slug: string;
    }
  | {
      type: "GET_STATUS";
      protocolVersion: number;
      locale?: OfflineLocale;
      slug?: string;
    }
  | {
      type: "ACTIVATE_UPDATE";
      protocolVersion: number;
    };

export type OfflineResponse =
  | {
      type: "STATUS";
      protocolVersion: typeof OFFLINE_PROTOCOL_VERSION;
      records: OfflineChapterRecord[];
    }
  | {
      type: "PROGRESS";
      protocolVersion: typeof OFFLINE_PROTOCOL_VERSION;
      locale: OfflineLocale;
      slug: string;
      opId: number;
      completed: number;
      total: number;
      bytes: number;
      totalBytes: number;
    }
  | {
      type: "RESULT";
      protocolVersion: typeof OFFLINE_PROTOCOL_VERSION;
      requestType: OfflineRequest["type"];
      ok: boolean;
      record?: OfflineChapterRecord;
      error?: string;
    }
  | {
      type: "UPDATE_AVAILABLE";
      protocolVersion: typeof OFFLINE_PROTOCOL_VERSION;
    };

export function offlineRecordId(locale: OfflineLocale, slug: string): string {
  return `${locale}:${slug}`;
}

export function isOfflineLocale(value: unknown): value is OfflineLocale {
  return value === "en" || value === "vi";
}

export function isOfflineSlug(value: unknown): value is string {
  return (
    typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value) && !value.includes(".")
  );
}

export function isOfflineRequest(value: unknown): value is OfflineRequest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<OfflineRequest>;
  const fields = candidate as Partial<{ locale: unknown; slug: unknown }>;
  if (typeof candidate.type !== "string" || typeof candidate.protocolVersion !== "number") {
    return false;
  }
  if (candidate.type === "ACTIVATE_UPDATE") return true;
  if (candidate.type === "GET_STATUS") {
    return (
      (!fields.locale || isOfflineLocale(fields.locale)) &&
      (!fields.slug || isOfflineSlug(fields.slug))
    );
  }
  return isOfflineLocale(fields.locale) && isOfflineSlug(fields.slug);
}
