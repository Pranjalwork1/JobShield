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
  ShieldCheck,
  X,
  Layers,
} from "lucide-react";
import { JobShieldFolder } from "@/types/jobshield";
import { SYSTEM_ALL_JOBS_ID } from "@/lib/caseStore";

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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center shadow-md shadow-orange-500/20 text-white">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  JobShield
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              </div>
            </div>
          </div>

          {/* AI active status badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
                }`}
              >
                <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Folders Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Folders</span>
            {onCreateFolder && (
              <button
                type="button"
                onClick={onCreateFolder}
                className="hover:text-indigo-600 transition-colors p-0.5 cursor-pointer"
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
                  ? "bg-indigo-50 text-indigo-950 font-bold border border-indigo-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">All Jobs</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
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
                      ? "bg-indigo-50 text-indigo-950 font-bold border border-indigo-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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

      {/* Bottom Section: + New Job Check Button */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={() => {
            onNewCase();
            onCloseMobile?.();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Job Check</span>
        </button>

        <div className="px-2 text-center text-[10px] text-slate-400">
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
