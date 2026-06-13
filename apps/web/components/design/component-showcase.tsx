"use client";

import { AnatomyPlate } from "@/components/content/anatomy-plate";
import { AtmosphereComparison } from "@/components/content/atmosphere-comparison";
import { BilateralLatticeTree } from "@/components/content/bilateral-lattice-tree";
import { BreathingModeToggle } from "@/components/content/breathing-mode-toggle";
import { Callout, ScientificNote, SideNote } from "@/components/content/callout";
import { CharacterMatrixCladogram } from "@/components/content/character-matrix-cladogram";
import { Chart } from "@/components/content/chart";
import { CirculationBands } from "@/components/content/circulation-bands";
import { ColdLightReaction } from "@/components/content/cold-light-reaction";
import { Comparison } from "@/components/content/comparison";
import { ConfidenceDial } from "@/components/content/confidence-dial";
import { ConfidenceMeter } from "@/components/content/confidence-meter";
import { ConvergenceToggle } from "@/components/content/convergence-toggle";
import { CountercurrentExchange } from "@/components/content/countercurrent-exchange";
import { DataComparison } from "@/components/content/data-comparison";
import { DetectionMethodScope } from "@/components/content/detection-method-scope";
import { DiagramFigure } from "@/components/content/diagram-figure";
import { EclipseDayClock } from "@/components/content/eclipse-day-clock";
import { Figure } from "@/components/content/figure";
import { FigureGrid } from "@/components/content/figure-grid";

import { FroudeGaitDial } from "@/components/content/froude-gait-dial";
import { GlowBiogeographyToggle } from "@/components/content/glow-biogeography-toggle";
import { GlowOriginsTree } from "@/components/content/glow-origins-tree";
import { HabitableZoneExplorer } from "@/components/content/habitable-zone-explorer";
import { HalfLifeDecay } from "@/components/content/half-life-decay";
import { HoxColinearityMap } from "@/components/content/hox-colinearity-map";
import { IsochronPlot } from "@/components/content/isochron-plot";
import { LimbFieldToggle } from "@/components/content/limb-field-toggle";
import { LongBranchAttractionDemo } from "@/components/content/long-branch-attraction-demo";
import { NichePartitionExplorer } from "@/components/content/niche-partition-explorer";
import { OpenQuestions } from "@/components/content/open-questions";
import { PhotophoreIntensity } from "@/components/content/photophore-intensity";
import { Quote } from "@/components/content/quote";
import { ReplayTheTape } from "@/components/content/replay-the-tape";
import { ScrollSequence } from "@/components/content/scroll-sequence";
import { SuperconductorCooldown } from "@/components/content/superconductor-cooldown";
import { Timeline } from "@/components/content/timeline";
import { TimelineJourney } from "@/components/content/timeline-journey";
import { TwentySecondsTimeline } from "@/components/content/twenty-seconds-timeline";
import { WhatThisMeans } from "@/components/content/what-this-means";
import { WhittakerBiomeExplorer } from "@/components/content/whittaker-biome-explorer";
import { FieldViz } from "@/components/three/field-viz";
import { FieldVizFallback } from "@/components/three/field-viz-fallback";
import { FloatingMountainFallback } from "@/components/three/floating-mountain-fallback";
import { FloatingMountainScene } from "@/components/three/floating-mountain-scene";
import { OrbitClockFallback } from "@/components/three/orbit-clock-fallback";
import { OrbitClockScene } from "@/components/three/orbit-clock-scene";
import { Scene3D } from "@/components/three/scene-3d";

const POSTER = "/images/atmosphere/pandora-establishing.png";

const resistanceData = [
  { t: "0", r: 0 },
  { t: "20", r: 0 },
  { t: "40", r: 2 },
  { t: "60", r: 18 },
  { t: "80", r: 45 },
  { t: "100", r: 72 },
];

const classification = {
  canon_pct: 30,
  inference_pct: 25,
  speculation_pct: 15,
  real_science_pct: 30,
};

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-subtle">{label}</p>
      {children}
    </div>
  );
}

