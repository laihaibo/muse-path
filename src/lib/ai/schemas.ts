import { z } from "zod";

export const stopSchema = z.object({
  poiId: z.string().describe("展项 id，必须逐字取自 POI 清单"),
  reason: z.string().describe("一句话推荐理由，说明与用户兴趣的关联"),
  plannedMinutes: z.number().int().min(5).max(180).describe("建议停留分钟数"),
});

export const visitPlanSchema = z.object({
  title: z.string().min(2).max(24).describe("行程标题，如「机器人与低空经济半日游」"),
  summary: z.string().describe("两三句话的行程总述"),
  stops: z.array(stopSchema).min(2).max(14).describe("按游览顺序排列的站点"),
  tips: z.array(z.string()).max(5).describe("实用提示，如排队、整点演出等"),
});

export type VisitPlanAI = z.infer<typeof visitPlanSchema>;
