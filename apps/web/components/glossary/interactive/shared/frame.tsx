"use client";

import { GlassPanel } from "@/components/codex/glass-panel";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Pause, Play, RotateCcw } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface GlossaryFrameProps {
  children: React.ReactNode;
  title?: string;
  infoText?: string;
  onReset?: () => void;
  onPlayPause?: () => void;
  isPlaying?: boolean;
  aspectRatio?: "16/9" | "16/10" | "square" | string;
  className?: string;
}

export function GlossaryFrame({
  children,
  title,
  infoText,
  onReset,
  onPlayPause,
  isPlaying,
  aspectRatio = "aspect-[16/10]",
  className,
}: GlossaryFrameProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <GlassPanel
        depth={2}
        className={cn(
          "w-full overflow-hidden flex flex-col items-center justify-center bg-surface/30 border-border/40",
          aspectRatio === "16/9" && "aspect-[16/9]",
          aspectRatio === "16/10" && "aspect-[16/10]",
          aspectRatio === "square" && "aspect-square",
          aspectRatio !== "16/9" &&
            aspectRatio !== "16/10" &&
            aspectRatio !== "square" &&
            aspectRatio,
          className,
        )}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="relative size-10">
            <div className="absolute inset-0 rounded-full border-2 border-cyan/20" />
            <div className="absolute inset-0 rounded-full border-2 border-cyan border-t-transparent animate-spin" />
          </div>
          <span className="text-xs font-mono text-muted tracking-wider uppercase animate-pulse">
            Loading visualizer...
          </span>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel
      depth={2}
      className={cn(
        "relative w-full overflow-hidden group flex flex-col bg-surface/25 border-border/50",
        aspectRatio === "16/9" && "aspect-[16/9]",
        aspectRatio === "16/10" && "aspect-[16/10]",
        aspectRatio === "square" && "aspect-square",
        aspectRatio !== "16/9" &&
          aspectRatio !== "16/10" &&
          aspectRatio !== "square" &&
          aspectRatio,
        className,
      )}
    >
      {/* Interactive content wrapper with touch-action: none to prevent page scrolling on mobile swipe */}
      <div className="relative w-full h-full select-none touch-none overflow-hidden">
        {children}
      </div>

      {/* Floating Header details (title, controls, info toggle) */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none flex justify-between items-start z-20">
        {title ? (
          <div className="bg-void/75 backdrop-blur-md border border-border/40 px-3 py-1.5 rounded-lg pointer-events-auto">
            <h4 className="text-xs font-mono font-semibold tracking-wide text-foreground uppercase">
              {title}
            </h4>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Optional Play/Pause Controls */}
          {onPlayPause && isPlaying !== undefined && (
            <button
              type="button"
              onClick={onPlayPause}
              className="bg-void/75 hover:bg-void border border-border/40 hover:border-cyan/50 p-2 rounded-lg text-muted hover:text-cyan transition-colors cursor-pointer"
              aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          )}

          {/* Optional Reset Control */}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="bg-void/75 hover:bg-void border border-border/40 hover:border-cyan/50 p-2 rounded-lg text-muted hover:text-cyan transition-colors cursor-pointer"
              aria-label="Reset simulation"
            >
              <RotateCcw size={14} />
            </button>
          )}

          {/* Info toggle */}
          {infoText && (
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className={cn(
                "bg-void/75 hover:bg-void border border-border/40 p-2 rounded-lg transition-colors cursor-pointer",
                showInfo
                  ? "border-cyan text-cyan"
                  : "hover:border-cyan/50 text-muted hover:text-cyan",
              )}
              aria-label="Toggle information overlay"
            >
              <Info size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Info panel overlay */}
      <AnimatePresence>
        {showInfo && infoText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-4 bottom-4 p-4 bg-void/90 backdrop-blur-md border border-border/60 rounded-xl z-20 pointer-events-auto max-h-[60%] overflow-y-auto"
          >
            <h5 className="text-xs font-mono font-bold tracking-wider text-cyan uppercase mb-1.5">
              Concept Details
            </h5>
            <p className="text-xs text-muted leading-relaxed font-sans">{infoText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bioluminescent edge shadow/glow */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan/25 to-transparent pointer-events-none" />
    </GlassPanel>
  );
}
