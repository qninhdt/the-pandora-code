"use client";

import { cn } from "@/lib/utils";
import type React from "react";

type ControlButtonVariant = "default" | "active" | "accent";

interface ControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ControlButtonVariant;
  // Render a slightly larger tap target; used for primary play/pause controls.
  prominent?: boolean;
}

// The canonical pill icon-button shared by the frame chrome and every term
// component that needs a custom control. One visual language across all 257
// figures: frosted void background, cyan hover, token-driven active/accent
// states. Pass an icon (or short label) as children.
export function ControlButton({
  variant = "default",
  prominent = false,
  className,
  children,
  type = "button",
  ...rest
}: ControlButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border backdrop-blur-md",
        "font-mono text-xs tracking-wide cursor-pointer",
        "transition-colors duration-[--duration-fast]",
        "focus-visible:outline-2 focus-visible:outline-cyan focus-visible:outline-offset-2",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        prominent ? "p-2.5" : "p-2",
        variant === "default" &&
          "bg-void/75 border-border/40 text-muted hover:bg-void hover:border-cyan/50 hover:text-cyan",
        variant === "active" && "bg-void border-cyan text-cyan",
        variant === "accent" &&
          "bg-void/75 border-amber/50 text-amber hover:bg-void hover:border-amber",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
