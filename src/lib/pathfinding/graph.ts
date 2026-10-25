import type { Venue } from "@/data/venues/schema";

export interface GraphNode {
  x: number;
  z: number;
}

export interface VenueGraph {
  nodes: Record<string, GraphNode>;
  adj: Record<string, { to: string; d: number }[]>;
}

export interface PathResult {
  /** 途经节点 id（含起终点） */
  ids: string[];
  /** 折线坐标（含起终点） */
  points: GraphNode[];
  /** 长度（米） */
  distance: number;
}

export function buildGraph(venue: Venue): VenueGraph {
  const nodes: Record<string, GraphNode> = {};
  for (const n of venue.waypoints) nodes[n.id] = { x: n.x, z: n.z };

  const adj: VenueGraph["adj"] = {};
  for (const id in nodes) adj[id] = [];

  const seen = new Set<string>();
  for (const edge of venue.edges) {
    const [a, b] = edge;
    if (!nodes[a] || !nodes[b] || a === b) continue;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].z - nodes[b].z);
    adj[a].push({ to: b, d });
    adj[b].push({ to: a, d });
  }
  return { nodes, adj };
}

export function nearestNode(g: VenueGraph, x: number, z: number): string {
  let best = "";
  let bestD = Infinity;
  for (const id in g.nodes) {
    const n = g.nodes[id];
    const d = (n.x - x) ** 2 + (n.z - z) ** 2;
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  }
  return best;
}

const heuristic = (g: VenueGraph, a: string, b: string) =>
  Math.hypot(g.nodes[a].x - g.nodes[b].x, g.nodes[a].z - g.nodes[b].z);

/** A* 最短路（欧氏启发式，路网规模小，数组开放列表足够） */
export function astar(g: VenueGraph, start: string, goal: string): PathResult | null {
  if (!g.nodes[start] || !g.nodes[goal]) return null;
  if (start === goal) {
    return { ids: [start], points: [g.nodes[start]], distance: 0 };
  }

  const open: { id: string; f: number }[] = [{ id: start, f: heuristic(g, start, goal) }];
  const gScore: Record<string, number> = { [start]: 0 };
  const cameFrom: Record<string, string> = {};
  const closed = new Set<string>();

  while (open.length > 0) {
    // 取 f 最小
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
    const current = open.splice(bi, 1)[0].id;
    if (closed.has(current)) continue;
    closed.add(current);

    if (current === goal) {
      const ids: string[] = [goal];
      let cur = goal;
      while (cameFrom[cur] !== undefined) {
        cur = cameFrom[cur];
        ids.unshift(cur);
      }
      const points = ids.map((id) => g.nodes[id]);
      return { ids, points, distance: gScore[goal] };
    }

    for (const { to, d } of g.adj[current]) {
      if (closed.has(to)) continue;
      const tentative = gScore[current] + d;
      if (gScore[to] === undefined || tentative < gScore[to]) {
        gScore[to] = tentative;
        cameFrom[to] = current;
        open.push({ id: to, f: tentative + heuristic(g, to, goal) });
      }
    }
  }
  return null;
}
