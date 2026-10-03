import { JobShieldAnalysis } from "@/lib/schemas";
import { JobShieldIntelligence, CaseTimelineEvent } from "@/lib/intelligence/types";

export * from "@/lib/intelligence/types";

export type EvidenceType = "pdf" | "image" | "text" | "url";

export interface Evidence {
  id: string;
  type: EvidenceType;
  name: string;
  mimeType?: string;
  size?: number;
  text?: string;
  url?: string;
  file?: File | Blob;
  previewUrl?: string;
  createdAt?: string;
}

export type CaseStatus =
  | "draft"
  | "analyzing"
  | "analyzed"
  | "needs_verification";

export interface JobShieldFolder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
}

export interface JobShieldCase {
  id: string;
  folderId: string;

  title: string | null;
  company: string | null;

  recruiterMessage: string;
  jobUrl: string;

  evidence: Evidence[];

  analysis: JobShieldAnalysis | null;
  intelligence?: JobShieldIntelligence | null;
  timeline?: CaseTimelineEvent[];

  status: CaseStatus;

  completedVerificationTargets?: string[];

  createdAt: string;
  updatedAt: string;
  lastAnalyzedAt: string | null;
}

export type SortOrder = "recent" | "newest" | "oldest" | "risk";
