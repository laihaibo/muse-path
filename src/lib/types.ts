/** 应用级共享类型 */

export interface AiConfig {
  presetId: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface PlanStop {
  poiId: string;
  reason: string;
  plannedMinutes: number;
}

export type PlanSource = "ai" | "demo" | "chat";

export interface VisitPlanData {
  title: string;
  summary: string;
  stops: PlanStop[];
  tips: string[];
  source: PlanSource;
  generatedAt: number;
}
