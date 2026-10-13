"use client";

import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { FinancialData } from "../lib/types";
import { BarChart3 } from "lucide-react";

interface BarChartProps {
  data: FinancialData[];
}

export default function BarChartComponent({ data }: BarChartProps) {
  const chartData = data.map((d) => ({
    year: d.year,
    Receivables: d.receivables,
    Inventory: d.inventory,
    "Total Debt": d.total_debt,
  }));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-950 text-amber-400 rounded-lg border border-amber-800/50">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Working Capital & Debt Accumulation
            </h3>
            <p className="text-xs text-slate-400">
              Accounts Receivable, Inventory Buildup & Total Debt ($M)
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded-full">
          Rules A, C & G
        </span>
      </div>

      <div className="h-72 w-full cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(51, 65, 85, 0.3)" }}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "0.5rem",
                color: "#f8fafc",
                fontSize: "12px",
                padding: "8px 12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              }}
              labelFormatter={(year) => `FY ${year}`}
              formatter={(val: any, name: any) => [`$${val}M`, name]}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              iconType="square"
            />
            <Bar dataKey="Receivables" fill="#f59e0b" radius={[4, 4, 0, 0]} cursor="pointer" />
            <Bar dataKey="Inventory" fill="#ec4899" radius={[4, 4, 0, 0]} cursor="pointer" />
            <Bar dataKey="Total Debt" fill="#8b5cf6" radius={[4, 4, 0, 0]} cursor="pointer" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
