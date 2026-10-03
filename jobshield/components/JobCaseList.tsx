"use client";

import React, { useMemo } from "react";
import {
  Search,
  Plus,
  FolderOpen,
} from "lucide-react";
import { JobShieldCase, JobShieldFolder, SortOrder } from "@/types/jobshield";
import { JobCaseCard } from "./JobCaseCard";
import { SYSTEM_ALL_JOBS_ID } from "@/lib/caseStore";

interface JobCaseListProps {
  cases: JobShieldCase[];
  folders: JobShieldFolder[];
  selectedFolderId: string;
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  onNewCase: () => void;
  onMoveCase: (caseItem: JobShieldCase) => void;
  onRenameCase: (caseItem: JobShieldCase) => void;
  onDeleteCase: (caseItem: JobShieldCase) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
}

export function JobCaseList({
  cases,
  folders,
  selectedFolderId,
  selectedCaseId,
  onSelectCase,
  onNewCase,
  onMoveCase,
  onRenameCase,
  onDeleteCase,
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
}: JobCaseListProps) {
  // Folder Map for fast lookup
  const folderMap = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [folders]);

  // Filter & Search & Sort
  const filteredCases = useMemo(() => {
    // 1. Filter by folder
    let list =
      selectedFolderId === SYSTEM_ALL_JOBS_ID
        ? cases
        : cases.filter((c) => c.folderId === selectedFolderId);

    // 2. Search query filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((c) => {
        const titleMatch = (c.title || "").toLowerCase().includes(query);
        const companyMatch = (c.company || "").toLowerCase().includes(query);
        const urlMatch = (c.jobUrl || "").toLowerCase().includes(query);
        const folderName = (folderMap.get(c.folderId) || "").toLowerCase();
        const folderMatch = folderName.includes(query);
        const summaryJob = (c.analysis?.case_summary?.job_title || "")
          .toLowerCase()
          .includes(query);
        const summaryComp = (c.analysis?.case_summary?.company || "")
          .toLowerCase()
          .includes(query);
        const recruiterMatch = (c.analysis?.case_summary?.recruiter_name || "")
          .toLowerCase()
          .includes(query);

        return (
          titleMatch ||
          companyMatch ||
          urlMatch ||
          folderMatch ||
          summaryJob ||
          summaryComp ||
          recruiterMatch
        );
      });
    }

    // 3. Sorting
    const sorted = [...list].sort((a, b) => {
      if (sortOrder === "recent") {
        const timeA = new Date(a.lastAnalyzedAt || a.updatedAt).getTime();
        const timeB = new Date(b.lastAnalyzedAt || b.updatedAt).getTime();
        return timeB - timeA;
      }
      if (sortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOrder === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOrder === "risk") {
        const countA = a.analysis?.risk_indicators?.length ?? 0;
        const countB = b.analysis?.risk_indicators?.length ?? 0;
        return countB - countA;
      }
      return 0;
    });

    return sorted;
  }, [cases, selectedFolderId, searchQuery, sortOrder, folderMap]);

  const currentFolder =
    selectedFolderId === SYSTEM_ALL_JOBS_ID
      ? { name: "All Jobs" }
      : folders.find((f) => f.id === selectedFolderId) || { name: "Current Folder" };

  return (
    <div className="space-y-4">
      {/* Header with Title and Search matching screenshot */}
      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentFolder.name}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {filteredCases.length} job check
              {filteredCases.length === 1 ? "" : "s"}
            </p>
          </div>

          <button
            type="button"
            onClick={onNewCase}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B0F19] hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Check</span>
          </button>
        </div>

        {/* Search Bar & Sort Row matching screenshot */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search checks, company..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50/90 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value as SortOrder)}
              className="px-3.5 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer pr-7 appearance-none shadow-2xs"
            >
              <option value="recent">Recent</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="risk">Risk</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Case List or Empty State */}
      {filteredCases.length === 0 ? (
        <div className="p-8 rounded-[32px] border border-dashed border-slate-200 bg-white/70 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <FolderOpen className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h5 className="text-sm font-bold text-slate-800">
              {searchQuery.trim()
                ? "No matching job checks"
                : "No job checks in this folder yet"}
            </h5>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              {searchQuery.trim()
                ? `No job cases matched "${searchQuery}". Try a different keyword.`
                : "Keep your recruitment evidence organized by starting a new job check."}
            </p>
          </div>

          <button
            type="button"
            onClick={onNewCase}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Job Check</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 pr-0.5">
          {filteredCases.map((caseItem) => (
            <JobCaseCard
              key={caseItem.id}
              caseItem={caseItem}
              folderName={folderMap.get(caseItem.folderId) || "My Jobs"}
              isSelected={caseItem.id === selectedCaseId}
              onSelect={onSelectCase}
              onMove={onMoveCase}
              onRename={onRenameCase}
              onDelete={onDeleteCase}
            />
          ))}
        </div>
      )}
    </div>
  );
}
