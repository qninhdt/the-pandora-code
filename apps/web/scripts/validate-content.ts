#!/usr/bin/env tsx
import { validateAllContent } from "../lib/content/validation/build-validator";

const report = validateAllContent();

console.log("[validate-content] Counts:", report.counts);
console.log(`[validate-content] Reading-time estimates: ${report.readingTime.estimates.length}`);

if (report.warnings.length > 0) {
  console.warn("\n[validate-content] Warnings:\n");
  for (const warning of report.warnings) console.warn(`- ${warning}`);
}

if (!report.ok) {
  console.error("\n[validate-content] FAILED with the following errors:\n");
  for (const error of report.errors) {
    console.error(error);
    console.error("");
  }
  process.exit(1);
}

console.log("[validate-content] OK - all content valid.");
process.exit(0);
