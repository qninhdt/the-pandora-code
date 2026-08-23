import type { Locale } from "@/i18n/config";
import { listPublishedChapters } from "./loader/chapter-loader";

// Single source of truth for the book's structure: 10 Parts + a prologue, 65
// chapters total. Each chapter carries a bilingual one-line payload (the
// Pandora hook → real-science meal) and a rich, naturally flowing detailedPayload
// weaving canonical worldbuilding observations directly with empirical scientific analysis.
// The landing browser, reader nav, and the /pandora "next pending" logic all read this list.

export interface OutlineChapter {
  slug: string;
  title: { vi: string; en: string };
  /** One-line "Pandora bait → STEM meal" payload. */
  payload: { vi: string; en: string };
  /** Đoạn văn mô tả chi tiết, kết hợp nhuần nhuyễn quan sát canon và phân tích khoa học thực nghiệm. */
  detailedPayload: { vi: string; en: string };
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
          en: "Reading Pandora as a Specimen",
        },
        payload: {
          vi: "Nhìn nhận Pandora như một mẫu vật khoa học có hồ sơ không hoàn hảo → Thang 5 cấp bằng chứng và phương pháp tư duy khoa học thực nghiệm.",
          en: "Read Pandora as an imperfect scientific specimen → The 5-tier evidence hierarchy and empirical scientific method.",
        },
        detailedPayload: {
          vi: "Thay vì tóm lược cốt truyện điện ảnh, chương mở đầu xác lập luật chơi khoa học: phân định rạch ròi những gì xuất hiện trên màn ảnh, những gì Pandorapedia ghi chép, những gì tư liệu mở rộng tuyên bố và nơi suy luận thực nghiệm bắt đầu. Việc xử lý các mâu thuẫn trong tài liệu chính thức — từ thời gian vượt liên sao của tàu ISV đến bản chất siêu dẫn của khoáng vật unobtanium — trở thành bài học đầu tiên về cách một nhà nghiên cứu tiếp cận mẫu vật có hồ sơ chưa hoàn hảo. Toàn bộ cuốn sách vận hành dựa trên phương pháp luận chặt chẽ: tính khả bác (falsifiability), phân tích thứ nguyên, ước lượng bậc độ lớn, thanh sai số và cập nhật xác suất Bayes. Mọi hiện tượng trên Pandora đều đi qua chuỗi khép kín từ quan sát, lập giả thuyết, dựng mô hình định lượng đến kiểm tra độ hợp lý, biến sự tò mò viễn tưởng thành trải nghiệm tư duy khoa học đích thực.",
          en: "Rather than recounting the cinematic plot, the opening chapter establishes the scientific rules of engagement: sharply distinguishing what appears on screen, what Pandorapedia documents, what expanded materials claim, and where empirical deduction begins. Resolving discrepancies in official lore — from ISV interstellar transit times to the superconductor physics of unobtanium — serves as the first lesson in handling an imperfect specimen record. The inquiry is grounded in rigorous scientific methodology: falsifiability, dimensional analysis, order-of-magnitude estimates, error bars, and Bayesian updating. Every Pandoran phenomenon is routed through a disciplined pipeline from observation and multiple working hypotheses to quantitative modeling and plausibility checks, transforming science-fiction curiosity into authentic scientific investigation.",
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
        title: { vi: "Pandora nằm ở đâu?", en: "Where Is Pandora?" },
        payload: {
          vi: "Hệ sao Alpha Centauri và mặt trăng của hành tinh khí Polyphemus → Vùng ở được (habitable zone) quanh sao đôi và phương pháp săn lùng exomoon.",
          en: "Alpha Centauri and the moon of gas giant Polyphemus → Habitable zones around binary stars and exomoon detection.",
        },
        detailedPayload: {
          vi: "Pandora quay quanh Polyphemus — một hành tinh khí khổng lồ cỡ Sao Hải Vương trong hệ ba sao Alpha Centauri, chịu sự chi phối mãnh liệt từ trường hấp dẫn và từ quyển của hành tinh mẹ. Từ bối cảnh thiên văn nền tảng này, chúng ta khảo sát vùng ở được (habitable zone) quanh các hệ sao đôi phức tạp và điều kiện động lực học để một mặt trăng duy trì quỹ đạo ổn định. Việc phát hiện một thiên thể như Pandora trong thực tế đòi hỏi kỹ thuật đo biến thiên thời gian quá cảnh (transit timing variations), quang phổ truyền qua và chụp ảnh trực tiếp. Định nghĩa vùng sống được của NASA không chỉ dừng lại ở nước lỏng trên bề mặt; một mặt trăng có sự sống còn phải vượt qua bài toán khắc nghiệt về bão bức xạ sao, nhiệt thủy triều ma sát và sự nhiễu loạn quỹ đạo trường kỳ.",
          en: "Pandora orbits Polyphemus, a Neptune-sized gas giant within the Alpha Centauri trinary system, subjected to immense gravitational and magnetospheric forces from its parent world. This astronomical setting anchors an exploration of circumstellar habitable zones around binary stars and the dynamical stability required for giant-planet moons. Detecting a real-world Pandora relies on transit timing variations, transmission spectroscopy, and direct exoplanet imaging. Beyond NASA's baseline criterion of liquid surface water, a living exomoon must withstand intense stellar flare radiation, tidal heating dissipation, and persistent orbital perturbations.",
        },
      },
      {
        slug: "time-on-pandora",
        title: {
          vi: "Nhịp điệu thời gian trên Pandora",
          en: "Time on Pandora",
        },
        payload: {
          vi: "Bốn chiếc đồng hồ chi phối ngày đêm và nhật thực → Khóa thủy triều (tidal locking), bình động (libration) và cơ học quỹ đạo.",
          en: "Four distinct clocks governing days, eclipses, and seasons → Tidal locking, libration, and orbital mechanics.",
        },
        detailedPayload: {
          vi: "Bầu trời Pandora liên tục biến chuyển bởi các kỳ nhật thực do chiếc bóng khổng lồ của Polyphemus tạo ra, đòi hỏi ta phải phân tách rạch ròi bốn chiếc đồng hồ vận hành độc lập: ngày tự quay, chu kỳ quỹ đạo quanh hành tinh mẹ, năm thiên văn quanh ngôi sao chủ và các mùa biến đổi. Vận dụng cơ học quỹ đạo chính xác, chương xây dựng một bộ lịch hành tinh hoàn chỉnh thông qua các hiện tượng tự quay đồng bộ, khóa thủy triều, bình động (libration) và chu kỳ giao hội. Những tính toán định lượng sẽ chứng minh vì sao việc bị khóa thủy triều với hành tinh mẹ không hề biến một nửa thế giới thành màn đêm vĩnh cửu, mà vẫn duy trì chu kỳ ngày đêm luân phiên đối với ngôi sao chiếu sáng.",
          en: "Pandora's sky is dominated by frequent planetary eclipses cast by the massive silhouette of Polyphemus, requiring us to isolate four independent temporal clocks: the moon's rotational day, its orbital period around Polyphemus, the stellar year around the host star, and seasonal shifts. Applying precise orbital mechanics, this chapter constructs a comprehensive planetary calendar through synchronous rotation, tidal locking, libration, and synodic periods. Quantitative models demonstrate why tidal locking to a gas giant does not leave half the moon in permanent darkness, preserving regular solar day-night cycles relative to the primary star.",
        },
      },
      {
        slug: "whats-in-the-air",
        title: {
          vi: "Hít một hơi là chết",
          en: "What’s Really in the Air?",
        },
        payload: {
          vi: "Bầu khí quyển giàu nitơ và ngộ độc CO₂ kịch phát → Sinh lý ngạt khí (hypoxia vs hypercapnia) và quang phổ dấu ấn sinh học (biosignatures).",
          en: "Nitrogen-rich air and acute CO₂ poisoning → Hypoxia vs hypercapnia physiology and atmospheric biosignature spectroscopy.",
        },
        detailedPayload: {
          vi: "Bầu khí quyển của Pandora giàu nitrogen nhưng kịch độc đối với con người chủ yếu do nồng độ carbon dioxide vượt ngưỡng nguy hại, khiến bất kỳ ai tháo mặt nạ lọc khí đều nhanh chóng mất ý thức trong vòng 20 giây và tử vong. Phân tích sinh lý học hô hấp giúp tách biệt rõ ràng giữa thiếu oxy mô (hypoxia) và nhiễm toan khí CO₂ kịch phát (hypercapnia), chứng minh rằng tỷ lệ phần trăm O₂ là vô nghĩa nếu chưa xác định tổng áp suất khí quyển và áp suất riêng phần của từng chất khí. Nhìn rộng ra vũ trụ, đây là bài học về quang phổ dấu ấn sinh học (biosignature spectroscopy) — cách NASA truy tìm sự mất cân bằng hóa học giữa O₂, CH₄, CO₂ để phát hiện sự sống ngoài hành tinh và phương pháp sàng lọc các kết quả dương tính giả.",
          en: "Pandora's atmosphere is rich in nitrogen yet immediately fatal to humans due to excessive carbon dioxide levels, causing unmasked personnel to lose consciousness within twenty seconds. Respiratory physiology decouples hypoxia from acute hypercapnia, demonstrating that oxygen percentages are meaningless without knowing total barometric pressure and individual gas partial pressures. Expanding to astrobiology, this frames atmospheric biosignature spectroscopy — the techniques NASA uses to detect chemical disequilibrium among O₂, CH₄, and CO₂ as indicators of alien life while filtering out abiotic false positives.",
        },
      },
      {
        slug: "floating-mountains-and-the-superconductor",
        title: {
          vi: "Một thế giới bị từ trường bẻ cong",
          en: "Floating Mountains, Unobtanium and the Flux Devil",
        },
        payload: {
          vi: "Dãy Hallelujah, quặng unobtanium và vùng xoáy từ Flux Devil → Vật lý siêu dẫn (cặp Cooper, hiệu ứng Meissner) và lực nâng nghịch từ.",
          en: "Hallelujah Mountains, unobtanium, and the Flux Devil → Superconductivity (Cooper pairs, Meissner effect, flux pinning) and diamagnetic levitation.",
        },
        detailedPayload: {
          vi: "Dãy núi bay Hallelujah lơ lửng giữa tầng không nhờ các mỏ unobtanium — một chất siêu dẫn gắn liền với các nồng độ từ thông khổng lồ, mà đỉnh điểm là hiện tượng Flux Devil tại Cove of the Ancestors nơi cột xoáy nước và plasma nghịch từ bốc cao hơn 3.000 feet, giật tung kim loại khỏi người mang. Khám phá này mở ra bức tranh vật lý lượng tử kỳ vĩ về các cặp Cooper, nhiệt độ tới hạn, hiệu ứng Meissner, hiện tượng ghim từ thông (flux pinning) và áp suất từ trường. Bằng cách tính toán định lượng gradient từ trường cần thiết để nâng bổng một cột nước lỏng rồi đối chiếu với năng lượng khổng lồ để treo một ngọn núi đá hàng triệu tấn, chương làm rõ khoảng cách thực tế giữa siêu dẫn trong phòng thí nghiệm và quy mô địa chất của Pandora.",
          en: "The floating Hallelujah Mountains levitate above massive deposits of unobtanium, a superconductor embedded in planetary magnetic flux concentrations, culminating in the Flux Devil at the Cove of the Ancestors where diamagnetic water and plasma twist over 3,000 feet into the air, stripping metallic gear away. This phenomenon unlocks the quantum physics of Cooper pairing, critical temperatures, the Meissner effect, flux pinning, and magnetic pressure. By calculating the magnetic field gradients required to lift liquid water and contrasting them with the forces needed to suspend gigaton mountain landforms, the chapter bridges tabletop superconductivity and planetary-scale geophysics.",
        },
      },
      {
        slug: "continents-oceans-climate",
        title: {
          vi: "Lục địa, đại dương và khí hậu",
          en: "Continents, Oceans and Climate",
        },
        payload: {
          vi: "Địa lý bề mặt đa dạng và các tuyến đường bay của tộc Wind Traders → Hoàn lưu Hadley, nhiệt dung đại dương và mô hình khí hậu hành tinh.",
          en: "Diverse geography and Wind Trader aerial migration corridors → Hadley cells, ocean thermal inertia, and planetary climate circulation.",
        },
        detailedPayload: {
          vi: "Pandora không chỉ có rừng rậm nhiệt đới mà sở hữu những đại dương bao la, các lục địa hoang sơ chưa khám phá, những đồng bằng bán khô hạn và vô vàn quần xã sinh vật phân hóa phức tạp. Chương xây dựng một mô hình khí hậu hoàn chỉnh dựa trên bức xạ sao, tốc độ tự quay, khối lượng khí quyển, nhiệt dung của các đại dương, các ô hoàn lưu Hadley và sự xáo trộn thủy triều dữ dội. Hoàn lưu khí quyển và các đai gió thịnh hành giải thích tại sao các dải rừng và biển lại hình thành ở đúng tọa độ đó, đồng thời cung cấp cơ sở vật lý cho các hành lang bay di cư định kỳ vòng quanh hành tinh của tộc du mục Tlalim.",
          en: "Pandora is not a monolithic rainforest; it hosts expansive oceans, uncharted continents, arid plains, and diverse biomes. This chapter builds a comprehensive planetary climate model incorporating stellar insolation, rotation rates, atmospheric mass, oceanic heat capacity, Hadley circulation cells, and intense tidal mixing. Atmospheric dynamics explain why specific biomes emerge at distinct latitudes, establishing the physical foundation for the annual planetary migration corridors navigated by the Tlalim Wind Traders.",
        },
      },
      {
        slug: "pandoras-deep-time",
        title: {
          vi: "Dòng thời gian sâu thẳm của Pandora",
          en: "Pandora’s Deep Time",
        },
        payload: {
          vi: "Khôi phục biên niên sử tỷ năm từ địa tầng và các tỉnh núi lửa → Địa thời học, định tuổi đồng vị phóng xạ và đồng hồ phân tử.",
          en: "Reconstructing a billion-year planetary chronology from strata and volcanic provinces → Geochronology, radiometric dating, and molecular clocks.",
        },
        detailedPayload: {
          vi: "Đối mặt với một hành tinh có lịch sử địa chất và sinh học phong phú nhưng thiếu vắng một niên biểu chính thức, chúng ta phải tái dựng lịch sử đã mất từ địa hình, hóa thạch giả định, quan hệ phát sinh loài và các tỉnh đá núi lửa cổ đại. Các công cụ địa thời học như định tuổi bằng đồng vị phóng xạ, địa tầng học, mật độ hố va chạm thiên thạch, đồng hồ phân tử và phân nhánh tiến hóa đóng vai trò là những chiếc đồng hồ đo đạc độc lập. Chương minh họa sinh động cách khoa học hành tinh xử lý mâu thuẫn khi tuổi địa chất của các tầng đá va chạm với thời điểm phân kỳ của các nhánh sinh học phân tử.",
          en: "Confronting a planet rich in geology and biology yet lacking an official chronological record, we must reconstruct its deep history from topography, hypothetical fossils, phylogenetic trees, and ancient volcanic provinces. Geochronological tools — radiometric isotope dating, stratigraphy, impact crater counts, molecular clocks, and phylogenetic divergence — operate as independent investigative timepieces. The chapter illustrates how planetary science resolves tension when geological strata ages conflict with molecular phylogenetic divergence estimates.",
        },
      },
      {
        slug: "what-keeps-pandora-volcanically-alive",
        title: {
          vi: "Cỗ máy núi lửa của Pandora",
          en: "What Keeps Pandora Volcanically Alive?",
        },
        payload: {
          vi: "Hoạt động hỏa sơn dữ dội và thảm họa diệt vong của tộc Mangkwan → Tiêu tán thủy triều (tidal dissipation), nhiệt nguyên thủy và bài học từ vệ tinh Io.",
          en: "Violent volcanism and the catastrophe of the Mangkwan clan → Tidal dissipation heating, radiogenic energy, and the Io analogue.",
        },
        detailedPayload: {
          vi: "Tương tác hấp dẫn và từ trường mãnh liệt với Polyphemus nuôi dưỡng các cơn bão từ và hoạt động núi lửa dữ dội, mà biến cố lịch sử đau thương nhất chính là vụ phun trào hủy diệt hoàn toàn quê hương và Cây Mẹ Hometree của tộc Tro tàn Mangkwan. Bằng tư duy vật lý địa cầu, chương phản biện lại giả định cho rằng từ trường trực tiếp sinh ra magma, mà chứng minh nguồn nhiệt thực sự duy trì sự sống địa chất của Pandora đến từ sự phân rã phóng xạ, nhiệt nguyên thủy và đặc biệt là năng lượng tiêu tán thủy triều (tidal dissipation). Lấy mặt trăng Io của Sao Mộc làm mô hình đối chiếu, chúng ta tính toán độ lệch tâm quỹ đạo và hệ số tiêu tán cơ học cần thiết để duy trì hoạt động hỏa sơn liên tục qua hàng trăm triệu năm.",
          en: "Intense gravitational and magnetic interactions with Polyphemus fuel violent volcanic activity and magnetic storms, culminating in the historic eruption that obliterated the ancestral Hometree of the Mangkwan clan. Planetary geophysics provides constructive critique: magnetic fields cannot directly generate magma without a mechanical energy conversion pathway; Pandora's internal heat is sustained by radiogenic decay, primordial thermal energy, and tidal dissipation from gravitational flexing. Using Jupiter's moon Io as an analogue, the chapter calculates the orbital eccentricity and tidal dissipation factors required to sustain continuous volcanism across geological epochs.",
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
        title: {
          vi: "Sáu chi và bài toán sơ đồ cơ thể",
          en: "Six Limbs and the Bilateral Lattice",
        },
        payload: {
          vi: "Sơ đồ cơ thể sáu chi ở động vật đối lập với hình thái 4 chi của người Na'vi → Sinh học phát triển, gene Hox và mạng điều hòa gene (GRNs).",
          en: "Hexapodal vertebrate body plans vs 4-limbed Na'vi humanoids → Developmental biology, Hox gene clusters, and gene regulatory networks.",
        },
        detailedPayload: {
          vi: "Hầu hết các loài động vật lớn trên Pandora đều sở hữu sơ đồ cấu tạo cơ thể sáu chi, đối lập sâu sắc với dáng đứng bốn chi mang nét humanoid của người Na'vi, đặt ra câu hỏi hóc búa về vị trí của Na'vi trên cây phả hệ sinh giới. Sinh học phát triển và các cụm gene Hox chứng minh rằng sơ đồ cơ thể đối xứng hai bên không phải là bộ ghép hình dễ dàng thêm bớt chi, mà đòi hỏi sự tái cấu trúc sâu sắc của toàn bộ mạng lưới điều hòa gene (GRNs). Sự phân kỳ kỳ lạ giữa Na'vi và hệ động vật bản địa trở thành bài học mẫu mực về những ràng buộc phát triển phôi sinh học, sự nhân đôi trường chi và lý do vì sao sự tương đồng hình thái bên ngoài không đảm bảo mối quan hệ họ hàng tiến hóa gần gũi.",
          en: "Most large Pandoran vertebrates possess a hexapodal (six-limbed) body plan, contrasting sharply with the four-limbed humanoid anatomy of the Na'vi and raising profound phylogenetic questions about where the Na'vi fit in the evolutionary tree. Developmental biology and Hox gene clusters demonstrate that Bilaterian body plans are not modular blocks where limb pairs can be arbitrarily added or removed, but deeply conserved gene regulatory networks (GRNs). The morphological divergence between Na'vi and indigenous fauna illustrates embryological constraints, limb-field duplication, and why superficial anatomical similarities do not imply close phylogenetic kinship.",
        },
      },
      {
        slug: "convergent-but-not-quite",
        title: {
          vi: "Tiến hóa hội tụ, nhưng không hẳn",
          en: "Convergent, but Not Quite",
        },
        payload: {
          vi: "Hình thái quen thuộc của pa'li, ikran và tulkun → Phân biệt cơ quan tương đồng (homology), tương tự (analogy) và giới hạn của sự hội tụ.",
          en: "Familiar shapes in pa'li, ikran, and tulkun → Homology, analogy, convergent evolution, and architectural evolutionary limits.",
        },
        detailedPayload: {
          vi: "Pa'li trông giống ngựa, ikran mang dáng dấp thằn lằn bay, tulkun gợi nhắc cá voi và thanator gợi bóng dáng thú săn mồi họ mèo — nhưng đó thuần túy là sự tương đồng về mặt hình học sinh thái chứ không chứng minh chúng có quan hệ họ hàng với Trái Đất. Chương phân định rạch ròi giữa cơ quan tương đồng (homology), cơ quan tương tự (analogy) và tiến hóa hội tụ dưới các áp lực chọn lọc vật lý tương đương như thủy động lực học hay khí động học. Bằng cách chỉ ra những điểm dị biệt cốt tử trên Pandora như cấu trúc sáu chi, cổng kết nối thần kinh kuru và các khe thở dọc thân, người đọc sẽ nhận ra ranh giới rõ ràng nơi tiến hóa hội tụ phải dừng bước trước các ràng buộc kiến trúc cổ xưa.",
          en: "Pa'li evokes horses, ikran mirrors pterosaurs, tulkun resembles cetaceans, and thanators mirror big cats — yet these reflect shared ecological geometry rather than phylogenetic lineage. This chapter rigorously separates homology, analogy, and convergent evolution driven by shared hydrodynamic and aerodynamic constraints. By highlighting fundamental Pandoran anomalies — hexapody, neural kuru interfaces, and thoracic breathing opercula — it charts the boundary where convergent adaptation meets entrenched architectural constraints.",
        },
      },
      {
        slug: "the-breathing-fans",
        title: {
          vi: "Những chiếc quạt thở",
          en: "The Breathing Fans",
        },
        payload: {
          vi: "Hệ thống khe thở (operculum) dọc thân ở động vật chạy và bay → Sinh lý hô hấp so sánh, trao đổi dòng ngược và định luật Fick.",
          en: "Lateral body opercula in terrestrial and flying fauna → Comparative respiratory physiology, countercurrent exchange, and Fick's law.",
        },
        detailedPayload: {
          vi: "Nhiều loài động vật trên Pandora sở hữu các khe thở hoặc van hô hấp (operculum) bố trí dọc hai bên thân thay vì hít thở qua đường mũi miệng như thú có vú, đại diện cho một kiến trúc trao đổi khí hoàn toàn mới lạ. So sánh mang cá, phổi thú, hệ thống khí quản côn trùng, túi khí chim và cơ chế trao đổi dòng ngược (countercurrent exchange), chương xây dựng ba mô hình giả thuyết cho hệ hô hấp ngoại hành tinh. Dựa trên định luật khuếch tán Fick liên kết diện tích bề mặt, khoảng cách khuếch tán và gradient áp suất riêng phần với nhu cầu trao đổi chất, chúng ta kiểm chứng khả năng cung cấp oxy của các van thở này cho những siêu dã thú đang chạy nước rút hoặc bay lượn ở vận tốc cao.",
          en: "Many Pandoran organisms breathe through lateral thoracic opercula rather than craniofacial airways, exhibiting an alternative respiratory architecture. Comparing aquatic gills, mammalian alveoli, insect tracheae, avian air sacs, and countercurrent exchange mechanisms, this chapter models three hypothetical respiratory blueprints. Applying Fick's law of diffusion to link surface area, diffusion distance, and partial pressure gradients with metabolic demand, it calculates whether thoracic breathing fans can supply sufficient oxygen to sprinting megafauna and high-speed aerial predators.",
        },
      },
      {
        slug: "when-glow-is-the-norm",
        title: {
          vi: "Khi sự rực rỡ trong đêm là chuẩn mực",
          en: "When Glow Is the Norm",
        },
        payload: {
          vi: "Hiện tượng phát quang sinh học ngập tràn toàn sinh quyển → Hóa sinh luciferin–luciferase và các áp lực chọn lọc tín hiệu thị giác.",
          en: "Ubiquitous biosphere-wide bioluminescence → Luciferin–luciferase biochemistry and selective pressures for multi-functional visual signaling.",
        },
        detailedPayload: {
          vi: "Phát quang sinh học là một hiện tượng bao trùm toàn bộ sinh quyển Pandora, bùng nổ rực rỡ trong bóng đêm và suốt những kỳ nhật thực kéo dài do Polyphemus che khuất ngôi sao chủ. Khảo sát các con đường phản ứng enzyme luciferin–luciferase trên Trái Đất và các cơ chế phát quang tiềm năng khác, chúng ta tìm hiểu lý do tự nhiên lại ưu ái tín hiệu ánh sáng ở quy mô toàn cầu: ngụy trang ngược sáng (counter-illumination), mồi nhử săn mồi, thu hút bạn tình, cảnh báo độc tố (aposematism) hay nhận diện bầy đàn. Sự thật là trên Trái Đất, phát quang sinh học đã tiến hóa độc lập ở hàng chục dòng dõi sinh vật với vô vàn chức năng khác nhau, chứng minh rằng sự rực rỡ của Pandora được định hình bởi nhiều áp lực chọn lọc đan xen chứ không phục vụ một mục đích duy nhất.",
          en: "Bioluminescence is an omnipresent feature of the Pandoran biosphere, illuminating nights and planetary eclipses caused by Polyphemus. Examining terrestrial luciferin–luciferase enzymatic pathways and alternative bio-emitter chemistry, we investigate why global selection favored visual light emission: counter-illumination camouflage, predatory lures, courtship displays, aposematic warning coloration, and pack communication. Because bioluminescence evolved independently dozens of times on Earth for diverse behavioral functions, Pandora's luminous ecology is driven by multiple overlapping evolutionary pressures rather than a single master function.",
        },
      },
      {
        slug: "pandoran-tree-of-life",
        title: {
          vi: "Phả hệ sự sống Pandora",
          en: "Building the Pandoran Tree of Life",
        },
        payload: {
          vi: "Xây dựng ma trận tính trạng giải phẫu cho sinh giới alien → Nguyên lý tối giản (parsimony), phát sinh loài Bayes và biểu đồ cladogram.",
          en: "Building an anatomical character matrix for alien biodiversity → Parsimony principles, Bayesian phylogenetics, and cladistic mapping.",
        },
        detailedPayload: {
          vi: "Bỏ qua cách phân loại dựa trên cảm quan thị giác bề ngoài, chương thiết lập một ma trận tính trạng giải phẫu thực thụ — gồm số lượng chi, cấu tạo mắt, hệ van thở, cấu trúc miệng, sợi kuru và phương thức sinh sản — để phác dựng biểu đồ phân nhánh phát sinh loài (cladogram) cho toàn bộ sinh vật Pandora. Người đọc sẽ được tiếp cận các phương pháp hệ thống học hiện đại như nguyên lý tối giản (parsimony), tính trạng dẫn xuất chung (synapomorphy), tính trạng hội tụ (homoplasy) và xác suất Bayes. Một bộ dữ liệu thử nghiệm thực hành sẽ minh chứng rõ nét việc một tính trạng hội tụ đánh lừa có thể làm sai lệch toàn bộ cây phân loại sinh học như thế nào nếu ta quá tin vào những nét tương đồng bề nổi.",
          en: "Rejecting superficial visual classifications, this chapter constructs a formal anatomical character matrix — incorporating limb counts, ocular morphology, breathing opercula, kuru appendages, jaw mechanics, and reproductive strategies — to draft a hypothetical cladogram of Pandoran life. It introduces modern phylogenetic methods including maximum parsimony, synapomorphic traits, convergent homoplasies, and Bayesian inference. An interactive test dataset demonstrates how a single unflagged convergent trait can distort an entire evolutionary tree if taxonomists rely naively on outward appearances.",
        },
      },
      {
        slug: "direhorse-and-banshee-up-close",
        title: {
          vi: "Mổ xẻ pa’li và ikran",
          en: "Direhorse and Banshee Up Close",
        },
        payload: {
          vi: "Giải phẫu so sánh giữa pa'li chạy cạn và ikran bay lượn → Tỉ lệ dị sinh trưởng (allometry), đàn hồi gân cơ và công suất cơ bắp.",
          en: "Comparative biomechanics of cursorial pa'li and aerial ikran → Allometric scaling, tendon elastic energy, and muscle power density.",
        },
        detailedPayload: {
          vi: "Chương thiết lập một phòng thí nghiệm giải phẫu so sánh giữa pa'li và ikran: mổ xẻ cấu trúc khung xương chịu lực, sự phối hợp vận động sáu chi, điểm bám cơ bắp, hệ đốt sống cổ và cơ chế tương tác sinh học giữa sợi queue với kỵ sĩ Na'vi. Hai sinh vật đại diện cho hai bài toán kỹ thuật sinh học đối lập: một bên tối ưu hóa cho phi nước đại trên mặt đất, một bên tối ưu hóa cho lực nâng và sự cơ động trên không trung. Áp dụng lý thuyết dị sinh trưởng (allometry), dịch chuyển trọng tâm, độ đàn hồi gân cơ, mật độ công suất cơ bắp và định luật bình phương-lập phương, chúng ta kiểm định tính khả thi của thiết kế sinh học và đo độ nhạy của mô hình khi ước tính khối lượng cơ thể dao động 20–30%.",
          en: "Operating as a comparative anatomy lab, this chapter dissects the direhorse and mountain banshee: load-bearing skeletal geometry, hexapodal locomotion coordination, muscle attachment topology, cervical articulation, and neural queue coupling with Na'vi riders. The two creatures embody opposite biomechanical optimizations: cursorial galloping versus aerial agility. Applying allometric scaling, center-of-mass dynamics, tendon elastic energy storage, specific muscle power density, and the square-cube law, it evaluates anatomical viability and tests model sensitivity against mass estimate variations of 20–30%.",
        },
      },
      {
        slug: "the-hunters-and-the-hunted",
        title: {
          vi: "Kẻ đi săn và kẻ bị săn",
          en: "Hunters and the Hunted",
        },
        payload: {
          vi: "Chiến thuật săn mồi của Thanator và phòng thủ bầy đàn → Mô hình Lotka–Volterra mở rộng, đáp ứng chức năng Holling và tầng bậc dinh dưỡng.",
          en: "Thanator sensory predation and collective prey defenses → Extended Lotka–Volterra models, Holling functional responses, and trophic cascades.",
        },
        detailedPayload: {
          vi: "Mối quan hệ giữa kẻ đi săn và con mồi trên Pandora không chỉ xoay quanh một quái thú đơn độc mà thể hiện qua chiến thuật săn bầy của Viperwolf, cơ chế phòng thủ bầy đàn của các loài ăn cỏ khổng lồ và dã thú đỉnh bảng Thanator với các giác quan định vị con mồi cực kỳ nhạy bén. Khởi đầu từ hệ phương trình vi phân Lotka–Volterra kinh điển, chương mở rộng sang các dạng đáp ứng chức năng Holling, sức chứa của môi trường (carrying capacity), các vùng ẩn náu không gian và hiệu ứng thác dinh dưỡng (trophic cascades). Những yếu tố phi tuyến tính này giải thích vì sao các quần thể sinh vật thực tế không bao giờ dao động tuần hoàn hình sin đơn giản như trong sách giáo khoa, mà luôn trải qua những biến động phức tạp và bất ngờ.",
          en: "Predator–prey dynamics on Pandora encompass pack hunting strategies in viperwolves, herd defense in megaherbivores, and apex sensory predation in the Thanator. Beginning with classical Lotka–Volterra differential equations, the analysis incorporates Holling functional responses, environmental carrying capacities, spatial refugia, and trophic cascades. These nonlinear dynamics explain why real-world ecological populations rarely follow neat textbook sine waves, exhibiting complex, chaotic population fluctuations instead.",
        },
      },
      {
        slug: "what-is-pandoran-life-made-of",
        title: {
          vi: "Sự sống Pandora được nhào nặn từ đâu?",
          en: "What Is Pandoran Life Made Of?",
        },
        payload: {
          vi: "Nghịch lý tương thích sinh hóa giữa người và Pandora → Sinh học vũ trụ (astrobiology), tính bất đối xứng phân tử (chirality) và xenobiology.",
          en: "The deep paradox of Human–Pandoran biochemical interoperability → Astrobiology, molecular chirality, and alternative xenobiology.",
        },
        detailedPayload: {
          vi: "Thế giới Pandora đặt ra một nghịch lý sinh hóa kỳ lạ: con người có thể hấp thụ một số dinh dưỡng bản địa, cơ thể lai Avatar phát triển hoàn hảo, và Spider thậm chí thiết lập mối quan hệ cộng sinh nấm rễ nội bào (endosymbiosis) sâu sắc. Khám phá này gợi mở mức độ tương thích phân tử đáng kinh ngạc giữa hai nguồn gốc sinh quyển khác nhau. Khảo sát hóa học hữu cơ gốc carbon, nước làm dung môi phân cực, tính bất đối xứng phân tử (chirality), sự tương thích của các amino acid và các biến thể axit nucleic nhân tạo (XNA), chương chỉ ra rằng sinh quyển càng có nguồn gốc độc lập ngoài hành tinh thì sự tương thích sinh hóa với con người càng khó giải thích nếu không có công nghệ Avatar hoặc sự hội tụ sinh hóa phân tử làm cầu nối.",
          en: "Pandora introduces a fascinating biochemical paradox: humans consume local nutrients, chimeric Avatar bodies develop seamlessly, and Spider establishes deep intracellular mycelial endosymbiosis. This implies astonishing molecular interoperability between distinct biospheres. Surveying carbon-based organic chemistry, water as a polar solvent, molecular chirality, amino acid compatibility, and alternative xenobiological nucleic acid backbones (XNAs), the chapter shows that the more alien a world's genesis, the harder cross-species biochemical compatibility becomes without advanced Avatar genetic engineering or extreme molecular convergence.",
        },
      },
      {
        slug: "the-pandoran-umwelt",
        title: {
          vi: "Umwelt — Lăng kính tri giác trên Pandora",
          en: "The Pandoran Umwelt",
        },
        payload: {
          vi: "Các giác quan cảm nhận từ trường và sóng sinh học → Sinh thái học giác quan, khái niệm thế giới tri giác (Umwelt) và thông tin Shannon.",
          en: "Magnetoreception and bio-frequency perception → Sensory ecology, Jakob von Uexküll's Umwelt concept, and Shannon environmental information.",
        },
        detailedPayload: {
          vi: "Môi trường Pandora ngập tràn những luồng thông tin vô hình đối với con người: dao động từ trường cực mạnh, ánh sáng phát quang phân cực, vi rung động địa chấn và các tín hiệu giao tiếp thần kinh trực tiếp, khiến một cá thể Thanator, Ikran hay Na'vi sống trong những thế giới tri giác (Umwelt) hoàn toàn dị biệt. Áp dụng lý thuyết thế giới tri giác của Jakob von Uexküll, chương phân tích khả năng thụ cảm từ trường (magnetoreception), thị giác ánh sáng phân cực, điện thụ cảm và cơ thụ cảm. Quan trọng hơn cả, chương chứng minh một giác quan chỉ có thể tiến hóa và tồn tại nếu môi trường chứa đựng lượng thông tin Shannon ổn định mà hệ thần kinh có thể khai thác, tạo tiền đề lý thuyết thông tin cho mạng lưới Eywa.",
          en: "Pandora's environment is saturated with signals invisible to unaugmented humans: intense magnetic flux fluctuations, polarized bioluminescent wavelengths, substrate micro-vibrations, and direct neural communication channels, meaning a Thanator, an Ikran, and a Na'vi inhabit entirely distinct sensory Umwelten. Applying Jakob von Uexküll's Umwelt framework, this chapter analyzes magnetoreception, polarization vision, electroreception, and mechanosensation. Crucially, it demonstrates that sensory modalities only evolve if the physical environment provides stable Shannon information that nervous systems can exploit, laying the theoretical foundation for understanding Eywa.",
        },
      },
    ],
  },
  {
    id: "eywa",
    label: {
      vi: "Phần III — Mạng lưới Sự sống Eywa",
      en: "Part III — The Living Network",
    },
    chapters: [
      {
        slug: "what-eywa-is",
        title: { vi: "Bản chất thực sự của Eywa", en: "What Eywa Is" },
        payload: {
          vi: "Eywa từ tín ngưỡng bản địa đến mạng lưới sinh học toàn cầu → Nhận thức phân tán (distributed cognition), trí tuệ bầy đàn và siêu tâm trí.",
          en: "Eywa from sacred deity to planetary biological network → Distributed cognition, swarm computation, and the boundaries of consciousness.",
        },
        detailedPayload: {
          vi: "Sau ba phần phim, Eywa hiện lên đa tầng: vừa là đấng thiêng liêng trong đức tin Na'vi, vừa là một mạng lưới sinh học toàn cầu, một kho lưu trữ ký ức di truyền và — qua năng lực đặc biệt của Kiri — một thực thể có khả năng tác động trực tiếp vào sinh quyển. Cuốn sách từ chối lối ví von đơn giản rằng Eywa là một cỗ máy AI bằng thực vật, mà đặt ra các tiêu chuẩn nhận thức học khắt khe: để một mạng lưới được định nghĩa là tâm trí (mind), ta cần quan sát thấy cơ chế mã hóa trí nhớ, khả năng tích hợp thông tin, sự học tập thích ứng và hành vi hướng đích ở quy mô nào? Chương làm rõ ranh giới then chốt giữa một mạng lưới chỉ truyền dẫn tín hiệu thụ động và một siêu cấu trúc có nhận thức đích thực.",
          en: "Across three films, Eywa presents multiple layers: an indigenous spiritual deity, a planetary biological network, an ancestral memory repository, and — through Kiri's experiences — an active entity capable of bio-actuation. Rejecting simplistic analogies of Eywa as a botanical AI, the chapter sets rigorous cognitive benchmarks: to classify a network as a genuine mind, what empirical evidence of memory encoding, information integration, adaptive plasticity, and goal-directed behavior is required? It establishes the essential boundary between a passive signaling network and an active, conscious planetary superorganism.",
        },
      },
      {
        slug: "the-wood-wide-web",
        title: {
          vi: "Wood-Wide Web: mạng thật, ẩn dụ hay cả hai?",
          en: "The Wood-Wide Web Revisited",
        },
        payload: {
          vi: "Mạng lưới nấm rễ truyền tín hiệu dinh dưỡng và miễn dịch → Phân tích thực nghiệm mạng nấm rễ chung (CMN) và phản biện khoa học hiện đại.",
          en: "Mycelial root networking in forest ecosystems → Empirical scrutiny of Common Mycorrhizal Networks (CMNs) and modern scientific debates.",
        },
        detailedPayload: {
          vi: "Pandorapedia xác nhận hệ sợi nấm mycelium liên kết rễ cây trên Pandora mang các tín hiệu hóa học điều hòa chia sẻ dinh dưỡng, phản ứng miễn dịch, sinh trưởng và sinh sản, biến khái niệm mạng lưới rừng rậm thành một thực tế sinh học vững chắc. Tuy nhiên đối với Trái Đất, chương phản biện lại sự lãng mạn hóa truyền thông cho rằng cây cối sở hữu một mạng internet vị tha. Dẫn chứng các nghiên cứu tổng hợp năm 2023 trên Nature Ecology & Evolution, chương chỉ ra rằng các tuyên bố về mạng nấm rễ chung (common mycorrhizal networks) — đặc biệt là việc cây mẹ ưu tiên chuyển tài nguyên nuôi cây con — phần lớn đã bị thổi phồng hoặc thiếu dữ liệu thực địa nghiêm ngặt, mang đến bài học đắt giá về ranh giới giữa ẩn dụ và bằng chứng khoa học.",
          en: "Pandorapedia explicitly confirms that mycelial networks connecting Pandoran root systems transmit chemical signals regulating nutrient sharing, immune responses, growth, and reproduction, making the forest network firm biological canon. On Earth, however, this chapter critically reassesses the popular metaphor of trees sharing an altruistic internet. Citing landmark 2023 meta-analyses in Nature Ecology & Evolution, it demonstrates that claims regarding common mycorrhizal networks — particularly Mother Trees intentionally feeding kin — have been overstated in popular media, offering an instructive case study on how seductive metaphors can outpace empirical data.",
        },
      },
      {
        slug: "the-bandwidth-of-a-planet",
        title: {
          vi: "Băng thông của cả một hành tinh",
          en: "The Bandwidth of a Planet",
        },
        payload: {
          vi: "Liên kết Tsaheylu và tải dữ liệu ý thức qua Cây Linh Hồn → Lý thuyết thông tin Shannon, độ trễ mạng và giới hạn năng lượng trên bit.",
          en: "Tsaheylu data transfers and planetary memory syncing → Shannon channel capacity, network latency, and thermodynamic bit costs.",
        },
        detailedPayload: {
          vi: "Liên kết Tsaheylu cho phép truyền dẫn tín hiệu hai chiều tức thời giữa Na'vi và sinh vật, trong khi các thánh địa Cây Linh Hồn cho phép truy cập ký ức ở quy mô toàn cầu. Thay vì giả định việc tải dữ liệu tâm trí diễn ra như phép màu, chương đặt câu hỏi: thông tin gì thực sự được trao đổi trong từng liên kết? Vận dụng lý thuyết thông tin Shannon, dung lượng kênh, tỉ số tín hiệu trên nhiễu (SNR), độ trễ truyền dẫn, nén dữ liệu và chi phí năng lượng nhiệt động học trên mỗi bit, mô hình định lượng dựa trên tần số xung nơ-ron sinh học sẽ chỉ ra sự chênh lệch hàng triệu lần giữa việc truyền luồng cảm giác thời gian thực, tra cứu chỉ mục ký ức hay tải lên toàn bộ mạng kết nối nơ-ron (connectome).",
          en: "Tsaheylu facilitates real-time bidirectional neuro-transmission between Na'vi and fauna, while sacred sites like the Tree of Souls enable planetary-scale memory retrieval. Rather than assuming instantaneous mystical data transfer, this chapter calculates what information actually flows across these bonds. Applying Shannon channel capacity, signal-to-noise ratios, transmission latency, data compression, and thermodynamic energy costs per bit, mathematical models based on neural firing rates reveal the multi-million-fold bandwidth difference between streaming real-time sensorimotor feeds, querying memory indices, and uploading a full biological connectome.",
        },
      },
      {
        slug: "why-burning-eywa-doesnt-kill-it",
        title: {
          vi: "Vì sao thiêu rụi Eywa không giết được nó",
          en: "Why Burning Eywa Doesn’t Kill It",
        },
        payload: {
          vi: "Sức chống chịu của mạng lưới trước các cuộc tấn công hủy diệt Hometree → Lý thuyết thẩm thấu (percolation theory), tính liên thông và cấu trúc phi tỷ lệ.",
          en: "Resilience against localized Hometree destruction → Percolation theory, scale-free network topology, and targeted hub vulnerability.",
        },
        detailedPayload: {
          vi: "Các đòn không kích tàn bạo của RDA có thể san phẳng Cây Mẹ Hometree và nhiều thánh địa nhưng không thể tiêu diệt được Eywa, chứng minh rằng mạng lưới sinh học phân tán toàn cầu này sở hữu cấu trúc phi tập trung không có điểm yếu chí tử duy nhất. Vận dụng Lý thuyết Thẩm thấu (Percolation Theory), tính liên thông đồ thị, cấu trúc mạng phi tỷ lệ (scale-free networks) và độ dư thừa sinh học, chương so sánh khả năng chịu lỗi ngẫu nhiên và mức độ tổn thương trước các cuộc tấn công nhắm trúng nút trung tâm (hubs). Người đọc sẽ thấy một mạng lưới có thể chịu mất hàng ngàn mắt xích phân tán nhưng sẽ sụp đổ dây chuyền đột ngột nếu các hub trọng yếu bị phá hủy vượt qua ngưỡng thẩm thấu tới hạn.",
          en: "Brutal RDA military strikes can topple massive Hometrees and local sacred groves without destroying Eywa, demonstrating that this planetary biological network operates as a decentralized mesh devoid of single points of failure. Utilizing Percolation Theory, graph connectivity, scale-free network topology, and biological redundancy, the chapter contrasts resilience under random node loss versus vulnerability to targeted hub destruction. It reveals how a distributed network survives extensive random damage yet suffers catastrophic phase transitions if targeted hub removals cross critical percolation thresholds.",
        },
      },
      {
        slug: "spiders-second-biology",
        title: {
          vi: "Spider và cơ thể thứ hai bên trong cơ thể",
          en: "Spider’s Second Biology",
        },
        payload: {
          vi: "Endosymbiosis giữa nấm mycelium và cơ thể người của Spider → Thích nghi hô hấp mô, tạo hình hình thái (morphogenesis) và tích hợp thần kinh.",
          en: "Mycelial endosymbiosis in Spider's human physiology → Tissue respiratory remodeling, developmental morphogenesis, and neural queue emergence.",
        },
        detailedPayload: {
          vi: "Sự biến đổi sinh học của Spider là một trong những bước ngoặt canon chấn động nhất: một loài nấm cộng sinh nội bào (mycelial endosymbiont) định cư trong cơ thể cậu thiếu niên loài người, tái cấu trúc tế bào giúp cậu hít thở trực tiếp khí quyển Pandora và kích thích mọc một sợi ăng-ten thần kinh kuru, mở ra triển vọng cho RDA về việc thích nghi vĩnh viễn con người vào sinh quyển này. Chương mổ xẻ bốn thách thức cơ chế: sự dung nạp miễn dịch, thích nghi hô hấp cấp độ mô, sự tạo hình phát triển hình thái (morphogenesis) và tích hợp thần kinh ngoại biên. Đối chiếu với những bước tiến của sinh học tổng hợp đang tạo ra các tế bào động vật cộng sinh, chúng ta phân định ranh giới giữa chứng minh nguyên lý thực tế và tầm vóc ngoại suy viễn tưởng.",
          en: "Spider's biological transformation represents a major canon milestone: a mycelial endosymbiont colonizes the human teenager, remodeling cellular respiration to allow breathing Pandoran air unassisted and triggering the morphogenesis of a functional neural queue, which the RDA views as a blueprint for permanent human colonization. This chapter dissects four mechanistic hurdles: immune tolerance, tissue-level gas exchange adaptation, developmental morphogenesis, and peripheral neuromuscular integration. Comparing this with synthetic biology efforts to engineer intracellular endosymbionts in mammalian cells, it separates empirical proof-of-principle from speculative extrapolation.",
        },
      },
      {
        slug: "kiri-and-the-writable-biosphere",
        title: {
          vi: "Kiri và một sinh quyển có thể “viết lại” cơ thể",
          en: "Kiri and the Writable Biosphere",
        },
        payload: {
          vi: "Năng lực điều động sinh giới và can thiệp sinh học của Kiri → Điện sinh học phát triển (bioelectricity), tín hiệu hình thái và điều khiển quy mô sinh thái.",
          en: "Kiri's cross-species communion and organism remodeling → Developmental bioelectricity, morphogenetic fields, and ecosystem actuation.",
        },
        detailedPayload: {
          vi: "Năng lực của Kiri vượt xa việc chỉ cảm nhận Eywa thụ động: cô có thể huy động mạng lưới sự sống của Pandora can thiệp vào biến đổi sinh học của Spider và điều khiển phản ứng tập thể của sinh vật trong các trận chiến. Thay vì coi đây là phép thuật huyền bí, chương xây dựng chuỗi cơ chế vật lý tuần tự: truyền tín hiệu hóa sinh, khuôn mẫu điện sinh học phát triển (bioelectric patterning), điều khiển tạo hình mô, đồng bộ hóa thần kinh và chấp hành quy mô hệ sinh thái. Chương giải quyết các câu hỏi kỹ thuật cốt lõi: thông tin hình thái được lưu trữ ở đâu, vật chất và năng lượng để tái tạo mô mới được huy động như thế nào, và tín hiệu sinh học nào đủ sức ra lệnh cho hàng triệu tế bào phối hợp nhịp nhàng.",
          en: "Kiri's abilities transcend passive spiritual communion: she actively mobilizes Pandora's living network to guide Spider's biological transformation and coordinates fauna in large-scale combat. Rather than dismissing this as unexplained magic, the chapter constructs a coherent physical chain of mechanisms: biochemical signaling, developmental bioelectric patterning, morphogenetic field regulation, neural synchronization, and ecosystem-scale actuation. It addresses fundamental bioengineering questions: where morphogenetic information is encoded, how energy and substrates for rapid tissue synthesis are mobilized, and what signals coordinate millions of differentiating cells.",
        },
      },
      {
        slug: "a-real-living-planet",
        title: {
          vi: "Một hành tinh đang thở đúng nghĩa",
          en: "Gaia After Eywa",
        },
        payload: {
          vi: "Pandora như một siêu cơ thể tự điều hòa chủ động → Nhìn lại Giả thuyết Gaia yếu và mạnh, kỹ thuật sinh thái và vòng phản hồi hành tinh.",
          en: "Pandora as an active self-regulating superorganism → Weak vs strong Gaia hypotheses, ecological engineering, and planetary homeostasis.",
        },
        detailedPayload: {
          vi: "Với khả năng cộng sinh nội bào và mạng lưới điều phối chủ động, Pandora vượt xa khỏi cách hiểu kinh điển về Giả thuyết Gaia của Trái Đất. Chương phân biệt rõ ràng giữa Giả thuyết Gaia yếu (các vòng phản hồi sinh địa hóa thụ động tạo nên cân bằng nội môi homeostasis) và Giả thuyết Gaia mạnh mang tính mục đích luận (coi sinh quyển như một thực thể có ý chí và mục tiêu). Vận dụng lý thuyết điều khiển, kỹ thuật sinh thái và khoa học hệ thống Trái Đất, chúng ta đánh giá xem Pandora có thực sự sở hữu đầy đủ hệ thống cảm biến, kênh truyền tin, bộ chấp hành sinh học và các vòng phản hồi tự điều chỉnh để xứng đáng được gọi là một cỗ máy điều hòa quy mô hành tinh hay không.",
          en: "With active mycelial endosymbiosis and biospheric actuation, Pandora transcends classical Earth formulations of the Gaia hypothesis. This chapter distinguishes weak Gaia (passive biogeochemical feedback loops generating homeostasis) from strong, teleological Gaia (the biosphere acting as an intentional, goal-directed superorganism). Applying control theory, ecological engineering, and Earth-system science, it evaluates whether Pandora possesses sufficient biological sensors, communication channels, actuators, and feedback loops to qualify as an active, planetary-scale homeostatic regulator.",
        },
      },
    ],
  },
  {
    id: "fire-ash-wind",
    label: {
      vi: "Phần IV — Lửa, Tro và Gió",
      en: "Part IV — Fire, Ash & Wind",
    },
    chapters: [
      {
        slug: "life-after-the-volcano",
        title: {
          vi: "Sự sống sau ngày tận thế",
          en: "Life After the Volcano",
        },
        payload: {
          vi: "Vùng đất tro tàn Ashlands và sự sinh tồn của tộc Mangkwan → Diễn thế sinh thái (succession), bài học Mount St. Helens và các di sản sinh học.",
          en: "The desolate Ashlands and Mangkwan clan survival → Ecological succession, Mount St. Helens recovery dynamics, and biological legacies.",
        },
        detailedPayload: {
          vi: "Một thế hệ trước các sự kiện trong Fire and Ash, một vụ phun trào núi lửa thảm khốc đã chôn vùi quê hương và Cây Mẹ của tộc Mangkwan trong biển tro tàn, buộc bộ tộc phải biến đổi hoàn toàn lối sống để sinh tồn trên vùng đất cằn cỗi. Nghiên cứu thực địa sau vụ phun trào núi lửa Mount St. Helens năm 1980 trên Trái Đất chứng minh rằng sự sống sót của các di sản sinh học (biological legacies như hạt mầm, bào tử nấm và động vật ẩn nấp dưới lòng đất) đóng vai trò quyết định trong việc hình thành các đảo tái thuộc địa hóa. Nếu vùng Ashlands của Pandora vẫn trơ trụi sau nhiều thập kỷ, chương sẽ mổ xẻ các rào cản địa hóa: đất nhiễm độc kim loại nặng, lớp vỏ tro núi lửa kết cứng, xói mòn liên tục và sự khắc nghiệt của vi khí hậu địa phương cản trở quá trình diễn thế sinh thái.",
          en: "A generation before the events of Fire and Ash, a catastrophic volcanic eruption buried the Mangkwan clan's ancestral territory and Hometree under ash, forcing them to radically adapt to survive in a barren wasteland. Field ecology following the 1980 Mount St. Helens eruption demonstrates that surviving biological legacies — subterranean seeds, fungal spores, and fossorial fauna — establish vital pioneer colonizing islands, proving ecological succession is non-linear. Analyzing why Pandora's Ashlands remain desolate decades later, the chapter explores geochemical inhibitors: heavy metal toxicity, sterile volcanic crusts, relentless erosion, and microclimatic feedbacks preventing recovery.",
        },
      },
      {
        slug: "fire-as-ecology-weapon-and-technology",
        title: {
          vi: "Lửa không chỉ phá hủy",
          en: "Fire as Ecology, Weapon and Technology",
        },
        payload: {
          vi: "Tộc Mangkwan dùng tàn lửa chiến đấu và thủy tinh núi lửa → Tam giác cháy, sinh thái học cháy rừng và cơ học đứt gãy vật liệu.",
          en: "Mangkwan pyrotechnic warfare and volcanic glass weaponry → Fire triangle chemistry, wildfire ecology, and brittle fracture mechanics.",
        },
        detailedPayload: {
          vi: "Tộc Mangkwan không chỉ sống sót giữa dung nham mà còn biến lửa thành vũ khí chiến đấu: các kỵ sĩ banshee mang than hồng đốt tên lửa và sẵn sàng thực hiện các đòn tấn công tự thiêu, trong khi thủy tinh núi lửa obsidian sắc bén và kim loại phế liệu từ RDA được tích hợp vào văn hóa vật chất của họ. Chương kết nối tam giác cháy, nhiệt động học phản ứng cháy, truyền nhiệt bức xạ, sinh thái học cháy rừng và cơ học đứt gãy giòn của thủy tinh núi lửa. Bài toán khí động lực học tính toán thời gian một cá thể ikran bốc cháy có thể duy trì lực nâng và quyền điều khiển trước khi màng cánh bị hủy hoại nhiệt, nhấn mạnh rằng lửa trong sinh thái học không chỉ là sự hủy diệt mà là một chế độ xáo trộn thiết yếu để tái tuần hoàn dưỡng chất.",
          en: "The Mangkwan clan harnesses fire as an active weapon: banshee riders carry embers to ignite incendiary arrows and deploy self-immolation assault tactics, while razor-sharp volcanic glass and scavenged RDA metals form their material culture. The analysis integrates combustion thermodynamics, radiant heat transfer, wildfire ecology, and brittle fracture mechanics of volcanic glass. Modeling aerodynamic flight limits, it calculates how long an engulfed ikran can sustain lift and flight authority under extreme convective cooling, demonstrating that fire is not merely destructive but an essential disturbance regime driving ecosystem nutrient cycling.",
        },
      },
      {
        slug: "the-biological-zeppelin",
        title: {
          vi: "Medusoid: khí cầu sống",
          en: "The Biological Zeppelin",
        },
        payload: {
          vi: "Túi chứa hydro của Medusoid và lực kéo của Windray → Nguyên lý Archimedes, sức nâng khí quyển, dằn sinh học và rủi ro cháy nổ hydro.",
          en: "Medusoid hydrogen lifting bladders and Windray traction → Archimedes buoyancy, bio-hydrogen synthesis, ballast systems, and flammability limits.",
        },
        detailedPayload: {
          vi: "Sinh vật khổng lồ Medusoid sở hữu khoang chứa khí hydro sinh ra từ quá trình chuyển hóa tiêu hóa, dùng nước thải làm dằn lỏng để điều chỉnh độ nổi tĩnh và trôi dạt theo các dòng gió khí quyển, được tộc du mục Tlalim khai thác làm lực nâng cho các gondola chở người kết hợp với loài Windray có cánh cung cấp lực kéo định hướng. Đây là bài học kinh điển về nguyên lý Archimedes, khối lượng riêng khí quyển, sức nâng tĩnh học, cơ chế dằn sinh học, tổng hợp hydro vi sinh và nguy cơ cháy nổ khí hydro trong môi trường giàu oxy. Đối chiếu với các túi khí điều chỉnh độ nổi ở vi khuẩn trên Trái Đất, chương làm rõ những giới hạn vật lý và khả năng hiện thực hóa của một sinh vật khí cầu sống.",
          en: "The colossal Medusoid utilizes an internal bladder containing metabolic hydrogen generated during digestion, using wastewater as liquid ballast to drift along atmospheric currents, harnessed by the nomadic Tlalim as buoyant aerostats for passenger gondolas steered by winged Windrays. This chapter explores Archimedes' buoyancy principle, atmospheric density, static lift, biological ballast regulation, enzymatic bio-hydrogen synthesis, and hydrogen flammability hazards in an oxygenated atmosphere. Comparing this with bacterial gas vesicles on Earth, it charts the physical limits and bioengineering viability of living zeppelins.",
        },
      },
      {
        slug: "how-the-wind-traders-navigate-a-planet",
        title: {
          vi: "Đọc những dòng sông vô hình trên bầu trời",
          en: "How the Wind Traders Navigate a Planet",
        },
        payload: {
          vi: "Hành trình di cư vòng quanh hành tinh hai lần mỗi năm của tộc Tlalim → Dòng xiết khí quyển (jet streams), định tuyến thời tiết và sóng hành tinh.",
          en: "Bi-annual planetary circumnavigation by the nomadic Tlalim → Atmospheric jet streams, planetary waves, and 3D altitude-based weather routing.",
        },
        detailedPayload: {
          vi: "Tộc Tlalim di chuyển vòng quanh Pandora hai lần mỗi năm nhờ các hoa tiêu dày dạn kinh nghiệm nắm vững động lực học bay, các tầng gió và địa hình hiểm trở, dẫn dắt các đoàn caravan khinh khí cầu dựa trên bản đồ khí quyển truyền đời mà không cần vệ tinh dự báo. Vận dụng khí tượng học hành tinh, chương phân tích các dòng xiết khí quyển (jet streams), sóng hành tinh Rossby, lực nâng địa hình, đối lưu nhiệt và kỹ thuật định tuyến thời tiết tối ưu (weather routing). Mô phỏng điều hướng ba chiều chứng minh cách một phương tiện bay không có động cơ phản lực vẫn có thể chu du khắp hành tinh bằng việc thay đổi độ cao chính xác để đón bắt các tầng gió thuận lợi.",
          en: "The nomadic Tlalim clan circumnavigates Pandora twice yearly under master navigators who possess generational knowledge of flight dynamics, wind strata, and terrain, piloting aerial caravans without meteorological satellites. Applying planetary meteorology, this chapter analyzes atmospheric jet streams, planetary Rossby waves, orographic lift, thermal convection, and optimal weather routing. Three-dimensional flight simulations prove how an aircraft lacking heavy propulsion can circumnavigate a planet by timing vertical altitude shifts to ride prevailing high-altitude wind currents.",
        },
      },
      {
        slug: "the-aerial-arms-race",
        title: {
          vi: "Nightwraith và cuộc chạy đua vũ trang trên trời",
          en: "The Aerial Arms Race",
        },
        payload: {
          vi: "Dã thú săn mồi trên không Nightwraith với nhiều tầng cánh lái → Khí động học đa cánh, tương tác xoáy và đánh đổi giữa cơ động và ổn định.",
          en: "Nightwraith apex aerial predator and multi-wing configurations → Tandem-wing aerodynamics, wake-vortex interactions, and combat maneuverability.",
        },
        detailedPayload: {
          vi: "Loài dã thú săn mồi trên không Nightwraith sở hữu nhiều tầng cánh lái khí động linh hoạt và độ cơ động chiến đấu kinh hoàng, được thủ lĩnh Varang cưỡi trong các cuộc đụng độ khốc liệt. Khí động học đa cánh (multi-wing aerodynamics) cho thấy việc có nhiều cặp cánh không tự động tăng hiệu suất nâng do sự tương tác nhiễu loạn luồng khí xoáy (vortex wake) giữa cánh trước và cánh sau; ngược lại, cấu trúc này mang đến uy lực kiểm soát hướng bay tuyệt đối và lực cản cảm ứng tối ưu. Chương đánh giá liệu Nightwraith được tiến hóa chuyên biệt để tối ưu hóa quãng bay tiết kiệm năng lượng, khả năng bay treo hay không chiến tầm gần khốc liệt.",
          en: "The apex aerial predator Nightwraith features tandem multi-wing control surfaces and extreme combat agility, flown by Varang in intense aerial warfare. Multi-wing aerodynamics demonstrates that multiple wing pairs do not automatically yield superior lift efficiency because forewing wake vortices disturb aft-wing airflow; instead, tandem wings grant extraordinary control authority and induced drag management. The chapter analyzes whether the Nightwraith evolved for long-range cruising efficiency, hovering precision, or tight close-quarters dogfighting.",
        },
      },
    ],
  },
  {
    id: "forests-mountains-skies",
    label: {
      vi: "Phần V — Rừng Rậm, Núi Non và Bầu Trời",
      en: "Part V — Forests, Mountains & Skies",
    },
    chapters: [
      {
        slug: "the-forest-as-a-cathedral",
        title: {
          vi: "Khu rừng mang dáng dấp một thánh đường",
          en: "The Forest as a Cathedral",
        },
        payload: {
          vi: "Cấu trúc không gian ba chiều của đại ngàn Omatikaya → Phân tầng tán rừng (canopy stratification), vi khí hậu và chia lô ổ sinh thái.",
          en: "Three-dimensional canopy architecture in Omatikaya rainforests → Vertical stratification, microclimate gradients, and spatial niche partitioning.",
        },
        detailedPayload: {
          vi: "Đại ngàn Omatikaya là một không gian sinh thái ba chiều đồ sộ với các tầng sống phân hóa rõ rệt từ thảm rừng tối tăm đến vòm tán vượt tầng đón nắng rực rỡ. Chương phân tích quá trình phân tầng tán rừng (canopy stratification), gradient suy giảm ánh sáng, biến thiên độ ẩm và nhiệt độ, thực vật biểu sinh (epiphytes) và động lực khoảng trống rừng (gap dynamics). Sơ đồ mặt cắt đứng chứng minh cách hàng trăm mét chiều cao thẳng đứng tạo ra các tiểu khí hậu riêng biệt, cho phép hàng ngàn loài chuyên biệt cùng chia sẻ ổ sinh thái mà không triệt tiêu lẫn nhau.",
          en: "The Omatikaya rainforest is a massive three-dimensional ecological volume with vertically stratified life zones spanning from the dim forest floor to the sun-drenched emergent canopy. This chapter analyzes canopy stratification, light extinction gradients, humidity and temperature regimes, epiphyte micro-habitats, and forest gap dynamics. Vertical cross-section modeling demonstrates how hundreds of meters of vertical relief generate distinct microclimates, allowing thousands of specialized species to partition shared resources without competitive exclusion.",
        },
      },
      {
        slug: "why-banshees-get-to-be-big",
        title: {
          vi: "Vì sao ikran được phép lớn đến thế?",
          en: "Why Banshees Get to Be Big",
        },
        payload: {
          vi: "Quần xã sinh vật bay khổng lồ thống trị bầu trời → Tải trọng cánh (wing loading), số Reynolds, mật độ khí quyển và trọng lực thấp.",
          en: "Gigantic flying fauna scaling limits → Wing loading equations, Reynolds numbers, atmospheric density, and low-gravity biomechanics.",
        },
        detailedPayload: {
          vi: "Kích thước khổng lồ của Ikran, Nightwraith và Toruk đặt ra câu hỏi về các giới hạn vật lý: bằng cách nào sinh quyển Pandora nuôi dưỡng được cả một quần xã động vật bay có sải cánh lớn hơn tiêm kích chiến đấu? Tích hợp phương trình tải trọng cánh (wing loading), số Reynolds, vận tốc thất tốc (stall speed), công suất cảm ứng, giới hạn công suất cơ bắp, trọng lực thấp (0.8g) và mật độ khí quyển đậm đặc, chương xây dựng một công cụ tính toán tham số giúp người đọc nhận biết chính xác điều kiện môi trường nào quyết định sự tồn tại của các loài động vật bay khổng lồ này.",
          en: "The colossal dimensions of Ikran, Nightwraiths, and Toruk challenge physical flight limits: how does Pandora's biosphere sustain an entire guild of flying vertebrates with wingspans rivaling fighter jets? Integrating wing loading equations, Reynolds numbers, stall speeds, induced power requirements, muscle power scaling limits, lower gravity (0.8g), and high atmospheric density, this chapter constructs a parameter calculator demonstrating which planetary factors make giant biological flight viable.",
        },
      },
      {
        slug: "the-night-ecology",
        title: {
          vi: "Khi màn đêm không thật sự tối",
          en: "The Night Ecology",
        },
        payload: {
          vi: "Sinh thái học ban đêm dưới ánh sáng phát quang và nhật thực → Đồng bộ nhịp sinh học (circadian entrainment), phân tử melatonin và thị giác bóng đêm.",
          en: "Nocturnal ecology under bioluminescent nightscapes and eclipses → Circadian clock entrainment, melatonin pathways, and night-vision adaptations.",
        },
        detailedPayload: {
          vi: "Cảnh quan đêm trên Pandora không phải là khoảng tối vô tận mà là một chế độ cảm giác độc lập ngập tràn ánh sáng phát quang sinh học, ánh sáng phản xạ từ Polyphemus và các kỳ nhật thực thường xuyên. Khám phá quá trình đồng bộ nhịp sinh học (circadian entrainment), các phân tử tương đương melatonin, độ nhạy quang phổ thị giác và sự phân chia ổ sinh thái theo thời gian, chương giải đáp bài toán hóc búa: sinh vật Pandora sẽ khóa đồng hồ sinh học theo chu kỳ mặt trời, chu kỳ quỹ đạo quanh Polyphemus, mùa nhật thực hay biến thiên nhiệt độ khi các tín hiệu thời gian này bị lệch pha.",
          en: "Pandora's nightscape is not passive darkness but an active sensory regime illuminated by widespread bioluminescence, Polyphemus reflected light, and frequent eclipses. Exploring circadian clock entrainment, melatonin pathways, retinal spectral sensitivity, and temporal niche partitioning, this chapter examines how organisms synchronize biological rhythms when solar days, orbital eclipses, and temperature cycles act as competing, out-of-phase zeitgebers.",
        },
      },
      {
        slug: "hometree-as-keystone",
        title: {
          vi: "Hometree: loài nòng cốt hay biểu tượng nòng cốt?",
          en: "Hometree as Keystone, Foundation and Cultural Keystone",
        },
        payload: {
          vi: "Hậu quả sinh thái và văn hóa khi Hometree sụp đổ → Phân biệt loài nòng cốt (keystone), loài nền tảng (foundation) và loài biểu tượng văn hóa.",
          en: "Ecological and cultural cascading shocks of Hometree collapse → Ecological keystone vs foundation species vs cultural keystone concepts.",
        },
        detailedPayload: {
          vi: "Sự sụp đổ của Cây Mẹ Hometree tại Omatikaya và Mangkwan gây ra những chấn động vượt xa phạm vi sinh thái học thuần túy, bởi Hometree vừa là sinh cảnh vật lý, nơi định cư, hạ tầng tâm linh lẫn kho lưu trữ văn hóa thiêng liêng. Chương làm sáng tỏ các khái niệm sinh thái: phân biệt loài nòng cốt (keystone species có tác động vượt trội so với sinh khối), loài nền tảng (foundation species kiến tạo cấu trúc không gian sống) và loài biểu tượng văn hóa (cultural keystone species), tránh lối suy diễn thô sơ rằng một cái cây khổng lồ thì mặc nhiên là loài nòng cốt mà tập trung vào các mắt xích sụp đổ dây chuyền trong hệ sinh thái.",
          en: "The destruction of Hometrees in the Omatikaya and Mangkwan territories caused devastation extending far beyond pure ecology, as Hometrees function simultaneously as physical habitats, settlements, sacred infrastructure, and cultural archives. The chapter refines ecological taxonomy: distinguishing trophic keystone species (disproportionate impact relative to biomass), foundation species (primary physical habitat builders), and cultural keystone species, avoiding the naive assumption that massive trees are automatically keystones while mapping cascading food-web collapses.",
        },
      },
      {
        slug: "pandoras-smallest-things",
        title: {
          vi: "Những sinh thể bé mọn nhất Pandora",
          en: "Pandora’s Smallest Things",
        },
        payload: {
          vi: "Thế giới vi nấm, vi sinh vật đất và đối tác cộng sinh → Lưới thức ăn vi sinh, học thuyết siêu sinh thể (holobiont) và giả thuyết Nữ hoàng Đỏ.",
          en: "Subterranean fungal hyphae, soil microbiomes, and micro-symbionts → Soil food webs, the holobiont superorganism model, and Red Queen coevolution.",
        },
        detailedPayload: {
          vi: "Mạng lưới nấm ngầm và thế giới vi sinh vật vô hình chi phối trực tiếp mạng lưới Eywa và sự thích nghi sinh lý của các sinh vật lớn, chứng minh vi sinh vật đóng vai trò nền tảng không kém gì các loài động vật khổng lồ. Phân tích lưới thức ăn đất (soil food web), diễn thế vi sinh vật, sự đồng tiến hóa mầm bệnh - vật chủ theo giả thuyết Nữ hoàng Đỏ và hệ vi sinh microbiome, chương khẳng định thông điệp cốt lõi: một cơ thể không bao giờ là một cá thể đơn độc, mà mọi sự sống đều là một siêu sinh thể cộng sinh (holobiont) phức hợp.",
          en: "Subterranean mycelial networks and the invisible microbial realm directly govern Eywa signaling and macro-organism physiology, proving microscopic organisms rival megafauna in ecological importance. Exploring soil food webs, microbial succession, host–pathogen coevolution (Red Queen hypothesis), and host microbiomes, the chapter underscores a central theme: no organism is an isolated individual; all complex life operates as symbiotic holobiont superorganisms.",
        },
      },
    ],
  },
  {
    id: "sea-and-reefs",
    label: {
      vi: "Phần VI — Đại Dương và Rạn San Hô",
      en: "Part VI — Sea & Reefs",
    },
    chapters: [
      {
        slug: "pandoras-ocean",
        title: { vi: "Đại dương trên Pandora", en: "Pandora’s Ocean" },
        payload: {
          vi: "Đại dương mênh mông, rạn san hô và miệng phun thủy nhiệt → Phân tầng nước biển, nước trồi (upwelling) và năng lượng xáo trộn thủy triều.",
          en: "Vast open oceans, coral shelves, and abyssal hydrothermal vents → Physical ocean stratification, upwelling currents, and massive tidal forcing.",
        },
        detailedPayload: {
          vi: "Đại dương của Pandora trải rộng từ các rạn san hô nhiệt đới nông đến tận vực thẳm biển sâu và các miệng phun thủy nhiệt ngầm, chịu tác động xáo trộn thủy triều khổng lồ từ hành tinh mẹ Polyphemus. Chương phân tích sự phân tầng đại dương, tầng nhiệt nhảy (thermocline), nồng độ oxy hòa tan, hoàn lưu lật nhào toàn cầu, dòng nước trồi (upwelling) giàu dinh dưỡng và sự xáo trộn cơ học mãnh liệt. Năng lượng thủy triều khổng lồ từ Polyphemus thúc đẩy sự hòa trộn chất dinh dưỡng liên tục, đặt ra câu hỏi liệu năng suất sinh học sơ cấp của biển Pandora có vượt trội hoàn toàn so với Trái Đất hay không.",
          en: "Pandora's oceans span from shallow tropical coral shelves to abyssal hydrothermal vents, driven by colossal tidal forces from Polyphemus. This chapter analyzes physical ocean stratification, thermoclines, dissolved oxygen minimum zones, global overturning circulation, nutrient-rich upwelling, and tidal mixing. Massive tidal dissipation drives vigorous deep-ocean mixing, investigating whether Pandoran tidal forces fuel marine primary productivity far exceeding Earth's oceans.",
        },
      },
      {
        slug: "tulkun-not-quite-whales",
        title: {
          vi: "Tulkun — Khi “cá voi” có lịch sử, văn hóa và chính trị",
          en: "Tulkun Beyond Whales",
        },
        payload: {
          vi: "Xã hội Tulkun với trí tuệ, ngôn ngữ âm nhạc và chuẩn mực đạo đức → Nhận thức bộ cá voi (cetacean), học tập xã hội và truyền thừa văn hóa.",
          en: "Tulkun society, musical dialect, and pacifist cultural norms → Cetacean cognitive ethology, social learning, and intergenerational cultural transmission.",
        },
        detailedPayload: {
          vi: "Loài Tulkun không chỉ là những sinh vật biển thông minh đơn lẻ mà cấu thành một xã hội hoàn chỉnh với hội đồng bô lão, ngôn ngữ âm nhạc phức tạp, ký ức truyền thừa và những cuộc tranh luận tập thể về chuẩn mực bất bạo động cũng như phản kháng chiến tranh. Đối chiếu với các nghiên cứu về bộ cá voi Trái Đất (cá voi sát thủ, cá nhà táng), chương phân tích cách học tập xã hội (social learning) tạo nên các nền văn hóa thị tộc ổn định, sự đồng tiến hóa gene–văn hóa và cấu trúc ngữ pháp tổ hợp của các chuỗi âm thanh coda, từ đó làm rõ ranh giới khoa học giữa văn hóa động vật, chuẩn mực tập quán và hành vi chính trị thực thụ.",
          en: "Tulkun are not merely intelligent marine animals but constitute a complex society featuring council elders, sophisticated musical dialects, intergenerational memory, and collective political debates over pacifist laws and military resistance. Drawing parallels with Earth cetaceans (orcas, sperm whales), the chapter examines social learning, clan culture, gene–culture coevolution, and combinatorial coda dialects to explore the scientific boundaries between animal culture, social norms, and emergent politics.",
        },
      },
      {
        slug: "the-reef-as-substrate",
        title: {
          vi: "Rạn san hô — Một thành phố được xây bởi sinh vật",
          en: "The Reef as Substrate",
        },
        payload: {
          vi: "Làng Awa'atlu tựa trên nền sinh học của rạn san hô → Cộng sinh san hô - vi tảo, hóa học vôi hóa đại dương và kỹ sư hệ sinh thái.",
          en: "The living biological floor of the Metkayina reef settlements → Coral-algal symbiosis, biogenic calcification, and ecosystem engineering.",
        },
        detailedPayload: {
          vi: "Ngôi làng Awa'atlu của tộc Metkayina không xây trên đá cứng mà đứng trên chính nền sinh học tích tụ qua hàng ngàn năm của rạn san hô — một hạ tầng sống (biogenic infrastructure) nuôi dưỡng toàn bộ đời sống của bộ tộc. Phân tích mối quan hệ cộng sinh giữa san hô và vi tảo, quá trình vôi hóa khung xương từ ánh sáng mặt trời, tái tuần hoàn dưỡng chất khép kín, độ phức tạp không gian ba chiều (rugosity) và vai trò của các kỹ sư hệ sinh thái, chương đặt câu hỏi về vật liệu xương của sinh vật rạn trước hóa học đại dương ngoại hành tinh và cảnh báo về sự mong manh của ngân sách carbonate khi biển cả nóng lên.",
          en: "The Metkayina village of Awa'atlu does not stand on mineral rock but rests upon the accumulated biological substrate of a living coral reef — a biogenic infrastructure supporting the clan's entire lifeway. Analyzing coral-algal mutualisms, light-enhanced calcification, closed-loop nutrient recycling, three-dimensional habitat rugosity, and ecosystem engineering, the chapter investigates skeletal biomaterials under alien ocean chemistry while highlighting carbonate budget vulnerabilities under ocean warming.",
        },
      },
      {
        slug: "bodies-built-for-water",
        title: {
          vi: "Những cơ thể sinh ra để thuộc về biển cả",
          en: "Bodies Built for Water",
        },
        payload: {
          vi: "Giải phẫu lặn thích nghi của tộc Metkayina → Sinh lý học lặn sâu (diving reflex), co bóp lách giải phóng oxy và bài học từ người Bajau.",
          en: "Aquatic anatomical adaptations of the Metkayina clan → Mammalian diving reflexes, splenic contraction, and human Bajau diver genetics.",
        },
        detailedPayload: {
          vi: "Tộc Metkayina sở hữu những biến đổi giải phẫu thích nghi vượt trội so with Na'vi rừng rậm: đuôi dẹp như mái chèo, cẳng tay rộng, màng mắt nictitating và khả năng nín thở lặn sâu phi thường. Chương mổ xẻ sinh lý học nín thở (breath-hold physiology), sự co bóp lách giải phóng hồng cầu dự trữ, phản xạ lặn ở động vật có vú (diving reflex), co mạch ngoại biên và tích trữ oxy bằng myoglobin. Lấy nghiên cứu di truyền học về người lặn biển Bajau ở Đông Nam Á làm đối chứng, chương phân định ranh giới giữa thích nghi sinh lý ngắn hạn, độ dẻo kiểu hình và quá trình tiến hóa hình thái vĩ mô.",
          en: "The Metkayina clan displays specialized anatomical adaptations divergent from forest Na'vi: paddle tails, flared forearms, nictitating membranes, and extraordinary breath-hold diving endurance. This chapter examines breath-hold physiology, splenic contraction releasing oxygenated red blood cells, the mammalian diving reflex, peripheral vasoconstriction, and muscular myoglobin storage. Using genetic studies of Southeast Asia's Bajau free-divers as a baseline, it differentiates physiological acclimatization, phenotypic plasticity, and macro-morphological evolution.",
        },
      },
      {
        slug: "squidray-and-the-deep-ocean-design-space",
        title: {
          vi: "Quỷ mực dưới miệng phun thủy nhiệt",
          en: "Squidray and the Deep-Ocean Design Space",
        },
        payload: {
          vi: "Dã thú săn mồi Southern Squidray (tsyong) quanh miệng phun thủy nhiệt → Động lực đẩy phản lực (jet propulsion), tế bào sắc tố và lưới thức ăn hóa dưỡng.",
          en: "Hydrothermal-vent apex predator Southern Squidray (tsyong) → Siphon jet propulsion, dynamic chromatophores, and chemosynthetic marine food webs.",
        },
        detailedPayload: {
          vi: "Loài Southern Squidray (tsyong) là dã thú săn mồi đỉnh bảng thông minh cư ngụ quanh các miệng phun thủy nhiệt biển sâu, sở hữu ống hút siphon đẩy phản lực như động cơ turbine, tế bào sắc tố chromatophores đổi màu để giao tiếp bầy đàn và sợi kuru kết nối thần kinh với thợ lặn Metkayina. Chương phân tích cơ học đẩy phản lực chất lưu, khả năng chịu áp suất thủy tĩnh cực đại, hiện tượng xâm thực bọt khí (cavitation), sự điều khiển tế bào sắc tố thần kinh và chuỗi thức ăn hóa dưỡng (chemosynthesis). Chương giải mã lý do một siêu dã thú lại tập trung quanh các miệng phun: hóa năng từ lòng đất nuôi dưỡng cả một tháp sinh khối khổng lồ từ đáy vực thẳm lên.",
          en: "The Southern Squidray (tsyong) is an intelligent apex predator inhabiting deep hydrothermal vents, featuring turbine-like siphon jet propulsion, communicative chromatophores, and neural queues bonding with Metkayina divers. The analysis models fluid jet propulsion, extreme hydrostatic pressure resilience, cavitation thresholds, neuromuscular chromatophore control, and chemosynthetic food webs. It reveals why large apex predators congregate around abyssal vents: geothermal chemical energy constructs a massive bottom-up trophic pyramid in the deep ocean.",
        },
      },
      {
        slug: "amrita-and-the-price-of-a-hunt",
        title: {
          vi: "Amrita và cái giá máu của một cuộc săn",
          en: "Amrita, Bioprospecting and Industrial Extraction",
        },
        payload: {
          vi: "Tàu Factory Ship săn bắt tulkun quy mô công nghiệp để chiết xuất Amrita → Dược lý học chống lão hóa, cướp đoạt sinh học (biopiracy) và Nghị định thư Nagoya.",
          en: "Industrial Factory Ship slaughter of tulkun for Amrita anti-aging fluids → Longevity pharmacology, bioprospecting economics, and the Nagoya Protocol.",
        },
        detailedPayload: {
          vi: "Sự xuất hiện của tàu chế biến khổng lồ Factory Ship — hoạt động như một dàn khoan dầu liên hoàn chuyên đánh bắt và xử lý tulkun quy mô công nghiệp — biến việc khai thác tinh chất chống lão hóa Amrita thành một cỗ máy kinh tế bóc lột toàn cầu của RDA. Đi từ dược lý học phân tử chống lão hóa (senolytics) đến kinh tế học đãi cát tìm sinh chất (bioprospecting) và sản lượng bền vững tối đa (MSY), chương đối chiếu với Nghị định thư Nagoya trên Trái Đất về quyền sở hữu nguồn gene và tri thức bản địa, biến khái niệm cướp đoạt sinh học (biopiracy) từ khẩu hiệu đạo đức thành một hệ thống phân tích chặt chẽ về quyền đồng thuận và công lý phân phối.",
          en: "The introduction of the massive Factory Ship — operating as an offshore industrial refinery to slaughter and process tulkun on a factory scale — turns Amrita anti-aging harvesting into a global extractive supply chain. Bridging cellular senescence pharmacology with bioprospecting economics and maximum sustainable yield (MSY), the chapter applies the real-world Nagoya Protocol on genetic resources and traditional knowledge, transforming 'biopiracy' from a moral slogan into a rigorous framework of consent, sovereignty, and benefit distribution.",
        },
      },
    ],
  },
  {
    id: "the-navi",
    label: { vi: "Phần VII — Người Na'vi", en: "Part VII — The Na'vi" },
    chapters: [
      {
        slug: "the-navi-body",
        title: { vi: "Cấu tạo cơ thể người Na’vi", en: "The Na’vi Body" },
        payload: {
          vi: "Giải phẫu chiều cao 3 mét, xương gia cố sợi carbon và dáng đứng humanoid → Định luật bình phương-lập phương, ứng suất xương và điều hòa thân nhiệt.",
          en: "10-foot humanoid anatomy with carbon-fiber-reinforced bones → The Square-Cube Law, cardiovascular hydrostatics, and thermoregulation scaling.",
        },
        detailedPayload: {
          vi: "Cơ thể người Na'vi cao ba mét với xương gia cố sợi carbon tự nhiên, cơ bắp thon dài, đuôi giữ thăng bằng và dáng đứng bốn chi humanoid đối lập sâu sắc với hệ động vật sáu chi bản địa. Vận dụng định luật bình phương-lập phương (square–cube law), chương phân tích ứng suất cơ học của xương, áp lực thủy tĩnh của hệ tuần hoàn để bơm máu lên não ở độ cao 3 mét, cơ chế tản nhiệt bề mặt, sải bước vận động và nguy cơ chấn thương khi ngã. Một sinh vật cao 3m không đơn thuần là người Trái Đất phóng to, mà đòi hỏi những biến đổi cơ sinh học toàn diện để thích ứng với môi trường trọng lực thấp và các va đập cơ học dữ dội.",
          en: "The ten-foot Na'vi body features naturally carbon-fiber-reinforced bones, elongated musculature, balancing tails, and a four-limbed humanoid posture that stands out against Pandora's hexapodal fauna. Applying the square-cube law, this chapter models skeletal stress mechanics, cardiovascular hydrostatics required to pump blood to a brain three meters high, surface thermoregulation, stride kinetics, and impact dynamics. A ten-foot organism is not merely a scaled-up human; it requires profound biomechanical adaptations to thrive in low gravity under extreme mechanical loads.",
        },
      },
      {
        slug: "the-queue-as-interface",
        title: {
          vi: "Queue — Cổng kết nối vạn vật",
          en: "The Queue as Neural Interface",
        },
        payload: {
          vi: "Sợi ăng-ten thần kinh (kuru) và liên kết Tsaheylu sinh học trực tiếp → Giao diện Não-Máy tính (BCI), điện cực thần kinh và khả năng tương thích xuyên loài.",
          en: "Neural queue (kuru) and biological Tsaheylu synaptic connections → Bidirectional Brain-Computer Interfaces (BCI) and cross-species neuro-compatibility.",
        },
        detailedPayload: {
          vi: "Sợi ăng-ten thần kinh kuru không phải là cổng kết nối bluetooth viễn tưởng đơn giản mà là một cấu trúc giải phẫu sống kết nối trực tiếp với động vật, với đồng loại và toàn bộ mạng lưới Eywa, được củng cố thêm bởi sự xuất hiện cấu trúc tương tự ở Spider. So sánh Tsaheylu với công nghệ Giao diện Não-Máy tính (BCI) xâm lấn và các thiết bị giả thần kinh hai chiều, chương phân tích những rào cản thực tế về suy giảm điện cực, độ trôi tín hiệu, băng thông và sự đào thải miễn dịch, làm nổi bật sự kỳ diệu của Tsaheylu như một giao diện cắm-chạy tương thích sinh học hoàn hảo giữa hai hệ thần kinh hoàn toàn khác loài.",
          en: "The neural kuru queue is far more than speculative biological Bluetooth: it is a living anatomical interface coupling directly with fauna, fellow Na'vi, and the planetary Eywa network, reinforced by Spider's emergent neural whip. Contrasting Tsaheylu with invasive Brain-Computer Interfaces (BCIs) and bidirectional neuroprostheses, this chapter examines electrode degradation, signal drift, bandwidth bottlenecks, and immune rejection, highlighting Tsaheylu as an evolutionary marvel: a plug-and-play, biocompatible synaptic interface operating across distinct species' nervous systems.",
        },
      },
      {
        slug: "navi-language-as-a-window",
        title: {
          vi: "Ngôn ngữ Na’vi — Cửa sổ nhìn thấu tư duy?",
          en: "Language as a Window",
        },
        payload: {
          vi: "Ngôn ngữ Na'vi do Paul Frommer kiến tạo → Loại hình học ngôn ngữ (typology), âm vị học và thuyết tương đối ngôn ngữ (Sapir-Whorf).",
          en: "Paul Frommer's constructed Na'vi linguistics → Linguistic typology, phonotactic structures, and the Sapir-Whorf linguistic relativity hypothesis.",
        },
        detailedPayload: {
          vi: "Được xây dựng công phu bởi nhà ngôn ngữ học Paul Frommer, tiếng Na'vi sở hữu hệ thống âm vị học, hình thái học và cú pháp hoàn chỉnh, xứng đáng được nghiên cứu như một mẫu vật ngôn ngữ học thực thụ. Chương khám phá loại hình học ngôn ngữ, các quy tắc kết hợp âm, phạm trù ngữ nghĩa và các phiên bản của Thuyết tương đối ngôn ngữ Sapir-Whorf. Một thí nghiệm tư duy trực quan giải đáp câu hỏi: liệu việc ngôn ngữ bắt buộc mã hóa các mối quan hệ sinh thái trong ngữ pháp có khiến người nói không thể tư duy ngoài các khuôn mẫu đó, hay chỉ định hướng sự chú ý nhận thức của họ vào môi trường xung quanh nhanh nhạy hơn.",
          en: "Constructed by linguist Paul Frommer, the Na'vi language features fully developed phonology, morphology, and syntax, serving as a genuine linguistic specimen. This chapter explores linguistic typology, phonotactics, semantic categorization, and the Sapir-Whorf linguistic relativity hypothesis. A thought experiment examines whether grammatically mandated ecological relational markers prevent speakers from conceiving alternatives or simply prime their cognitive attention toward environmental relationships.",
        },
      },
      {
        slug: "one-people-many-ecologies",
        title: {
          vi: "Một dân tộc, muôn vàn ngã rẽ sinh thái",
          en: "One People, Many Ecologies",
        },
        payload: {
          vi: "Sự đa dạng sinh thái và văn hóa giữa Omatikaya, Metkayina, Tlalim và Mangkwan → Sinh thái học văn hóa và lý thuyết kiến tạo ổ sinh thái (niche construction).",
          en: "Ecological and cultural divergence across Na'vi clans → Cultural ecology, gene–culture coevolution, and human/alien niche construction.",
        },
        detailedPayload: {
          vi: "Sự phân hóa giữa các bộ tộc Omatikaya (rừng), Metkayina (biển), Tlalim (gió) và Mangkwan (tro núi lửa) chứng minh văn hóa Na'vi không phải là một khối thuần nhất mà phản ánh sự đa dạng thích nghi sâu sắc. Kết hợp Sinh thái học Văn hóa (Cultural Ecology) và Lý thuyết Kiến tạo Ổ sinh thái (Niche Construction Theory), chương làm rõ sự tương tác hai chiều: môi trường định hình tập quán nhưng chính hoạt động văn hóa của cộng đồng cũng tái định hình áp lực chọn lọc của môi trường. Dựa trên các ví dụ về đồng tiến hóa gene–văn hóa ở loài người, chương bác bỏ định mệnh luận môi trường thô sơ để tôn vinh tính năng động xã hội.",
          en: "The divergence among the Omatikaya (forest), Metkayina (reef), Tlalim (wind), and Mangkwan (ash) clans demonstrates that Na'vi culture is not a monolith but an adaptive tapestry. Combining Cultural Ecology and Niche Construction Theory, this chapter explores bidirectional interactions: environments shape cultural practices, while cultural practices actively reshape selective ecological pressures. Drawing on human gene–culture coevolution models, it rejects crude environmental determinism in favor of dynamic biocultural adaptation.",
        },
      },
      {
        slug: "trade-as-a-cultural-nervous-system",
        title: {
          vi: "Wind Traders: thương mại như một hệ thần kinh văn hóa",
          en: "Trade as a Cultural Nervous System",
        },
        payload: {
          vi: "Đoàn caravan Tlalim vận chuyển hàng hóa, tin tức và kỹ thuật khắp Pandora → Lý thuyết mạng xã hội, sự lan truyền đổi mới và dịch tễ học ý tưởng.",
          en: "Tlalim aerial trade routes carrying goods, lore, and technology → Social network theory, diffusion of innovations, and cultural transmission topology.",
        },
        detailedPayload: {
          vi: "Các đoàn caravan khinh khí cầu của tộc du mục Tlalim không chỉ vận chuyển hàng hóa mà lưu chuyển tin tức chính trị, kỹ thuật chế tác và hòa trộn ảnh hưởng văn hóa giữa các thị tộc khắp hành tinh, đóng vai trò như một hệ thần kinh xã hội kết nối thế giới mà không cần viễn thông. Vận dụng Lý thuyết Mạng (Network Theory), sự khuếch tán đổi mới, dịch tễ học ý tưởng và trao đổi thị trường, chương mô hình hóa các clan là các node và lộ trình của Tlalim là các cạnh kết nối, phân tích tốc độ lan truyền của một phát minh, một hiệp ước hay một mầm bệnh, tạo nên bản đối xứng hoàn hảo giữa mạng lưới văn hóa Tlalim và mạng lưới sinh học Eywa.",
          en: "The aerial caravans of the nomadic Tlalim clan transport far more than physical goods: they circulate political intelligence, craft techniques, and cultural traditions across clans, acting as a planetary cultural nervous system without telecommunications. Applying Network Theory, diffusion of innovations, epidemiology of ideas, and trade models, this chapter maps clans as nodes and trade routes as edges, calculating the propagation velocity of innovations, rumors, and treaties to reveal a societal mirror to Eywa's biological network.",
        },
      },
      {
        slug: "disaster-trauma-and-cultural-evolution",
        title: {
          vi: "Ash People: khi một thảm họa trở thành ký ức tập thể",
          en: "Disaster, Trauma and Cultural Evolution",
        },
        payload: {
          vi: "Thảm họa núi lửa định hình bản sắc kiên cường và nghiệt ngã của tộc Mangkwan → Nhân học thảm họa, ký ức tập thể và sự hình thành chuẩn mực xã hội.",
          en: "Volcanic catastrophe forging Mangkwan clan identity and Varang's leadership → Disaster anthropology, collective trauma, and cultural norm shifts.",
        },
        detailedPayload: {
          vi: "Vụ phun trào núi lửa cướp đi sinh mạng của vô số đồng bào, phá hủy Cây Mẹ và làm mất đi vị Tsahìk đã đẩy tộc Mangkwan vào nỗi đau khôn cùng và sự rạn nứt niềm tin với Eywa, định hình nên bản sắc chiến binh nghiệt ngã dưới sự lãnh đạo của Varang. Tránh xa lối suy diễn thô thiển rằng chấn thương ắt sinh ra bạo lực, chương áp dụng nhân học thảm họa (disaster anthropology), ký ức tập thể, tín hiệu tốn kém (costly signaling), quyền uy lôi cuốn và tính phụ thuộc lộ trình lịch sử để phân tích cách các cộng đồng thực tế tái thiết chuẩn mực xã hội, đức tin và chiến lược sinh tồn sau những cú sốc hủy diệt.",
          en: "The catastrophic eruption that claimed countless lives, destroyed their Hometree, and killed their Tsahìk alienated the Mangkwan clan from Eywa, forging a hardened survivalist identity under Varang. Avoiding reductive formulas that equate trauma directly with violence, this chapter utilizes disaster anthropology, collective memory, costly signaling, charismatic authority, and path dependence to examine how real-world societies reconstruct cultural norms, belief systems, and survival strategies following existential shocks.",
        },
      },
      {
        slug: "the-three-laws-and-appropriate-technology",
        title: {
          vi: "Ba Luật của Eywa: công nghệ không bao giờ trung tính",
          en: "The Three Laws and Appropriate Technology",
        },
        payload: {
          vi: "Ràng buộc kỹ thuật theo Ba Luật của Eywa đối lập với vũ khí RDA ở tộc Ash → Công nghệ thích hợp (appropriate technology) và hệ thống kỹ thuật xã hội.",
          en: "Technological constraints under the Three Laws of Eywa vs Mangkwan RDA weapon adoption → Appropriate technology and sociotechnical dependencies.",
        },
        detailedPayload: {
          vi: "Kỹ nghệ chế tạo gondola của tộc Tlalim chứng minh người Na'vi sở hữu nền công nghệ tinh vi chịu sự ràng buộc chặt chẽ của Ba Luật Eywa (cấm bánh xe và nung chảy kim loại), đối lập hoàn toàn với việc tộc Mangkwan nhanh chóng tiếp nhận súng đạn và máy móc con người tại Bridgehead. Phân tích qua lăng kính công nghệ thích hợp (appropriate technology), tính phụ thuộc lộ trình, hiệu suất năng lượng thu hồi (EROI) và sinh thái học bảo trì, chương chỉ ra rằng một khẩu súng rất hiệu quả trong chiến đấu nhưng tạo ra cái bẫy phụ thuộc chí tử vào nguồn cung cấp đạn dược, chứng minh công nghệ không bao giờ tồn tại trung tính ngoài các mục tiêu xã hội.",
          en: "Tlalim gondola aeronautics proves the Na'vi possess sophisticated engineering constrained by the cultural Three Laws of Eywa (forbidding wheels and metallurgy), contrasting with the Mangkwan clan's rapid adoption of human firearms and machinery at Bridgehead. Analyzing appropriate technology, path dependence, energy return on investment, and maintenance ecology, this chapter shows that while an assault rifle offers immediate tactical lethality, it creates fatal dependencies on off-world ammunition supply chains, proving technology is never socially neutral.",
        },
      },
      {
        slug: "what-the-elders-know",
        title: {
          vi: "Trí tuệ của những bậc trưởng lão",
          en: "What the Elders Know",
        },
        payload: {
          vi: "Kho tàng tri thức sinh thái của các Tsahìk và hoa tiêu Tlalim → Tri thức Sinh thái Truyền thống (TEK), phương pháp thực địa và đồng sản xuất tri thức.",
          en: "Generational ecological wisdom of Tsahìks and Tlalim navigators → Traditional Ecological Knowledge (TEK), field observation, and knowledge co-production.",
        },
        detailedPayload: {
          vi: "Tri thức truyền đời của các Tsahìk, hoa tiêu Tlalim và thợ lặn Metkayina về thời tiết, hành vi động vật, dược tính thực vật và địa hình được đúc kết qua hàng ngàn năm cùng chung sống với thiên nhiên chứ không thông qua các phòng thí nghiệm cô lập của RDA. Chương tiếp cận Tri thức Sinh thái Truyền thống (TEK) như một hệ thống khoa học thực nghiệm có phương pháp và bối cảnh riêng, chứng minh rằng tri thức bản địa cung cấp những dữ liệu bảo tồn lịch sử vô giá mà khoa học định lượng hiện đại thường bỏ sót, đồng thời nhấn mạnh yêu cầu hợp tác bình đẳng và đồng sản xuất tri thức.",
          en: "Generational knowledge held by Tsahìks, Tlalim navigators, and Metkayina divers regarding meteorology, ethology, ethnobotany, and geomorphology is accrued through millennia of immersive environmental cohabitation rather than isolated RDA laboratories. Framing Traditional Ecological Knowledge (TEK) as an empirical knowledge system with rigorous contextual validity, the chapter shows how indigenous insights supply vital historical ecological baselines missed by quantitative sampling, emphasizing equitable knowledge co-production and intellectual sovereignty.",
        },
      },
      {
        slug: "i-see-you",
        title: { vi: "Oel ngati kameie — Ta thấy ngươi", en: "I See You" },
        payload: {
          vi: "Ý nghĩa triết học và tri giác của câu chào 'Oel ngati kameie' → Nhận thức nhập thể (embodied cognition), thuyết tâm trí và khái niệm Affordance của Gibson.",
          en: "Philosophical and perceptual depths of 'Oel ngati kameie' → Embodied cognition, Theory of Mind, and Gibson's ecological affordances.",
        },
        detailedPayload: {
          vi: "Đặt sau tất cả những phân tích về sinh lý học, văn hóa và mạng lưới sinh học, lời chào 'Oel ngati kameie' được giải mã không chỉ là lời chào xã giao mà là một tuyên ngôn triết học về sự công nhận tương hỗ, sự chú ý nhận thức và vị thế hiện hữu của tha nhân. Kết hợp nhận thức nhập thể (embodied cognition), Thuyết Tâm trí (Theory of Mind), cảm giác nội thụ (interoception) và lý thuyết Affordance của James J. Gibson, chương chứng minh môi trường không phải là tập hợp vật thể trung lập: một cành cây khổng lồ là điểm đậu đối với ikran, đường đi đối với Na'vi nhưng là chướng ngại vật với xe cơ giới RDA, liên kết chặt chẽ cơ thể, tri giác, văn hóa và môi trường sống.",
          en: "Positioned after physiology, culture, and Eywa, the greeting 'Oel ngati kameie' is decoded not as casual etiquette but as a profound philosophical assertion of mutual recognition, cognitive presence, and relational personhood. Synthesizing Embodied Cognition, Theory of Mind, interoception, and James J. Gibson's ecological affordance theory, this chapter proves environments are not neutral catalogs of matter: a massive branch is a perch to an ikran, a path to a Na'vi, and an obstacle to an RDA bulldozer, weaving together body morphology, perception, culture, and habitat affordances.",
        },
      },
    ],
  },
  {
    id: "the-human-machine",
    label: {
      vi: "Phần VIII — Cỗ máy Nhân loại",
      en: "Part VIII — The Human Machine & RDA Tech",
    },
    chapters: [
      {
        slug: "how-long-does-it-take-to-reach-pandora",
        title: {
          vi: "Sáu năm, bảy năm, hay một bài toán về nguồn?",
          en: "How Long Does It Take to Reach Pandora?",
        },
        payload: {
          vi: "Hành trình vượt 4.37 năm ánh sáng của tàu ISV Venture Star → Động học tương đối tính (relativistic kinematics), phản vật chất và phê bình tài liệu nguồn.",
          en: "The 4.37-light-year interstellar crossing aboard ISV Venture Star → Relativistic kinematics, antimatter energetics, and source criticism.",
        },
        detailedPayload: {
          vi: "Hành trình vượt 4.37 năm ánh sáng của các tàu liên sao ISV kéo dài 7 năm theo tư liệu Pandorapedia hiện hành (với 25 phi hành đoàn và 200 hành khách ngủ đông) đối lập với con số 6 năm trong các tài liệu cũ, tạo cơ hội tuyệt vời để rèn luyện phương pháp phê bình tài liệu nguồn trong khoa học. Khảo sát động học tương đối tính (relativistic kinematics), động năng khủng khiếp ở vận tốc 0.7c, phản ứng hủy cặp vật chất - phản vật chất, sự mài mòn của bụi liên sao tương đối tính và tấm chắn động năng, chương vẽ biểu đồ vận tốc theo thời gian để chứng minh thời gian du hành phụ thuộc sâu sắc vào giai đoạn gia tốc, hệ quy chiếu quan sát và các giả định quỹ đạo.",
          en: "The 4.37-light-year interstellar crossing of ISV starships spans seven years in current Pandorapedia records (carrying ~25 operating crew and 200 cryosleep colonists) contrasting with older six-year figures, providing a prime lesson in scientific source criticism. Modeling relativistic kinematics, kinetic energy at 0.7c, matter–antimatter annihilation energetics, relativistic dust ablation, and kinetic shielding, the chapter plots velocity profiles to show how transit time depends on acceleration profiles, observational reference frames, and trajectory constraints.",
        },
      },
      {
        slug: "sleeping-through-the-stars",
        title: {
          vi: "Giấc ngủ đông xuyên qua muôn ngàn vì sao",
          en: "Sleeping Through the Stars",
        },
        payload: {
          vi: "Công nghệ ngủ đông (Cryosleep) cho phi hành đoàn và hành khách ISV → Y học vũ trụ, trạng thái tê liệt cảm ứng (induced torpor) và ức chế trao đổi chất.",
          en: "Cryosleep for hundreds of interstellar passengers → Space medicine, induced torpor, metabolic depression, and radiation preservation.",
        },
        detailedPayload: {
          vi: "Đại đa số hành khách di cư trên tàu ISV được đưa vào trạng thái ngủ đông (cryosleep) suốt gần một thập kỷ trong khi chỉ một phi hành đoàn nhỏ túc trực điều khiển con tàu. Đi sâu vào y học vũ trụ thực nghiệm, chương phân tích trạng thái tê liệt cảm ứng (induced torpor), liệu pháp hạ thân nhiệt điều trị, cơ chế ức chế chuyển hóa trao đổi chất, teo cơ, mất khoáng chất xương, nguy cơ huyết khối và tổn thương mô thần kinh do thiếu máu cục bộ. Việc duy trì giấc ngủ 7 năm hoàn toàn khác việc làm lạnh bệnh nhân cấp cứu vài giờ, đòi hỏi bảng ngân sách năng lượng và vật chất chi tiết để mô hình hóa mức độ suy giảm trao đổi chất cần thiết và quy trình hồi sức lâm sàng phức tạp.",
          en: "Most interstellar colonists spend nearly a decade in cryosleep while a skeleton crew operates the ISV starship. Delving into experimental space medicine, this chapter analyzes synthetic induced torpor, therapeutic hypothermia protocols, metabolic suppression pathways, muscle atrophy, bone demineralization, deep-vein thrombosis risks, and neural ischemia. Sustaining human torpor for seven years is fundamentally different from cooling ICU patients for hours, demanding precise energy and metabolic mass budgets to model the required metabolic reduction and complex clinical revival protocols.",
        },
      },
      {
        slug: "the-avatar-body",
        title: {
          vi: "Bên trong lớp vỏ bọc Avatar",
          en: "The Avatar Body",
        },
        payload: {
          vi: "Cơ thể lai tạo DNA người - Na'vi và buồng kết nối sóng não → Thể khảm di truyền (chimerism), ánh xạ cảm giác-vận động và hiện diện từ xa (telepresence).",
          en: "Human–Na'vi chimeric hybrid bodies and neural link units → Genetic chimerism, sensorimotor remapping, and high-fidelity telepresence.",
        },
        detailedPayload: {
          vi: "Cơ thể Avatar là một thể khảm sinh học kết hợp DNA con người và Na'vi được điều khiển từ xa qua buồng liên kết sóng não, nhưng bản thân nó vẫn là một cơ thể sinh học thực thụ có trao đổi chất, phát triển và chịu thương tổn chứ không phải robot vô hồn. Chương phân tích thể khảm di truyền (chimerism), sinh học phát triển, sự tương thích miễn dịch mô học, giao diện não-máy tính băng thông cao và sự tái ánh xạ cảm giác-vận động (sensorimotor remapping). Trong khi công nghệ BCI thực tế mới chỉ giải mã các tín hiệu vận động hẹp, công nghệ Avatar đòi hỏi truyền dẫn hai chiều hoàn hảo với độ trễ cực thấp để vỏ não người điều khiển và cảm nhận trọn vẹn một cơ thể alien cao 3 mét.",
          en: "The Avatar body is an engineered biological chimera combining human and Na'vi genetics, tele-operated via neural link units, yet operating as an autonomous physiological organism that eats, metabolizes, grows, and sustains injury rather than a robotic puppet. This chapter examines genetic chimerism, developmental biology, immune histocompatibility, high-bandwidth BCIs, and sensorimotor remapping. While current real-world BCIs decode narrow signal streams, the Avatar system requires low-latency bidirectional neural transfer allowing a human motor cortex to orchestrate a ten-foot alien physique with full proprioceptive fidelity.",
        },
      },
      {
        slug: "the-true-cost-of-extraction",
        title: {
          vi: "Từ mỏ unobtanium đến Factory Ship",
          en: "The True Cost of Extraction",
        },
        payload: {
          vi: "Cỗ máy chuyển hóa công nghiệp của RDA từ quặng đất liền đến đại dương → Chỉ số hoàn vốn năng lượng (EROI), đánh giá vòng đời (LCA) và ngoại tác môi trường.",
          en: "RDA industrial metabolism spanning strip-mines to ocean Factory Ships → Energy Return on Investment (EROI), Life-Cycle Assessment, and ecological externalities.",
        },
        detailedPayload: {
          vi: "Quy mô khai thác của tập đoàn RDA mở rộng từ các mỏ lộ thiên unobtanium trên đất liền, logistics liên sao của hạm đội ISV đến tàu chế biến Factory Ship khổng lồ săn bắt tulkun trên đại dương, hình thành một cỗ máy chuyển hóa công nghiệp (industrial metabolism) khổng lồ. Vận dụng chỉ số Hoàn vốn Năng lượng Đầu tư (EROI), Đánh giá Vòng đời (LCA), thông lượng vật chất, năng lượng ẩn chứa (embodied energy), ngoại tác môi trường và hiệu ứng bật lại Jevons, chương chứng minh rằng giá trị thị trường hàng triệu USD/kg không thể đảm bảo tính khả thi nếu không tính toán toàn bộ chi phí năng lượng khai thác, vận tải liên sao và những tổn hại sinh thái bị gạt khỏi bảng cân đối kế toán.",
          en: "The RDA's extractive footprint spans terrestrial strip-mines for unobtanium, ISV interstellar logistics, and oceanic Factory Ships for tulkun processing, forming a colossal industrial metabolism. Applying Energy Return on Investment (EROI), Life-Cycle Assessment (LCA), material throughput, embodied energy, environmental externalities, and the Jevons paradox rebound effect, this chapter demonstrates that high market prices per kilogram cannot justify economic viability without accounting for total energy expenditures across interstellar supply lines and ecological degradation excluded from corporate balance sheets.",
        },
      },
      {
        slug: "what-the-mask-buys-you",
        title: {
          vi: "Chiếc mặt nạ thực sự mua cho bạn những gì?",
          en: "What the Mask Buys You",
        },
        payload: {
          vi: "Mặt nạ lọc khí Exo-pack và hệ thống hỗ trợ sự sống → Áp suất riêng phần khí thở, hệ thống lọc CO₂ và vòng tuần hoàn sinh tồn (ECLSS).",
          en: "Exo-pack breathing masks and life-support architecture → Gas partial pressure physics, CO₂ scrubbers, and closed-loop ECLSS engineering.",
        },
        detailedPayload: {
          vi: "Mặt nạ lọc khí Exo-pack là ranh giới mong manh giữa sự sống và cái chết đối với con người trong bầu khí quyển kịch độc của Pandora, mà sự biến đổi miễn nhiễm của Spider càng làm nổi bật tầm quan trọng sinh tử này. Chương tiếp cận vấn đề dưới góc độ kỹ thuật hỗ trợ sự sống (life-support architecture): phân tích áp suất riêng phần khí thở, nhu cầu bổ sung O₂ và lọc hóa học CO₂, sự điều hòa nhiệt độ và độ ẩm, tuổi thọ phin lọc, khoảng chết hô hấp và các kịch bản hỏng hóc. Đồng thời, chương so sánh mặt nạ thở hở, hệ thống tuần hoàn khí thở kín (rebreather) và hệ thống kiểm soát môi trường sinh tồn vòng kín (ECLSS) của các trạm không gian.",
          en: "The Exo-pack breathing mask is the fragile boundary between life and death for humans in Pandora's toxic air, a reality underscored by Spider's unmasked biological transformation. This chapter approaches the device through life-support systems engineering: analyzing gas partial pressures, supplemental oxygen requirements, chemical CO₂ scrubbers, thermal-moisture regulation, cartridge service life, dead space, and failure modes. It compares open-loop masks, closed-circuit rebreathers, and closed-loop Environmental Control and Life Support Systems (ECLSS) deployed in space habitats.",
        },
      },
      {
        slug: "old-minds-in-new-bodies",
        title: {
          vi: "Những linh hồn cũ trong thể xác mới",
          en: "Old Minds in New Bodies",
        },
        payload: {
          vi: "Chiến binh tái tổ hợp Recombinant và sự chuyển giao ký ức → Bản đồ kết nối thần kinh (connectomics), mô phỏng toàn bộ não và sự liền mạch của ý thức.",
          en: "Recombinant soldier clones with uploaded memories → Connectomics, Whole-Brain Emulation (WBE), and the philosophy of personal identity continuity.",
        },
        detailedPayload: {
          vi: "Các chiến binh tái tổ hợp Recombinant mang theo ký ức và nhân cách số hóa của những người lính đã chết cấy vào cơ thể Avatar mới, điển hình là Quaritch, đặt ra câu hỏi triết học và thần kinh học sâu sắc: lượng thông tin nào là đủ để tái tạo một con người? Phân tích các vết khắc ký ức (engrams), bản đồ kết nối nơ-ron (connectomics), mô phỏng toàn bộ não (whole-brain emulation) và sự liền mạch của ý thức, chương phân định rạch ròi giữa bản sao chức năng (functional copy), sự liên tục tâm lý và đồng nhất tính cá nhân (numerical identity), chỉ ra thần kinh học hiện đại còn cách rất xa việc sao chép trọn vẹn một tâm trí sống.",
          en: "Recombinant soldiers clone deceased personnel by downloading digitized memories and personalities into Avatar bodies, raising profound neurobiological and philosophical questions: what information suffices to reconstruct a conscious person? Investigating memory engrams, connectomics, whole-brain emulation (WBE), and continuity of consciousness, this chapter separates functional copies, psychological continuity, and personal numerical identity, demonstrating how far neuroscience remains from reading and transferring a living biological brain state.",
        },
      },
      {
        slug: "reverse-engineering-an-alien-biosphere",
        title: {
          vi: "Sci-Ops: khi Pandora trở thành phòng thí nghiệm",
          en: "Reverse-Engineering an Alien Biosphere",
        },
        payload: {
          vi: "Cơ sở nghiên cứu Sci-Ops giải mã hệ sinh học và nấm mycelium tại Bridgehead → Đa tầng Omics, cơ quan nhân tạo (organoids) và an toàn sinh học ngoài hành tinh.",
          en: "Sci-Ops laboratory pipelines dissecting mycelial adaptation at Bridgehead → Multi-omics, xenobiological organoids, and extraterrestrial biosafety protocols.",
        },
        detailedPayload: {
          vi: "Căn cứ Bridgehead thiết lập hạ tầng nghiên cứu Sci-Ops tối tân nhằm mổ xẻ, giải mã và kỹ nghệ hóa sinh học Pandora, mà trọng tâm mới nhất là giải mã cơ chế thích nghi nấm rễ của Spider để biến thành công nghệ thuộc địa hóa. Chương phác thảo một quy trình nghiên cứu khoa học thực thụ: phương pháp lấy mẫu, nhóm chứng thực nghiệm, kỹ thuật tách chiết phân biệt DNA người và DNA cộng sinh, phân tích đa tầng omics, khối phổ chuyển hóa (metabolomics), nuôi cấy cơ quan nhân tạo (organoids) và tiêu chuẩn an toàn sinh học ngoài hành tinh (xenobiological biosafety), xác lập các tiêu chí thực chứng để khẳng định nấm mycelium thực sự gây ra sự biến đổi sinh học.",
          en: "Bridgehead houses the RDA's Sci-Ops infrastructure, designed to catalog, dissect, and reverse-engineer Pandoran biology, focused urgently on reverse-engineering Spider's mycelial adaptation for colonial deployment. This chapter outlines a rigorous research methodology: field sampling protocols, experimental controls, human vs symbiont DNA separation, multi-omics pipelines, metabolomics, organoid cultures, and xenobiological biosafety standards, modeling the empirical evidence required to prove that mycelial endosymbionts actively cause respiratory adaptation.",
        },
      },
      {
        slug: "colonizing-by-changing-the-colonist",
        title: {
          vi: "Thuộc địa hóa mà không cần terraform",
          en: "Colonizing by Changing the Colonist",
        },
        payload: {
          vi: "Chiến lược thích nghi sinh học thay vì cải tạo địa cầu (terraforming) → Kỹ thuật hành tinh, cộng sinh nhân tạo (engineered symbiosis) và bảo vệ hành tinh.",
          en: "Biological colonist adaptation versus macro-terraforming → Planetary engineering economics, engineered symbiosis, and planetary protection ethics.",
        },
        detailedPayload: {
          vi: "Biến đổi sinh học của Spider mở ra một hướng đi chiến lược mới: thay vì tiêu tốn tài nguyên khổng lồ để cải tạo khí quyển cả một mặt trăng (terraforming) giống Trái Đất, nhân loại có thể biến đổi chính cơ thể người để thích nghi trực tiếp với Pandora thông qua cơ chế cộng sinh nấm rễ nhân tạo. Chương đặt hai giải pháp kỹ thuật lên bàn cân: cải tạo địa cầu quy mô vĩ mô đối lập với kỹ thuật di truyền và cộng sinh sinh học nhân tạo (engineered symbiosis). Giải pháp thứ hai tiết kiệm năng lượng hàng triệu lần nhưng đặt ra những thách thức nghiệt ngã về đạo đức sinh học, tính di truyền qua các thế hệ, nguy cơ mầm bệnh lai và sự ràng buộc không thể đảo ngược vào hệ sinh thái alien.",
          en: "Spider's adaptation sparks a strategic revolution: rather than spending centuries geoengineering an entire moon (macro-terraforming), humanity can bio-adapt the colonists themselves to Pandora through engineered mycelial symbiosis. This chapter contrasts two planetary engineering paradigms: macro-terraforming/paraterraforming versus human genetic engineering and synthetic symbiosis. Adapting the colonist is millions of times more energy-efficient but introduces severe bioethical dilemmas, heritability risks, pathogen hazards, and irreversible biological coupling to an alien ecosystem.",
        },
      },
    ],
  },
  {
    id: "contact-conflict-ethics",
    label: {
      vi: "Phần IX — Chạm trán, Xung đột và Lằn ranh Đạo đức",
      en: "Part IX — Contact, Conflict & Ethics",
    },
    chapters: [
      {
        slug: "first-contact-as-a-pattern",
        title: {
          vi: "Cuộc chạm trán đầu tiên: một vết xe đổ lặp lại",
          en: "First Contact as a Pattern",
        },
        payload: {
          vi: "Xung đột tiếp xúc kéo dài hàng thập kỷ giữa RDA và Na'vi → Nhân học về sự tiếp xúc, bất đối xứng quyền lực và các ranh giới khai thác thuộc địa.",
          en: "Decades of escalating contact, trade, and military confrontation → Anthropology of first contact, structural power asymmetry, and extractive frontier shocks.",
        },
        detailedPayload: {
          vi: "Xung đột giữa RDA và người Na'vi không phải là một sự kiện chạm trán đơn lẻ trong một ngày, mà là một tiến trình lịch sử kéo dài nhiều thập kỷ bao gồm nghiên cứu khoa học, giao thương, trường học của Grace, khai thác tài nguyên, leo thang quân sự và tranh chấp lãnh thổ. Vận dụng nhân học về sự tiếp xúc (anthropology of contact), chương phân tích các cơ chế lịch sử: phơi nhiễm mầm bệnh, bất đối xứng quyền lực, bẫy phụ thuộc kinh tế, vai trò của người môi giới văn hóa, rào cản phiên dịch và cú sốc nhân khẩu học, đồng thời kiên quyết tránh việc đồng nhất bất kỳ dân tộc bản địa nào trên Trái Đất với người Na'vi để giữ vững tính khách quan phân tích.",
          en: "Human–Na'vi conflict is not a single dramatic first contact day, but a decades-long historical process spanning scientific research, trade, missionary schools, resource extraction, military escalation, and territorial annexation. Applying the anthropology of contact, this chapter deconstructs historical mechanisms: pathogen transmission, structural power asymmetry, economic dependency, cultural brokerage, translation barriers, extractive frontier shocks, and demographic shifts, strictly avoiding equating real Indigenous communities directly with fictional Na'vi to preserve analytical rigor.",
        },
      },
      {
        slug: "whose-body-whose-consent",
        title: {
          vi: "Thân xác của ai, sự đồng thuận thuộc về ai?",
          en: "Whose Body, Whose Consent?",
        },
        payload: {
          vi: "Đánh cắp DNA bản địa, nhân bản Recombinant và thí nghiệm trên Spider → Đạo đức nghiên cứu (Belmont Report), tế bào HeLa và chủ quyền dữ liệu OCAP.",
          en: "Non-consensual DNA harvesting, Recombinant clones, and human experimentation → Research bioethics (Belmont Report), HeLa cells, and Indigenous OCAP principles.",
        },
        detailedPayload: {
          vi: "Việc thu thập DNA Na'vi bí mật cho dự án Avatar, nhân bản chiến binh Recombinant và thí nghiệm trên thể xác biến đổi của Spider tạo thành một chuỗi liên tục các vi phạm đạo đức sinh học: chiếm đoạt vật liệu sống, can thiệp thể xác, quét đọc não bộ, lưu trữ ký ức và phục vụ mục đích quân sự thực dân. Chương áp dụng các nguyên tắc đạo đức nghiên cứu kinh điển từ Báo cáo Belmont (tôn trọng con người, thụ hưởng điều thiện, công bằng), liên hệ với bài học lịch sử về tế bào HeLa của Henrietta Lacks và nguyên tắc Chủ quyền Dữ liệu Bản địa OCAP (Ownership, Control, Access, Possession), mang đến khung pháp lý và đạo đức thực chất để mổ xẻ hành vi của RDA.",
          en: "Covert Na'vi DNA harvesting for the Avatar program, cloning Recombinants, and experimenting on Spider's transformed body form a continuum of severe bioethical violations: non-consensual tissue acquisition, body manipulation, brain scanning, memory archiving, and military bioprospecting. The chapter applies Belmont Report research ethics (respect for persons, beneficence, justice), the historical precedent of Henrietta Lacks and HeLa cells, and Indigenous data sovereignty frameworks like OCAP (Ownership, Control, Access, Possession), providing structured analytical tools to evaluate RDA bioethics.",
        },
      },
      {
        slug: "no-shared-grammar",
        title: {
          vi: "Sự lệch pha về mặt ngữ pháp",
          en: "No Shared Grammar",
        },
        payload: {
          vi: "Sự đổ vỡ đối thoại về quyền sở hữu đất đai và mối quan hệ thiêng liêng → Ngữ dụng học, tính bất khả thông ước (incommensurability) và khung bản thể luận.",
          en: "Communication breakdown over land ownership, resource extraction, and personhood → Pragmatics, incommensurability, and conflicting ontological frameworks.",
        },
        detailedPayload: {
          vi: "Sự đổ vỡ trong giao tiếp giữa con người và người Na'vi không bắt nguồn từ việc dịch sai từ ngữ, mà do sự bất khả thông ước (incommensurability) sâu sắc về các khái niệm đất đai, tài nguyên, quyền sở hữu, quan hệ thân tộc, sự thiêng liêng và nhân vị (personhood). Phân tích qua ngữ dụng học (pragmatics), các lược đồ khái niệm, nền tảng tri thức chung (common ground) và lý thuyết trò chơi phát tín hiệu, chương chứng minh rằng đối thoại chân chính đòi hỏi những giả định nền tảng chung: nếu một bên xem Hometree là bất động sản chứa khoáng sản còn bên kia xem là mạng lưới tổ tiên thiêng liêng, từ điển song ngữ không thể giải quyết được sự xung đột bản thể luận.",
          en: "Communication failure between humans and Na'vi stems not from vocabulary errors, but from profound ontological incommensurability regarding land, property rights, kinship, sacredness, and what constitutes personhood. Utilizing pragmatics, conceptual scheme analysis, common ground theory, and signaling games, this chapter shows that meaningful dialogue requires shared priors: if one party defines Hometree as resource-bearing real estate and the other defines it as an ancestral nexus, bilingual dictionaries cannot bridge conflicting ontological frameworks.",
        },
      },
      {
        slug: "why-the-stronger-side-loses",
        title: {
          vi: "Vì sao phe có công nghệ áp đảo vẫn có thể thua",
          en: "Why the Stronger Side Loses",
        },
        payload: {
          vi: "Thất bại của hỏa lực vượt trội trước chiến thuật du kích và liên minh sinh thái → Chiến tranh bất đối xứng, chuỗi cung ứng dễ tổn thương và định luật Lanchester.",
          en: "Defeat of superior mechanized firepower by guerrilla tactics and ecological alliance → Asymmetric warfare, fragile supply chains, and limits of Lanchester laws.",
        },
        detailedPayload: {
          vi: "RDA sở hữu hỏa lực cơ giới vượt trội, mạng lưới giám sát tối tân và logistics công nghiệp khổng lồ, nhưng liên tục nếm mùi thất bại trước chiến thuật du kích phân tán, địa hình hiểm trở và sự trỗi dậy của toàn bộ sinh quyển Eywa. Chương phân tích lý thuyết chiến tranh bất đối xứng, các mô hình nổi dậy kháng chiến, điểm nghẽn hậu cần, lợi thế thông tin địa phương và định luật Lanchester về sức mạnh chiến đấu. Chương chứng minh các phương trình Lanchester kinh điển thất bại hoàn toàn khi địa hình phức tạp, thông tin tình báo bản địa và các liên minh sinh thái phi tuyến tính chi phối chiến trường.",
          en: "The RDA commands overwhelming mechanized firepower, advanced surveillance assets, and massive industrial logistics, yet repeatedly suffers strategic defeats against dispersed guerrilla tactics, treacherous terrain, and biospheric mobilization. This chapter applies asymmetric warfare theory, insurgency dynamics, logistics bottlenecks, local information advantage, and Lanchester combat power laws. It demonstrates why simple Lanchester differential equations break down when complex geography, indigenous intelligence, and nonlinear ecological alliances dominate the battlespace.",
        },
      },
      {
        slug: "technology-transfer-and-the-mangkwan-rda-alliance",
        title: {
          vi: "Khi công nghệ vượt qua chiến tuyến",
          en: "Technology Transfer and the Mangkwan–RDA Alliance",
        },
        payload: {
          vi: "Liên minh chiến lược giữa tộc Mangkwan và RDA tại Bridgehead → Khuếch tán công nghệ quân sự, đường cong học tập và cái bẫy phụ thuộc chuỗi cung ứng.",
          en: "Strategic military alliance between Mangkwan and the RDA at Bridgehead → Military technology diffusion, learning curves, and supply-chain dependency traps.",
        },
        detailedPayload: {
          vi: "Việc tộc Mangkwan gia nhập căn cứ Bridgehead và nhanh chóng tiếp nhận vũ khí, công nghệ của loài người dưới sự lãnh đạo sắc sảo của Varang phản ánh một liên minh quân sự toan tính nhằm thay đổi cán cân quyền lực trên Pandora. Chương mổ xẻ sự khuếch tán công nghệ quân sự, đổi mới lưỡng dụng, đường cong học tập và bẫy phụ thuộc công nghệ. Một vũ khí cơ giới không chỉ là công cụ đơn lẻ mà đòi hỏi đạn dược, bảo dưỡng, kỹ thuật luyện kim và chuỗi cung ứng phức tạp; chương phân tích các tầng nấc tiếp nhận công nghệ — từ vận hành, bảo trì đến tự chủ chế tạo — và cách chúng tái định hình vị thế chính trị giữa Mangkwan và RDA.",
          en: "The Mangkwan clan's entry into Bridgehead and rapid adoption of human firearms and machinery under Varang's leadership reflects a calculated military alliance designed to shift regional power balances. This chapter deconstructs military technology diffusion, dual-use innovations, operational learning curves, and technological dependency traps. A firearm is not an isolated tool but requires ammunition logistics, maintenance tooling, metallurgy, and spare parts supply lines; the chapter models tiers of technology adoption — operation, maintenance, reverse-engineering, indigenous fabrication — showing how each tier reshapes political power dynamics with the RDA.",
        },
      },
      {
        slug: "pandora-as-mirror",
        title: {
          vi: "Pandora — Tấm gương không hoàn toàn phẳng",
          en: "Pandora as Mirror",
        },
        payload: {
          vi: "Thế giới Pandora đa chiều vượt ra khỏi nhị nguyên thiện - ác giản đơn → Nghiên cứu khoa học hậu thực dân, công lý môi trường và sinh thái chính trị học.",
          en: "Multi-faceted Pandoran societies challenging simplistic moral binaries → Postcolonial science studies, environmental justice, and political ecology.",
        },
        detailedPayload: {
          vi: "Với sự đa dạng nội bộ phức tạp của các thị tộc Na'vi — một bộ tộc từ bỏ Eywa, một bộ tộc sống bằng thương mại di cư và các phản ứng trái ngược trước thảm họa — cuốn sách vượt qua công thức nhị nguyên giản đơn 'con người xấu xa, Na'vi hoàn hảo'. Vận dụng nghiên cứu khoa học hậu thực dân (postcolonial science studies), công lý môi trường, công lý chuyển tiếp và sinh thái chính trị học, chương chuyển câu hỏi từ việc phán xét thiện ác sang việc phân tích ai nắm quyền định nghĩa tri thức, quyền sở hữu, rủi ro và sự tiến bộ, đồng thời tự soi rọi lại chính cuốn sách trong việc sử dụng khoa học bản địa Trái Đất để giải mã một thế giới hư cấu.",
          en: "With the internal cultural diversity of Na'vi clans — a clan rejecting Eywa, a nomadic trading culture, and disparate reactions to environmental shocks — the book moves beyond simplistic binaries of 'evil humans vs harmonious Na'vi'. Applying postcolonial science studies, environmental justice, transitional justice, and political ecology, the inquiry shifts from moral judgments to analyzing structural power: who holds the authority to define knowledge, property rights, environmental risk, and progress, while critically examining our own use of Earth Indigenous science to analyze a fictional world.",
        },
      },
    ],
  },
  {
    id: "open-questions",
    label: {
      vi: "Phần X — Những câu hỏi còn ngỏ",
      en: "Part X — Open Questions",
    },
    chapters: [
      {
        slug: "pandoras-open-file",
        title: {
          vi: "Tập hồ sơ chưa khép lại của Pandora",
          en: "Pandora’s Open File",
        },
        payload: {
          vi: "Bảng tổng hợp các quan sát chưa có lời giải đáp hoàn chỉnh → Cách biến lỗ hổng kịch bản thành câu hỏi nghiên cứu và thiết kế thí nghiệm kiểm chứng.",
          en: "Catalog of unresolved canon anomalies and scientific puzzles → Transforming plot holes into testable scientific hypotheses and thought experiments.",
        },
        detailedPayload: {
          vi: "Thay vì chỉ vạch lỗi kịch bản, chương lập một bảng tổng hợp các ẩn số khoa học lớn nhất của Pandora: nguồn năng lượng nhiệt động học tối thượng của Eywa, cơ chế tạo kuru ở Spider, độ tuổi và nguồn gốc sinh quyển, sự bất tương thích sơ đồ cơ thể 4 chi và 6 chi, động lực học chất lưu của Flux Devil, ngân sách năng lượng treo núi bay và sự tương thích sinh hóa sâu sắc với con người. Chương hướng dẫn cách chuyển hóa một lỗ hổng cốt truyện thành một câu hỏi nghiên cứu khoa học thực thụ: xác định biến số quan sát được, lập các giả thuyết cạnh tranh, đưa ra dự đoán phân biệt và thiết kế các thí nghiệm tưởng tượng chặt chẽ để kiểm chứng.",
          en: "Rather than trivial cinematic nitpicking, this chapter compiles Pandora's greatest unresolved scientific anomalies: Eywa's ultimate thermodynamic energy source, the cellular mechanics of Spider's kuru morphogenesis, the age and genesis of the biosphere, the four-limb vs six-limb phylogenetic mismatch, the magnetohydrodynamics of the Flux Devil, the energy budget of floating mountains, and human biochemical compatibility. It teaches how to transform narrative plot holes into rigorous scientific research questions: defining observables, formulating competing hypotheses, establishing discriminating predictions, and designing thought experiments.",
        },
      },
      {
        slug: "what-pandora-helps-us-see",
        title: {
          vi: "Những chân trời Pandora hé mở",
          en: "What Pandora Helps Us See",
        },
        payload: {
          vi: "Đúc kết toàn thư và bài toán tìm kiếm sự sống ngoài Trái Đất → Tư duy phản thực (counterfactual reasoning), phương trình Drake và nghịch lý Fermi.",
          en: "Grand synthesis and the search for extraterrestrial life → Counterfactual reasoning, the Drake equation, the Fermi paradox, and planetary wonder.",
        },
        detailedPayload: {
          vi: "Khép lại hành trình 64 chương nghiên cứu, thế giới hư cấu Pandora trở thành một bộ bài tập thử nghiệm mẫu mực cho những câu hỏi sâu sắc nhất của nhân loại: khi chạm trán một sinh quyển ngoài Trái Đất, điều gì sẽ thực sự được định nghĩa là sự sống, trí tuệ, văn hóa, nhân vị hay một nền văn minh? Kết nối Phương trình Drake, Nghịch lý Fermi, các dấu ấn công nghệ (technosignatures), dấu ấn sinh học và tư duy phản thực (counterfactual reasoning), chương kết luận rằng một thế giới tưởng tượng xuất sắc cho ta một không gian an toàn để rèn luyện cách đặt những câu hỏi khoa học đúng đắn về những thế giới mà một ngày nào đó nhân loại thực sự có thể quan sát.",
          en: "Concluding our 64-chapter investigation, the fictional world of Pandora serves as an intellectual sandbox for humanity's deepest inquiries: when we eventually encounter an alien biosphere, how will we define life, intelligence, culture, personhood, or civilization? Synthesizing the Drake Equation, the Fermi Paradox, technosignatures, atmospheric biosignatures, and counterfactual reasoning, the grand finale affirms that an intricately constructed fictional world provides a safe proving ground to practice asking rigorous scientific questions about worlds we may one day truly discover.",
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
  const published = new Set(
    listPublishedChapters(locale).map((c) => c.meta.slug),
  );
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
