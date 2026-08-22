"use client";

import dynamic from "next/dynamic";
import type React from "react";
import type { GlossaryVisualizationId } from "./registry";

// Populated incrementally as each phase ships its components. Keys are glossary
// term slugs; values are code-split dynamic imports so a term page only loads
// its own figure chunk.
const GLOSSARY_VISUALIZATIONS: Partial<Record<GlossaryVisualizationId, React.ComponentType>> = {
  // Phase 2 — Astronomy & Space
  "alpha-centauri": dynamic(() => import("./alpha-centauri"), { ssr: false }),
  "habitable-zone": dynamic(() => import("./habitable-zone"), { ssr: false }),
  exomoon: dynamic(() => import("./exomoon"), { ssr: false }),
  "roche-limit": dynamic(() => import("./roche-limit"), { ssr: false }),
  accretion: dynamic(() => import("./accretion"), { ssr: false }),
  "planetary-differentiation": dynamic(() => import("./planetary-differentiation"), { ssr: false }),
  biosignature: dynamic(() => import("./biosignature"), { ssr: false }),
  "direct-imaging": dynamic(() => import("./direct-imaging"), { ssr: false }),
  "radial-velocity": dynamic(() => import("./radial-velocity"), { ssr: false }),
  "transmission-spectroscopy": dynamic(() => import("./transmission-spectroscopy"), { ssr: false }),
  "transit-timing-variation": dynamic(() => import("./transit-timing-variation"), { ssr: false }),
  "tidal-heating": dynamic(() => import("./tidal-heating"), { ssr: false }),
  "faint-young-sun-paradox": dynamic(() => import("./faint-young-sun-paradox"), { ssr: false }),
  gyrochronology: dynamic(() => import("./gyrochronology"), { ssr: false }),
  libration: dynamic(() => import("./libration"), { ssr: false }),
  obliquity: dynamic(() => import("./obliquity"), { ssr: false }),
  "orbital-resonance": dynamic(() => import("./orbital-resonance"), {
    ssr: false,
  }),
  planetshine: dynamic(() => import("./planetshine"), { ssr: false }),
  "sidereal-day": dynamic(() => import("./sidereal-day"), { ssr: false }),
  "spin-orbit-resonance": dynamic(() => import("./spin-orbit-resonance"), {
    ssr: false,
  }),
  "synchronous-rotation": dynamic(() => import("./synchronous-rotation"), {
    ssr: false,
  }),
  "synodic-day": dynamic(() => import("./synodic-day"), { ssr: false }),
  "tidal-locking": dynamic(() => import("./tidal-locking"), { ssr: false }),

  // Phase 3 — Geochronology & Deep Time
  "crater-counting": dynamic(() => import("./crater-counting"), { ssr: false }),
  "deep-time": dynamic(() => import("./deep-time"), { ssr: false }),
  geochronology: dynamic(() => import("./geochronology"), { ssr: false }),
  "geologic-time-scale": dynamic(() => import("./geologic-time-scale"), {
    ssr: false,
  }),
  "half-life": dynamic(() => import("./half-life"), { ssr: false }),
  isochron: dynamic(() => import("./isochron"), { ssr: false }),
  "radiocarbon-dating": dynamic(() => import("./radiocarbon-dating"), {
    ssr: false,
  }),
  "radiometric-dating": dynamic(() => import("./radiometric-dating"), {
    ssr: false,
  }),
  uniformitarianism: dynamic(() => import("./uniformitarianism"), {
    ssr: false,
  }),
  "uranium-lead-dating": dynamic(() => import("./uranium-lead-dating"), {
    ssr: false,
  }),
  zircon: dynamic(() => import("./zircon"), { ssr: false }),

  // Phase 4 — Atmosphere & Climate
  "adiabatic-lapse-rate": dynamic(() => import("./adiabatic-lapse-rate"), {
    ssr: false,
  }),
  albedo: dynamic(() => import("./albedo"), { ssr: false }),
  "atmospheric-disequilibrium": dynamic(() => import("./atmospheric-disequilibrium"), {
    ssr: false,
  }),
  "atmospheric-general-circulation": dynamic(() => import("./atmospheric-general-circulation"), {
    ssr: false,
  }),
  "carbon-chauvinism": dynamic(() => import("./carbon-chauvinism"), {
    ssr: false,
  }),
  "carbonate-silicate-cycle": dynamic(() => import("./carbonate-silicate-cycle"), { ssr: false }),
  "coriolis-effect": dynamic(() => import("./coriolis-effect"), { ssr: false }),
  daisyworld: dynamic(() => import("./daisyworld"), { ssr: false }),
  "earth-system-science": dynamic(() => import("./earth-system-science"), {
    ssr: false,
  }),
  "gaia-hypothesis": dynamic(() => import("./gaia-hypothesis"), { ssr: false }),
  "great-oxidation-event": dynamic(() => import("./great-oxidation-event"), {
    ssr: false,
  }),
  "hadley-cell": dynamic(() => import("./hadley-cell"), { ssr: false }),
  homeostasis: dynamic(() => import("./homeostasis"), { ssr: false }),
  "intertropical-convergence-zone": dynamic(() => import("./intertropical-convergence-zone"), {
    ssr: false,
  }),
  "negative-feedback": dynamic(() => import("./negative-feedback"), {
    ssr: false,
  }),
  "partial-pressure": dynamic(() => import("./partial-pressure"), {
    ssr: false,
  }),
  "positive-feedback": dynamic(() => import("./positive-feedback"), {
    ssr: false,
  }),
  "radiative-equilibrium": dynamic(() => import("./radiative-equilibrium"), {
    ssr: false,
  }),
  superrotation: dynamic(() => import("./superrotation"), { ssr: false }),
  "thermohaline-circulation": dynamic(() => import("./thermohaline-circulation"), { ssr: false }),
  "tipping-point": dynamic(() => import("./tipping-point"), { ssr: false }),
  "claw-hypothesis": dynamic(() => import("./claw-hypothesis"), { ssr: false }),

  // Phase 5 — Physics & Superconductivity
  "cooper-pair": dynamic(() => import("./cooper-pair"), { ssr: false }),
  "critical-temperature": dynamic(() => import("./critical-temperature"), {
    ssr: false,
  }),
  diamagnetism: dynamic(() => import("./diamagnetism"), { ssr: false }),
  "flux-pinning": dynamic(() => import("./flux-pinning"), { ssr: false }),
  "hallelujah-mountains": dynamic(() => import("./hallelujah-mountains"), {
    ssr: false,
  }),
  "meissner-effect": dynamic(() => import("./meissner-effect"), { ssr: false }),
  "quantum-locking": dynamic(() => import("./quantum-locking"), { ssr: false }),
  superconductivity: dynamic(() => import("./superconductivity"), {
    ssr: false,
  }),
  superposition: dynamic(() => import("./superposition"), { ssr: false }),
  "type-ii-superconductor": dynamic(() => import("./type-ii-superconductor"), {
    ssr: false,
  }),

  // Phase 6 — Evolutionary Biology & Genetics
  "adaptive-radiation": dynamic(() => import("./adaptive-radiation"), {
    ssr: false,
  }),
  "analogous-structures": dynamic(() => import("./analogous-structures"), {
    ssr: false,
  }),
  "bilateral-symmetry": dynamic(() => import("./bilateral-symmetry"), {
    ssr: false,
  }),
  "body-plan": dynamic(() => import("./body-plan"), { ssr: false }),
  "cambrian-explosion": dynamic(() => import("./cambrian-explosion"), {
    ssr: false,
  }),
  canalization: dynamic(() => import("./canalization"), { ssr: false }),
  "character-displacement": dynamic(() => import("./character-displacement"), {
    ssr: false,
  }),
  "cis-regulatory-element": dynamic(() => import("./cis-regulatory-element"), {
    ssr: false,
  }),
  coevolution: dynamic(() => import("./coevolution"), { ssr: false }),
  "convergent-evolution": dynamic(() => import("./convergent-evolution"), {
    ssr: false,
  }),
  "deep-homology": dynamic(() => import("./deep-homology"), { ssr: false }),
  "degeneracy-biology": dynamic(() => import("./degeneracy-biology"), {
    ssr: false,
  }),
  "differential-persistence": dynamic(() => import("./differential-persistence"), { ssr: false }),
  "evolutionary-stasis": dynamic(() => import("./evolutionary-stasis"), {
    ssr: false,
  }),
  extremophile: dynamic(() => import("./extremophile"), { ssr: false }),
  "frozen-accident": dynamic(() => import("./frozen-accident"), { ssr: false }),
  "genetic-toolkit": dynamic(() => import("./genetic-toolkit"), { ssr: false }),
  homeobox: dynamic(() => import("./homeobox"), { ssr: false }),
  homeosis: dynamic(() => import("./homeosis"), { ssr: false }),
  homoplasy: dynamic(() => import("./homoplasy"), { ssr: false }),
  "hox-genes": dynamic(() => import("./hox-genes"), { ssr: false }),
  pleiotropy: dynamic(() => import("./pleiotropy"), { ssr: false }),
  "reticulate-evolution": dynamic(() => import("./reticulate-evolution"), {
    ssr: false,
  }),
  "serial-homology": dynamic(() => import("./serial-homology"), { ssr: false }),
  "shadow-biosphere": dynamic(() => import("./shadow-biosphere"), {
    ssr: false,
  }),
  "xeno-nucleic-acid": dynamic(() => import("./xeno-nucleic-acid"), {
    ssr: false,
  }),
  chirality: dynamic(() => import("./chirality"), { ssr: false }),
  homochirality: dynamic(() => import("./homochirality"), { ssr: false }),

  // Phase 7 — Systematics, Phylogenetics & Philosophy of Science
  abduction: dynamic(() => import("./abduction"), { ssr: false }),
  apomorphy: dynamic(() => import("./apomorphy"), { ssr: false }),
  autapomorphy: dynamic(() => import("./autapomorphy"), { ssr: false }),
  clade: dynamic(() => import("./clade"), { ssr: false }),
  cladogram: dynamic(() => import("./cladogram"), { ssr: false }),
  "demarcation-problem": dynamic(() => import("./demarcation-problem"), {
    ssr: false,
  }),
  falsifiability: dynamic(() => import("./falsifiability"), { ssr: false }),
  "homologous-structures": dynamic(() => import("./homologous-structures"), {
    ssr: false,
  }),
  "inference-to-the-best-explanation": dynamic(
    () => import("./inference-to-the-best-explanation"),
    { ssr: false },
  ),
  "long-branch-attraction": dynamic(() => import("./long-branch-attraction"), {
    ssr: false,
  }),
  "maximum-parsimony": dynamic(() => import("./maximum-parsimony"), {
    ssr: false,
  }),
  "occams-razor": dynamic(() => import("./occams-razor"), { ssr: false }),
  outgroup: dynamic(() => import("./outgroup"), { ssr: false }),
  paraphyly: dynamic(() => import("./paraphyly"), { ssr: false }),
  phenetics: dynamic(() => import("./phenetics"), { ssr: false }),
  plesiomorphy: dynamic(() => import("./plesiomorphy"), { ssr: false }),
  polyphyly: dynamic(() => import("./polyphyly"), { ssr: false }),
  "positive-citation-bias": dynamic(() => import("./positive-citation-bias"), {
    ssr: false,
  }),
  speculation: dynamic(() => import("./speculation"), { ssr: false }),
  symplesiomorphy: dynamic(() => import("./symplesiomorphy"), { ssr: false }),
  synapomorphy: dynamic(() => import("./synapomorphy"), { ssr: false }),

  // Phase 8 — Biomechanics & Flight
  allometry: dynamic(() => import("./allometry"), { ssr: false }),
  "aspect-ratio": dynamic(() => import("./aspect-ratio"), { ssr: false }),
  biomechanics: dynamic(() => import("./biomechanics"), { ssr: false }),
  cursorial: dynamic(() => import("./cursorial"), { ssr: false }),
  "dynamic-soaring": dynamic(() => import("./dynamic-soaring"), { ssr: false }),
  ecomorph: dynamic(() => import("./ecomorph"), { ssr: false }),
  "froude-number": dynamic(() => import("./froude-number"), { ssr: false }),
  isometry: dynamic(() => import("./isometry"), { ssr: false }),
  "kleibers-law": dynamic(() => import("./kleibers-law"), { ssr: false }),
  "leading-edge-vortex": dynamic(() => import("./leading-edge-vortex"), {
    ssr: false,
  }),
  lift: dynamic(() => import("./lift"), { ssr: false }),
  "pneumatic-bone": dynamic(() => import("./pneumatic-bone"), { ssr: false }),
  "power-curve": dynamic(() => import("./power-curve"), { ssr: false }),
  "quadrupedal-launch": dynamic(() => import("./quadrupedal-launch"), {
    ssr: false,
  }),
  quetzalcoatlus: dynamic(() => import("./quetzalcoatlus"), { ssr: false }),
  "reynolds-number": dynamic(() => import("./reynolds-number"), { ssr: false }),
  "scaling-exponent": dynamic(() => import("./scaling-exponent"), {
    ssr: false,
  }),
  "square-cube-law": dynamic(() => import("./square-cube-law"), { ssr: false }),
  "thermal-soaring": dynamic(() => import("./thermal-soaring"), { ssr: false }),
  "wing-loading": dynamic(() => import("./wing-loading"), { ssr: false }),

  // Phase 9 — Sensory & Respiratory Biology
  aposematism: dynamic(() => import("./aposematism"), { ssr: false }),
  bioluminescence: dynamic(() => import("./bioluminescence"), { ssr: false }),
  chemiluminescence: dynamic(() => import("./chemiluminescence"), {
    ssr: false,
  }),
  "counter-illumination": dynamic(() => import("./counter-illumination"), {
    ssr: false,
  }),
  cryptochrome: dynamic(() => import("./cryptochrome"), { ssr: false }),
  "dead-space": dynamic(() => import("./dead-space"), { ssr: false }),
  echolocation: dynamic(() => import("./echolocation"), { ssr: false }),
  electroreception: dynamic(() => import("./electroreception"), { ssr: false }),
  "ficks-law": dynamic(() => import("./ficks-law"), { ssr: false }),
  fluorescence: dynamic(() => import("./fluorescence"), { ssr: false }),
  "gill-lamella": dynamic(() => import("./gill-lamella"), { ssr: false }),
  "green-fluorescent-protein": dynamic(() => import("./green-fluorescent-protein"), { ssr: false }),
  "histotoxic-hypoxia": dynamic(() => import("./histotoxic-hypoxia"), {
    ssr: false,
  }),
  hypercapnia: dynamic(() => import("./hypercapnia"), { ssr: false }),
  "lateral-line": dynamic(() => import("./lateral-line"), { ssr: false }),
  luciferin: dynamic(() => import("./luciferin"), { ssr: false }),
  luciferase: dynamic(() => import("./luciferase"), { ssr: false }),
  magnetite: dynamic(() => import("./magnetite"), { ssr: false }),
  magnetoreception: dynamic(() => import("./magnetoreception"), { ssr: false }),
  magnetosome: dynamic(() => import("./magnetosome"), { ssr: false }),
  "nerve-conduction-velocity": dynamic(() => import("./nerve-conduction-velocity"), { ssr: false }),
  operculum: dynamic(() => import("./operculum"), { ssr: false }),
  photophore: dynamic(() => import("./photophore"), { ssr: false }),
  proprioception: dynamic(() => import("./proprioception"), { ssr: false }),
  "quantum-yield": dynamic(() => import("./quantum-yield"), { ssr: false }),
  "radical-pair": dynamic(() => import("./radical-pair"), { ssr: false }),
  "ram-ventilation": dynamic(() => import("./ram-ventilation"), { ssr: false }),
  spiracle: dynamic(() => import("./spiracle"), { ssr: false }),
  "tapetum-lucidum": dynamic(() => import("./tapetum-lucidum"), { ssr: false }),
  "tidal-ventilation": dynamic(() => import("./tidal-ventilation"), {
    ssr: false,
  }),
  "unidirectional-airflow": dynamic(() => import("./unidirectional-airflow"), {
    ssr: false,
  }),
  umwelt: dynamic(() => import("./umwelt"), { ssr: false }),
  "cross-current-exchange": dynamic(() => import("./cross-current-exchange"), {
    ssr: false,
  }),
  "countercurrent-exchange": dynamic(() => import("./countercurrent-exchange"), { ssr: false }),
  // Phase 10 — Ecology
  "biological-market": dynamic(() => import("./biological-market"), {
    ssr: false,
  }),
  "carrying-capacity": dynamic(() => import("./carrying-capacity"), {
    ssr: false,
  }),
  "competitive-exclusion-principle": dynamic(() => import("./competitive-exclusion-principle"), {
    ssr: false,
  }),
  "density-dependence": dynamic(() => import("./density-dependence"), {
    ssr: false,
  }),
  "ecological-niche": dynamic(() => import("./ecological-niche"), {
    ssr: false,
  }),
  "ecological-resilience": dynamic(() => import("./ecological-resilience"), {
    ssr: false,
  }),
  "functional-response": dynamic(() => import("./functional-response"), {
    ssr: false,
  }),
  "fundamental-niche": dynamic(() => import("./fundamental-niche"), {
    ssr: false,
  }),
  "insurance-hypothesis": dynamic(() => import("./insurance-hypothesis"), {
    ssr: false,
  }),
  "keystone-species": dynamic(() => import("./keystone-species"), {
    ssr: false,
  }),
  "landscape-of-fear": dynamic(() => import("./landscape-of-fear"), {
    ssr: false,
  }),
  "life-dinner-principle": dynamic(() => import("./life-dinner-principle"), {
    ssr: false,
  }),
  "lotka-volterra-equations": dynamic(() => import("./lotka-volterra-equations"), { ssr: false }),
  mutualism: dynamic(() => import("./mutualism"), { ssr: false }),
  "niche-partitioning": dynamic(() => import("./niche-partitioning"), {
    ssr: false,
  }),
  "optimal-foraging-theory": dynamic(() => import("./optimal-foraging-theory"), { ssr: false }),
  "paradox-of-enrichment": dynamic(() => import("./paradox-of-enrichment"), {
    ssr: false,
  }),
  "prey-switching": dynamic(() => import("./prey-switching"), { ssr: false }),
  "quorum-sensing": dynamic(() => import("./quorum-sensing"), { ssr: false }),
  "realized-niche": dynamic(() => import("./realized-niche"), { ssr: false }),
  "source-sink-dynamics": dynamic(() => import("./source-sink-dynamics"), {
    ssr: false,
  }),
  "planetary-boundaries": dynamic(() => import("./planetary-boundaries"), {
    ssr: false,
  }),
  // Phase 11 — Plant & Forest
  "arbuscular-mycorrhiza": dynamic(() => import("./arbuscular-mycorrhiza"), {
    ssr: false,
  }),
  biome: dynamic(() => import("./biome"), { ssr: false }),
  canopy: dynamic(() => import("./canopy"), { ssr: false }),
  "cohesion-tension": dynamic(() => import("./cohesion-tension"), {
    ssr: false,
  }),
  "common-mycorrhizal-network": dynamic(() => import("./common-mycorrhizal-network"), {
    ssr: false,
  }),
  "cytoplasmic-streaming": dynamic(() => import("./cytoplasmic-streaming"), {
    ssr: false,
  }),
  ectomycorrhiza: dynamic(() => import("./ectomycorrhiza"), { ssr: false }),
  "emergent-layer": dynamic(() => import("./emergent-layer"), { ssr: false }),
  epiphyte: dynamic(() => import("./epiphyte"), { ssr: false }),
  "foliage-height-diversity": dynamic(() => import("./foliage-height-diversity"), { ssr: false }),
  "forest-floor": dynamic(() => import("./forest-floor"), { ssr: false }),
  "forest-stratification": dynamic(() => import("./forest-stratification"), {
    ssr: false,
  }),
  hypha: dynamic(() => import("./hypha"), { ssr: false }),
  "leaf-area-index": dynamic(() => import("./leaf-area-index"), {
    ssr: false,
  }),
  "mother-tree-hypothesis": dynamic(() => import("./mother-tree-hypothesis"), {
    ssr: false,
  }),
  mycelium: dynamic(() => import("./mycelium"), { ssr: false }),
  mycorrhiza: dynamic(() => import("./mycorrhiza"), { ssr: false }),
  "seed-bank": dynamic(() => import("./seed-bank"), { ssr: false }),
  transpiration: dynamic(() => import("./transpiration"), { ssr: false }),
  "turgor-pressure": dynamic(() => import("./turgor-pressure"), {
    ssr: false,
  }),
  understory: dynamic(() => import("./understory"), { ssr: false }),
  xylem: dynamic(() => import("./xylem"), { ssr: false }),
  // Phase 12 — Network & Complexity
  "articulation-point": dynamic(() => import("./articulation-point"), {
    ssr: false,
  }),
  "cascading-failure": dynamic(() => import("./cascading-failure"), {
    ssr: false,
  }),
  "degree-distribution": dynamic(() => import("./degree-distribution"), {
    ssr: false,
  }),
  "degree-graph-theory": dynamic(() => import("./degree-graph-theory"), {
    ssr: false,
  }),
  "edge-graph-theory": dynamic(() => import("./edge-graph-theory"), {
    ssr: false,
  }),
  emergence: dynamic(() => import("./emergence"), { ssr: false }),
  "error-correcting-code": dynamic(() => import("./error-correcting-code"), {
    ssr: false,
  }),
  "giant-connected-component": dynamic(() => import("./giant-connected-component"), { ssr: false }),
  "hub-network": dynamic(() => import("./hub-network"), { ssr: false }),
  "interdependent-networks": dynamic(() => import("./interdependent-networks"), { ssr: false }),
  "modularity-network": dynamic(() => import("./modularity-network"), {
    ssr: false,
  }),
  "node-graph-theory": dynamic(() => import("./node-graph-theory"), {
    ssr: false,
  }),
  "percolation-theory": dynamic(() => import("./percolation-theory"), {
    ssr: false,
  }),
  "percolation-threshold": dynamic(() => import("./percolation-threshold"), {
    ssr: false,
  }),
  "phase-transition": dynamic(() => import("./phase-transition"), {
    ssr: false,
  }),
  queue: dynamic(() => import("./queue"), { ssr: false }),
  redundancy: dynamic(() => import("./redundancy"), { ssr: false }),
  "redundancy-engineering": dynamic(() => import("./redundancy-engineering"), { ssr: false }),
  "scale-free-network": dynamic(() => import("./scale-free-network"), {
    ssr: false,
  }),
  stigmergy: dynamic(() => import("./stigmergy"), { ssr: false }),
  superorganism: dynamic(() => import("./superorganism"), { ssr: false }),
  "swarm-intelligence": dynamic(() => import("./swarm-intelligence"), {
    ssr: false,
  }),
  connectome: dynamic(() => import("./connectome"), { ssr: false }),
  // Phase 13 — Mind & Information
  bandwidth: dynamic(() => import("./bandwidth"), { ssr: false }),
  "basal-cognition": dynamic(() => import("./basal-cognition"), { ssr: false }),
  bit: dynamic(() => import("./bit"), { ssr: false }),
  "channel-capacity": dynamic(() => import("./channel-capacity"), {
    ssr: false,
  }),
  "cognitive-light-cone": dynamic(() => import("./cognitive-light-cone"), {
    ssr: false,
  }),
  "conscious-bottleneck": dynamic(() => import("./conscious-bottleneck"), {
    ssr: false,
  }),
  "distributed-cognition": dynamic(() => import("./distributed-cognition"), {
    ssr: false,
  }),
  "global-workspace-theory": dynamic(() => import("./global-workspace-theory"), { ssr: false }),
  "hard-problem-of-consciousness": dynamic(() => import("./hard-problem-of-consciousness"), {
    ssr: false,
  }),
  "information-theory": dynamic(() => import("./information-theory"), {
    ssr: false,
  }),
  "integrated-information-theory": dynamic(() => import("./integrated-information-theory"), {
    ssr: false,
  }),
  "noisy-channel-coding-theorem": dynamic(() => import("./noisy-channel-coding-theorem"), {
    ssr: false,
  }),
  "shannon-entropy": dynamic(() => import("./shannon-entropy"), {
    ssr: false,
  }),
  "signal-to-noise-ratio": dynamic(() => import("./signal-to-noise-ratio"), {
    ssr: false,
  }),
  functionalism: dynamic(() => import("./functionalism"), { ssr: false }),
  panpsychism: dynamic(() => import("./panpsychism"), { ssr: false }),
  teleology: dynamic(() => import("./teleology"), { ssr: false }),
  // Phase 14 — Canon
  eywa: dynamic(() => import("./eywa"), { ssr: false }),
  tsaheylu: dynamic(() => import("./tsaheylu"), { ssr: false }),
  unobtanium: dynamic(() => import("./unobtanium"), { ssr: false }),
  prolemuris: dynamic(() => import("./prolemuris"), { ssr: false }),
  // Phase 15 — Chronobiology
  "circadian-rhythm": dynamic(() => import("./circadian-rhythm"), {
    ssr: false,
  }),
  "free-running-period": dynamic(() => import("./free-running-period"), {
    ssr: false,
  }),
  zeitgeber: dynamic(() => import("./zeitgeber"), { ssr: false }),
  entrainment: dynamic(() => import("./entrainment"), { ssr: false }),
  "phase-response-curve": dynamic(() => import("./phase-response-curve"), {
    ssr: false,
  }),
  "range-of-entrainment": dynamic(() => import("./range-of-entrainment"), {
    ssr: false,
  }),
  masking: dynamic(() => import("./masking"), { ssr: false }),
  "suprachiasmatic-nucleus": dynamic(() => import("./suprachiasmatic-nucleus"), { ssr: false }),
  melatonin: dynamic(() => import("./melatonin"), { ssr: false }),
  melanopsin: dynamic(() => import("./melanopsin"), { ssr: false }),
  "temporal-niche-partitioning": dynamic(() => import("./temporal-niche-partitioning"), {
    ssr: false,
  }),
  "nocturnal-bottleneck": dynamic(() => import("./nocturnal-bottleneck"), {
    ssr: false,
  }),
  "circalunar-clock": dynamic(() => import("./circalunar-clock"), {
    ssr: false,
  }),
  "artificial-light-at-night": dynamic(() => import("./artificial-light-at-night"), { ssr: false }),
  "forced-desynchrony": dynamic(() => import("./forced-desynchrony"), {
    ssr: false,
  }),

  // Structural keystone loss — foundation species, engineers, and what time builds
  "foundation-species": dynamic(() => import("./foundation-species"), {
    ssr: false,
  }),
  "ecosystem-engineer": dynamic(() => import("./ecosystem-engineer"), {
    ssr: false,
  }),
  "autogenic-engineer": dynamic(() => import("./autogenic-engineer"), {
    ssr: false,
  }),
  "keystone-structure": dynamic(() => import("./keystone-structure"), {
    ssr: false,
  }),
  "dominant-species": dynamic(() => import("./dominant-species"), {
    ssr: false,
  }),
  "canopy-soil": dynamic(() => import("./canopy-soil"), { ssr: false }),
  "tree-hollow": dynamic(() => import("./tree-hollow"), { ssr: false }),
  "co-extinction": dynamic(() => import("./co-extinction"), { ssr: false }),
  "extinction-debt": dynamic(() => import("./extinction-debt"), { ssr: false }),
  "functional-extinction": dynamic(() => import("./functional-extinction"), {
    ssr: false,
  }),
  "biological-legacy": dynamic(() => import("./biological-legacy"), {
    ssr: false,
  }),
  "nurse-log": dynamic(() => import("./nurse-log"), { ssr: false }),
  "alternative-stable-state": dynamic(() => import("./alternative-stable-state"), { ssr: false }),
  "cultural-keystone-species": dynamic(() => import("./cultural-keystone-species"), { ssr: false }),
  // Pandora's smallest things — soil, microbes, and coevolution
  "soil-aggregate": dynamic(() => import("./soil-aggregate"), { ssr: false }),
  decomposition: dynamic(() => import("./decomposition"), { ssr: false }),
  rhizosphere: dynamic(() => import("./rhizosphere"), { ssr: false }),
  microbiome: dynamic(() => import("./microbiome"), { ssr: false }),
  pathogen: dynamic(() => import("./pathogen"), { ssr: false }),
  "negative-frequency-dependent-selection": dynamic(
    () => import("./negative-frequency-dependent-selection"),
    { ssr: false },
  ),
  "red-queen-hypothesis": dynamic(() => import("./red-queen-hypothesis"), {
    ssr: false,
  }),
  "planetary-protection": dynamic(() => import("./planetary-protection"), {
    ssr: false,
  }),
  // Cetacean cognition and cultural transmission
  "animal-culture": dynamic(() => import("./animal-culture"), { ssr: false }),
  "social-learning": dynamic(() => import("./social-learning"), { ssr: false }),
  "network-based-diffusion-analysis": dynamic(
    () => import("./network-based-diffusion-analysis"),
    { ssr: false },
  ),
};

interface GlossaryVisualizerProps {
  term: string;
}

export function GlossaryVisualizer({ term }: GlossaryVisualizerProps) {
  const Visualizer = GLOSSARY_VISUALIZATIONS[term as GlossaryVisualizationId];
  if (!Visualizer) return null;
  return <Visualizer />;
}
