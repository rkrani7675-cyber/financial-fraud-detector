"use client";

import { AlertTriangle, CheckCircle2, AlertOctagon, HelpCircle } from "lucide-react";
import { SpotlightCard, AnimatedCounter, ShinyBadge } from "./react-bits";

interface RiskScoreCardProps {
  score: number;
  level: "Low" | "Moderate" | "High" | string;
  totalAnomalies: number;
  rawPoints: number;
  yearsCount: number;
}

export default function RiskScoreCard({
  score,
  level,
  totalAnomalies,
  rawPoints,
  yearsCount,
}: RiskScoreCardProps) {
  // 3-Tier color mapping
  const getTierConfig = (lvl: string) => {
    switch (lvl.toLowerCase()) {
      case "low":
        return {
          spotlightColor: "rgba(16, 185, 129, 0.12)",
          badgeVariant: "emerald" as const,
          strokeColor: "#10b981",
          icon: CheckCircle2,
          tagline: "Standard Accounting Coherence",
          description: "Financial metrics track standard economic relationships across reported periods.",
        };
      case "moderate":
        return {
          spotlightColor: "rgba(245, 158, 11, 0.12)",
          badgeVariant: "amber" as const,
          strokeColor: "#f59e0b",
          icon: AlertTriangle,
          tagline: "Selective Discrepancies Noted",
          description: "Emerging variations detected across multiple reporting categories requiring inquiry.",
        };
      case "high":
      default:
        return {
          spotlightColor: "rgba(244, 63, 94, 0.14)",
          badgeVariant: "rose" as const,
          strokeColor: "#f43f5e",
          icon: AlertOctagon,
          tagline: "Significant Structural Divergence",
          description: "Persistent multi-year deviations observed (cash flow lag, receivables expansion, margin jumps).",
        };
    }
  };

  const config = getTierConfig(level);
  const TierIcon = config.icon;

  // Circular gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <SpotlightCard
      spotlightColor={config.spotlightColor}
      className="p-6 sm:p-7 border-slate-800/90"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: Score Gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-800/80 fill-none"
                strokeWidth="10"
              />
              {/* Animated Progress circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="fill-none transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke={config.strokeColor}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                <AnimatedCounter value={score} duration={1.2} />
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <ShinyBadge
                variant={config.badgeVariant}
                icon={<TierIcon className="w-3.5 h-3.5" />}
              >
                {level} Risk (3-Tier Mode)
              </ShinyBadge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {config.tagline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {/* Right: Key Stats & Summary Cards */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-3.5 text-center min-w-[105px] shadow-sm">
            <div className="text-2xl font-bold text-white font-mono">
              <AnimatedCounter value={totalAnomalies} duration={0.8} />
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Anomalies</div>
          </div>
          <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-3.5 text-center min-w-[105px] shadow-sm">
            <div className="text-2xl font-bold text-amber-400 font-mono">
              +<AnimatedCounter value={rawPoints} duration={0.8} />
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Raw Points</div>
          </div>
          <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-3.5 text-center min-w-[105px] shadow-sm">
            <div className="text-2xl font-bold text-slate-200 font-mono">
              <AnimatedCounter value={yearsCount} duration={0.8} />
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Fiscal Years</div>
          </div>
        </div>
      </div>

      {/* Audit Disclaimer Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            <strong className="text-slate-300">Audit Protocol:</strong> System calculates mathematical divergences across statements; does not establish legal determination.
          </span>
        </div>
        <span className="font-mono text-slate-400 shrink-0">
          Scale: 0–30 Low • 31–60 Moderate • 61–100 High
        </span>
      </div>
    </SpotlightCard>
  );
}
