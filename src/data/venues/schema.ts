/** 场馆项目数据模型 — 新增一个场馆 = 一份 VenueProject 数据文件 + 注册表一行 */

export interface Rect {
  /** 中心 x（米，+x 向东） */
  cx: number;
  /** 中心 z（米，+z 向南） */
  cz: number;
  w: number;
  d: number;
  /** 高度（米） */
  h: number;
}

export interface Hall extends Rect {
  id: string;
  name: string;
  /** 该馆强调色（3D 描边 / 标签） */
  color: string;
}

export interface Waypoint {
  id: string;
  x: number;
  z: number;
}

export type Edge = [string, string];

export interface Entrance {
  id: string;
  name: string;
  x: number;
  z: number;
  /** 对应路网节点 id（entrance 自身也注册为 waypoint） */
  waypoint: string;
}

export interface POI {
  id: string;
  name: string;
  /** 所在展馆；服务设施等场外点可空 */
  hallId?: string;
  x: number;
  z: number;
  category: string;
  description: string;
  /** 建议停留（分钟） */
  visitMinutes: number;
  /** 人气 1–10 */
  popularity: number;
  /** 就近路网节点 id */
  nearWaypoint: string;
  /** 服务设施（休息/咖啡等，AI 可插入行程但通常不作为兴趣点） */
  kind: "exhibit" | "service";
  /** 官方/媒体重点推荐的必看点，行程与信息卡中会加标记 */
  mustSee?: boolean;
}

export interface Venue {
  halls: Hall[];
  waypoints: Waypoint[];
  edges: Edge[];
  pois: POI[];
  entrances: Entrance[];
}

export interface VenueProject {
  id: string;
  name: string;
  subtitle: string;
  city: string;
  dates: string;
  description: string;
  /** 兴趣标签（供表单选择与 AI 提示） */
  categories: string[];
  /** 数据说明，UI 上明示（如“示意数据”） */
  dataNote: string;
  /** 本届亮点（来自公开报道） */
  highlights?: string[];
  /** 现场福利/值得拿的礼品（以官方当日为准） */
  gifts?: string[];
  /** 当前时令一句话概述（常年开放场馆用，如花讯/红叶季） */
  seasonNote?: string;
  /** 当前进行中的展会/活动/时令看点（供表单展示与 AI 提示） */
  events?: VenueEvent[];
  /** 3D 场景视野缩放：场地比默认（±400m 级）更大时调高，相机高度/雾效/可拉远距离随其等比放大，默认 1 */
  sceneZoom?: number;
  venue: Venue;
}

export interface VenueEvent {
  id: string;
  name: string;
  /** 档期文案，如“10月底 – 12月初” */
  period: string;
  /** 所在区域/场馆名（自由文本，对应 halls/pois 名称） */
  area?: string;
  description: string;
  kind: "exhibition" | "activity" | "season";
}
