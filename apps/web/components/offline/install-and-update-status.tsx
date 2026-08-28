"use client";

import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useOffline } from "./offline-provider";

const INSTALL_PROMPT_DISMISSED_KEY = "pandora:install-prompt-dismissed:v1";

function readInstallPromptDismissal() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function InstallAndUpdateStatus() {
  const t = useTranslations("offline");
  const { supported, installAvailable, iosInstallHint, install } = useOffline();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(readInstallPromptDismissal());
  }, []);

  if (!supported || (!installAvailable && !iosInstallHint) || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "1");
    } catch {
      // Private browsing modes may deny storage; the local state still hides it
      // for the current session.
    }
  };

  return (
    <output
      aria-live="polite"
      className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md flex-col items-stretch gap-2 rounded-xl border border-cyan/40 bg-void/95 px-4 py-3 font-sans text-sm text-foreground shadow-2xl sm:flex-row sm:items-center sm:gap-3"
    >
      <span className="min-w-0 flex-1 leading-5 sm:whitespace-nowrap">
        {iosInstallHint ? t("iosInstallHint") : t("installAvailable")}
      </span>
      <div className="flex shrink-0 justify-end gap-2">
        {installAvailable ? (
          <button
            type="button"
            onClick={() => void install()}
            className="inline-flex items-center gap-2 rounded-full bg-cyan px-3 py-1.5 text-xs font-semibold text-void hover:bg-teal"
          >
            <Download size={13} aria-hidden />
            {t("installNow")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("dismiss")}
          title={t("dismiss")}
          className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <X size={16} aria-hidden />
        </button>
      </div>
    </output>
  );
}
