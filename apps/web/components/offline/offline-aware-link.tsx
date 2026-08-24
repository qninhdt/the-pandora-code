"use client";

import type { OfflineLocale } from "@/lib/offline/types";
import Link, { type LinkProps } from "next/link";
import type { MouseEvent } from "react";

interface OfflineAwareLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: LinkProps["href"];
  locale?: OfflineLocale;
  slug?: string;
  children: React.ReactNode;
}

/**
 * A normal Next link online. If the device is offline and the destination is
 * a chapter, use a hard navigation so the worker can return cached HTML (or
 * the offline fallback) instead of asking App Router for an RSC payload.
 */
export function OfflineAwareLink({
  href,
  locale,
  slug,
  onClick,
  children,
  ...props
}: OfflineAwareLinkProps) {
  return (
    <Link
      href={href}
      {...props}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || !locale || !slug || navigator.onLine) return;
        event.preventDefault();
        window.location.assign(typeof href === "string" ? href : String(href));
      }}
    >
      {children}
    </Link>
  );
}
