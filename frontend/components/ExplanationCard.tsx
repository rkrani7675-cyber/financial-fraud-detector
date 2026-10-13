"use client";

import { Explanation } from "../lib/types";
import { Sparkles, AlertCircle, FileSearch, HelpCircle } from "lucide-react";

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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700 cursor-pointer">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-lg shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">
              {anomalyName || "AI Forensic Diagnostic"}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Anomaly #{explanation.anomaly_id} {ruleCode ? `• Rule ${ruleCode}` : ""}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2.5 py-0.5 rounded-full">
          AI Explainer
        </span>
      </div>

      <div className="space-y-4 text-xs">
        {/* 1. What was detected */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>DETECTED ANOMALY</span>
          </div>
          <p className="text-slate-200 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed font-mono">
            {explanation.detected}
          </p>
        </div>

        {/* 2. Why it matters */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>WHY IT MATTERS</span>
          </div>
          <p className="text-slate-300 leading-relaxed bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/40">
            {explanation.why_it_matters}
          </p>
        </div>

        {/* 3. Recommended Investigation */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1.5">
            <FileSearch className="w-3.5 h-3.5 text-emerald-400" />
            <span>RECOMMENDED INVESTIGATION</span>
          </div>
          <ul className="space-y-1.5 bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl">
            {investigationBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-200 leading-relaxed">
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
