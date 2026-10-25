import type { VenueProject } from "@/data/venues/schema";
import type { PlanStop, VisitPlanData } from "@/lib/types";
import { buildGraph } from "@/lib/pathfinding/graph";
import { orderStops } from "@/lib/pathfinding/route";

/** 逐站贪心（最近邻）生成演示路线 — 任何场馆可用 */
function greedyDemo(project: VenueProject, entryId: string): PlanStop[] {
  const v = project.venue;
  const g = buildGraph(v);
  const entry = v.entrances.find((e) => e.id === entryId) ?? v.entrances[0];
  const candidates = v.pois.filter((p) => p.kind === "exhibit" && p.popularity >= 6).slice(0, 9);

  const chosen: typeof candidates = [];
  let cursor = entry.waypoint;
  const pool = [...candidates];
  while (pool.length > 0) {
    let bi = 0;
    let bd = Infinity;
    for (let i = 0; i < pool.length; i++) {
      const wp = pool[i].nearWaypoint;
      const n = g.nodes[wp];
      const c = g.nodes[cursor];
      const d = n && c ? Math.hypot(n.x - c.x, n.z - c.z) : Infinity;
      if (d < bd) {
        bd = d;
        bi = i;
      }
    }
    const next = pool.splice(bi, 1)[0];
    chosen.push(next);
    cursor = next.nearWaypoint;
  }

  return chosen.map((p) => ({
    poiId: p.id,
    reason: `演示路线：${p.category}人气展项（人气 ${p.popularity}/10），接入 AI 后可获得个性化理由。`,
    plannedMinutes: p.visitMinutes,
  }));
}

const ningboCurated = (entryId: string): PlanStop[] => {
  const stops: PlanStop[] = [
    { poiId: "p-installation", reason: "南门进馆第一眼就是中央广场主题装置，先打卡再出发。", plannedMinutes: 6 },
    { poiId: "p-hrg", reason: "本届招牌「人机共生」展区，机器人全链条能力一次看全。", plannedMinutes: 15 },
    { poiId: "p-huawei", reason: "同馆顺路，大模型与算力底座值得停留。", plannedMinutes: 12 },
    { poiId: "p-embodied-factory", reason: "「具身智能进工厂」首次亮相，看人形机器人上产线。", plannedMinutes: 15 },
    { poiId: "p-parts", reason: "零部件「爆炸图」出片又硬核，舜宇/均胜等宁波制造底牌。", plannedMinutes: 12 },
    { poiId: "p-experience", reason: "50 余家智能产品沉浸体验，逛累了也能坐着玩。", plannedMinutes: 15 },
    { poiId: "p-zhiyuan", reason: "智元/火花机器人整机互动，适合收尾前放松。", plannedMinutes: 12 },
    { poiId: "p-security", reason: "北端智慧城市馆的大疆无人机安防实景，离北门近。", plannedMinutes: 12 },
    { poiId: "s-coffee", reason: "中央广场咖啡区休整 20 分钟再战下半场。", plannedMinutes: 20 },
  ];
  // 从北门进入时先逛智慧城市馆（出门即达）
  if (entryId === "north") {
    stops.unshift({ poiId: "p-security", reason: "北门进馆就是智慧城市馆，先看无人机安防实景。", plannedMinutes: 12 });
  }
  return stops;
};

export function demoPlan(project: VenueProject, entryId: string): VisitPlanData {
  const isNingbo = project.id === "ningbo-smart-expo-2026";
  const stops = isNingbo ? ningboCurated(entryId) : greedyDemo(project, entryId);
  return {
    title: "智博会精选半日游（演示）",
    summary:
      "未接入 AI 时的内置演示路线：覆盖人气最高的展项并按顺路方向排列。在设置页配置 API Key 后，即可按你的兴趣生成专属路线。",
    stops: orderStops(project.venue, entryId, stops),
    tips: ["展商与展区信息来自公开报道，展位坐标为示意布局，福利以现场为准。"],
    source: "demo",
    generatedAt: Date.now(),
  };
}
