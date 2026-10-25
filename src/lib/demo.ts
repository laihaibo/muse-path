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

/** 宁波植物园深秋精选路线（2026.10 时令快照） */
const gardenCurated = (entryId: string): PlanStop[] => {
  const stops: PlanStop[] = [
    { poiId: "p-gw-rainforest", reason: "一号门进园即达展览温室，雾森雨林是全园人气王，先趁体力充沛逛透。", plannedMinutes: 40 },
    { poiId: "p-orchid-show", reason: "温室广场上的十周年热带兰展顺路打卡，花色正艳。", plannedMinutes: 20 },
    { poiId: "p-gw-carnivorous", reason: "食虫植物馆就在温室北侧，捕蝇草最适合带娃围观。", plannedMinutes: 20 },
    { poiId: "p-chrysanth-show", reason: "兰园菊展主展区沿主轴东侧，深秋花事当前非看不可。", plannedMinutes: 35 },
    { poiId: "p-evolution-road", reason: "走一段「植物进化之路」科普长廊，顺势过渡到环湖段。", plannedMinutes: 20 },
    { poiId: "p-boat-pier", reason: "中心湖游船码头登船，水上视角看两湖秋色省脚力。", plannedMinutes: 30 },
    { poiId: "s-teahouse", reason: "湖畔茶座歇脚补 水，再看一眼湖上落羽杉。", plannedMinutes: 20 },
    { poiId: "p-aquatic-forest", reason: "水上森林栈道是深秋限定，落羽杉正在转色。", plannedMinutes: 30 },
    { poiId: "p-maple-autumn", reason: "槭树秋香园收尾，下午 3–5 点逆光拍秋枫最出片。", plannedMinutes: 30 },
  ];
  // 三号门（北侧）进入时，先游北岸秋色再南下温室
  if (entryId === "gate-3") {
    stops.unshift({ poiId: "p-maple-autumn", reason: "三号门进园先抵槭树秋香园，出门即秋枫红叶。", plannedMinutes: 30 });
  }
  return stops;
};

/** 按项目定制的演示路线；未定制的场馆走最近邻贪心 */
const curatedByProject: Record<string, (entryId: string) => PlanStop[]> = {
  "ningbo-smart-expo-2026": ningboCurated,
  "ningbo-botanical-garden": gardenCurated,
};

export function demoPlan(project: VenueProject, entryId: string): VisitPlanData {
  const curated = curatedByProject[project.id];
  const stops = curated ? curated(entryId) : greedyDemo(project, entryId);
  return {
    title: `${project.name}精选半日游（演示）`,
    summary:
      "未接入 AI 时的内置演示路线：覆盖当前时令人气最高的展项并按顺路方向排列。在设置页配置 API Key 后，即可按你的兴趣生成专属路线。",
    stops: orderStops(project.venue, entryId, stops),
    tips: [
      project.id === "ningbo-botanical-garden"
        ? "园区/专类园/出入口为真实名称，坐标为示意还原；花讯与活动信息截至 2026.10，以园方当日公告为准。"
        : "展商与展区信息来自公开报道，展位坐标为示意布局，福利以现场为准。",
    ],
    source: "demo",
    generatedAt: Date.now(),
  };
}
