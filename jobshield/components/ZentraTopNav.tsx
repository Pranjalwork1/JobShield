"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Folder,
  Plus,
  Sparkles,
  ChevronDown,
  Calendar,
  Layers,
  FolderPlus,
} from "lucide-react";
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
      {/* Brand: Logo & Name like "zentra" */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center shadow-md shadow-orange-500/20 text-white">
          <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 lowercase">
            jobshield
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
        </div>
      </div>

      {/* Center Segmented Navigation Pills like "Home, Payments, Balances..." in ui final.webp */}
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
                  ? "bg-[#18181B] text-white shadow-sm shadow-slate-900/10"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/60"
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
                        ? "bg-slate-950 text-white"
                        : "text-slate-700 hover:bg-slate-100"
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
                          ? "bg-slate-950 text-white"
                          : "text-slate-700 hover:bg-slate-100"
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
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Add
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingFolder(true)}
                      className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50 cursor-pointer"
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
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Demo</span>
        </button>

        <button
          type="button"
          onClick={onNewCase}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#18181B] hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-950/15 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Check</span>
        </button>
      </div>
    </div>
  );
}
