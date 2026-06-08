import { GlossaryTerm } from "@/lib/content/schemas/glossary-term";
import { describe, expect, it } from "vitest";

describe("GlossaryTerm schema", () => {
  const valid = {
    id: "superconductivity",
    label: { vi: "Hiện tượng siêu dẫn", en: "Superconductivity" },
    definition: {
      vi: "Trạng thái lượng tử vĩ mô với điện trở bằng không.",
      en: "A macroscopic quantum state with zero electrical resistance.",
    },
    see_also: ["cooper-pair"],
    category: "concept",
    cover_prompt:
      "A cryogenic lab scene with a superconducting loop carrying a stable blue current in cold vapor.",
  };

  it("accepts a glossary term with a committed cover prompt", () => {
    expect(() => GlossaryTerm.parse(valid)).not.toThrow();
  });

  it("rejects a glossary term without a cover prompt", () => {
    const { cover_prompt: _coverPrompt, ...bad } = valid;
    expect(() => GlossaryTerm.parse(bad)).toThrow();
  });
});
