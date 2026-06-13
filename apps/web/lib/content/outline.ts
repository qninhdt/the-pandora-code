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
    label: { vi: "Khúc dạo đầu", en: "Prologue" },
    chapters: [
      {
        slug: "reading-pandora-as-a-specimen",
        title: {
          vi: "Mổ xẻ Pandora như một mẫu vật",
          en: "Reading Pandora as a specimen",
        },
        payload: {
          vi: "Nhìn nhận Pandora như một mẫu vật khoa học thay vì một kịch bản phim thuần túy → hệ quy chiếu Cốt truyện gốc / Suy luận / Phỏng đoán / Khoa học thực tiễn.",
          en: "Read Pandora as a specimen, not a plot → the Canon/Inference/Speculation/Real-science tier system.",
        },
      },
    ],
  },
  {
    id: "the-world",
    label: { vi: "Phần I - Thế giới", en: "Part I - The World" },
    chapters: [
      {
        slug: "where-is-pandora",
        title: { vi: "Pandora nằm ở đâu?", en: "Where is Pandora" },
        payload: {
          vi: "Hệ sao Alpha Centauri A, hành tinh khí Polyphemus và mặt trăng Pandora → Vùng ở được quanh hệ sao đôi và nghệ thuật săn lùng ngoại hành tinh.",
          en: "Alpha Centauri A, Polyphemus, Pandora as moon → habitable zones around binary stars, exoplanet detection.",
        },
      },
      {
        slug: "time-on-pandora",
        title: {
          vi: "Nhịp điệu thời gian trên Pandora",
          en: "Time on Pandora",
        },
        payload: {
          vi: "Chu kỳ tự quay, nhật thực và sự luân chuyển mùa màng → Khóa thủy triều, bình động (libration) và vũ điệu của cơ học quỹ đạo.",
          en: "Rotation, eclipses, seasons → tidal locking, libration, orbital mechanics.",
        },
      },
      {
        slug: "whats-in-the-air",
        title: {
          vi: "Có gì trong bầu không khí chết chóc ấy?",
          en: "What's in the air",
        },
        payload: {
          vi: "Bầu khí quyển kịch độc mang 18% oxy → Hóa học khí quyển, dấu ấn sinh học (biosignature) và sự mất cân bằng giữa O₂/CH₄.",
          en: "Toxic 18% O₂ atmosphere → atmospheric chemistry, biosignatures, O₂/CH₄ disequilibrium.",
        },
      },
      {
        slug: "floating-mountains-and-the-superconductor",
        title: {
          vi: "Những ngọn núi bay và chất siêu dẫn",
          en: "Floating mountains and the superconductor",
        },
        payload: {
          vi: "Dãy Hallelujah, quặng unobtanium và vùng xoáy từ khổng lồ → Nguyên lý siêu dẫn (cặp Cooper, hiệu ứng Meissner, ghim từ thông) và lực nâng nghịch từ.",
          en: "Hallelujah Mountains + unobtanium + magnetic vortices → superconductivity (Cooper pairs, Meissner, flux pinning).",
        },
      },
      {
        slug: "continents-oceans-climate",
        title: {
          vi: "Lục địa, đại dương và khí hậu",
          en: "Continents, oceans, climate",
        },
        payload: {
          vi: "Kiến tạo bề mặt và vùng Biển Đông mênh mông → Khí hậu học so sánh, hoàn lưu Hadley và bức tranh toàn cảnh của các quần xã sinh vật (biome).",
          en: "Surface geography, Eastern Sea → comparative climatology, Hadley cells, biomes.",
        },
      },
      {
        slug: "pandoras-deep-time",
        title: {
          vi: "Dòng thời gian sâu thẳm của Pandora",
          en: "Pandora's deep time",
        },
        payload: {
          vi: "Tuổi thọ và biên niên sử địa chất → Ngành niên đại học, phương pháp định tuổi bằng đồng vị phóng xạ và quá trình tiến hóa hành tinh.",
          en: "Age, geological history → geochronology, radiometric dating, planetary evolution.",
        },
      },
    ],
  },
  {
    id: "the-living-world",
    label: { vi: "Phần II - Thế giới sống", en: "Part II - The Living World" },
    chapters: [
      {
        slug: "six-limbs-and-the-bilateral-lattice",
        title: {
          vi: "Sáu chi và khuôn mẫu đối xứng hai bên",
          en: "Six limbs and the bilateral lattice",
        },
        payload: {
          vi: "Cấu trúc cơ thể sáu chi dạo bước trên Pandora → Sự tiến hóa của sơ đồ cấu tạo cơ thể (body plan) và quyền năng của gene Hox.",
          en: "Hexapodal body plan → body-plan evolution, Hox genes.",
        },
      },
      {
        slug: "convergent-but-not-quite",
        title: {
          vi: "Tiến hóa hội tụ, nhưng lại là một ngã rẽ khác",
          en: "Convergent but not quite",
        },
        payload: {
          vi: "Những mảnh ghép sinh thái mang bóng dáng Trái Đất → Quá trình tiến hóa hội tụ và sự phân chia các ổ sinh thái.",
          en: "Familiar ecological roles → convergent evolution, niches.",
        },
      },
      {
        slug: "the-breathing-fans",
        title: {
          vi: "Những chiếc quạt thở (operculum)",
          en: "The breathing fans",
        },
        payload: {
          vi: "Cấu tạo khe thở hai bên mạn sườn → Nhãn quan của ngành sinh học hô hấp so sánh.",
          en: "Lateral respiratory openings → comparative respiratory biology.",
        },
      },
      {
        slug: "when-glow-is-the-norm",
        title: {
          vi: "Khi sự rực rỡ trong đêm là chuẩn mực",
          en: "When glow is the norm",
        },
        payload: {
          vi: "Thế giới phát quang sinh học ngập tràn vạn vật → Hóa học của ánh sáng và lý do tại sao màn đêm lại chắp cánh cho sự tiến hóa này.",
          en: "Ubiquitous bioluminescence → bioluminescence chemistry, why glow evolves.",
        },
      },
      {
        slug: "pandoran-tree-of-life",
        title: { vi: "Phả hệ sự sống Pandora", en: "Pandoran tree of life" },
        payload: {
          vi: "Truy vết nguồn cội các loài sinh vật → Phát sinh chủng loài học, biểu đồ phân nhánh (cladogram) và nguyên lý tối giản (parsimony).",
          en: "Reconstruct phylogeny → phylogenetics, cladograms, parsimony.",
        },
      },
      {
        slug: "direhorse-and-banshee-up-close",
        title: {
          vi: "Mổ xẻ pa'li và ikran",
          en: "Direhorse and banshee up close",
        },
        payload: {
          vi: "Giải phẫu cơ thể ngựa pa'li, bạo long ikran cùng sợi ăng-ten (queue) → Tỉ lệ dị sinh trưởng (allometric scaling) và cơ sinh học.",
          en: "Pa'li & ikran anatomy + queue → allometric scaling, biomechanics.",
        },
      },
      {
        slug: "the-hunters-and-the-hunted",
        title: {
          vi: "Kẻ đi săn và kẻ bị săn",
          en: "The hunters and the hunted",
        },
        payload: {
          vi: "Tập tính bầy đàn của những dã thú săn mồi → Trò chơi vờn bắt giữa kẻ thù và con mồi qua lăng kính mô hình Lotka-Volterra.",
          en: "Predator guild → predator-prey dynamics, Lotka-Volterra.",
        },
      },
      {
        slug: "what-is-pandoran-life-made-of",
        title: {
          vi: "Sự sống Pandora được nhào nặn từ đâu?",
          en: "What is Pandoran life made of",
        },
        payload: {
          vi: "Vén màn bí ẩn về các nền tảng sinh hóa → Sinh học vũ trụ và những giả thuyết về các hệ sinh hóa dị biệt.",
          en: "Biochemistry uncertainty → astrobiology, alternative biochemistries.",
        },
      },
      {
        slug: "the-pandoran-umwelt",
        title: {
          vi: "Umwelt – Lăng kính tri giác trên Pandora",
          en: "The Pandoran umwelt",
        },
        payload: {
          vi: "Hệ thống giác quan và khả năng cảm nhận từ trường → Sinh thái học giác quan và khái niệm thế giới tri giác (Umwelt).",
          en: "Senses, magnetoreception → sensory ecology, the Umwelt concept.",
        },
      },
    ],
  },
  {
    id: "eywa",
    label: {
      vi: "Phần III - Mạng lưới Sự sống Eywa",
      en: "Part III - The Living Network / Eywa",
    },
    chapters: [
      {
        slug: "what-eywa-is",
        title: { vi: "Bản chất thực sự của Eywa", en: "What Eywa is" },
        payload: {
          vi: "Phác họa Eywa qua lăng kính cốt truyện gốc → Trí tuệ phân tán (distributed cognition) và ranh giới mờ ảo giữa một mạng lưới và một thực thể tâm trí.",
          en: "Eywa across canon → distributed cognition, the network/mind boundary.",
        },
      },
      {
        slug: "the-wood-wide-web",
        title: {
          vi: "Wood-Wide Web: Mạng internet của núi rừng",
          en: "The wood-wide web",
        },
        payload: {
          vi: "Sợi dây liên kết rễ giữa Cây Linh Hồn và Hometree → Mạng lưới nấm rễ khổng lồ dưới lòng đất (theo nghiên cứu của Simard và Kiers).",
          en: "Tree of Souls/Hometree root-coupling → mycorrhizal networks.",
        },
      },
      {
        slug: "the-bandwidth-of-a-planet",
        title: {
          vi: "Băng thông của cả một hành tinh",
          en: "The bandwidth of a planet",
        },
        payload: {
          vi: "Liên kết tsahaylu dưới góc độ truyền tải dữ liệu → Lý thuyết thông tin và ranh giới giới hạn Shannon.",
          en: "Tsahaylu as data link → information theory, Shannon limits.",
        },
      },
      {
        slug: "why-burning-eywa-doesnt-kill-it",
        title: {
          vi: "Vì sao thiêu rụi Eywa lại chẳng thể kết liễu được nó",
          en: "Why burning Eywa doesn't kill it",
        },
        payload: {
          vi: "Những đòn giáng của RDA vào hệ thống mạng lưới → Khả năng phục hồi tột đỉnh và lý thuyết thẩm thấu (percolation theory).",
          en: "RDA strikes on the network → network resilience, percolation theory.",
        },
      },
      {
        slug: "a-real-living-planet",
        title: {
          vi: "Một hành tinh đang thở đúng nghĩa",
          en: "A real living planet",
        },
        payload: {
          vi: "Đúc kết toàn bộ chuỗi mắt xích → Nhìn lại Giả thuyết Gaia dưới một góc độ hoàn toàn mới.",
          en: "Synthesis → the Gaia hypothesis revisited.",
        },
      },
    ],
  },
  {
    id: "forests-mountains-skies",
    label: {
      vi: "Phần IV - Rừng Rậm, Núi Non và Bầu Trời",
      en: "Part IV - Forests, Mountains, Skies",
    },
    chapters: [
      {
        slug: "the-forest-as-a-cathedral",
        title: {
          vi: "Khu rừng mang dáng dấp một thánh đường",
          en: "The forest as a cathedral",
        },
        payload: {
          vi: "Kiến trúc nhiều tầng của vòm lá → Sự phân tầng rừng rậm và nghệ thuật chia lô các ổ sinh thái.",
          en: "Canopy stratification → forest stratification, niche partitioning.",
        },
      },
      {
        slug: "why-banshees-get-to-be-big",
        title: {
          vi: "Bí quyết giúp banshee sở hữu thân hình khổng lồ",
          en: "Why banshees get to be big",
        },
        payload: {
          vi: "Giới hạn kích thước của các sinh vật biết bay → Cơ sinh học của những sải cánh, số Reynolds và lực tải cánh.",
          en: "Flying fauna scaling → flight biomechanics, Reynolds number, wing loading.",
        },
      },
      {
        slug: "the-night-ecology",
        title: {
          vi: "Bức tranh sinh thái khi màn đêm buông xuống",
          en: "The night ecology",
        },
        payload: {
          vi: "Sự trỗi dậy của thế giới về đêm → Đồng hồ sinh học (nhịp sirkadian) vận hành dưới luồng ánh sáng xa lạ bên ngoài Trái Đất.",
          en: "Night-active ecosystem → circadian biology under non-Earth light.",
        },
      },
      {
        slug: "hometree-as-keystone",
        title: {
          vi: "Hometree – Nền móng của cả hệ sinh thái",
          en: "Hometree as keystone",
        },
        payload: {
          vi: "Hệ lụy domino khi Hometree sụp đổ → Khái niệm về loài nòng cốt (keystone) và loài nền tảng (foundation species).",
          en: "Hometree collapse cascade → keystone/foundation species.",
        },
      },
      {
        slug: "pandoras-smallest-things",
        title: {
          vi: "Những sinh thể bé mọn nhất Pandora",
          en: "Pandora's smallest things",
        },
        payload: {
          vi: "Hệ vi sinh lòng đất và cuộc chiến giữa vật chủ - mầm bệnh → Sinh thái học đất màu, sự đồng tiến hóa và giả thuyết Nữ hoàng Đỏ.",
          en: "Soil microbiome + host-pathogen → soil ecology, host-pathogen co-evolution, Red Queen.",
        },
      },
    ],
  },
  {
    id: "sea-and-reefs",
    label: {
      vi: "Phần V - Đại Dương và Rạn San Hô",
      en: "Part V - Sea & Reefs",
    },
    chapters: [
      {
        slug: "pandoras-ocean",
        title: { vi: "Đại dương trên Pandora", en: "Pandora's ocean" },
        payload: {
          vi: "Vùng Biển Đông mênh mang, các rạn đá và quần xã sinh vật vực thẳm → Sự phân tầng đại dương và hiện tượng nước trồi (upwelling).",
          en: "Eastern Sea, reefs, deep biomes → ocean stratification, upwelling.",
        },
      },
      {
        slug: "tulkun-not-quite-whales",
        title: {
          vi: "Tulkun — Vượt xa khái niệm cá voi thông thường",
          en: "Tulkun, not quite whales",
        },
        payload: {
          vi: "Giống loài tulkun và nhân vật Payakan → Trí tuệ của bộ cá voi và khả năng lưu truyền di sản văn hóa.",
          en: "Tulkun, Payakan → cetacean cognition, cultural transmission.",
        },
      },
      {
        slug: "the-reef-as-substrate",
        title: {
          vi: "Rạn san hô — Bệ phóng của sự sống",
          en: "The reef as substrate",
        },
        payload: {
          vi: "Hệ sinh thái bủa vây quanh thủy tộc Metkayina → Sinh thái rạn san hô, mối quan hệ cộng sinh và tảo zooxanthellae.",
          en: "Metkayina reef life → coral-reef ecology, symbiosis, zooxanthellae.",
        },
      },
      {
        slug: "bodies-built-for-water",
        title: {
          vi: "Những cơ thể sinh ra để thuộc về biển cả",
          en: "Bodies built for water",
        },
        payload: {
          vi: "Đặc điểm thích nghi của tộc Metkayina → Sự tiến hóa để sinh tồn dưới nước, những thợ lặn người Bajau và bước tiến hóa gần đây của nhân loại.",
          en: "Metkayina adaptation → aquatic adaptation, Bajau divers, recent human evolution.",
        },
      },
      {
        slug: "amrita-and-the-price-of-a-hunt",
        title: {
          vi: "Trích xuất Amrita và cái giá máu của những cuộc đi săn",
          en: "Amrita and the price of a hunt",
        },
        payload: {
          vi: "Cơn khát khai thác tài nguyên sinh học từ tulkun → Đãi cát tìm sinh chất (bioprospecting), nạn cướp đoạt sinh học (biopiracy) và Nghị định thư Nagoya.",
          en: "Bio-extraction of tulkun → bioprospecting, biopiracy, the Nagoya Protocol.",
        },
      },
    ],
  },
  {
    id: "the-navi",
    label: { vi: "Phần VI - Người Na'vi", en: "Part VI - The Na'vi" },
    chapters: [
      {
        slug: "the-navi-body",
        title: { vi: "Cấu tạo cơ thể người Na'vi", en: "The Na'vi body" },
        payload: {
          vi: "Giải phẫu chiều cao 3 mét và sợi ăng-ten queue → Tỉ lệ dị sinh trưởng, cơ chế điều hòa thân nhiệt và định luật bình phương-lập phương.",
          en: "10ft anatomy, queue → allometric scaling, thermoregulation, the square-cube law.",
        },
      },
      {
        slug: "the-queue-as-interface",
        title: {
          vi: "Queue — Cổng kết nối vạn vật",
          en: "The queue as interface",
        },
        payload: {
          vi: "Bóc tách cơ chế của tsahaylu → Cổng giao tiếp thần kinh và Công nghệ Giao diện Não-Máy tính (BCI).",
          en: "Tsahaylu mechanics → neural interfaces, BCI.",
        },
      },
      {
        slug: "navi-language-as-a-window",
        title: {
          vi: "Ngôn ngữ Na'vi — Cửa sổ nhìn thấu tư duy",
          en: "Na'vi language as a window",
        },
        payload: {
          vi: "Thứ ngôn ngữ do Paul Frommer sáng tạo → Thuyết tương đối ngôn ngữ và loại hình học ngôn ngữ.",
          en: "Frommer's Na'vi → linguistic relativity, typology.",
        },
      },
      {
        slug: "one-people-many-ecologies",
        title: {
          vi: "Một dân tộc, muôn vàn ngã rẽ sinh thái",
          en: "One people, many ecologies",
        },
        payload: {
          vi: "Lối sống các bộ tộc được nhào nặn từ môi trường → Sinh thái học văn hóa và quá trình kiến tạo ổ sinh thái.",
          en: "Clans shaped by ecology → cultural ecology, niche construction.",
        },
      },
      {
        slug: "what-the-elders-know",
        title: {
          vi: "Trí tuệ của những bậc trưởng lão",
          en: "What the elders know",
        },
        payload: {
          vi: "Kho tàng tri thức sinh thái của người Na'vi → Tri thức Sinh thái Truyền thống (TEK).",
          en: "Na'vi ecological knowledge → Traditional Ecological Knowledge (TEK).",
        },
      },
      {
        slug: "i-see-you",
        title: { vi: "Oel Ngati Kameie — Ta thấy ngươi", en: "I see you" },
        payload: {
          vi: "Câu chào 'Oel ngati kameie' và chiều sâu tri giác → Nhận thức nhập thể (embodied cognition) và khái niệm 'Affordance' của Gibson.",
          en: "Oel ngati kameie, perception → embodied cognition, Gibson's affordances.",
        },
      },
    ],
  },
  {
    id: "the-human-machine",
    label: {
      vi: "Phần VII - Cỗ máy Nhân loại / Công nghệ RDA",
      en: "Part VII - The Human Machine / RDA Tech",
    },
    chapters: [
      {
        slug: "six-years-each-way",
        title: {
          vi: "Sáu năm ròng rã cho một chặng đường",
          en: "Six years each way",
        },
        payload: {
          vi: "Tàu ISV Venture Star và hệ thống lực đẩy → Động cơ du hành liên sao, phản vật chất và vận tốc 0.7 lần tốc độ ánh sáng.",
          en: "ISV Venture Star, propulsion → interstellar propulsion, antimatter, 0.7c.",
        },
      },
      {
        slug: "sleeping-through-the-stars",
        title: {
          vi: "Giấc ngủ đông xuyên qua muôn ngàn vì sao",
          en: "Sleeping through the stars",
        },
        payload: {
          vi: "Công nghệ ngủ đông (Cryosleep) → Trạng thái tê liệt cảm ứng (induced torpor) và liệu pháp hạ thân nhiệt y khoa.",
          en: "Cryosleep → induced torpor, therapeutic hypothermia.",
        },
      },
      {
        slug: "the-avatar-body",
        title: { vi: "Bên trong lớp vỏ bọc Avatar", en: "The avatar body" },
        payload: {
          vi: "Cơ thể lai tạo và buồng kết nối (link unit) → Giao diện Não-Máy tính (BCI), hiện diện từ xa (telepresence) và thể khảm di truyền (chimerism).",
          en: "Hybrid bodies, link unit → BCI, telepresence, chimerism.",
        },
      },
      {
        slug: "what-extraction-costs",
        title: {
          vi: "Cái giá đắt đỏ của những cuộc khai quật",
          en: "What extraction costs",
        },
        payload: {
          vi: "Hoạt động cày xới mặt đất vì unobtanium → Kỹ thuật khai khoáng và chỉ số Hoàn vốn Năng lượng Đầu tư (EROI).",
          en: "Unobtanium mining → mining engineering, EROI.",
        },
      },
      {
        slug: "what-the-mask-buys-you",
        title: {
          vi: "Chiếc mặt nạ đem lại cho bạn những gì?",
          en: "What the mask buys you",
        },
        payload: {
          vi: "Thiết bị lọc khí (Exo-pack) và hệ thống hỗ trợ sinh tồn → Hệ thống kiểm soát môi trường và sinh tồn (ECLSS) vòng kín.",
          en: "Exo-packs, life support → closed-loop ECLSS.",
        },
      },
      {
        slug: "old-minds-in-new-bodies",
        title: {
          vi: "Những linh hồn cũ kĩ rúc trong thể xác mới",
          en: "Old minds in new bodies",
        },
        payload: {
          vi: "Các cá thể tái tổ hợp (Recombinant) và việc cấy ghép ý thức → Giả lập não bộ và sự liền mạch của bản ngã con người.",
          en: "Recombinants + consciousness transfer → brain emulation, continuity of identity.",
        },
      },
    ],
  },
  {
    id: "contact-conflict-ethics",
    label: {
      vi: "Phần VIII - Chạm trán, Xung đột và Lằn ranh Đạo đức",
      en: "Part VIII - Contact, Conflict, Ethics",
    },
    chapters: [
      {
        slug: "first-contact-as-a-pattern",
        title: {
          vi: "Cuộc chạm trán đầu tiên: Một vết xe đổ lặp lại",
          en: "First contact as a pattern",
        },
        payload: {
          vi: "Quá trình va chạm văn hóa kéo dài hàng thập kỷ → Nhân học về sự tiếp xúc (qua góc nhìn từ các bộ tộc Sentinelese, Yanomami).",
          en: "Decades-long contact → anthropology of contact (Sentinelese, Yanomami).",
        },
      },
      {
        slug: "whose-body-whose-consent",
        title: {
          vi: "Thân xác của ai, sự đồng thuận thuộc về ai?",
          en: "Whose body, whose consent",
        },
        payload: {
          vi: "Lỗ hổng đạo đức của dự án Avatar và việc đánh cắp DNA → Đạo đức nghiên cứu và chủ quyền dữ liệu của người bản địa (Tuskegee, tế bào HeLa, nguyên tắc OCAP).",
          en: "Avatar program ethics, DNA → research ethics, indigenous data sovereignty (Tuskegee, HeLa, OCAP).",
        },
      },
      {
        slug: "no-shared-grammar",
        title: { vi: "Sự lệch pha về mặt ngữ pháp", en: "No shared grammar" },
        payload: {
          vi: "Sự sụp đổ trong việc truyền đạt → Vấn đề bất khả thông ước (commensurability) và bài toán giao tiếp liên văn hóa.",
          en: "Communication failure → the commensurability problem, cross-cultural communication.",
        },
      },
      {
        slug: "why-the-stronger-side-loses",
        title: {
          vi: "Vì sao phe nanh vuốt lại gục ngã trước kẻ yếu thế?",
          en: "Why the stronger side loses",
        },
        payload: {
          vi: "Mổ xẻ các trận chiến đẫm máu → Chiến tranh bất đối xứng và lý thuyết nổi dậy chống áp bức.",
          en: "The battles → asymmetric warfare, insurgency theory.",
        },
      },
      {
        slug: "pandora-as-mirror",
        title: {
          vi: "Pandora — Một tấm gương soi rọi chính loài người",
          en: "Pandora as mirror",
        },
        payload: {
          vi: "Tư duy thực dân và nỗ lực hàn gắn vết thương → Các nghiên cứu khoa học hậu thực dân và khái niệm công lý chuyển tiếp (transitional justice).",
          en: "Colonial logic + repair → postcolonial science studies, transitional justice.",
        },
      },
    ],
  },
  {
    id: "open-questions",
    label: {
      vi: "Phần IX - Những câu hỏi còn ngỏ",
      en: "Part IX - Open Questions",
    },
    chapters: [
      {
        slug: "pandoras-open-file",
        title: {
          vi: "Tập hồ sơ chưa khép lại của Pandora",
          en: "Pandora's open file",
        },
        payload: {
          vi: "Bóc trần những hố đen kịch bản lớn nhất → Cách định hình một câu hỏi mở trong giới khoa học.",
          en: "The biggest canon gaps → the structure of an open scientific question.",
        },
      },
      {
        slug: "what-pandora-helps-us-see",
        title: {
          vi: "Những chân trời mà Pandora hé mở",
          en: "What Pandora helps us see",
        },
        payload: {
          vi: "Đúc kết toàn thư và bài toán Fermi → Tư duy phản thực (counterfactual), phương trình Drake và nghịch lý Fermi kinh điển.",
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
      return {
        ...ch,
        plateNo: String(n).padStart(2, "0"),
        published: published.has(ch.slug),
      };
    }),
  }));
}
