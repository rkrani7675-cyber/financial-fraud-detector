"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAnalysis } from "../../../lib/api";
import { AnalysisResult } from "../../../lib/types";

import RiskScoreCard from "../../../components/RiskScoreCard";
import TrendChart from "../../../components/TrendChart";
import BarChartComponent from "../../../components/BarChart";
import MarginChart from "../../../components/MarginChart";
import AnomalyList from "../../../components/AnomalyList";
import DataTable from "../../../components/DataTable";

import {
  Building2,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Suspense } from "react";

function DashboardContent() {
  const params = useParams();
  const router = useRouter();
  const companyId = Number(params?.companyId);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = () => {
    if (!companyId || isNaN(companyId)) {
      setErrorMsg("Invalid company ID parameter.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    fetchAnalysis(companyId)
      .then((data) => {
        setAnalysis(data);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Failed to load forensic analysis.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <p className="text-sm font-mono">Running forensic anomaly detection pipeline...</p>
      </div>
    );
  }

  if (errorMsg || !analysis) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
        <div className="p-3 bg-rose-950/60 text-rose-400 rounded-2xl w-fit mx-auto border border-rose-800/60">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white">Forensic Analysis Not Found</h2>
        <p className="text-xs text-slate-400">{errorMsg || "Unable to retrieve requested company."}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/companies"
            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            Back to Companies
          </Link>
          <Link
            href="/upload"
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors"
          >
            Upload File
          </Link>
        </div>
      </div>
    );
  }

  const rawPointsSum = analysis.anomalies.reduce((acc, curr) => acc + curr.risk_points, 0);
  const yearsCount = analysis.financial_data.length;

  return (
    <div className="space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Companies
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-950/80 text-rose-400 rounded-xl border border-rose-800/60">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {analysis.company_name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {analysis.financial_data[0]?.year} – {analysis.financial_data[yearsCount - 1]?.year} ({yearsCount} Fiscal Years)
                </span>
                <span>•</span>
                <span>Audit ID: #{analysis.company_id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            title="Reload analysis"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link
            href="/upload"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-rose-600/20 hover:opacity-95 transition-opacity"
          >
            <Sparkles className="w-3.5 h-3.5" /> Upload Another
          </Link>
        </div>
      </div>

      {/* Hero: Risk Score & 3-Tier Status Card */}
      <RiskScoreCard
        score={analysis.risk_score}
        level={analysis.risk_level}
        totalAnomalies={analysis.anomalies.length}
        rawPoints={rawPointsSum}
        yearsCount={yearsCount}
      />

      {/* Visualizations Grid (Recharts) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight">
          Visual Accounting Anomaly Trends
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TrendChart data={analysis.financial_data} />
          <BarChartComponent data={analysis.financial_data} />
        </div>
        <MarginChart ratios={analysis.ratios} />
      </div>

      {/* Anomaly Breakdown & AI Diagnostics */}
      <AnomalyList
        anomalies={analysis.anomalies}
        explanations={analysis.explanations}
      />

      {/* Complete Financial Statements & Ratios Table */}
      <DataTable
        financialData={analysis.financial_data}
        ratios={analysis.ratios}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          <p className="text-sm font-mono">Loading forensic dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

