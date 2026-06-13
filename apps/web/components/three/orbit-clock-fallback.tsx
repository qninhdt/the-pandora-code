interface OrbitClockFallbackProps {
  /** Optional generated poster (the tidal-lock carousel figure). */
  poster?: string;
}

// 2D fallback for the orbit clock - shown on low-power devices, reduced-motion,
// and before the 3D scene mounts. Uses the generated carousel poster when one
// is supplied, otherwise a token-driven gradient evoking a lit planet at centre
// with a small moon offset to one side.
export function OrbitClockFallback({ poster }: OrbitClockFallbackProps) {
  if (poster) {
    return (
      <div className="absolute inset-0">
        <img src={poster} alt="" className="size-full object-cover opacity-85" />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(60% 60% at 50% 50%, transparent 55%, var(--abyss))",
          }}
        />
      </div>
    );
  }
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(38% 46% at 50% 50%, color-mix(in oklab, var(--amber) 42%, transparent), transparent 70%), radial-gradient(14% 16% at 78% 42%, color-mix(in oklab, var(--cyan) 55%, transparent), transparent 70%), var(--abyss)",
      }}
    >
      {/* central planet */}
      <div
        className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[1px]"
        style={{
          background:
            "radial-gradient(circle at 38% 38%, color-mix(in oklab, var(--amber) 70%, white), color-mix(in oklab, var(--amber) 40%, var(--surface)) 70%, var(--surface))",
        }}
      />
      {/* small locked moon, offset to one side */}
      <div
        className="absolute left-[78%] top-[42%] size-7 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 35%, color-mix(in oklab, var(--teal) 75%, white), color-mix(in oklab, var(--teal) 30%, var(--surface)) 75%)",
        }}
      />
    </div>
  );
}
