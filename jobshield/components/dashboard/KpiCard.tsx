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
      bg: "bg-[#EAF4FF] text-[#1E90FF] border-[#B9DCFE]",
      accent: "text-[#1E90FF]",
      badge: "bg-[#EAF4FF] text-[#1E90FF] border-[#B9DCFE]",
      hoverBorder: "hover:border-[#1E90FF]/40",
    },
    emerald: {
      bg: "bg-[#E6F8F0] text-[#00A86B] border-[#A3E9C9]",
      accent: "text-[#00A86B]",
      badge: "bg-[#E6F8F0] text-[#00A86B] border-[#A3E9C9]",
      hoverBorder: "hover:border-[#00A86B]/40",
    },
    rose: {
      bg: "bg-[#FEECEC] text-[#EF4444] border-[#FCA5A5]",
      accent: "text-[#EF4444]",
      badge: "bg-[#FEECEC] text-[#EF4444] border-[#FCA5A5]",
      hoverBorder: "hover:border-[#EF4444]/40",
    },
    amber: {
      bg: "bg-[#FEF5E7] text-[#D97706] border-[#FCD34D]",
      accent: "text-[#D97706]",
      badge: "bg-[#FEF5E7] text-[#D97706] border-[#FCD34D]",
      hoverBorder: "hover:border-[#D97706]/40",
    },
    indigo: {
      bg: "bg-[#EAF4FF] text-[#1E90FF] border-[#B9DCFE]",
      accent: "text-[#1E90FF]",
      badge: "bg-[#EAF4FF] text-[#1E90FF] border-[#B9DCFE]",
      hoverBorder: "hover:border-[#1E90FF]/40",
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-[22px] bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
      } ${style.hoverBorder}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform duration-200 group-hover:scale-105 ${style.bg}`}
        >
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>

        {badge && (
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${style.badge}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-3xl sm:text-4xl font-black text-[#10264C] tracking-tight">
          {value}
        </div>
        <div className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight">
          {title}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate">{subtitle}</span>
      </div>
    </div>
  );
}
