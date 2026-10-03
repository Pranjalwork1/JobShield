"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface RobotMascotProps {
  onClick?: () => void;
  bubbleText?: string;
  subText?: string;
}

export function RobotMascot({
  onClick,
  bubbleText = "Hey there! 👋",
  subText = "Need a verify check?",
}: RobotMascotProps) {
  const [bubbleVisible, setBubbleVisible] = useState(true);

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-end select-none group cursor-pointer filter drop-shadow-xl"
      title="JobShield AI Companion • Click to jump to evidence intake"
    >
      {/* Speech Bubble */}
      {bubbleVisible && (
        <div className="relative mb-2 px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 text-xs font-semibold shadow-lg border border-slate-200/80 flex items-center gap-2 animate-bounce [animation-duration:3s]">
          <span className="font-bold text-slate-900">{bubbleText}</span>
          <span className="text-slate-500 font-normal">{subText}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBubbleVisible(false);
            }}
            className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ml-0.5 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
          {/* Speech bubble arrow pointer pointing down to robot */}
          <div className="absolute -bottom-1.5 right-10 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-200/80" />
        </div>
      )}

      {/* Robot Mascot Body & Head with Hover Animation */}
      <div className="relative w-28 flex flex-col items-center group-hover:-translate-y-1.5 transition-transform duration-300 mr-2">
        {/* Antenna */}
        <div className="w-1.5 h-3.5 bg-slate-300 rounded-t-full relative">
          <div className="absolute -top-1.5 -left-1 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/80 animate-pulse" />
        </div>

        {/* Head */}
        <div className="w-24 h-16 rounded-[24px] bg-gradient-to-b from-white via-slate-50 to-slate-200 border-2 border-slate-200/90 shadow-xl flex items-center justify-center p-2 relative overflow-hidden">
          {/* Ear pods */}
          <div className="absolute -left-2 w-3 h-5 rounded-full bg-slate-300" />
          <div className="absolute -right-2 w-3 h-5 rounded-full bg-slate-300" />

          {/* Dark Glass Visor */}
          <div className="w-full h-full rounded-[18px] bg-slate-950 flex items-center justify-center gap-3.5 shadow-inner">
            {/* Smiling Cyan LED Eyes */}
            <div className="w-3 h-3 border-t-2 border-l-2 border-r-0 border-b-0 border-cyan-400 rounded-t-full -rotate-45 shadow-sm shadow-cyan-400 animate-pulse" />
            <div className="w-3 h-3 border-t-2 border-r-2 border-l-0 border-b-0 border-cyan-400 rounded-t-full rotate-45 shadow-sm shadow-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Neck / Collar */}
        <div className="w-12 h-2 bg-slate-300 rounded-full -mt-0.5 z-10" />

        {/* Robot Torso / Hover Base */}
        <div className="w-16 h-8 bg-gradient-to-b from-white via-slate-50 to-slate-200 border-2 border-slate-200 rounded-b-[20px] shadow-md -mt-1 flex items-center justify-center relative overflow-hidden z-0">
          <div className="w-5 h-5 rounded-full bg-cyan-400/15 border border-cyan-400/50 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-ping" />
          </div>
        </div>

        {/* Robot Hands */}
        <div className="w-full flex justify-between px-3 -mt-6 z-20 pointer-events-none">
          <div className="w-4 h-4 bg-white border border-slate-200 rounded-full shadow-sm" />
          <div className="w-4 h-4 bg-white border border-slate-200 rounded-full shadow-sm" />
        </div>

        {/* Hovering Ambient Shadow */}
        <div className="w-14 h-2 rounded-full bg-slate-400/25 blur-[2px] mt-1.5 animate-pulse" />
      </div>
    </div>
  );
}
