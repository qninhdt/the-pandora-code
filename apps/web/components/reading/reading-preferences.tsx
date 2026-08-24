"use client";

import {
  READER_PREFERENCE_LIMITS,
  type ReducedMotionPreference,
  setReadingPreferences,
  useApplyReadingPreferences,
  useReadingPreferenceActions,
} from "@/lib/engagement/preferences-store";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface ReadingPreferencesProps {
  className?: string;
  title?: string;
  compact?: boolean;
}

const rangeClassName =
  "w-full accent-[var(--cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan";

export function ReadingPreferences({
  className,
  title = "Reading preferences",
  compact = false,
}: ReadingPreferencesProps) {
  const t = useTranslations("chapter");
  const preferences = useApplyReadingPreferences();
  const { reset } = useReadingPreferenceActions();

  return (
    <section className={cn("space-y-4 font-sans text-sm", className)} aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base text-foreground">{title}</h2>
        <button
          type="button"
          onClick={reset}
          className="text-xs text-subtle underline decoration-border-strong underline-offset-4 hover:text-cyan"
        >
          {t("preferencesReset")}
        </button>
      </div>

      <label className="block space-y-1.5">
        <span className="flex justify-between gap-3 text-muted">
          <span>{t("preferencesTextSize")}</span>
          <output>{Math.round(preferences.fontScale * 100)}%</output>
        </span>
        <input
          aria-label={t("preferencesTextSize")}
          type="range"
          min={READER_PREFERENCE_LIMITS.fontScale.min}
          max={READER_PREFERENCE_LIMITS.fontScale.max}
          step={READER_PREFERENCE_LIMITS.fontScale.step}
          value={preferences.fontScale}
          onChange={(event) => setReadingPreferences({ fontScale: Number(event.target.value) })}
          className={rangeClassName}
        />
      </label>

      {!compact && (
        <>
          <label className="block space-y-1.5">
            <span className="flex justify-between gap-3 text-muted">
              <span>{t("preferencesLineSpacing")}</span>
              <output>{preferences.lineHeight.toFixed(1)}</output>
            </span>
            <input
              aria-label={t("preferencesLineSpacing")}
              type="range"
              min={READER_PREFERENCE_LIMITS.lineHeight.min}
              max={READER_PREFERENCE_LIMITS.lineHeight.max}
              step={READER_PREFERENCE_LIMITS.lineHeight.step}
              value={preferences.lineHeight}
              onChange={(event) =>
                setReadingPreferences({ lineHeight: Number(event.target.value) })
              }
              className={rangeClassName}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="flex justify-between gap-3 text-muted">
              <span>{t("preferencesColumnWidth")}</span>
              <output>{preferences.columnWidth}ch</output>
            </span>
            <input
              aria-label={t("preferencesColumnWidth")}
              type="range"
              min={READER_PREFERENCE_LIMITS.columnWidth.min}
              max={READER_PREFERENCE_LIMITS.columnWidth.max}
              step={READER_PREFERENCE_LIMITS.columnWidth.step}
              value={preferences.columnWidth}
              onChange={(event) =>
                setReadingPreferences({ columnWidth: Number(event.target.value) })
              }
              className={rangeClassName}
            />
          </label>
        </>
      )}

      <label className="flex items-center justify-between gap-3 text-muted">
        <span>{t("preferencesMotion")}</span>
        <select
          aria-label={t("preferencesMotion")}
          value={preferences.reducedMotion}
          onChange={(event) =>
            setReadingPreferences({ reducedMotion: event.target.value as ReducedMotionPreference })
          }
          className="rounded-md border border-border bg-surface-raised px-2 py-1 text-foreground"
        >
          <option value="system">{t("preferencesMotionSystem")}</option>
          <option value="reduce">{t("preferencesMotionReduce")}</option>
          <option value="no-preference">{t("preferencesMotionAllow")}</option>
        </select>
      </label>
    </section>
  );
}
