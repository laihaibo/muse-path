"use client";

import { Html } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { POI } from "@/data/venues/schema";
import { useAppStore } from "@/lib/store";
import { useResolvedTheme } from "@/lib/theme";

const SERVICE_COLOR = "#f5b04c";

export function POIMarker({ poi }: { poi: POI }) {
  const selectPoi = useAppStore((s) => s.selectPoi);
  const hoverPoi = useAppStore((s) => s.hoverPoi);
  const selected = useAppStore((s) => s.selectedPoiId === poi.id);
  const hovered = useAppStore((s) => s.hoveredPoiId === poi.id);
  const plannedIndex = useAppStore((s) => {
    const plan = s.plans[s.selectedProjectId];
    if (!plan) return -1;
    return plan.stops.findIndex((st) => st.poiId === poi.id);
  });
  const dark = useResolvedTheme() === "dark";

  const [pulse, setPulse] = useState(0);
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ringRef.current) {
      const k = selected ? 1.15 + Math.sin(state.clock.elapsedTime * 3.2) * 0.25 : 1;
      ringRef.current.scale.setScalar(k);
      setPulse(0); // 保持组件受控更新由 r3f 驱动
    }
  });

  const planned = plannedIndex >= 0;
  const color = planned ? "#22d3ee" : poi.kind === "service" ? SERVICE_COLOR : dark ? "#9fb2cc" : "#64748b";
  const showLabel = selected || hovered || planned;

  return (
    <group position={[poi.x, 0, poi.z]}>
      {/* 地面光点 */}
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={0.45}
        onPointerOver={(e) => {
          e.stopPropagation();
          hoverPoi(poi.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          hoverPoi(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectPoi(poi.id);
        }}
      >
        <circleGeometry args={[2.1, 28]} />
        <meshBasicMaterial color={color} transparent opacity={planned ? 0.9 : 0.55} />
      </mesh>
      {/* 选中/在行程中的脉冲环 */}
      {(selected || planned) && (
        <mesh ref={ringRef} rotation-x={-Math.PI / 2} position-y={0.5}>
          <ringGeometry args={[2.6, 3.1, 36]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={selected ? 0.85 : 0.4} />
        </mesh>
      )}
      {/* 行程序号浮标 */}
      {planned && (
        <mesh position-y={2.4}>
          <sphereGeometry args={[0.75, 18, 18]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      )}
      {showLabel && (
        <Html center position={[0, planned ? 4.6 : 3.6, 0]} distanceFactor={170} zIndexRange={[12, 0]}>
          <div
            className="poi-chip"
            style={{
              background: dark
                ? planned
                  ? "rgba(8,40,48,0.85)"
                  : "rgba(10,16,30,0.85)"
                : "rgba(255,255,255,0.92)",
              borderColor: planned ? "#22d3ee88" : dark ? "rgba(255,255,255,0.2)" : "rgba(16,27,48,0.18)",
            }}
          >
            {planned && <span className="poi-chip-num">{plannedIndex + 1}</span>}
            <span className="poi-chip-name">{poi.name}</span>
            <span className="poi-chip-min">{poi.visitMinutes}′</span>
          </div>
        </Html>
      )}
      {pulse > 0 && null}
    </group>
  );
}
