import type { Locale } from "@/i18n/config";
import MiniSearch from "minisearch";

export interface SearchRecord {
  id: string;
  type: "chapter" | "glossary" | "topic";
  href: string;
  title: string;
  summary: string;
  tags: string[];
}

// Fold Vietnamese (and other) diacritics so "suat phan chieu" matches
// "Suất phản chiếu". MiniSearch lower-cases first; we strip combining marks,
// then map đ→d (a distinct base letter NFD never decomposes — and a very
// common Vietnamese initial). Applied symmetrically to indexed + query terms.
function foldDiacritics(term: string): string {
  return term
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

const miniSearchOptions = {
  fields: ["title", "summary", "tags"],
  storeFields: ["type", "href", "title", "summary", "tags"],
  processTerm: (term: string) => foldDiacritics(term.toLowerCase()),
  searchOptions: {
    boost: { title: 3, tags: 2 },
    prefix: true,
    fuzzy: 0.2,
  },
};

// Lazily fetch + index per locale; cache the built index so the palette only
// pays the network + build cost once per session.
const cache = new Map<Locale, Promise<MiniSearch<SearchRecord>>>();

async function loadIndex(locale: Locale): Promise<MiniSearch<SearchRecord>> {
  let response: Response | undefined;
  try {
    const res = await fetch(`/search/index-${locale}.json`);
    if (res.ok) response = res;
  } catch {
    // Offline fallback below.
  }
  if (!response && typeof caches !== "undefined") {
    response = await caches.match(`/search/index-${locale}.json`, { ignoreSearch: true });
  }
  if (!response) throw new Error(`Failed to load search index for "${locale}"`);
  const records: SearchRecord[] = await response.json();
  const mini = new MiniSearch<SearchRecord>(miniSearchOptions);
  mini.addAll(records);
  return mini;
}

export function getSearchIndex(locale: Locale): Promise<MiniSearch<SearchRecord>> {
  let pending = cache.get(locale);
  if (!pending) {
    pending = loadIndex(locale);
    cache.set(locale, pending);
  }
  return pending;
}

export interface SearchHit extends SearchRecord {
  score: number;
}

export async function search(locale: Locale, query: string, limit = 20): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const mini = await getSearchIndex(locale);
  return mini.search(trimmed).slice(0, limit) as unknown as SearchHit[];
}
