// 2D fallback for the FieldViz flux visualization - concentric glowing rings
// suggesting a magnetic field, shown on low-power / reduced-motion devices and
// before the 3D scene mounts. Pure CSS, no animation loop.
export function FieldVizFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 40% at 50% 50%, color-mix(in oklab, var(--cyan) 18%, transparent), transparent 70%), var(--abyss)",
        }}
      />
      {[0.3, 0.5, 0.7, 0.9].map((scale, i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
            borderColor: `color-mix(in oklab, var(--cyan) ${30 - i * 5}%, transparent)`,
            boxShadow: "0 0 24px -10px var(--cyan)",
          }}
        />
      ))}
      <div
        className="size-3 rounded-full"
        style={{
          background: "var(--cyan)",
          boxShadow: "0 0 16px 2px var(--cyan)",
        }}
      />
    </div>
  );
}
