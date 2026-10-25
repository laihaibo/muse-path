"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { AiConfig } from "@/lib/types";
import { testConnection } from "@/lib/ai/generate";
import { providerPresets, getPreset } from "@/lib/settings";
import { useAppStore } from "@/lib/store";
import { GlassButton } from "../Glass";
import { IconEye, IconX, Spinner } from "../icons";

export function SettingsSheet() {
  const open = useAppStore((s) => s.settingsOpen);
  const setOpen = useAppStore((s) => s.setSettingsOpen);
  const saved = useAppStore((s) => s.aiConfig);

  const [presetId, setPresetId] = useState(saved?.presetId ?? "deepseek");
  const [baseUrl, setBaseUrl] = useState(saved?.baseUrl ?? "");
  const [apiKey, setApiKey] = useState(saved?.apiKey ?? "");
  const [model, setModel] = useState(saved?.model ?? "");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (open) {
      setPresetId(saved?.presetId ?? "deepseek");
      setBaseUrl(saved?.baseUrl ?? "");
      setApiKey(saved?.apiKey ?? "");
      setModel(saved?.model ?? "");
      setTestResult(null);
      setShowKey(false);
    }
  }, [open, saved]);

  // Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const preset = getPreset(presetId);

  const choosePreset = (id: string) => {
    setPresetId(id);
    const p = getPreset(id);
    setBaseUrl(p.baseUrl);
    setModel(p.models[0] ?? "");
    setTestResult(null);
  };

  const save = () => {
    if (!baseUrl.trim() || !apiKey.trim() || !model.trim()) return;
    useAppStore.getState().setAiConfig({
      presetId,
      baseUrl: baseUrl.trim().replace(/\/+$/, ""),
      apiKey: apiKey.trim(),
      model: model.trim(),
    });
    setOpen(false);
  };

  const runTest = async () => {
    if (!baseUrl.trim() || !apiKey.trim() || !model.trim()) {
      setTestResult({ ok: false, message: "请先填全 Base URL、API Key 与模型名" });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testConnection({
      presetId,
      baseUrl: baseUrl.trim().replace(/\/+$/, ""),
      apiKey: apiKey.trim(),
      model: model.trim(),
    });
    setTestResult(res);
    setTesting(false);
  };

  const complete = baseUrl.trim() !== "" && apiKey.trim() !== "" && model.trim() !== "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">AI 服务设置</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  兼容 OpenAI 接口规范的任意服务商。API Key 仅保存在你本机的浏览器 localStorage，
                  请求由浏览器直连服务商（无需服务器）。
                </p>
              </div>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <IconX />
              </button>
            </div>

            <div className="mb-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">服务商预设</div>
              <div className="flex flex-wrap gap-1.5">
                {providerPresets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => choosePreset(p.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                      presetId === p.id
                        ? "border-cyan-300/50 bg-cyan-400/20 text-cyan-100"
                        : "border-white/15 bg-white/6 text-slate-300 hover:bg-white/12"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Base URL
              </label>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                dir="ltr"
                className="w-full rounded-xl border border-white/12 bg-white/8 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-300/40"
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                请求由浏览器直连，需服务商允许跨域（CORS）。DeepSeek / 智谱 / Kimi / OpenAI / OpenRouter /
                硅基流动均已验证可直连。
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                API Key
              </label>
              <div className="relative">
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-…"
                  type={showKey ? "text" : "password"}
                  dir="ltr"
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/12 bg-white/8 px-3.5 py-2.5 pr-11 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-300/40"
                />
                <button
                  type="button"
                  aria-label={showKey ? "隐藏" : "显示"}
                  onClick={() => setShowKey((s) => !s)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 ${
                    showKey ? "text-cyan-300" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <IconEye />
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                模型名
              </label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={preset.models[0] ?? "model-name"}
                dir="ltr"
                className="w-full rounded-xl border border-white/12 bg-white/8 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-300/40"
              />
              {preset.models.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {preset.models.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModel(m)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                        model === m
                          ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
                          : "border-white/12 bg-white/6 text-slate-400 hover:bg-white/12"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {testResult && (
              <div
                className={`mb-4 rounded-xl border px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  testResult.ok
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-400/30 bg-rose-500/10 text-rose-200"
                }`}
              >
                {testResult.ok ? "✓ " : "✗ "}
                {testResult.message}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <GlassButton onClick={runTest} disabled={testing} className="min-w-24">
                {testing ? <Spinner /> : null}
                测试连接
              </GlassButton>
              <GlassButton variant="primary" onClick={save} disabled={!complete} className="flex-1">
                保存
              </GlassButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
