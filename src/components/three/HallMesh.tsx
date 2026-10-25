"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { Hall } from "@/data/venues/schema";

const BASE_Y = 1.6; // 玻璃体离地悬浮高度，路径可从其下穿过

export function HallMesh({ hall }: { hall: Hall }) {
  const boxGeo = useMemo(() => new THREE.BoxGeometry(hall.w, hall.h, hall.d), [hall.w, hall.h, hall.d]);
  const tint = useMemo(
    () => new THREE.Color(hall.color).lerp(new THREE.Color("#dbeafe"), 0.72),
    [hall.color],
  );

  return (
    <group>
      {/* 地台 */}
      <mesh position={[hall.cx, 0.18, hall.cz]}>
        <boxGeometry args={[hall.w + 4, 0.36, hall.d + 4]} />
        <meshStandardMaterial color="#101a30" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* 玻璃体 */}
      <mesh position={[hall.cx, BASE_Y + hall.h / 2, hall.cz]}>
        <boxGeometry args={[hall.w, hall.h, hall.d]} />
        <meshStandardMaterial
          color={tint}
          transparent
          opacity={0.14}
          roughness={0.18}
          metalness={0.08}
          depthWrite={false}
        />
      </mesh>
      {/* 发光描边 */}
      <lineSegments position={[hall.cx, BASE_Y + hall.h / 2, hall.cz]}>
        <edgesGeometry args={[boxGeo]} />
        <lineBasicMaterial color={hall.color} transparent opacity={0.65} />
      </lineSegments>
      <Html center position={[hall.cx, BASE_Y + hall.h + 3.5, hall.cz]} distanceFactor={240} zIndexRange={[12, 0]}>
        <div className="hall-label" style={{ borderColor: `${hall.color}55` }}>
          <span className="hall-label-dot" style={{ background: hall.color }} />
          {hall.name}
        </div>
      </Html>
    </group>
  );
}
