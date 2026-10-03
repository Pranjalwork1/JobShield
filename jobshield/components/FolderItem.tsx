"use client";

import React, { useState } from "react";
import { Folder, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { JobShieldFolder } from "@/types/jobshield";

interface FolderItemProps {
  folder: JobShieldFolder;
  count: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRename?: (id: string, currentName: string) => void;
  onDelete?: (id: string, name: string) => void;
}

export function FolderItem({
  folder,
  count,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: FolderItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative group">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(folder.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(folder.id);
          }
        }}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer select-none ${
          isSelected
            ? "bg-[#0B0F19] text-white shadow-md shadow-slate-950/20"
            : "text-slate-800 hover:bg-slate-100/80 hover:text-slate-950"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Folder
            className={`w-4 h-4 shrink-0 transition-colors ${
              isSelected ? "text-cyan-400 stroke-[2]" : "text-blue-500 stroke-[1.8]"
            }`}
          />
          <span className="truncate">{folder.name}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span
            className={`w-6 h-6 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
              isSelected
                ? "bg-slate-800 text-slate-100"
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
            }`}
          >
            {count}
          </span>

          {/* Folder menu button (for non-system folders) */}
          {!folder.isSystem && (onRename || onDelete) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                isSelected
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-400 hover:bg-slate-200"
              }`}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-2 top-10 w-36 py-1 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 animate-in fade-in duration-100 text-xs">
            {onRename && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onRename(folder.id, folder.name);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left font-medium"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Rename</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(folder.id, folder.name);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 text-left font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
