import type { Venue } from "@/data/venues/schema";
import type { PlanStop } from "@/lib/types";
import { astar, buildGraph, nearestNode, type PathResult, type VenueGraph } from "./graph";

export interface RouteLeg {
  /** 起点为 null 表示从入口出发 */
  fromPoiId: string | null;
  toPoiId: string;
  points: [number, number][];
  distance: number;
}

export interface ComputedRoute {
  legs: RouteLeg[];
  /** 全程拼接折线（去重接缝），供 3D 绘制 */
  pathPoints: [number, number][];
  totalWalkMeters: number;
  /** 步行时间（分钟，按 1.2 m/s） */
  walkMinutes: number;
  /** 停留时间（分钟） */
  dwellMinutes: number;
  totalMinutes: number;
}

const WALK_SPEED_M_PER_MIN = 72; // ≈1.2 m/s，馆内步行

function poiById(venue: Venue, id: string) {
  return venue.pois.find((p) => p.id === id);
}

function poiWaypoint(venue: Venue, g: VenueGraph, poiId: string): string {
  const poi = poiById(venue, poiId);
  if (!poi) return nearestNode(g, 0, 0);
  if (poi.nearWaypoint && g.nodes[poi.nearWaypoint]) return poi.nearWaypoint;
  return nearestNode(g, poi.x, poi.z);
}

function legBetween(g: VenueGraph, fromWp: string, toWp: string): { points: [number, number][]; distance: number } {
  const res: PathResult | null = astar(g, fromWp, toWp);
  if (!res) {
    // 路网意外断开时退化为直线，保证可用性
    const a = g.nodes[fromWp];
    const b = g.nodes[toWp];
    return { points: [[a.x, a.z], [b.x, b.z]], distance: Math.hypot(a.x - b.x, a.z - b.z) };
  }
  return { points: res.points.map((p) => [p.x, p.z]), distance: res.distance };
}

export function computeRoute(venue: Venue, entryId: string, orderedPoiIds: string[]): ComputedRoute | null {
  if (orderedPoiIds.length === 0) return null;
  const g = buildGraph(venue);
  const entry = venue.entrances.find((e) => e.id === entryId) ?? venue.entrances[0];
  if (!entry) return null;

  const legs: RouteLeg[] = [];
  let cursor = entry.waypoint;
  let dwell = 0;
  const validIds = orderedPoiIds.filter((id) => poiById(venue, id));

  for (const poiId of validIds) {
    const wp = poiWaypoint(venue, g, poiId);
    const leg = legBetween(g, cursor, wp);
    legs.push({ fromPoiId: legs.length === 0 ? null : validIds[legs.length - 1], toPoiId: poiId, ...leg });
    cursor = wp;
    dwell += poiById(venue, poiId)?.visitMinutes ?? 0;
  }

  const totalWalk = legs.reduce((s, l) => s + l.distance, 0);
  const walkMin = Math.round(totalWalk / WALK_SPEED_M_PER_MIN);

  // 拼接折线（去掉接缝重复点）
  const pathPoints: [number, number][] = [];
  for (const leg of legs) {
    const pts = leg.points;
    for (let i = 0; i < pts.length; i++) {
      if (pathPoints.length > 0 && i === 0) continue;
      pathPoints.push(pts[i]);
    }
  }

  return {
    legs,
    pathPoints,
    totalWalkMeters: Math.round(totalWalk),
    walkMinutes: walkMin,
    dwellMinutes: dwell,
    totalMinutes: walkMin + dwell,
  };
}

/** 节点对步行距离矩阵（A*），下标 0 为入口 */
function buildDistanceMatrix(venue: Venue, entryId: string, poiIds: string[]): number[][] {
  const g = buildGraph(venue);
  const entry = venue.entrances.find((e) => e.id === entryId) ?? venue.entrances[0];
  const anchors = [entry.waypoint, ...poiIds.map((id) => poiWaypoint(venue, g, id))];

  const fallback = (a: string, b: string) => {
    const na = g.nodes[a];
    const nb = g.nodes[b];
    return Math.hypot(na.x - nb.x, na.z - nb.z);
  };

  const n = anchors.length;
  const m: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const res = astar(g, anchors[i], anchors[j]);
      const d = res ? res.distance : fallback(anchors[i], anchors[j]);
      m[i][j] = d;
      m[j][i] = d;
    }
  }
  return m;
}

/**
 * 2-opt 开放路径优化：保持站点集合不变，减少回头路。
 * 第 0 位固定从入口出发；返回按优化后顺序重排的 stops。
 */
export function orderStops(venue: Venue, entryId: string, stops: PlanStop[]): PlanStop[] {
  if (stops.length < 3) return stops;
  const poiIds = stops.map((s) => s.poiId);
  const m = buildDistanceMatrix(venue, entryId, poiIds);

  const routeCost = (order: number[]) => {
    let cost = m[0][order[0] + 1];
    for (let i = 0; i < order.length - 1; i++) cost += m[order[i] + 1][order[i + 1] + 1];
    return cost;
  };

  let order = stops.map((_, i) => i);
  let best = routeCost(order);
  let improved = true;
  let guard = 0;
  while (improved && guard++ < 60) {
    improved = false;
    for (let i = 0; i < order.length - 1; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const candidate = order.slice();
        // 反转 [i..j]
        for (let k = i, l = j; k < l; k++, l--) {
          [candidate[k], candidate[l]] = [candidate[l], candidate[k]];
        }
        const c = routeCost(candidate);
        if (c < best - 0.5) {
          best = c;
          order = candidate;
          improved = true;
        }
      }
    }
  }
  return order.map((idx) => stops[idx]);
}
