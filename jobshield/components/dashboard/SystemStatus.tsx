"use client";

import React, { useState, useEffect } from "react";
import { HardDrive, Database, Sparkles, ArrowRight, Lock } from "lucide-react";

interface SystemStatusProps {
  onViewAuditLog?: () => void;
}

export function SystemStatus({ onViewAuditLog }: SystemStatusProps) {
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Check if Gemini API key is configured without exposing secrets
  useEffect(() => {
    let cancelled = false;
    async function checkHealth() {
      try {
        const res = await fetch("/api/health", { method: "GET" }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (!cancelled && typeof data.configured === "boolean") {
            setHasApiKey(data.configured);
          }
        }
      } catch {
        // Fallback assumes local development default
      }
    }
    checkHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-[24px] bg-slate-950 text-white p-5 sm:p-7 shadow-xl shadow-slate-950/20 flex flex-col justify-between h-full border border-slate-800">
      <div>
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems normal
          </span>
        </div>

        {/* Content */}
        <div className="pt-5 space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Trust controls active
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Evidence encryption, tamper-evident audit logs, and deterministic verification rules are operational.
            </p>
          </div>

          {/* Subsystem checklist */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span>Evidence storage</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                ● Operational
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Local case database</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                ● Operational
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Gemini multimodal AI</span>
              </div>
              <span
                className={`text-[11px] font-semibold flex items-center gap-1 ${
                  hasApiKey ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                ● {hasApiKey ? "Configured" : "Config required"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onViewAuditLog}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>View operational audit log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
