"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect, useRef } from "react";
import { GlossaryFrame } from "./shared/frame";

type HemisphereType = "northern" | "southern";
type LaunchFromType = "pole" | "equator";

export default function CoriolisEffect() {
  const t = useTranslations("viz.coriolisEffect");

  const [hemisphere, setHemisphere] = useState<HemisphereType>("northern");
  const [spinSpeed, setSpinSpeed] = useState(3); // 0 (stationary) to 5 (fast)
  const [launchFrom, setLaunchFrom] = useState<LaunchFromType>("pole");
  const [probeActive, setProbeActive] = useState(false);
  const [probeProgress, setProbeProgress] = useState(0); // 0 to 1
  const [spinAngle, setSpinAngle] = useState(0); // continuous rotation in degrees
  const [preset, setPreset] = useState<"earth" | "pandora" | "none" | null>(null);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  const R = 65; // Disk radius in SVG pixels
  const launchAngle = -Math.PI / 2; // Launch straight up in space view

  // Continuous animation loop for rotation and probe trajectory
  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        // Increment disk rotation angle
        setSpinAngle((prev) => (prev + spinSpeed * 0.4) % 360);

        // Advance probe trajectory if active
        if (probeActive) {
          setProbeProgress((prev) => {
            const next = prev + 0.015;
            if (next >= 1) {
              setProbeActive(false);
              return 1;
            }
            return next;
          });
        }
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [spinSpeed, probeActive]);

  const handleLaunch = () => {
    setProbeProgress(0);
    setProbeActive(true);
  };

  const handleReset = () => {
    setHemisphere("northern");
    setSpinSpeed(3);
    setLaunchFrom("pole");
    setProbeActive(false);
    setProbeProgress(0);
    setSpinAngle(0);
    setPreset(null);
  };

  const applyPreset = (type: "earth" | "pandora" | "none") => {
    setPreset(type);
    if (type === "earth") {
      setSpinSpeed(4.5);
      setHemisphere("northern");
    } else if (type === "pandora") {
      setSpinSpeed(1.5); // Slower spin
      setHemisphere("northern");
    } else {
      setSpinSpeed(0);
    }
    setProbeActive(false);
    setProbeProgress(0);
  };

  // Helper to generate the path for the probe's apparent trajectory on the surface
  const getSurfacePath = (progress: number) => {
    const points: string[] = [];
    const steps = Math.floor(progress * 60);
    const directionFactor = hemisphere === "northern" ? -1 : 1;
    // Scale total rotation of the surface during the probe's flight based on spin speed
    const totalRotation = spinSpeed * 0.08 * Math.PI;

    for (let i = 0; i <= steps; i++) {
      const u = i / 60;
      const currentRot = u * totalRotation * directionFactor;
      const theta = launchAngle + currentRot;
      const r = launchFrom === "pole" ? R * u : R * (1 - u);
      const x = 100 + r * Math.cos(theta);
      const y = 100 + r * Math.sin(theta);
      points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(" ");
  };

  // Compute current probe positions
  const getSpaceProbeCoords = () => {
    const r = launchFrom === "pole" ? R * probeProgress : R * (1 - probeProgress);
    const x = 100 + r * Math.cos(launchAngle);
    const y = 100 + r * Math.sin(launchAngle);
    return { x, y };
  };

  const getSurfaceProbeCoords = () => {
    const directionFactor = hemisphere === "northern" ? -1 : 1;
    const totalRotation = spinSpeed * 0.08 * Math.PI;
    const currentRot = probeProgress * totalRotation * directionFactor;
    const theta = launchAngle + currentRot;
    const r = launchFrom === "pole" ? R * probeProgress : R * (1 - probeProgress);
    const x = 100 + r * Math.cos(theta);
    const y = 100 + r * Math.sin(theta);
    return { x, y };
  };

  const spaceProbe = getSpaceProbeCoords();
  const surfaceProbe = getSurfaceProbeCoords();

  // Disk grid lines helper
  const renderDiskGrid = (isRotating: boolean) => {
    const transform = isRotating
      ? `rotate(${hemisphere === "northern" ? spinAngle : -spinAngle} 100 100)`
      : undefined;

    return (
      <g transform={transform}>
        {/* Background Disc */}
        <circle cx="100" cy="100" r={R} className="fill-void/40 stroke-border/30 stroke-[0.5]" />

        {/* Latitudes */}
        <circle
          cx="100"
          cy="100"
          r={R * 0.33}
          fill="none"
          className="stroke-border/10 stroke-[0.5] stroke-dasharray-[2,2]"
        />
        <circle
          cx="100"
          cy="100"
          r={R * 0.66}
          fill="none"
          className="stroke-border/10 stroke-[0.5] stroke-dasharray-[2,2]"
        />

        {/* Meridians */}
        <line
          x1="100"
          y1={100 - R}
          x2="100"
          y2={100 + R}
          className="stroke-border/10 stroke-[0.5] stroke-dasharray-[2,2]"
        />
        <line
          x1={100 - R}
          y1="100"
          x2={100 + R}
          y2="100"
          className="stroke-border/10 stroke-[0.5] stroke-dasharray-[2,2]"
        />

        {/* Decorative Compass Markers */}
        <text
          x="100"
          y={96 - R}
          className="fill-muted font-mono text-[5px] font-bold"
          textAnchor="middle"
        >
          N
        </text>
        <text
          x="100"
          y={106 + R}
          className="fill-muted font-mono text-[5px] font-bold"
          textAnchor="middle"
        >
          S
        </text>
        <text
          x={104 + R}
          y="102"
          className="fill-muted font-mono text-[5px] font-bold"
          textAnchor="start"
        >
          E
        </text>
        <text
          x={96 - R}
          y="102"
          className="fill-muted font-mono text-[5px] font-bold"
          textAnchor="end"
        >
          W
        </text>
      </g>
    );
  };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={handleReset}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Side-by-side Viewports */}
        <div className="w-full flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-36 pt-2">
          {/* Left Panel: Space View (Inertial Frame) */}
          <div className="relative border border-border/20 rounded-xl bg-void/50 flex flex-col items-center p-3">
            <span className="absolute top-2 left-3 text-[7.5px] uppercase font-mono text-muted tracking-wider">
              {t("inertialPath")}
            </span>
            <div className="flex-1 w-full flex items-center justify-center min-h-[120px]">
              <svg viewBox="0 0 200 200" className="w-[125px] h-[125px] select-none">
                <title>Space view (Inertial frame)</title>
                {renderDiskGrid(true)}

                {/* Inertial flight line: always a straight line in space */}
                {probeProgress > 0 && (
                  <line
                    x1="100"
                    y1={launchFrom === "pole" ? "100" : (100 - R).toString()}
                    x2="100"
                    y2={
                      launchFrom === "pole"
                        ? (100 - R * probeProgress).toString()
                        : (100 - R * (1 - probeProgress)).toString()
                    }
                    className="stroke-amber stroke-1 stroke-dasharray-[2,1] opacity-75"
                  />
                )}

                {/* Probe Orb */}
                {probeProgress > 0 && (
                  <circle
                    cx={spaceProbe.x}
                    cy={spaceProbe.y}
                    r="3.5"
                    fill="var(--amber)"
                    className="transition-all duration-75"
                    style={{ filter: "drop-shadow(0 0 3px var(--amber))" }}
                  />
                )}

                {/* Center axis pivot */}
                <circle cx="100" cy="100" r="1.5" className="fill-foreground" />
              </svg>
            </div>
            <span className="text-[7.5px] font-mono text-amber">
              {spinSpeed > 0 ? "Observer in space sees a straight line" : "Stationary"}
            </span>
          </div>

          {/* Right Panel: Surface View (Rotating Frame) */}
          <div className="relative border border-border/20 rounded-xl bg-void/50 flex flex-col items-center p-3">
            <span className="absolute top-2 left-3 text-[7.5px] uppercase font-mono text-muted tracking-wider">
              {t("apparentPath")}
            </span>
            <div className="flex-1 w-full flex items-center justify-center min-h-[120px]">
              <svg viewBox="0 0 200 200" className="w-[125px] h-[125px] select-none">
                <title>Surface view (Rotating frame)</title>
                {renderDiskGrid(false)}

                {/* Deflected surface track curve */}
                {probeProgress > 0 && (
                  <path
                    d={getSurfacePath(probeProgress)}
                    fill="none"
                    className="stroke-cyan stroke-[1.2]"
                    style={{ filter: "drop-shadow(0 0 2px rgba(54, 197, 217, 0.6))" }}
                  />
                )}

                {/* Probe Orb */}
                {probeProgress > 0 && (
                  <circle
                    cx={surfaceProbe.x}
                    cy={surfaceProbe.y}
                    r="3.5"
                    fill="var(--cyan)"
                    className="transition-all duration-75"
                    style={{ filter: "drop-shadow(0 0 3px var(--cyan))" }}
                  />
                )}

                {/* Center axis pivot */}
                <circle cx="100" cy="100" r="1.5" className="fill-foreground" />
              </svg>
            </div>
            <span className="text-[7.5px] font-mono text-cyan">
              {spinSpeed > 0
                ? hemisphere === "northern"
                  ? "Deflects right (clockwise drift)"
                  : "Deflects left (counter-clockwise drift)"
                : "No deflection"}
            </span>
          </div>
        </div>

        {/* User HUD controls */}
        <div className="bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono mt-2">
          {/* Launch Controls & Hemisphere */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Hemisphere Toggle */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[9px] font-mono text-muted w-24 uppercase shrink-0">
                {t("hemisphere") || "Hemisphere"}:
              </span>
              <div className="flex-1 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setHemisphere("northern");
                    setPreset(null);
                  }}
                  className={`py-1 rounded text-[8.5px] font-bold border transition-all cursor-pointer ${
                    hemisphere === "northern"
                      ? "bg-cyan/20 border-cyan text-cyan"
                      : "bg-surface border-border/30 text-muted hover:text-foreground"
                  }`}
                >
                  {t("northernShort")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHemisphere("southern");
                    setPreset(null);
                  }}
                  className={`py-1 rounded text-[8.5px] font-bold border transition-all cursor-pointer ${
                    hemisphere === "southern"
                      ? "bg-cyan/20 border-cyan text-cyan"
                      : "bg-surface border-border/30 text-muted hover:text-foreground"
                  }`}
                >
                  {t("southernShort")}
                </button>
              </div>
            </div>

            {/* Launch Position Toggle */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[9px] font-mono text-muted w-24 uppercase shrink-0">
                {t("launchPos") || "Launch From"}:
              </span>
              <div className="flex-1 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setLaunchFrom("pole");
                    setProbeActive(false);
                    setProbeProgress(0);
                  }}
                  className={`py-1 rounded text-[8.5px] font-bold border transition-all cursor-pointer ${
                    launchFrom === "pole"
                      ? "bg-cyan/20 border-cyan text-cyan"
                      : "bg-surface border-border/30 text-muted hover:text-foreground"
                  }`}
                >
                  {t("poleShort")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLaunchFrom("equator");
                    setProbeActive(false);
                    setProbeProgress(0);
                  }}
                  className={`py-1 rounded text-[8.5px] font-bold border transition-all cursor-pointer ${
                    launchFrom === "equator"
                      ? "bg-cyan/20 border-cyan text-cyan"
                      : "bg-surface border-border/30 text-muted hover:text-foreground"
                  }`}
                >
                  {t("equatorShort")}
                </button>
              </div>
            </div>

            {/* Action Trigger */}
            <button
              type="button"
              onClick={handleLaunch}
              className="px-4 py-1.5 rounded text-[8.5px] font-bold uppercase tracking-wider bg-cyan border border-cyan text-void hover:bg-cyan-bright transition-all cursor-pointer select-none shrink-0"
            >
              {t("launch") || "Launch"}
            </button>
          </div>

          {/* Spin Speed slider */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted w-24 uppercase shrink-0">
              {t("spinSpeed") || "Rotation"}:
            </span>
            <span className="text-muted w-14 shrink-0 text-left">
              {t("stationary") || "Stationary"}
            </span>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={spinSpeed}
              onChange={(e) => {
                setSpinSpeed(Number.parseFloat(e.target.value));
                setPreset(null);
              }}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-foreground w-14 shrink-0 text-right">
              {t("fast") || "Fast"} ({spinSpeed.toFixed(1)})
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 items-center border-t border-border/20 pt-2 text-[8px] text-muted">
            <span className="font-bold uppercase tracking-wider">
              {t("planetPresets") || "Presets"}:
            </span>
            <button
              type="button"
              onClick={() => applyPreset("earth")}
              className={`px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                preset === "earth"
                  ? "bg-cyan/20 border-cyan text-cyan font-bold"
                  : "border-border/30 hover:text-foreground"
              }`}
            >
              {t("presetEarth") || "Earth"}
            </button>
            <button
              type="button"
              onClick={() => applyPreset("pandora")}
              className={`px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                preset === "pandora"
                  ? "bg-cyan/20 border-cyan text-cyan font-bold"
                  : "border-border/30 hover:text-foreground"
              }`}
            >
              {t("presetPandora") || "Pandora"}
            </button>
            <button
              type="button"
              onClick={() => applyPreset("none")}
              className={`px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                preset === "none"
                  ? "bg-cyan/20 border-cyan text-cyan font-bold"
                  : "border-border/30 hover:text-foreground"
              }`}
            >
              {t("presetNone") || "None"}
            </button>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
