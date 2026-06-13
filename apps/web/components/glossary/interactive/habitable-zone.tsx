"use client";

import React from "react";
import { GlossaryFrame } from "./shared/frame";

interface HabitableZoneProps {
  locale: string;
}

export default function HabitableZone({ locale }: HabitableZoneProps) {
  const infoText =
    locale === "vi"
      ? "Mô tả trực quan chi tiết cho thuật ngữ habitable-zone."
      : "Detailed interactive visualization for habitable-zone.";

  return (
    <GlossaryFrame
      title={locale === "vi" ? "habitable-zone" : "habitable-zone"}
      infoText={infoText}
      onReset={() => console.log("Reset habitable-zone")}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex items-center justify-center p-6 bg-void/40">
        <div className="text-center">
          <p className="text-sm font-mono text-cyan animate-pulse uppercase tracking-wider mb-2">
            habitable-zone visualizer stub
          </p>
          <p className="text-xs text-muted">
            Customize this Tailor-Made (MAY ĐO) component in{" "}
            <code>components/glossary/interactive/habitable-zone.tsx</code>
          </p>
        </div>
      </div>
    </GlossaryFrame>
  );
}
