import { z } from "zod";

/**
 * Fixed topic-tag vocabulary for glossary terms. Tags are the primary lookup
 * facet on the glossary page (the single `category` field is too coarse - most
 * terms fall under one value). A term may carry several tags from this list.
 *
 * Slugs are kebab-case and stable: they are written into content YAML and used
 * as filter keys in the UI. Add new tags here (and a label below) rather than
 * inventing free-form strings in content. The set is tuned to the actual
 * corpus (ecology + evolution + astro/planetary + complexity + Pandora canon).
 */
export const GLOSSARY_TAGS = [
  "ecology",
  "evolution",
  "physiology",
  "sensory-biology",
  "bioluminescence",
  "mycology",
  "collective-behavior",
  "developmental-biology",
  "consciousness",
  "philosophy-of-science",
  "information-theory",
  "network-science",
  "atmosphere",
  "earth-systems",
  "oceanography",
  "planetary-science",
  "orbital-mechanics",
  "astronomy",
  "astrobiology",
  "geology",
  "physics",
  "chemistry",
  "mineral",
  "pandora-canon",
] as const;

export const GlossaryTag = z.enum(GLOSSARY_TAGS);
export type GlossaryTag = z.infer<typeof GlossaryTag>;

/** Human-readable bilingual labels for each tag, used by the filter UI + pills. */
export const GLOSSARY_TAG_LABELS: Record<GlossaryTag, { vi: string; en: string }> = {
  ecology: { vi: "Sinh thái", en: "Ecology" },
  evolution: { vi: "Tiến hóa", en: "Evolution" },
  physiology: { vi: "Sinh lý & giải phẫu", en: "Physiology" },
  "sensory-biology": { vi: "Giác quan sinh học", en: "Sensory biology" },
  bioluminescence: { vi: "Phát quang sinh học", en: "Bioluminescence" },
  mycology: { vi: "Nấm & mạng rễ", en: "Mycology" },
  "collective-behavior": { vi: "Hành vi tập thể", en: "Collective behavior" },
  "developmental-biology": { vi: "Sinh học phát triển", en: "Developmental biology" },
  consciousness: { vi: "Ý thức & nhận thức", en: "Consciousness" },
  "philosophy-of-science": { vi: "Triết học khoa học", en: "Philosophy of science" },
  "information-theory": { vi: "Lý thuyết thông tin", en: "Information theory" },
  "network-science": { vi: "Khoa học mạng lưới", en: "Network science" },
  atmosphere: { vi: "Khí quyển & khí hậu", en: "Atmosphere" },
  "earth-systems": { vi: "Hệ Trái Đất", en: "Earth systems" },
  oceanography: { vi: "Hải dương học", en: "Oceanography" },
  "planetary-science": { vi: "Khoa học hành tinh", en: "Planetary science" },
  "orbital-mechanics": { vi: "Cơ học quỹ đạo", en: "Orbital mechanics" },
  astronomy: { vi: "Thiên văn", en: "Astronomy" },
  astrobiology: { vi: "Sinh học vũ trụ", en: "Astrobiology" },
  geology: { vi: "Địa chất & niên đại", en: "Geology" },
  physics: { vi: "Vật lý", en: "Physics" },
  chemistry: { vi: "Hóa học", en: "Chemistry" },
  mineral: { vi: "Khoáng vật", en: "Mineral" },
  "pandora-canon": { vi: "Chính sử Pandora", en: "Pandora canon" },
};

export function glossaryTagLabel(tag: string, locale: "vi" | "en"): string {
  return GLOSSARY_TAG_LABELS[tag as GlossaryTag]?.[locale] ?? tag;
}
