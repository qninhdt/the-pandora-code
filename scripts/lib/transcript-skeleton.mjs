// Deterministic MDX -> transcript-skeleton extraction for chapter audio.
//
// Splits a chapter body into sections (## headings) and classified blocks so a
// coding agent can adapt them into speech-ready JSON without parsing MDX itself.
// The split follows the same three JSX shapes proven by audit-section-parity.mjs:
//   <BareTag ...props... />   -> props block, terminated by a line that IS "/>"
//   <Container ...>body</...> -> prose container, body is kept
//   <Inline .../> mid-sentence -> replaced inline, the line stays prose
// Everything the agent should speak must survive into a block; everything visual
// (props, widgets internals) is reduced to the strings a speaker needs.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const CONTENT = "content";

// Tags that annotate prose mid-sentence; the line they sit in is prose.
const INLINE_TAGS = new Set(["GlossaryTerm", "ChapterRef", "PartRef"]);
// Prose containers whose whole body is speakable.
const NOTE_CONTAINERS = new Set(["Callout", "WhatThisMeans", "ScientificNote", "Quote"]);
// Self-closing props blocks that carry speakable payloads.
const DATA_BLOCKS = new Set([
  "Comparison", "StatGrid", "DataComparison", "Timeline", "Chart",
  "ConfidenceMeter", "OpenQuestions",
]);

const propStr = (props, name) => {
  const m = props.match(new RegExp(`${name}="((?:[^"\\\\]|\\\\.)*)"`, "m"));
  return m ? m[1] : null;
};
// Flat objects inside a `name={[...]}` / `name={{...}}` prop; strings may span lines.
// The closer must sit at a line end: a compact single-object array
// (`series={[{ ... }]}`) would otherwise donate its own `}` to the lazy close
// alternation and silently yield zero objects.
const propObjects = (props, name) => {
  const m = props.match(new RegExp(`${name}=(?:\\[\\{|\\{\\[)([\\s\\S]*?)(?:\\]\\}|\\}\\])(?=\\s*$)`, "m"));
  if (!m) return [];
  return m[1].match(/\{[^{}]*\}/g) || [];
};
const objStr = (obj, key) => {
  const m = obj.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m"));
  return m ? m[1] : null;
};
// Strip paired JSX wrappers (<p>..</p>, fragments <>..</>) from container
// children values; a bare quoted string is unwrapped as-is.
const plainChildren = (raw) => {
  if (!raw) return "";
  const q = raw.trim().match(/^"((?:[^"\\]|\\.)*)"/);
  if (q) return q[1];
  return raw
    .replace(/<\/?[a-zA-Z][^>]*>/g, " ")
    .replace(/<\/?>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// --- cross-reference resolution (ChapterRef / PartRef) ---

const metaCache = new Map();
function yamlTitleBlock(file) {
  if (metaCache.has(file)) return metaCache.get(file);
  let out = null;
  try {
    const yaml = readFileSync(file, "utf8");
    const m = yaml.match(/^title:\n((?:[ \t]+.*\n?)+?)(?=\S)/m);
    if (m) {
      const fields = {};
      let key = null;
      for (const line of m[1].split("\n")) {
        const f = line.match(/^\s+(vi|en):\s*(.*)$/);
        if (f) { key = f[1]; fields[key] = f[2].replace(/^>-?\s*/, ""); continue; }
        if (key && line.trim()) fields[key] += " " + line.trim();
      }
      out = fields;
    }
  } catch { /* missing file -> caller falls back to the slug */ }
  metaCache.set(file, out);
  return out;
}

export function chapterTitle(slug, locale) {
  const t = yamlTitleBlock(path.join(CONTENT, "chapters", slug, "meta.yaml"));
  return (t && t[locale]) || slug;
}
export function partRef(id) {
  const t = yamlTitleBlock(path.join(CONTENT, "parts", `${id}.yaml`));
  const order = (() => {
    try {
      const yaml = readFileSync(path.join(CONTENT, "parts", `${id}.yaml`), "utf8");
      return (yaml.match(/^order:\s*(\d+)/m) || [])[1] || null;
    } catch { return null; }
  })();
  return { order, title: t || null };
}

// --- inline tag replacement (operates on one prose line) ---

function replaceInline(line, locale) {
  let out = line
    .replace(/<GlossaryTerm\b[^>]*>([\s\S]*?)<\/GlossaryTerm>/g, "$1")
    .replace(/<ChapterRef\s+slug="([^"]+)"[^>]*\/>/g, (_, slug) => chapterTitle(slug, locale))
    .replace(/<PartRef\s+id="([^"]+)"[^>]*numberOnly[^>]*\/>/g, (_, id) => partRef(id).order || "")
    .replace(/<PartRef\s+id="([^"]+)"[^>]*\/>/g, (_, id) => {
      const p = partRef(id);
      return (p.title && p.title[locale]) || p.order || id;
    });
  // Defensive: any leftover same-line JSX tag is visual chrome, drop the tag only.
  out = out.replace(/<\/?[A-Z][A-Za-z]*(?:\s[^>]*)?\/?>/g, "");
  return out;
}

