"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { projects } from "@/data/venues";
import { useAppStore } from "@/lib/store";
import { IconChat, IconCheck, IconChevronDown, IconGear } from "./icons";

export function LogoMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8">
      <defs>
        <linearGradient id="lg-route" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" />
      <path
        d="M11 29c0-6 4-6 8-8s6-4 6-10"
        fill="none"
        stroke="url(#lg-route)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="0.2 5.2"
      />
      <circle cx="11" cy="29" r="2.6" fill="#22d3ee" />
      <circle cx="25" cy="11" r="2.6" fill="#a78bfa" />
    </svg>
  );
}

function ProjectSwitcher() {
  const [open, setOpen] = useState(false);
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const current = projects.find((p) => p.id === selectedProjectId) ?? projects[0];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!current) return null;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="glass-chip flex max-w-[46vw] items-center gap-2 rounded-full px-3.5 py-2 text-sm"
      >
        <span className="truncate font-semibold">{current.name}</span>
        <span className="hidden truncate text-xs text-slate-400 sm:inline">{current.city}</span>
        <IconChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="glass-strong absolute left-0 top-12 z-50 w-80 rounded-2xl p-2"
          >
            <div className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              切换场馆项目
            </div>
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedProject(p.id);
                  setOpen(false);
                }}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  p.id === current.id ? "bg-cyan-400/15" : "hover:bg-white/10"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="truncate">{p.name}</span>
                    {p.id === current.id && <IconCheck className="h-3.5 w-3.5 shrink-0 text-cyan-300" />}
                  </div>
                  <div className="truncate text-xs text-slate-400">{p.subtitle}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {p.city} · {p.dates}
                  </div>
                </div>
              </button>
            ))}
            <div className="px-3 pb-1.5 pt-2 text-[11px] text-slate-500">
              想加自己的场馆？往 <span className="text-slate-400">src/data/venues/</span> 加一份数据文件即可。
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TopBar() {
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const chatOpen = useAppStore((s) => s.chatOpen);
  const setChatOpen = useAppStore((s) => s.setChatOpen);
  const mobileTab = useAppStore((s) => s.mobileTab);
  const setMobileTab = useAppStore((s) => s.setMobileTab);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-3 px-4 md:px-6">
      <div className="pointer-events-auto flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <div className="hidden flex-col leading-tight md:flex">
            <span className="text-[15px] font-semibold tracking-wide">MusePath</span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400">AI Route Planner</span>
          </div>
        </div>
        <ProjectSwitcher />
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="AI 助手"
          onClick={() => {
            setChatOpen(!chatOpen);
            if (!chatOpen) setMobileTab("chat");
            else if (mobileTab === "chat") setMobileTab("map");
          }}
          className={`glass-chip flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            chatOpen || mobileTab === "chat" ? "bg-cyan-400/20 text-cyan-200" : "hover:bg-white/15"
          }`}
        >
          <IconChat className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          aria-label="设置"
          onClick={() => setSettingsOpen(true)}
          className="glass-chip flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15"
        >
          <IconGear className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
