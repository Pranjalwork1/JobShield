"use client";

import React, { useState } from "react";
import { FolderSidebar } from "./FolderSidebar";
import { JobCaseList } from "./JobCaseList";
import { JobShieldFolder, JobShieldCase, SortOrder } from "@/types/jobshield";
import { X, Layers } from "lucide-react";

interface CaseLibraryProps {
  folders: JobShieldFolder[];
  cases: JobShieldCase[];
  selectedFolderId: string;
  selectedCaseId: string | null;
  onSelectFolder: (id: string) => void;
  onSelectCase: (id: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onRenameFolder: (id: string, name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  onNewCase: () => void;
  onMoveCase: (caseItem: JobShieldCase) => void;
  onRenameCase: (caseItem: JobShieldCase) => void;
  onDeleteCase: (caseItem: JobShieldCase) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function CaseLibrary({
  folders,
  cases,
  selectedFolderId,
  selectedCaseId,
  onSelectFolder,
  onSelectCase,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onNewCase,
  onMoveCase,
  onRenameCase,
  onDeleteCase,
  isOpenMobile,
  onCloseMobile,
}: CaseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Case Library Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-4 left-0 h-full lg:h-[calc(100vh-3.5rem)] z-50 lg:z-10 w-80 sm:w-96 lg:w-[350px] xl:w-[370px] shrink-0 bg-white/95 lg:bg-white backdrop-blur-2xl rounded-r-[36px] lg:rounded-[36px] p-5 sm:p-6 border-r lg:border border-slate-200/90 shadow-2xl lg:shadow-md lg:shadow-slate-100 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-900 text-sm">Job Investigation Library</span>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Folders Section */}
          <FolderSidebar
            folders={folders}
            cases={cases}
            selectedFolderId={selectedFolderId}
            onSelectFolder={(id) => {
              onSelectFolder(id);
            }}
            onCreateFolder={onCreateFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
          />

          <div className="border-t border-slate-100 my-2" />

          {/* 2. Cases in Selected Folder */}
          <JobCaseList
            cases={cases}
            folders={folders}
            selectedFolderId={selectedFolderId}
            selectedCaseId={selectedCaseId}
            onSelectCase={(id) => {
              onSelectCase(id);
              onCloseMobile();
            }}
            onNewCase={onNewCase}
            onMoveCase={onMoveCase}
            onRenameCase={onRenameCase}
            onDeleteCase={onDeleteCase}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between px-1">
          <span>{cases.length} Total Investigation{cases.length === 1 ? "" : "s"}</span>
          <span className="font-mono text-[10px]">IndexedDB Local</span>
        </div>
      </aside>
    </>
  );
}
