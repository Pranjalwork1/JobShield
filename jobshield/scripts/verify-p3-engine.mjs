import {
  normalizeCompany,
  normalizeJobTitle,
  normalizeEmail,
  normalizePhone,
  normalizeSalary,
  normalizePaymentRequest,
  normalizeSensitiveInformation,
  buildNormalizedFacts,
} from "../lib/intelligence/normalize.ts";

import { indexCaseEvidence } from "../lib/intelligence/evidence.ts";
import { evaluateRules, deduplicateFindings } from "../lib/intelligence/rules.ts";
import { detectContradictions } from "../lib/intelligence/contradictions.ts";
import { generateVerificationTargets } from "../lib/intelligence/verification.ts";
import { analyzeJobShieldIntelligence } from "../lib/intelligence/analyzeCase.ts";

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("==================================================");
console.log("   JOBSHIELD P3 INTELLIGENCE ENGINE UNIT TESTS    ");
console.log("==================================================");

// 1. COMPANY NORMALIZATION
console.log("\n[TEST 1] Testing normalizeCompany...");
const comp1 = normalizeCompany("ABC Technologies Pvt. Ltd.");
assert(comp1.normalizedName === "abc technologies", "Strips Pvt. Ltd. correctly");
assert(comp1.name === "ABC Technologies Pvt. Ltd.", "Preserves original company name");

const comp2 = normalizeCompany("XYZ Solutions Private Limited");
assert(comp2.normalizedName === "xyz solutions", "Strips Private Limited correctly");

const comp3 = normalizeCompany(null);
assert(comp3.name === null && comp3.normalizedName === null, "Handles null gracefully");

// 2. JOB TITLE NORMALIZATION
console.log("\n[TEST 2] Testing normalizeJobTitle...");
const role1 = normalizeJobTitle("Software Developer");
assert(role1.normalizedTitle === "software developer", "Lowercases and normalizes role");
assert(role1.title === "Software Developer", "Preserves original title");

const role2 = normalizeJobTitle("Software Developer - Backend");
assert(role2.normalizedTitle === "software developer backend", "Normalizes hyphens");

// 3. EMAIL NORMALIZATION
console.log("\n[TEST 3] Testing normalizeEmail...");
const email1 = normalizeEmail("rahul@gmail.com");
assert(email1.domain === "gmail.com", "Extracts gmail.com domain");
assert(email1.isPublicDomain === true, "Flags gmail.com as public domain");

const email2 = normalizeEmail("Rahul Sharma <hr@abctechnologies.com>");
assert(email2.domain === "abctechnologies.com", "Extracts corporate domain from display format");
assert(email2.isPublicDomain === false, "Corporate domain is not public");

// 4. PHONE NORMALIZATION
console.log("\n[TEST 4] Testing normalizePhone...");
const phone1 = normalizePhone("+91 98765 43210");
assert(phone1.normalized === "+919876543210", "Normalizes +91 international phone");

const phone2 = normalizePhone("98765-43210");
assert(phone2.normalized === "9876543210", "Strips non-digits from national phone");

// 5. SALARY NORMALIZATION
console.log("\n[TEST 5] Testing normalizeSalary...");
const sal1 = normalizeSalary("8.5 LPA");
assert(sal1.amount === 850000, "Parses 8.5 LPA as 850,000");
assert(sal1.currency === "INR", "Detects INR currency for LPA");
assert(sal1.period === "annual", "Detects annual period for LPA");

const sal2 = normalizeSalary("₹12,00,000 per annum");
assert(sal2.amount === 1200000, "Parses ₹12,00,000 as 1,200,000");

const sal3 = normalizeSalary("INR 850000/year");
assert(sal3.amount === 850000, "Parses INR 850000/year");

// 6. PAYMENT REQUEST EXTRACTION
console.log("\n[TEST 6] Testing normalizePaymentRequest...");
const pay1 = normalizePaymentRequest(true, "₹2,999", "Please pay ₹2,999 registration fee.");
assert(pay1.paymentRequested === true, "Identifies payment requested flag");
assert(pay1.paymentAmount === "₹2,999", "Preserves exact payment amount");
assert(pay1.paymentPurpose === "registration", "Detects registration purpose");

// 7. SENSITIVE DATA EXTRACTION
console.log("\n[TEST 7] Testing normalizeSensitiveInformation...");
const sens1 = normalizeSensitiveInformation(
  ["PAN", "Aadhaar"],
  true,
  "Send your PAN and Aadhaar and cancelled cheque for bank details."
);
assert(sens1.sensitiveInformationRequested.includes("PAN"), "Extracts PAN");
assert(sens1.sensitiveInformationRequested.includes("Aadhaar"), "Extracts Aadhaar");
assert(sens1.bankDetailsRequested === true, "Flags bank details requested");
assert(sens1.hasFinancialCredentials === true, "Flags financial credentials");
assert(sens1.hasIdentityDocuments === true, "Flags identity documents");

// 8. SECTION 56 REQUIRED TEST CASE
console.log("\n[TEST 8] Testing Section 56 Required Test Case...");
const sec56Message = `Congratulations!
You have been selected.
Please pay ₹2,999 registration fee.
Send PAN and Aadhaar for onboarding.`;

const sec56Summary = {
  company: "ABC Technologies",
  job_title: "Software Developer",
  recruiter_name: "Rahul Sharma",
  recruiter_email: "abc.recruitment@gmail.com",
  phone: null,
  salary: "₹8.5 LPA",
  location: "Bengaluru",
};

const sec56Requests = {
  payment_requested: true,
  payment_amount: "₹2,999",
  sensitive_information_requested: ["PAN", "Aadhaar"],
  bank_details_requested: false,
  other_requests: [],
};

const sec56Facts = buildNormalizedFacts(
  {
    title: "Software Developer",
    company: "ABC Technologies",
    recruiterMessage: sec56Message,
    jobUrl: "https://abc-technologies.fakejobs.in",
  },
  sec56Summary,
  sec56Requests
);

assert(sec56Facts.company.name === "ABC Technologies", "Normalized facts company name is correct");
assert(sec56Facts.job.title === "Software Developer", "Normalized facts job title is correct");
assert(sec56Facts.recruiter.name === "Rahul Sharma", "Normalized facts recruiter name is correct");
assert(sec56Facts.recruiter.email === "abc.recruitment@gmail.com", "Normalized facts email is correct");
assert(sec56Facts.requests.paymentRequested === true, "Payment requested is true");
assert(sec56Facts.requests.paymentAmount === "₹2,999", "Payment amount is ₹2,999");
assert(sec56Facts.requests.sensitiveInformationRequested.includes("PAN"), "Includes PAN");
assert(sec56Facts.requests.sensitiveInformationRequested.includes("Aadhaar"), "Includes Aadhaar");

// 9. SECTION 57 EXPECTED FINDINGS
console.log("\n[TEST 9] Testing Section 57 Expected Findings...");
const sec56Evidence = [
  { id: "msg_1", type: "text", name: "Recruiter Message", text: sec56Message },
  { id: "url_1", type: "url", name: "Job URL", url: "https://abc-technologies.fakejobs.in" },
];
const evIndex = indexCaseEvidence(sec56Evidence, sec56Message, "https://abc-technologies.fakejobs.in");
const findings = evaluateRules({
  facts: sec56Facts,
  index: evIndex,
  rawMessage: sec56Message,
  jobUrl: "https://abc-technologies.fakejobs.in",
});

const payFinding = findings.find((f) => f.ruleId === "PAYMENT_REQUEST");
assert(payFinding !== undefined, "Found PAYMENT_REQUEST finding");
assert(payFinding.severity === "high", "Payment finding severity is HIGH");
assert(payFinding.title === "Candidate payment requested", "Payment finding title matches");
assert(payFinding.evidence.length > 0, "Payment finding has traceable evidence reference");

const sensFinding = findings.find((f) => f.ruleId === "SENSITIVE_DATA_REQUEST");
assert(sensFinding !== undefined, "Found SENSITIVE_DATA_REQUEST finding");
assert(sensFinding.severity === "medium" || sensFinding.severity === "high", "Sensitive data severity is MEDIUM or HIGH");
assert(sensFinding.evidence.length > 0, "Sensitive finding has traceable evidence reference");

const emailFinding = findings.find((f) => f.ruleId === "PUBLIC_RECRUITER_EMAIL");
assert(emailFinding !== undefined, "Found PUBLIC_RECRUITER_EMAIL finding");
assert(emailFinding.severity === "medium", "Public email domain severity is MEDIUM");

// 10. SECTION 58 SALARY CONTRADICTION TEST
console.log("\n[TEST 10] Testing Section 58 Salary Contradiction...");
const multiEvidenceIndex = {
  items: [
    { evidenceId: "pdf_1", evidenceName: "fake-offer-letter.pdf", evidenceType: "pdf", description: "Offer letter" },
    { evidenceId: "msg_1", evidenceName: "Recruiter Message", evidenceType: "text", description: "Recruiter text" },
  ],
  hasPdf: true,
  hasImage: false,
  hasMessage: true,
  hasUrl: false,
  primaryItem: { evidenceId: "pdf_1", evidenceName: "fake-offer-letter.pdf", evidenceType: "pdf", description: "Offer letter" },
};

