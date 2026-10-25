"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Line2, LineMaterial } from "three-stdlib";
import type { ComputedRoute } from "@/lib/pathfinding/route";
import { useResolvedTheme } from "@/lib/theme";

const PATH_Y = 0.75;

export function PathLine({ route }: { route: ComputedRoute }) {
  const coreRef = useRef<Line2 | null>(null);
  const dark = useResolvedTheme() === "dark";
  const coreColor = dark ? "#67e8f9" : "#0e7490";

  const points = useMemo(
    () => route.pathPoints.map(([x, z]) => new THREE.Vector3(x, PATH_Y, z)),
    [route],
  );

  useFrame((_, dt) => {
    const mat = coreRef.current?.material as LineMaterial | undefined;
    if (mat && "dashOffset" in mat) {
      mat.dashOffset -= dt * 2.2;
    }
  });

  return (
    <group>
      {/* 底层辉光 */}
      <Line points={points} color="#22d3ee" lineWidth={9} transparent opacity={0.14} depthWrite={false} />
      {/* 主体虚线（流动） */}
      <Line
        ref={coreRef}
        points={points}
        color={coreColor}
        lineWidth={2.6}
        dashed
        dashSize={5}
        gapSize={3.5}
        transparent
        opacity={0.95}
      />
    </group>
  );
}

export function Walker({
  curve,
  playing,
  walkerRef,
}: {
  curve: THREE.CatmullRomCurve3;
  playing: boolean;
  walkerRef: React.MutableRefObject<THREE.Vector3>;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const tRef = useRef(0);
  const lenRef = useRef(0);
  const dark = useResolvedTheme() === "dark";

  useEffect(() => {
    lenRef.current = curve.getLength();
    tRef.current = 0;
  }, [curve]);

  useFrame((state, dt) => {
    if (lenRef.current > 0) {
      if (playing) tRef.current = (tRef.current + (dt * 22) / lenRef.current) % 1;
      const p = curve.getPointAt(Math.min(0.9999, tRef.current));
      walkerRef.current.copy(p);
      if (meshRef.current) {
        const bob = playing ? Math.sin(state.clock.elapsedTime * 5) * 0.35 : 0;
        meshRef.current.position.set(p.x, PATH_Y + 1.3 + bob, p.z);
        const s = playing ? 1 + Math.sin(state.clock.elapsedTime * 6) * 0.12 : 1;
        meshRef.current.scale.setScalar(s);
      }
    }
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <sphereGeometry args={[1.7, 24, 24]} />
        <meshBasicMaterial color={dark ? "#9be8ff" : "#0ea5e9"} />
      </mesh>
      <mesh scale={1.9}>
        <sphereGeometry args={[1.7, 24, 24]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <pointLight color="#22d3ee" intensity={60} distance={48} decay={2} />
    </group>
  );
}
