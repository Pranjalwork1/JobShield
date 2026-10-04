"use client";

import React from "react";

export interface JobShieldLogoProps {
  /** Size of the icon in pixels (e.g. 24, 32, 36, 40, 48, 64, 128). Default: 36 */
  size?: number;
  /** Display variant: 'icon' (mark only), 'wordmark' (text only), 'full' (icon + text) */
  variant?: "icon" | "wordmark" | "full";
  /** Optional override to toggle wordmark */
  showWordmark?: boolean;
  /** Optional override to show the tagline */
  showTagline?: boolean;
  /** Extra container className */
  className?: string;
  /** Light/White variation for dark backgrounds */
  lightMode?: boolean;
}

/**
 * JobShield Mark Icon:
 * Concept: Shield (Protection) + Job Offer Document (Evidence) + Checkmark (Verification).
 * Built with Dodger Blue #1E90FF and darker blue accent #1877D2.
 */
export function JobShieldIcon({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Primary Dodger Blue gradient */}
        <linearGradient
          id="js-shield-grad"
          x1="6"
          y1="3.5"
          x2="34"
          y2="36.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1E90FF" />
          <stop offset="100%" stopColor="#1877D2" />
        </linearGradient>

        {/* Subtle highlight gradient on top edge */}
        <linearGradient
          id="js-shield-stroke"
          x1="20"
          y1="3.5"
          x2="20"
          y2="36.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1565C0" stopOpacity="0.4" />
        </linearGradient>

        {/* Document soft shadow */}
        <filter id="js-doc-shadow" x="10" y="9" width="20" height="23" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0B2B5C" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* 1. Protection Shield Badge */}
      <path
        d="M20 3.5 C13 3.5 7.5 5.5 6 8.5 C6 21.5 12 31.5 20 36.5 C28 31.5 34 21.5 34 8.5 C32.5 5.5 27 3.5 20 3.5 Z"
        fill="url(#js-shield-grad)"
        stroke="url(#js-shield-stroke)"
        strokeWidth="1.2"
      />

      {/* 2. Job Offer Document / Evidence Card inside Shield with folded corner */}
      <g filter="url(#js-doc-shadow)">
        {/* Document Body */}
        <path
          d="M13 13.5 C13 12.12 14.12 11 15.5 11 H23.5 L27 14.5 V26 C27 27.1 26.1 28 25 28 H15 C13.9 28 13 27.1 13 26 V13.5 Z"
          fill="#FFFFFF"
        />
        {/* Folded Top-Right Corner */}
        <path
          d="M23.5 11 V14 C23.5 14.28 23.72 14.5 24 14.5 H27 Z"
          fill="#D8ECFF"
        />
      </g>

      {/* 3. Verification Checkmark inside the Job Document */}
      <path
        d="M16 19.5 L18.5 22 L24 16.5"
        stroke="#1E90FF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4. Document Evidence Terms / Salary lines */}
      <line
        x1="16"
        y1="24.5"
        x2="24"
        y2="24.5"
        stroke="#93C5FD"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="26.5"
        x2="21"
        y2="26.5"
        stroke="#93C5FD"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Full Reusable JobShield Logo Component
 */
export function JobShieldLogo({
  size = 36,
  variant = "full",
  showWordmark,
  showTagline = false,
  className = "",
  lightMode = false,
}: JobShieldLogoProps) {
  const isFull = variant === "full" || showWordmark === true;
  const isWordmarkOnly = variant === "wordmark";

  // Text scaling based on icon size
  const textSizeClass =
    size >= 48
      ? "text-2xl"
      : size >= 36
      ? "text-xl"
      : size >= 28
      ? "text-lg"
      : "text-base";

  const taglineSizeClass =
    size >= 36 ? "text-[11px]" : "text-[10px]";

  return (
    <div
      role="img"
      aria-label="JobShield — Verify before you trust"
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
    >
      {/* Icon Mark */}
      {!isWordmarkOnly && <JobShieldIcon size={size} />}

      {/* Wordmark and optional Tagline */}
      {(isFull || isWordmarkOnly) && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline tracking-tight font-black">
            <span
              className={`${textSizeClass} ${
                lightMode ? "text-white" : "text-[#101828]"
              }`}
            >
              JOB
            </span>
            <span
              className={`${textSizeClass} text-[#1E90FF] ml-0.5`}
            >
              SHIELD
            </span>
          </div>

          {showTagline && (
            <span
              className={`mt-1 font-medium ${taglineSizeClass} ${
                lightMode ? "text-slate-300" : "text-[#667085]"
              }`}
            >
              Verify before you trust.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default JobShieldLogo;
