"use client";

import React, { useState } from "react";
import {
  Folder,
  Plus,
  Sparkles,
  ChevronDown,
  Calendar,
  Layers,
  FolderPlus,
} from "lucide-react";
import { JobShieldLogo } from "@/components/brand/JobShieldLogo";
import { JobShieldCase, JobShieldFolder } from "@/types/jobshield";
import { SYSTEM_ALL_JOBS_ID } from "@/lib/caseStore";

interface ZentraTopNavProps {
  currentCase: JobShieldCase | null;
  folders: JobShieldFolder[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  onNewCase: () => void;
  onCreateFolder: (name: string) => Promise<void>;
  onLoadDemo: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export function ZentraTopNav({
  currentCase,
  folders,
  selectedFolderId,
  onSelectFolder,
  onNewCase,
  onCreateFolder,
  onLoadDemo,
  activeSection,
  onSelectSection,
}: ZentraTopNavProps) {
  const [folderDropdownOpen, setFolderDropdownOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isAddingFolder, setIsAddingFolder] = useState(false);

  const currentFolder =
    selectedFolderId === SYSTEM_ALL_JOBS_ID
      ? { name: "All Jobs" }
      : folders.find((f) => f.id === selectedFolderId) || { name: "My Jobs" };

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await onCreateFolder(newFolderName.trim());
    setNewFolderName("");
    setIsAddingFolder(false);
  };

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 pt-1">
      {/* Brand: Reusable JobShield Logo */}
      <div className="flex items-center">
        <JobShieldLogo size={34} variant="full" />
      </div>

      {/* Center Segmented Navigation Pills */}
      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {[
          { id: "overview", label: "Overview" },
          { id: "intake", label: "Evidence Deck" },
          { id: "dossier", label: "Risk Dossier" },
          { id: "verification", label: "Verification" },
        ].map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSection(tab.id)}
              className={`px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[#EAF4FF] text-[#1E90FF] font-bold shadow-xs border border-[#B9DCFE]/70"
                  : "text-[#667085] hover:text-[#101828] hover:bg-[#F4F9FF]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        {/* Folders Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFolderDropdownOpen(!folderDropdownOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-100/60 transition-all cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-indigo-600" />
            <span className="max-w-[100px] truncate">{currentFolder.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Folder Selector Dropdown */}
          {folderDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setFolderDropdownOpen(false)}
              />
              <div className="absolute left-0 top-11 w-56 p-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Investigation Folders</span>
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectFolder(SYSTEM_ALL_JOBS_ID);
                      setFolderDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      selectedFolderId === SYSTEM_ALL_JOBS_ID
                        ? "bg-[#EAF4FF] text-[#101828] font-bold border border-[#B9DCFE]"
                        : "text-[#667085] hover:bg-[#F4F9FF]"
                    }`}
                  >
                    <span>All Jobs</span>
                  </button>

                  {folders.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        onSelectFolder(f.id);
                        setFolderDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                        selectedFolderId === f.id
                          ? "bg-[#EAF4FF] text-[#101828] font-bold border border-[#B9DCFE]"
                          : "text-[#667085] hover:bg-[#F4F9FF]"
                      }`}
                    >
                      <span className="truncate">{f.name}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-1.5 border-t border-slate-100">
                  {isAddingFolder ? (
                    <form onSubmit={handleAddFolder} className="flex items-center gap-1 p-1">
                      <input
                        type="text"
                        autoFocus
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Folder name..."
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-[#1E90FF]/30"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 bg-[#1E90FF] text-white text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Add
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingFolder(true)}
                      className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1E90FF] hover:bg-[#EAF4FF] cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>+ New Folder</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Right Actions: Date / Case Pill & New Check like in ui final.webp */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate max-w-[130px]">
            {currentCase?.title || "Active Case"}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 font-normal">Gemini 3.8</span>
        </div>

        <button
          type="button"
          onClick={onLoadDemo}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-[#DDF0FF] text-[#101828] text-xs font-bold border border-[#B9DCFE] transition-all active:scale-95 cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Demo</span>
        </button>

        <button
          type="button"
          onClick={onNewCase}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white text-xs font-bold shadow-md shadow-[#1E90FF]/25 border-none active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Check</span>
        </button>
      </div>
    </div>
  );
}
