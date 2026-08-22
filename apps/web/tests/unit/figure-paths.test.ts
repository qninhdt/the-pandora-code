import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveChapterContentDir } from "../../../../scripts/lib/figure-paths";

const tempRoots: string[] = [];

function makeContentRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "pandora-figure-paths-"));
  tempRoots.push(root);
  mkdirSync(path.join(root, "chapters"), { recursive: true });
  return root;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("resolveChapterContentDir", () => {
  it("maps a clean metadata slug to its ordered chapter directory", () => {
    const root = makeContentRoot();
    const ordered = path.join(root, "chapters", "4-5-pandoras-smallest-things");
    mkdirSync(ordered);
    writeFileSync(path.join(ordered, "meta.yaml"), "slug: pandoras-smallest-things\n");

    expect(resolveChapterContentDir(root, "pandoras-smallest-things")).toBe(ordered);
  });

  it("accepts an ordered directory name directly", () => {
    const root = makeContentRoot();
    const ordered = path.join(root, "chapters", "4-5-pandoras-smallest-things");
    mkdirSync(ordered);

    expect(resolveChapterContentDir(root, "4-5-pandoras-smallest-things")).toBe(ordered);
  });

  it("returns the conventional path for a chapter that does not exist yet", () => {
    const root = makeContentRoot();
    expect(resolveChapterContentDir(root, "future-chapter")).toBe(
      path.join(root, "chapters", "future-chapter"),
    );
  });
});
