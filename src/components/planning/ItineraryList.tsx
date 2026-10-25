"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { getProject } from "@/data/venues";
import type { ComputedRoute } from "@/lib/pathfinding/route";
import { useAppStore } from "@/lib/store";
import { GlassButton } from "../Glass";
import { IconArrowDown, IconArrowUp, IconMapPin, IconRoute, IconTrash } from "../icons";

const SOURCE_BADGE: Record<string, { label: string; cls: string }> = {
  ai: { label: "AI 生成", cls: "bg-cyan-400/15 text-cyan-200 border-cyan-300/30" },
  demo: { label: "演示", cls: "bg-amber-400/15 text-amber-200 border-amber-300/30" },
  chat: { label: "对话微调", cls: "bg-violet-400/15 text-violet-200 border-violet-300/30" },
};

export function ItineraryList({ route }: { route: ComputedRoute | null }) {
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const plan = useAppStore((s) => s.plans[s.selectedProjectId]);
  const moveStop = useAppStore((s) => s.moveStop);
  const removeStop = useAppStore((s) => s.removeStop);
  const selectPoi = useAppStore((s) => s.selectPoi);
  const setCameraMode = useAppStore((s) => s.setCameraMode);
  const setPlaying = useAppStore((s) => s.setPlaying);
  const setLeftTab = useAppStore((s) => s.setLeftTab);

  const project = getProject(selectedProjectId);
  const hallName = (hallId?: string) => project?.venue.halls.find((h) => h.id === hallId)?.name;

  const walkAfter = useMemo(() => {
    if (!plan || !route) return [];
    return plan.stops.map((_, i) => route.legs[i]?.distance ?? 0);
  }, [plan, route]);

  if (!plan || plan.stops.length === 0 || !project) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/15">
          <IconRoute className="h-5 w-5 text-cyan-300" />
        </div>
        <div className="text-sm font-medium">还没有路线</div>
        <p className="text-xs leading-relaxed text-slate-400">
          在「规划」页选择兴趣与时长，让 AI 为你生成专属观展路线；或先看演示路线感受效果。
        </p>
        <GlassButton onClick={() => setLeftTab("plan")}>去规划</GlassButton>
      </div>
    );
  }

  const badge = SOURCE_BADGE[plan.source] ?? SOURCE_BADGE.ai;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate text-sm font-semibold">{plan.title}</div>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{plan.summary}</p>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
          <span>
            站点 <b className="text-slate-200">{plan.stops.length}</b>
          </span>
          <span>
            步行 <b className="text-slate-200">{(route?.totalWalkMeters ?? 0) / 1000 >= 1
              ? `${((route?.totalWalkMeters ?? 0) / 1000).toFixed(1)} km`
              : `${route?.totalWalkMeters ?? 0} m`}</b>
          </span>
          <span>
            全程约 <b className="text-cyan-300">{route?.totalMinutes ?? "—"}</b> 分钟
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <GlassButton
          variant="primary"
          className="flex-1"
          onClick={() => {
            setCameraMode("follow");
            setPlaying(true);
          }}
        >
          <IconRoute /> 跟随游览
        </GlassButton>
        <GlassButton onClick={() => setLeftTab("plan")}>重新规划</GlassButton>
      </div>

      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {plan.stops.map((stop, i) => {
            const poi = project.venue.pois.find((p) => p.id === stop.poiId);
            if (!poi) return null;
            const walk = walkAfter[i];
            return (
              <motion.div
                key={`${stop.poiId}-${i}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              >
                <button
                  type="button"
                  onClick={() => selectPoi(poi.id)}
                  className="group w-full rounded-2xl bg-white/5 px-3.5 py-3 text-left ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:ring-cyan-300/25"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        poi.kind === "service" ? "bg-amber-400/20 text-amber-200" : "bg-cyan-400/20 text-cyan-200"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{poi.name}</span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          {poi.mustSee && (
                            <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-200">
                              ⭐ 必看
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">{stop.plannedMinutes} 分钟</span>
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                        {poi.hallId && <span className="truncate">{hallName(poi.hallId)}</span>}
                        <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-slate-300">
                          {poi.category}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{stop.reason}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        aria-label="上移"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStop(project.id, i, -1);
                        }}
                        className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        <IconArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="下移"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStop(project.id, i, 1);
                        }}
                        className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        <IconArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="移除"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStop(project.id, i);
                        }}
                        className="rounded-md p-1 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300"
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </button>
                {i < plan.stops.length - 1 && walk > 0 && (
                  <div className="flex items-center gap-2 py-1 pl-9 text-[11px] text-slate-500">
                    <IconMapPin className="h-3 w-3" />
                    步行约 {Math.round(walk)} 米 · {Math.max(1, Math.round(walk / 72))} 分钟
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {plan.tips.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/4 p-3.5">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">小贴士</div>
          <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-300">
            {plan.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
