"use client";

import { Slider as SliderPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  thumbAriaLabel?: string;
  thumbAriaValueText?: string;
}

function Slider({ className, thumbAriaLabel, thumbAriaValueText, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface">
        <SliderPrimitive.Range className="absolute h-full bg-cyan" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={thumbAriaLabel}
        aria-valuetext={thumbAriaValueText}
        className="block size-3.5 rounded-full border border-cyan bg-void shadow-[0_0_12px_color-mix(in_oklab,var(--cyan)_65%,transparent)] outline-none transition-[box-shadow,transform] hover:scale-110 focus-visible:ring-2 focus-visible:ring-cyan/50 disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };
