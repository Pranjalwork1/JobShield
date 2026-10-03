import {
  NormalizedCompany,
  NormalizedJob,
  NormalizedRecruiter,
  NormalizedRequests,
  NormalizedSalary,
  NormalizedFacts,
} from "./types";
import { CaseSummary, Requests } from "@/lib/schemas";

export const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "aol.com",
  "rediffmail.com",
  "mail.com",
  "gmx.com",
  "yandex.com",
]);

/**
 * Normalizes company names conservatively.
 * Strips common legal entity suffixes and punctuation without altering core brand names.
 */
export function normalizeCompany(
  raw: string | null | undefined,
  explicitDomain?: string | null
): NormalizedCompany {
  if (!raw || !raw.trim()) {
    return {
      name: null,
      normalizedName: null,
      domain: explicitDomain ? normalizeDomain(explicitDomain) : null,
    };
  }

  const name = raw.trim();

  // Strip legal suffixes conservatively (e.g. Pvt Ltd, Private Limited, Ltd, Inc, LLC)
  let cleaned = name.toLowerCase();

  // Remove common punctuation like commas, periods, quotes
  cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");

  // Normalise spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // We only strip legal entity suffixes (ltd, pvt ltd, inc, corp, llc), not core identifiers
  const strictLegalSuffixes = [
    /\bprivate limited$/i,
    /\bpvt ltd$/i,
    /\bpvt limited$/i,
    /\bprivate ltd$/i,
    /\blimited$/i,
    /\bltd$/i,
    /\bincorporated$/i,
    /\binc$/i,
    /\bcorporation$/i,
    /\bcorp$/i,
    /\bllc$/i,
    /\bgmbh$/i,
    /\bllp$/i,
    /\bplc$/i,
  ];

  let normalized = cleaned;
  for (const suffix of strictLegalSuffixes) {
    if (suffix.test(normalized)) {
      normalized = normalized.replace(suffix, "").trim();
      break;
    }
  }

  return {
    name,
    normalizedName: normalized || cleaned,
    domain: explicitDomain ? normalizeDomain(explicitDomain) : null,
  };
}

/**
 * Normalizes job title for case-insensitive comparisons without collapsing materially different roles.
 */
export function normalizeJobTitle(raw: string | null | undefined): {
  title: string | null;
  normalizedTitle: string | null;
} {
  if (!raw || !raw.trim()) {
    return { title: null, normalizedTitle: null };
  }

  const title = raw.trim();
  let normalized = title.toLowerCase();

  // Replace separators with spaces
  normalized = normalized.replace(/[\/|,–—\-]/g, " ");
  // Collapse whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();

  return {
    title,
    normalizedTitle: normalized,
  };
}

/**
 * Normalizes email address and extracts domain and public status.
 */
export function normalizeEmail(raw: string | null | undefined): {
  email: string | null;
  domain: string | null;
  isPublicDomain: boolean;
} {
  if (!raw || !raw.trim()) {
    return { email: null, domain: null, isPublicDomain: false };
  }

  const trimmed = raw.trim().toLowerCase();
  // Extract email address if embedded in "Name <email@domain>"
  const match = trimmed.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  const email = match ? match[0] : (trimmed.includes("@") ? trimmed : null);

  if (!email || !email.includes("@")) {
    return { email: raw.trim(), domain: null, isPublicDomain: false };
  }

  const parts = email.split("@");
  const domain = parts[parts.length - 1].trim().toLowerCase();
  const isPublicDomain = PUBLIC_EMAIL_DOMAINS.has(domain);

  return {
    email,
    domain,
    isPublicDomain,
  };
}

/**
 * Normalizes web domain names safely.
 */
