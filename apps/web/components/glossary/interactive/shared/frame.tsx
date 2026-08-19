"use client";

import { GlassPanel } from "@/components/codex/glass-panel";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ControlButton } from "./control-button";

interface GlossaryFrameProps {
  children: React.ReactNode;
  title?: string;
  // Small cyan chip beside the title, e.g. the science domain ("Astrophysics").
  category?: string;
  infoText?: string;
  // Extended info-sheet content, rendered below the one-line infoText.
  infoExtra?: React.ReactNode;
  onReset?: () => void;
  onPlayPause?: () => void;
  isPlaying?: boolean;
  // Optional discrete stepping (e.g. walk an animation frame-by-frame).
  onStepBack?: () => void;
  onStepForward?: () => void;
  // Thin bottom strip for a live readout / equation / current-step label.
  caption?: React.ReactNode;
  // Allow the figure to fill the screen. Defaults on; opt out for tiny figures.
  allowFullscreen?: boolean;
  aspectRatio?: "16/9" | "16/10" | "square" | string;
  className?: string;
}

function aspectClass(aspectRatio: string): string {
  if (aspectRatio === "16/9") return "aspect-[16/9]";
  if (aspectRatio === "16/10") return "aspect-[16/10]";
  if (aspectRatio === "square") return "aspect-square";
  return aspectRatio;
}

export function GlossaryFrame({
  children,
  title,
  category,
  infoText,
  infoExtra,
  onReset,
  onPlayPause,
  isPlaying,
  onStepBack,
  onStepForward,
  caption,
  allowFullscreen = true,
  aspectRatio = "16/10",
  className,
}: GlossaryFrameProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track real fullscreen state so the toggle icon stays in sync with Esc, etc.
  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.();
    }
  }, []);

  const ratio = aspectClass(aspectRatio);

  if (!isMounted) {
    return (
      <GlassPanel
        depth={2}
        className={cn(
          "flex w-full flex-col items-center justify-center overflow-hidden border-border/40 bg-surface/30",
          ratio,
          className,
        )}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="relative size-10">
            <div className="absolute inset-0 rounded-full border-2 border-cyan/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
          </div>
          <span className="animate-pulse font-mono text-xs uppercase tracking-wider text-muted">
            Loading visualizer
          </span>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel
      ref={containerRef}
      depth={2}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden border-border/50 bg-surface/25",
        isFullscreen ? "h-screen rounded-none" : ratio,
        className,
      )}
    >
      {/* Animated bioluminescent top edge — cyan→teal sweep on mount. */}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px origin-left"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--cyan), var(--teal), transparent)",
          }}
        />
      )}

      {/* Figure content. touch-none stops the page from scrolling on swipe. */}
      <div className="relative h-full w-full select-none touch-none overflow-hidden">
        {children}
      </div>

      {/* Top chrome: title badge + category chip (left), control cluster (right). */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
        {title ? (
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-border/40 bg-void/75 px-3 py-1.5 backdrop-blur-md">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
              {title}
            </h4>
            {category && (
              <span className="rounded-md bg-cyan/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan">
                {category}
              </span>
            )}
          </div>
        ) : (
          <div />
        )}

        <div className="pointer-events-auto flex items-center gap-2">
          {onStepBack && (
            <ControlButton onClick={onStepBack} aria-label="Step back">
              <ChevronLeft size={14} />
            </ControlButton>
          )}
          {onPlayPause && isPlaying !== undefined && (
            <ControlButton
              onClick={onPlayPause}
              variant={isPlaying ? "active" : "default"}
              aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </ControlButton>
          )}
          {onStepForward && (
            <ControlButton onClick={onStepForward} aria-label="Step forward">
              <ChevronRight size={14} />
            </ControlButton>
          )}
          {onReset && (
            <ControlButton onClick={onReset} aria-label="Reset simulation">
              <RotateCcw size={14} />
            </ControlButton>
          )}
          {infoText && (
            <ControlButton
              onClick={() => setShowInfo((v) => !v)}
              variant={showInfo ? "active" : "default"}
              aria-label="Toggle information overlay"
            >
              <Info size={14} />
            </ControlButton>
          )}
          {allowFullscreen && (
            <ControlButton
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </ControlButton>
          )}
        </div>
      </div>

      {/* Optional caption strip: live readout / equation / step label. */}
      {caption && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex justify-center">
          <div className="pointer-events-auto max-w-full overflow-x-auto rounded-lg border border-border/40 bg-void/70 px-3 py-1.5 font-mono text-[11px] text-muted backdrop-blur-md">
            {caption}
          </div>
        </div>
      )}

      {/* Info sheet: auto-injected one-liner + optional extended content. */}
      <AnimatePresence>
        {showInfo && infoText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="absolute inset-x-3 bottom-3 z-30 max-h-[64%] overflow-y-auto rounded-xl border border-border/60 bg-void/90 p-4 backdrop-blur-md"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan">
                Concept
              </h5>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="text-muted transition-colors hover:text-foreground"
                aria-label="Close information overlay"
              >
                <X size={14} />
              </button>
            </div>
            <p className="font-sans text-xs leading-relaxed text-muted">
              {infoText}
            </p>
            {infoExtra && (
              <div className="mt-2 font-sans text-xs leading-relaxed text-muted">
                {infoExtra}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static bottom bioluminescent glow line. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-px bg-gradient-to-r from-transparent via-cyan/25 to-transparent" />
    </GlassPanel>
  );
}
