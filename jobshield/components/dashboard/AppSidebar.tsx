"use client";

import React from "react";
import {
  LayoutDashboard,
  ShieldAlert,
  BadgeCheck,
  Folder,
  Plus,
  X,
  Layers,
} from "lucide-react";
import { JobShieldFolder } from "@/types/jobshield";
import { SYSTEM_ALL_JOBS_ID } from "@/lib/caseStore";

import { JobShieldLogo } from "@/components/brand/JobShieldLogo";

interface AppSidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  folders: JobShieldFolder[];
  selectedFolderId: string;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder?: () => void;
  onNewCase?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  folderCaseCounts?: Map<string, number>;
  totalCasesCount?: number;
  verificationCompletionRate?: number | null;
  openVerificationTargets?: number;
  totalVerificationTargets?: number;
}

export function AppSidebar({
  activeSection,
  onSelectSection,
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onNewCase,
  isMobileOpen = false,
  onCloseMobile,
  folderCaseCounts = new Map(),
  totalCasesCount = 0,
  verificationCompletionRate = null,
  openVerificationTargets = 0,
  totalVerificationTargets = 0,
}: AppSidebarProps) {
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "intake",
      label: "Evidence Deck",
      icon: Layers,
    },
    {
      id: "dossier",
      label: "Risk Dossier",
      icon: ShieldAlert,
    },
    {
      id: "verification",
      label: "Verification",
      icon: BadgeCheck,
    },
  ];

  const planProgress = verificationCompletionRate ?? (totalVerificationTargets === 0 ? 0 : 0);

  const sidebarContent = (
    <aside className="w-full h-full flex flex-col justify-between py-6 px-4 select-none bg-white">
      {/* Top Section: Brand + Main Nav + Folders */}
      <div className="space-y-6">
        {/* Brand header */}
        <div className="px-2">
          <div className="flex items-center gap-2.5">
            <JobShieldLogo size={32} variant="full" />
          </div>

          {/* Truthful application status indicator below brand */}
          <div className="flex items-center gap-1.5 mt-2 pl-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              ANALYSIS READY
            </span>
          </div>
        </div>

        {/* Primary Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#EAF4FF] text-[#1E90FF] font-bold shadow-xs border border-[#B9DCFE]/70"
                    : "text-slate-600 hover:text-[#10264C] hover:bg-[#F5F7FB]"
                }`}
              >
                <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? "text-[#1E90FF]" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Folders Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>FOLDERS</span>
            {onCreateFolder && (
              <button
                type="button"
                onClick={onCreateFolder}
                className="hover:text-[#1E90FF] text-slate-400 transition-colors p-0.5 cursor-pointer"
                title="Add folder"
                aria-label="Add folder"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
            {/* All Jobs */}
            <button
              type="button"
              onClick={() => {
                onSelectFolder(SYSTEM_ALL_JOBS_ID);
                onCloseMobile?.();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedFolderId === SYSTEM_ALL_JOBS_ID
                  ? "bg-[#EAF4FF] text-[#10264C] font-bold border border-[#B9DCFE]"
                  : "text-slate-600 hover:text-[#10264C] hover:bg-[#F5F7FB]"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Folder className={`w-3.5 h-3.5 shrink-0 ${selectedFolderId === SYSTEM_ALL_JOBS_ID ? "text-[#1E90FF]" : "text-slate-400"}`} />
                <span className="truncate">All Jobs</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {totalCasesCount}
              </span>
            </button>

            {/* Folders list */}
            {folders.map((f) => {
              const isSelected = selectedFolderId === f.id;
              const count = folderCaseCounts.get(f.id) || 0;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    onSelectFolder(f.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#EAF4FF] text-[#10264C] font-bold border border-[#B9DCFE]"
                      : "text-slate-600 hover:text-[#10264C] hover:bg-[#F5F7FB]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#1E90FF]" : "text-slate-400"}`} />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Investigation Plan Card */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        {onNewCase && (
          <button
            type="button"
            onClick={() => {
              onNewCase();
              onCloseMobile?.();
            }}
            className="w-full md:hidden flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1E90FF] hover:bg-[#1877D2] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ New Job Check</span>
          </button>
        )}

        <div className="p-3.5 rounded-2xl bg-[#F5F7FB] border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#10264C]">Investigation Plan</span>
            {totalVerificationTargets > 0 && (
              <span className="text-[10px] font-bold text-[#1E90FF]">{planProgress}%</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-[#1E90FF] rounded-full transition-all duration-300"
              style={{ width: `${totalVerificationTargets > 0 ? planProgress : 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={() => {
                onSelectSection("verification");
                onCloseMobile?.();
              }}
              className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-[#1E90FF] hover:border-[#B9DCFE] transition-colors cursor-pointer shadow-2xs"
            >
              View details
            </button>
            <span className="text-[10px] text-slate-400">
              {openVerificationTargets} open
            </span>
          </div>
        </div>

        <div className="px-2 text-center text-[10px] text-slate-400">
          JobShield Operations v4.2
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent, width 240px) */}
      <div className="hidden md:block w-60 shrink-0 bg-white border-r border-slate-200/80">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-200">
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
