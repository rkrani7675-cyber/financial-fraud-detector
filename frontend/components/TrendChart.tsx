"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { FinancialData } from "../lib/types";
import { TrendingUp } from "lucide-react";
import { SpotlightCard, ShinyBadge } from "./react-bits";

interface TrendChartProps {
  data: FinancialData[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((d) => ({
    year: d.year,
    Revenue: d.revenue,
    "Net Profit": d.net_profit,
    "Operating Cash Flow": d.operating_cash_flow,
    Capex: d.capex,
  }));

  return (
    <SpotlightCard className="p-5 sm:p-6 border-slate-800/90">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-950/70 text-indigo-400 rounded-lg border border-indigo-800/50">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Cash vs. Profit Divergence Trend
            </h3>
            <p className="text-xs text-slate-400">
              Revenue, Accounting Net Profit & Tangible Operating Cash Flow ($M)
            </p>
          </div>
        </div>
        <ShinyBadge variant="rose" size="sm">
          Rule B Indicator
        </ShinyBadge>
      </div>

      <div className="h-72 w-full cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              cursor={{ stroke: "#475569", strokeDasharray: "3 3" }}
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
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="Revenue"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{ r: 3, fill: "#60a5fa", cursor: "pointer" }}
              activeDot={{ r: 5, fill: "#60a5fa", cursor: "pointer" }}
            />
            <Line
              type="monotone"
              dataKey="Net Profit"
              stroke="#34d399"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#34d399", cursor: "pointer" }}
              activeDot={{ r: 6, fill: "#34d399", cursor: "pointer" }}
            />
            <Line
              type="monotone"
              dataKey="Operating Cash Flow"
              stroke="#f43f5e"
              strokeWidth={3}
              strokeDasharray="4 2"
              dot={{ r: 4, fill: "#f43f5e", cursor: "pointer" }}
              activeDot={{ r: 6, fill: "#f43f5e", cursor: "pointer" }}
            />
            <Line
              type="monotone"
              dataKey="Capex"
              stroke="#fbbf24"
              strokeWidth={1.5}
              dot={{ r: 2.5, fill: "#fbbf24", cursor: "pointer" }}
              activeDot={{ r: 4, fill: "#fbbf24", cursor: "pointer" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SpotlightCard>
  );
}
