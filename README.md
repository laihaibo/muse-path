# MusePath · AI 观展路径规划引擎

一个**通用**的观展路线规划引擎：为任意展会、博览会、博物馆、园区与景区生成**专属游览路线**。不绑定单一展会——**场馆即数据**，新增一个场馆只需一份结构化数据文件，无需改动任何代码。

工作方式：AI 按观众兴趣挑选展项并排序，A\* 算法在 3D 场馆路网上算出可行走路径，并支持跟随镜头漫游整条路线。

仓库内置两个示例项目（基于公开资料的演示数据）：**2026 智博会 · 宁波国际会展中心**、**宁波植物园**。

![tech](https://img.shields.io/badge/Next.js-15-black) ![tech](https://img.shields.io/badge/AI_SDK-5-black) ![tech](https://img.shields.io/badge/Node-22-green) ![tech](https://img.shields.io/badge/Three.js-R3F-blue)

## 特性

- 🧩 **场馆即数据**：React Three Fiber 读取结构化场馆数据生成玻璃质感 3D 场馆、POI 标记与发光路径，无需建模软件与任何外部模型文件
- 🤖 **AI 路线规划**：AI SDK 5 结构化输出（Zod Schema 校验 + 纯文本 JSON 兜底），兼容任意 OpenAI 规范接口
- 💬 **对话微调**：流式聊天调整路线（"加个休息站""砍到 5 站"），路线更新自动重新寻路
- 🧭 **本地寻路**：A\* 最短路 + 2-opt 减少回头路，步行距离/总时长实时计算
- 🎥 **三种镜头**：自由环绕 / 俯瞰全景 / 跟随漫游，路径虚线流动 + 游览者光点动画
- 🔑 **自带 Key**：设置页填 Base URL + API Key + 模型名，仅存本机 localStorage，浏览器直连服务商
- 🧩 **多项目**：场馆项目注册表，任意多个展会/场馆并存切换
- 📱 **Apple 风格 Liquid Glass**：暗色沉浸式 3D 舞台 + 玻璃面板，移动端自适应

## 快速开始

```bash
# 需要 Node.js >= 22
npm install
npm run dev        # http://localhost:3000
```

打开后：

1. 右上角 ⚙ **设置** → 选择服务商预设（DeepSeek / 智谱 / Kimi / OpenAI / OpenRouter / 硅基流动 / 自定义）→ 填入 API Key 与模型名 → **测试连接** → 保存
2. 左侧「规划」页选择兴趣标签、游览时长与入口 → **生成专属路线**
3. 「行程」页查看站点与理由，点击 **跟随游览** 进入漫游镜头；或点右上角 💬 用对话微调路线

> 没有 API Key？点「没有 Key？看演示路线」即可体验完整 3D 寻路与漫游。

### 服务商直连说明

应用为纯静态部署，AI 请求由**浏览器直连**服务商，因此要求服务商允许跨域（CORS）。DeepSeek、智谱、Moonshot、OpenAI、OpenRouter、硅基流动均已验证可直连；自建网关/中转请自行确认 CORS 配置。

## 部署到 GitHub Pages

仓库已含 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)（Node 22 + 静态导出 + GitHub Pages）：

1. 推送到 GitHub 仓库的 `main` 分支
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**
3. 等待 Actions 跑完即可访问 `https://<user>.github.io/<repo>/`

workflow 会自动注入 `NEXT_PUBLIC_BASE_PATH=/<仓库名>`；若部署到用户主站（`<user>.github.io` 仓库），删除 workflow 中该环境变量即可。本地验证静态产物：

```bash
npm run build      # 产物在 out/
npm run preview    # 本地静态预览
```

## 添加新的场馆项目

引擎的通用性核心：**新增场馆 = 新增数据，零代码改动**。

1. 复制 [`src/data/venues/ningbo-smart-expo-2026.ts`](src/data/venues/ningbo-smart-expo-2026.ts) 为新文件
2. 按注释填写：展馆矩形（米制坐标，+x 向东 / +z 向南）、路网节点与边、POI（挂靠就近路网节点）、入口、兴趣标签；常年开放场馆可补充 `seasonNote` / `events`（时令与展会活动，AI 规划与页面会自动消费），场地更大时调高 `sceneZoom`
3. 在 [`src/data/venues/index.ts`](src/data/venues/index.ts) 注册表中加入一行

无需改动任何组件代码；也可以为项目定制 `demo.ts` 里的演示路线。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Next.js 15（App Router，`output: "export"` 静态导出）+ React 19 |
| AI | Vercel AI SDK 5（`ai` + `@ai-sdk/openai-compatible`），浏览器端直连 |
| 3D | three + @react-three/fiber + @react-three/drei（程序化建模） |
| 状态 | zustand（persist → localStorage，跳过水合） |
| 样式 | Tailwind CSS 4 + framer-motion（Liquid Glass 设计语言） |
| 校验 | zod（AI 结构化输出 + 手写 JSON 兜底） |

## 目录结构

```
src/
  app/                # 布局、全局样式、单页入口
  components/
    three/            # VenueScene / HallMesh / POIMarker / PathLine / CameraRig
    planning/         # 规划表单、行程列表
    chat/             # AI 对话微调面板
    settings/         # 设置页（玻璃模态）
    controls/         # 场景控制、POI 信息卡
  lib/
    ai/               # 模型客户端、提示词、Schema、生成与兜底
    pathfinding/      # A*、2-opt、行程拼接
    store.ts          # zustand 全局状态
    demo.ts           # 演示路线
  data/venues/        # 场馆项目注册表 + 数据（新增场馆在这里）
scripts/check.ts      # 寻路冒烟测试（npm run check）
AGENTS.md             # AI 编码助手工作指南
```

## 数据说明

内置示例场馆的布局、展位与展项为**基于公开资料的示意数据**，仅用于产品演示，不代表真实展位图。

## License

[MIT](LICENSE)
