"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCompanies } from "../lib/api";
import { CompanyListItem } from "../lib/types";
import {
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  FileSpreadsheet,
  Cpu,
  BarChart2,
  Building2,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadCompanies = () => {
    setIsLoading(true);
    setErrorMsg(null);
    fetchCompanies()
      .then((data) => setCompanies(data))
      .catch((err) => setErrorMsg(err.message || "Failed to load corporate records."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          Forensic Financial Risk Intelligence
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Detect Accounting Irregularities &{" "}
          <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-400 bg-clip-text text-transparent">
            Financial Statement Anomalies
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
          Examines multi-year income statements, balance sheets, and cash flows to flag earnings manipulation,
          working capital divergence, and accounting red flags before they surface.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
          <Link
            href="/upload"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-rose-600/30 hover:opacity-95 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            Upload New Statements
          </Link>
          <Link
            href="/companies"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 transition-all"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            View Analyzed Companies ({companies.length})
          </Link>
        </div>

        {/* Key Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">18</div>
            <div className="text-xs text-slate-400 mt-0.5">Financial Ratios</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">7</div>
            <div className="text-xs text-slate-400 mt-0.5">Anomaly Rules (A–G)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">3 Tiers</div>
            <div className="text-xs text-slate-400 mt-0.5">Low • Moderate • High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">AI</div>
            <div className="text-xs text-slate-400 mt-0.5">Explanation Engine</div>
          </div>
        </div>
      </div>

      {/* Recently Analyzed Companies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-400" />
              Analyzed Corporate Entities
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an entity to review forensic dashboard, Recharts visualizations, and AI reports
            </p>
          </div>
          <Link
            href="/companies"
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            All Companies <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading corporate records...</div>
        ) : errorMsg ? (
          <div className="border border-rose-900/60 rounded-2xl p-6 text-center bg-rose-950/30 space-y-3">
            <div className="flex items-center justify-center gap-2 text-rose-400 text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Failed to connect to backend API: {errorMsg}</span>
            </div>
            <button
              onClick={loadCompanies}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : companies.length === 0 ? (
          <div className="border border-slate-800 rounded-2xl p-8 text-center bg-slate-900/40">
            <p className="text-slate-400 text-sm">No companies analyzed yet.</p>
            <Link
              href="/upload"
              className="mt-3 inline-block text-xs font-semibold text-rose-400 underline"
            >
              Upload your first dataset
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((comp) => {
              const isHigh = comp.risk_level.toLowerCase() === "high";
              const isMod = comp.risk_level.toLowerCase() === "moderate";

              return (
                <Link
                  key={comp.id}
                  href={`/dashboard/${comp.id}`}
                  className="group block border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl p-5 transition-all shadow-md hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-rose-400 transition-colors">
                        {comp.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {comp.years_count} Historical Years
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                        isHigh
                          ? "bg-rose-950/80 text-rose-300 border-rose-800/80"
                          : isMod
                          ? "bg-amber-950/80 text-amber-300 border-amber-800/80"
                          : "bg-emerald-950/80 text-emerald-300 border-emerald-800/80"
                      }`}
                    >
                      {comp.risk_level} ({comp.risk_score})
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Forensic Report Available</span>
                    <span className="text-rose-400 flex items-center gap-1 font-semibold group-hover:translate-x-1 transition-transform">
                      Inspect <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="p-2.5 bg-rose-950 text-rose-400 rounded-xl w-fit border border-rose-800/60 mb-3">
            <TrendingDown className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Cash Flow Divergence (Rule B)</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Flags instances where reported accounting net profit increases while operational cash generation decreases, exposing earnings quality deterioration.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="p-2.5 bg-amber-950 text-amber-400 rounded-xl w-fit border border-amber-800/60 mb-3">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Receivables Expansion (Rule A)</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Identifies accounts receivable outpacing organic top-line revenue growth by &gt;20%, revealing aggressive revenue recognition and collection delays.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="p-2.5 bg-purple-950 text-purple-400 rounded-xl w-fit border border-purple-800/60 mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">AI Explanation Cards</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Every quantitative flag generates a 3-part diagnostic report outlining what was found, why it matters, and concrete recommended investigation steps.
          </p>
        </div>
      </div>
    </div>
  );
}
