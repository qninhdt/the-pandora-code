"use client";

import React from "react";
import { GlossaryFrame } from "./shared/frame";

interface ExomoonProps {
  locale: string;
}

export default function Exomoon({ locale }: ExomoonProps) {
  const infoText =
    locale === "vi"
      ? "Mô tả trực quan chi tiết cho thuật ngữ exomoon."
      : "Detailed interactive visualization for exomoon.";

  return (
    <GlossaryFrame
      title={locale === "vi" ? "exomoon" : "exomoon"}
      infoText={infoText}
      onReset={() => console.log("Reset exomoon")}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex items-center justify-center p-6 bg-void/40">
        <div className="text-center">
          <p className="text-sm font-mono text-cyan animate-pulse uppercase tracking-wider mb-2">
            exomoon visualizer stub
          </p>
          <p className="text-xs text-muted">
            Customize this Tailor-Made (MAY ĐO) component in{" "}
            <code>components/glossary/interactive/exomoon.tsx</code>
          </p>
        </div>
      </div>
    </GlossaryFrame>
  );
}
