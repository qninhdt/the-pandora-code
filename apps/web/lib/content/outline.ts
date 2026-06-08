import type { Locale } from "@/i18n/config";
import { listPublishedChapters } from "./loader/chapter-loader";

// Single source of truth for the book's structure: 9 Parts + a prologue, 50
// chapters total. Each chapter carries a bilingual one-line payload (the
// Pandora hook → real-science meal). The landing browser, reader nav, and the
// /pandora "next pending" logic all read this same list.

export interface OutlineChapter {
  slug: string;
  title: { vi: string; en: string };
  /** One-line "Pandora bait → STEM meal" payload. */
  payload: { vi: string; en: string };
}

export interface OutlinePart {
  id: string;
  label: { vi: string; en: string };
  chapters: OutlineChapter[];
}

export const OUTLINE: OutlinePart[] = [
  {
    id: "prologue",
    label: { vi: "Khởi đầu", en: "Prologue" },
    chapters: [
      {
        slug: "reading-pandora-as-a-specimen",
        title: { vi: "Đọc Pandora như một mẫu vật", en: "Reading Pandora as a specimen" },
        payload: {
          vi: "Đọc Pandora như mẫu vật, không phải cốt phim → hệ phân loại Canon/Suy luận/Suy đoán/Khoa học.",
          en: "Read Pandora as a specimen, not a plot → the Canon/Inference/Speculation/Real-science tier system.",
        },
      },
    ],
  },
  {
    id: "the-world",
    label: { vi: "Phần I — Thế giới", en: "Part I — The World" },
    chapters: [
      {
        slug: "where-is-pandora",
        title: { vi: "Pandora ở đâu", en: "Where is Pandora" },
        payload: {
          vi: "Alpha Centauri A, Polyphemus, Pandora là mặt trăng → vùng sống được quanh sao đôi, dò ngoại hành tinh.",
          en: "Alpha Centauri A, Polyphemus, Pandora as moon → habitable zones around binary stars, exoplanet detection.",
        },
      },
      {
        slug: "time-on-pandora",
        title: { vi: "Thời gian trên Pandora", en: "Time on Pandora" },
        payload: {
          vi: "Tự quay, nhật thực, mùa → khóa thủy triều, dao động libration, cơ học quỹ đạo.",
          en: "Rotation, eclipses, seasons → tidal locking, libration, orbital mechanics.",
        },
      },
      {
        slug: "whats-in-the-air",
        title: { vi: "Trong không khí có gì", en: "What's in the air" },
        payload: {
          vi: "Khí quyển độc, 18% O₂ → hóa học khí quyển, biosignature, mất cân bằng O₂/CH₄.",
          en: "Toxic 18% O₂ atmosphere → atmospheric chemistry, biosignatures, O₂/CH₄ disequilibrium.",
        },
      },
      {
        slug: "floating-mountains-and-the-superconductor",
        title: { vi: "Núi bay và chất siêu dẫn", en: "Floating mountains and the superconductor" },
        payload: {
          vi: "Dãy Hallelujah + unobtanium + xoáy từ → siêu dẫn (cặp Cooper, Meissner, bẫy từ thông), nâng nghịch từ.",
          en: "Hallelujah Mountains + unobtanium + magnetic vortices → superconductivity (Cooper pairs, Meissner, flux pinning).",
        },
      },
      {
        slug: "continents-oceans-climate",
        title: { vi: "Lục địa, đại dương, khí hậu", en: "Continents, oceans, climate" },
        payload: {
          vi: "Địa lý bề mặt, Biển Đông → khí hậu so sánh, hoàn lưu Hadley, quần xã sinh vật.",
          en: "Surface geography, Eastern Sea → comparative climatology, Hadley cells, biomes.",
        },
      },
      {
        slug: "pandoras-deep-time",
        title: { vi: "Thời gian sâu của Pandora", en: "Pandora's deep time" },
        payload: {
          vi: "Tuổi, lịch sử địa chất → niên đại học, định tuổi phóng xạ, tiến hóa hành tinh.",
          en: "Age, geological history → geochronology, radiometric dating, planetary evolution.",
        },
      },
    ],
  },
  {
    id: "the-living-world",
    label: { vi: "Phần II — Thế giới sống", en: "Part II — The Living World" },
    chapters: [
      {
        slug: "six-limbs-and-the-bilateral-lattice",
        title: { vi: "Sáu chi và mạng lưới đối xứng", en: "Six limbs and the bilateral lattice" },
        payload: {
          vi: "Cấu trúc cơ thể sáu chi → tiến hóa body plan, gene Hox.",
          en: "Hexapodal body plan → body-plan evolution, Hox genes.",
        },
      },
      {
        slug: "convergent-but-not-quite",
        title: { vi: "Hội tụ nhưng không hẳn", en: "Convergent but not quite" },
        payload: {
          vi: "Vai trò sinh thái quen thuộc → tiến hóa hội tụ, ổ sinh thái.",
          en: "Familiar ecological roles → convergent evolution, niches.",
        },
      },
      {
        slug: "the-breathing-fans",
        title: { vi: "Những quạt thở", en: "The breathing fans" },
        payload: {
          vi: "Khe thở bên hông → sinh học hô hấp so sánh.",
          en: "Lateral respiratory openings → comparative respiratory biology.",
        },
      },
      {
        slug: "when-glow-is-the-norm",
        title: { vi: "Khi phát quang là lẽ thường", en: "When glow is the norm" },
        payload: {
          vi: "Phát quang sinh học khắp nơi → hóa học phát quang, vì sao glow tiến hóa.",
          en: "Ubiquitous bioluminescence → bioluminescence chemistry, why glow evolves.",
        },
      },
      {
        slug: "pandoran-tree-of-life",
        title: { vi: "Cây sự sống Pandora", en: "Pandoran tree of life" },
        payload: {
          vi: "Dựng lại phát sinh chủng loài → phylogenetics, cladogram, parsimony.",
          en: "Reconstruct phylogeny → phylogenetics, cladograms, parsimony.",
        },
      },
      {
        slug: "direhorse-and-banshee-up-close",
        title: { vi: "Pa'li & Ikran cận cảnh", en: "Direhorse and banshee up close" },
        payload: {
          vi: "Giải phẫu pa'li & ikran + queue → tỉ lệ allometric, cơ sinh học.",
          en: "Pa'li & ikran anatomy + queue → allometric scaling, biomechanics.",
        },
      },
      {
        slug: "the-hunters-and-the-hunted",
        title: { vi: "Kẻ săn và con mồi", en: "The hunters and the hunted" },
        payload: {
          vi: "Bầy thú săn mồi → động lực mồi-thú, Lotka-Volterra.",
          en: "Predator guild → predator-prey dynamics, Lotka-Volterra.",
        },
      },
      {
        slug: "what-is-pandoran-life-made-of",
        title: { vi: "Sự sống Pandora cấu tạo từ gì", en: "What is Pandoran life made of" },
        payload: {
          vi: "Bất định sinh hóa → sinh học vũ trụ, sinh hóa thay thế.",
          en: "Biochemistry uncertainty → astrobiology, alternative biochemistries.",
        },
      },
      {
        slug: "the-pandoran-umwelt",
        title: { vi: "Umwelt của Pandora", en: "The Pandoran umwelt" },
        payload: {
          vi: "Giác quan, cảm từ → sinh thái giác quan, khái niệm Umwelt.",
          en: "Senses, magnetoreception → sensory ecology, the Umwelt concept.",
        },
      },
    ],
  },
  {
    id: "eywa",
    label: { vi: "Phần III — Mạng sống Eywa", en: "Part III — The Living Network / Eywa" },
    chapters: [
      {
        slug: "what-eywa-is",
        title: { vi: "Eywa là gì", en: "What Eywa is" },
        payload: {
          vi: "Eywa qua canon → nhận thức phân tán, ranh giới mạng/tâm trí.",
          en: "Eywa across canon → distributed cognition, the network/mind boundary.",
        },
      },
      {
        slug: "the-wood-wide-web",
        title: { vi: "Mạng rừng kết nối", en: "The wood-wide web" },
        payload: {
          vi: "Cây Linh hồn/Hometree nối rễ → mạng nấm rễ (Simard, Kiers).",
          en: "Tree of Souls/Hometree root-coupling → mycorrhizal networks.",
        },
      },
      {
        slug: "the-bandwidth-of-a-planet",
        title: { vi: "Băng thông của một hành tinh", en: "The bandwidth of a planet" },
        payload: {
          vi: "Tsahaylu như liên kết dữ liệu → lý thuyết thông tin, giới hạn Shannon.",
          en: "Tsahaylu as data link → information theory, Shannon limits.",
        },
      },
      {
        slug: "why-burning-eywa-doesnt-kill-it",
        title: { vi: "Vì sao đốt Eywa không giết được nó", en: "Why burning Eywa doesn't kill it" },
        payload: {
          vi: "RDA đánh vào mạng → khả năng phục hồi mạng, lý thuyết thấm.",
          en: "RDA strikes on the network → network resilience, percolation theory.",
        },
      },
      {
        slug: "a-real-living-planet",
        title: { vi: "Một hành tinh sống thật sự", en: "A real living planet" },
        payload: {
          vi: "Tổng hợp → giả thuyết Gaia nhìn lại.",
          en: "Synthesis → the Gaia hypothesis revisited.",
        },
      },
    ],
  },
  {
    id: "forests-mountains-skies",
    label: { vi: "Phần IV — Rừng, Núi, Trời", en: "Part IV — Forests, Mountains, Skies" },
    chapters: [
      {
        slug: "the-forest-as-a-cathedral",
        title: { vi: "Rừng như một thánh đường", en: "The forest as a cathedral" },
        payload: {
          vi: "Phân tầng tán rừng → phân tầng rừng, phân chia ổ sinh thái.",
          en: "Canopy stratification → forest stratification, niche partitioning.",
        },
      },
      {
        slug: "why-banshees-get-to-be-big",
        title: { vi: "Vì sao ikran được phép to", en: "Why banshees get to be big" },
        payload: {
          vi: "Tỉ lệ động vật bay → cơ sinh học bay, Reynolds, tải cánh.",
          en: "Flying fauna scaling → flight biomechanics, Reynolds number, wing loading.",
        },
      },
      {
        slug: "the-night-ecology",
        title: { vi: "Sinh thái ban đêm", en: "The night ecology" },
        payload: {
          vi: "Hệ sinh thái hoạt động đêm → sinh học nhịp ngày dưới ánh sáng phi Trái Đất.",
          en: "Night-active ecosystem → circadian biology under non-Earth light.",
        },
      },
      {
        slug: "hometree-as-keystone",
        title: { vi: "Hometree là loài chủ chốt", en: "Hometree as keystone" },
        payload: {
          vi: "Sụp đổ Hometree gây dây chuyền → loài chủ chốt/nền tảng.",
          en: "Hometree collapse cascade → keystone/foundation species.",
        },
      },
      {
        slug: "pandoras-smallest-things",
        title: { vi: "Những thứ nhỏ nhất của Pandora", en: "Pandora's smallest things" },
        payload: {
          vi: "Vi sinh đất + ký chủ-mầm bệnh → sinh thái đất, đồng tiến hóa, Nữ hoàng Đỏ.",
          en: "Soil microbiome + host-pathogen → soil ecology, host-pathogen co-evolution, Red Queen.",
        },
      },
    ],
  },
  {
    id: "sea-and-reefs",
    label: { vi: "Phần V — Biển & Rạn", en: "Part V — Sea & Reefs" },
    chapters: [
      {
        slug: "pandoras-ocean",
        title: { vi: "Đại dương Pandora", en: "Pandora's ocean" },
        payload: {
          vi: "Biển Đông, rạn, biome sâu → phân tầng đại dương, nước trồi.",
          en: "Eastern Sea, reefs, deep biomes → ocean stratification, upwelling.",
        },
      },
      {
        slug: "tulkun-not-quite-whales",
        title: { vi: "Tulkun — không hẳn cá voi", en: "Tulkun, not quite whales" },
        payload: {
          vi: "Tulkun, Payakan → nhận thức cá voi, truyền văn hóa.",
          en: "Tulkun, Payakan → cetacean cognition, cultural transmission.",
        },
      },
      {
        slug: "the-reef-as-substrate",
        title: { vi: "Rạn như nền sống", en: "The reef as substrate" },
        payload: {
          vi: "Sự sống rạn Metkayina → sinh thái rạn san hô, cộng sinh, zooxanthellae.",
          en: "Metkayina reef life → coral-reef ecology, symbiosis, zooxanthellae.",
        },
      },
      {
        slug: "bodies-built-for-water",
        title: { vi: "Cơ thể dựng cho nước", en: "Bodies built for water" },
        payload: {
          vi: "Thích nghi Metkayina → thích nghi dưới nước, thợ lặn Bajau, tiến hóa người gần đây.",
          en: "Metkayina adaptation → aquatic adaptation, Bajau divers, recent human evolution.",
        },
      },
      {
        slug: "amrita-and-the-price-of-a-hunt",
        title: { vi: "Amrita và cái giá của cuộc săn", en: "Amrita and the price of a hunt" },
        payload: {
          vi: "Khai thác sinh học tulkun → bioprospecting, biopiracy, Nghị định thư Nagoya.",
          en: "Bio-extraction of tulkun → bioprospecting, biopiracy, the Nagoya Protocol.",
        },
      },
    ],
  },
  {
    id: "the-navi",
    label: { vi: "Phần VI — Người Na'vi", en: "Part VI — The Na'vi" },
    chapters: [
      {
        slug: "the-navi-body",
        title: { vi: "Cơ thể Na'vi", en: "The Na'vi body" },
        payload: {
          vi: "Giải phẫu cao 3m, queue → tỉ lệ allometric, điều nhiệt, luật bình phương-lập phương.",
          en: "10ft anatomy, queue → allometric scaling, thermoregulation, the square-cube law.",
        },
      },
      {
        slug: "the-queue-as-interface",
        title: { vi: "Queue như một giao diện", en: "The queue as interface" },
        payload: {
          vi: "Cơ chế tsahaylu → giao diện thần kinh, BCI.",
          en: "Tsahaylu mechanics → neural interfaces, BCI.",
        },
      },
      {
        slug: "navi-language-as-a-window",
        title: { vi: "Tiếng Na'vi như một cửa sổ", en: "Na'vi language as a window" },
        payload: {
          vi: "Tiếng Na'vi của Frommer → tương đối ngôn ngữ, loại hình học.",
          en: "Frommer's Na'vi → linguistic relativity, typology.",
        },
      },
      {
        slug: "one-people-many-ecologies",
        title: { vi: "Một dân tộc, nhiều sinh thái", en: "One people, many ecologies" },
        payload: {
          vi: "Bộ tộc hình thành bởi sinh thái → sinh thái văn hóa, kiến tạo ổ.",
          en: "Clans shaped by ecology → cultural ecology, niche construction.",
        },
      },
      {
        slug: "what-the-elders-know",
        title: { vi: "Điều các bậc trưởng lão biết", en: "What the elders know" },
        payload: {
          vi: "Tri thức sinh thái Na'vi → tri thức sinh thái truyền thống (TEK).",
          en: "Na'vi ecological knowledge → Traditional Ecological Knowledge (TEK).",
        },
      },
      {
        slug: "i-see-you",
        title: { vi: "Ta thấy ngươi", en: "I see you" },
        payload: {
          vi: "Oel ngati kameie, tri giác → nhận thức nhập thể, affordance của Gibson.",
          en: "Oel ngati kameie, perception → embodied cognition, Gibson's affordances.",
        },
      },
    ],
  },
  {
    id: "the-human-machine",
    label: {
      vi: "Phần VII — Cỗ máy con người / RDA",
      en: "Part VII — The Human Machine / RDA Tech",
    },
    chapters: [
      {
        slug: "six-years-each-way",
        title: { vi: "Sáu năm mỗi chiều", en: "Six years each way" },
        payload: {
          vi: "ISV Venture Star, lực đẩy → động cơ liên sao, phản vật chất, 0.7c.",
          en: "ISV Venture Star, propulsion → interstellar propulsion, antimatter, 0.7c.",
        },
      },
      {
        slug: "sleeping-through-the-stars",
        title: { vi: "Ngủ xuyên các vì sao", en: "Sleeping through the stars" },
        payload: {
          vi: "Cryosleep → ngủ đông cảm ứng, hạ thân nhiệt trị liệu.",
          en: "Cryosleep → induced torpor, therapeutic hypothermia.",
        },
      },
      {
        slug: "the-avatar-body",
        title: { vi: "Cơ thể Avatar", en: "The avatar body" },
        payload: {
          vi: "Cơ thể lai, đơn vị link → BCI, telepresence, chimerism.",
          en: "Hybrid bodies, link unit → BCI, telepresence, chimerism.",
        },
      },
      {
        slug: "what-extraction-costs",
        title: { vi: "Cái giá của khai thác", en: "What extraction costs" },
        payload: {
          vi: "Khai mỏ unobtanium → kỹ thuật mỏ, EROI.",
          en: "Unobtanium mining → mining engineering, EROI.",
        },
      },
      {
        slug: "what-the-mask-buys-you",
        title: { vi: "Cái mặt nạ mua được gì", en: "What the mask buys you" },
        payload: {
          vi: "Exo-pack, hỗ trợ sống → ECLSS vòng kín.",
          en: "Exo-packs, life support → closed-loop ECLSS.",
        },
      },
      {
        slug: "old-minds-in-new-bodies",
        title: { vi: "Tâm trí cũ trong thân xác mới", en: "Old minds in new bodies" },
        payload: {
          vi: "Recombinant + chuyển ý thức → mô phỏng não, tính liên tục bản ngã.",
          en: "Recombinants + consciousness transfer → brain emulation, continuity of identity.",
        },
      },
    ],
  },
  {
    id: "contact-conflict-ethics",
    label: {
      vi: "Phần VIII — Tiếp xúc, Xung đột, Đạo đức",
      en: "Part VIII — Contact, Conflict, Ethics",
    },
    chapters: [
      {
        slug: "first-contact-as-a-pattern",
        title: { vi: "Tiếp xúc đầu tiên như một mô thức", en: "First contact as a pattern" },
        payload: {
          vi: "Tiếp xúc kéo dài hàng thập kỷ → nhân học về tiếp xúc (Sentinelese, Yanomami).",
          en: "Decades-long contact → anthropology of contact (Sentinelese, Yanomami).",
        },
      },
      {
        slug: "whose-body-whose-consent",
        title: { vi: "Thân ai, đồng thuận của ai", en: "Whose body, whose consent" },
        payload: {
          vi: "Đạo đức chương trình Avatar, DNA → đạo đức nghiên cứu, chủ quyền dữ liệu bản địa (Tuskegee, HeLa, OCAP).",
          en: "Avatar program ethics, DNA → research ethics, indigenous data sovereignty (Tuskegee, HeLa, OCAP).",
        },
      },
      {
        slug: "no-shared-grammar",
        title: { vi: "Không chung ngữ pháp", en: "No shared grammar" },
        payload: {
          vi: "Thất bại giao tiếp → vấn đề bất khả thông ước, giao tiếp liên văn hóa.",
          en: "Communication failure → the commensurability problem, cross-cultural communication.",
        },
      },
      {
        slug: "why-the-stronger-side-loses",
        title: { vi: "Vì sao bên mạnh hơn lại thua", en: "Why the stronger side loses" },
        payload: {
          vi: "Các trận đánh → chiến tranh bất đối xứng, lý thuyết nổi dậy.",
          en: "The battles → asymmetric warfare, insurgency theory.",
        },
      },
      {
        slug: "pandora-as-mirror",
        title: { vi: "Pandora như một tấm gương", en: "Pandora as mirror" },
        payload: {
          vi: "Logic thực dân + hàn gắn → nghiên cứu khoa học hậu thực dân, công lý chuyển tiếp.",
          en: "Colonial logic + repair → postcolonial science studies, transitional justice.",
        },
      },
    ],
  },
  {
    id: "open-questions",
    label: { vi: "Phần IX — Câu hỏi mở", en: "Part IX — Open Questions" },
    chapters: [
      {
        slug: "pandoras-open-file",
        title: { vi: "Hồ sơ mở của Pandora", en: "Pandora's open file" },
        payload: {
          vi: "Những lỗ hổng canon lớn nhất → cấu trúc của một câu hỏi khoa học mở.",
          en: "The biggest canon gaps → the structure of an open scientific question.",
        },
      },
      {
        slug: "what-pandora-helps-us-see",
        title: { vi: "Điều Pandora giúp ta thấy", en: "What Pandora helps us see" },
        payload: {
          vi: "Tổng hợp + Fermi → suy luận phản thực, phương trình Drake, nghịch lý Fermi.",
          en: "Synthesis + Fermi → counterfactual reasoning, the Drake equation, the Fermi paradox.",
        },
      },
    ],
  },
];

export interface OutlineChapterWithStatus extends OutlineChapter {
  plateNo: string;
  published: boolean;
}

export interface OutlinePartWithStatus {
  id: string;
  label: { vi: string; en: string };
  chapters: OutlineChapterWithStatus[];
}

// Merge the static outline with which chapters are actually published, so the
// browser renders the full map with published entries clickable. Plate numbers
// run sequentially across the whole book.
export function getOutlineWithStatus(locale: Locale): OutlinePartWithStatus[] {
  const published = new Set(listPublishedChapters(locale).map((c) => c.meta.slug));
  let n = 0;
  return OUTLINE.map((part) => ({
    id: part.id,
    label: part.label,
    chapters: part.chapters.map((ch) => {
      n += 1;
      return { ...ch, plateNo: String(n).padStart(2, "0"), published: published.has(ch.slug) };
    }),
  }));
}
