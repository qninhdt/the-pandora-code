import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const CHAPTERS_DIR = path.join(ROOT, "content", "chapters");
const GLOSSARY_DIR = path.join(ROOT, "content", "glossary");
const TRANSLATIONS_FILE = path.join(ROOT, "scripts", "translations.json");

const translations = JSON.parse(readFileSync(TRANSLATIONS_FILE, "utf8"));

function replaceField(content: string, fieldName: string, newValue: string | undefined): string {
  if (!newValue) return content;
  
  // Create folded block scalar with proper indentation
  const indentedValue = newValue.split('\n').map(line => `    ${line}`).join('\n');
  const replacement = `${fieldName}:\n  vi: >-\n${indentedValue}\n  en:`;
  
  // Match the field, its vi block, up to its en:
  const regex = new RegExp(`${fieldName}:\\s*\\n\\s*vi:[\\s\\S]*?\\n\\s*en:`, 'g');
  if (regex.test(content)) {
    return content.replace(regex, replacement);
  }
  return content;
}

if (existsSync(GLOSSARY_DIR)) {
  const files = readdirSync(GLOSSARY_DIR).filter(f => f.endsWith(".yaml") || f.endsWith(".yml"));
  for (const file of files) {
    const trans = translations.glossary[file];
    if (!trans) continue;
    
    const filePath = path.join(GLOSSARY_DIR, file);
    let content = readFileSync(filePath, "utf8");
    const origContent = content;
    
    if (trans.label) content = replaceField(content, "label", trans.label);
    if (trans.definition) content = replaceField(content, "definition", trans.definition);
    
    if (content !== origContent) {
      writeFileSync(filePath, content, "utf8");
      console.log(`Updated glossary: ${file}`);
    }
  }
}

if (existsSync(CHAPTERS_DIR)) {
  const dirs = readdirSync(CHAPTERS_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const dir of dirs) {
    const trans = translations.chapters[dir.name];
    if (!trans) continue;
    
    const metaPath = path.join(CHAPTERS_DIR, dir.name, "meta.yaml");
    if (!existsSync(metaPath)) continue;
    
    let content = readFileSync(metaPath, "utf8");
    const origContent = content;
    
    if (trans.title) content = replaceField(content, "title", trans.title);
    if (trans.subtitle) content = replaceField(content, "subtitle", trans.subtitle);
    if (trans.hook) content = replaceField(content, "hook", trans.hook);
    
    if (content !== origContent) {
      writeFileSync(metaPath, content, "utf8");
      console.log(`Updated chapter meta: ${dir.name}/meta.yaml`);
    }
  }
}

console.log("Applied all translations successfully.");
