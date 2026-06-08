import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import yaml from "js-yaml";
import OpenAI from "openai";
import "dotenv/config";

const ROOT = process.cwd();
const CHAPTERS_DIR = path.join(ROOT, "content", "chapters");
const GLOSSARY_DIR = path.join(ROOT, "content", "glossary");

const openai = new OpenAI();

async function translate(enText: string): Promise<string> {
  const prompt = `You are a professional translator. Translate the following English text into natural, fluent, and well-written Vietnamese. Provide ONLY the translation without any surrounding quotes or explanations.\n\nEnglish:\n${enText}`;
  try {
    const response = await openai.chat.completions.create({
      model: "claude-sonnet-4-6",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (err: any) {
    console.error(`Translation failed for text: ${enText.substring(0, 30)}...`, err?.message);
    return "";
  }
}

async function processGlossary() {
  if (!existsSync(GLOSSARY_DIR)) return;
  const files = readdirSync(GLOSSARY_DIR).filter(f => f.endsWith(".yaml") || f.endsWith(".yml"));
  for (const file of files) {
    const filePath = path.join(GLOSSARY_DIR, file);
    const content = readFileSync(filePath, "utf8");
    const data = yaml.load(content) as any;
    
    let changed = false;

    if (data.label && data.label.en) {
      console.log(`Translating label for ${file}...`);
      const translated = await translate(data.label.en);
      if (translated && translated !== data.label.vi) {
        data.label.vi = translated;
        changed = true;
      }
    }

    if (data.definition && data.definition.en) {
      console.log(`Translating definition for ${file}...`);
      const translated = await translate(data.definition.en);
      if (translated && translated !== data.definition.vi) {
        data.definition.vi = translated;
        changed = true;
      }
    }

    if (changed) {
      const newContent = yaml.dump(data, { lineWidth: -1 });
      writeFileSync(filePath, newContent, "utf8");
      console.log(`Updated ${file}`);
    }
  }
}

async function processChapterMeta() {
  if (!existsSync(CHAPTERS_DIR)) return;
  const dirs = readdirSync(CHAPTERS_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
  
  for (const dir of dirs) {
    const metaPath = path.join(CHAPTERS_DIR, dir.name, "meta.yaml");
    if (!existsSync(metaPath)) continue;
    
    const content = readFileSync(metaPath, "utf8");
    const data = yaml.load(content) as any;
    let changed = false;

    if (data.title && data.title.en) {
      console.log(`Translating title for ${dir.name}...`);
      const translated = await translate(data.title.en);
      if (translated && translated !== data.title.vi) {
        data.title.vi = translated;
        changed = true;
      }
    }

    if (data.subtitle && data.subtitle.en) {
      console.log(`Translating subtitle for ${dir.name}...`);
      const translated = await translate(data.subtitle.en);
      if (translated && translated !== data.subtitle.vi) {
        data.subtitle.vi = translated;
        changed = true;
      }
    }

    if (data.hook && data.hook.en) {
      console.log(`Translating hook for ${dir.name}...`);
      const translated = await translate(data.hook.en);
      if (translated && translated !== data.hook.vi) {
        data.hook.vi = translated;
        changed = true;
      }
    }

    if (changed) {
      const newContent = yaml.dump(data, { lineWidth: -1 });
      writeFileSync(metaPath, newContent, "utf8");
      console.log(`Updated ${dir.name}/meta.yaml`);
    }
  }
}

async function main() {
  console.log("Starting translation process...");
  await processGlossary();
  await processChapterMeta();
  console.log("Translation process completed.");
}

main().catch(console.error);
