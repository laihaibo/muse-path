# AGENTS.md — AI 编码助手工作指南

供 AI 编码助手（及新加入的开发者）在本仓库工作时遵循的约定。

## 项目定位

MusePath 是一个**通用**的 AI 观展路径规划引擎，不绑定任何单一展会：结构化场馆数据 → 程序化 3D 场馆 + AI 个性化路线 + 对话微调 + 本地寻路。

形态约束：**纯前端静态应用**（Next.js 15 `output: "export"`，部署 GitHub Pages）。无后端、无数据库、无账号体系。中文界面，Apple Liquid Glass 玻璃质感风格。

本仓库是 open-core 模式的**开源版**：保持纯静态与 BYOK（用户自带 Key）。服务端网关、CMS 后台、埋点、白标等商业化能力只在私有仓实现——**不要向本仓库添加后端、账号、支付、埋点或任何 B 端功能**。

## 常用命令

```bash
npm install
npm run dev        # 开发服务器 localhost:3000
npm run build      # 静态导出到 out/
npm run preview    # 预览静态产物
npm run check      # 寻路冒烟测试：对所有注册场馆循环校验
```

要求 Node.js >= 22。

## 架构地图

| 路径 | 职责 |
| --- | --- |
| `src/data/venues/schema.ts` | 场馆数据模型的**权威定义**（VenueProject / venue / POI / VenueEvent） |
| `src/data/venues/index.ts` | 场馆注册表（数组首位 = 默认场馆） |
| `src/lib/pathfinding/` | A* 建图 + 2-opt 优化 + 行程拼接，纯本地计算 |
| `src/lib/ai/prompts.ts` | plan 与 chat 的 system prompt；含 `route-update` JSON 围栏协议 |
| `src/lib/ai/generate.ts` | 结构化输出 + 纯文本 JSON 兜底 + 非法 poiId 过滤 |
| `src/lib/store.ts` | zustand persist → localStorage（skipHydration 防水合） |
| `src/lib/theme.ts` | 主题三态（system/light/dark），独立 localStorage 键 `musepath-theme` |
| `scripts/check.ts` | 场馆无关的通用寻路校验（连通性、挂靠节点、可达性） |

## 核心约定

### 场馆数据（「场馆即数据」是本项目的通用性根基）

- 新增场馆**只加数据不改组件**：在 `src/data/venues/` 建数据文件 + 在 `index.ts` 注册。
- 坐标为米制，+x 向东 / +z 向南；POI 的 `nearWaypoint` 必须指向已存在的路网节点；大场地必须设置 `sceneZoom`（±500m 级场地参考值 2，如植物园）。
- 数据真实性：展商/礼品/布局以公开报道为准，**不得编造**；无法确认的坐标在 `dataNote` 注明「示意」。

### AI 集成

- OpenAI 兼容单接口，浏览器直连，Key 只存 localStorage（BYOK）；服务商预设只维护 DeepSeek / 智谱 / 自定义。
- AI 输出的 `poiId` 必须经有效集合过滤（防幻觉，`generate.ts` 与 `store.ts` 双侧过滤）；结构化输出失败必须有纯文本 JSON 兜底。
- 对话改路线走 `route-update` JSON 围栏协议（`prompts.ts` 定义，`PlanChat.tsx` 解析），改站点后自动重新 A* 寻路。

### 主题系统

- 三态主题的暗色适配通过 `globals.css` 以 `html.light` **集中重映射**工具类，**勿逐组件加 `dark:` 前缀**。
- `layout.tsx` 有防闪屏内联脚本；3D 场景配色经 `useResolvedTheme` 切换。

## 验证要求

- 改动寻路或场馆数据后：`npm run check` 必须全绿（会对所有注册场馆循环校验）。
- 改动前端 UI 后：`npm run build` 成功，并在浏览器分别验证**日间与夜间两种主题**（布局与 3D 场景配色）。

## Windows 开发环境注意

- `npx serve` 残留进程会占用 `out/` 导致构建 EBUSY：按端口用 netstat 找 PID 后 taskkill。
- 后台 `npm run dev` 停止后 node 子进程会残留占用 3000 端口，需 taskkill。

## 已知现象（非缺陷，勿尝试修复）

- dev 模式下 drei `<Html>` 批量挂载触发 React 并发警告（dev overlay "Issues" 可见），生产构建无影响。
