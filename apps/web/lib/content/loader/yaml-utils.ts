import fs from "node:fs";
import yaml from "js-yaml";
import type { ZodTypeAny, z } from "zod";

export class ContentValidationError extends Error {
  readonly file: string;
  readonly issues: z.ZodIssue[];

  constructor(file: string, issues: z.ZodIssue[]) {
    const summary = issues
      .map((i) => `  - ${i.path.join(".") || "<root>"}: ${i.message}`)
      .join("\n");
    super(`Content validation failed in ${file}:\n${summary}`);
    this.file = file;
    this.issues = issues;
    this.name = "ContentValidationError";
  }
}

export function readYaml<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return yaml.load(raw) as T;
}

export function parseYaml<S extends ZodTypeAny>(schema: S, filePath: string): z.infer<S> {
  const data = readYaml<unknown>(filePath);
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ContentValidationError(filePath, result.error.issues);
  }
  return result.data;
}

export function listYamlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((entry) => entry.endsWith(".yaml") || entry.endsWith(".yml"))
    .map((entry) => entry.replace(/\.ya?ml$/, ""))
    .sort();
}

export function listSubdirectories(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith("."),
    )
    .map((entry) => entry.name)
    .sort();
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
