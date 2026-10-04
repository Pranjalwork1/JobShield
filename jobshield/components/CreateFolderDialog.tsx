"use client";

import React, { useState } from "react";
import { FolderPlus, X } from "lucide-react";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => Promise<void>;
  initialName?: string;
  title?: string;
  submitLabel?: string;
}

export function CreateFolderDialog({
  isOpen,
  onClose,
  onCreate,
  initialName = "",
  title = "Create Folder",
  submitLabel = "Create Folder",
}: CreateFolderDialogProps) {
  if (!isOpen) return null;

  return (
    <CreateFolderContent
      key={`${initialName}_${title}`}
      onClose={onClose}
      onCreate={onCreate}
      initialName={initialName}
      title={title}
      submitLabel={submitLabel}
    />
  );
}

function CreateFolderContent({
  onClose,
  onCreate,
  initialName,
  title,
  submitLabel,
}: Omit<CreateFolderDialogProps, "isOpen"> & { initialName: string; title: string; submitLabel: string }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a folder name.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onCreate(trimmed);
      setName("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create folder.");
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
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">{title}</h3>
              <p className="text-xs text-[#667085]">Organize job checks by category or region</p>
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
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Folder Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Remote Jobs, India Tech, Shortlisted"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/20 focus:border-[#1E90FF] transition-all placeholder:text-slate-400"
            />
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
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
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white shadow-md shadow-[#1E90FF]/25 border-none transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
