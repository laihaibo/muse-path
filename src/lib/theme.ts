"use client";

import { useSyncExternalStore } from "react";

/** 主题模式：跟随系统 / 日间 / 夜间。独立于 zustand store，供防闪烁内联脚本读取同一 localStorage 键 */
export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const KEY = "musepath-theme";

const listeners = new Set<() => void>();
let mode: ThemeMode = "system";

function systemPrefersLight(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches;
}

export function resolveTheme(m: ThemeMode = mode): ResolvedTheme {
  if (m === "system") return systemPrefersLight() ? "light" : "dark";
  return m;
}

function emit() {
  listeners.forEach((l) => l());
}

/** 把当前模式写到 <html> class、color-scheme 与 meta theme-color */
export function applyTheme(m: ThemeMode): void {
  mode = m;
  try {
    localStorage.setItem(KEY, m);
  } catch {
    /* 隐私模式下忽略 */
  }
  const resolved = resolveTheme(m);
  const root = document.documentElement;
  root.classList.toggle("light", resolved === "light");
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", resolved === "light" ? "#e3ebf7" : "#070b16");
  emit();
}

/** 挂载时调用：读取持久化模式并监听系统偏好变化 */
export function initTheme(): () => void {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "system") mode = v;
  } catch {
    /* ignore */
  }
  applyTheme(mode);
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  const onChange = () => {
    if (mode === "system") applyTheme("system");
  };
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function getThemeMode(): ThemeMode {
  return mode;
}

export function setThemeMode(m: ThemeMode): void {
  applyTheme(m);
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** 当前已解析主题（light/dark），供 3D 场景等非 CSS 场景使用 */
export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribeTheme, () => resolveTheme(), () => "dark" as ResolvedTheme);
}
