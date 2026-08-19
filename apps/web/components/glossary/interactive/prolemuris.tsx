"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// fusion 0 = six free limbs, 1 = upper arms fully merged toward Na'vi plan
function limbGeometry(fusion: number) {
  const bodyX = 50;
  const shoulderY = 38;
  const hipY = 62;
  // upper pair start far apart and draw together as they fuse
  const upperSpread = 14 - fusion * 11; // 14 → 3
  const midSpread = 16 - fusion * 4; // mid arms become the working pair
  const lowerSpread = 11;

  const upperL = { x: bodyX - upperSpread, y: shoulderY - 2 };
  const upperR = { x: bodyX + upperSpread, y: shoulderY - 2 };
  // mid pair (true arms) — elongate slightly as upper fuses in
  const midLen = 18 + fusion * 4;
  const midL = {
    sx: bodyX - 5,
    sy: shoulderY + 2,
    ex: bodyX - 5 - midSpread * 0.55,
    ey: shoulderY + 2 + midLen,
  };
  const midR = {
    sx: bodyX + 5,
    sy: shoulderY + 2,
    ex: bodyX + 5 + midSpread * 0.55,
    ey: shoulderY + 2 + midLen,
  };
  // upper limbs shrink / merge into shoulder as fusion rises
  const upLen = 14 * (1 - fusion * 0.75);
  const upL = {
    sx: bodyX - 3,
    sy: shoulderY - 1,
    ex: upperL.x - 2,
    ey: shoulderY - 1 + upLen,
    op: 1 - fusion * 0.55,
  };
  const upR = {
    sx: bodyX + 3,
    sy: shoulderY - 1,
    ex: upperR.x + 2,
    ey: shoulderY - 1 + upLen,
    op: 1 - fusion * 0.55,
  };
  // hind limbs stable
  const hindL = {
    sx: bodyX - 4,
    sy: hipY,
    ex: bodyX - 4 - lowerSpread * 0.5,
    ey: hipY + 22,
  };
  const hindR = {
    sx: bodyX + 4,
    sy: hipY,
    ex: bodyX + 4 + lowerSpread * 0.5,
    ey: hipY + 22,
  };

  // fused shoulder mass grows
  const fuseBlob = fusion * 6;

  return { midL, midR, upL, upR, hindL, hindR, fuseBlob, bodyX, shoulderY, hipY };
}

