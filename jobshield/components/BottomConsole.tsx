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
  GripHorizontal,
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showUrlField, setShowUrlField] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState<number>(64);
  const [isManuallyResized, setIsManuallyResized] = useState<boolean>(false);

  // Auto-grow on text input unless user has manually dragged/resized the textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onMessageChange(val);
    if (!isManuallyResized) {
      if (!val.trim()) {
        setTextareaHeight(64);
      } else {
        const scrollH = e.target.scrollHeight;
        if (scrollH > 64) {
          setTextareaHeight(Math.min(200, Math.max(64, scrollH)));
        }
      }
    }
  };

  // Drag-to-resize handler for mouse and touch events
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsManuallyResized(true);
    const startY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const initialHeight = textareaRef.current ? textareaRef.current.offsetHeight : textareaHeight;

    document.body.style.userSelect = "none";
    document.body.style.cursor = "ns-resize";

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentY =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientY
          : (moveEvent as MouseEvent).clientY;
      const deltaY = currentY - startY;
      const clamped = Math.min(320, Math.max(60, initialHeight + deltaY));
      setTextareaHeight(clamped);
    };

    const handleEnd = () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleEnd);
  };

  // Sync if native CSS resize was used by user
  const handleNativeMouseUp = () => {
    if (textareaRef.current) {
      const currentH = textareaRef.current.offsetHeight;
      if (Math.abs(currentH - textareaHeight) > 2) {
        setIsManuallyResized(true);
        setTextareaHeight(currentH);
      }
    }
  };

  const handleClear = () => {
    setIsManuallyResized(false);
    setTextareaHeight(64);
    onClearAll();
  };

  const handleDemo = () => {
    setIsManuallyResized(false);
    setTextareaHeight(96);
    onLoadDemo();
  };

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

        {/* Center Input Bar (Expands naturally with textarea) */}
        <div className="flex items-start gap-3 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/90 focus-within:ring-2 focus-within:ring-[#1E90FF]/20 focus-within:border-[#1E90FF] transition-all">
          {/* Plus Attach Button (Top-aligned) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Evidence Documents or Images"
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shadow-xs transition-all active:scale-95 shrink-0 mt-1"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Resizable Textarea Container */}
          <div className="relative flex-1 min-w-0 flex flex-col">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTextChange}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (canAnalyze) onAnalyze();
                }
              }}
              onMouseUp={handleNativeMouseUp}
              placeholder="Paste recruiter message text (e.g. 'Pay ₹2,999 fee before joining...') or paste job details..."
              style={{ height: `${textareaHeight}px` }}
              className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none resize-y min-h-[60px] max-h-[320px] py-1.5 pr-6 leading-relaxed overflow-y-auto"
            />

            {/* Intuitive Visible Resize Drag Handle at Bottom-Right */}
            <div
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
              role="separator"
              aria-label="Resize message input height"
              title="Drag up or down to resize input area (min 60px, max 320px)"
              className="absolute bottom-0 right-0 p-1 flex items-center justify-center cursor-ns-resize text-slate-400 hover:text-[#1E90FF] active:text-[#1877D2] transition-colors select-none touch-none"
            >
              <GripHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Analyze / Stop Button (Top-aligned) */}
          {isAnalyzing && onStopAnalysis ? (
            <button
              type="button"
              onClick={onStopAnalysis}
              title="Stop and cancel analysis"
              className="px-4 sm:px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white cursor-pointer active:scale-95 shadow-md shadow-rose-600/30 transition-all shrink-0 animate-pulse mt-1"
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
              className={`px-4 sm:px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all shrink-0 mt-1 ${
                canAnalyze
                  ? "bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white cursor-pointer active:scale-95 shadow-[#1E90FF]/25 border-none"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
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
            onClick={handleDemo}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF4FF] text-[#101828] text-xs font-semibold hover:bg-[#DDF0FF] border border-[#B9DCFE] transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
              onClick={handleClear}
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