export function normalizeDomain(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  let d = raw.trim().toLowerCase();
  // Strip protocol
  d = d.replace(/^https?:\/\//i, "");
  // Strip path and query
  d = d.split("/")[0].split("?")[0].split("#")[0];
  // Strip www.
  d = d.replace(/^www\./i, "");
  // Strip port
  d = d.split(":")[0];
  return d || null;
}

/**
 * Normalizes phone numbers to standard digit strings for comparison.
 */
export function normalizePhone(raw: string | null | undefined): {
  raw: string | null;
  normalized: string | null;
} {
  if (!raw || !raw.trim()) {
    return { raw: null, normalized: null };
  }

  const original = raw.trim();
  // Retain + if present at beginning, then keep only digits
  const hasPlus = original.startsWith("+");
  const digitsOnly = original.replace(/\D/g, "");

  if (!digitsOnly) {
    return { raw: original, normalized: null };
  }

  // Format standard: e.g. +919876543210 or 9876543210
  const normalized = hasPlus ? `+${digitsOnly}` : digitsOnly;

  return {
    raw: original,
    normalized,
  };
}

/**
 * Normalizes salary values from textual representations (e.g. "8.5 LPA", "₹8,50,000 per annum", "INR 850000/year").
 */
export function normalizeSalary(raw: string | null | undefined): NormalizedSalary {
  if (!raw || !raw.trim()) {
    return {
      raw: null,
      amount: null,
      currency: null,
      period: "unknown",
    };
  }

  const trimmed = raw.trim();
  let currency: string | null = null;
  let period: "annual" | "monthly" | "unknown" = "unknown";
  let amount: number | null = null;

  // Currency detection
  if (/₹|inr|rs\.?|rupees?/i.test(trimmed)) {
    currency = "INR";
  } else if (/\$|usd|dollars?/i.test(trimmed)) {
    currency = "USD";
  } else if (/€|eur|euros?/i.test(trimmed)) {
    currency = "EUR";
  } else if (/£|gbp|pounds?/i.test(trimmed)) {
    currency = "GBP";
  }

  // Period detection
  if (/per annum|p\.a\.?|\/year|annually|annual|lpa/i.test(trimmed)) {
    period = "annual";
  } else if (/per month|p\.m\.?|\/month|monthly/i.test(trimmed)) {
    period = "monthly";
  }

  // Value parsing: Handle "8.5 LPA" or "8.5 Lakhs"
  const lpaMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|lac|lacs?)/i);
  if (lpaMatch) {
    const val = parseFloat(lpaMatch[1]);
    if (!isNaN(val)) {
      amount = Math.round(val * 100000);
      period = "annual";
      currency = currency || "INR";
    }
  }

  // Handle formatted numbers e.g. "8,50,000" or "850,000" or "850000"
  if (amount === null) {
    const cleanNumbers = trimmed.replace(/,/g, "");
    const numMatch = cleanNumbers.match(/(?:₹|\$|€|£|inr|usd)?\s*(\d{4,9})/i);
    if (numMatch) {
      const parsed = parseInt(numMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
      }
    }
  }

  return {
    raw: trimmed,
    amount,
    currency,
    period,
  };
}

/**
 * Normalizes payment requests and extracts amount safely.
 */
export function normalizePaymentRequest(
  requested: boolean,
  amountRaw: string | null | undefined,
  observedText?: string | null
): {
  paymentRequested: boolean;
  paymentAmount: string | null;
  paymentPurpose: string | null;
} {
  let isRequested = requested;
  let amount = amountRaw?.trim() || null;
  let purpose: string | null = null;

  const combinedText = `${amountRaw || ""} ${observedText || ""}`;

  // If amount is null, attempt to extract explicit currency figures from text like "₹2,999" or "Rs. 2999"
  if (!amount && combinedText) {
    const amountMatch = combinedText.match(/(?:₹|rs\.?|inr|\$)\s*(\d{1,3}(?:,\d{3})*|\d+)/i);
    if (amountMatch) {
      amount = amountMatch[0].trim();
      isRequested = true;
    }
  }

  if (combinedText) {
    if (/registration/i.test(combinedText)) purpose = "registration";
    else if (/processing/i.test(combinedText)) purpose = "processing";
    else if (/training/i.test(combinedText)) purpose = "training";
    else if (/deposit|security/i.test(combinedText)) purpose = "deposit";
    else if (/verification|background/i.test(combinedText)) purpose = "verification";
    else if (/equipment|laptop/i.test(combinedText)) purpose = "equipment";
  }

  return {
    paymentRequested: isRequested,
    paymentAmount: amount,
    paymentPurpose: purpose,
  };
}

/**
 * Normalizes sensitive requests and distinguishes government identity vs financial credentials.
 */
