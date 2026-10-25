import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import type { AiConfig } from "@/lib/types";

/** 由用户设置创建浏览器直连的模型实例 */
export function getModel(cfg: AiConfig): LanguageModel {
  const baseUrl = cfg.baseUrl.replace(/\/+$/, "");
  const provider = createOpenAICompatible({
    name: cfg.presetId || "custom",
    baseURL: baseUrl,
    apiKey: cfg.apiKey,
  });
  return provider.chatModel(cfg.model);
}
