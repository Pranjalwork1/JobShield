"use client";

import React from "react";
import { CaseTimelineEvent } from "@/lib/intelligence/types";
import {
  Clock,
  PlusCircle,
  FileCheck,
  Brain,
  ShieldCheck,
  FilePlus,
  Trash2,
  Calendar,
} from "lucide-react";

interface CaseTimelineProps {
  timeline: CaseTimelineEvent[];
}

export function CaseTimeline({ timeline }: CaseTimelineProps) {
  if (!timeline || timeline.length === 0) return null;

  const renderEventIcon = (type: CaseTimelineEvent["type"]) => {
    switch (type) {
      case "case_created":
        return <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />;
      case "evidence_added":
        return <FilePlus className="w-3.5 h-3.5 text-blue-600" />;
      case "evidence_removed":
        return <Trash2 className="w-3.5 h-3.5 text-slate-500" />;
      case "analysis_completed":
        return <FileCheck className="w-3.5 h-3.5 text-cyan-600" />;
      case "intelligence_generated":
        return <Brain className="w-3.5 h-3.5 text-purple-600" />;
      case "verification_completed":
      case "verification_started":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • ${d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })}`;
    } catch {
      return iso;
    }
  };

  return (
    <section className="space-y-4" aria-label="Case Activity Timeline">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Case Investigation Timeline ({timeline.length})</span>
          </h3>
          <p className="text-xs text-slate-400">
            Chronological audit log for this job check.
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs">
        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
          {timeline.map((event) => (
            <div key={event.id} className="relative flex items-start gap-3">
              {/* Dot Icon */}
              <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-xs">
                {renderEventIcon(event.type)}
              </div>

              {/* Event Body */}
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                  {event.description}
                </p>
                <p className="text-[11px] font-mono text-slate-400">
                  {formatTimestamp(event.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
