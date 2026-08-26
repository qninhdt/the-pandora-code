"use client";

import {
  DEFAULT_READING_PREFERENCES,
  READER_LINE_SPACINGS,
  READER_PREFERENCE_LIMITS,
  type ReaderFont,
  type ReaderLineSpacing,
  setReadingPreferences,
  stepFontScale,
  useApplyReadingPreferences,
  useReadingPreferenceActions,
} from "@/lib/engagement/preferences-store";
import { cn } from "@/lib/utils";
import {
  AlignJustify,
  Minus,
  MoveHorizontal,
  Plus,
  RotateCcw,
  TypeOutline,
  Waves,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface ReadingPreferencesProps {
  className?: string;
}

const FONT_TILES: { id: ReaderFont; className: string }[] = [
  { id: "sans", className: "font-sans" },
  { id: "serif", className: "font-serif" },
  { id: "mono", className: "font-mono" },
];

const rowClassName = "flex items-center justify-between gap-4 px-3 py-2";
const rowLabelClassName = "flex min-w-0 items-center gap-2.5 font-sans text-sm text-foreground";

/**
 * Reader typography controls, shaped like Notion's page-style menu: pick a
 * typeface, step the text size, widen the column, calm the motion. Each control
 * is a discrete choice — the previous free-form sliders let a reader land on
 * values that simply looked broken, and nobody needs 1.73 line-height.
 */
export function ReadingPreferences({ className }: ReadingPreferencesProps) {
  const t = useTranslations("reader");
  const preferences = useApplyReadingPreferences();
  const { reset } = useReadingPreferenceActions();
  const { min, max } = READER_PREFERENCE_LIMITS.fontScale;
  const percent = Math.round(preferences.fontScale * 100);

  const apply = (next: Parameters<typeof setReadingPreferences>[0]) => {
    setReadingPreferences(next);
  };

  return (
    <div className={cn("w-full font-sans", className)}>
      {/* Typeface tiles: each previews itself, so the choice is visible. */}
      <fieldset className="grid grid-cols-3 gap-1 p-2">
        <legend className="sr-only">{t("typeface")}</legend>
        {FONT_TILES.map((tile) => {
          const active = preferences.fontFamily === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              aria-pressed={active}
              onClick={() => apply({ fontFamily: tile.id })}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 transition-colors",
                active
                  ? "border-cyan/60 bg-cyan/10"
                  : "border-transparent hover:border-border hover:bg-surface-raised/60",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "text-xl leading-none",
                  tile.className,
                  active ? "text-cyan" : "text-foreground",
                )}
              >
                Ag
              </span>
              <span className={cn("text-[0.6875rem]", active ? "text-cyan" : "text-subtle")}>
                {t(`font.${tile.id}`)}
              </span>
            </button>
          );
        })}
      </fieldset>

      <div className="h-px bg-border" />

      <div className="py-1">
        <div className={rowClassName}>
          <span className={rowLabelClassName}>
            <TypeOutline size={15} aria-hidden className="shrink-0 text-subtle" />
            {t("textSize")}
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-lg border border-border">
            <StepButton
              label={t("textSizeDecrease")}
              disabled={preferences.fontScale <= min + 1e-6}
              onClick={() => stepFontScale(-1)}
            >
              <Minus size={13} aria-hidden />
            </StepButton>
            <output className="w-11 text-center text-xs tabular-nums text-foreground">
              {percent}%
            </output>
            <StepButton
              label={t("textSizeIncrease")}
              disabled={preferences.fontScale >= max - 1e-6}
              onClick={() => stepFontScale(1)}
            >
              <Plus size={13} aria-hidden />
            </StepButton>
          </span>
        </div>

        <div className={rowClassName}>
          <span className={rowLabelClassName}>
            <AlignJustify size={15} aria-hidden className="shrink-0 text-subtle" />
            {t("lineSpacing")}
          </span>
          <span className="flex shrink-0 overflow-hidden rounded-lg border border-border">
            {READER_LINE_SPACINGS.map((step: ReaderLineSpacing) => {
              const active = preferences.lineSpacing === step;
              return (
                <button
                  key={step}
                  type="button"
                  aria-pressed={active}
                  // The visible label is one word, so name the control it belongs
                  // to as well — three bare adjectives mean nothing read aloud.
                  aria-label={`${t("lineSpacing")}: ${t(`spacing.${step}`)}`}
                  onClick={() => apply({ lineSpacing: step })}
                  className={cn(
                    "px-2.5 py-1 text-[0.6875rem] transition-colors",
                    active ? "bg-cyan/15 text-cyan" : "text-subtle hover:bg-surface-raised",
                  )}
                >
                  {t(`spacing.${step}`)}
                </button>
              );
            })}
          </span>
        </div>

        <Toggle
          icon={<MoveHorizontal size={15} aria-hidden className="shrink-0 text-subtle" />}
          label={t("fullWidth")}
          checked={preferences.fullWidth}
          onChange={(checked) => apply({ fullWidth: checked })}
        />

        <Toggle
          icon={<Waves size={15} aria-hidden className="shrink-0 text-subtle" />}
          label={t("reduceMotion")}
          checked={preferences.reducedMotion === "reduce"}
          onChange={(checked) =>
            // "off" means no explicit override, not "force animation on": the
            // reader's OS setting should still win when they have one.
            apply({ reducedMotion: checked ? "reduce" : DEFAULT_READING_PREFERENCES.reducedMotion })
          }
        />
      </div>

      <div className="h-px bg-border" />

      <div className="p-1">
        <button
          type="button"
          onClick={reset}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-sans text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
        >
          <RotateCcw size={15} aria-hidden className="shrink-0 text-subtle" />
          {t("reset")}
        </button>
      </div>
    </div>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 place-items-center text-muted transition-colors hover:text-foreground disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// A switch rather than a checkbox: it reads as an immediate on/off, matching the
// reference design, and carries its own accessible state.
function Toggle({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={rowClassName}>
      <span className={rowLabelClassName}>
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-cyan" : "bg-border-strong",
        )}
      >
        {/* Anchor the knob with an explicit `left`: without one, an absolutely
            positioned child falls back to its static inline position, which the
            button's own text metrics can shift outside the track. */}
        <span
          aria-hidden
          className={cn(
            "absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}
