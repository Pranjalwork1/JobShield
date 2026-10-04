"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, Plus, Bell, X, ChevronRight, Menu } from "lucide-react";
import { JobShieldCase } from "@/types/jobshield";

interface DashboardHeaderProps {
  title: string;
  activeChecksCount: number;
  cases: JobShieldCase[];
  onSelectCase: (caseId: string) => void;
  onNewCase: () => void;
  onOpenMobileMenu?: () => void;
}

export function DashboardHeader({
  title,
  activeChecksCount,
  cases,
  onSelectCase,
  onNewCase,
  onOpenMobileMenu,
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

  // Section 35: Global search across company, job title, recruiter, folder, finding title, verification target
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return cases.filter((c) => {
      if (c.company && c.company.toLowerCase().includes(q)) return true;
      if (c.title && c.title.toLowerCase().includes(q)) return true;
      if (c.recruiterMessage && c.recruiterMessage.toLowerCase().includes(q)) return true;
      if (c.jobUrl && c.jobUrl.toLowerCase().includes(q)) return true;

      // Findings search
      if (c.intelligence?.findings) {
        for (const f of c.intelligence.findings) {
          if (f.title.toLowerCase().includes(q) || (f.summary && f.summary.toLowerCase().includes(q))) {
            return true;
          }
        }
      }

      // Verification targets search
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
    }).slice(0, 6);
  }, [cases, searchQuery]);

  return (
    <header className="w-full flex items-center justify-between gap-3 pb-6 pt-2">
      {/* Left: Mobile hamburger + Title */}
      <div className="flex items-center gap-3">
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
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Middle: Global Search Input */}
      <div
        ref={searchContainerRef}
        className="relative flex-1 max-w-md mx-2 sm:mx-4 hidden sm:block"
      >
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search job checks, companies, findings..."
            className="w-full pl-9 pr-8 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200/80 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
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
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate transition-colors">
                      {c.title || "Untitled Job Check"}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {c.company || "Unspecified Company"}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right: Status Pill + New Job Check + Profile Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Dynamic Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{activeChecksCount} Active Checks</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-normal">Ready</span>
        </div>

        {/* Notifications Icon (inspired by reference header) */}
        <button
          type="button"
          className="w-9 h-9 rounded-2xl border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* + New Job Check Button */}
        <button
          type="button"
          onClick={onNewCase}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New job check</span>
        </button>

        {/* User Avatar Circle (matching "AM" in design reference) */}
        <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold tracking-tight shadow-xs select-none">
          AM
        </div>
      </div>
    </header>
  );
}
