"use client";

import { streamText, type ModelMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { getProject } from "@/data/venues";
import { chatSystemPrompt } from "@/lib/ai/prompts";
import { getModel } from "@/lib/ai/client";
import { describeAiError } from "@/lib/ai/generate";
import { orderStops } from "@/lib/pathfinding/route";
import type { PlanStop } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { IconSend, IconSparkles, Spinner } from "../icons";

const QUICK_ASKS = ["加一个休息站", "时间不够，帮我砍到 5 站", "少走点回头路", "想多看机器人相关"];

interface RouteUpdate {
  summary?: string;
  stops?: { poiId?: string; reason?: string; plannedMinutes?: number }[];
}

/** 流式过程中隐藏未完成的 route-update 围栏 */
function visibleText(raw: string): string {
  const idx = raw.indexOf("```route-update");
  return idx >= 0 ? raw.slice(0, idx).trimEnd() : raw.trimEnd();
}

export function PlanChat() {
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const aiConfig = useAppStore((s) => s.aiConfig);
  const messages = useAppStore((s) => s.chatMessages);
  const busy = useAppStore((s) => s.chatBusy);
  const pushChat = useAppStore((s) => s.pushChat);
  const updateChat = useAppStore((s) => s.updateChat);
  const setChatBusy = useAppStore((s) => s.setChatBusy);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const project = getProject(selectedProjectId);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy || !project) return;

    const cfg = aiConfig;
    if (!cfg || !cfg.apiKey || !cfg.baseUrl || !cfg.model) {
      pushChat({
        id: `e-${Date.now()}`,
        role: "assistant",
        content: "还没有配置 AI 服务。点击右上角 ⚙ 设置，填入 Base URL、API Key 和模型名后就能和我对话了。",
        error: true,
      });
      setSettingsOpen(true);
      return;
    }

    const state = useAppStore.getState();
    const plan = state.plans[selectedProjectId];
    if (!plan || plan.stops.length === 0) {
      pushChat({
        id: `e-${Date.now()}`,
        role: "assistant",
        content: "请先生成一条路线（左侧「规划」页），然后我就能帮你调整它。",
        error: true,
      });
      return;
    }

    setInput("");
    pushChat({ id: `u-${Date.now()}`, role: "user", content: trimmed });
    const aiMsgId = `a-${Date.now()}`;
    pushChat({ id: aiMsgId, role: "assistant", content: "" });
    setChatBusy(true);

    // 组装消息历史（含当前路线快照作为最后一条 system 上下文由 chatSystemPrompt 提供）
    const history: ModelMessage[] = [
      ...state.chatMessages.slice(-12).map<ModelMessage>((m) => ({
        role: m.role,
        content: m.content || "（空）",
      })),
      { role: "user", content: trimmed },
    ];

    try {
      const model = getModel(cfg);
      const result = streamText({
        model,
        system: chatSystemPrompt(project, plan.stops),
        messages: history,
        abortSignal: AbortSignal.timeout(120_000),
      });

      let acc = "";
      for await (const delta of result.textStream) {
        acc += delta;
        updateChat(aiMsgId, { content: visibleText(acc) });
      }

      // 解析 route-update 围栏并应用
      const fence = acc.match(/```route-update\s*([\s\S]*?)```/);
      if (fence) {
        let applied = false;
        try {
          const data = JSON.parse(fence[1]) as RouteUpdate;
          const validIds = new Set(project.venue.pois.map((p) => p.id));
          const stops: PlanStop[] = (data.stops ?? [])
            .filter((s) => typeof s.poiId === "string" && validIds.has(s.poiId!))
            .map((s) => ({
              poiId: s.poiId!,
              reason: s.reason || "",
              plannedMinutes: Math.max(5, Math.min(180, Math.round(s.plannedMinutes ?? 10))),
            }));
          if (stops.length >= 2) {
            const entryId = useAppStore.getState().entryByProject[project.id] ?? project.venue.entrances[0].id;
            const ordered = orderStops(project.venue, entryId, stops);
            applied = useAppStore.getState().applyChatStops(project.id, ordered, data.summary ?? "对话调整后的路线");
          }
        } catch {
          applied = false;
        }
        updateChat(aiMsgId, {
          content:
            (visibleText(acc) || "已为你调整路线。") +
            (applied ? "" : "\n\n（路线更新未能应用，请换个说法再试一次）"),
          applied,
        });
      } else {
        updateChat(aiMsgId, { content: visibleText(acc) || "（无文本回复）" });
      }
    } catch (err) {
      updateChat(aiMsgId, { content: `出错了：${describeAiError(err)}`, error: true });
    } finally {
      setChatBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <IconSparkles className="h-4 w-4 text-cyan-300" />
        <span className="text-sm font-semibold">AI 观展助手</span>
        <span className="ml-auto text-[11px] text-slate-500">对话微调当前路线</span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="rounded-2xl bg-white/5 p-4 text-xs leading-relaxed text-slate-300 ring-1 ring-white/10">
            生成路线后，直接用自然语言让我调整，比如：
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {QUICK_ASKS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-white/15 bg-white/6 px-2.5 py-1 text-[11px] text-slate-200 transition-colors hover:bg-white/12"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-b from-cyan-400/90 to-sky-500/90 text-slate-950"
                  : m.error
                    ? "border border-rose-400/30 bg-rose-500/10 text-rose-200"
                    : "border border-white/10 bg-white/8 text-slate-100"
              }`}
            >
              {m.content}
              {m.applied && (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] text-cyan-200">
                  ✓ 路线已更新
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Spinner className="h-3.5 w-3.5" /> 助手思考中…
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="跟助手聊聊怎么调整路线…"
            className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/8 px-4 py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-300/40 focus:bg-white/10"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-cyan-400/90 to-sky-500/90 text-slate-950 shadow-[0_6px_20px_rgba(34,211,238,0.3)] transition-all active:scale-95 disabled:opacity-40"
            aria-label="发送"
          >
            <IconSend className="h-[18px] w-[18px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
