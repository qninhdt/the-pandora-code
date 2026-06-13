"use client";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { CommandPalette } from "@/components/search/command-palette";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { Github, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const REPO_URL = "https://github.com/qninhdt/the-pandora-code";

// A single frosted-glass pill nav floating at top-center - balanced on every
// breakpoint. Desktop shows the links inline; mobile opens a full-screen
// bioluminescent overlay (no drawer/sidebar) with oversized glowing links.
export function FloatingDock() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const base = `/${locale}`;
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the overlay on navigation.
  // biome-ignore lint/correctness/useExhaustiveDependencies: close on path change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll + close on Escape while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const brand = t("site.name");
  const links = [
    { href: `${base}/chapters`, label: t("nav.chapters") },
    { href: `${base}/glossary`, label: t("nav.glossary") },
    { href: `${base}/author`, label: t("nav.authors") },
    { href: `${base}/timeline`, label: t("nav.timeline") },
  ];
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4"
      style={{ willChange: "transform" }}
    >
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
        <Link href={base} className="flex items-center gap-3 pl-1 pr-1" aria-label={brand}>
          <BrandEmblem priority />
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
          <CommandPalette />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="grid size-9 place-items-center rounded-full border border-border text-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            <Github size={17} />
          </a>
          <LocaleSwitcher />
          {/* Mobile menu trigger */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-full border border-cyan/40 bg-cyan/10 text-cyan transition-colors hover:bg-cyan/20 md:hidden"
            style={{ boxShadow: "0 0 16px -4px color-mix(in oklab, var(--cyan) 60%, transparent)" }}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <MobileOverlay
        open={open}
        onClose={() => setOpen(false)}
        brand={brand}
        links={links}
        isActive={isActive}
      />
    </header>
  );
}

interface MobileOverlayProps {
  open: boolean;
  onClose: () => void;
  brand: string;
  links: { href: string; label: string }[];
  isActive: (href: string) => boolean;
}

// Full-screen bioluminescent menu: a deep-void blurred backdrop lit by radial
// glows, with oversized links that slide in. Replaces the old right-side drawer.
function MobileOverlay({ open, onClose, brand, links, isActive }: MobileOverlayProps) {
  const t = useTranslations("common");
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      {/* Glowing void backdrop */}
      <div
        className="absolute inset-0 bg-void/90 backdrop-blur-2xl"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 20% 15%, color-mix(in oklab, var(--cyan) 22%, transparent), transparent 70%), radial-gradient(55% 45% at 90% 85%, color-mix(in oklab, var(--teal) 18%, transparent), transparent 70%)",
        }}
        onClick={onClose}
      />

      <div className="relative flex h-full flex-col px-7 pb-12 pt-6">
        {/* Top row: brand + close */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <BrandEmblem />
            <span className="font-display text-sm font-700 tracking-tight text-foreground">
              {brand}
            </span>
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-border-strong bg-surface/60 text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Oversized links */}
        <nav className="mt-auto flex flex-col gap-1">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              onClick={onClose}
              className={cn(
                "border-b border-border/40 py-4 font-display text-3xl font-700 tracking-tight transition-all duration-500",
                open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                isActive(l.href) ? "text-cyan" : "text-foreground/85 hover:text-cyan",
              )}
              style={{
                transitionDelay: open ? `${100 + i * 60}ms` : "0ms",
                textShadow: isActive(l.href)
                  ? "0 0 20px color-mix(in oklab, var(--cyan) 55%, transparent)"
                  : undefined,
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex items-center gap-3">
          <LocaleSwitcher />
          <span className="font-sans text-xs uppercase tracking-[0.25em] text-subtle">
            {t("language")}
          </span>
        </div>
      </div>
    </div>
  );
}

function BrandEmblem({ priority = false }: { priority?: boolean }) {
  return (
    <span
      aria-hidden
      className="relative size-9 shrink-0 overflow-hidden rounded-full border border-cyan/35 bg-void/80 shadow-[0_0_18px_-6px_color-mix(in_oklab,var(--cyan)_70%,transparent)]"
    >
      <Image
        src="/logo.png"
        alt=""
        fill
        sizes="36px"
        priority={priority}
        className="object-cover"
      />
    </span>
  );
}
