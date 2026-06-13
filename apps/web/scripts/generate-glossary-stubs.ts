import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Define __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get terms from command line arguments
const terms = process.argv.slice(2);
if (terms.length === 0) {
  console.log("Usage: npx tsx scripts/generate-glossary-stubs.ts <term-slug-1> [term-slug-2] ...");
  process.exit(1);
}

const targetDir = path.resolve(__dirname, "../components/glossary/interactive");
const registryPath = path.join(targetDir, "registry.ts");
const visualizerPath = path.join(targetDir, "visualizer.tsx");

const stubTemplate = (slug: string, className: string) => `"use client";

import React from "react";
import { GlossaryFrame } from "./shared/frame";

interface ${className}Props {
  locale: string;
}

export default function ${className}({ locale }: ${className}Props) {
  const infoText = locale === "vi"
    ? "Mô tả trực quan chi tiết cho thuật ngữ ${slug}."
    : "Detailed interactive visualization for ${slug}.";

  return (
    <GlossaryFrame
      title={locale === "vi" ? "${slug}" : "${slug}"}
      infoText={infoText}
      onReset={() => console.log("Reset ${slug}")}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex items-center justify-center p-6 bg-void/40">
        <div className="text-center">
          <p className="text-sm font-mono text-cyan animate-pulse uppercase tracking-wider mb-2">
            ${slug} visualizer stub
          </p>
          <p className="text-xs text-muted">
            Customize this Tailor-Made (MAY ĐO) component in <code>components/glossary/interactive/${slug}.tsx</code>
          </p>
        </div>
      </div>
    </GlossaryFrame>
  );
}
`;

function toCamelCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Ensure dir exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

for (const term of terms) {
  const fileName = `${term}.tsx`;
  const filePath = path.join(targetDir, fileName);
  const className = toCamelCase(term);

  if (fs.existsSync(filePath)) {
    console.log(`⚠️ Stub file already exists at ${filePath}, skipping.`);
    continue;
  }

  // Write stub component
  fs.writeFileSync(filePath, stubTemplate(term, className), "utf-8");
  console.log(`✓ Generated component stub at ${filePath}`);
}

// Update registry.ts (adds to GLOSSARY_VISUALIZATION_IDS array)
if (fs.existsSync(registryPath)) {
  let registryContent = fs.readFileSync(registryPath, "utf-8");
  const arrayRegex = /export const GLOSSARY_VISUALIZATION_IDS = \[(.*?)\] as const;/s;
  const match = registryContent.match(arrayRegex);

  if (match) {
    const existingTermsStr = match[1];
    const existingTerms = existingTermsStr
      .split(",")
      .map((t) => t.trim().replace(/['"]/g, ""))
      .filter(Boolean);

    for (const term of terms) {
      if (existingTerms.includes(term)) {
        console.log(`⚠️ Term "${term}" already registered in registry.ts, skipping.`);
      } else {
        existingTerms.push(term);
        console.log(`✓ Added "${term}" to GLOSSARY_VISUALIZATION_IDS in registry.ts`);
      }
    }

    const newTermsStr = existingTerms.map((t) => `"${t}"`).join(", ");
    registryContent = registryContent.replace(
      arrayRegex,
      `export const GLOSSARY_VISUALIZATION_IDS = [${newTermsStr}] as const;`,
    );
    fs.writeFileSync(registryPath, registryContent, "utf-8");
  } else {
    console.log("⚠️ Could not match GLOSSARY_VISUALIZATION_IDS array in registry.ts");
  }
} else {
  console.log(`⚠️ registry.ts not found at ${registryPath}`);
}

// Update visualizer.tsx (adds to GLOSSARY_VISUALIZATIONS map)
if (fs.existsSync(visualizerPath)) {
  let visualizerContent = fs.readFileSync(visualizerPath, "utf-8");
  const mapRegex = /(const GLOSSARY_VISUALIZATIONS: Record<[\s\S]*?> = \{)([\s\S]*?)(\};)/;
  const match = visualizerContent.match(mapRegex);

  if (match) {
    const prefix = match[1];
    let mapBody = match[2];
    const suffix = match[3];

    for (const term of terms) {
      // Check if term already in visualizer map
      const termRegex = new RegExp(`['"]?${term}['"]?\\s*:`);
      if (termRegex.test(mapBody)) {
        console.log(`⚠️ Term "${term}" already registered in visualizer.tsx, skipping.`);
      } else {
        // Append entry
        mapBody = `${mapBody}  "${term}": dynamic(() => import("./${term}"), { ssr: false }),\n`;
        console.log(`✓ Added "${term}" to GLOSSARY_VISUALIZATIONS in visualizer.tsx`);
      }
    }

    visualizerContent = visualizerContent.replace(mapRegex, `${prefix}${mapBody}${suffix}`);
    fs.writeFileSync(visualizerPath, visualizerContent, "utf-8");
  } else {
    console.log("⚠️ Could not match GLOSSARY_VISUALIZATIONS map in visualizer.tsx");
  }
} else {
  console.log(`⚠️ visualizer.tsx not found at ${visualizerPath}`);
}