export default function Prolemuris() {
  const t = useTranslations("viz.prolemuris");
  const [fusion, setFusion] = useState(0.45);
  const g = useMemo(() => limbGeometry(fusion), [fusion]);

  const stateLabel =
    fusion < 0.25 ? t("stateSix") : fusion < 0.75 ? t("stateMid") : t("stateNavi");

  const reset = useCallback(() => setFusion(0.45), []);

  const limb = (
    s: { sx: number; sy: number; ex: number; ey: number },
    color: string,
    op = 1,
    width = 2.2,
  ) => (
    <g opacity={op}>
      <line
        x1={s.sx}
        y1={s.sy}
        x2={s.ex}
        y2={s.ey}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <circle cx={s.ex} cy={s.ey} r={1.6} fill={color} opacity="0.85" />
    </g>
  );

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={reset}
      caption={<span className="text-teal">{stateLabel}</span>}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="pro-body" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0d181c" stopOpacity="0.9" />
            </radialGradient>
            <filter id="pro-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="0.5" />
            </filter>
          </defs>

          {/* canopy hint */}
          <ellipse cx="50" cy="8" rx="40" ry="5" fill="var(--teal)" opacity="0.06" />
          {[20, 35, 50, 65, 80].map((x) => (
            <line
              key={x}
              x1={x}
              y1="4"
              x2={x + (x % 20) - 8}
              y2="14"
              stroke="var(--cyan)"
              strokeWidth="0.3"
              opacity="0.15"
            />
          ))}

          {/* hind limbs */}
          {limb(g.hindL, "var(--teal)", 0.85, 2.4)}
          {limb(g.hindR, "var(--teal)", 0.85, 2.4)}

          {/* mid / working arms */}
          {limb(g.midL, "var(--cyan)", 0.95, 2.3)}
          {limb(g.midR, "var(--cyan)", 0.95, 2.3)}

          {/* upper pair — fade & shrink with fusion */}
          {limb(g.upL, "var(--magenta)", g.upL.op, 1.8)}
          {limb(g.upR, "var(--magenta)", g.upR.op, 1.8)}

          {/* torso */}
          <ellipse
            cx={g.bodyX}
            cy={(g.shoulderY + g.hipY) / 2}
            rx="7"
            ry="16"
            fill="url(#pro-body)"
            stroke="var(--teal)"
            strokeWidth="0.5"
          />

          {/* fused shoulder mass */}
          {g.fuseBlob > 0.4 && (
            <ellipse
              cx={g.bodyX}
              cy={g.shoulderY}
              rx={4 + g.fuseBlob * 0.35}
              ry={3 + g.fuseBlob * 0.25}
              fill="var(--magenta)"
              opacity={0.15 + fusion * 0.25}
              filter="url(#pro-soft)"
            />
          )}

          {/* head */}
          <circle
            cx={g.bodyX}
            cy={g.shoulderY - 10}
            r="5.5"
            fill="url(#pro-body)"
            stroke="var(--cyan)"
            strokeWidth="0.45"
          />
          {/* eyes */}
          <circle cx={g.bodyX - 2} cy={g.shoulderY - 10.5} r="0.7" fill="var(--cyan)" opacity="0.9" />
          <circle cx={g.bodyX + 2} cy={g.shoulderY - 10.5} r="0.7" fill="var(--cyan)" opacity="0.9" />
          {/* ear tufts */}
          <path
            d={`M ${g.bodyX - 4} ${g.shoulderY - 13} L ${g.bodyX - 6} ${g.shoulderY - 17}`}
            stroke="var(--teal)"
            strokeWidth="0.7"
            strokeLinecap="round"
          />
          <path
            d={`M ${g.bodyX + 4} ${g.shoulderY - 13} L ${g.bodyX + 6} ${g.shoulderY - 17}`}
            stroke="var(--teal)"
            strokeWidth="0.7"
            strokeLinecap="round"
          />

          {/* tail */}
          <path
            d={`M ${g.bodyX} ${g.hipY + 10} Q ${g.bodyX + 12} ${g.hipY + 18}, ${g.bodyX + 8} ${g.hipY + 28}`}
            fill="none"
            stroke="var(--teal)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* limb legend ticks */}
          <g opacity="0.7">
            <circle cx="10" cy="78" r="1.2" fill="var(--magenta)" />
            <text x="13" y="79.2" className="fill-muted" style={{ fontSize: 2.4, fontFamily: "monospace" }}>
              {t("forelimbs")} ↑
            </text>
            <circle cx="10" cy="84" r="1.2" fill="var(--cyan)" />
            <text x="13" y="85.2" className="fill-muted" style={{ fontSize: 2.4, fontFamily: "monospace" }}>
              {t("forelimbs")}
            </text>
            <circle cx="10" cy="90" r="1.2" fill="var(--teal)" />
            <text x="13" y="91.2" className="fill-muted" style={{ fontSize: 2.4, fontFamily: "monospace" }}>
              {t("hindlimbs")}
            </text>
          </g>
        </svg>

        <div className="absolute right-3 top-14 flex flex-col items-end gap-1.5">
          <Readout
            label={t("evolution")}
            value={`${Math.round(fusion * 100)}%`}
            accent={fusion > 0.7 ? "magenta" : "teal"}
          />
          <Readout
            label={fusion < 0.5 ? t("sixLimb") : t("fused")}
            value={stateLabel}
            accent="cyan"
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("evolution")}
            value={fusion}
            min={0}
            max={1}
            step={0.01}
            onChange={setFusion}
            display={stateLabel}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
