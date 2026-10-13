"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCompanies, deleteCompany } from "../../lib/api";
import { CompanyListItem } from "../../lib/types";
import {
  Building2,
  Search,
  ExternalLink,
  Trash2,
  UploadCloud,
  ShieldAlert,
  Loader2,
  AlertOctagon,
} from "lucide-react";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-400" />
            Corporate Entities Registry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Overview of all historical corporate financial statement datasets analyzed
          </p>
        </div>

        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-rose-600/20 hover:opacity-95 transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          Upload New Dataset
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by company name..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
        />
      </div>

      {/* Companies Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            Loading corporate directories...
          </div>
        ) : errorMsg ? (
          <div className="p-10 text-center text-rose-400 text-xs space-y-3 bg-rose-950/20">
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
          <div className="p-12 text-center text-slate-400 text-xs">
            {searchTerm ? `No entities matching "${searchTerm}".` : "No companies uploaded yet."}
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
                <th className="py-3 px-4 font-semibold">Entity Name</th>
                <th className="py-3 px-4 font-semibold">Risk Score</th>
                <th className="py-3 px-4 font-semibold">3-Tier Status</th>
                <th className="py-3 px-4 font-semibold">Timeline</th>
                <th className="py-3 px-4 font-semibold">Created</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((comp) => {
                const isHigh = comp.risk_level.toLowerCase() === "high";
                const isMod = comp.risk_level.toLowerCase() === "moderate";

                return (
                  <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
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
                      {comp.risk_score} / 100
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                          isHigh
                            ? "bg-rose-950/80 text-rose-300 border-rose-800/80"
                            : isMod
                            ? "bg-amber-950/80 text-amber-300 border-amber-800/80"
                            : "bg-emerald-950/80 text-emerald-300 border-emerald-800/80"
                        }`}
                      >
                        {comp.risk_level} Risk
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {comp.years_count} Years
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(comp.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/${comp.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => handleDelete(comp.id, comp.name)}
                          disabled={deletingId === comp.id}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                          title="Delete company"
                        >
                          {deletingId === comp.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