export function normalizeSensitiveInformation(
  requestedItems: string[] | undefined,
  bankDetailsRequested: boolean,
  contextText?: string | null
): {
  sensitiveInformationRequested: string[];
  bankDetailsRequested: boolean;
  hasFinancialCredentials: boolean;
  hasIdentityDocuments: boolean;
} {
  const items = new Set<string>();
  (requestedItems || []).forEach((item) => {
    if (item && item.trim()) items.add(item.trim());
  });

  const fullText = `${Array.from(items).join(" ")} ${contextText || ""}`.toLowerCase();

  let bankRequested = bankDetailsRequested;
  let hasFinancial = bankRequested;
  let hasIdentity = false;

  // Identity documents check
  if (
    /pan|aadhaar|aadhar|passport|ssn|social security|voter id|driving licen/i.test(fullText)
  ) {
    hasIdentity = true;
    if (/pan\b/i.test(fullText) && !Array.from(items).some((i) => /pan/i.test(i))) {
      items.add("PAN");
    }
    if (/aadhaar|aadhar/i.test(fullText) && !Array.from(items).some((i) => /aadhaar|aadhar/i.test(i))) {
      items.add("Aadhaar");
    }
    if (/passport/i.test(fullText) && !Array.from(items).some((i) => /passport/i.test(i))) {
      items.add("Passport");
    }
  }

  // Financial credentials check
  if (
    /bank account|account number|ifsc|cheque|cancelled cheque|upi|upi pin|otp|credit card|debit card|cvv|password/i.test(
      fullText
    )
  ) {
    bankRequested = true;
    hasFinancial = true;
    if (/bank|cheque/i.test(fullText) && !Array.from(items).some((i) => /bank/i.test(i))) {
      items.add("Bank Details");
    }
  }

  return {
    sensitiveInformationRequested: Array.from(items),
    bankDetailsRequested: bankRequested,
    hasFinancialCredentials: hasFinancial,
    hasIdentityDocuments: hasIdentity,
  };
}

/**
 * Builds the unified NormalizedFacts object from case intake and Gemini P2 extraction.
 */
export function buildNormalizedFacts(
  caseData: {
    title?: string | null;
    company?: string | null;
    recruiterMessage?: string | null;
    jobUrl?: string | null;
  },
  p2Summary?: CaseSummary | null,
  p2Requests?: Requests | null
): NormalizedFacts {
  // Company
  const rawCompany = p2Summary?.company || caseData.company || null;
  let explicitDomain: string | null = null;
  if (caseData.jobUrl) {
    explicitDomain = normalizeDomain(caseData.jobUrl);
  }
  const company = normalizeCompany(rawCompany, explicitDomain);

  // Recruiter
  const recruiterName = p2Summary?.recruiter_name?.trim() || null;
  const emailNorm = normalizeEmail(p2Summary?.recruiter_email || null);
  const phoneNorm = normalizePhone(p2Summary?.phone || null);

  const recruiter: NormalizedRecruiter = {
    name: recruiterName,
    email: emailNorm.email,
    emailDomain: emailNorm.domain,
    phone: phoneNorm.raw,
  };

  // Job
  const rawTitle = p2Summary?.job_title || caseData.title || null;
  const titleNorm = normalizeJobTitle(rawTitle);
  const rawSalary = p2Summary?.salary || null;
  const salaryNorm = normalizeSalary(rawSalary);

  const job: NormalizedJob = {
    title: titleNorm.title,
    normalizedTitle: titleNorm.normalizedTitle,
    location: p2Summary?.location?.trim() || null,
    salary: rawSalary,
    normalizedSalary: salaryNorm,
  };

  // Requests
  const p2Payment = p2Requests?.payment_requested ?? false;
  const p2Amount = p2Requests?.payment_amount ?? null;
  const paymentNorm = normalizePaymentRequest(
    p2Payment,
    p2Amount,
    caseData.recruiterMessage
  );

  const sensitiveNorm = normalizeSensitiveInformation(
    p2Requests?.sensitive_information_requested || [],
    p2Requests?.bank_details_requested || false,
    caseData.recruiterMessage
  );

  const requests: NormalizedRequests = {
    paymentRequested: paymentNorm.paymentRequested,
    paymentAmount: paymentNorm.paymentAmount,
    sensitiveInformationRequested: sensitiveNorm.sensitiveInformationRequested,
    bankDetailsRequested: sensitiveNorm.bankDetailsRequested,
    otherRequests: p2Requests?.other_requests || [],
  };

  return {
    company,
    recruiter,
    job,
    requests,
  };
}
