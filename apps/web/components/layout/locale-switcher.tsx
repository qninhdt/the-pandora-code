"use client";

import { type Locale, locales } from "@/i18n/config";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

interface LocaleSwitcherProps {
  current: Locale;
  /** Stack vertically (for the collapsed instrument rail). */
  vertical?: boolean;
}

const labels: Record<Locale, string> = { vi: "VI", en: "EN" };

// Segmented pill that swaps the leading locale segment of the current path. The
// active locale rides a glowing cyan capsule; the inactive one stays subtle.
export function LocaleSwitcher({ current, vertical = false }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === current) return;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      startTransition(() => router.push(`/${next}`));
      return;
    }
    segments[0] = next;
    startTransition(() => router.push(`/${segments.join("/")}`));
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-border bg-surface/60 p-0.5 backdrop-blur ${
        vertical ? "flex-col" : ""
      }`}
    >
      {locales.map((l) => {
        const active = l === current;
        return (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            disabled={pending}
            aria-current={active ? "page" : undefined}
            className="relative rounded-full px-2.5 py-1 font-sans text-xs font-semibold tracking-wide transition-colors disabled:opacity-60"
            style={
              active
                ? {
                    color: "var(--void)",
                    background: "var(--cyan)",
                    boxShadow: "0 0 16px -4px color-mix(in oklab, var(--cyan) 80%, transparent)",
                  }
                : { color: "var(--muted)" }
            }
          >
            {labels[l]}
          </button>
        );
      })}
    </div>
  );
}
