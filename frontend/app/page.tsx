"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchCompanies, loadDemoDataset } from "../lib/api";
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
  Sparkles,
  ExternalLink,
  Layers,
  ShieldCheck,
  Zap,
  Loader2,
} from "lucide-react";
import { SpotlightCard, AnimatedCounter, ShinyBadge } from "../components/react-bits";

export default function HomePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
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

  const handleLaunchDemo = async () => {
    setIsDemoLoading(true);
    setErrorMsg(null);
    try {
      const result = await loadDemoDataset();
      router.push(`/dashboard/${result.company_id}`);
    } catch {
      // If endpoint fails, navigate to upload page
      router.push("/upload");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <SpotlightCard
        spotlightColor="rgba(99, 102, 241, 0.16)"
        className="p-8 sm:p-14 text-center border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950"
      >
        <div className="inline-flex items-center gap-2 mb-6">
          <ShinyBadge variant="indigo" size="md" icon={<ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />}>
            Forensic Accounting Intelligence • Full-Stack Platform
          </ShinyBadge>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Detect Accounting Irregularities &{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
            Financial Statement Anomalies
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 sm:mt-5 leading-relaxed">
          An automated forensic auditing platform that ingests 10-year financial statements to expose
          earnings manipulation, working capital divergences, and accounting red flags before they surface.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8 sm:mt-10">
          <button
            type="button"
            onClick={handleLaunchDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDemoLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading Demo Audit...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Explore Live Demo (Apex Global)</span>
              </>
            )}
          </button>

          <Link
            href="/upload"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 transition-all"
          >
            <UploadCloud className="w-4 h-4 text-slate-400" />
            <span>Upload New Statements</span>
          </Link>

          <Link
            href="/companies"
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white font-medium text-sm border border-slate-800 transition-all"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>View Registries ({companies.length})</span>
          </Link>
        </div>

        {/* Key Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80 max-w-4xl mx-auto">
          <div className="text-center p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              <AnimatedCounter value={18} duration={0.8} />
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Financial Ratios</div>
          </div>

          <div className="text-center p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
              <AnimatedCounter value={7} duration={0.8} />
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Forensic Rules (A–G)</div>
          </div>

          <div className="text-center p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
              3 Tiers
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Low • Moderate • High</div>
          </div>

          <div className="text-center p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">
              Multi-LLM
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Groq • OpenAI • Ollama</div>
          </div>
        </div>
      </SpotlightCard>

      {/* Bento Grid Architecture Showcase */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comprehensive Forensic Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Engineered with strict separation of concerns, forensic accounting equations, and verifiable audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1 */}
          <SpotlightCard className="p-6 border-slate-800/90 space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              7 Forensic Anomaly Rules (A–G)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Detects receivables outpacing sales (+15), profit diverging from operating cash flow (+20), inventory pileups (+10), margin spikes (+8), related-party trades (+12), depreciation suppression (+10), and debt anomalies (+5).
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-mono text-slate-300">Rule A: Rev vs Rec</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-mono text-slate-300">Rule B: Cash Divergence</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-mono text-slate-300">Rule C: Inventory</span>
            </div>
          </SpotlightCard>

          {/* Bento Card 2 */}
          <SpotlightCard className="p-6 border-slate-800/90 space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Open Multi-AI Architecture
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect any OpenAI-compatible provider: high-throughput Groq LPUs, OpenRouter, DeepSeek, Google Gemini, or private local Ollama running offline. Tab-isolated keys strictly in sessionStorage.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-mono text-slate-300">Groq LPU</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-mono text-slate-300">OpenAI</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-mono text-slate-300">DeepSeek</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-mono text-slate-300">Local Ollama</span>
            </div>
          </SpotlightCard>

          {/* Bento Card 3 */}
          <SpotlightCard className="p-6 border-slate-800/90 space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Hardened Session Security
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Secure cookie sessions (<code className="text-slate-200">httpOnly</code>, <code className="text-slate-200">SameSite=Lax</code>), bcrypt password hashing, Pydantic type coercion, and a 0-persistence policy for user API credentials.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-mono text-slate-300">httpOnly JWT</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-mono text-slate-300">Bcrypt Hashes</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-mono text-slate-300">Fail Fast & Loud</span>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Recently Analyzed Corporate Statements */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Corporate Statements Registry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any company to inspect its risk gauge, 10-year trends, and AI forensic reports
            </p>
          </div>
          <Link
            href="/companies"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/70 text-rose-300 text-xs flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <SpotlightCard className="p-10 text-center border-slate-800/80">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">No Corporate Statements Registered Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click the demo button above to load our 10-year audited sample dataset, or upload your own statements.
            </p>
            <button
              onClick={handleLaunchDemo}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Load Demo Dataset
            </button>
          </SpotlightCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.slice(0, 6).map((c) => {
              const riskVariant =
                c.risk_level?.toLowerCase() === "low"
                  ? "emerald"
                  : c.risk_level?.toLowerCase() === "moderate"
                  ? "amber"
                  : "rose";

              return (
                <Link key={c.id} href={`/dashboard/${c.id}`} className="group block">
                  <SpotlightCard className="p-5 border-slate-800/80 group-hover:border-slate-700 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-indigo-400 transition-colors">
                          {c.name}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          Company #{c.id} • {c.years_count} Historical Years
                        </span>
                      </div>
                      <ShinyBadge variant={riskVariant} size="sm">
                        {c.risk_level || "Audited"}
                      </ShinyBadge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                      <div className="p-2 rounded-lg bg-slate-950/50">
                        <div className="text-xs text-slate-400 font-medium">Risk Score</div>
                        <div className="text-base font-bold font-mono text-white mt-0.5">
                          {c.risk_score !== undefined ? `${c.risk_score}/100` : "N/A"}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/50">
                        <div className="text-xs text-slate-400 font-medium">Timeline</div>
                        <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                          {c.years_count} Years
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
