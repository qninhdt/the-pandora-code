#!/usr/bin/env tsx
import { validateAllContent } from "../lib/content/validation/build-validator";

const report = validateAllContent();

console.log("[validate-content] Counts:", report.counts);

if (!report.ok) {
  console.error("\n[validate-content] FAILED with the following errors:\n");
  for (const error of report.errors) {
    console.error(error);
    console.error("");
  }
  process.exit(1);
}

console.log("[validate-content] OK — all content valid.");
process.exit(0);
