"use client";

import React, { useRef, useState } from "react";
import {
  Plus,
  Send,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Globe,
  Trash2,
  Shield,
  Loader2,
  X,
  Square,
} from "lucide-react";
import { Evidence } from "@/types/jobshield";

interface BottomConsoleProps {
  messageText: string;
  onMessageChange: (text: string) => void;
  jobUrl: string;
  onJobUrlChange: (url: string) => void;
  evidenceList: Evidence[];
  onRemoveEvidence: (id: string) => void;
  onFilesAdded: (files: Evidence[]) => void;
  onLoadDemo: () => void;
  onClearAll: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onStopAnalysis?: () => void;
}

export function BottomConsole({
  messageText,
  onMessageChange,
  jobUrl,
  onJobUrlChange,
  evidenceList,
  onRemoveEvidence,
  onFilesAdded,
  onLoadDemo,
  onClearAll,
  onAnalyze,
  isAnalyzing,
  onStopAnalysis,
}: BottomConsoleProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlField, setShowUrlField] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    const valid = rawFiles.map((f) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: (f.type === "application/pdf" || f.name.endsWith(".pdf") ? "pdf" : "image") as "pdf" | "image",
      name: f.name,
      mimeType: f.type,
      size: f.size,
      file: f,
    }));
    if (valid.length > 0) onFilesAdded(valid);
    e.target.value = "";
  };

  const totalEvidenceCount =
    evidenceList.length +
    (messageText.trim().length > 0 ? 1 : 0) +
    (jobUrl.trim().length > 0 ? 1 : 0);

  const canAnalyze = totalEvidenceCount > 0 && !isAnalyzing;

  return (
    <div className="w-full max-w-4xl mx-auto pt-6 pb-8">
      {/* Hidden Global File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="application/pdf,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-5 sm:p-6 border border-white/90 shadow-2xl shadow-slate-300/40 space-y-4">
        {/* Top Micro-Header */}
        <div className="flex items-center justify-between text-xs px-2 text-slate-400">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Verification Shield Active</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Powered by Google Gemini Flash 2.5
          </div>
        </div>

        {/* Attached Evidence Chips Row (if any) */}
        {(evidenceList.length > 0 || jobUrl.trim().length > 0) && (
          <div className="flex flex-wrap items-center gap-2 px-2 pt-1 pb-2 border-b border-slate-100">
            {evidenceList.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 text-xs font-medium border border-slate-200"
              >
                {item.type === "pdf" ? (
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span className="max-w-[140px] truncate">{item.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveEvidence(item.id)}
                  className="hover:text-red-500 text-slate-400 ml-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            {jobUrl.trim().length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span className="max-w-[160px] truncate">{jobUrl}</span>
                <button
                  type="button"
                  onClick={() => onJobUrlChange("")}
                  className="hover:text-red-500 text-blue-400 ml-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Optional Job URL Drawer */}
        {showUrlField && (
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in">
            <Globe className="w-4 h-4 text-blue-500 ml-2" />
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => onJobUrlChange(e.target.value)}
              placeholder="Paste job listing or company careers URL (https://...)"
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowUrlField(false)}
              className="p-1 text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              Done
            </button>
          </div>
        )}

        {/* Center Input Bar */}
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50/80 rounded-2xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
          {/* Plus Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Evidence Documents or Images"
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Textarea for message */}
          <textarea
            rows={1}
            value={messageText}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Paste recruiter message text (e.g. 'Pay ₹2,999 fee before joining...') or attach evidence above..."
            className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none resize-none py-1.5"
          />

          {/* Analyze / Stop Button */}
          {isAnalyzing && onStopAnalysis ? (
            <button
              type="button"
              onClick={onStopAnalysis}
              title="Stop and cancel analysis"
              className="px-4 sm:px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white cursor-pointer active:scale-95 shadow-md shadow-rose-600/30 transition-all shrink-0 animate-pulse"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!canAnalyze}
              title={canAnalyze ? "Analyze Case" : "Add evidence to analyze"}
              className={`px-4 sm:px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all shrink-0 ${
                canAnalyze
                  ? "bg-slate-950 hover:bg-slate-900 text-white cursor-pointer active:scale-95 shadow-slate-950/20"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="hidden sm:inline">Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze Case</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Quick Action Pills Row matching ui.webp */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onLoadDemo}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Load Demo Case</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Attach Offer PDF</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
            <span>Attach Screenshot</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlField(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Add Job URL</span>
          </button>

          {totalEvidenceCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              title="Clear all evidence"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 text-xs font-medium transition-all ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
