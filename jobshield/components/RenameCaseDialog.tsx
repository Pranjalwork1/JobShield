"use client";

import React, { useState } from "react";
import { Edit3, X, Briefcase, Building2 } from "lucide-react";
import { JobShieldCase } from "@/types/jobshield";

interface RenameCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: JobShieldCase | null;
  onRename: (caseId: string, title: string, company: string) => Promise<void>;
}

export function RenameCaseDialog({
  isOpen,
  onClose,
  caseItem,
  onRename,
}: RenameCaseDialogProps) {
  if (!isOpen || !caseItem) return null;

  return (
    <RenameCaseContent
      key={caseItem.id}
      caseItem={caseItem}
      onClose={onClose}
      onRename={onRename}
    />
  );
}

function RenameCaseContent({
  caseItem,
  onClose,
  onRename,
}: {
  caseItem: JobShieldCase;
  onClose: () => void;
  onRename: (caseId: string, title: string, company: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(caseItem.title || "");
  const [company, setCompany] = useState(caseItem.company || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onRename(caseItem.id, title.trim(), company.trim());
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
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">Rename Job Check</h3>
              <p className="text-xs text-[#667085]">Update job title and company metadata</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#1E90FF]" />
              <span>Job Title</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/20 focus:border-[#1E90FF] transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#1E90FF]" />
              <span>Company</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. ABC Technologies"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/20 focus:border-[#1E90FF] transition-all font-medium"
            />
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white shadow-md shadow-[#1E90FF]/25 border-none transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
