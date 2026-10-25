"use client";

import { Grid, Html, OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { VenueProject } from "@/data/venues/schema";
import type { ComputedRoute } from "@/lib/pathfinding/route";
import { useAppStore } from "@/lib/store";
import { useResolvedTheme } from "@/lib/theme";
import { CameraRig } from "./CameraRig";
import { HallMesh } from "./HallMesh";
import { PathLine, Walker } from "./PathLine";
import { POIMarker } from "./POIMarker";

/** 日夜两套场景配色 */
const SCENE = {
  dark: {
    bg: "#070b16",
    ground: "#0a1120",
    cell: "#15223c",
    section: "#22335a",
    hemi: ["#7ea6ff", "#0a0f1e", 0.55] as const,
    ambient: 0.6,
    stars: true,
    pad: "#e2e8f0",
    padOpacity: 0.5,
  },
  light: {
    bg: "#e3ebf7",
    ground: "#ccd7e7",
    cell: "#b3c2d8",
    section: "#93a7c5",
    hemi: ["#ffffff", "#b9c8dd", 0.75] as const,
    ambient: 0.8,
    stars: false,
    pad: "#ffffff",
    padOpacity: 0.85,
  },
};

function EntranceMarker({
  entrance,
  pad,
  padOpacity,
}: {
  entrance: VenueProject["venue"]["entrances"][number];
  pad: string;
  padOpacity: number;
}) {
  return (
    <group position={[entrance.x, 0, entrance.z]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.45}>
        <circleGeometry args={[2.4, 4]} />
        <meshBasicMaterial color={pad} transparent opacity={padOpacity} />
      </mesh>
      <mesh rotation={[0, Math.PI / 4, 0]} position-y={2.2}>
        <coneGeometry args={[1.6, 3.4, 4]} />
        <meshStandardMaterial color="#94a3b8" emissive="#7dd3fc" emissiveIntensity={0.25} roughness={0.4} />
      </mesh>
      <Html center position={[0, 6, 0]} distanceFactor={200} zIndexRange={[12, 0]}>
        <div className="entrance-label">{entrance.name}</div>
      </Html>
    </group>
  );
}

function SceneContents({ project, route }: { project: VenueProject; route: ComputedRoute | null }) {
  const cameraMode = useAppStore((s) => s.cameraMode);
  const playing = useAppStore((s) => s.playing);
  const theme = useResolvedTheme();
  const C = SCENE[theme];
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const walkerRef = useRef(new THREE.Vector3(0, 0, 95));

  const curve = useMemo(() => {
    if (!route || route.pathPoints.length < 2) return null;
    const pts = route.pathPoints.map(([x, z]) => new THREE.Vector3(x, 0.75, z));
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.06);
  }, [route]);

  return (
    <>
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, 340, 950]} />
      <ambientLight intensity={C.ambient} />
      <hemisphereLight args={[C.hemi[0], C.hemi[1], C.hemi[2]]} />
      <directionalLight position={[140, 200, 90]} intensity={1.15} />
      {C.stars && <Stars radius={520} depth={60} count={1600} factor={5} saturation={0} fade speed={0.5} />}

      {/* 地面 */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.08}>
        <planeGeometry args={[1100, 800]} />
        <meshStandardMaterial color={C.ground} roughness={0.95} metalness={0} />
      </mesh>
      <Grid
        position={[0, 0.02, -20]}
        args={[1100, 800]}
        cellSize={10}
        cellThickness={0.6}
        cellColor={C.cell}
        sectionSize={50}
        sectionThickness={1.1}
        sectionColor={C.section}
        fadeDistance={560}
        fadeStrength={1.4}
        infiniteGrid={false}
      />
      {/* 南北轴通道光带 */}
      <mesh position={[0, 0.05, -15]}>
        <boxGeometry args={[34, 0.1, 190]} />
        <meshBasicMaterial color="#14b8a6" transparent opacity={0.1} depthWrite={false} />
      </mesh>

      {project.venue.halls.map((h) => (
        <HallMesh key={h.id} hall={h} />
      ))}
      {project.venue.entrances.map((e) => (
        <EntranceMarker key={e.id} entrance={e} pad={C.pad} padOpacity={C.padOpacity} />
      ))}
      {project.venue.pois.map((p) => (
        <POIMarker key={p.id} poi={p} />
      ))}

      {curve && <PathLine route={route!} />}
      {curve && <Walker curve={curve} playing={playing} walkerRef={walkerRef} />}
      <CameraRig mode={cameraMode} walkerRef={walkerRef} hasRoute={!!curve} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0, -25]}
        enableDamping
        dampingFactor={0.08}
        minDistance={30}
        maxDistance={700}
        maxPolarAngle={1.42}
      />
    </>
  );
}

export default function VenueScene({ project, route }: { project: VenueProject; route: ComputedRoute | null }) {
  return (
    <div className="absolute inset-0" aria-label="3D 场馆视图">
      <Canvas
        camera={{ position: [215, 185, 285], fov: 40, near: 0.5, far: 2200 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        onPointerMissed={() => useAppStore.getState().selectPoi(null)}
      >
        <SceneContents project={project} route={route} />
      </Canvas>
    </div>
  );
}
