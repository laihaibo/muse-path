"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { getProject, projects } from "@/data/venues";
import { computeRoute } from "@/lib/pathfinding/route";
import { rehydrateStore, useAppStore, type MobileTab } from "@/lib/store";
import { initTheme } from "@/lib/theme";
import { Segmented } from "./Glass";
import { IconChat, IconMapPin, IconRoute } from "./icons";
import { PlanChat } from "./chat/PlanChat";
import { PoiInfoCard, SceneControls } from "./controls/SceneControls";
import { ItineraryList } from "./planning/ItineraryList";
import { PlanForm } from "./planning/PlanForm";
import { SettingsSheet } from "./settings/SettingsSheet";
import { TopBar } from "./TopBar";
import VenueScene from "./three/VenueScene";

export default function AppShell() {
  useEffect(() => {
    rehydrateStore();
    return initTheme();
  }, []);

  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const project = getProject(selectedProjectId) ?? projects[0];
  const plan = useAppStore((s) => s.plans[s.selectedProjectId]);
  const entryId = useAppStore((s) => s.entryByProject[s.selectedProjectId]);
  const leftTab = useAppStore((s) => s.leftTab);
  const setLeftTab = useAppStore((s) => s.setLeftTab);
  const chatOpen = useAppStore((s) => s.chatOpen);
  const mobileTab = useAppStore((s) => s.mobileTab);
  const setMobileTab = useAppStore((s) => s.setMobileTab);

  const route = useMemo(() => {
    if (!project || !plan || plan.stops.length === 0) return null;
    const entry = project.venue.entrances.find((e) => e.id === entryId) ?? project.venue.entrances[0];
    return computeRoute(project.venue, entry.id, plan.stops.map((s) => s.poiId));
  }, [project, plan, entryId]);

  if (!project) return null;

  const leftContent =
    leftTab === "plan" ? <PlanForm /> : <ItineraryList route={route} />;

  const mobileTabs: { value: MobileTab; label: string; icon: React.ReactNode }[] = [
    { value: "map", label: "地图", icon: <IconMapPin className="h-[18px] w-[18px]" /> },
    { value: "plan", label: "规划", icon: <IconRoute className="h-[18px] w-[18px]" /> },
    { value: "itinerary", label: "行程", icon: <IconRoute className="h-[18px] w-[18px]" /> },
    { value: "chat", label: "助手", icon: <IconChat className="h-[18px] w-[18px]" /> },
  ];

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#070b16] text-slate-100">
      <VenueScene project={project} route={route} />

      <TopBar />

      {/* 桌面端左侧面板 */}
      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 30 }}
        className="glass fixed bottom-6 left-4 top-20 z-30 hidden w-[352px] flex-col overflow-hidden rounded-3xl md:flex"
      >
        <div className="border-b border-white/10 p-3">
          <Segmented
            value={leftTab}
            onChange={setLeftTab}
            options={[
              { value: "plan", label: "规划" },
              { value: "itinerary", label: "行程" },
            ]}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">{leftContent}</div>
      </motion.aside>

      {/* 桌面端聊天面板 */}
      <AnimatePresence>
        {chatOpen && (
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass fixed bottom-[5.75rem] right-4 top-20 z-30 hidden w-[380px] overflow-hidden rounded-3xl lg:block"
          >
            <PlanChat />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 场景控制（桌面右下 / 移动端顶部下方） */}
      <div className="fixed right-6 top-[4.75rem] z-30 md:bottom-6 md:top-auto">
        <SceneControls />
      </div>

      {/* POI 信息卡 */}
      <div className="pointer-events-none fixed bottom-28 left-1/2 z-40 flex -translate-x-1/2 justify-center md:bottom-8">
        <PoiInfoCard />
      </div>

      {/* 移动端底部面板 */}
      <AnimatePresence>
        {mobileTab !== "map" && (
          <motion.div
            key={mobileTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            className={`glass fixed inset-x-3 bottom-[4.6rem] z-30 overflow-hidden rounded-3xl md:hidden ${
              mobileTab === "chat" ? "h-[60vh]" : "max-h-[56vh]"
            }`}
          >
            {mobileTab === "chat" ? (
              <PlanChat />
            ) : (
              <div className="max-h-[56vh] overflow-y-auto p-4">
                {mobileTab === "plan" ? <PlanForm /> : <ItineraryList route={route} />}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 移动端底部标签栏 */}
      <nav className="glass fixed inset-x-3 bottom-3 z-40 flex h-14 items-center justify-around rounded-2xl md:hidden">
        {mobileTabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setMobileTab(t.value)}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[10px] transition-colors ${
              mobileTab === t.value ? "text-cyan-300" : "text-slate-400"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

      <SettingsSheet />
    </main>
  );
}
