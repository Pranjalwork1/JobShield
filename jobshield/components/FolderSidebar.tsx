"use client";

import React, { useState } from "react";
import { FolderPlus, Layers, Plus } from "lucide-react";
import { JobShieldFolder, JobShieldCase } from "@/types/jobshield";
import { FolderItem } from "./FolderItem";
import { SYSTEM_ALL_JOBS_FOLDER } from "@/lib/caseStore";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface FolderSidebarProps {
  folders: JobShieldFolder[];
  cases: JobShieldCase[];
  selectedFolderId: string;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onRenameFolder: (id: string, name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
}

export function FolderSidebar({
  folders,
  cases,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderSidebarProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);

  // Compute case counts
  const totalCount = cases.length;
  const getCountForFolder = (folderId: string) => {
    return cases.filter((c) => c.folderId === folderId).length;
  };

  const userFolders = folders.filter((f) => !f.isSystem);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 pt-0.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1E90FF] stroke-[2]" />
          <span>CASE LIBRARY</span>
        </h4>
        <button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
          title="Create New Folder"
          className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        {/* System: All Jobs */}
        <FolderItem
          folder={SYSTEM_ALL_JOBS_FOLDER}
          count={totalCount}
          isSelected={selectedFolderId === SYSTEM_ALL_JOBS_FOLDER.id}
          onSelect={onSelectFolder}
        />

        {/* User Folders */}
        {userFolders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            count={getCountForFolder(folder.id)}
            isSelected={selectedFolderId === folder.id}
            onSelect={onSelectFolder}
            onRename={(id) => {
              const current = userFolders.find((f) => f.id === id);
              if (current) setRenameTarget({ id, name: current.name });
            }}
            onDelete={(id, name) => setFolderToDelete({ id, name })}
          />
        ))}
      </div>

      {/* New Folder Button matching screenshot */}
      <div className="pt-1 px-0.5">
        <button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-dashed border-slate-300 text-[#667085] hover:text-[#1E90FF] hover:border-[#B9DCFE] hover:bg-[#F4F9FF] transition-all font-semibold text-xs cursor-pointer shadow-2xs"
        >
          <FolderPlus className="w-4 h-4 text-[#1E90FF] shrink-0" />
          <span>+ New Folder</span>
        </button>
      </div>

      {/* Create Dialog */}
      <CreateFolderDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={onCreateFolder}
      />

      {/* Rename Dialog */}
      {renameTarget && (
        <CreateFolderDialog
          isOpen={true}
          title="Rename Folder"
          initialName={renameTarget.name}
          submitLabel="Save Changes"
          onClose={() => setRenameTarget(null)}
          onCreate={async (newName) => {
            await onRenameFolder(renameTarget.id, newName);
            setRenameTarget(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {folderToDelete && (
        <DeleteConfirmDialog
          isOpen={true}
          onClose={() => setFolderToDelete(null)}
          onConfirm={async () => {
            await onDeleteFolder(folderToDelete.id);
            setFolderToDelete(null);
          }}
          title={`Delete "${folderToDelete.name}"?`}
          message={`Are you sure you want to delete this folder? All job cases inside "${folderToDelete.name}" will be safely preserved and moved to "My Jobs".`}
          confirmLabel="Delete Folder"
        />
      )}
    </div>
  );
}
