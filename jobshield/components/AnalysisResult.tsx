"use client";

import React from "react";
import {
  Building2,
  Briefcase,
  User,
  Mail,
  Phone,
  DollarSign,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  FileCheck,
  SearchCheck,
} from "lucide-react";
import { JobShieldAnalysis } from "@/lib/schemas";
import { JobShieldIcon } from "@/components/brand/JobShieldLogo";
import { RiskIndicatorCard } from "./RiskIndicatorCard";
import { VerificationTargetCard } from "./VerificationTargetCard";

interface AnalysisResultProps {
  analysis: JobShieldAnalysis;
  onReset: () => void;
  completedTargets?: string[];
  onToggleTarget?: (target: string) => void;
}

export function AnalysisResult({
  analysis,
  onReset,
  completedTargets = [],
  onToggleTarget,
}: AnalysisResultProps) {
  const {
    case_summary,
    requests,
    claims,
    risk_indicators,
    verification_targets,
  } = analysis;

  const renderFactualValue = (val: string | null) => {
    if (!val || val.trim().toLowerCase() === "null" || val.trim() === "") {
      return (
        <span className="text-slate-400 italic font-normal text-xs">
          Not identified in evidence
        </span>
      );
    }
    return <span className="text-slate-900 font-bold">{val}</span>;
  };

  const highRiskCount = risk_indicators.filter((r) => r.severity === "high").length;
  const mediumRiskCount = risk_indicators.filter((r) => r.severity === "medium").length;

  return (
    <div id="results-dossier" className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-[36px] bg-white/95 p-6 sm:p-8 border border-white/90 shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF4FF] text-[#101828] text-xs font-bold border border-[#B9DCFE] shadow-2xs">
            <JobShieldIcon size={16} />
            <span>JobShield Intelligence Dossier</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
            Case Analysis Findings
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] max-w-xl">
            Observable facts, explicit fee demands, and evidence-backed risk indicators isolated across your submitted materials.
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white text-xs font-bold shadow-md shadow-[#1E90FF]/25 border-none transition-all shrink-0 active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* SECTION 1: Case Summary (Extracted Facts) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Case Summary (Observable Facts)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Directly substantiated by evidence
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white/95 border border-slate-100 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Company</span>
            </div>
            <div className="text-sm truncate">
              {renderFactualValue(case_summary.company)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/95 border border-slate-100 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              <span>Job Title / Role</span>
            </div>
            <div className="text-sm truncate">
              {renderFactualValue(case_summary.job_title)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/95 border border-slate-100 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Recruiter Name</span>
            </div>
            <div className="text-sm truncate">
              {renderFactualValue(case_summary.recruiter_name)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/95 border border-slate-100 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>Recruiter Email</span>
            </div>
            <div className="text-sm truncate">
              {renderFactualValue(case_summary.recruiter_email)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/95 border border-slate-100 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Phone className="w-3.5 h-3.5 text-indigo-500" />
              <span>Contact Phone</span>
            </div>
            <div className="text-sm truncate">
              {renderFactualValue(case_summary.phone)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/95 border border-slate-100 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
              <span>Compensation</span>
            </div>
            <div className="text-sm truncate">
              {renderFactualValue(case_summary.salary)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/95 border border-slate-100 shadow-sm space-y-1 sm:col-span-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>Location / Work Mode</span>
            </div>
            <div className="text-sm truncate">
              {renderFactualValue(case_summary.location)}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Requests Detected */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 px-1">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Requests Detected in Evidence</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Card */}
          <div
            className={`p-6 rounded-[28px] border shadow-sm ${
              requests.payment_requested
                ? "bg-red-50/40 border-red-100"
                : "bg-white/95 border-slate-100"
            } space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Upfront Payment Demand
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  requests.payment_requested
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {requests.payment_requested ? "YES — REQUESTED" : "NO DEMAND FOUND"}
              </span>
            </div>

            {requests.payment_requested ? (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-slate-500">Requested Amount:</p>
                <p className="text-2xl font-black text-red-600 font-mono">
                  {requests.payment_amount || "Amount unspecified"}
                </p>
                <p className="text-xs text-red-700 leading-relaxed pt-1">
                  Legitimate employers rarely require job applicants to pay registration, background check, or onboarding fees prior to employment.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                No explicit demand for candidate fees, security deposits, or registration charges was detected in the submitted evidence.
              </p>
            )}
          </div>

          {/* Sensitive Information Card */}
          <div
            className={`p-6 rounded-[28px] border shadow-sm ${
              requests.sensitive_information_requested.length > 0 ||
              requests.bank_details_requested
                ? "bg-amber-50/40 border-amber-100"
                : "bg-white/95 border-slate-100"
            } space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sensitive Information Demands
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  requests.sensitive_information_requested.length > 0 ||
                  requests.bank_details_requested
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {requests.sensitive_information_requested.length > 0 ||
                requests.bank_details_requested
                  ? "ITEMS DETECTED"
                  : "NONE DETECTED"}
              </span>
            </div>

            {requests.sensitive_information_requested.length > 0 ||
            requests.bank_details_requested ? (
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {requests.bank_details_requested && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
                      Bank Account Details
                    </span>
                  )}
                  {requests.sensitive_information_requested.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Verify the employer&apos;s identity independently before sharing national IDs, tax numbers, or banking credentials.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                No requests for government ID numbers, bank accounts, or security codes found in the submitted evidence.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: Observed Risk Indicators */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Observed Risk Indicators ({risk_indicators.length})</span>
          </h3>
          <div className="flex items-center gap-2 text-xs">
            {highRiskCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold border border-red-200 text-[11px]">
                {highRiskCount} High
              </span>
            )}
            {mediumRiskCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold border border-amber-200 text-[11px]">
                {mediumRiskCount} Medium
              </span>
            )}
          </div>
        </div>

        {risk_indicators.length === 0 ? (
          <div className="p-8 rounded-[32px] bg-white/95 border border-slate-100 shadow-sm text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-900">
              No High/Medium Risk Indicators Detected in Supplied Evidence
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              While no common recruitment red flags were detected, always independently confirm recruiters via official corporate channels.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {risk_indicators.map((indicator, idx) => (
              <RiskIndicatorCard key={idx} indicator={indicator} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: Claims Extracted from Evidence */}
      {claims.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 px-1">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Explicit Claims Made in Evidence</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {claims.map((claim, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/95 border border-slate-100 shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono truncate text-[11px]">
                    Ref: {claim.evidence_reference}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                    Confidence: {claim.confidence}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  &ldquo;{claim.claim}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: Verification Targets (Verify Before You Trust) */}
      <section id="verification-targets-section" className="space-y-3 pt-2">
        <div className="px-1 space-y-0.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <SearchCheck className="w-4 h-4 text-indigo-600" />
            <span>Verify Before Proceeding</span>
          </h3>
          <p className="text-xs text-slate-500">
            Click each target to track your independent verification progress:
          </p>
        </div>

        <div className="space-y-2.5">
          {verification_targets.map((target, idx) => (
            <VerificationTargetCard
              key={idx}
              target={target}
              index={idx}
              isCompleted={completedTargets.includes(target.target)}
              onToggle={() => onToggleTarget && onToggleTarget(target.target)}
            />
          ))}
        </div>
      </section>

      {/* Safety Notice */}
      <div className="p-5 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-500 leading-relaxed space-y-1">
        <p className="font-bold text-slate-800">JobShield Principles & Safety Notice:</p>
        <p>
          JobShield isolates evidence-backed risk indicators and observable facts. It does not issue binary fraud verdicts or arbitrary numeric scores. Always complete the verification targets through official, independently discovered company channels before sharing money or identity documents.
        </p>
      </div>
    </div>
  );
}
