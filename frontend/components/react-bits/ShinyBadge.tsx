"use client";

import React from "react";

interface ShinyBadgeProps {
  children: React.ReactNode;
  variant?: "slate" | "rose" | "amber" | "emerald" | "indigo" | "cyan";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

export default function ShinyBadge({
  children,
  variant = "slate",
  size = "md",
  className = "",
  icon,
}: ShinyBadgeProps) {
  const variantStyles = {
    slate: "bg-slate-900/80 text-slate-300 border-slate-700/80 shadow-slate-900/40",
    rose: "bg-rose-950/70 text-rose-300 border-rose-700/70 shadow-rose-950/40",
    amber: "bg-amber-950/70 text-amber-300 border-amber-700/70 shadow-amber-950/40",
    emerald: "bg-emerald-950/70 text-emerald-300 border-emerald-700/70 shadow-emerald-950/40",
    indigo: "bg-indigo-950/70 text-indigo-300 border-indigo-700/70 shadow-indigo-950/40",
    cyan: "bg-cyan-950/70 text-cyan-300 border-cyan-700/70 shadow-cyan-950/40",
  }[variant];

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3.5 py-1 text-xs",
  }[size];

  return (
    <span
      className={`relative inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide backdrop-blur-md shadow-sm transition-all duration-300 hover:brightness-110 ${variantStyles} ${sizeStyles} ${className}`}
    >
      {/* Subtle sheen highlight line */}
      <span className="pointer-events-none absolute inset-x-2 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
