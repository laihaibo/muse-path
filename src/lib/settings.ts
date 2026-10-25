/** AI 服务商预设（OpenAI 兼容接口）与设置相关工具 */

export interface ProviderPreset {
  id: string;
  name: string;
  baseUrl: string;
  /** 常用模型建议（可自由输入） */
  models: string[];
  /** 该服务商浏览器直连是否已知畅通 */
  corsFriendly?: boolean;
}

export const providerPresets: ProviderPreset[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    models: ["deepseek-flash", "deepseek-v4-pro"],
    corsFriendly: true,
  },
  {
    id: "zhipu",
    name: "智谱 GLM",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    models: ["glm-5.3", "glm-5.3-flashx", "glm-5.3-flash"],
    corsFriendly: true,
  },
  {
    id: "custom",
    name: "自定义",
    baseUrl: "",
    models: [],
  },
];

export function getPreset(id: string): ProviderPreset {
  return providerPresets.find((p) => p.id === id) ?? providerPresets[providerPresets.length - 1];
}

/** 将底层错误翻译成用户能看懂的提示 */
export function describeAiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/401|invalid.*key|unauthorized/i.test(msg)) return "API Key 无效或已过期（401）";
  if (/403/i.test(msg)) return "无权访问该模型或接口（403）";
  if (/404|not found/i.test(msg)) return "接口路径或模型不存在（404），请检查 Base URL 与模型名";
  if (/429|rate limit/i.test(msg)) return "请求过于频繁或额度不足（429）";
  if (/CORS|Failed to fetch|NetworkError|Load failed|fetch failed/i.test(msg))
    return "网络请求被拦截：该服务商可能不允许浏览器直连（CORS），或 Base URL 有误";
  if (/aborted|timeout/i.test(msg)) return "请求超时，请重试或换用更快的模型";
  return msg.slice(0, 200) || "未知错误";
}
