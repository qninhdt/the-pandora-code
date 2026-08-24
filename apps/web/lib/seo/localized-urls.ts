import { type Locale, locales } from "@/i18n/config";
import { getSiteUrl } from "./site-url";

export interface LocalizedUrlInput {
  locale: Locale;
  path: string;
  availableLocales?: readonly Locale[];
}

export interface LocalizedUrls {
  canonical: string;
  languages: Record<string, string>;
}

function normalizePath(path: string): string {
  if (path === "" || path === "/") return "";
  return `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

export function localizedUrl(locale: Locale, path: string, base = getSiteUrl()): string {
  return `${base.replace(/\/+$/, "")}/${locale}${normalizePath(path)}`;
}

export function buildLocalizedUrls({
  locale,
  path,
  availableLocales = locales,
}: LocalizedUrlInput): LocalizedUrls {
  const languages: Record<string, string> = {};
  for (const loc of availableLocales) languages[loc] = localizedUrl(loc, path);
  return { canonical: localizedUrl(locale, path), languages };
}
