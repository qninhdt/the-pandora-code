"use client";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SiteHeaderProps {
  brand: string;
  nav: { chapters: string; glossary: string; authors: string; timeline: string };
}

export function SiteHeader({ brand, nav }: SiteHeaderProps) {
  const locale = useLocale() as Locale;
  const base = `/${locale}`;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Header gains a stronger backdrop once the reader scrolls off the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger
  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: `${base}/chapters`, label: nav.chapters },
    { href: `${base}/glossary`, label: nav.glossary },
    { href: `${base}/author`, label: nav.authors },
    { href: `${base}/timeline`, label: nav.timeline },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled
          ? "border-border-strong bg-void/80 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href={base} className="group flex items-center gap-2.5" aria-label={brand}>
          <span
            aria-hidden
            className="size-2.5 rounded-full transition-transform duration-300 group-hover:scale-125"
            style={{ background: "var(--cyan)", boxShadow: "0 0 12px 1px var(--cyan)" }}
          />
          <span className="font-display text-[0.95rem] font-700 tracking-tight text-foreground">
            {brand}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <HeaderLink key={l.href} href={l.href} active={pathname === l.href}>
              {l.label}
            </HeaderLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted hover:text-foreground md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-void/95 px-4 py-3 backdrop-blur-xl md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-lg px-3 py-2.5 font-sans text-sm text-muted hover:bg-surface hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function HeaderLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative font-sans text-sm transition-colors",
        active ? "text-foreground" : "text-muted hover:text-foreground",
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-1.5 left-0 h-px w-full origin-left transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0",
        )}
        style={{ background: "var(--cyan)", boxShadow: "0 0 8px 0 var(--cyan)" }}
      />
    </Link>
  );
}
