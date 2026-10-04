"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  badge?: string;
  icon: LucideIcon;
  variant?: "blue" | "emerald" | "rose" | "amber" | "indigo";
  onClick?: () => void;
}

export function KpiCard({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  variant = "blue",
  onClick,
}: KpiCardProps) {
  const variantStyles = {
    blue: {
      bg: "bg-blue-500/10 text-blue-600 border-blue-200/50",
      accent: "text-blue-600",
      badge: "bg-blue-50 text-blue-700 border-blue-200/60",
      hoverBorder: "hover:border-blue-300",
    },
    emerald: {
      bg: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
      accent: "text-emerald-600",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      hoverBorder: "hover:border-emerald-300",
    },
    rose: {
      bg: "bg-rose-500/10 text-rose-600 border-rose-200/50",
      accent: "text-rose-600",
      badge: "bg-rose-50 text-rose-700 border-rose-200/60",
      hoverBorder: "hover:border-rose-300",
    },
    amber: {
      bg: "bg-amber-500/10 text-amber-600 border-amber-200/50",
      accent: "text-amber-600",
      badge: "bg-amber-50 text-amber-700 border-amber-200/60",
      hoverBorder: "hover:border-amber-300",
    },
    indigo: {
      bg: "bg-indigo-500/10 text-indigo-600 border-indigo-200/50",
      accent: "text-indigo-600",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
      hoverBorder: "hover:border-indigo-300",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-[22px] bg-white p-5 sm:p-6 border border-slate-200/80 shadow-sm transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
      } ${style.hoverBorder}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs transition-transform duration-200 group-hover:scale-105 ${style.bg}`}
        >
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>

        {badge && (
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-tight ${style.badge}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {value}
        </div>
        <div className="text-xs sm:text-sm font-bold text-slate-600 tracking-tight">
          {title}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="truncate">{subtitle}</span>
      </div>
    </div>
  );
}
