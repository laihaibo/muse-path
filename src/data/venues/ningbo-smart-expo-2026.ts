/**
 * 2026 智博会（宁波国际会展中心）示例数据
 * 布局与展位为基于公开资料的示意数据，坐标为自定义米制坐标系：
 * 原点在场地中心，+x 向东，+z 向南。北端为中庭序厅，中央南北轴通道，
 * 东西两侧各三座展馆，南广场为主入口。
 */
import type { VenueProject } from "./schema";

const ningbo: VenueProject = {
  id: "ningbo-smart-expo-2026",
  name: "2026 智博会",
  subtitle: "中国国际智能博览会 · 宁波国际会展中心",
  city: "浙江 · 宁波",
  dates: "2026.10.22 – 10.26（示例）",
  description:
    "以「智能赋能 · 慧联全球」为主题，覆盖人形机器人、低空经济、智能网联汽车、AI 大模型、工业互联网与智慧城市等板块。",
  categories: [
    "人形机器人",
    "低空经济",
    "智能网联汽车",
    "AI大模型",
    "集成电路",
    "工业互联网",
    "智慧城市",
    "数字生活",
    "主题打卡",
  ],
  dataNote: "展馆布局与展位为示意数据，仅供路线规划演示。",
  venue: {
    halls: [
      { id: "hall-1", name: "一号馆 · 人形机器人", cx: -110, cz: -60, w: 120, d: 60, h: 9, color: "#38bdf8" },
      { id: "hall-2", name: "二号馆 · 低空经济", cx: -110, cz: -7.5, w: 120, d: 45, h: 9, color: "#a78bfa" },
      { id: "hall-3", name: "三号馆 · 智能网联汽车", cx: -110, cz: 37.5, w: 120, d: 45, h: 9, color: "#fbbf24" },
      { id: "hall-4", name: "四号馆 · AI 大模型与算力", cx: 110, cz: -60, w: 120, d: 60, h: 9, color: "#34d399" },
      { id: "hall-5", name: "五号馆 · 工业互联网", cx: 110, cz: -7.5, w: 120, d: 45, h: 9, color: "#fb7185" },
      { id: "hall-6", name: "六号馆 · 智慧城市与数字生活", cx: 110, cz: 37.5, w: 120, d: 45, h: 9, color: "#22d3ee" },
      { id: "lobby", name: "中庭 · 序厅", cx: 0, cz: -120, w: 120, d: 60, h: 7, color: "#94a3b8" },
    ],
    waypoints: [
      // 主轴（南广场 → 中庭）
      { id: "ent-main", x: 0, z: 95 },
      { id: "sp1", x: 0, z: 55 },
      { id: "sp2", x: 0, z: 15 },
      { id: "sp3", x: 0, z: -30 },
      { id: "sp4", x: 0, z: -75 },
      { id: "sp5", x: 0, z: -100 },
      { id: "sp6", x: 0, z: -120 },
      // 侧入口（位于两馆之间的西侧/东侧门洞）
      { id: "ent-west", x: -110, z: 15 },
      { id: "ent-east", x: 110, z: -30 },
      // 各馆门洞节点
      { id: "d1", x: -34, z: -60 },
      { id: "d2", x: -34, z: -7.5 },
      { id: "d3", x: -34, z: 37.5 },
      { id: "d4", x: 34, z: -60 },
      { id: "d5", x: 34, z: -7.5 },
      { id: "d6", x: 34, z: 37.5 },
      // 一号馆内（西）
      { id: "h1f", x: -85, z: -60 },
      { id: "h1m", x: -110, z: -60 },
      { id: "h1b", x: -140, z: -60 },
      // 二号馆内
      { id: "h2f", x: -85, z: -7.5 },
      { id: "h2m", x: -110, z: -7.5 },
      { id: "h2b", x: -140, z: -7.5 },
      // 三号馆内
      { id: "h3f", x: -85, z: 37.5 },
      { id: "h3m", x: -110, z: 37.5 },
      { id: "h3b", x: -140, z: 37.5 },
      // 四号馆内（东）
      { id: "h4f", x: 85, z: -60 },
      { id: "h4m", x: 110, z: -60 },
      { id: "h4b", x: 140, z: -60 },
      // 五号馆内
      { id: "h5f", x: 85, z: -7.5 },
      { id: "h5m", x: 110, z: -7.5 },
      { id: "h5b", x: 140, z: -7.5 },
      // 六号馆内
      { id: "h6f", x: 85, z: 37.5 },
      { id: "h6m", x: 110, z: 37.5 },
      { id: "h6b", x: 140, z: 37.5 },
      // 中庭
      { id: "lb-west", x: -40, z: -110 },
      { id: "lb-east", x: 40, z: -110 },
    ],
    edges: [
      ["ent-main", "sp1"],
      ["sp1", "sp2"],
      ["sp2", "sp3"],
      ["sp3", "sp4"],
      ["sp4", "sp5"],
      ["sp5", "sp6"],
      ["d1", "sp3"],
      ["d1", "sp4"],
      ["d2", "sp2"],
      ["d2", "sp3"],
      ["d3", "sp1"],
      ["d3", "sp2"],
      ["d4", "sp3"],
      ["d4", "sp4"],
      ["d5", "sp2"],
      ["d5", "sp3"],
      ["d6", "sp1"],
      ["d6", "sp2"],
      ["d1", "h1f"],
      ["h1f", "h1m"],
      ["h1m", "h1b"],
      ["d2", "h2f"],
      ["h2f", "h2m"],
      ["h2m", "h2b"],
      ["d3", "h3f"],
      ["h3f", "h3m"],
      ["h3m", "h3b"],
      ["d4", "h4f"],
      ["h4f", "h4m"],
      ["h4m", "h4b"],
      ["d5", "h5f"],
      ["h5f", "h5m"],
      ["h5m", "h5b"],
      ["d6", "h6f"],
      ["h6f", "h6m"],
      ["h6m", "h6b"],
      ["ent-west", "h2m"],
      ["ent-west", "h3m"],
      ["ent-east", "h4m"],
      ["ent-east", "h5m"],
      ["sp6", "lb-west"],
      ["sp6", "lb-east"],
    ],
    entrances: [
      { id: "main", name: "主入口 · 南广场", x: 0, z: 95, waypoint: "ent-main" },
      { id: "west", name: "西入口（二/三馆之间）", x: -110, z: 15, waypoint: "ent-west" },
      { id: "east", name: "东入口（四/五馆之间）", x: 110, z: -30, waypoint: "ent-east" },
    ],
    pois: [
      // 一号馆 · 人形机器人
      {
        id: "p-robot-show", name: "人形机器人整机秀", hallId: "hall-1", x: -145, z: -50,
        category: "人形机器人", description: "多款全尺寸人形机器人整点集体亮相，展示行走、搬运与灵巧操作。",
        visitMinutes: 15, popularity: 9, nearWaypoint: "h1b", kind: "exhibit",
      },
      {
        id: "p-dexterous", name: "灵巧手遥操作体验", hallId: "hall-1", x: -115, z: -75,
        category: "人形机器人", description: "戴上数据手套遥操作五指灵巧手，抓取易碎物体，可现场排队体验。",
        visitMinutes: 12, popularity: 7, nearWaypoint: "h1m", kind: "exhibit",
      },
      {
        id: "p-quadruped", name: "四足机器人障碍赛", hallId: "hall-1", x: -88, z: -45,
        category: "人形机器人", description: "四足机器狗在模拟废墟赛道上自主越障，每小时一场。",
        visitMinutes: 10, popularity: 8, nearWaypoint: "h1f", kind: "exhibit",
      },
      {
        id: "p-embodied", name: "具身智能开发平台", hallId: "hall-1", x: -70, z: -78,
        category: "AI大模型", description: "大模型驱动的具身智能体开发平台，演示任务级自然语言编排。",
        visitMinutes: 10, popularity: 6, nearWaypoint: "h1f", kind: "exhibit",
      },
      // 二号馆 · 低空经济
      {
        id: "p-evtol", name: "eVTOL 载人飞行器", hallId: "hall-2", x: -140, z: -2,
        category: "低空经济", description: "两座电动垂直起降飞行器真机首展，可进入座舱体验。",
        visitMinutes: 15, popularity: 9, nearWaypoint: "h2b", kind: "exhibit",
      },
      {
        id: "p-drone-swarm", name: "物流无人机集群", hallId: "hall-2", x: -108, z: 6,
        category: "低空经济", description: "城市末端物流无人机编队调度演示与航线网络沙盘。",
        visitMinutes: 10, popularity: 7, nearWaypoint: "h2m", kind: "exhibit",
      },
      {
        id: "p-uom", name: "低空智联网管控平台", hallId: "hall-2", x: -72, z: -18,
        category: "低空经济", description: "低空空域数字化管控系统，实时呈现全域飞行态势。",
        visitMinutes: 8, popularity: 5, nearWaypoint: "h2f", kind: "exhibit",
      },
      // 三号馆 · 智能网联汽车
      {
        id: "p-cabin", name: "智能座舱沉浸体验", hallId: "hall-3", x: -142, z: 48,
        category: "智能网联汽车", description: "环幕座舱 + 车载大模型语音助手，体验「第三生活空间」。",
        visitMinutes: 12, popularity: 8, nearWaypoint: "h3b", kind: "exhibit",
      },
      {
        id: "p-robo-bus", name: "无人驾驶小巴试乘", hallId: "hall-3", x: -100, z: 28,
        category: "智能网联汽车", description: "场内封闭道路 Robobus 试乘，约 8 分钟一圈。",
        visitMinutes: 15, popularity: 9, nearWaypoint: "h3m", kind: "exhibit",
      },
      {
        id: "p-v2x", name: "车路云一体化沙盘", hallId: "hall-3", x: -68, z: 52,
        category: "智能网联汽车", description: "1:50 微缩城区演示车路协同与编队行驶。",
        visitMinutes: 8, popularity: 6, nearWaypoint: "h3f", kind: "exhibit",
      },
      // 四号馆 · AI 大模型与算力
      {
        id: "p-llm", name: "多模态大模型开放日", hallId: "hall-4", x: 70, z: -52,
        category: "AI大模型", description: "最新旗舰模型现场开放对话、图像与视频生成体验。",
        visitMinutes: 12, popularity: 8, nearWaypoint: "h4f", kind: "exhibit",
      },
      {
        id: "p-agent", name: "AI 智能体工坊", hallId: "hall-4", x: 112, z: -78,
        category: "AI大模型", description: "零代码搭建办公智能体，现场 10 分钟上线一个助手。",
        visitMinutes: 10, popularity: 7, nearWaypoint: "h4m", kind: "exhibit",
      },
      {
        id: "p-npu", name: "国产算力与芯片展区", hallId: "hall-4", x: 148, z: -45,
        category: "集成电路", description: "国产训练/推理芯片集群与整机柜方案集中亮相。",
        visitMinutes: 10, popularity: 6, nearWaypoint: "h4b", kind: "exhibit",
      },
      // 五号馆 · 工业互联网
      {
        id: "p-lighthouse", name: "灯塔工厂沙盘", hallId: "hall-5", x: 75, z: -2,
        category: "工业互联网", description: "端到端「黑灯产线」微缩沙盘，AGV 与机械臂协同作业。",
        visitMinutes: 10, popularity: 7, nearWaypoint: "h5f", kind: "exhibit",
      },
      {
        id: "p-cobort", name: "协作机械臂秀场", hallId: "hall-5", x: 122, z: -14,
        category: "工业互联网", description: "人机共融协作臂现场调饮咖啡与写毛笔字。",
        visitMinutes: 8, popularity: 6, nearWaypoint: "h5m", kind: "exhibit",
      },
      {
        id: "p-port", name: "数字孪生港 · 宁波舟山港", hallId: "hall-5", x: 152, z: 4,
        category: "工业互联网", description: "全球第一大港的数字孪生调度大屏，桥吊作业实时复刻。",
        visitMinutes: 12, popularity: 8, nearWaypoint: "h5b", kind: "exhibit",
      },
      // 六号馆 · 智慧城市与数字生活
      {
        id: "p-citybrain", name: "城市大脑 · 智慧治理", hallId: "hall-6", x: 72, z: 32,
        category: "智慧城市", description: "城市级 AI 治理平台，交通、应急与政务一屏统览。",
        visitMinutes: 10, popularity: 6, nearWaypoint: "h6f", kind: "exhibit",
      },
      {
        id: "p-smarthome", name: "智能家居未来屋", hallId: "hall-6", x: 112, z: 55,
        category: "数字生活", description: "1:1 实景样板间，全屋智能无感交互体验。",
        visitMinutes: 12, popularity: 8, nearWaypoint: "h6m", kind: "exhibit",
      },
      {
        id: "p-health", name: "AI 健康管家体验", hallId: "hall-6", x: 150, z: 28,
        category: "数字生活", description: "3 分钟生成个人健康报告，AI 家庭医生问诊演示。",
        visitMinutes: 10, popularity: 7, nearWaypoint: "h6b", kind: "exhibit",
      },
      // 中庭
      {
        id: "p-installation", name: "主题装置「智涌东方」", hallId: "lobby", x: 0, z: -135,
        category: "主题打卡", description: "30 米数字瀑布光影装置，官方打卡点位。",
        visitMinutes: 6, popularity: 8, nearWaypoint: "sp6", kind: "exhibit",
      },
      {
        id: "p-store", name: "官方文创商店", hallId: "lobby", x: -40, z: -108,
        category: "主题打卡", description: "智博会限定机器人手办与文创周边。",
        visitMinutes: 8, popularity: 4, nearWaypoint: "lb-west", kind: "exhibit",
      },
      {
        id: "p-livestream", name: "云上直播间", hallId: "lobby", x: 40, z: -108,
        category: "主题打卡", description: "官方直播间，可围观论坛直播与新品尝鲜。",
        visitMinutes: 6, popularity: 4, nearWaypoint: "lb-east", kind: "exhibit",
      },
      // 服务设施
      {
        id: "s-coffee", name: "中央咖啡区", x: 0, z: 10,
        category: "服务设施", description: "轴通道中段的休息咖啡区，AI 咖啡机器人出品。",
        visitMinutes: 20, popularity: 6, nearWaypoint: "sp2", kind: "service",
      },
      {
        id: "s-infobox", name: "观众服务台", x: 0, z: -112,
        category: "服务设施", description: "问询、导览图与失物招领。",
        visitMinutes: 5, popularity: 3, nearWaypoint: "sp6", kind: "service",
      },
      {
        id: "s-med", name: "医疗点 · 母婴室", x: 24, z: 0,
        category: "服务设施", description: "轴通道东侧医疗服务点。",
        visitMinutes: 5, popularity: 2, nearWaypoint: "sp2", kind: "service",
      },
      {
        id: "s-locker", name: "寄存处", x: 0, z: 80,
        category: "服务设施", description: "主入口旁行李寄存。",
        visitMinutes: 5, popularity: 2, nearWaypoint: "ent-main", kind: "service",
      },
    ],
  },
};

export default ningbo;
