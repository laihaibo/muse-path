/** 寻路层冒烟测试：npm run check（对所有注册场馆逐个校验） */
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
assert(new Set(projects.map((p) => p.id)).size === projects.length, "项目 id 无重复");

for (const project of projects) {
  const venue = project.venue;
  const entry = venue.entrances[0];
  const tag = `【${project.name}】`;

  assert(venue.entrances.length > 0 && venue.edges.length > 0 && venue.pois.length > 0, `${tag}路网/出入口/POI 非空`);

  const g = buildGraph(venue);
  const wpIds = new Set(Object.keys(g.nodes));

  // 图完整性：入口与 POI 挂靠节点都在路网中
  for (const e of venue.entrances) {
    assert(wpIds.has(e.waypoint), `${tag}出入口「${e.name}」挂靠节点存在`);
  }
  for (const poi of venue.pois) {
    assert(wpIds.has(poi.nearWaypoint), `${tag}POI ${poi.id} 挂靠节点存在`);
  }

  // 连通性：每个入口可达每个 POI 挂靠节点
  for (const e of venue.entrances) {
    for (const poi of venue.pois) {
      const r = astar(g, e.waypoint, poi.nearWaypoint);
      if (!r) {
        assert(false, `${tag}入口「${e.name}」可达 ${poi.id}`);
      }
    }
  }
  assert(true, `${tag}各入口可达全部 ${venue.pois.length} 个 POI（图连通）`);

  // A* 基本正确性：直连边距离 = 欧氏距离
  const [a, b] = venue.edges[0];
  const d = astar(g, a, b);
  const expected = Math.hypot(g.nodes[a].x - g.nodes[b].x, g.nodes[a].z - g.nodes[b].z);
  assert(d !== null && Math.abs(d.distance - expected) < 0.01, `${tag}A* 直连边等于欧氏距离`);

  // 2-opt：乱序输入优化后总距离不增加、不丢站
  const top = venue.pois
    .filter((p) => p.kind === "exhibit")
    .sort((x, y) => y.popularity - x.popularity || x.id.localeCompare(y.id))
    .slice(0, 8);
  assert(top.length >= 2, `${tag}展项 POI 数量充足（${top.length} 个入测）`);
  const messy: PlanStop[] = [...top]
    .reverse()
    .map((p) => ({ poiId: p.id, reason: "", plannedMinutes: p.visitMinutes }));
  const costOf = (ids: string[]) => computeRoute(venue, entry.id, ids)!.totalWalkMeters;
  const messyCost = costOf(messy.map((s) => s.poiId));
  const ordered = orderStops(venue, entry.id, messy);
  const orderedCost = costOf(ordered.map((s) => s.poiId));
  assert(orderedCost <= messyCost + 1, `${tag}2-opt 优化 ${messyCost.toFixed(0)}m → ${orderedCost.toFixed(0)}m`);
  assert(
    [...ordered].map((s) => s.poiId).sort().join() === [...messy].map((s) => s.poiId).sort().join(),
    `${tag}2-opt 不丢站、不增站`,
  );

  // 完整路线
  const route = computeRoute(venue, entry.id, ordered.map((s) => s.poiId));
  assert(route !== null && route.pathPoints.length > 10, `${tag}路线折线 ${route?.pathPoints.length} 点`);
  assert(route!.totalMinutes > 30, `${tag}全程约 ${route?.totalMinutes.toFixed(0)} 分钟`);
}

console.log("\n全部通过 ✔");
