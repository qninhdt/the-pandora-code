import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import yaml from "js-yaml";

const ROOT = process.cwd();
const CHAPTERS_DIR = path.join(ROOT, "content", "chapters");
const GLOSSARY_DIR = path.join(ROOT, "content", "glossary");

const extracted: any = { glossary: {}, chapters: {} };

function extractField(content: string, field: string): string | undefined {
  const regex = new RegExp(`^\\s*${field}:\\s*(?:>-\\s*)?(?:([^\\n]+)|\\n\\s+([^\\n].*))$`, 'm');
  const match = content.match(regex);
  if (match) {
    return (match[1] || match[2]).trim();
  }
  return undefined;
}

if (existsSync(GLOSSARY_DIR)) {
  const files = readdirSync(GLOSSARY_DIR).filter(f => f.endsWith(".yaml") || f.endsWith(".yml"));
  for (const file of files) {
    const content = readFileSync(path.join(GLOSSARY_DIR, file), "utf8");
    const item: any = {};
    
    // Find label.en
    const labelMatch = content.match(/label:\s*\n\s*vi:.*?\n\s*en:\s*(?:>-\s*\n\s*)?([^\n]+)/);
    if (labelMatch) item.label = labelMatch[1].trim();
    
    // Find definition.en
    const defMatch = content.match(/definition:\s*\n\s*vi:.*?\n\s*en:\s*(?:>-\s*\n\s*)?([^\n]+)/);
    if (defMatch) item.definition = defMatch[1].trim();

    if (Object.keys(item).length > 0) extracted.glossary[file] = item;
  }
}

if (existsSync(CHAPTERS_DIR)) {
  const dirs = readdirSync(CHAPTERS_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const dir of dirs) {
    const metaPath = path.join(CHAPTERS_DIR, dir.name, "meta.yaml");
    if (!existsSync(metaPath)) continue;
    
    const content = readFileSync(metaPath, "utf8");
    const item: any = {};
    
    // Find title.en
    const titleMatch = content.match(/title:\s*\n\s*vi:.*?\n\s*en:\s*(?:>-\s*\n\s*)?([^\n]+)/);
    if (titleMatch) item.title = titleMatch[1].trim();
    
    // Find subtitle.en
    const subtitleMatch = content.match(/subtitle:\s*\n\s*vi:.*?\n\s*en:\s*(?:>-\s*\n\s*)?([^\n]+)/);
    if (subtitleMatch) item.subtitle = subtitleMatch[1].trim();

    // Find hook.en
    const hookMatch = content.match(/hook:\s*\n\s*vi:.*?\n\s*en:\s*(?:>-\s*\n\s*)?([^\n]+)/);
    if (hookMatch) item.hook = hookMatch[1].trim();

    if (Object.keys(item).length > 0) extracted.chapters[dir.name] = item;
  }
}

writeFileSync(path.join(ROOT, "scripts", "extracted.json"), JSON.stringify(extracted, null, 2));
console.log("Extracted strings to scripts/extracted.json");
