"use client";

import FileUpload from "../../components/FileUpload";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileSpreadsheet, ShieldAlert } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
        </Link>
        <span className="text-xs font-mono text-slate-500">Pipeline Step: Ingestion & Analysis</span>
      </div>

      {/* Main Upload Box */}
      <FileUpload />

      {/* Requirements Guide Card */}
      <div className="max-w-2xl mx-auto bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-rose-400" />
          Statement Formatting Guidelines (PRD Section 11)
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Minimum 3 consecutive fiscal years</span>
          </li>
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Required: Revenue, COGS, Net Profit</span>
          </li>
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Required: Receivables, Inventory, Total Assets</span>
          </li>
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Required: Total Debt, Equity, Operating Cash Flow</span>
          </li>
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Required: Capex, Depreciation</span>
          </li>
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Optional: RPT, Interest, Current Assets/Liab</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
