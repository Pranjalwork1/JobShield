"use client";

import React from "react";
import { CheckSquare, Square } from "lucide-react";
import { VerificationTarget } from "@/lib/schemas";

interface VerificationTargetCardProps {
  target: VerificationTarget;
  index: number;
  isCompleted?: boolean;
  onToggle?: () => void;
}

export function VerificationTargetCard({
  target,
  index,
  isCompleted,
  onToggle,
}: VerificationTargetCardProps) {
  const [internalDone, setInternalDone] = React.useState(false);
  const isDone = isCompleted !== undefined ? isCompleted : internalDone;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalDone((prev) => !prev);
    }
  };

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
        isDone
          ? "bg-slate-50/60 border-slate-200/80 opacity-60"
          : "bg-white/95 border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#1E90FF]"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          aria-label={isDone ? "Mark as pending" : "Mark as verified"}
          className="mt-0.5 text-[#1E90FF] transition-colors shrink-0"
        >
          {isDone ? (
            <CheckSquare className="w-5 h-5 text-emerald-500" />
          ) : (
            <Square className="w-5 h-5 text-slate-300 hover:text-[#1877D2]" />
          )}
        </button>

        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#1E90FF]">
              Action Step {index + 1}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getPriorityBadge(
                target.priority
              )}`}
            >
              Priority: {target.priority}
            </span>
          </div>

          <h5
            className={`text-sm font-bold text-slate-900 ${
              isDone ? "line-through text-slate-400" : ""
            }`}
          >
            {target.target}
          </h5>

          <p
            className={`text-xs text-slate-500 leading-relaxed ${
              isDone ? "text-slate-400" : ""
            }`}
          >
            {target.reason}
          </p>
        </div>
      </div>
    </div>
  );
}
