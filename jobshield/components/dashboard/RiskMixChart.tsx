"use client";

import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ShieldCheck } from "lucide-react";
import { RiskMixData, RISK_CHART_COLORS } from "@/lib/dashboardMetrics";

interface RiskMixChartProps {
  riskMix: RiskMixData;
  activeChecksCount: number;
  onFilterSeverity?: (severity: "high" | "medium" | "low") => void;
}

interface ChartDataItem {
  name: string;
  severity: "high" | "medium" | "low";
  value: number;
  color: string;
}

export function RiskMixChart({
  riskMix,
  activeChecksCount,
  onFilterSeverity,
}: RiskMixChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const rawData: ChartDataItem[] = [
    {
      name: "High",
      severity: "high",
      value: riskMix.high,
      color: RISK_CHART_COLORS.high,
    },
    {
      name: "Medium",
      severity: "medium",
      value: riskMix.medium,
      color: RISK_CHART_COLORS.medium,
    },
    {
      name: "Low",
      severity: "low",
      value: riskMix.low,
      color: RISK_CHART_COLORS.low,
    },
  ];

  // Filter out 0 slices for clean pie rendering
  const chartData = rawData.filter((d) => d.value > 0);
  const totalFindings = riskMix.total;

  return (
    <div className="rounded-[24px] bg-white border border-slate-200/80 shadow-sm p-5 sm:p-7 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Risk mix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            P3 evidence-backed findings breakdown
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {activeChecksCount} active {activeChecksCount === 1 ? "check" : "checks"}
        </span>
      </div>

      {/* Chart Canvas Area */}
      <div className="py-4 flex-1 flex flex-col items-center justify-center min-h-[220px]">
        {totalFindings === 0 ? (
          <div className="text-center py-6 px-4 space-y-2 max-w-xs mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mx-auto text-slate-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No findings yet</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyze a job check to derive empirical findings and populate the risk mix chart.
            </p>
          </div>
        ) : (
          <div className="relative w-full h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={chartData.length > 1 ? 4 : 0}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={(entry: unknown) => {
                    const item = entry as ChartDataItem | null | undefined;
                    if (item && item.severity && onFilterSeverity) {
                      onFilterSeverity(item.severity);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.severity}`}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                      className="transition-all duration-200 outline-none hover:opacity-90"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ChartDataItem;
                      const percent = ((data.value / totalFindings) * 100).toFixed(1);
                      return (
                        <div className="rounded-xl bg-slate-900 text-white px-3 py-2 text-xs shadow-xl border border-slate-800 space-y-0.5">
                          <div className="font-bold flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            <span>{data.name} Priority</span>
                          </div>
                          <div className="text-slate-300">
                            {data.value} {data.value === 1 ? "finding" : "findings"} ({percent}%)
                          </div>
                          {onFilterSeverity && (
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                              Click segment to filter
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Total
              </span>
              <span className="text-2xl font-black text-slate-900 tracking-tight leading-none my-0.5">
                {totalFindings}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                findings
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend with interactive buttons */}
      <div className="pt-4 border-t border-slate-100">
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Low */}
          <button
            type="button"
            onClick={() => onFilterSeverity?.("low")}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Low</span>
            </div>
            <span className="text-sm font-bold text-slate-900 mt-0.5">
              {riskMix.low}
            </span>
          </button>

          {/* Medium */}
          <button
            type="button"
            onClick={() => onFilterSeverity?.("medium")}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Medium</span>
            </div>
            <span className="text-sm font-bold text-slate-900 mt-0.5">
              {riskMix.medium}
            </span>
          </button>

          {/* High */}
          <button
            type="button"
            onClick={() => onFilterSeverity?.("high")}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>High</span>
            </div>
            <span className="text-sm font-bold text-slate-900 mt-0.5">
              {riskMix.high}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
