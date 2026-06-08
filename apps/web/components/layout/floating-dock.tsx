"use client";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface DockNav {
  home: string;
  chapters: string;
  glossary: string;
  authors: string;
  timeline: string;
  parts: string;
}

interface FloatingDockProps {
  locale: Locale;
  brand: string;
  nav: DockNav;
}

// A single frosted-glass pill nav floating at top-center — balanced on every
// breakpoint. Desktop shows the links inline; mobile collapses to brand + a
// menu button opening a drawer. Replaces the off-balance left rail.
export function FloatingDock({ locale, brand, nav }: FloatingDockProps) {
  const pathname = usePathname();
  const base = `/${locale}`;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `${base}/chapters`, label: nav.chapters },
    { href: `${base}/parts`, label: nav.parts },
    { href: `${base}/glossary`, label: nav.glossary },
    { href: `${base}/authors`, label: nav.authors },
    { href: `${base}/timeline`, label: nav.timeline },
  ];
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
      <div
        className={cn(
          "flex w-full max-w-5xl items-center gap-3 rounded-full border px-3 py-2 transition-all duration-300",
          scrolled
            ? "border-border-strong bg-void/75 backdrop-blur-xl"
            : "border-border/60 bg-void/40 backdrop-blur-md",
        )}
        style={
          scrolled
            ? { boxShadow: "0 8px 40px -12px color-mix(in oklab, var(--cyan) 30%, transparent)" }
            : undefined
        }
      >
        {/* Brand */}
        <Link href={base} className="flex items-center gap-2.5 pl-2 pr-1" aria-label={brand}>
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: "var(--cyan)", boxShadow: "0 0 12px 1px var(--cyan)" }}
          />
          <span className="hidden font-display text-sm font-700 tracking-tight text-foreground sm:inline">
            {brand}
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-sans text-sm transition-colors",
                isActive(l.href)
                  ? "bg-surface text-cyan"
                  : "text-muted hover:bg-surface/60 hover:text-foreground",
              )}
              style={
                isActive(l.href)
                  ? { textShadow: "0 0 12px color-mix(in oklab, var(--cyan) 50%, transparent)" }
                  : undefined
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-3">
          <LocaleSwitcher current={locale} />
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Menu"
                className="grid size-9 place-items-center rounded-full border border-border text-muted hover:text-foreground md:hidden"
              >
                <Menu size={18} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-border bg-void/95 backdrop-blur-xl">
              <SheetTitle className="font-display text-base text-foreground">{brand}</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-3 py-2.5 font-sans text-sm",
                      isActive(l.href)
                        ? "bg-surface text-cyan"
                        : "text-muted hover:bg-surface hover:text-foreground",
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
