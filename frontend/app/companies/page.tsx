"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCompanies, deleteCompany, loadDemoDataset } from "../../lib/api";
import { CompanyListItem } from "../../lib/types";
import { SpotlightCard, ShinyBadge } from "../../components/react-bits";
import {
  Building2,
  Search,
  ExternalLink,
  Trash2,
  UploadCloud,
  Loader2,
  AlertOctagon,
  Sparkles,
  ShieldAlert,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "HIGH" | "MODERATE" | "LOW">("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = () => {
    setIsLoading(true);
    setErrorMsg(null);
    fetchCompanies()
      .then((data) => setCompanies(data))
      .catch((err) => setErrorMsg(err.message || "Failed to load corporate records."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDemo = async () => {
    setIsDemoLoading(true);
    try {
      await loadDemoDataset();
      loadData();
    } catch (err: any) {
      alert(`Demo load failed: ${err.message || err}`);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete '${name}' and all associated forensic records?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteCompany(id);
      loadData();
    } catch (err: any) {
      alert(`Failed to delete company: ${err.message || err}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = companies.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      riskFilter === "ALL" || c.risk_level.toUpperCase() === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const highRiskCount = companies.filter((c) => c.risk_level.toLowerCase() === "high").length;
  const modRiskCount = companies.filter((c) => c.risk_level.toLowerCase() === "moderate").length;
  const lowRiskCount = companies.filter((c) => c.risk_level.toLowerCase() === "low").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-medium text-slate-400">Audited Companies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Companies Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Directory of analyzed corporate financial statements and multi-year anomaly assessments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all shadow-sm"
          >
            {isDemoLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            Load Demo
          </button>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-rose-500/20 hover:opacity-95 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Dataset
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SpotlightCard className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Entities</span>
            <BarChart3 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">{companies.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Audited datasets</div>
        </SpotlightCard>

        <SpotlightCard className="p-4 rounded-xl border border-rose-900/30 bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-rose-300 uppercase tracking-wider">High Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">{highRiskCount}</div>
          <div className="text-[10px] text-rose-400/60 mt-0.5">Critical anomalies</div>
        </SpotlightCard>

        <SpotlightCard className="p-4 rounded-xl border border-amber-900/30 bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-300 uppercase tracking-wider">Moderate Risk</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">{modRiskCount}</div>
          <div className="text-[10px] text-amber-400/60 mt-0.5">Elevated divergence</div>
        </SpotlightCard>

        <SpotlightCard className="p-4 rounded-xl border border-emerald-900/30 bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-300 uppercase tracking-wider">Low Risk</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">{lowRiskCount}</div>
          <div className="text-[10px] text-emerald-400/60 mt-0.5">Normal patterns</div>
        </SpotlightCard>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audited entities by name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-all font-sans"
          />
        </div>

        {/* Risk Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          {(["ALL", "HIGH", "MODERATE", "LOW"] as const).map((lvl) => {
            const active = riskFilter === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                  active
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700/80"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Companies Table wrapped in SpotlightCard */}
      <SpotlightCard className="rounded-2xl border border-slate-800/80 bg-slate-900/70 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            <span className="font-mono">Loading corporate directories...</span>
          </div>
        ) : errorMsg ? (
          <div className="p-12 text-center text-rose-400 text-xs space-y-3 bg-rose-950/20">
            <div className="flex items-center justify-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-3">
            <p>
              {searchTerm || riskFilter !== "ALL"
                ? `No entities matching the current criteria.`
                : "No company datasets uploaded yet."}
            </p>
            {companies.length === 0 && (
              <button
                onClick={handleDemo}
                disabled={isDemoLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-rose-500/20 hover:opacity-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Sample 10-Year Dataset
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 font-mono">
                  <th className="py-3.5 px-4 font-semibold">Entity Name</th>
                  <th className="py-3.5 px-4 font-semibold">Risk Score</th>
                  <th className="py-3.5 px-4 font-semibold">Classification</th>
                  <th className="py-3.5 px-4 font-semibold">Timeline</th>
                  <th className="py-3.5 px-4 font-semibold">Audit Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map((comp) => {
                  const isHigh = comp.risk_level.toLowerCase() === "high";
                  const isMod = comp.risk_level.toLowerCase() === "moderate";

                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <Link
                          href={`/dashboard/${comp.id}`}
                          className="hover:text-rose-400 flex items-center gap-2 group transition-colors"
                        >
                          {comp.name}
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-rose-400 transition-colors" />
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <span className={isHigh ? "text-rose-400" : isMod ? "text-amber-400" : "text-emerald-400"}>
                          {comp.risk_score}
                        </span>{" "}
                        <span className="text-slate-500 font-normal">/ 100</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <ShinyBadge
                          variant={isHigh ? "rose" : isMod ? "amber" : "emerald"}
                          size="sm"
                        >
                          {comp.risk_level.toUpperCase()} RISK
                        </ShinyBadge>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        {comp.years_count} Fiscal Years
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(comp.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/${comp.id}`}
                            className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors"
                          >
                            View Report
                          </Link>
                          <button
                            onClick={() => handleDelete(comp.id, comp.name)}
                            disabled={deletingId === comp.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                            title="Delete company"
                          >
                            {deletingId === comp.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SpotlightCard>
    </div>
  );
}
