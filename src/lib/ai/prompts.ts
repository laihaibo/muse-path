import type { VenueProject } from "@/data/venues/schema";
import type { PlanStop } from "@/lib/types";

/** POI 清单文本（供 AI 选择，含服务设施） */
export function poiCatalog(venue: VenueProject["venue"]): string {
  const hallName = (id?: string) => venue.halls.find((h) => h.id === id)?.name ?? "公共区域";
  return venue.pois
    .map(
      (p) =>
        `${p.id} | ${p.name} | ${hallName(p.hallId)} | ${p.category} | 建议${p.visitMinutes}分钟 | 人气${p.popularity}/10${
          p.kind === "service" ? " | 【服务/休息设施】" : ""
        }`,
    )
    .join("\n");
}

function hallLayout(venue: VenueProject["venue"]): string {
  return venue.halls
    .map((h) => {
      const x0 = h.cx - h.w / 2;
      const x1 = h.cx + h.w / 2;
      const z0 = h.cz - h.d / 2;
      const z1 = h.cz + h.d / 2;
      return `${h.name}：x ${x0}~${x1}，z ${z0}~${z1}`;
    })
    .join("；");
}

const EVENT_KIND_LABEL: Record<NonNullable<VenueProject["events"]>[number]["kind"], string> = {
  exhibition: "展会",
  activity: "活动",
  season: "时令",
};

/** 当前时令与进行中的展会/活动（供 AI 权衡安排） */
export function eventContext(project: VenueProject): string {
  const lines: string[] = [];
  if (project.seasonNote) lines.push(`当前时令：${project.seasonNote}`);
  if (project.events?.length) {
    lines.push("进行中的展会/活动/时令看点：");
    for (const e of project.events) {
      lines.push(
        `【${EVENT_KIND_LABEL[e.kind]}】${e.name}（${e.period}${e.area ? "，" + e.area : ""}）— ${e.description}`,
      );
    }
  }
  return lines.join("\n");
}

export function planSystemPrompt(project: VenueProject): string {
  const v = project.venue;
  const events = eventContext(project);
  return `你是资深的观展/游园路线规划师。用户会给出兴趣标签、游览时长预算和入口，你要为「${project.name}」（${project.city}，${project.dates}）规划一条顺路、省时、有趣的游览路线。

场地布局（米制坐标，+x 向东，+z 向南；z 越小越靠北）：
${hallLayout(v)}
入口：${v.entrances.map((e) => `${e.name}(${e.x},${e.z})`).join("；")}
${project.id === "ningbo-botanical-garden" ? "园区以“植物进化之路”为东西向科普轴、一号门主轴大道贯穿南北（x≈0），中心湖居北，建议沿轴与环湖路移动减少绕路。" : "中央有贯穿南北的轴通道（x≈0），各馆门洞开向轴通道，建议沿轴通道移动减少绕路。"}

可用展项与服务设施清单（格式：id | 名称 | 位置 | 类别 | 建议停留 | 人气）：
${poiCatalog(v)}
${events ? `\n${events}\n` : ""}
规则：
1. stops 中的 poiId 必须逐字取自清单，禁止编造。
2. 站点顺序要顺路，避免来回折返；从用户指定入口出发。
3. 所有站点 plannedMinutes 之和加上步行时间（粗略按每站间 3~8 分钟）不要超过时长预算的 90%，宁松勿紧。
4. 优先安排与用户兴趣标签匹配的展项；人气高的优先；优先覆盖进行中的展会/活动与时令亮点（如花展、红叶季），非当季景观酌情降低优先级并在理由中说明；若时间充裕可插入【服务/休息设施】作为休息站。
5. 每站给一句具体、不空洞的推荐理由，说明与用户兴趣或当下时令的关联。
6. tips 给出最多 5 条实用提示（花展档期、游船运营、温室预约、打卡机位等），没有可给空数组。`;
}

export function planUserPrompt(
  project: VenueProject,
  opts: { interests: string[]; minutes: number; entryId: string },
): string {
  const entry = project.venue.entrances.find((e) => e.id === opts.entryId) ?? project.venue.entrances[0];
  const interestText =
    opts.interests.length > 0 ? opts.interests.join("、") : "由你自由发挥，优先安排人气最高的亮点展项";
  return `请为我规划观展路线：
- 兴趣偏好（按此优先安排）：${interestText}
- 游览时长预算：约 ${opts.minutes} 分钟
- 入口：${entry.name}（坐标 ${entry.x},${entry.z}）
请直接输出符合要求的路线 JSON。`;
}

export function chatSystemPrompt(project: VenueProject, currentStops: PlanStop[]): string {
  const v = project.venue;
  const events = eventContext(project);
  const stopLines = currentStops
    .map((s, i) => {
      const poi = v.pois.find((p) => p.id === s.poiId);
      return `${i + 1}. ${poi?.name ?? s.poiId}（${s.poiId}，停留${s.plannedMinutes}分钟）`;
    })
    .join("\n");
  return `你是「${project.name}」的游览路线助手，当前正陪用户微调一条已生成的路线。回答要简短自然，像资深游园向导。

当前路线：
${stopLines || "（空）"}

可用展项与服务设施清单（格式：id | 名称 | 类别 | 建议停留）：
${poiCatalog(v)}
${events ? `\n${events}\n` : ""}
当你需要修改路线时，先简短说明调整思路（一两句），然后在回复末尾输出一个完整的路线更新代码块，格式严格如下（输出全部站点的新顺序，而不是只输出变化）：

\`\`\`route-update
{"summary":"一句话概括新路线","stops":[{"poiId":"必须来自清单","reason":"一句话理由","plannedMinutes":15}]}
\`\`\`

规则：
1. poiId 必须逐字取自清单，禁止编造；保持 2~14 站。
2. 若用户只是闲聊或提问，正常回答，不要输出 route-update 块。
3. 输出 route-update 块时，除该代码块外不要输出其他代码块或 JSON。`;
}
