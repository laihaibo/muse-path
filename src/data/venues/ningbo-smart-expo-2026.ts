/**
 * 第十六届智博会（宁波国际会展中心，2026.9.11–9.13）
 * 展馆主题、参展企业与展区信息来自公开报道（官网 cnsce.net、央广网、凤凰网宁波等）。
 * 坐标为自定义米制示意布局（原点场地中心，+x 向东，+z 向南）：
 * 五大专馆环绕中央广场，呼应会展中心环形馆群的真实格局；
 * 南门（会展路）为主入口，北门（通途路）经智慧城市馆入场，东西门居侧。
 */
import type { VenueProject } from "./schema";

const ningbo: VenueProject = {
  id: "ningbo-smart-expo-2026",
  name: "第十六届智博会",
  subtitle: "智慧城市与智能经济博览会 · 宁波国际会展中心",
  city: "浙江 · 宁波",
  dates: "2026.9.11 – 9.13",
  description:
    "主题「AI智变，慧聚未来」：数智科创、AI+制造、智能产品、数字产业、智慧城市五大专馆，380 余家企事业单位参展。",
  categories: [
    "具身智能",
    "人形机器人",
    "大模型与算力",
    "AI+制造",
    "智能终端",
    "智能家居",
    "数字文娱",
    "空天信息",
    "智慧治理",
    "产业生态",
    "主题打卡",
  ],
  dataNote: "展馆主题、展商与展区来自公开报道；展位坐标为示意布局，福利信息以现场为准。",
  highlights: [
    "主题「AI智变，慧聚未来」：五大专馆、约 3 万平方米展览",
    "380 余家企事业单位参展，2287 项前沿技术产品，52 项首发首展",
    "首次打造「人机共生」展区：机器人『大脑—小脑—躯干—整机』全链条",
    "首次设置「具身智能进工厂」「模数共振」两大特色展区",
    "首次设一体化智能产品体验中心与 AIOPC 创新集市",
  ],
  gifts: [
    "企业展位互动礼：参与展台小体验常有定制小礼品，先到先得",
    "官方文创周边：智博会限定机器人文创与纪念品",
    "首发首展打卡：部分展台设限量纪念礼",
    "智能产品体验中心：或有试用与抽奖福利",
  ],
  venue: {
    halls: [
      { id: "hall-sz", name: "数智科创馆", cx: -130, cz: -60, w: 110, d: 55, h: 9, color: "#38bdf8" },
      { id: "hall-mfg", name: "AI+制造馆", cx: 130, cz: -60, w: 110, d: 55, h: 9, color: "#fbbf24" },
      { id: "hall-city", name: "智慧城市馆", cx: 0, cz: -130, w: 110, d: 55, h: 9, color: "#34d399" },
      { id: "hall-prod", name: "智能产品馆", cx: -130, cz: 60, w: 110, d: 55, h: 9, color: "#a78bfa" },
      { id: "hall-dig", name: "数字产业馆", cx: 130, cz: 60, w: 110, d: 55, h: 9, color: "#fb7185" },
    ],
    waypoints: [
      // 主轴（南门 → 中央广场 → 智慧城市馆）
      { id: "ent-s", x: 0, z: 150 },
      { id: "ps", x: 0, z: 110 },
      { id: "s1", x: 0, z: 55 },
      { id: "c", x: 0, z: 0 },
      { id: "n1", x: 0, z: -55 },
      // 环广场回路
      { id: "rw1", x: -75, z: 35 },
      { id: "rw2", x: 75, z: 35 },
      { id: "rw3", x: 75, z: -35 },
      { id: "rw4", x: -75, z: -35 },
      // 四门
      { id: "ent-n", x: 0, z: -190 },
      { id: "pn", x: 0, z: -160 },
      { id: "ent-w", x: -200, z: 0 },
      { id: "pw", x: -170, z: 0 },
      { id: "ent-e", x: 200, z: 0 },
      { id: "pe", x: 170, z: 0 },
      // 智慧城市馆（南北两门 + 馆内）
      { id: "d-city", x: 0, z: -98 },
      { id: "h-city2", x: 0, z: -112 },
      { id: "h-city1", x: 0, z: -140 },
      { id: "d-city-n", x: 0, z: -165 },
      // 数智科创馆（西北）
      { id: "d-sz", x: -70, z: -60 },
      { id: "h-sz1", x: -100, z: -60 },
      { id: "h-sz2", x: -130, z: -60 },
      { id: "h-sz3", x: -160, z: -60 },
      // AI+制造馆（东北）
      { id: "d-mfg", x: 70, z: -60 },
      { id: "h-mfg1", x: 100, z: -60 },
      { id: "h-mfg2", x: 130, z: -60 },
      { id: "h-mfg3", x: 160, z: -60 },
      // 智能产品馆（西南）
      { id: "d-prod", x: -70, z: 60 },
      { id: "h-prod1", x: -100, z: 60 },
      { id: "h-prod2", x: -130, z: 60 },
      { id: "h-prod3", x: -160, z: 60 },
      // 数字产业馆（东南）
      { id: "d-dig", x: 70, z: 60 },
      { id: "h-dig1", x: 100, z: 60 },
      { id: "h-dig2", x: 130, z: 60 },
      { id: "h-dig3", x: 160, z: 60 },
    ],
    edges: [
      ["ent-s", "ps"],
      ["ps", "s1"],
      ["s1", "c"],
      ["c", "n1"],
      // 环广场 + 放射捷径
      ["s1", "rw1"],
      ["s1", "rw2"],
      ["rw1", "c"],
      ["rw2", "c"],
      ["rw3", "c"],
      ["rw4", "c"],
      ["rw1", "rw4"],
      ["rw2", "rw3"],
      ["rw4", "n1"],
      ["rw3", "n1"],
      // 西/东门
      ["ent-w", "pw"],
      ["pw", "rw1"],
      ["pw", "rw4"],
      ["ent-e", "pe"],
      ["pe", "rw2"],
      ["pe", "rw3"],
      // 北门：绕行/穿行智慧城市馆
      ["ent-n", "pn"],
      ["pn", "d-city-n"],
      ["d-city-n", "h-city1"],
      ["h-city1", "h-city2"],
      ["h-city2", "d-city"],
      ["d-city", "n1"],
      // 各馆门洞与馆内通道
      ["d-sz", "rw4"],
      ["d-sz", "h-sz1"],
      ["h-sz1", "h-sz2"],
      ["h-sz2", "h-sz3"],
      ["d-mfg", "rw3"],
      ["d-mfg", "h-mfg1"],
      ["h-mfg1", "h-mfg2"],
      ["h-mfg2", "h-mfg3"],
      ["d-prod", "rw1"],
      ["d-prod", "h-prod1"],
      ["h-prod1", "h-prod2"],
      ["h-prod2", "h-prod3"],
      ["d-dig", "rw2"],
      ["d-dig", "h-dig1"],
      ["h-dig1", "h-dig2"],
      ["h-dig2", "h-dig3"],
    ],
    entrances: [
      { id: "south", name: "南门（会展路 · 主入口）", x: 0, z: 150, waypoint: "ent-s" },
      { id: "north", name: "北门（通途路）", x: 0, z: -190, waypoint: "ent-n" },
      { id: "west", name: "西门", x: -200, z: 0, waypoint: "ent-w" },
      { id: "east", name: "东门", x: 200, z: 0, waypoint: "ent-e" },
    ],
    pois: [
      // 数智科创馆
      {
        id: "p-hrg", name: "「人机共生」展区", hallId: "hall-sz", x: -160, z: -50,
        category: "具身智能",
        description:
          "本届首次打造：云深处、爱芯元智、博登智能、柏奥尼克等近 10 家头部企业，呈现机器人『大脑—小脑—躯干—整机』全链条能力。",
        visitMinutes: 15, popularity: 9, nearWaypoint: "h-sz3", kind: "exhibit", mustSee: true,
      },
      {
        id: "p-huawei", name: "华为 · 阿里前沿技术展区", hallId: "hall-sz", x: -125, z: -74,
        category: "大模型与算力",
        description: "头部科技企业带来大模型、算力底座与行业智能化解决方案。",
        visitMinutes: 12, popularity: 8, nearWaypoint: "h-sz2", kind: "exhibit",
      },
      {
        id: "p-embodied-sz", name: "具身智能场景演示", hallId: "hall-sz", x: -100, z: -78,
        category: "具身智能",
        description: "宇树科技、吉利等企业实景演示护理陪护、智慧零售等具身智能应用场景。",
        visitMinutes: 12, popularity: 8, nearWaypoint: "h-sz1", kind: "exhibit",
      },
      {
        id: "p-yongjiang", name: "甬江实验室 · 国家级 AI 中试基地", hallId: "hall-sz", x: -95, z: -42,
        category: "大模型与算力",
        description: "本地科创平台集中发布前沿技术成果与中试转化项目。",
        visitMinutes: 10, popularity: 7, nearWaypoint: "h-sz1", kind: "exhibit",
      },
      // AI+制造馆
      {
        id: "p-embodied-factory", name: "「具身智能进工厂」展区", hallId: "hall-mfg", x: 125, z: -76,
        category: "AI+制造",
        description:
          "本届首次设置：浙江人形机器人创新中心、乐聚智能、均普智能、智昌展示人形机器人在汽车零部件、纺织服装、智能家电产线的应用。",
        visitMinutes: 15, popularity: 9, nearWaypoint: "h-mfg2", kind: "exhibit", mustSee: true,
      },
      {
        id: "p-parts", name: "人形机器人零部件「爆炸图」", hallId: "hall-mfg", x: 160, z: -48,
        category: "人形机器人",
        description:
          "舜宇光学、中大力德、敏实集团、均胜电子联合展示电机、减速器等核心零部件，首次呈现机器人零部件产业集群实体『爆炸图』。",
        visitMinutes: 12, popularity: 9, nearWaypoint: "h-mfg3", kind: "exhibit", mustSee: true,
      },
      {
        id: "p-moden", name: "「模数共振」特色展区", hallId: "hall-mfg", x: 95, z: -44,
        category: "AI+制造",
        description: "本届首次设置：工业数据与行业大模型融合应用的最新实践。",
        visitMinutes: 10, popularity: 7, nearWaypoint: "h-mfg1", kind: "exhibit",
      },
      // 智能产品馆
      {
        id: "p-experience", name: "一体化智能产品体验中心", hallId: "hall-prod", x: -160, z: 48,
        category: "智能终端",
        description:
          "本届首次打造：科大讯飞、央广云数、火花机器人等 50 余家企业的可穿戴设备、智能机器人、智能终端沉浸式体验。",
        visitMinutes: 15, popularity: 8, nearWaypoint: "h-prod3", kind: "exhibit", mustSee: true,
      },
      {
        id: "p-iflytek", name: "科大讯飞智能终端", hallId: "hall-prod", x: -125, z: 74,
        category: "智能终端",
        description: "星火大模型全系终端：办公本、学习机与 AI 健康产品现场试用。",
        visitMinutes: 10, popularity: 8, nearWaypoint: "h-prod2", kind: "exhibit",
      },
      {
        id: "p-zhiyuan", name: "智元机器人 · 火花机器人", hallId: "hall-prod", x: -95, z: 44,
        category: "人形机器人",
        description: "家用与商用机器人整机互动演示，可近距离对话与操作。",
        visitMinutes: 12, popularity: 8, nearWaypoint: "h-prod1", kind: "exhibit",
      },
      {
        id: "p-toys", name: "数字文娱与智能家居专区", hallId: "hall-prod", x: -110, z: 82,
        category: "数字文娱",
        description: "智能家居未来屋与数字文娱新品，释放数字消费潜力。",
        visitMinutes: 8, popularity: 6, nearWaypoint: "h-prod2", kind: "exhibit",
      },
      // 数字产业馆
      {
        id: "p-space", name: "北斗空天信息 · 量子科技展区", hallId: "hall-dig", x: 160, z: 48,
        category: "空天信息",
        description: "『北斗+空天信息』、量子科技、智能传感与元宇宙等前沿产业技术突破。",
        visitMinutes: 10, popularity: 7, nearWaypoint: "h-dig3", kind: "exhibit",
      },
      {
        id: "p-aiopc", name: "AIOPC 创新展区与创新集市", hallId: "hall-dig", x: 95, z: 44,
        category: "产业生态",
        description: "本届首次设立：新锐创新企业集市，逛展淘新产品的好去处。",
        visitMinutes: 10, popularity: 6, nearWaypoint: "h-dig1", kind: "exhibit",
      },
      {
        id: "p-parks", name: "「一园一特色」园区联展", hallId: "hall-dig", x: 125, z: 74,
        category: "产业生态",
        description: "7 家产业园区平台集中展示各自特色产业集群与招商政策。",
        visitMinutes: 8, popularity: 5, nearWaypoint: "h-dig2", kind: "exhibit",
      },
      // 智慧城市馆
      {
        id: "p-security", name: "城市安防治理实景演示", hallId: "hall-city", x: 28, z: -140,
        category: "智慧治理",
        description:
          "大疆、翼新智能、宁波东方理工大学等展示数字孪生、无人机与智能视觉在城市安防治理中的实景应用。",
        visitMinutes: 12, popularity: 8, nearWaypoint: "h-city1", kind: "exhibit", mustSee: true,
      },
      {
        id: "p-twin", name: "数字孪生城市大屏", hallId: "hall-city", x: -30, z: -112,
        category: "智慧治理",
        description: "城市运行数据一屏统览，交通、应急与公共服务数字化治理演示。",
        visitMinutes: 8, popularity: 6, nearWaypoint: "h-city2", kind: "exhibit",
      },
      // 中央广场
      {
        id: "p-installation", name: "「AI智变」主题装置", hallId: undefined, x: 0, z: -8,
        category: "主题打卡",
        description: "中央广场标志性光影装置，官方打卡点位，从南门进馆一眼可见。",
        visitMinutes: 6, popularity: 8, nearWaypoint: "c", kind: "exhibit", mustSee: true,
      },
      {
        id: "p-creativity", name: "首发首展 · 官方文创展示区", hallId: undefined, x: 25, z: 12,
        category: "主题打卡",
        description: "52 项首发首展导览信息集中呈现，智博会限定文创周边可在此选购。",
        visitMinutes: 8, popularity: 6, nearWaypoint: "c", kind: "exhibit",
      },
      // 服务设施
      {
        id: "s-info", name: "观众服务台", x: 0, z: 100,
        category: "服务设施", description: "问询、导览图与失物招领，位于南门内广场。",
        visitMinutes: 5, popularity: 3, nearWaypoint: "ps", kind: "service",
      },
      {
        id: "s-locker", name: "寄存处", x: 0, z: 142,
        category: "服务设施", description: "南门旁行李寄存，逛展更轻松。",
        visitMinutes: 5, popularity: 2, nearWaypoint: "ent-s", kind: "service",
      },
      {
        id: "s-coffee", name: "中央咖啡休息区", x: -20, z: 8,
        category: "服务设施", description: "中央广场西侧休息咖啡区，中途补给首选。",
        visitMinutes: 20, popularity: 6, nearWaypoint: "c", kind: "service",
      },
      {
        id: "s-med", name: "医疗点 · 母婴室", x: 20, z: -52,
        category: "服务设施", description: "北广场东侧医疗服务点。",
        visitMinutes: 5, popularity: 2, nearWaypoint: "n1", kind: "service",
      },
    ],
  },
};

export default ningbo;
