interface FloatingMountainFallbackProps {
  /** Optional generated establishing image to show instead of the gradient. */
  poster?: string;
}

// 2D fallback for the floating-mountain hero — shown on low-power devices,
// reduced-motion, and before the 3D scene mounts. A layered gradient evoking
// haze-wreathed floating peaks, or a generated poster when one is supplied.
export function FloatingMountainFallback({ poster }: FloatingMountainFallbackProps) {
  if (poster) {
    return (
      <div className="absolute inset-0">
        <img src={poster} alt="" className="size-full object-cover opacity-80" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 40%, var(--void))" }}
        />
      </div>
    );
  }
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(60% 50% at 30% 35%, color-mix(in oklab, var(--cyan) 30%, transparent), transparent 70%), radial-gradient(50% 45% at 72% 55%, color-mix(in oklab, var(--teal) 22%, transparent), transparent 70%), radial-gradient(40% 40% at 55% 80%, color-mix(in oklab, var(--magenta) 14%, transparent), transparent 70%), var(--abyss)",
      }}
    >
      {/* suggestion of two floating masses */}
      <div
        className="absolute left-[22%] top-[34%] h-20 w-32 -rotate-6 rounded-[60%] blur-md"
        style={{ background: "color-mix(in oklab, var(--surface-raised) 80%, var(--cyan))" }}
      />
      <div
        className="absolute left-[58%] top-[52%] h-16 w-24 rotate-3 rounded-[60%] blur-md"
        style={{ background: "color-mix(in oklab, var(--surface) 80%, var(--teal))" }}
      />
    </div>
  );
}