const salaryContradictions = detectContradictions({
  analysis: {
    case_summary: {
      company: "ABC Technologies",
      job_title: "Software Developer",
      recruiter_name: "Rahul Sharma",
      recruiter_email: "abc.recruitment@gmail.com",
      phone: null,
      salary: "₹8.5 LPA",
      location: "Bengaluru",
    },
    requests: sec56Requests,
    claims: [],
    risk_indicators: [],
    verification_targets: [],
  },
  evidenceIndex: multiEvidenceIndex,
  recruiterMessage: "Your starting salary will be ₹12,00,000 per annum (12 LPA).",
  caseTitle: "Software Developer",
  caseCompany: "ABC Technologies",
});

assert(salaryContradictions.length === 1, "Exactly one salary contradiction detected");
assert(salaryContradictions[0].field === "salary", "Contradiction field is salary");
assert(salaryContradictions[0].values.length === 2, "Contradiction contains two opposing values");
assert(salaryContradictions[0].values[0].value.includes("12") || salaryContradictions[0].values[1].value.includes("12"), "Contains ₹12 LPA");
assert(salaryContradictions[0].values[0].value.includes("8.5") || salaryContradictions[0].values[1].value.includes("8.5"), "Contains ₹8.5 LPA");

// 11. SECTION 59 COMPANY CONTRADICTION TEST
console.log("\n[TEST 11] Testing Section 59 Company Contradiction...");
const companyContradictions = detectContradictions({
  analysis: {
    case_summary: {
      company: "ABC Technologies",
      job_title: "Software Developer",
      recruiter_name: "Rahul Sharma",
      recruiter_email: null,
      phone: null,
      salary: null,
      location: null,
    },
    requests: sec56Requests,
    claims: [
      {
        claim: "XYZ Solutions is the hiring organization",
        evidence_reference: "recruiter-message.txt",
        confidence: "high",
      },
    ],
    risk_indicators: [],
    verification_targets: [],
  },
  evidenceIndex: {
    items: [
      { evidenceId: "pdf_1", evidenceName: "offer-letter.pdf", evidenceType: "pdf", description: "Offer letter" },
      { evidenceId: "msg_1", evidenceName: "recruiter-message.txt", evidenceType: "text", description: "Recruiter message" },
    ],
    hasPdf: true,
    hasImage: false,
    hasMessage: true,
    hasUrl: false,
    primaryItem: { evidenceId: "pdf_1", evidenceName: "offer-letter.pdf", evidenceType: "pdf", description: "Offer letter" },
  },
  recruiterMessage: "Welcome to XYZ Solutions.",
  caseTitle: "Software Developer",
  caseCompany: "ABC Technologies",
});

assert(companyContradictions.some((c) => c.field === "company"), "Company identity contradiction detected");

// 12. SECTION 92 NO FALSE POSITIVES FROM MISSING DATA
console.log("\n[TEST 12] Testing Missing Data is NOT a Contradiction (Section 92)...");
const missingDataContradictions = detectContradictions({
  analysis: {
    case_summary: {
      company: "ABC Technologies",
      job_title: "Software Developer",
      recruiter_name: null,
      recruiter_email: null,
      phone: null,
      salary: "₹8.5 LPA",
      location: null,
    },
    requests: sec56Requests,
    claims: [],
    risk_indicators: [],
    verification_targets: [],
  },
  evidenceIndex: multiEvidenceIndex,
  recruiterMessage: "Please reply with your confirmation.", // No salary mentioned in message
  caseTitle: "Software Developer",
  caseCompany: "ABC Technologies",
});

assert(
  !missingDataContradictions.some((c) => c.field === "salary"),
  "Missing salary in second evidence item does NOT trigger false contradiction"
);

// 13. SECTION 93 CONSERVATIVE COMPARISON
console.log("\n[TEST 13] Testing Conservative Comparison (Section 93)...");
const compA = normalizeCompany("ABC Technologies Pvt Ltd");
const compB = normalizeCompany("ABC Technologies");
assert(
  compA.normalizedName === compB.normalizedName,
  "ABC Technologies Pvt Ltd and ABC Technologies normalize identically, preventing false contradiction"
);

// 14. DEDUPLICATION TEST
console.log("\n[TEST 14] Testing Deduplication with Gemini P2 Indicators...");
const p2Indicators = [
  {
    indicator: "Payment requested",
    severity: "high",
    evidence_reference: "Recruiter message",
    observed_evidence: "Please pay ₹2,999 registration fee.",
    explanation: "Candidate payment request observed in message.",
  },
  {
    indicator: "Urgent 24h deadline",
    severity: "medium",
    evidence_reference: "Recruiter message",
    observed_evidence: "Failure to complete payment within 24 hours will result in offer cancellation.",
    explanation: "Artificial urgency pressure applied.",
  },
];

const deduplicated = deduplicateFindings(findings, p2Indicators, evIndex);
const paymentFindingsCount = deduplicated.filter((f) => f.ruleId === "PAYMENT_REQUEST" || f.title.toLowerCase().includes("payment")).length;
assert(paymentFindingsCount === 1, "Payment findings are merged without duplicates");
assert(deduplicated.some((f) => f.title.includes("Urgent") || f.summary.includes("urgency")), "Unique P2 indicator preserved as finding");

