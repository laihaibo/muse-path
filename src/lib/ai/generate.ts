import { generateObject, generateText } from "ai";
import type { LanguageModel } from "ai";
import type { VenueProject } from "@/data/venues/schema";
import type { AiConfig, VisitPlanData } from "@/lib/types";
import { getModel } from "./client";
import { visitPlanSchema, type VisitPlanAI } from "./schemas";
import { planSystemPrompt, planUserPrompt } from "./prompts";
import { orderStops } from "@/lib/pathfinding/route";
import { describeAiError } from "@/lib/settings";

function extractJson(text: string): unknown {
  // 优先取 ```json 围栏，否则取第一个平衡的 {...}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1] : text;
  const start = raw.indexOf("{");
  if (start === -1) throw new Error("AI 未返回 JSON");
  let depth = 0;
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === "{") depth++;
    else if (raw[i] === "}") {
      depth--;
      if (depth === 0) return JSON.parse(raw.slice(start, i + 1));
    }
  }
  throw new Error("AI 返回的 JSON 不完整");
}

/**
 * 结构化生成，带兼容性兜底：
 * 1) 优先 generateObject（response_format json_schema）；
 * 2) 端点不支持时退回纯文本生成 + 本地 zod 校验，失败附上错误重试一次。
 */
async function generatePlanAI(
  model: LanguageModel,
  project: VenueProject,
  opts: { interests: string[]; minutes: number; entryId: string },
): Promise<VisitPlanAI> {
  const system = planSystemPrompt(project);
  const prompt = planUserPrompt(project, opts);

  try {
    const { object } = await generateObject({
      model,
      schema: visitPlanSchema,
      system,
      prompt,
      abortSignal: AbortSignal.timeout(120_000),
    });
    return object;
  } catch (primaryErr) {
    // 结构化输出失败 → 纯文本兜底
    const jsonOnly = "\n\n只输出一个 JSON 对象，不要 markdown 围栏、不要解释文字。字段：title, summary, stops[{poiId, reason, plannedMinutes}], tips[]。";
    for (let attempt = 0; attempt < 2; attempt++) {
      const { text } = await generateText({
        model,
        system: system + jsonOnly,
        prompt,
        abortSignal: AbortSignal.timeout(120_000),
      });
      try {
        const parsed = visitPlanSchema.parse(extractJson(text));
        return parsed;
      } catch (parseErr) {
        if (attempt === 1) {
          throw new Error(
            `AI 返回内容无法解析为路线：${parseErr instanceof Error ? parseErr.message.slice(0, 160) : "未知"}`,
          );
        }
      }
    }
    throw primaryErr; // 不可达，仅为类型收窄
  }
}

export async function generateItinerary(
  cfg: AiConfig,
  project: VenueProject,
  opts: { interests: string[]; minutes: number; entryId: string },
): Promise<VisitPlanData> {
  const model = getModel(cfg);
  const plan = await generatePlanAI(model, project, opts);

  // 过滤无效 poiId
  const validIds = new Set(project.venue.pois.map((p) => p.id));
  const stops = plan.stops.filter((s) => validIds.has(s.poiId));
  if (stops.length === 0) throw new Error("AI 返回的展项都无效，请重试或更换模型");

  // 2-opt 就地优化顺序（不改变站点集合）
  const ordered = orderStops(project.venue, opts.entryId, stops);

  return {
    title: plan.title,
    summary: plan.summary,
    stops: ordered,
    tips: plan.tips ?? [],
    source: "ai",
    generatedAt: Date.now(),
  };
}

export async function testConnection(cfg: AiConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const model = getModel(cfg);
    const { text } = await generateText({
      model,
      prompt: "请只回复两个字：成功",
      maxOutputTokens: 512,
      abortSignal: AbortSignal.timeout(30_000),
    });
    return { ok: true, message: `连接成功，模型 ${cfg.model} 回复：${text.trim().slice(0, 40) || "（空）"}` };
  } catch (err) {
    return { ok: false, message: describeAiError(err) };
  }
}

export { describeAiError };