// --- block parsing ---

// A props block ends at its own-line "/>" marker or a trailing "/>" on the last
// prop — but a JSX fragment close "</>" also ends with "/>" and must NOT
// terminate (Comparison children are fragments: `children: <>…</>`).
const propsTerminator = (line) => {
  const t = line.trim();
  return (t === "/>" || t.endsWith("/>")) && !t.endsWith("</>");
};

function figureBlock(name, props) {
  if (name !== "DiagramFigure") return null;
  const labels = propObjects(props, "labels").map((o) => ({
    label: objStr(o, "label"),
    note: objStr(o, "note"),
  })).filter((l) => l.label || l.note);
  return {
    type: "figure",
    figNo: propStr(props, "figNo"),
    caption: propStr(props, "caption"),
    alt: propStr(props, "alt"),
    tier: propStr(props, "tier"),
    ...(labels.length ? { labels } : {}),
  };
}

function dataBlock(name, props) {
  switch (name) {
    case "Comparison": {
      // children is the last field of the side object and may be a quoted
      // string, a <p> wrapper, or a fragment <>…</> — take through end of side.
      const side = (which) => {
        const m = props.match(new RegExp(`${which}=\\{\\{([\\s\\S]*?)\\}\\}`));
        if (!m) return null;
        const inner = m[1];
        const children = (inner.match(/children:\s*([\s\S]*)$/) || [])[1];
        return {
          title: objStr(inner, "title"),
          text: plainChildren(children || objStr(inner, "children")),
        };
      };
      return { type: "data", kind: "comparison", left: side("left"), right: side("right") };
    }
    case "StatGrid":
    case "DataComparison": {
      const objs = propObjects(props, "stats").length ? propObjects(props, "stats") : propObjects(props, "items");
      return {
        type: "data", kind: name === "StatGrid" ? "statgrid" : "datacomparison",
        stats: objs.map((o) => ({
          label: objStr(o, "label"), value: objStr(o, "value"),
          ...(objStr(o, "vs") ? { vs: objStr(o, "vs") } : {}),
          ...(objStr(o, "note") ? { note: objStr(o, "note") } : {}),
        })).filter((s) => s.label || s.value),
      };
    }
    case "Timeline":
      return {
        type: "data", kind: "timeline",
        events: propObjects(props, "events").map((o) => ({
          date: objStr(o, "date"), title: objStr(o, "title"), description: objStr(o, "description"),
        })).filter((e) => e.title || e.description),
      };
    case "Chart": {
      const series = propObjects(props, "series").map((o) => objStr(o, "label")).filter(Boolean);
      const dataRaw = (props.match(/data=\{([\s\S]*?)\}\s*$/m) || ["", ""])[1];
      return {
        type: "data", kind: "chart",
        xLabel: propStr(props, "xLabel"), yLabel: propStr(props, "yLabel"),
        ...(series.length ? { series } : {}),
        dataPreview: dataRaw.slice(0, 400).trim(),
      };
    }
    case "ConfidenceMeter": {
      const m = props.match(/classification=\{\{([^}]*)\}\}/);
      if (!m) return null;
      const pct = {};
      for (const f of m[1].matchAll(/(\w+)_pct:\s*(\d+)/g)) pct[f[1]] = Number(f[2]);
      return { type: "note", kind: "confidence", classification: pct };
    }
    case "OpenQuestions":
      return {
        type: "note", kind: "openquestions", title: propStr(props, "title"),
        items: propObjects(props, "items").map((o) => ({
          question: objStr(o, "question"), answer: objStr(o, "answer"),
        })).filter((q) => q.question),
      };
    default:
      return null;
  }
}

function widgetBlock(name, openingProps, bodyText) {
  const title = propStr(openingProps, "title") || propStr(openingProps, "caption") ||
    propStr(openingProps, "question") || propStr(openingProps, "label");
  return {
    type: "widget", component: name,
    ...(title ? { title } : {}),
    ...(bodyText ? { bodyPreview: plainChildren(bodyText).slice(0, 300) } : {}),
  };
}

