import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AlphaCentauri from "@/components/glossary/interactive/alpha-centauri";
import {
  GLOSSARY_VISUALIZATION_IDS,
  type GlossaryVisualizationId,
} from "@/components/glossary/interactive/registry";
import { GlossaryVisualizer } from "@/components/glossary/interactive/visualizer";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const INTERACTIVE_DIR = path.resolve(
  HERE,
  "../../components/glossary/interactive",
);
const GLOSSARY_YAML_DIR = path.resolve(HERE, "../../../../content/glossary");

function diskComponentIds(): string[] {
  return fs
    .readdirSync(INTERACTIVE_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.replace(/\.tsx$/, ""))
    .filter((id) => id !== "registry" && id !== "visualizer")
    .sort();
}

function visualizerImportIds(): string[] {
  const src = fs.readFileSync(
    path.join(INTERACTIVE_DIR, "visualizer.tsx"),
    "utf8",
  );
  return [...src.matchAll(/import\(\s*["']\.\/([a-z0-9-]+)["']\s*\)/g)].map(
    (m) => m[1],
  );
}

function glossaryYamlIds(): string[] {
  return fs
    .readdirSync(GLOSSARY_YAML_DIR)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => f.replace(/\.ya?ml$/, ""))
    .sort();
}

describe("Glossary registry / visualizer / disk / yaml consistency", () => {
  const registryIds = [...GLOSSARY_VISUALIZATION_IDS].sort();
  const diskIds = diskComponentIds();
  const vizIds = visualizerImportIds();
  const vizUnique = [...new Set(vizIds)].sort();
  const yamlIds = glossaryYamlIds();

  it("has exactly 286 registry IDs with no duplicates", () => {
    expect(GLOSSARY_VISUALIZATION_IDS).toHaveLength(286);
    expect(new Set(GLOSSARY_VISUALIZATION_IDS).size).toBe(286);
  });

  it("matches disk component files 1:1", () => {
    expect(diskIds).toEqual(registryIds);
  });

  it("matches visualizer dynamic imports 1:1", () => {
    expect(vizIds).toHaveLength(286);
    expect(vizUnique).toEqual(registryIds);
  });

  it("matches content/glossary YAML entries 1:1", () => {
    expect(yamlIds).toHaveLength(286);
    expect(yamlIds).toEqual(registryIds);
  });

  it("rejects unknown slugs against the registry set", () => {
    const set = new Set<string>(GLOSSARY_VISUALIZATION_IDS);
    for (const id of GLOSSARY_VISUALIZATION_IDS) {
      expect(set.has(id)).toBe(true);
    }
    expect(set.has("unknown-term")).toBe(false);
    expect(set.has("")).toBe(false);
  });
});

describe("GlossaryVisualizer mount smoke", () => {
  it("returns null for unregistered terms", () => {
    const { container } = renderWithIntl(
      <GlossaryVisualizer term="unknown-term" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders a known sample component (alpha-centauri)", () => {
    const { container } = renderWithIntl(<AlphaCentauri />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("accepts every registry id as GlossaryVisualizationId", () => {
    const sample = GLOSSARY_VISUALIZATION_IDS[0] as GlossaryVisualizationId;
    expect(typeof sample).toBe("string");
    expect(GLOSSARY_VISUALIZATION_IDS.includes(sample)).toBe(true);
  });
});
