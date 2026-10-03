"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileType, AlertCircle } from "lucide-react";
import { Evidence } from "@/types/jobshield";

interface EvidenceUploaderProps {
  onFilesAdded: (newEvidence: Evidence[]) => void;
  currentCount: number;
  maxFiles?: number;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function EvidenceUploader({
  onFilesAdded,
  currentCount,
  maxFiles = 5,
  disabled = false,
}: EvidenceUploaderProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: {
        "application/pdf": [".pdf"],
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/webp": [".webp"],
      },
      maxSize: MAX_FILE_SIZE,
      disabled: disabled || currentCount >= maxFiles,
      onDropAccepted: (acceptedFiles) => {
        setUploadError(null);

        if (currentCount + acceptedFiles.length > maxFiles) {
          setUploadError(
            `You can only add up to ${maxFiles} files per case. You already have ${currentCount}.`
          );
          return;
        }

        const newItems: Evidence[] = acceptedFiles.map((file) => {
          const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
          return {
            id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            type: isPdf ? "pdf" : "image",
            name: file.name,
            mimeType: file.type || (isPdf ? "application/pdf" : "image/jpeg"),
            size: file.size,
            file,
          };
        });

        onFilesAdded(newItems);
      },
      onDropRejected: (fileRejections) => {
        if (fileRejections.length > 0) {
          const first = fileRejections[0];
          if (first.errors.some((e) => e.code === "file-too-large")) {
            setUploadError(
              `"${first.file.name}" is over 10 MB. Maximum size is 10 MB per file.`
            );
          } else if (
            first.errors.some((e) => e.code === "file-invalid-type")
          ) {
            setUploadError(
              `"${first.file.name}" has an unsupported format. Only PDF, PNG, JPG, and WEBP files are allowed.`
            );
          } else {
            setUploadError(first.errors[0]?.message || "Could not accept file.");
          }
        }
      },
    });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50/60 scale-[0.99]"
            : isDragReject
            ? "border-red-500 bg-red-50/60"
            : disabled || currentCount >= maxFiles
            ? "border-slate-200 bg-slate-100/50 opacity-60 cursor-not-allowed"
            : "border-slate-200 hover:border-indigo-400 bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
        }`}
      >
        <input {...getInputProps()} id="evidence-file-input" />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-slate-800">
              {isDragActive ? (
                <span className="text-indigo-600">Drop your evidence files here</span>
              ) : currentCount >= maxFiles ? (
                <span className="text-amber-600">File limit reached ({maxFiles} files max)</span>
              ) : (
                <>
                  Drag & Drop recruitment files here, or{" "}
                  <span className="text-indigo-600 underline underline-offset-4 font-bold">
                    browse files
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-slate-400">
              PDF • PNG • JPG • WEBP • Maximum 10 MB each (up to {maxFiles} files)
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-600 font-medium">
            <FileType className="w-3.5 h-3.5 text-slate-400" />
            <span>Offer Letters, Job Contracts, Email/Chat Screenshots</span>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-2xl animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
