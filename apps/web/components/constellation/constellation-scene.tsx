"use client";

import type { GraphData, GraphNode } from "@/lib/constellation/graph-data";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { designTokens } from "@/lib/design-tokens";

interface ConstellationSceneProps {
  data: GraphData;
  /** Active part filter, or null for "all". */
  activePart: string | null;
}

const CHAPTER_COLOR = new THREE.Color(designTokens.biolum.cyan);
const TERM_COLOR = new THREE.Color(designTokens.biolum.teal);
const DIM_COLOR = new THREE.Color(designTokens.text.subtle);

// The interactive 3D graph. Positions are precomputed (offline d3-force), so
// this only renders a static point cloud + edge lines and handles hover/click.
// Hovering a node highlights its neighbours; clicking navigates. A part filter
// dims everything outside the selected Part.
export function ConstellationScene({ data, activePart }: ConstellationSceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "low-power", alpha: true }}
      camera={{ position: [0, 0, 90], fov: 55 }}
    >
      <ambientLight intensity={0.8} />
      <Graph data={data} activePart={activePart} />
      <OrbitControls enablePan={false} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
    </Canvas>
  );
}

function Graph({ data, activePart }: ConstellationSceneProps) {
  const router = useRouter();
  const { gl } = useThree();
  const [hovered, setHovered] = useState<string | null>(null);
  // Distinguish a click from the release of an orbit drag: only navigate if the
  // pointer barely moved between down and up.
  const downPos = useRef<{ x: number; y: number } | null>(null);

  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data.nodes]);

  // Adjacency for neighbour highlighting on hover.
  const neighbours = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of data.edges) {
      if (!map.has(e.source)) map.set(e.source, new Set());
      if (!map.has(e.target)) map.set(e.target, new Set());
      map.get(e.source)?.add(e.target);
      map.get(e.target)?.add(e.source);
    }
    return map;
  }, [data.edges]);

  // Map each term to the set of Parts it belongs to (via chapter_term edges),
  // so the Part filter can dim terms that aren't connected to the active Part.
  const partsOfTerm = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of data.edges) {
      if (e.kind !== "chapter_term") continue;
      const chapter = byId.get(e.source.startsWith("c:") ? e.source : e.target);
      const termId = e.source.startsWith("g:") ? e.source : e.target;
      if (chapter?.part) {
        if (!map.has(termId)) map.set(termId, new Set());
        map.get(termId)?.add(chapter.part);
      }
    }
    return map;
  }, [data.edges, byId]);

  const isDimmed = (node: GraphNode): boolean => {
    if (activePart) {
      const inPart =
        node.type === "chapter"
          ? node.part === activePart
          : partsOfTerm.get(node.id)?.has(activePart) ?? false;
      if (!inPart) return true;
    }
    if (hovered) {
      return node.id !== hovered && !neighbours.get(hovered)?.has(node.id);
    }
    return false;
  };

  // All edges as ONE static geometry (1 draw call). Positions only depend on
  // the graph, not on hover/filter — so this never rebuilds during interaction.
  const basePositions = useMemo(() => {
    const arr = new Float32Array(data.edges.length * 6);
    let i = 0;
    for (const e of data.edges) {
      const a = byId.get(e.source);
      const b = byId.get(e.target);
      if (!a || !b) continue;
      arr[i++] = a.x;
      arr[i++] = a.y;
      arr[i++] = a.z;
      arr[i++] = b.x;
      arr[i++] = b.y;
      arr[i++] = b.z;
    }
    return arr.subarray(0, i);
  }, [data.edges, byId]);

  // Just the hovered node's incident edges, lit brighter. Small array, only
  // recomputed when the hovered node changes.
  const litPositions = useMemo(() => {
    if (!hovered) return new Float32Array(0);
    const pts: number[] = [];
    for (const e of data.edges) {
      if (e.source !== hovered && e.target !== hovered) continue;
      const a = byId.get(e.source);
      const b = byId.get(e.target);
      if (!a || !b) continue;
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    return new Float32Array(pts);
  }, [hovered, data.edges, byId]);

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[basePositions, 3]}
            count={basePositions.length / 3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={designTokens.line.border}
          transparent
          opacity={hovered ? 0.06 : 0.18}
        />
      </lineSegments>
      {litPositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[litPositions, 3]}
              count={litPositions.length / 3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={designTokens.biolum.cyan} transparent opacity={0.9} />
        </lineSegments>
      )}
      {data.nodes.map((node) => {
        const dimmed = isDimmed(node);
        const color = dimmed
          ? DIM_COLOR
          : node.type === "chapter"
            ? CHAPTER_COLOR
            : TERM_COLOR;
        return (
          <mesh
            key={node.id}
            position={[node.x, node.y, node.z]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(node.id);
              gl.domElement.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(null);
              gl.domElement.style.cursor = "auto";
            }}
            onPointerDown={(e) => {
              downPos.current = { x: e.clientX, y: e.clientY };
            }}
            onClick={(e) => {
              e.stopPropagation();
              const down = downPos.current;
              downPos.current = null;
              // Ignore clicks that are really the end of an orbit drag.
              if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
              router.push(node.href);
            }}
          >
            <sphereGeometry args={[node.type === "chapter" ? 1.4 : 0.7, 12, 12]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={dimmed ? 0.1 : hovered === node.id ? 1.2 : 0.5}
              transparent
              opacity={dimmed ? 0.25 : 1}
            />
          </mesh>
        );
      })}
    </group>
  );
}
