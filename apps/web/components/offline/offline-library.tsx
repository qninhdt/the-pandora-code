"use client";

import { Download, RefreshCw, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { OfflineAwareLink } from "./offline-aware-link";
import { useOffline } from "./offline-provider";

export interface OfflineCatalogChapter {
  slug: string;
  title: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function OfflineLibrary({
  locale,
  chapters,
}: {
  locale: "en" | "vi";
  chapters: OfflineCatalogChapter[];
}) {
  const t = useTranslations("offline");
  const { supported, ready, records, refresh, remove, download, cancel, storageEstimate } =
    useOffline();
  const [busyId, setBusyId] = useState<string | null>(null);
  const localRecords = records.filter((record) => record.locale === locale);
  const recordsBySlug = new Map(localRecords.map((record) => [record.slug, record]));
  const availableChapters = chapters.filter(
    (chapter) => recordsBySlug.get(chapter.slug)?.status !== "ready",
  );
  const [actionError, setActionError] = useState(false);
  const storageSummary = storageEstimate ? (
    <p className="font-sans text-xs uppercase tracking-wider text-subtle">
      {t("storageUsage", {
        usage: formatBytes(storageEstimate.usage),
        quota: formatBytes(storageEstimate.quota),
      })}
    </p>
  ) : null;

  if (!supported) {
    return (
      <p className="rounded-xl border border-border bg-surface/50 p-6 font-serif text-muted">
        {t("unsupported")}
      </p>
    );
  }

  const run = async (id: string, operation: () => Promise<boolean>) => {
    setBusyId(id);
    setActionError(false);
    try {
      const ok = await operation();
      if (!ok) setActionError(true);
    } catch {
      setActionError(true);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      {storageSummary}
      {actionError ? (
        <p role="alert" className="font-sans text-xs text-red-200">
          {t("actionError")}
        </p>
      ) : null}
      {!ready ? <p className="font-serif text-muted">{t("loading")}</p> : null}

      <section aria-labelledby="offline-saved-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="offline-saved-heading" className="font-display text-xl font-600 text-foreground">
            {t("downloadedTitle")}
          </h2>
          {localRecords.length > 0 ? (
            <button
              type="button"
              disabled={busyId !== null}
              onClick={() => {
                if (!window.confirm(t("removeAllConfirm"))) return;
                void (async () => {
                  setBusyId("all");
                  setActionError(false);
                  try {
                    for (const record of localRecords) {
                      const ok = await remove(record.locale, record.slug);
                      if (!ok) {
                        setActionError(true);
                        break;
                      }
                    }
                  } catch {
                    setActionError(true);
                  } finally {
                    setBusyId(null);
                  }
                })();
              }}
              className="font-sans text-xs uppercase tracking-wider text-subtle hover:text-red-200 disabled:opacity-50"
            >
              {t("removeAll")}
            </button>
          ) : null}
        </div>
        {localRecords.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface/50 p-6 font-serif text-muted">
            {t("empty")}
          </p>
        ) : (
          localRecords.map((record) => {
            const busy = busyId === record.id || busyId === "all";
            return (
              <article
                key={record.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface/50 p-4"
              >
                <div className="min-w-0 flex-1">
                  <OfflineAwareLink
                    href={`/${record.locale}/chapters/${record.slug}`}
                    locale={record.locale}
                    slug={record.slug}
                    className="font-display text-lg text-foreground no-underline hover:text-cyan"
                  >
                    {record.title}
                  </OfflineAwareLink>
                  <p className="mt-1 font-sans text-xs uppercase tracking-wider text-subtle">
                    {record.status === "ready"
                      ? `${t("ready")} · ${formatBytes(record.bytes)}${record.contentHash ? ` · ${t("version")} ${record.contentHash.slice(0, 8)}` : ""}`
                      : record.status === "failed"
                        ? `${t("failed")} · ${record.error ?? ""}`
                        : t("downloading")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {record.status === "ready" ? (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void run(record.id, () => download(record.locale, record.slug))
                        }
                        className="inline-flex size-9 items-center justify-center rounded-full border border-cyan/40 text-cyan hover:bg-cyan/10 disabled:opacity-50"
                        aria-label={t("update")}
                      >
                        <RefreshCw size={15} aria-hidden />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void run(record.id, () => remove(record.locale, record.slug))
                        }
                        className="inline-flex size-9 items-center justify-center rounded-full border border-border text-subtle hover:text-red-200 disabled:opacity-50"
                        aria-label={t("remove")}
                      >
                        <Trash2 size={15} aria-hidden />
                      </button>
                    </>
                  ) : record.status === "downloading" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void run(record.id, () => cancel(record.locale, record.slug))}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-border text-subtle hover:text-amber disabled:opacity-50"
                      aria-label={t("cancel")}
                    >
                      <X size={15} aria-hidden />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void run(record.id, () => download(record.locale, record.slug))
                      }
                      className="inline-flex size-9 items-center justify-center rounded-full border border-cyan/40 text-cyan hover:bg-cyan/10 disabled:opacity-50"
                      aria-label={t("retry")}
                    >
                      <RefreshCw size={15} aria-hidden />
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>

      <section aria-labelledby="offline-available-heading" className="space-y-3 pt-6">
        <div>
          <h2
            id="offline-available-heading"
            className="font-display text-xl font-600 text-foreground"
          >
            {t("availableTitle")}
          </h2>
          <p className="mt-1 font-serif text-sm text-muted">{t("availableSubtitle")}</p>
        </div>
        {availableChapters.length === 0 ? (
          <p className="rounded-xl border border-cyan/30 bg-cyan/5 p-4 font-serif text-muted">
            {t("allDownloaded")}
          </p>
        ) : (
          availableChapters.map((chapter) => {
            const record = recordsBySlug.get(chapter.slug);
            const busy = busyId === record?.id || busyId === "all";
            const actionLabel =
              record?.status === "downloading"
                ? t("cancel")
                : record?.status === "failed"
                  ? t("retry")
                  : t("download");
            return (
              <article
                key={chapter.slug}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface/30 p-4"
              >
                <div className="min-w-0 flex-1">
                  <OfflineAwareLink
                    href={`/${locale}/chapters/${chapter.slug}`}
                    locale={locale}
                    slug={chapter.slug}
                    className="font-display text-base text-foreground no-underline hover:text-cyan"
                  >
                    {chapter.title}
                  </OfflineAwareLink>
                  {record?.status === "failed" ? (
                    <p className="mt-1 font-sans text-xs text-red-200">
                      {record.error ?? t("failed")}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={!ready || busy}
                  onClick={() => {
                    if (record?.status === "downloading") {
                      void run(record.id, () => cancel(record.locale, record.slug));
                      return;
                    }
                    void run(`${locale}:${chapter.slug}`, () => download(locale, chapter.slug));
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan/40 px-3 py-1.5 font-sans text-xs text-cyan hover:bg-cyan/10 disabled:cursor-wait disabled:opacity-50"
                  aria-label={actionLabel}
                >
                  {record?.status === "downloading" ? (
                    <X size={14} aria-hidden />
                  ) : record?.status === "failed" ? (
                    <RefreshCw size={14} aria-hidden />
                  ) : (
                    <Download size={14} aria-hidden />
                  )}
                  {actionLabel}
                </button>
              </article>
            );
          })
        )}
      </section>

      <button
        type="button"
        onClick={() => void refresh()}
        className="font-sans text-xs uppercase tracking-wider text-subtle hover:text-cyan"
      >
        {t("refresh")}
      </button>
    </div>
  );
}
