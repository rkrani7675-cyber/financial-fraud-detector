"use client";

import { AlertTriangle, CheckCircle2, AlertOctagon, HelpCircle } from "lucide-react";

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
          bg: "bg-emerald-950/40 border-emerald-800/60",
          text: "text-emerald-400",
          badgeBg: "bg-emerald-900/60 text-emerald-200 border-emerald-700/80",
          glow: "from-emerald-500/20 to-teal-500/10",
          strokeColor: "#10b981",
          icon: CheckCircle2,
          tagline: "Standard Accounting Coherence",
          description: "Financial metrics track standard economic relationships across reported periods.",
        };
      case "moderate":
        return {
          bg: "bg-amber-950/40 border-amber-800/60",
          text: "text-amber-400",
          badgeBg: "bg-amber-900/60 text-amber-200 border-amber-700/80",
          glow: "from-amber-500/20 to-orange-500/10",
          strokeColor: "#f59e0b",
          icon: AlertTriangle,
          tagline: "Selective Discrepancies Noted",
          description: "Emerging variations detected across multiple reporting categories requiring inquiry.",
        };
      case "high":
      default:
        return {
          bg: "bg-rose-950/40 border-rose-800/60",
          text: "text-rose-400",
          badgeBg: "bg-rose-900/60 text-rose-200 border-rose-700/80",
          glow: "from-rose-500/25 to-red-500/10",
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
    <div className={`relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl ${config.bg} shadow-xl transition-all`}>
      {/* Background ambient glow */}
      <div className={`absolute -right-16 -top-16 w-56 h-56 rounded-full bg-gradient-to-br ${config.glow} blur-3xl pointer-events-none`} />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: Score Gauge */}
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-800 fill-none"
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
                {score}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1.5 ${config.badgeBg}`}>
                <TierIcon className="w-3.5 h-3.5" />
                {level} Risk (3-Tier Mode)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {config.tagline}
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mt-1 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {/* Right: Key Stats & Summary Cards */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-center min-w-[105px]">
            <div className="text-2xl font-bold text-white font-mono">{totalAnomalies}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Anomalies</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-center min-w-[105px]">
            <div className="text-2xl font-bold text-amber-400 font-mono">+{rawPoints}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Raw Points</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-center min-w-[105px]">
            <div className="text-2xl font-bold text-slate-200 font-mono">{yearsCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Fiscal Years</div>
          </div>
        </div>
      </div>

      {/* Audit Disclaimer Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>
            <strong>Audit Note:</strong> System identifies mathematical anomalies; does not establish legal determination of fraud.
          </span>
        </div>
        <span className="hidden sm:inline font-mono text-slate-500">
          Scale: 0–30 Low | 31–60 Moderate | 61–100 High
        </span>
      </div>
    </div>
  );
}
