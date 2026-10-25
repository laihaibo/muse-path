"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getProject } from "@/data/venues";
import { useAppStore, type CameraMode } from "@/lib/store";
import { Segmented } from "../Glass";
import { IconPause, IconPlay } from "../icons";

export function SceneControls() {
  const cameraMode = useAppStore((s) => s.cameraMode);
  const setCameraMode = useAppStore((s) => s.setCameraMode);
  const playing = useAppStore((s) => s.playing);
  const setPlaying = useAppStore((s) => s.setPlaying);
  const hasRoute = useAppStore((s) => {
    const plan = s.plans[s.selectedProjectId];
    return !!plan && plan.stops.length > 0;
  });

  return (
    <div className="pointer-events-auto glass flex items-center gap-1.5 rounded-full px-2 py-1.5">
      <Segmented<CameraMode>
        value={cameraMode}
        onChange={setCameraMode}
        options={[
          { value: "orbit", label: "自由" },
          { value: "top", label: "俯瞰" },
          { value: "follow", label: "跟随" },
        ]}
      />
      <div className="mx-1 h-5 w-px bg-white/15" />
      <button
        type="button"
        aria-label={playing ? "暂停" : "播放"}
        disabled={!hasRoute}
        onClick={() => {
          const next = !playing;
          setPlaying(next);
          if (next) setCameraMode("follow");
        }}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95 ${
          playing ? "bg-cyan-400/25 text-cyan-200" : "text-slate-300 hover:bg-white/12"
        } disabled:opacity-35`}
      >
        {playing ? <IconPause className="h-4 w-4" /> : <IconPlay className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function PoiInfoCard() {
  const selectedPoiId = useAppStore((s) => s.selectedPoiId);
  const selectPoi = useAppStore((s) => s.selectPoi);
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const project = getProject(selectedProjectId);
  const poi = project?.venue.pois.find((p) => p.id === selectedPoiId);
  const inPlanIndex = useAppStore((s) => {
    const plan = s.plans[s.selectedProjectId];
    if (!plan || !selectedPoiId) return -1;
    return plan.stops.findIndex((st) => st.poiId === selectedPoiId);
  });

  return (
    <AnimatePresence>
      {poi && project && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="glass-strong pointer-events-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{poi.name}</span>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">
                  {poi.category}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                {project.venue.halls.find((h) => h.id === poi.hallId)?.name ?? "公共区域"} · 建议 {poi.visitMinutes}{" "}
                分钟 · 人气 {poi.popularity}/10
              </div>
            </div>
            <button
              type="button"
              aria-label="关闭"
              onClick={() => selectPoi(null)}
              className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">{poi.description}</p>
          {inPlanIndex >= 0 && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-2.5 py-1 text-[11px] text-cyan-200">
              在行程中 · 第 {inPlanIndex + 1} 站
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
