"use client";

import { useState } from "react";
import { FinancialData, Ratio } from "../lib/types";
import { Table, FileSpreadsheet, Calculator, Download } from "lucide-react";
import { SpotlightCard, AnimatedTabs, ShinyBadge } from "./react-bits";

interface DataTableProps {
  financialData: FinancialData[];
  ratios: Ratio[];
}

export default function DataTable({ financialData, ratios }: DataTableProps) {
  const [activeTab, setActiveTab] = useState<string>("statements");

  const exportToCsv = () => {
    if (activeTab === "statements") {
      const headers = "Year,Revenue,COGS,NetProfit,Receivables,Inventory,TotalAssets,TotalDebt,Equity,OCF,Capex,RPT\n";
      const rows = financialData
        .map(
          (d) =>
            `${d.year},${d.revenue},${d.cogs},${d.net_profit},${d.receivables},${d.inventory},${d.total_assets},${d.total_debt},${d.equity},${d.operating_cash_flow},${d.capex},${d.related_party_transactions || 0}`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial_statements_${financialData[0]?.year || "data"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = "Year,GrossMargin,NetMargin,ROE,ROA,CurrentRatio,DebtToEquity,RecTurnover,InvTurnover,OCFToProfit,FCF\n";
      const rows = ratios
        .map(
          (r) =>
            `${r.year},${r.gross_margin || 0},${r.net_margin || 0},${r.roe || 0},${r.roa || 0},${r.current_ratio || 0},${r.debt_to_equity || 0},${r.receivables_turnover || 0},${r.inventory_turnover || 0},${r.ocf_to_profit || 0},${r.free_cash_flow || 0}`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial_ratios_${ratios[0]?.year || "data"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const tabs = [
    { id: "statements", label: "Statements ($M)", icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
    { id: "ratios", label: "18 Calculated Ratios", icon: <Calculator className="w-3.5 h-3.5" /> },
  ];

  return (
    <SpotlightCard className="p-5 sm:p-6 border-slate-800/90">
      {/* Header with Tab switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-950/70 text-blue-400 rounded-lg border border-blue-800/50">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Financial Statements & Key Ratios
            </h3>
            <p className="text-xs text-slate-400">
              Multi-year balance sheet, income, and cash flow metrics with 18 calculated ratio benchmarks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          <AnimatedTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id)}
            size="sm"
          />
          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Export view as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-4 rounded-xl border border-slate-800/60 bg-slate-950/40">
        {activeTab === "statements" ? (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono">
                <th className="py-3 px-3 font-semibold">Fiscal Year</th>
                <th className="py-3 px-3 font-semibold">Revenue</th>
                <th className="py-3 px-3 font-semibold">COGS</th>
                <th className="py-3 px-3 font-semibold">Net Profit</th>
                <th className="py-3 px-3 font-semibold">Receivables</th>
                <th className="py-3 px-3 font-semibold">Inventory</th>
                <th className="py-3 px-3 font-semibold">Total Assets</th>
                <th className="py-3 px-3 font-semibold">Total Debt</th>
                <th className="py-3 px-3 font-semibold">Equity</th>
                <th className="py-3 px-3 font-semibold">Op Cash Flow</th>
                <th className="py-3 px-3 font-semibold">Capex</th>
                <th className="py-3 px-3 font-semibold">RPT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {financialData.map((row) => (
                <tr key={row.year} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white bg-slate-900/30">{row.year}</td>
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
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono">
                <th className="py-3 px-3 font-semibold">Fiscal Year</th>
                <th className="py-3 px-3 font-semibold">Gross Margin</th>
                <th className="py-3 px-3 font-semibold">Net Margin</th>
                <th className="py-3 px-3 font-semibold">ROE</th>
                <th className="py-3 px-3 font-semibold">ROA</th>
                <th className="py-3 px-3 font-semibold">Current Ratio</th>
                <th className="py-3 px-3 font-semibold">Debt / Equity</th>
                <th className="py-3 px-3 font-semibold">Rec Turnover</th>
                <th className="py-3 px-3 font-semibold">Inv Turnover</th>
                <th className="py-3 px-3 font-semibold">OCF / Profit</th>
                <th className="py-3 px-3 font-semibold">Free Cash Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {ratios.map((r) => (
                <tr key={r.year} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white bg-slate-900/30">{r.year}</td>
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
    </SpotlightCard>
  );
}
