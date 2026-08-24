"use client";

import { useOffline } from "@/components/offline/offline-provider";
import type { OfflineLocale } from "@/lib/offline/types";
import { Download, RefreshCw, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function OfflineChapterButton({ locale, slug }: { locale: OfflineLocale; slug: string }) {
  const t = useTranslations("offline");
  const { supported, ready, records, download, remove, cancel } = useOffline();
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(false);
  const record = records.find((item) => item.locale === locale && item.slug === slug);

  if (!supported) return null;

  const run = async (operation: () => Promise<boolean>) => {
    setBusy(true);
    setActionError(false);
    try {
      const ok = await operation();
      if (!ok) setActionError(true);
    } catch {
      setActionError(true);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const isDownloading = record?.status === "downloading";
  const label = isDownloading
    ? t("cancel")
    : record?.status === "ready"
      ? t("update")
      : record?.status === "failed"
        ? t("retry")
        : t("download");
  const Icon = isDownloading
    ? X
    : record?.status === "ready"
      ? RefreshCw
      : record?.status === "failed"
        ? RefreshCw
        : Download;

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={!ready || busy}
        onClick={() => {
          void run(() =>
            isDownloading
              ? cancel(locale, slug)
              : download(locale, slug, (completed, total) => setProgress({ completed, total })),
          );
        }}
        className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-void/60 px-3 py-1.5 font-sans text-xs text-cyan transition-colors hover:border-cyan hover:bg-cyan/10 disabled:cursor-wait disabled:opacity-60"
        aria-label={label}
      >
        <Icon size={14} aria-hidden />
        <span>{progress ? `${label} ${progress.completed}/${progress.total}` : label}</span>
      </button>
      {record?.status === "ready" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(() => remove(locale, slug))}
          className="inline-flex size-8 items-center justify-center rounded-full border border-border text-subtle transition-colors hover:border-red-300/50 hover:text-red-200 disabled:opacity-60"
          aria-label={t("remove")}
          title={t("remove")}
        >
          <Trash2 size={14} aria-hidden />
        </button>
      ) : null}
      {actionError ? (
        <span role="alert" className="font-sans text-xs text-red-200">
          {t("actionError")}
        </span>
      ) : null}
    </span>
  );
}
