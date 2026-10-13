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
import { Ratio } from "../lib/types";
import { Percent } from "lucide-react";

interface MarginChartProps {
  ratios: Ratio[];
}

export default function MarginChart({ ratios }: MarginChartProps) {
  const chartData = ratios.map((r) => ({
    year: r.year,
    "Gross Margin (%)": r.gross_margin ? +(r.gross_margin * 100).toFixed(1) : 0,
    "Operating Margin (%)": r.operating_margin ? +(r.operating_margin * 100).toFixed(1) : 0,
    "Net Margin (%)": r.net_margin ? +(r.net_margin * 100).toFixed(1) : 0,
  }));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/50">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Historical Margin Trajectory
            </h3>
            <p className="text-xs text-slate-400">
              Gross, Operating & Net Margin Trends (%)
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full">
          Rule D Indicator
        </span>
      </div>

      <div className="h-72 w-full cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
            <Tooltip
              cursor={{ stroke: "#475569", strokeDasharray: "3 3" }}
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
              formatter={(val: any, name: any) => [`${val}%`, name]}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} iconType="circle" />
            <Line
              type="monotone"
              dataKey="Gross Margin (%)"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={{ r: 3, fill: "#38bdf8", cursor: "pointer" }}
              activeDot={{ r: 5, fill: "#38bdf8", cursor: "pointer" }}
            />
            <Line
              type="monotone"
              dataKey="Operating Margin (%)"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={{ r: 3, fill: "#a78bfa", cursor: "pointer" }}
              activeDot={{ r: 5, fill: "#a78bfa", cursor: "pointer" }}
            />
            <Line
              type="monotone"
              dataKey="Net Margin (%)"
              stroke="#f43f5e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#f43f5e", cursor: "pointer" }}
              activeDot={{ r: 6, fill: "#f43f5e", cursor: "pointer" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
