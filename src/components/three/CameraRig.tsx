"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { CameraMode } from "@/lib/store";

const TOP_POS = new THREE.Vector3(0.5, 520, -24);
const TOP_TARGET = new THREE.Vector3(0, 0, -25);
const FOLLOW_OFFSET = new THREE.Vector3(-28, 62, 78);

export function CameraRig({
  mode,
  walkerRef,
  hasRoute,
  controlsRef,
  zoom = 1,
}: {
  mode: CameraMode;
  walkerRef: React.MutableRefObject<THREE.Vector3>;
  hasRoute: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  /** 场景视野缩放（project.sceneZoom），俯瞰高度随其放大 */
  zoom?: number;
}) {
  const { camera } = useThree();
  const desired = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const prevMode = useRef<CameraMode>(mode);

  // 切回自由视角时重置轨道目标
  useEffect(() => {
    if (prevMode.current !== "orbit" && mode === "orbit") {
      const controls = controlsRef.current;
      if (controls) {
        controls.target.set(0, 0, -25);
        controls.update();
      }
    }
    prevMode.current = mode;
  }, [mode, controlsRef]);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.002, Math.min(dt, 0.1));
    const controls = controlsRef.current;

    if (mode === "follow" && hasRoute) {
      if (controls) controls.enabled = false;
      const w = walkerRef.current;
      desired.set(w.x + FOLLOW_OFFSET.x, FOLLOW_OFFSET.y, w.z + FOLLOW_OFFSET.z);
      camera.position.lerp(desired, k);
      look.set(w.x, 2, w.z);
      camera.lookAt(look);
    } else if (mode === "top") {
      if (controls) controls.enabled = false;
      desired.set(TOP_POS.x, TOP_POS.y * zoom, TOP_POS.z);
      camera.position.lerp(desired, k);
      look.set(TOP_TARGET.x, 0, TOP_TARGET.z);
      camera.lookAt(look);
    } else {
      if (controls && !controls.enabled) controls.enabled = true;
    }
  });

  return null;
}
