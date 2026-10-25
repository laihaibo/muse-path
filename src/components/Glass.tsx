"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function GlassPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass rounded-3xl ${className}`}>{children}</div>;
}

export function GlassButton({
  children,
  onClick,
  disabled,
  variant = "ghost",
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
}) {
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-cyan-400/90 to-sky-500/90 text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,0.35)] hover:brightness-110 border border-cyan-200/40"
      : variant === "danger"
        ? "bg-rose-500/15 text-rose-300 border border-rose-400/25 hover:bg-rose-500/25"
        : "glass-chip hover:bg-white/15";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={`relative flex rounded-full bg-white/8 p-1 ring-1 ring-white/12 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`relative flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
            value === opt.value ? "text-slate-950" : "text-slate-300 hover:text-white"
          }`}
        >
          {value === opt.value && (
            <motion.span
              layoutId={`seg-${options.map((o) => o.value).join("-")}`}
              className="absolute inset-0 rounded-full bg-white/90 shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Chip({
  children,
  active,
  onClick,
  color,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all active:scale-[0.95] ${
        active
          ? "border-cyan-300/50 bg-cyan-400/20 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.25)]"
          : "border-white/15 bg-white/6 text-slate-300 hover:bg-white/12"
      }`}
      style={active && color ? { borderColor: `${color}88`, background: `${color}26`, color } : undefined}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{children}</div>
  );
}
