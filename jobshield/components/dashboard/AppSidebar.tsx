"use client";

import React from "react";
import {
  LayoutDashboard,
  Files,
  ShieldAlert,
  BadgeCheck,
  Folder,
  FolderPlus,
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
  onNewCase: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  folderCaseCounts?: Map<string, number>;
  totalCasesCount?: number;
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
      icon: Files,
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

  const sidebarContent = (
    <aside className="w-full h-full flex flex-col justify-between py-6 px-4 select-none">
      {/* Top Section: Brand + Main Nav */}
      <div className="space-y-6">
        {/* Brand header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center">
            <JobShieldLogo size={34} variant="full" />
          </div>

          {/* AI active status badge (Dodger Blue branding) */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF4FF] text-[#1877D2] border border-[#B9DCFE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E90FF] animate-pulse" />
            AI active
          </span>
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
                    : "text-[#667085] hover:text-[#101828] hover:bg-[#F4F9FF]"
                }`}
              >
                <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? "text-[#1E90FF]" : "text-[#667085]"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Folders Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-bold text-[#667085] uppercase tracking-wider">
            <span>Folders</span>
            {onCreateFolder && (
              <button
                type="button"
                onClick={onCreateFolder}
                className="hover:text-[#1E90FF] transition-colors p-0.5 cursor-pointer"
                title="Create folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
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
                  ? "bg-[#EAF4FF] text-[#101828] font-bold border border-[#B9DCFE]"
                  : "text-[#667085] hover:text-[#101828] hover:bg-[#F4F9FF]"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Layers className={`w-3.5 h-3.5 shrink-0 ${selectedFolderId === SYSTEM_ALL_JOBS_ID ? "text-[#1E90FF]" : "text-[#667085]"}`} />
                <span className="truncate">All Jobs</span>
              </div>
              <span className="text-[11px] font-mono text-[#667085]">
                {totalCasesCount}
              </span>
            </button>

            {/* User Created Folders */}
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
                      ? "bg-[#EAF4FF] text-[#101828] font-bold border border-[#B9DCFE]"
                      : "text-[#667085] hover:text-[#101828] hover:bg-[#F4F9FF]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#1E90FF]" : "text-[#667085]"}`} />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#667085]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: + New Job Check Button (Dodger Blue Primary) */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={() => {
            onNewCase();
            onCloseMobile?.();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1E90FF]/25 transition-all cursor-pointer border-none"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Job Check</span>
        </button>

        <div className="px-2 text-center text-[10px] text-[#667085]">
          JobShield Operations v4.2
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent, width 250px) */}
      <div className="hidden md:block w-60 shrink-0 bg-white/70 border-r border-slate-200/80 rounded-l-[36px] sm:rounded-l-[44px]">
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
