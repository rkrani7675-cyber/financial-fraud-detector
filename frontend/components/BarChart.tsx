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
import { SpotlightCard, ShinyBadge } from "./react-bits";

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
    <SpotlightCard className="p-5 sm:p-6 border-slate-800/90">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-950/70 text-amber-400 rounded-lg border border-amber-800/50">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Working Capital & Debt Accumulation
            </h3>
            <p className="text-xs text-slate-400">
              Accounts Receivable, Inventory Buildup & Total Debt ($M)
            </p>
          </div>
        </div>
        <ShinyBadge variant="amber" size="sm">
          Rules A, C & G
        </ShinyBadge>
      </div>

      <div className="h-72 w-full cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(51, 65, 85, 0.25)" }}
              contentStyle={{
                backgroundColor: "#090d16",
                borderColor: "#334155",
                borderRadius: "0.75rem",
                color: "#f8fafc",
                fontSize: "12px",
                padding: "8px 12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6)",
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
    </SpotlightCard>
  );
}
