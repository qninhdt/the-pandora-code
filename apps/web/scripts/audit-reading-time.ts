#!/usr/bin/env tsx
import { validateAllContent } from "../lib/content/validation/build-validator";

const report = validateAllContent();
const json = process.argv.includes("--json");

if (json) {
  console.log(JSON.stringify(report.readingTime.estimates, null, 2));
} else {
  console.log("slug\tlocale\tminutes\ttextUnits\tbaseMinutes\tvisualMinutes\tfigures\tinteractive");
  for (const estimate of report.readingTime.estimates) {
    const { diagnostics } = estimate;
    console.log(
      [
        estimate.slug,
        estimate.locale,
        estimate.minutes,
        diagnostics.textUnits,
        diagnostics.baseMinutes.toFixed(2),
        diagnostics.visualMinutes.toFixed(2),
        diagnostics.figureCount,
        diagnostics.interactiveBlockCount,
      ].join("\t"),
    );
  }
  if (report.warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of report.warnings) console.log(`- ${warning}`);
  }
  if (report.errors.length > 0) {
    console.log("\nErrors:");
    for (const error of report.errors) console.log(`- ${error}`);
  }
}

process.exit(report.ok ? 0 : 1);