// 15. VERIFICATION TARGETS GENERATION
console.log("\n[TEST 15] Testing Verification Targets Generation...");
const vTargets = generateVerificationTargets({
  facts: sec56Facts,
  findings: deduplicated,
  contradictions: salaryContradictions,
});

assert(vTargets.some((t) => t.title.toLowerCase().includes("payment")), "Generated payment verification target");
assert(vTargets.some((t) => t.title.toLowerCase().includes("identity") || t.title.toLowerCase().includes("document")), "Generated identity verification target");
assert(vTargets.some((t) => t.title.toLowerCase().includes("employer")), "Generated employer identity verification target");
assert(vTargets.some((t) => t.title.toLowerCase().includes("compensation") || t.title.toLowerCase().includes("salary")), "Generated salary clarification target");
assert(vTargets.every((t) => t.status === "not_started"), "All targets start as not_started (Section 34)");

// 16. CASE ISOLATION TEST (Section 60)
console.log("\n[TEST 16] Testing Case Isolation (Section 60)...");
const caseA = {
  id: "case_A",
  title: "Software Developer",
  company: "ABC Technologies",
  recruiterMessage: "Pay ₹2,999 registration fee.",
  jobUrl: "",
  evidence: [{ id: "ev_1", type: "text", name: "Recruiter message" }],
};

const analysisA = {
  case_summary: { company: "ABC Technologies", job_title: "Software Developer", recruiter_name: null, recruiter_email: null, phone: null, salary: null, location: null },
  requests: { payment_requested: true, payment_amount: "₹2,999", sensitive_information_requested: [], bank_details_requested: false, other_requests: [] },
  claims: [],
  risk_indicators: [],
  verification_targets: [],
};

const caseB = {
  id: "case_B",
  title: "Research Engineer",
  company: "XYZ Labs",
  recruiterMessage: "We are pleased to invite you for interview.",
  jobUrl: "",
  evidence: [{ id: "ev_2", type: "text", name: "Recruiter message" }],
};

const analysisB = {
  case_summary: { company: "XYZ Labs", job_title: "Research Engineer", recruiter_name: null, recruiter_email: null, phone: null, salary: null, location: null },
  requests: { payment_requested: false, payment_amount: null, sensitive_information_requested: [], bank_details_requested: false, other_requests: [] },
  claims: [],
  risk_indicators: [],
  verification_targets: [],
};

const intelA = analyzeJobShieldIntelligence(caseA, analysisA);
const intelB = analyzeJobShieldIntelligence(caseB, analysisB);

assert(intelA.findings.some((f) => f.ruleId === "PAYMENT_REQUEST"), "Case A has payment finding");
assert(!intelB.findings.some((f) => f.ruleId === "PAYMENT_REQUEST"), "Case B has NO payment finding");
assert(intelA.normalizedFacts.company.name === "ABC Technologies", "Case A has ABC Technologies");
assert(intelB.normalizedFacts.company.name === "XYZ Labs", "Case B has XYZ Labs");

// 17. DETERMINISM TEST (Section 36)
console.log("\n[TEST 17] Testing Determinism (Section 36)...");
const run1 = analyzeJobShieldIntelligence(caseA, analysisA);
const run2 = analyzeJobShieldIntelligence(caseA, analysisA);
assert(run1.findings.length === run2.findings.length, "Run 1 and Run 2 findings length match");
assert(run1.findings[0].title === run2.findings[0].title, "Run 1 and Run 2 finding titles match exactly");

// 18. EMPTY DATA HANDLING (Section 62)
console.log("\n[TEST 18] Testing Empty Data Handling (Section 62)...");
const emptyCase = {
  id: "case_empty",
  title: null,
  company: null,
  recruiterMessage: "",
  jobUrl: "",
  evidence: [{ id: "ev_x", type: "text", name: "General note" }],
};
const emptyAnalysis = {
  case_summary: { company: null, job_title: null, recruiter_name: null, recruiter_email: null, phone: null, salary: null, location: null },
  requests: { payment_requested: false, payment_amount: null, sensitive_information_requested: [], bank_details_requested: false, other_requests: [] },
  claims: [],
  risk_indicators: [],
  verification_targets: [],
};
const emptyIntel = analyzeJobShieldIntelligence(emptyCase, emptyAnalysis);
assert(emptyIntel.normalizedFacts.company.name === null, "Does not invent company when null");
assert(emptyIntel.normalizedFacts.job.title === null, "Does not invent job title when null");

console.log("\n==================================================");
console.log(`✓ ALL TESTS PASSED: ${passedTests} / ${totalTests}`);
console.log("==================================================");
