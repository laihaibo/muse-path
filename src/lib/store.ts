"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AiConfig, PlanStop, VisitPlanData } from "@/lib/types";
import { defaultProjectId, getProject } from "@/data/venues";

export type CameraMode = "orbit" | "top" | "follow";
export type MobileTab = "map" | "plan" | "itinerary" | "chat";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** 该条消息携带的路线更新是否已应用 */
  applied?: boolean;
  error?: boolean;
}

interface AppState {
  selectedProjectId: string;
  aiConfig: AiConfig | null;
  plans: Record<string, VisitPlanData>;
  entryByProject: Record<string, string>;

  settingsOpen: boolean;
  leftTab: "plan" | "itinerary";
  chatOpen: boolean;
  mobileTab: MobileTab;
  cameraMode: CameraMode;
  playing: boolean;
  generating: boolean;
  planError: string | null;
  selectedPoiId: string | null;
  hoveredPoiId: string | null;
  chatMessages: ChatMessage[];
  chatBusy: boolean;

  setSelectedProject: (id: string) => void;
  setAiConfig: (cfg: AiConfig | null) => void;
  setEntry: (projectId: string, entryId: string) => void;
  setSettingsOpen: (open: boolean) => void;
  setLeftTab: (tab: "plan" | "itinerary") => void;
  setChatOpen: (open: boolean) => void;
  setMobileTab: (tab: MobileTab) => void;
  setCameraMode: (mode: CameraMode) => void;
  setPlaying: (playing: boolean) => void;
  setGenerating: (busy: boolean) => void;
  setPlanError: (msg: string | null) => void;
  selectPoi: (id: string | null) => void;
  hoverPoi: (id: string | null) => void;

  applyPlan: (projectId: string, plan: VisitPlanData) => void;
  applyChatStops: (projectId: string, stops: PlanStop[], summary: string) => boolean;
  moveStop: (projectId: string, index: number, dir: -1 | 1) => void;
  removeStop: (projectId: string, index: number) => void;

  pushChat: (msg: ChatMessage) => void;
  updateChat: (id: string, patch: Partial<ChatMessage>) => void;
  clearChat: () => void;
  setChatBusy: (busy: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedProjectId: defaultProjectId,
      aiConfig: null,
      plans: {},
      entryByProject: {},

      settingsOpen: false,
      leftTab: "plan",
      chatOpen: false,
      mobileTab: "map",
      cameraMode: "orbit",
      playing: false,
      generating: false,
      planError: null,
      selectedPoiId: null,
      hoveredPoiId: null,
      chatMessages: [],
      chatBusy: false,

      setSelectedProject: (id) =>
        set({ selectedProjectId: id, selectedPoiId: null, planError: null, playing: false, cameraMode: "orbit" }),
      setAiConfig: (cfg) => set({ aiConfig: cfg }),
      setEntry: (projectId, entryId) => set((s) => ({ entryByProject: { ...s.entryByProject, [projectId]: entryId } })),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setLeftTab: (tab) => set({ leftTab: tab }),
      setChatOpen: (open) => set({ chatOpen: open }),
      setMobileTab: (tab) => set({ mobileTab: tab }),
      setCameraMode: (mode) => set({ cameraMode: mode }),
      setPlaying: (playing) => set({ playing }),
      setGenerating: (busy) => set({ generating: busy }),
      setPlanError: (msg) => set({ planError: msg }),
      selectPoi: (id) => set({ selectedPoiId: id }),
      hoverPoi: (id) => set({ hoveredPoiId: id }),

      applyPlan: (projectId, plan) =>
        set((s) => ({
          plans: { ...s.plans, [projectId]: plan },
          leftTab: "itinerary",
          mobileTab: "itinerary",
          planError: null,
          selectedPoiId: null,
          playing: false,
        })),

      applyChatStops: (projectId, stops, summary) => {
        const state = useAppStore.getState();
        const project = getProject(state.selectedProjectId);
        if (!project) return false;
        const validIds = new Set(project.venue.pois.map((p) => p.id));
        const valid = stops.filter((s) => validIds.has(s.poiId));
        if (valid.length === 0) return false;
        const existing = state.plans[projectId];
        if (!existing) return false;
        set((s) => ({
          plans: {
            ...s.plans,
            [projectId]: { ...existing, stops: valid, summary, source: "chat" },
          },
          playing: false,
        }));
        return true;
      },

      moveStop: (projectId, index, dir) =>
        set((s) => {
          const plan = s.plans[projectId];
          if (!plan) return s;
          const stops = [...plan.stops];
          const j = index + dir;
          if (j < 0 || j >= stops.length) return s;
          [stops[index], stops[j]] = [stops[j], stops[index]];
          return { plans: { ...s.plans, [projectId]: { ...plan, stops } }, playing: false };
        }),

      removeStop: (projectId, index) =>
        set((s) => {
          const plan = s.plans[projectId];
          if (!plan) return s;
          const stops = plan.stops.filter((_, i) => i !== index);
          if (stops.length === 0) {
            const { [projectId]: _removed, ...rest } = s.plans;
            return { plans: rest, playing: false };
          }
          return { plans: { ...s.plans, [projectId]: { ...plan, stops } }, playing: false };
        }),

      pushChat: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      updateChat: (id, patch) =>
        set((s) => ({
          chatMessages: s.chatMessages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      clearChat: () => set({ chatMessages: [] }),
      setChatBusy: (busy) => set({ chatBusy: busy }),
    }),
    {
      name: "musepath-store-v1",
      version: 1,
      // v1：默认场馆切换后，旧持久化的场馆选择作废（API 配置与路线保留）
      migrate: (persisted) => ({
        ...(persisted as Pick<AppState, "selectedProjectId" | "aiConfig" | "plans" | "entryByProject">),
        selectedProjectId: defaultProjectId,
      }),
      skipHydration: true,
      partialize: (s) => ({
        selectedProjectId: s.selectedProjectId,
        aiConfig: s.aiConfig,
        plans: s.plans,
        entryByProject: s.entryByProject,
      }),
    },
  ),
);

/** 挂载后调用：从 localStorage 恢复持久化状态 */
export function rehydrateStore() {
  void useAppStore.persist.rehydrate();
}
