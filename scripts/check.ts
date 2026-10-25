/** 寻路层冒烟测试：npm run check */
import { projects, defaultProjectId, getProject } from "../src/data/venues";
import { astar, buildGraph } from "../src/lib/pathfinding/graph";
import { computeRoute, orderStops } from "../src/lib/pathfinding/route";
import type { PlanStop } from "../src/lib/types";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`✗ ${msg}`);
    process.exit(1);
  }
  console.log(`✓ ${msg}`);
}

// 注册表
assert(projects.length > 0, "注册表非空");
assert(getProject(defaultProjectId) !== undefined, "默认项目可取到");

const venue = getProject(defaultProjectId)!.venue;
const g = buildGraph(venue);

// 图完整性：每个 POI 挂靠节点与入口都可达
assert(g.nodes["ent-main"] !== undefined, "主入口在路网中");
for (const poi of venue.pois) {
  assert(g.nodes[poi.nearWaypoint] !== undefined, `POI ${poi.id} 挂靠节点存在`);
}

// A* 基本正确性：入口 → 一号馆深处
const r = astar(g, "ent-main", "h1b");
assert(r !== null && r.distance > 50 && r.distance < 400, `A* 入口→一号馆内 ${r?.distance.toFixed(1)}m 合理`);

// 直连边距离 = 欧氏距离
const d1sp3 = astar(g, "d1", "sp3");
const expected = Math.hypot(g.nodes.d1.x - g.nodes.sp3.x, g.nodes.d1.z - g.nodes.sp3.z);
assert(d1sp3 !== null && Math.abs(d1sp3.distance - expected) < 0.01, "A* 走直连边时等于欧氏距离");

// 2-opt：乱序输入优化后总距离不增加
const messy: PlanStop[] = [
  { poiId: "p-installation", reason: "", plannedMinutes: 6 },
  { poiId: "p-robot-show", reason: "", plannedMinutes: 15 },
  { poiId: "p-robo-bus", reason: "", plannedMinutes: 15 },
  { poiId: "p-cabin", reason: "", plannedMinutes: 12 },
  { poiId: "p-evtol", reason: "", plannedMinutes: 15 },
  { poiId: "p-citybrain", reason: "", plannedMinutes: 10 },
  { poiId: "p-dexterous", reason: "", plannedMinutes: 12 },
  { poiId: "p-port", reason: "", plannedMinutes: 12 },
];
const costOf = (ids: string[]) => {
  const route = computeRoute(venue, "main", ids)!;
  return route.totalWalkMeters;
};
const messyCost = costOf(messy.map((s) => s.poiId));
const ordered = orderStops(venue, "main", messy);
const orderedCost = costOf(ordered.map((s) => s.poiId));
assert(orderedCost <= messyCost + 1, `2-opt 优化 ${messyCost}m → ${orderedCost}m`);
assert(
  [...ordered].map((s) => s.poiId).sort().join() === [...messy].map((s) => s.poiId).sort().join(),
  "2-opt 不丢站、不增站",
);

// 完整路线
const route = computeRoute(venue, "main", ordered.map((s) => s.poiId));
assert(route !== null && route.pathPoints.length > 10, `路线折线 ${route?.pathPoints.length} 点`);
assert(route!.totalMinutes > 30, `全程约 ${route?.totalMinutes} 分钟`);

console.log("\n全部通过 ✔");
