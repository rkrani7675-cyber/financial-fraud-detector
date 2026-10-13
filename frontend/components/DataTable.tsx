"use client";

import { useState } from "react";
import { FinancialData, Ratio } from "../lib/types";
import { Table, FileSpreadsheet, Calculator } from "lucide-react";

interface DataTableProps {
  financialData: FinancialData[];
  ratios: Ratio[];
}

export default function DataTable({ financialData, ratios }: DataTableProps) {
  const [activeTab, setActiveTab] = useState<"statements" | "ratios">("statements");

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
      {/* Header with Tab switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-950 text-blue-400 rounded-lg border border-blue-800/50">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Historical Ledger & Quantitative Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Raw multi-year statement variables and 18 calculated ratio benchmarks
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("statements")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "statements"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Statements ($M)
          </button>
          <button
            onClick={() => setActiveTab("ratios")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "ratios"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            18 Financial Ratios
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-4">
        {activeTab === "statements" ? (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3 font-semibold">Fiscal Year</th>
                <th className="py-2.5 px-3 font-semibold">Revenue</th>
                <th className="py-2.5 px-3 font-semibold">COGS</th>
                <th className="py-2.5 px-3 font-semibold">Net Profit</th>
                <th className="py-2.5 px-3 font-semibold">Receivables</th>
                <th className="py-2.5 px-3 font-semibold">Inventory</th>
                <th className="py-2.5 px-3 font-semibold">Total Assets</th>
                <th className="py-2.5 px-3 font-semibold">Total Debt</th>
                <th className="py-2.5 px-3 font-semibold">Equity</th>
                <th className="py-2.5 px-3 font-semibold">Op Cash Flow</th>
                <th className="py-2.5 px-3 font-semibold">Capex</th>
                <th className="py-2.5 px-3 font-semibold">RPT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {financialData.map((row) => (
                <tr key={row.year} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white bg-slate-950/40">{row.year}</td>
                  <td className="py-2.5 px-3 text-slate-200">${row.revenue}</td>
                  <td className="py-2.5 px-3 text-slate-300">${row.cogs}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-400">${row.net_profit}</td>
                  <td className="py-2.5 px-3 text-amber-300">${row.receivables}</td>
                  <td className="py-2.5 px-3 text-pink-300">${row.inventory}</td>
                  <td className="py-2.5 px-3 text-slate-300">${row.total_assets}</td>
                  <td className="py-2.5 px-3 text-purple-300">${row.total_debt}</td>
                  <td className="py-2.5 px-3 text-slate-300">${row.equity}</td>
                  <td className="py-2.5 px-3 font-semibold text-rose-400">${row.operating_cash_flow}</td>
                  <td className="py-2.5 px-3 text-slate-300">${row.capex}</td>
                  <td className="py-2.5 px-3 text-indigo-300">${row.related_party_transactions || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3 font-semibold">Fiscal Year</th>
                <th className="py-2.5 px-3 font-semibold">Gross Margin</th>
                <th className="py-2.5 px-3 font-semibold">Net Margin</th>
                <th className="py-2.5 px-3 font-semibold">ROE</th>
                <th className="py-2.5 px-3 font-semibold">ROA</th>
                <th className="py-2.5 px-3 font-semibold">Current Ratio</th>
                <th className="py-2.5 px-3 font-semibold">Debt / Equity</th>
                <th className="py-2.5 px-3 font-semibold">Rec Turnover</th>
                <th className="py-2.5 px-3 font-semibold">Inv Turnover</th>
                <th className="py-2.5 px-3 font-semibold">OCF / Profit</th>
                <th className="py-2.5 px-3 font-semibold">Free Cash Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {ratios.map((r) => (
                <tr key={r.year} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white bg-slate-950/40">{r.year}</td>
                  <td className="py-2.5 px-3 text-slate-200">
                    {r.gross_margin ? `${(r.gross_margin * 100).toFixed(1)}%` : "N/A"}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-rose-400">
                    {r.net_margin ? `${(r.net_margin * 100).toFixed(1)}%` : "N/A"}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {r.roe ? `${(r.roe * 100).toFixed(1)}%` : "N/A"}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {r.roa ? `${(r.roa * 100).toFixed(1)}%` : "N/A"}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">
                    {r.current_ratio ? `${r.current_ratio.toFixed(2)}x` : "N/A"}
                  </td>
                  <td className="py-2.5 px-3 text-purple-300">
                    {r.debt_to_equity ? `${r.debt_to_equity.toFixed(2)}x` : "N/A"}
                  </td>
                  <td className="py-2.5 px-3 text-amber-300">
                    {r.receivables_turnover ? `${r.receivables_turnover.toFixed(2)}x` : "N/A"}
                  </td>
                  <td className="py-2.5 px-3 text-pink-300">
                    {r.inventory_turnover ? `${r.inventory_turnover.toFixed(2)}x` : "N/A"}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {r.ocf_to_profit ? `${r.ocf_to_profit.toFixed(2)}x` : "N/A"}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-400">
                    ${r.free_cash_flow}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
