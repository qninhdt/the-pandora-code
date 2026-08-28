"use client";

import type { Locale } from "@/i18n/config";
import { Github } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// A quiet horizon at the foot of every page - a thin bioluminescent rule, the
// Bardabez byline, the in-world tagline, and the locale.
export function SiteFooter() {
  const locale = useLocale() as Locale;
  const base = `/${locale}`;
  const t = useTranslations();
  const pathname = usePathname();
  const isLanding = pathname === base || pathname === `${base}/`;
  return (
    <footer className="relative isolate mt-24 border-t border-border">
      {isLanding && (
        <>
          {/* Continue the closing horizon through the margin and footer so the
              page does not fall back to a separate flat background band. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 bottom-0 -z-10 overflow-hidden"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
            }}
          >
            <Image
              src="/images/pages/cta-horizon.webp"
              alt=""
              fill
              loading="lazy"
              decoding="async"
              sizes="100vw"
              quality={68}
              className="size-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, color-mix(in oklab, var(--void) 36%, transparent) 0%, color-mix(in oklab, var(--void) 22%, transparent) 34%, color-mix(in oklab, var(--void) 58%, transparent) 100%), linear-gradient(to right, color-mix(in oklab, var(--void) 45%, transparent), transparent 60%, color-mix(in oklab, var(--void) 35%, transparent))",
              }}
            />
          </div>
        </>
      )}
      {/* faint glowing horizon line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--cyan) 60%, transparent), transparent)",
        }}
      />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between">
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
          <p className="mt-3 font-serif text-sm leading-relaxed text-muted">{t("site.tagline")}</p>
          <p className="mt-4 max-w-sm font-sans text-xs italic leading-relaxed text-subtle/70">
            {t("footer.disclaimer")}
          </p>
        </div>
        <div className="flex flex-col gap-2 font-sans text-xs text-subtle md:items-end">
          <div className="flex gap-4">
            <Link href={`${base}/chapters`} className="text-muted hover:text-foreground">
              {t("nav.chapters")}
            </Link>
            <Link href={`${base}/glossary`} className="text-muted hover:text-foreground">
              {t("nav.glossary")}
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
            {t("footer.copyright", { year: new Date().getFullYear() })} ·{" "}
            <span className="uppercase">{locale}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
