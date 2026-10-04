"use client";

import React from "react";
import { IntelligenceVerificationTarget } from "@/lib/intelligence/types";
import { CheckSquare, Square, Clock } from "lucide-react";

interface VerificationItemProps {
  target: IntelligenceVerificationTarget;
  isCompleted: boolean;
  onToggle: (targetTitle: string) => void;
}

export function VerificationItem({
  target,
  isCompleted,
  onToggle,
}: VerificationItemProps) {
  const getPriorityBadge = () => {
    switch (target.priority) {
      case "high":
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold uppercase tracking-wide">
            High Priority
          </span>
        );
      case "medium":
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wide">
            Standard Check
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onToggle(target.title)}
      className={`p-4 sm:p-5 rounded-[24px] border transition-all duration-200 cursor-pointer select-none space-y-2 flex items-start gap-3.5 ${
        isCompleted
          ? "bg-slate-50/70 border-slate-200 text-slate-400 opacity-80"
          : "bg-white border-slate-200/90 hover:border-[#1E90FF] shadow-2xs hover:shadow-xs"
      }`}
      role="checkbox"
      aria-checked={isCompleted}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(target.title);
        }
      }}
    >
      {/* Checkbox Icon */}
      <button
        type="button"
        className="mt-0.5 text-slate-400 hover:text-[#1877D2] focus:outline-hidden transition-colors"
        aria-label={isCompleted ? `Mark ${target.title} as incomplete` : `Mark ${target.title} as completed`}
      >
        {isCompleted ? (
          <CheckSquare className="w-5 h-5 text-emerald-600 stroke-[2.2]" />
        ) : (
          <Square className="w-5 h-5 text-slate-400 hover:text-[#1877D2] stroke-[1.8]" />
        )}
      </button>

      {/* Target Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {getPriorityBadge()}
          <span
            className={`text-xs sm:text-sm font-extrabold tracking-tight ${
              isCompleted ? "line-through text-slate-400" : "text-slate-900"
            }`}
          >
            {target.title}
          </span>
        </div>

        <p
          className={`text-xs leading-relaxed ${
            isCompleted ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {target.reason}
        </p>

        <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Status: {isCompleted ? "Completed by user" : "Pending verification"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
