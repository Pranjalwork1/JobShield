"use client";

import React, { useRef } from "react";
import {
  FileText,
  MessageSquare,
  Globe,
  UploadCloud,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Evidence } from "@/types/jobshield";

interface IntakeCardDeckProps {
  onFilesAdded: (files: Evidence[]) => void;
  onOpenMessageInput: () => void;
  onOpenUrlInput: () => void;
  evidenceList: Evidence[];
}

export function IntakeCardDeck({
  onFilesAdded,
  onOpenMessageInput,
  onOpenUrlInput,
  evidenceList,
}: IntakeCardDeckProps) {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfs = files.filter(
      (f) => f.type === "application/pdf" || f.name.endsWith(".pdf")
    );
    const newItems: Evidence[] = pdfs.map((file) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: "pdf",
      name: file.name,
      mimeType: file.type || "application/pdf",
      size: file.size,
      file,
    }));
    if (newItems.length > 0) onFilesAdded(newItems);
    e.target.value = "";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const images = files.filter((f) => f.type.startsWith("image/"));
    const newItems: Evidence[] = images.map((file) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: "image",
      name: file.name,
      mimeType: file.type || "image/png",
      size: file.size,
      file,
    }));
    if (newItems.length > 0) onFilesAdded(newItems);
    e.target.value = "";
  };

  const pdfCount = evidenceList.filter((e) => e.type === "pdf").length;
  const imageCount = evidenceList.filter((e) => e.type === "image").length;

  return (
    <div id="evidence-cards-deck" className="relative pt-6">
      {/* Hidden file inputs */}
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handlePdfUpload}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={handleImageUpload}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* CARD 1: PDF Offer Letters */}
        <div
          onClick={() => pdfInputRef.current?.click()}
          className="bg-white/95 rounded-[32px] p-7 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
        >
          <div className="space-y-4">
            {/* Orange Stack Icon */}
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <div className="flex flex-col items-center justify-center text-amber-500">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Offer Letter & Contract
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Drop appointment letters or onboarding PDFs to extract salary, designation, and official claims.
              </p>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between text-xs border-t border-slate-100/80 mt-6">
            <span className="text-slate-400 font-medium flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Browse PDF</span>
            </span>
            {pdfCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {pdfCount} attached
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">PDF format</span>
            )}
          </div>
        </div>

        {/* CARD 2: Screenshots & Chats */}
        <div
          onClick={() => {
            imageInputRef.current?.click();
            onOpenMessageInput();
          }}
          className="bg-white/95 rounded-[32px] p-7 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
        >
          <div className="space-y-4">
            {/* Multi-color Flower / Chat Icon */}
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6 text-rose-500" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                Recruiter Chat & Visuals
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload WhatsApp, Telegram, or email screenshots to detect payment requests and pressure tactics.
              </p>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between text-xs border-t border-slate-100/80 mt-6">
            <span className="text-slate-400 font-medium flex items-center gap-1 group-hover:text-rose-600 transition-colors">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Browse Images</span>
            </span>
            {imageCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {imageCount} attached
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">PNG • JPG • WEBP</span>
            )}
          </div>
        </div>

        {/* CARD 3: Job Listing & URL Context */}
        <div
          onClick={onOpenUrlInput}
          className="bg-white/95 rounded-[32px] p-7 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group h-full relative"
        >
            <div className="space-y-4">
              {/* Google Calendar / Globe Icon */}
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Job Listing & Domain Context
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Provide job posting URLs or company domains to cross-reference authenticity and recruiter credibility.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-xs border-t border-slate-100/80 mt-6">
              <span className="text-slate-400 font-medium flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add Web Reference</span>
              </span>
              <span className="text-slate-400 text-[11px]">Portal & Links</span>
            </div>
          </div>
        </div>
      </div>
  );
}