// Live gallery of every Phase-4 content + 3D component for visual QA on /design.
export function ComponentShowcase() {
  return (
    <div className="space-y-10">
      <Block label="Scene3D - FloatingMountainScene (3D / 2D fallback)">
        <Scene3D
          className="relative h-72 overflow-hidden rounded-2xl border border-border"
          fallback={<FloatingMountainFallback />}
          camera={{ position: [0, 0, 6], fov: 50 }}
        >
          <FloatingMountainScene />
        </Scene3D>
      </Block>

      <Block label="Scene3D - FieldViz (magnetic flux)">
        <Scene3D
          className="relative h-64 overflow-hidden rounded-2xl border border-border"
          fallback={<FieldVizFallback />}
          camera={{ position: [0, 0, 7], fov: 50 }}
        >
          <FieldViz />
        </Scene3D>
      </Block>

      <Block label="Scene3D - OrbitClock (tidal-lock day = orbit)">
        <Scene3D
          className="relative h-72 overflow-hidden rounded-2xl border border-border"
          fallback={<OrbitClockFallback />}
          camera={{ position: [0, 3.4, 6.2], fov: 50 }}
        >
          <OrbitClockScene />
        </Scene3D>
      </Block>

      <Block label="Chart - line (Recharts, themed)">
        <Chart
          kind="line"
          data={resistanceData}
          xKey="t"
          xLabel="Temperature (K)"
          yLabel="Resistance (ohms)"
          series={[{ key: "r", label: "Resistance (ohms)", tone: "cyan" }]}
          caption="Điện trở theo nhiệt độ - siêu dẫn về 0 dưới ngưỡng tới hạn."
        />
      </Block>

      <Block label="Chart - bar">
        <Chart
          kind="bar"
          data={resistanceData}
          xKey="t"
          xLabel="Temperature (K)"
          yLabel="Resistance (ohms)"
          series={[{ key: "r", label: "Resistance (ohms)", tone: "teal" }]}
        />
      </Block>

      <Block label="Figure (bilingual caption)">
        <Figure
          src={POSTER}
          figNo="01"
          tier="speculation"
          locale="vi"
          caption={{
            vi: "Thung lũng phát quang sinh học của Pandora về đêm.",
            en: "A bioluminescent Pandoran valley at night.",
          }}
        />
      </Block>

      <Block label="FigureGrid">
        <FigureGrid
          locale="vi"
          items={[
            { src: POSTER, caption: "Tầng tán rừng" },
            {
              src: "/images/chapters/where-is-pandora/fig-01-eclipse-overhead.webp",
              caption: "Bào tử trôi",
            },
          ]}
        />
      </Block>

      <Block label="AnatomyPlate (hotspots, bilingual)">
        <AnatomyPlate
          src={POSTER}
          title="Cấu tạo núi bay"
          locale="vi"
          hotspots={[
            {
              x: 30,
              y: 38,
              label: { vi: "Mạch unobtanium", en: "Unobtanium vein" },
              note: {
                vi: "Vùng siêu dẫn tạo lực nâng.",
                en: "Superconducting lift zone.",
              },
            },
            {
              x: 64,
              y: 60,
              label: { vi: "Rễ phát quang", en: "Glowing roots" },
            },
          ]}
        />
      </Block>

      <Block label="DiagramFigure (labeled)">
        <DiagramFigure
          src={POSTER}
          caption="Hiệu ứng Meissner đẩy từ trường ra khỏi vật siêu dẫn."
          labels={[
            { x: 28, y: 40, text: "Từ trường bị đẩy" },
            { x: 66, y: 58, text: "Lõi siêu dẫn" },
          ]}
        />
      </Block>

      <Block label="DataComparison / StatGrid">
        <DataComparison
          stats={[
            {
              label: "Trọng lực",
              value: "0.8 g",
              vs: "Trái Đất 1 g",
              tone: "cyan",
            },
            { label: "O₂ khí quyển", value: "18%", vs: "21%", tone: "teal" },
            { label: "Ngày", value: "26 h", tone: "amber" },
          ]}
        />
      </Block>

      <Block label="AtmosphereComparison (partial pressure)">
        <AtmosphereComparison
          earth={{ label: "Trái Đất — mực biển", totalKpa: 101, o2Pct: 21, co2Pct: 0.04 }}
          pandora={{ label: "Pandora — bề mặt", totalKpa: 90, o2Pct: 23, co2Pct: 17 }}
        />
      </Block>

      <Block label="TwentySecondsTimeline (histotoxic hypoxia scrubber)">
        <TwentySecondsTimeline />
      </Block>

      <Block label="CirculationBands (Hadley cell → biome bands)">
        <CirculationBands />
      </Block>

      <Block label="WhittakerBiomeExplorer (temperature × rainfall biomes)">
        <WhittakerBiomeExplorer />
      </Block>

      <Block label="HalfLifeDecay (radioactive decay grid)">
        <HalfLifeDecay />
      </Block>

      <Block label="SuperconductorCooldown (Tc transition + levitation)">
        <SuperconductorCooldown />
      </Block>

      <Block label="ConfidenceDial (IPCC calibrated likelihood)">
        <ConfidenceDial />
      </Block>

      <Block label="HabitableZoneExplorer (interactive habitable zone)">
        <HabitableZoneExplorer />
      </Block>

      <Block label="DetectionMethodScope (exoplanet detection tabs)">
        <DetectionMethodScope />
      </Block>

      <Block label="EclipseDayClock (tidal-lock sky clock)">
        <EclipseDayClock />
      </Block>

      <Block label="ConfidenceMeter">
        <ConfidenceMeter classification={classification} />
      </Block>

      <Block label="Comparison">
        <Comparison
          left={{
            title: "Pandora",
            children: "Núi bay nhờ siêu dẫn unobtanium trong từ trường mạnh.",
          }}
          right={{
            title: "Trái Đất",
            children: "Tàu maglev nâng nhờ cùng nguyên lý nghịch từ.",
          }}
        />
      </Block>

      <Block label="Callout variants">
        <Callout variant="note" title="Ghi chú">
          Một khối nhấn mạnh nội tuyến.
        </Callout>
        <ScientificNote title="Khoa học">Hiệu ứng nghịch từ hoàn hảo.</ScientificNote>
        <Callout variant="insight" title="Insight">
          Mồi nhử Pandora dẫn tới bài học thật.
        </Callout>
        <SideNote>Ghi chú bên lề.</SideNote>
      </Block>

      <Block label="Quote">
        <Quote cite="Bardabez">
          Pandora không phải đích đến - nó là tấm gương soi chính khoa học của ta.
        </Quote>
      </Block>

      <Block label="WhatThisMeans">
        <WhatThisMeans>Núi bay là cách kể trực quan về siêu dẫn và bẫy từ thông.</WhatThisMeans>
      </Block>

      <Block label="ScrollSequence">
        <ScrollSequence
          steps={[
            {
              title: "Làm lạnh dưới ngưỡng",
              body: "Unobtanium trở thành siêu dẫn loại II.",
            },
            {
              title: "Bẫy từ thông",
              body: "Từ trường bị ghim, khóa vị trí khối đá.",
            },
            {
              title: "Lơ lửng ổn định",
              body: "Núi treo cố định chứ không chỉ nổi.",
            },
          ]}
        />
      </Block>

      <Block label="Timeline">
        <Timeline
          events={[
            { id: "1", date: "Part I", title: "Thế giới", kind: "canon" },
            {
              id: "2",
              date: "1.5",
              title: "Núi bay & siêu dẫn",
              kind: "real_science",
            },
          ]}
        />
      </Block>

      <Block label="OpenQuestions">
        <OpenQuestions
          title="Câu hỏi mở"
          items={[
            {
              question: "Unobtanium siêu dẫn ở nhiệt độ phòng bằng cơ chế nào?",
              answer:
                "Canon không nói rõ; siêu dẫn ở nhiệt độ phòng vẫn là điều khoa học Trái Đất chưa đạt được.",
            },
            {
              question: "Từ trường Pandora đủ mạnh để nâng cả ngọn núi không?",
            },
          ]}
        />
      </Block>


      <Block label="FroudeGaitDial (gait regime gauge)">
        <FroudeGaitDial />
      </Block>

      <Block label="BreathingModeToggle (tidal vs unidirectional)">
        <BreathingModeToggle />
      </Block>

      <Block label="CountercurrentExchange (opposed-flow heat/gas)">
        <CountercurrentExchange />
      </Block>

      <Block label="PhotophoreIntensity (arousal → glow)">
        <PhotophoreIntensity />
      </Block>

      <Block label="ColdLightReaction (bioluminescence steps)">
        <ColdLightReaction />
      </Block>

      <Block label="GlowOriginsTree (lineage origins)">
        <GlowOriginsTree />
      </Block>

      <Block label="GlowBiogeographyToggle (glow distribution)">
        <GlowBiogeographyToggle />
      </Block>

      <Block label="BilateralLatticeTree (hexapod radiation)">
        <BilateralLatticeTree />
      </Block>

      <Block label="CharacterMatrixCladogram (parsimony vs phenetic)">
        <CharacterMatrixCladogram />
      </Block>

      <Block label="LongBranchAttractionDemo (phylogenetic artifact)">
        <LongBranchAttractionDemo />
      </Block>

      <Block label="HoxColinearityMap (gene colinearity)">
        <HoxColinearityMap />
      </Block>

      <Block label="LimbFieldToggle (skeleton vs innervation)">
        <LimbFieldToggle />
      </Block>

      <Block label="ConvergenceToggle (role vs tells)">
        <ConvergenceToggle />
      </Block>

      <Block label="ReplayTheTape (contingent convergence)">
        <ReplayTheTape />
      </Block>

      <Block label="NichePartitionExplorer (canopy strata)">
        <NichePartitionExplorer />
      </Block>

      <Block label="IsochronPlot (radiometric dating sweep)">
        <IsochronPlot />
      </Block>


      <Block label="TimelineJourney (cinematic vertical journey)">
        <TimelineJourney
          locale="vi"
          events={[
            {
              id: "1",
              date: "Phần I",
              title: "Thế giới Pandora",
              description: "Khung cảnh và vật lý nền của mặt trăng.",
              kind: "canon",
            },
            {
              id: "2",
              date: "Phần II",
              title: "Sự sống phát quang",
              description: "Hệ sinh thái rực sáng về đêm.",
              kind: "inference",
            },
            {
              id: "3",
              date: "Phần III",
              title: "Núi bay & siêu dẫn",
              description: "Cơ chế nâng từ tính của unobtanium.",
              kind: "real_science",
            },
          ]}
        />
      </Block>
    </div>
  );
}
