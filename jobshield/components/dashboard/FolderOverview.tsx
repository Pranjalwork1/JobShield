"use client";

import React from "react";
import { Folder, ChevronRight, Layers } from "lucide-react";
import { FolderSummaryItem } from "@/lib/dashboardMetrics";
import { SYSTEM_ALL_JOBS_ID } from "@/lib/caseStore";

interface FolderOverviewProps {
  folderSummaries: FolderSummaryItem[];
  totalCases: number;
  onSelectFolder: (folderId: string) => void;
  onManageFolders?: () => void;
  onCreateFolder?: () => void;
}

export function FolderOverview({
  folderSummaries,
  totalCases,
  onSelectFolder,
  onManageFolders,
  onCreateFolder,
}: FolderOverviewProps) {
  return (
    <div className="rounded-[24px] bg-white border border-slate-200/80 shadow-sm p-5 sm:p-7 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Folders
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Organized investigation workspaces
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onCreateFolder && (
              <button
                type="button"
                onClick={onCreateFolder}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg text-[#1E90FF] hover:bg-[#EAF4FF] transition-colors cursor-pointer"
              >
                + New
              </button>
            )}
            {onManageFolders && (
              <button
                type="button"
                onClick={onManageFolders}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Manage
              </button>
            )}
          </div>
        </div>

        {/* Folders List */}
        <div className="py-3 space-y-2">
          {/* All Jobs pseudo-folder */}
          <div
            onClick={() => onSelectFolder(SYSTEM_ALL_JOBS_ID)}
            className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 hover:bg-[#F4F9FF] border border-slate-100 hover:border-[#B9DCFE] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EAF4FF] border border-[#B9DCFE] text-[#1E90FF] flex items-center justify-center">
                <Layers className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1877D2] transition-colors">
                  All Jobs
                </div>
                <div className="text-[11px] text-slate-400">
                  Global repository
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                {totalCases} checks
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1877D2] transition-colors" />
            </div>
          </div>

          {/* User Folders */}
          {folderSummaries.map((f) => (
            <div
              key={f.id}
              onClick={() => onSelectFolder(f.id)}
              className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 hover:bg-[#F4F9FF] border border-slate-100/80 hover:border-[#B9DCFE] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center group-hover:text-[#1E90FF] group-hover:border-[#B9DCFE] transition-colors">
                  <Folder className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1877D2] transition-colors">
                    {f.name}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    {f.highCount > 0 && (
                      <span className="text-rose-600 font-semibold">{f.highCount} high</span>
                    )}
                    {f.highCount > 0 && f.mediumCount > 0 && <span>•</span>}
                    {f.mediumCount > 0 && (
                      <span className="text-amber-600 font-semibold">{f.mediumCount} med</span>
                    )}
                    {f.highCount === 0 && f.mediumCount === 0 && (
                      <span>{f.caseCount} check{f.caseCount !== 1 ? "s" : ""}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                  {f.caseCount} {f.caseCount === 1 ? "check" : "checks"}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Folders isolate evidence & reviews</span>
        <span>Local IndexedDB</span>
      </div>
    </div>
  );
}