/**
 * Extract the transcript skeleton of one chapter edition.
 * @param {string} slug chapter slug
 * @param {"en"|"vi"} locale
 * @param {string} source the raw mdx text
 */
export function extractSkeleton(slug, locale, source) {
  const body = source
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^import\s.+$/gm, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/```[\s\S]*?```/g, "");

  const sections = [];
  let current = { id: "sec-00", title: null, blocks: [] };
  const lines = body.split("\n");
  let para = [];           // pending prose lines
  let mode = null;         // null | {kind:"props", name, buf} | {kind:"container", name, opening, buf}

  const flushPara = () => {
    const text = para.map((l) => replaceInline(l, locale)).join("\n").trim();
    if (text) current.blocks.push({ type: "p", raw: text });
    para = [];
  };
  // Always push, even an empty intro: ids must stay aligned with heading order.
  const pushSection = (title) => {
    flushPara();
    sections.push(current);
    current = { id: `sec-${String(sections.length).padStart(2, "0")}`, title, blocks: [] };
  };

  for (const line of lines) {
    if (mode && mode.kind === "props") {
      mode.buf += line + "\n";
      if (propsTerminator(line)) {
        flushPara();
        const name = mode.name;
        current.blocks.push(figureBlock(name, mode.buf) || dataBlock(name, mode.buf) ||
          widgetBlock(name, mode.buf, null));
        mode = null;
      }
      continue;
    }
    if (mode && mode.kind === "container") {
      if (new RegExp(`^</${mode.name}>\\s*$`).test(line)) {
        const bodyText = mode.buf.trim();
        if (mode.widget) {
          current.blocks.push(widgetBlock(mode.name, mode.opening, bodyText));
        } else {
          const note = { type: "note", kind: mode.name.toLowerCase() };
          const title = propStr(mode.opening, "title");
          const cite = propStr(mode.opening, "cite");
          if (title) note.title = title;
          if (cite) note.cite = cite;
          note.body = bodyText.split("\n").map((l) => replaceInline(l, locale)).join("\n").trim();
          current.blocks.push(note);
        }
        mode = null;
      } else mode.buf += line + "\n";
      continue;
    }

    if (/^##\s+/.test(line)) { pushSection(line.replace(/^##\s+/, "").trim()); continue; }
    if (/^###\s+/.test(line)) {
      flushPara();
      current.blocks.push({ type: "p", raw: line.replace(/^###\s+/, "").trim() });
      continue;
    }

    const bare = line.match(/^<([A-Z][A-Za-z]*)\s*$/);
    const open = line.match(/^<([A-Z][A-Za-z]*)(\s[^>]*)?\/>\s*$/);
    const container = line.match(/^<([A-Z][A-Za-z]*)(\s[^>]*)?>\s*$/);
    const closing = /^<\/[A-Z]/.test(line);

    if (bare && !INLINE_TAGS.has(bare[1])) { mode = { kind: "props", name: bare[1], buf: line + "\n" }; continue; }
    if (open && !INLINE_TAGS.has(open[1])) {
      flushPara();
      const name = open[1];
      const props = open[2] || "";
      if (name === "DiagramFigure") {
        // single-line figure (rare): only figNo survives without the caption block
        current.blocks.push(figureBlock(name, props + "\n/>") || widgetBlock(name, props, null));
      } else current.blocks.push(dataBlock(name, props) || widgetBlock(name, props, null));
      continue;
    }
    if (container && NOTE_CONTAINERS.has(container[1])) {
      flushPara();
      mode = { kind: "container", name: container[1], opening: container[2] || "", buf: "" };
      continue;
    }
    if (container && !INLINE_TAGS.has(container[1])) { // unknown widget with body
      flushPara();
      mode = { kind: "container", name: container[1], opening: container[2] || "", buf: "", widget: true };
      continue;
    }
    if (closing) { flushPara(); continue; } // stray close of a swallowed container
    para.push(line);
  }
  flushPara();
  if (current.blocks.length || current.title !== null) sections.push(current);

  return {
    chapter: slug,
    locale,
    source: {
      file: `${locale}.mdx`,
      sha256: createHash("sha256").update(source, "utf8").digest("hex"),
    },
    sections,
  };
}

// Char count of the speakable text the skeleton preserves (p + note bodies).
// Comparable baseline for coverage checks against a parity-style strip.
export function speakableChars(skeleton) {
  let n = 0;
  for (const s of skeleton.sections) {
    for (const b of s.blocks) {
      if (b.type === "p") n += b.raw.length;
      if (b.type === "note" && b.body) n += b.body.length;
    }
  }
  return n;
}
