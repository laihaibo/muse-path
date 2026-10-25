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
    { poiId: "p-robo-bus", reason: "人气王项目，先取号排队，等待期间正好逛旁边的车路云沙盘。", plannedMinutes: 15 },
    { poiId: "p-v2x", reason: "排队小巴时顺路观看，1:50 微缩城区很出片。", plannedMinutes: 8 },
    { poiId: "p-cabin", reason: "三号馆尽头环幕座舱，无人驾驶体验的补充。", plannedMinutes: 12 },
    { poiId: "p-drone-swarm", reason: "北上二号馆看物流无人机编队调度，低空经济入门首选。", plannedMinutes: 10 },
    { poiId: "p-evtol", reason: "可进舱的 eVTOL 真机，本次展会打卡度最高的展项之一。", plannedMinutes: 15 },
    { poiId: "p-quadruped", reason: "一号馆障碍赛整点开场，卡点观看效率最高。", plannedMinutes: 10 },
    { poiId: "p-robot-show", reason: "全尺寸人形机器人整机秀，本届智博会的招牌。", plannedMinutes: 15 },
    { poiId: "s-coffee", reason: "看完重头戏，在轴通道中段咖啡区休整 20 分钟。", plannedMinutes: 20 },
    { poiId: "p-installation", reason: "收尾到北端中庭，30 米光影装置前拍完打卡照离场。", plannedMinutes: 6 },
  ];
  // 从东侧入口进入时按东馆优先微调说明（顺序仍由 2-opt 决定）
  if (entryId === "east") {
    stops[0] = { poiId: "p-lighthouse", reason: "东入口进门就是五号馆，先看灯塔工厂黑灯产线。", plannedMinutes: 10 };
    stops.splice(1, 2, {
      poiId: "p-llm",
      reason: "四号馆多模态大模型开放日，现场对话体验旗舰模型。",
      plannedMinutes: 12,
    });
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
    tips: ["演示数据仅供展示，展项与布局为示意内容。"],
    source: "demo",
    generatedAt: Date.now(),
  };
}
