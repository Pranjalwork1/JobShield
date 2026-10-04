"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Folder,
  FolderPlus,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RotateCcw,
  Square,
  Loader2,
  Edit2,
  Trash2,
  Briefcase,
  X,
} from "lucide-react";
import { JobShieldCase, JobShieldFolder, SortOrder } from "@/types/jobshield";
import { SYSTEM_ALL_JOBS_ID, SYSTEM_ALL_JOBS_FOLDER, getCaseDisplayTitle } from "@/lib/caseStore";
import { JobCaseCard } from "./JobCaseCard";

interface CaseLibraryNavbarProps {
  folders: JobShieldFolder[];
  cases: JobShieldCase[];
  selectedFolderId: string;
  selectedCaseId: string | null;
  currentCase: JobShieldCase | null;
  onSelectFolder: (id: string) => void;
  onSelectCase: (id: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onRenameFolder: (id: string, name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  onNewCase: () => void;
  onMoveCase: (caseItem: JobShieldCase) => void;
  onRenameCase: (caseItem: JobShieldCase) => void;
  onDeleteCase: (caseItem: JobShieldCase) => void;
  isAnalyzing: boolean;
  onStopAnalysis?: () => void;
  onLoadDemo: () => void;
  onReset: () => void;
  modelName?: string;
}

export function CaseLibraryNavbar({
  folders,
  cases,
  selectedFolderId,
  selectedCaseId,
  currentCase,
  onSelectFolder,
  onSelectCase,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onNewCase,
  onMoveCase,
  onRenameCase,
  onDeleteCase,
  isAnalyzing,
  onStopAnalysis,
  onLoadDemo,
  onReset,
  modelName = "Gemini Flash 3.8",
}: CaseLibraryNavbarProps) {
  const [isCaseDrawerOpen, setIsCaseDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  // Map for folder names
  const folderMap = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [folders]);

  // Compute case counts per folder
  const getCountForFolder = (folderId: string) => {
    if (folderId === SYSTEM_ALL_JOBS_ID) return cases.length;
    return cases.filter((c) => c.folderId === folderId).length;
  };

  const userFolders = folders.filter((f) => !f.isSystem);

  const currentFolder =
    selectedFolderId === SYSTEM_ALL_JOBS_ID
      ? { name: "All Jobs" }
      : folders.find((f) => f.id === selectedFolderId) || { name: "Current Folder" };

  // Filter and sort cases for active folder
  const filteredCases = useMemo(() => {
    let list =
      selectedFolderId === SYSTEM_ALL_JOBS_ID
        ? cases
        : cases.filter((c) => c.folderId === selectedFolderId);

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((c) => {
        const titleMatch = (c.title || "").toLowerCase().includes(query);
        const companyMatch = (c.company || "").toLowerCase().includes(query);
        const recruiterMatch =
          (c.analysis?.case_summary?.recruiter_name || "")
            .toLowerCase()
            .includes(query) ||
          (c.intelligence?.normalizedFacts?.recruiter?.name || "")
            .toLowerCase()
            .includes(query);
        const findingsMatch = (c.intelligence?.findings || []).some(
          (f) =>
            f.title.toLowerCase().includes(query) ||
            f.summary.toLowerCase().includes(query) ||
            f.observedEvidence.toLowerCase().includes(query)
        );
        const folderName = (folderMap.get(c.folderId) || "").toLowerCase();
        return (
          titleMatch ||
          companyMatch ||
          folderName.includes(query) ||
          (c.jobUrl || "").toLowerCase().includes(query) ||
          recruiterMatch ||
          findingsMatch
        );
      });
    }

    return [...list].sort((a, b) => {
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
      return 0;
    });
  }, [cases, selectedFolderId, searchQuery, sortOrder, folderMap]);

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await onCreateFolder(newFolderName.trim());
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  const handleRenameFolderSubmit = async (e: React.FormEvent, folderId: string) => {
    e.preventDefault();
    if (!editingFolderName.trim()) return;
    await onRenameFolder(folderId, editingFolderName.trim());
    setEditingFolderId(null);
  };

  const currentCaseTitle = currentCase ? getCaseDisplayTitle(currentCase) : null;

  return (
    <header className="sticky top-2 sm:top-3 z-40 w-full mb-6 transition-all duration-300">
      {/* Sleek Floating Capsule Navbar */}
      <div className="relative bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-lg shadow-slate-200/50 rounded-full px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Brand & Horizontal Folder Pills */}
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto no-scrollbar py-0.5">
          {/* Brand Icon */}
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-200/80 shrink-0">
            <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-indigo-600 stroke-[2.2]" />
            </div>
            <span className="font-extrabold text-xs tracking-wider text-slate-800 uppercase hidden md:inline">
              JobShield
            </span>
          </div>

          {/* Folder Pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* All Jobs */}
            <button
              type="button"
              onClick={() => onSelectFolder(SYSTEM_ALL_JOBS_FOLDER.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                selectedFolderId === SYSTEM_ALL_JOBS_FOLDER.id
                  ? "bg-[#0B0F19] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Folder
                className={`w-3.5 h-3.5 ${
                  selectedFolderId === SYSTEM_ALL_JOBS_FOLDER.id
                    ? "text-cyan-400 stroke-[2]"
                    : "text-blue-500"
                }`}
              />
              <span>All Jobs</span>
              <span
                className={`w-4 h-4 rounded-full font-mono text-[9px] font-bold flex items-center justify-center ${
                  selectedFolderId === SYSTEM_ALL_JOBS_FOLDER.id
                    ? "bg-slate-800 text-slate-100"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {cases.length}
              </span>
            </button>

            {/* User Folders */}
            {userFolders.map((folder) => {
              const isSelected = selectedFolderId === folder.id;
              const count = getCountForFolder(folder.id);

              if (editingFolderId === folder.id) {
                return (
                  <form
                    key={folder.id}
                    onSubmit={(e) => handleRenameFolderSubmit(e, folder.id)}
                    className="flex items-center gap-1 shrink-0"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      className="px-2.5 py-0.5 bg-slate-50 border border-indigo-300 rounded-full text-xs text-slate-800 focus:outline-none w-24"
                    />
                    <button
                      type="submit"
                      className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingFolderId(null)}
                      className="p-0.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                );
              }

              return (
                <div
                  key={folder.id}
                  className="flex items-center group relative shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => onSelectFolder(folder.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0B0F19] text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Folder
                      className={`w-3.5 h-3.5 ${
                        isSelected
                          ? "text-cyan-400 stroke-[2]"
                          : "text-blue-500"
                      }`}
                    />
                    <span className="truncate max-w-[100px]">{folder.name}</span>
                    <span
                      className={`w-4 h-4 rounded-full font-mono text-[9px] font-bold flex items-center justify-center ${
                        isSelected
                          ? "bg-slate-800 text-slate-100"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>

                  <div className="hidden group-hover:flex items-center gap-0.5 ml-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFolderId(folder.id);
                        setEditingFolderName(folder.name);
                      }}
                      title="Rename folder"
                      className="p-0.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteFolder(folder.id)}
                      title="Delete folder"
                      className="p-0.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* New Folder Inline Form / Button */}
            {isCreatingFolder ? (
              <form
                onSubmit={handleCreateFolderSubmit}
                className="flex items-center gap-1 shrink-0"
              >
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name..."
                  className="px-2.5 py-0.5 bg-slate-50 border border-indigo-300 rounded-full text-xs text-slate-800 focus:outline-none w-28"
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-slate-50/60 transition-all font-semibold text-xs cursor-pointer shrink-0"
              >
                <FolderPlus className="w-3 h-3 text-indigo-500" />
                <span>+ Folder</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Case Switcher Capsule */}
        <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={() => setIsCaseDrawerOpen(!isCaseDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer text-xs"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span className="truncate max-w-[120px] sm:max-w-[180px]">
              {currentCaseTitle ? currentCaseTitle.title : "Select Check"}
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-white text-slate-500 border border-slate-200 font-mono text-[10px]">
              {filteredCases.length}
            </span>
            {isCaseDrawerOpen ? (
              <ChevronUp className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            )}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-bold animate-pulse">
                <Loader2 className="w-3 h-3 text-cyan-600 animate-spin" />
                <span>Analyzing Case...</span>
              </div>
              {onStopAnalysis && (
                <button
                  type="button"
                  onClick={onStopAnalysis}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer animate-pulse"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onNewCase}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#0B0F19] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">New Check</span>
                <span className="sm:hidden">New</span>
              </button>

              <button
                type="button"
                onClick={onLoadDemo}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200/80 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Demo</span>
              </button>
            </>
          )}

          {(currentCase?.evidence.length || currentCase?.analysis) ? (
            <button
              type="button"
              onClick={onReset}
              title="Reset current case evidence"
              className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all active:scale-90 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          ) : null}

          <span className="hidden xl:inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold border border-slate-200/60">
            {modelName}
          </span>
        </div>

        {/* EXPANDABLE CASE BROWSER DRAWER */}
        {isCaseDrawerOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 sm:p-5 bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl rounded-[32px] space-y-4 z-50 animate-in fade-in zoom-in-95">
            {/* Search and Sort Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search checks, company, URL..."
                    className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />
                </div>

                <div className="relative shrink-0">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer pr-6 appearance-none shadow-2xs"
                  >
                    <option value="recent">Recent</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[9px]">
                    ▼
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">
                  {filteredCases.length} check{filteredCases.length === 1 ? "" : "s"} in {currentFolder.name}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCaseDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Close browser"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Case Cards Grid */}
            {filteredCases.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">
                  {searchQuery.trim()
                    ? `No job checks match "${searchQuery}".`
                    : "No job checks in this folder yet."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onNewCase();
                    setIsCaseDrawerOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1E90FF] text-white text-xs font-bold hover:bg-[#1877D2] active:bg-[#1565C0] shadow-sm shadow-[#1E90FF]/25 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create First Check</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[55vh] overflow-y-auto pr-1">
                {filteredCases.map((c) => (
                  <JobCaseCard
                    key={c.id}
                    caseItem={c}
                    folderName={folderMap.get(c.folderId) || "My Jobs"}
                    isSelected={c.id === selectedCaseId}
                    onSelect={(id) => {
                      onSelectCase(id);
                      setIsCaseDrawerOpen(false);
                    }}
                    onMove={onMoveCase}
                    onRename={onRenameCase}
                    onDelete={onDeleteCase}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
