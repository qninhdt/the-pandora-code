"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

interface ParallaxProps {
  children: ReactNode;
  /** Vertical drift in px across the scroll range. Negative drifts upward. */
  offset?: number;
  className?: string;
}

// Drift a layer at a different rate than the scroll for depth. Used by hero
// scenes and section backdrops. Disabled under prefers-reduced-motion.
export function Parallax({ children, offset = 80, className }: ParallaxProps) {
  const reduced = useReducedMotionSafe();
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => {
      const deviceMemory = "deviceMemory" in navigator ? Number(navigator.deviceMemory) : undefined;
      const lowPower =
        navigator.hardwareConcurrency <= 4 || (deviceMemory !== undefined && deviceMemory <= 4);
      setCapable(media.matches && !lowPower);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (reduced || !capable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <ParallaxMotion offset={offset} className={className}>
      {children}
    </ParallaxMotion>
  );
}

function ParallaxMotion({ children, offset, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset ?? 80, -(offset ?? 80)]);

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
