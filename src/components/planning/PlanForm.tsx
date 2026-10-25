"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getProject } from "@/data/venues";
import { generateItinerary, describeAiError } from "@/lib/ai/generate";
import { demoPlan } from "@/lib/demo";
import { useAppStore } from "@/lib/store";
import { Chip, GlassButton, SectionTitle } from "../Glass";
import { IconSparkles, Spinner } from "../icons";

export function PlanForm() {
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const aiConfig = useAppStore((s) => s.aiConfig);
  const entryId = useAppStore((s) => s.entryByProject[s.selectedProjectId]);
  const generating = useAppStore((s) => s.generating);
  const planError = useAppStore((s) => s.planError);
  const setEntry = useAppStore((s) => s.setEntry);
  const applyPlan = useAppStore((s) => s.applyPlan);
  const setGenerating = useAppStore((s) => s.setGenerating);
  const setPlanError = useAppStore((s) => s.setPlanError);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  const [interests, setInterests] = useState<string[]>([]);
  const [minutes, setMinutes] = useState(180);

  const project = getProject(selectedProjectId);
  if (!project) return null;
  const entry = project.venue.entrances.find((e) => e.id === entryId) ?? project.venue.entrances[0];

  const toggleInterest = (c: string) =>
    setInterests((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const onGenerate = async () => {
    if (!aiConfig || !aiConfig.apiKey || !aiConfig.baseUrl || !aiConfig.model) {
      setPlanError("请先在设置中配置 AI 服务（Base URL、Key、模型）");
      setSettingsOpen(true);
      return;
    }
    setGenerating(true);
    setPlanError(null);
    try {
      const plan = await generateItinerary(aiConfig, project, {
        interests,
        minutes,
        entryId: entry.id,
      });
      applyPlan(project.id, plan);
    } catch (err) {
      setPlanError(describeAiError(err));
    } finally {
      setGenerating(false);
    }
  };

  const onDemo = () => {
    setPlanError(null);
    applyPlan(project.id, demoPlan(project, entry.id));
  };

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const mustSeeList = project.venue.pois.filter((p) => p.mustSee && p.kind === "exhibit");
  const hallName = (hallId?: string) => project.venue.halls.find((h) => h.id === hallId)?.name ?? "公共区域";

  const eventStyle: Record<string, { title: string; className: string }> = {
    exhibition: { title: "🎪", className: "text-cyan-200" },
    activity: { title: "🎉", className: "text-violet-200" },
    season: { title: "🍂", className: "text-amber-200" },
  };

  const hasEventCard =
    project.events?.length || project.highlights?.length || mustSeeList.length > 0 || project.gifts?.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10">
        <div className="text-sm font-semibold">{project.name}</div>
        <div className="mt-0.5 text-xs text-slate-400">{project.subtitle}</div>
        <div className="mt-1 text-[11px] text-slate-500">
          {project.dates} · {project.dataNote}
        </div>
      </div>

      {hasEventCard ? (
        <div className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10">
          {project.events && project.events.length > 0 && (
            <div className="mb-3">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-200">🍂 当季展会与活动（以园方公告为准）</div>
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-300">
                {project.events.map((e) => {
                  const style = eventStyle[e.kind] ?? eventStyle.exhibition;
                  return (
                    <li key={e.id}>
                      <span className={`font-medium ${style.className}`}>{style.title} {e.name}</span>
                      <span className="text-slate-500"> · {e.period}{e.area ? ` · ${e.area}` : ""}</span>
                      <div className="text-slate-400">{e.description}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {project.highlights && project.highlights.length > 0 && (
            <div className="mb-3">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-cyan-200">✨ 本届亮点</div>
              <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-300">
                {project.highlights.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {mustSeeList.length > 0 && (
            <div className="mb-3">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-amber-200">⭐ 必看推荐</div>
              <ul className="space-y-1 text-xs leading-relaxed text-slate-300">
                {mustSeeList.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="text-left font-medium hover:text-cyan-200"
                      onClick={() => useAppStore.getState().selectPoi(p.id)}
                    >
                      {p.name}
                    </button>
                    <span className="text-slate-500"> · {hallName(p.hallId)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.gifts && project.gifts.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-violet-200">🎁 现场福利（以官方当日为准）</div>
              <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-300">
                {project.gifts.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      <div>
        <SectionTitle>兴趣标签（可多选，不选则由 AI 安排）</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {project.categories.map((c) => (
            <Chip key={c} active={interests.includes(c)} onClick={() => toggleInterest(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>游览时长</SectionTitle>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={60}
            max={360}
            step={30}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="muse-range flex-1"
          />
          <span className="w-20 text-right text-sm font-semibold text-cyan-200">
            {hours > 0 ? `${hours}小时${mins ? mins + "分" : ""}` : `${mins}分钟`}
          </span>
        </div>
      </div>

      <div>
        <SectionTitle>从哪个入口进</SectionTitle>
        <div className="flex flex-col gap-2">
          {project.venue.entrances.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEntry(project.id, e.id)}
              className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all ${
                entry.id === e.id
                  ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
                  : "border-white/12 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <span>{e.name}</span>
              {entry.id === e.id && <span className="text-[11px] text-cyan-300">已选</span>}
            </button>
          ))}
        </div>
      </div>

      {planError && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-200"
        >
          {planError}
        </motion.div>
      )}

      <div className="flex flex-col gap-2">
        <GlassButton variant="primary" onClick={onGenerate} disabled={generating} className="py-2.5">
          {generating ? <Spinner /> : <IconSparkles />}
          {generating ? "AI 规划中…" : "生成专属路线"}
        </GlassButton>
        <GlassButton onClick={onDemo} disabled={generating}>
          没有 Key？看演示路线
        </GlassButton>
      </div>
    </div>
  );
}
