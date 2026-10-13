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
import { SpotlightCard, ShinyBadge } from "./react-bits";

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
    <SpotlightCard className="p-5 sm:p-6 border-slate-800/90">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-950/70 text-emerald-400 rounded-lg border border-emerald-800/50">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Historical Margin Trajectory
            </h3>
            <p className="text-xs text-slate-400">
              Gross, Operating & Net Margin Trends (%)
            </p>
          </div>
        </div>
        <ShinyBadge variant="emerald" size="sm">
          Rule D Indicator
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
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
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
    </SpotlightCard>
  );
}
