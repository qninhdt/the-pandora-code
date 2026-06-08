import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import yaml from "js-yaml";

const ROOT = process.cwd();
const CHAPTERS_DIR = path.join(ROOT, "content", "chapters");
const GLOSSARY_DIR = path.join(ROOT, "content", "glossary");

if (existsSync(GLOSSARY_DIR)) {
  const files = readdirSync(GLOSSARY_DIR).filter(f => f.endsWith(".yaml") || f.endsWith(".yml"));
  for (const file of files) {
    const filePath = path.join(GLOSSARY_DIR, file);
    try {
      const content = readFileSync(filePath, "utf8");
      const data = yaml.load(content);
      const output = yaml.dump(data, { lineWidth: -1 });
      writeFileSync(filePath, output, "utf8");
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

if (existsSync(CHAPTERS_DIR)) {
  const dirs = readdirSync(CHAPTERS_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const dir of dirs) {
    const metaPath = path.join(CHAPTERS_DIR, dir.name, "meta.yaml");
    if (!existsSync(metaPath)) continue;
    
    try {
      const content = readFileSync(metaPath, "utf8");
      const data = yaml.load(content);
      const output = yaml.dump(data, { lineWidth: -1 });
      writeFileSync(metaPath, output, "utf8");
    } catch (err) {
      console.error(`Error processing ${dir.name}/meta.yaml:`, err);
    }
  }
}

console.log("Flattened all YAML files.");
