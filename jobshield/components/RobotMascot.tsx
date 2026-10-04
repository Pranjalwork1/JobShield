"use client";

import React, { useState } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";

interface RobotMascotProps {
  onClick?: () => void;
  bubbleText?: string;
  subText?: string;
  className?: string;
}

export function RobotMascot({
  onClick,
  bubbleText = "Hey there! 👋",
  subText = "Need a verify check?",
  className = "",
}: RobotMascotProps) {
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const handleLauncherClick = () => {
    // If bubble is not visible, toggle it open or perform primary action
    if (!bubbleVisible) {
      setBubbleVisible(true);
    } else {
      onClick?.();
    }
  };

  return (
    <div
      className={`relative flex flex-col items-end select-none ${className}`}
      aria-label="JobShield AI Companion Assistant"
    >
      {/* Speech Bubble (Expands cleanly ABOVE the launcher, max-w 280px, safe positioning) */}
      {bubbleVisible && (
        <div
          role="dialog"
          aria-label="JobShield Assistant Notification"
          className="absolute bottom-full mb-3 right-0 w-64 sm:w-72 max-w-[calc(100vw-32px)] p-3.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 text-xs font-semibold shadow-xl border border-slate-200/90 animate-in fade-in slide-in-from-bottom-2 duration-200 z-40"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-[#1E90FF] font-extrabold text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>JobShield Companion</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBubbleVisible(false);
              }}
              aria-label="Dismiss assistant bubble"
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 mb-2.5">
            <p className="font-bold text-[#101828] text-xs leading-snug">
              {bubbleText}
            </p>
            <p className="text-[#667085] font-normal text-[11px] leading-relaxed">
              {subText}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setBubbleVisible(false);
              onClick?.();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white text-[11px] font-bold shadow-md shadow-[#1E90FF]/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>Open Evidence Intake</span>
            <ArrowRight className="w-3 h-3 text-white/80" />
          </button>

          {/* Speech bubble arrow pointer pointing down to the launcher */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-200/90" />
        </div>
      )}

      {/* Compact Robot Mascot Launcher Button */}
      <button
        type="button"
        onClick={handleLauncherClick}
        title="JobShield AI Companion • Click to toggle assistant"
        aria-label="Open JobShield AI Companion"
        className="relative group p-1.5 rounded-3xl bg-white hover:bg-slate-50 border-2 border-slate-200/90 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30"
      >
        {/* Robot Figure (Compact: 56px x 56px footprint, preserving authentic robot aesthetic) */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center relative">
          {/* Antenna */}
          <div className="w-1 h-2.5 bg-slate-300 rounded-t-full relative -mb-0.5">
            <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-[#1E90FF] shadow-sm shadow-[#1E90FF]/80 animate-pulse" />
          </div>

          {/* Helmet Head */}
          <div className="w-11 sm:w-12 h-8 rounded-xl bg-gradient-to-b from-white via-slate-50 to-slate-200 border border-slate-200 shadow-sm flex items-center justify-center p-1 relative overflow-hidden">
            {/* Dark Visor (Deep Navy) */}
            <div className="w-full h-full rounded-lg bg-[#101828] flex items-center justify-center gap-2 shadow-inner">
              {/* Smiling Dodger Blue LED Eyes */}
              <div className="w-2 h-2 border-t-2 border-l-2 border-r-0 border-b-0 border-[#1E90FF] rounded-t-full -rotate-45 shadow-2xs shadow-[#1E90FF] animate-pulse" />
              <div className="w-2 h-2 border-t-2 border-r-2 border-l-0 border-b-0 border-[#1E90FF] rounded-t-full rotate-45 shadow-2xs shadow-[#1E90FF] animate-pulse" />
            </div>
          </div>

          {/* Hover Torso Base */}
          <div className="w-8 h-2.5 bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-200 rounded-b-lg shadow-2xs -mt-0.5 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1E90FF] shadow-xs shadow-[#1E90FF] animate-ping" />
          </div>
        </div>

        {/* Status notification dot if bubble is available */}
        {!bubbleVisible && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#1E90FF] border-2 border-white flex items-center justify-center shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
          </span>
        )}
      </button>
    </div>
  );
}
