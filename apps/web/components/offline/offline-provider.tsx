"use client";

import {
  activateWaitingWorker,
  clearDevelopmentOfflineState,
  getOfflineStatus,
  isOfflineSupported,
  registerOfflineWorker,
  sendOfflineRequest,
} from "@/lib/offline/client";
import {
  OFFLINE_PROTOCOL_VERSION,
  type OfflineChapterRecord,
  type OfflineLocale,
} from "@/lib/offline/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface OfflineContextValue {
  supported: boolean;
  ready: boolean;
  installAvailable: boolean;
  iosInstallHint: boolean;
  storageEstimate: { usage: number; quota: number } | null;
  records: OfflineChapterRecord[];
  refresh: () => Promise<void>;
  download: (
    locale: OfflineLocale,
    slug: string,
    onProgress?: (completed: number, total: number) => void,
  ) => Promise<boolean>;
  remove: (locale: OfflineLocale, slug: string) => Promise<boolean>;
  cancel: (locale: OfflineLocale, slug: string) => Promise<boolean>;
  install: () => Promise<void>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  // Keep the first client render identical to the server render. Capability is
  // detected after hydration so offline controls do not introduce a mismatch.
  const [supported, setSupported] = useState(false);
  const [ready, setReady] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosInstallHint, setIosInstallHint] = useState(false);
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(
    null,
  );
  const [records, setRecords] = useState<OfflineChapterRecord[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      void clearDevelopmentOfflineState()
        .then((changed) => {
          // Unregistering does not remove the current controller until the
          // next navigation. Reload once so an old dev worker cannot serve one
          // final stale document.
          if (changed && navigator.serviceWorker.controller) window.location.reload();
        })
        .catch(() => undefined);
    }
    setSupported(isOfflineSupported());
    if (typeof navigator !== "undefined") {
      const standalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
      setIosInstallHint(/iPad|iPhone|iPod/.test(navigator.userAgent) && !standalone);
    }
  }, []);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const refresh = useCallback(async () => {
    if (!supported) return;
    const local = await getOfflineStatus();
    setRecords(local);
    const estimate = await navigator.storage?.estimate?.();
    setStorageEstimate(
      estimate?.quota ? { usage: estimate.usage ?? 0, quota: estimate.quota } : null,
    );
    try {
      const response = await sendOfflineRequest({
        type: "GET_STATUS",
        protocolVersion: OFFLINE_PROTOCOL_VERSION,
      });
      if (response.type === "STATUS") setRecords(response.records);
    } catch {
      // The UI remains usable if the worker is unavailable during first boot.
    }
    setReady(true);
  }, [supported]);

  useEffect(() => {
    void refresh();
    if (!supported) return;

    let disposed = false;
    let registration: ServiceWorkerRegistration | null = null;
    let installing: ServiceWorker | null = null;
    let activatingUpdate = false;

    const activateUpdate = async () => {
      if (
        disposed ||
        activatingUpdate ||
        !registration?.waiting ||
        !navigator.serviceWorker.controller
      ) {
        return;
      }
      activatingUpdate = true;
      try {
        if ((await activateWaitingWorker(registration)) && !disposed) window.location.reload();
      } catch {
        // A superseded or failed worker will be retried by the next update check.
        activatingUpdate = false;
      }
    };

    const onInstallingStateChange = () => {
      if (installing?.state === "installed") void activateUpdate();
    };

    const onUpdateFound = () => {
      installing?.removeEventListener("statechange", onInstallingStateChange);
      installing = registration?.installing ?? null;
      installing?.addEventListener("statechange", onInstallingStateChange);
      onInstallingStateChange();
    };

    const checkForUpdate = () => {
      if (document.visibilityState === "visible") {
        const update = registration?.update();
        void update?.catch(() => undefined);
      }
    };

    const observeUpdates = async () => {
      try {
        registration = await registerOfflineWorker();
        if (!registration || disposed) return;
        registration.addEventListener("updatefound", onUpdateFound);
        onUpdateFound();
        // Cover registrations returned from another caller during this render.
        await registration.update().catch(() => undefined);
        await activateUpdate();
      } catch {
        // IndexedDB remains the source of truth when worker registration is
        // temporarily unavailable (for example during an update).
      }
    };

    void observeUpdates();
    window.addEventListener("focus", checkForUpdate);
    document.addEventListener("visibilitychange", checkForUpdate);
    return () => {
      disposed = true;
      registration?.removeEventListener("updatefound", onUpdateFound);
      installing?.removeEventListener("statechange", onInstallingStateChange);
      window.removeEventListener("focus", checkForUpdate);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, [refresh, supported]);

  const download = useCallback(
    async (
      locale: OfflineLocale,
      slug: string,
      onProgress?: (completed: number, total: number) => void,
    ) => {
      const response = await sendOfflineRequest(
        { type: "DOWNLOAD_CHAPTER", protocolVersion: OFFLINE_PROTOCOL_VERSION, locale, slug },
        (progress) => onProgress?.(progress.completed, progress.total),
      );
      await refresh();
      return response.type === "RESULT" && response.ok;
    },
    [refresh],
  );

  const remove = useCallback(
    async (locale: OfflineLocale, slug: string) => {
      const response = await sendOfflineRequest({
        type: "DELETE_CHAPTER",
        protocolVersion: OFFLINE_PROTOCOL_VERSION,
        locale,
        slug,
      });
      await refresh();
      return response.type === "RESULT" && response.ok;
    },
    [refresh],
  );

  const cancel = useCallback(
    async (locale: OfflineLocale, slug: string) => {
      const response = await sendOfflineRequest({
        type: "CANCEL_DOWNLOAD",
        protocolVersion: OFFLINE_PROTOCOL_VERSION,
        locale,
        slug,
      });
      await refresh();
      return response.type === "RESULT" && response.ok;
    },
    [refresh],
  );

  const install = useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }, [installEvent]);

  const value = useMemo<OfflineContextValue>(
    () => ({
      supported,
      ready,
      installAvailable: Boolean(installEvent),
      iosInstallHint,
      storageEstimate,
      records,
      refresh,
      download,
      remove,
      cancel,
      install,
    }),
    [
      supported,
      ready,
      installEvent,
      iosInstallHint,
      storageEstimate,
      records,
      refresh,
      download,
      remove,
      cancel,
      install,
    ],
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline(): OfflineContextValue {
  const value = useContext(OfflineContext);
  if (!value) throw new Error("useOffline must be used inside OfflineProvider");
  return value;
}
