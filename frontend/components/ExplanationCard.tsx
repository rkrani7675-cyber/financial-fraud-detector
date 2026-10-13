"use client";

import { Explanation } from "../lib/types";
import { Sparkles, AlertCircle, FileSearch, HelpCircle } from "lucide-react";
import { ShinyBadge } from "./react-bits";

interface ExplanationCardProps {
  explanation: Explanation;
  anomalyName?: string;
  ruleCode?: string;
}

export default function ExplanationCard({
  explanation,
  anomalyName,
  ruleCode,
}: ExplanationCardProps) {
  const investigationBullets = explanation.recommended_investigation
    .split("\n")
    .map((b) => b.replace(/^[-•*]\s*/, "").trim())
    .filter((b) => b.length > 0);

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 sm:p-5 shadow-inner transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-tr from-indigo-600 to-rose-600 text-white rounded-lg shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              {anomalyName || "AI Forensic Diagnostic Report"}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Anomaly #{explanation.anomaly_id} {ruleCode ? `• Rule ${ruleCode}` : ""}
            </span>
          </div>
        </div>
        <ShinyBadge variant="indigo" size="sm">
          Forensic AI Diagnostic
        </ShinyBadge>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* 1. What was detected */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px] uppercase tracking-wider text-rose-300">Detected Metric Anomaly</span>
          </div>
          <p className="text-slate-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 leading-relaxed font-mono text-[11px] sm:text-xs">
            {explanation.detected}
          </p>
        </div>

        {/* 2. Why it matters */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] uppercase tracking-wider text-amber-300">Forensic Accounting Risk</span>
          </div>
          <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 text-[11px] sm:text-xs">
            {explanation.why_it_matters}
          </p>
        </div>

        {/* 3. Recommended Investigation */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1.5">
            <FileSearch className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] uppercase tracking-wider text-emerald-300">Recommended Audit Investigation</span>
          </div>
          <ul className="space-y-1.5 bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-lg">
            {investigationBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-200 leading-relaxed text-[11px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
