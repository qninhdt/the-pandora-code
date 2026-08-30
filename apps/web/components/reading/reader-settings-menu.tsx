"use client";

import { ReadingPreferences } from "@/components/reading/reading-preferences";
import { cn } from "@/lib/utils";
import { Type, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useState } from "react";

/**
 * Floating reader-settings control, pinned bottom-right so it mirrors the
 * table-of-contents button in the opposite corner and never competes with the
 * top nav for width.
 *
 * Positioning is delegated to Radix rather than hand-written offsets: the panel
 * must flip and shift to stay on screen in a short window, in a narrow one, and
 * with devtools docked — an `absolute bottom-14 right-0` panel silently hangs
 * off the viewport in all three. Radix also portals the panel out of the fixed
 * trigger, so no ancestor can clip it.
 */
interface ReaderSettingsMenuProps {
  className?: string;
  variant?: "floating" | "dock";
}

export function ReaderSettingsMenu({ className, variant = "floating" }: ReaderSettingsMenuProps) {
  const t = useTranslations("reader");
  const [open, setOpen] = useState(false);
  const dock = variant === "dock";

  return (
    <div
      data-global-reader-settings={dock ? undefined : ""}
      className={cn(dock ? "relative" : "fixed right-5 bottom-5 z-40 print:hidden", className)}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger
          aria-label={t("title")}
          className={cn(
            "grid place-items-center rounded-full text-cyan transition-colors hover:bg-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50",
            dock ? "size-11" : "size-12 border border-cyan/50 bg-void/85 backdrop-blur-xl",
          )}
          style={
            dock
              ? undefined
              : {
                  boxShadow: "0 8px 32px -8px color-mix(in oklab, var(--cyan) 60%, transparent)",
                }
          }
        >
          {open ? <X size={20} aria-hidden /> : <Type size={20} aria-hidden />}
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side="top"
            align={dock ? "center" : "end"}
            sideOffset={12}
            collisionPadding={12}
            className={cn(
              // Never wider than the viewport gutters, and never taller than the
              // space Radix reports as available — the body scrolls, so a panel
              // that overflows cannot be scrolled back into view.
              "z-50 w-[min(19rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-2xl border border-border-strong bg-void/97 shadow-2xl backdrop-blur-xl outline-hidden",
              "max-h-[min(var(--radix-popover-content-available-height),32rem)]",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            )}
          >
            <p className="px-4 pt-3 font-sans text-[0.6875rem] uppercase tracking-wider text-subtle">
              {t("title")}
            </p>
            <ReadingPreferences />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}
