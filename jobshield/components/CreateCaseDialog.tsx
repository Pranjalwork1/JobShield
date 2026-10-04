"use client";

import React, { useState } from "react";
import { ShieldAlert, X, Briefcase, Building2, Folder } from "lucide-react";
import { JobShieldFolder } from "@/types/jobshield";
import { SYSTEM_ALL_JOBS_ID } from "@/lib/caseStore";

interface CreateCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folders: JobShieldFolder[];
  defaultFolderId: string;
  onCreate: (params: {
    title?: string;
    company?: string;
    folderId: string;
  }) => Promise<void>;
}

export function CreateCaseDialog({
  isOpen,
  onClose,
  folders,
  defaultFolderId,
  onCreate,
}: CreateCaseDialogProps) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(
    defaultFolderId === SYSTEM_ALL_JOBS_ID
      ? folders.find((f) => !f.isSystem)?.id || "folder_my_jobs"
      : defaultFolderId
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validFolders = folders.filter((f) => f.id !== SYSTEM_ALL_JOBS_ID);

  const handleCreate = async (skipDetails = false) => {
    setIsSubmitting(true);
    try {
      await onCreate({
        title: skipDetails ? undefined : title.trim() || undefined,
        company: skipDetails ? undefined : company.trim() || undefined,
        folderId: selectedFolderId || validFolders[0]?.id || "folder_my_jobs",
      });
      setTitle("");
      setCompany("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/95 rounded-[32px] p-6 sm:p-8 w-full max-w-lg border border-white shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF4FF] border border-[#B9DCFE] flex items-center justify-center text-[#1E90FF] shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">New Job Check</h3>
              <p className="text-xs text-[#667085]">
                Start a clean, isolated recruitment investigation
              </p>
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

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#1E90FF]" />
              <span>Job Title (Optional)</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Developer, Product Manager"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/20 focus:border-[#1E90FF] transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#1E90FF]" />
              <span>Company (Optional)</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. ABC Technologies, Google, Startup Ltd."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/20 focus:border-[#1E90FF] transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[#1E90FF]" />
              <span>Destination Folder</span>
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

          <p className="text-xs text-[#667085] bg-[#F4F9FF] p-3 rounded-2xl border border-[#B9DCFE]/60 leading-relaxed">
            💡 <strong>Tip:</strong> If left empty, JobShield will automatically derive the company and role title from your uploaded offer letter or recruiter message via Gemini analysis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleCreate(true)}
            className="w-full sm:w-auto text-xs font-semibold text-slate-500 hover:text-[#1E90FF] transition-colors"
          >
            Skip details and start
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleCreate(false)}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white shadow-md shadow-[#1E90FF]/25 border-none transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {isSubmitting ? "Creating..." : "Create Case"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
