"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, Plus, Bell, X, ChevronRight, Menu } from "lucide-react";
import { JobShieldCase } from "@/types/jobshield";
import { NewEraDynamicIsland } from "@/components/NewEraDynamicIsland";

interface DashboardHeaderProps {
  title: string;
  activeChecksCount: number;
  cases: JobShieldCase[];
  onSelectCase: (caseId: string) => void;
  onNewCase: () => void;
  onOpenMobileMenu?: () => void;
  // Status pill integration props
  currentCase?: JobShieldCase | null;
  evidenceCount?: number;
  isAnalyzing?: boolean;
  onAnalyze?: () => void;
  onStopAnalysis?: () => void;
  onLoadDemo?: () => void;
  onReset?: () => void;
  modelName?: string;
  onNavigateToIntake?: () => void;
}

export function DashboardHeader({
  title,
  activeChecksCount,
  cases,
  onSelectCase,
  onNewCase,
  onOpenMobileMenu,
  currentCase = null,
  evidenceCount = 0,
  isAnalyzing = false,
  onAnalyze = () => {},
  onStopAnalysis,
  onLoadDemo = () => {},
  onReset = () => {},
  modelName = "Gemini Flash 3.8",
  onNavigateToIntake,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global search across company, job title, recruiter, folder, findings, verification targets
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return cases
      .filter((c) => {
        if (c.company && c.company.toLowerCase().includes(q)) return true;
        if (c.title && c.title.toLowerCase().includes(q)) return true;
        if (c.recruiterMessage && c.recruiterMessage.toLowerCase().includes(q)) return true;
        if (c.jobUrl && c.jobUrl.toLowerCase().includes(q)) return true;

        if (c.intelligence?.findings) {
          for (const f of c.intelligence.findings) {
            if (
              f.title.toLowerCase().includes(q) ||
              (f.summary && f.summary.toLowerCase().includes(q))
            ) {
              return true;
            }
          }
        }

        if (c.intelligence?.verificationTargets) {
          for (const vt of c.intelligence.verificationTargets) {
            if (
              (vt.title && vt.title.toLowerCase().includes(q)) ||
              (vt.reason && vt.reason.toLowerCase().includes(q))
            ) {
              return true;
            }
          }
        }

        return false;
      })
      .slice(0, 6);
  }, [cases, searchQuery]);

  return (
    <header className="w-full flex flex-col gap-3 pb-5 pt-1">
      {/* Primary Row: Title, Search, Status Pill & Actions */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mobile menu toggle + Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
            {activeChecksCount > 0 && (
              <span
                className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"
                title={`${activeChecksCount} active checks in workspace`}
              >
                {activeChecksCount}
              </span>
            )}
          </div>
        </div>

        {/* Center: Desktop Global Search Bar */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-xs xl:max-w-sm hidden md:block"
        >
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search checks, companies, findings..."
              aria-label="Search job checks, companies, findings"
              className="w-full pl-9 pr-8 py-2 rounded-2xl bg-white hover:bg-[#F4F9FF] focus:bg-white text-xs sm:text-sm text-[#101828] placeholder-slate-400 border border-slate-200/90 focus:border-[#1E90FF] focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/20 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute top-11 left-0 right-0 p-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {searchResults.length === 0
                  ? "No matching job checks"
                  : `Matching Checks (${searchResults.length})`}
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching checks or findings found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                searchResults.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c.id);
                      setIsSearchFocused(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F9FF] transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-[#1E90FF] truncate transition-colors">
                        {c.title || "Untitled Job Check"}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {c.company || "Unspecified Company"}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E90FF] transition-colors shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Integrated Status Pill + Notifications + New Job Check + Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Integrated Dynamic Status Pill (In-flow header component) */}
          <div className="hidden sm:inline-flex">
            <NewEraDynamicIsland
              currentCase={currentCase}
              evidenceCount={evidenceCount}
              isAnalyzing={isAnalyzing}
              onAnalyze={onAnalyze}
              onStopAnalysis={onStopAnalysis}
              onLoadDemo={onLoadDemo}
              onReset={onReset}
              modelName={modelName}
              onNavigateToIntake={onNavigateToIntake}
            />
          </div>

          {/* Notifications Icon Button */}
          <button
            type="button"
            className="w-9 h-9 rounded-2xl bg-white border border-slate-200/80 hover:bg-[#F4F9FF] flex items-center justify-center text-slate-600 hover:text-[#1E90FF] shadow-2xs transition-all cursor-pointer shrink-0"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* + New Job Check Button (Dodger Blue) */}
          <button
            type="button"
            onClick={onNewCase}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1E90FF]/25 border-none transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New job check</span>
            <span className="sm:hidden">New Check</span>
          </button>

          {/* User Avatar Badge (Deep Navy) */}
          <div
            className="w-9 h-9 rounded-2xl bg-[#101828] text-white flex items-center justify-center text-xs font-bold tracking-tight shadow-xs select-none shrink-0 border border-slate-800"
            title="Current User: Investigator AM"
            aria-label="User profile AM"
          >
            AM
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Sub-row 1: Mobile Search Input */}
      <div className="w-full md:hidden">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search job checks, companies..."
            aria-label="Search job checks mobile"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white text-xs text-slate-800 placeholder-slate-400 border border-slate-200/90 focus:border-[#1E90FF] focus:outline-none focus:ring-1 focus:ring-[#1E90FF]/30 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear mobile search query"
              className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-row 2: Status Pill on small screens */}
      <div className="w-full flex justify-center sm:hidden pt-0.5">
        <NewEraDynamicIsland
          currentCase={currentCase}
          evidenceCount={evidenceCount}
          isAnalyzing={isAnalyzing}
          onAnalyze={onAnalyze}
          onStopAnalysis={onStopAnalysis}
          onLoadDemo={onLoadDemo}
          onReset={onReset}
          modelName={modelName}
          onNavigateToIntake={onNavigateToIntake}
        />
      </div>
    </header>
  );
}
