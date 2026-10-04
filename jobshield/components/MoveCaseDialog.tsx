"use client";

import React, { useState } from "react";
import { FolderSymlink, X } from "lucide-react";
import { JobShieldFolder, JobShieldCase } from "@/types/jobshield";
import { SYSTEM_ALL_JOBS_ID } from "@/lib/caseStore";

interface MoveCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: JobShieldCase | null;
  folders: JobShieldFolder[];
  onMove: (caseId: string, targetFolderId: string) => Promise<void>;
}

export function MoveCaseDialog({
  isOpen,
  onClose,
  caseItem,
  folders,
  onMove,
}: MoveCaseDialogProps) {
  const validFolders = folders.filter((f) => f.id !== SYSTEM_ALL_JOBS_ID);
  const [selectedFolderId, setSelectedFolderId] = useState(
    caseItem?.folderId || validFolders[0]?.id || "folder_my_jobs"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !caseItem) return null;

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolderId) return;

    setIsSubmitting(true);
    try {
      await onMove(caseItem.id, selectedFolderId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/95 rounded-[32px] p-6 sm:p-7 w-full max-w-md border border-white shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF4FF] border border-[#B9DCFE] flex items-center justify-center text-[#1E90FF] shadow-sm">
              <FolderSymlink className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">Move Job Check</h3>
              <p className="text-xs text-[#667085]">Change folder location</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleMove} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Destination Folder
            </label>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/20 focus:border-[#1E90FF] transition-all font-medium"
            >
              {validFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedFolderId === caseItem.folderId}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white shadow-md shadow-[#1E90FF]/25 border-none transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {isSubmitting ? "Moving..." : "Move Case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
