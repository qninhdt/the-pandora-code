import type { Locale } from "@/i18n/config";
import { Github } from "lucide-react";
import Link from "next/link";

interface SiteFooterProps {
  locale: Locale;
  tagline: string;
  copyright: string;
  disclaimer: string;
}

// A quiet horizon at the foot of every page - a thin bioluminescent rule, the
// Bardabez byline, the in-world tagline, and the locale.
export function SiteFooter({ locale, tagline, copyright, disclaimer }: SiteFooterProps) {
  const base = `/${locale}`;
  return (
    <footer className="relative mt-24 border-t border-border">
      {/* faint glowing horizon line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--cyan) 60%, transparent), transparent)",
        }}
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{
                background: "var(--teal)",
                boxShadow: "0 0 10px 0 var(--teal)",
              }}
            />
            <span className="font-display text-sm font-600 text-foreground">Bardabez</span>
          </div>
          <p className="mt-3 font-serif text-sm leading-relaxed text-muted">{tagline}</p>
          <p className="mt-4 max-w-sm font-sans text-xs italic leading-relaxed text-subtle/70">
            {disclaimer}
          </p>
        </div>
        <div className="flex flex-col gap-2 font-sans text-xs text-subtle md:items-end">
          <div className="flex gap-4">
            <Link href={`${base}/chapters`} className="text-muted hover:text-foreground">
              Chapters
            </Link>
            <Link href={`${base}/glossary`} className="text-muted hover:text-foreground">
              Glossary
            </Link>
            <a
              href="https://github.com/qninhdt/the-pandora-code"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-muted hover:text-foreground"
            >
              <Github size={13} />
              GitHub
            </a>
          </div>
          <p className="tracking-wide">
            {copyright} · <span className="uppercase">{locale}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
