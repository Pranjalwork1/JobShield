import { z } from "zod";

export const CaseSummarySchema = z.object({
  company: z.string().nullable(),
  job_title: z.string().nullable(),
  recruiter_name: z.string().nullable(),
  recruiter_email: z.string().nullable(),
  phone: z.string().nullable(),
  salary: z.string().nullable(),
  location: z.string().nullable(),
});

export const RequestsSchema = z.object({
  payment_requested: z.boolean(),
  payment_amount: z.string().nullable(),
  sensitive_information_requested: z.array(z.string()),
  bank_details_requested: z.boolean(),
  other_requests: z.array(z.string()),
});

export const ClaimSchema = z.object({
  claim: z.string(),
  evidence_reference: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

export const RiskIndicatorSchema = z.object({
  indicator: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  evidence_reference: z.string(),
  observed_evidence: z.string(),
  explanation: z.string(),
});

export const VerificationTargetSchema = z.object({
  target: z.string(),
  reason: z.string(),
  priority: z.enum(["high", "medium", "low"]),
});

export const JobShieldAnalysisSchema = z.object({
  case_summary: CaseSummarySchema,
  requests: RequestsSchema,
  claims: z.array(ClaimSchema),
  risk_indicators: z.array(RiskIndicatorSchema),
  verification_targets: z.array(VerificationTargetSchema),
});

export type CaseSummary = z.infer<typeof CaseSummarySchema>;
export type Requests = z.infer<typeof RequestsSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
export type RiskIndicator = z.infer<typeof RiskIndicatorSchema>;
export type VerificationTarget = z.infer<typeof VerificationTargetSchema>;
export type JobShieldAnalysis = z.infer<typeof JobShieldAnalysisSchema>;

/**
 * Standard JSON schema specification compatible with Gemini API responseJsonSchema.
 */
export const geminiResponseJsonSchema = {
  type: "object",
  properties: {
    case_summary: {
      type: "object",
      properties: {
        company: { type: ["string", "null"] },
        job_title: { type: ["string", "null"] },
        recruiter_name: { type: ["string", "null"] },
        recruiter_email: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        salary: { type: ["string", "null"] },
        location: { type: ["string", "null"] },
      },
      required: [
        "company",
        "job_title",
        "recruiter_name",
        "recruiter_email",
        "phone",
        "salary",
        "location",
      ],
    },
    requests: {
      type: "object",
      properties: {
        payment_requested: { type: "boolean" },
        payment_amount: { type: ["string", "null"] },
        sensitive_information_requested: {
          type: "array",
          items: { type: "string" },
        },
        bank_details_requested: { type: "boolean" },
        other_requests: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "payment_requested",
        "payment_amount",
        "sensitive_information_requested",
        "bank_details_requested",
        "other_requests",
      ],
    },
    claims: {
      type: "array",
      items: {
        type: "object",
        properties: {
          claim: { type: "string" },
          evidence_reference: { type: "string" },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["claim", "evidence_reference", "confidence"],
      },
    },
    risk_indicators: {
      type: "array",
      items: {
        type: "object",
        properties: {
          indicator: { type: "string" },
          severity: { type: "string", enum: ["high", "medium", "low"] },
          evidence_reference: { type: "string" },
          observed_evidence: { type: "string" },
          explanation: { type: "string" },
        },
        required: [
          "indicator",
          "severity",
          "evidence_reference",
          "observed_evidence",
          "explanation",
        ],
      },
    },
    verification_targets: {
      type: "array",
      items: {
        type: "object",
        properties: {
          target: { type: "string" },
          reason: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["target", "reason", "priority"],
      },
    },
  },
  required: [
    "case_summary",
    "requests",
    "claims",
    "risk_indicators",
    "verification_targets",
  ],
};
