import { getSiteUrl } from "./site-url";

export type JsonLdPrimitive = string | number | boolean | null;
export type JsonLdValue = JsonLdPrimitive | JsonLdNode | JsonLdValue[];
export interface JsonLdNode {
  [key: string]: JsonLdValue;
}
export interface JsonLdObject {
  "@context": "https://schema.org";
  "@type": string | string[];
  [key: string]: JsonLdValue;
}

export interface BreadcrumbSchemaItem {
  name: string;
  item?: string;
}

export interface ArticleSchemaInput {
  url: string;
  headline: string;
  description: string;
  image?: string | readonly string[];
  author: { name: string; url?: string } | readonly { name: string; url?: string }[];
}

export interface ProfilePageSchemaInput {
  url: string;
  name: string;
  description: string;
  image?: string;
  sameAs?: readonly string[];
}

function absoluteUrl(value: string): string {
  const parsed = new URL(value, getSiteUrl());
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Structured-data URL must use http or https: ${value}`);
  }
  return parsed.toString();
}

function requiredText(value: string, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Structured-data ${field} must be non-empty`);
  }
  return value.trim();
}

export function createWebSiteSchema(input: {
  name: string;
  url?: string;
  alternateName?: string;
}): JsonLdObject {
  const name = requiredText(input.name, "name");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: absoluteUrl(input.url ?? getSiteUrl()),
    ...(input.alternateName
      ? { alternateName: requiredText(input.alternateName, "alternateName") }
      : {}),
  };
}

export function createArticleSchema(input: ArticleSchemaInput): JsonLdObject {
  const authors = Array.isArray(input.author) ? input.author : [input.author];
  if (authors.length === 0) throw new Error("Structured-data Article requires an author");
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: requiredText(input.headline, "headline"),
    description: requiredText(input.description, "description"),
    url: absoluteUrl(input.url),
    author: authors.map((author) => ({
      "@type": "Person",
      name: requiredText(author.name, "author.name"),
      ...(author.url ? { url: absoluteUrl(author.url) } : {}),
    })),
    ...(input.image
      ? {
          image: (Array.isArray(input.image) ? input.image : [input.image]).map(absoluteUrl),
        }
      : {}),
  };
}

export function createBreadcrumbListSchema(items: readonly BreadcrumbSchemaItem[]): JsonLdObject {
  if (items.length === 0) throw new Error("Structured-data BreadcrumbList requires an item");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: requiredText(item.name, "breadcrumb.name"),
      ...(item.item ? { item: absoluteUrl(item.item) } : {}),
    })),
  };
}

export function createProfilePageSchema(input: ProfilePageSchemaInput): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(input.url),
    mainEntity: {
      "@type": "Person",
      name: requiredText(input.name, "name"),
      description: requiredText(input.description, "description"),
      ...(input.image ? { image: absoluteUrl(input.image) } : {}),
      ...(input.sameAs?.length ? { sameAs: input.sameAs.map(absoluteUrl) } : {}),
    },
  };
}

function assertJsonLdValue(value: unknown, path: string): asserts value is JsonLdValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((child, index) => assertJsonLdValue(child, `${path}[${index}]`));
    return;
  }
  if (typeof value !== "object") throw new Error(`Invalid JSON-LD value at ${path}`);
  for (const [key, child] of Object.entries(value)) assertJsonLdValue(child, `${path}.${key}`);
}

export function validateJsonLd(
  value: unknown,
): asserts value is JsonLdObject | readonly JsonLdObject[] {
  const candidates: unknown[] = Array.isArray(value) ? [...value] : [value];
  if (candidates.length === 0) throw new Error("JSON-LD cannot be empty");
  for (const [index, candidate] of candidates.entries()) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new Error(`JSON-LD schema ${index} must be an object`);
    }
    const record = candidate as Record<string, unknown>;
    if (record["@context"] !== "https://schema.org") {
      throw new Error(`JSON-LD schema ${index} must use schema.org context`);
    }
    if (typeof record["@type"] !== "string" && !Array.isArray(record["@type"])) {
      throw new Error(`JSON-LD schema ${index} must have a type`);
    }
    assertJsonLdValue(candidate, `$[${index}]`);
  }
}
