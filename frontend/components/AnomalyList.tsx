"use client";

import { useState } from "react";
import { Anomaly, Explanation } from "../lib/types";
import ExplanationCard from "./ExplanationCard";
import { AlertCircle, ChevronDown, ChevronUp, Filter, Sparkles } from "lucide-react";

interface AnomalyListProps {
  anomalies: Anomaly[];
  explanations: Explanation[];
}

export default function AnomalyList({ anomalies, explanations }: AnomalyListProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(anomalies[0]?.id || null);

  // Group explanations by anomaly_id
  const explanationsMap = new Map<number, Explanation>();
  explanations.forEach((exp) => {
    explanationsMap.set(exp.anomaly_id, exp);
  });

  const filterOptions = ["ALL", "A", "B", "C", "D", "E", "F", "G"];

  const filteredAnomalies = anomalies.filter((a) => {
    if (selectedFilter === "ALL") return true;
    return a.anomaly_type === selectedFilter;
  });

  const getRuleBadgeColor = (type: string) => {
    switch (type) {
      case "A":
        return "bg-amber-950/80 text-amber-300 border-amber-700/60";
      case "B":
        return "bg-rose-950/80 text-rose-300 border-rose-700/60";
      case "C":
        return "bg-pink-950/80 text-pink-300 border-pink-700/60";
      case "D":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-700/60";
      case "E":
        return "bg-purple-950/80 text-purple-300 border-purple-700/60";
      case "F":
        return "bg-cyan-950/80 text-cyan-300 border-cyan-700/60";
      case "G":
        return "bg-blue-950/80 text-blue-300 border-blue-700/60";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Detected Financial Anomalies ({filteredAnomalies.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any flagged event to reveal its AI diagnostic report & investigation steps
          </p>
        </div>

        {/* Rule Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Rule:
          </span>
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                selectedFilter === f
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-500/30"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Anomalies List */}
      <div className="mt-4 space-y-3">
        {filteredAnomalies.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No anomalies detected under filter rule {selectedFilter}.
          </div>
        ) : (
          filteredAnomalies.map((anom) => {
            const isExpanded = expandedId === anom.id;
            const explanation = explanationsMap.get(anom.id);

            return (
              <div
                key={anom.id}
                className={`border rounded-xl transition-all overflow-hidden cursor-pointer ${
                  isExpanded
                    ? "border-slate-700 bg-slate-950/70 shadow-md"
                    : "border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60"
                }`}
                title={`FY ${anom.year} • +${anom.risk_points} pts`}
              >
                {/* Clickable Card Summary */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : anom.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  title={`FY ${anom.year} • +${anom.risk_points} pts`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-sm border shrink-0 ${getRuleBadgeColor(
                        anom.anomaly_type
                      )}`}
                    >
                      {anom.anomaly_type}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{anom.name}</h4>
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          FY {anom.year}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 font-mono">{anom.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-rose-950/80 text-rose-300 border border-rose-800/80 cursor-pointer"
                      title={`FY ${anom.year} • +${anom.risk_points} pts`}
                    >
                      +{anom.risk_points} pts
                    </span>
                    <div className="text-slate-400 hover:text-white">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Inline Expanded AI Explanation Card */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 bg-slate-900/60">
                    {explanation ? (
                      <ExplanationCard
                        explanation={explanation}
                        anomalyName={anom.name}
                        ruleCode={anom.anomaly_type}
                      />
                    ) : (
                      <div className="p-4 text-xs text-slate-400 italic flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                        Generating AI analytical report for this event...
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
