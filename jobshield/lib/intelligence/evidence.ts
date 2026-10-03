import { Evidence } from "@/types/jobshield";
import { EvidenceReference } from "./types";

export interface CaseEvidenceIndex {
  items: EvidenceReference[];
  hasPdf: boolean;
  hasImage: boolean;
  hasMessage: boolean;
  hasUrl: boolean;
  primaryItem: EvidenceReference | null;
}

/**
 * Builds an index of all evidence items associated with a case.
 */
export function indexCaseEvidence(
  evidenceList: Evidence[],
  recruiterMessage?: string | null,
  jobUrl?: string | null
): CaseEvidenceIndex {
  const refs: EvidenceReference[] = [];

  // 1. Files
  (evidenceList || []).forEach((item) => {
    let evType: "pdf" | "image" | "text" | "url" = "text";
    if (item.type === "pdf") evType = "pdf";
    else if (item.type === "image") evType = "image";
    else if (item.type === "url") evType = "url";

    refs.push({
      evidenceId: item.id,
      evidenceName: item.name || "Evidence Document",
      evidenceType: evType,
      description: `Uploaded ${item.type.toUpperCase()} file: ${item.name}`,
    });
  });

  // 2. Recruiter message
  if (recruiterMessage && recruiterMessage.trim()) {
    refs.push({
      evidenceId: "recruiter_message_evidence",
      evidenceName: "Recruiter Message",
      evidenceType: "text",
      description: "Recruiter message / email text submitted in case",
    });
  }

  // 3. Job URL
  if (jobUrl && jobUrl.trim()) {
    refs.push({
      evidenceId: "job_url_evidence",
      evidenceName: "Job URL",
      evidenceType: "url",
      description: `Job portal URL provided by user: ${jobUrl.trim()}`,
    });
  }

  return {
    items: refs,
    hasPdf: refs.some((r) => r.evidenceType === "pdf"),
    hasImage: refs.some((r) => r.evidenceType === "image"),
    hasMessage: !!recruiterMessage?.trim(),
    hasUrl: !!jobUrl?.trim(),
    primaryItem: refs.length > 0 ? refs[0] : null,
  };
}

/**
 * Resolves one or more candidate reference strings (from Gemini or rules) to indexed EvidenceReferences.
 */
export function resolveEvidenceReferences(
  candidateRef: string | undefined | null,
  index: CaseEvidenceIndex
): EvidenceReference[] {
  if (index.items.length === 0) {
    return [
      {
        evidenceId: "generic_evidence",
        evidenceName: "Submitted Evidence",
        evidenceType: "text",
        description: "Case intake evidence provided by user",
      },
    ];
  }

  if (!candidateRef || !candidateRef.trim()) {
    // Return primary item
    return [index.primaryItem || index.items[0]];
  }

  const query = candidateRef.toLowerCase();

  // Try matching against evidence names or types
  const matched = index.items.filter((item) => {
    const nameMatch = item.evidenceName.toLowerCase().includes(query) || query.includes(item.evidenceName.toLowerCase());
    const typeMatch = query.includes(item.evidenceType);
    const messageMatch = (query.includes("message") || query.includes("email") || query.includes("chat")) && item.evidenceType === "text";
    const urlMatch = query.includes("url") && item.evidenceType === "url";
    const pdfMatch = query.includes("pdf") && item.evidenceType === "pdf";
    const imgMatch = (query.includes("image") || query.includes("screenshot") || query.includes("photo")) && item.evidenceType === "image";

    return nameMatch || typeMatch || messageMatch || urlMatch || pdfMatch || imgMatch;
  });

  if (matched.length > 0) {
    return matched;
  }

  // Fallback to first available evidence item
  return [index.primaryItem || index.items[0]];
}
