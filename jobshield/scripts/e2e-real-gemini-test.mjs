import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { DEMO_CASE_MESSAGE, DEMO_CASE_URL } from "../lib/demoData.ts";
import { analyzeJobShieldIntelligence } from "../lib/intelligence/analyzeCase.ts";

console.log("==================================================");
console.log("   REAL GEMINI ANALYSIS END-TO-END VERIFICATION   ");
console.log("==================================================");

async function runRealGeminiE2ETest() {
  const pdfPath = path.resolve("./public/samples/fake-offer-letter.pdf");
  const pngPath = path.resolve("./public/samples/whatsapp-screenshot.png");

  assert.ok(fs.existsSync(pdfPath), "fake-offer-letter.pdf must exist");
  assert.ok(fs.existsSync(pngPath), "whatsapp-screenshot.png must exist");

  const pdfStats = fs.statSync(pdfPath);
  const pngStats = fs.statSync(pngPath);

  console.log(`[E2E 1] Input Evidence:`);
  console.log(`  - PDF file: fake-offer-letter.pdf (${pdfStats.size} bytes, application/pdf)`);
  console.log(`  - PNG file: whatsapp-screenshot.png (${pngStats.size} bytes, image/png)`);
  console.log(`  - Recruiter message: ${DEMO_CASE_MESSAGE.length} characters`);
  console.log(`  - Job URL: ${DEMO_CASE_URL}`);

  const formData = new FormData();
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pngBuffer = fs.readFileSync(pngPath);

  const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
  const pngBlob = new Blob([pngBuffer], { type: "image/png" });

  formData.append("files", pdfBlob, "fake-offer-letter.pdf");
  formData.append("files", pngBlob, "whatsapp-screenshot.png");
  formData.append("message", DEMO_CASE_MESSAGE);
  formData.append("url", DEMO_CASE_URL);

  console.log("\n[E2E 2] Sending POST to http://localhost:3000/api/analyze...");
  const startTime = Date.now();

  const response = await fetch("http://localhost:3000/api/analyze", {
    method: "POST",
    body: formData,
  });

  const durationMs = Date.now() - startTime;
  console.log(`  - HTTP Status: ${response.status} ${response.statusText}`);
  console.log(`  - Duration: ${(durationMs / 1000).toFixed(1)}s`);

  const responseBody = await response.json();

  if (!response.ok) {
    console.error("  ✕ Gemini API Call Failed!");
    console.error("  - Error Details:", JSON.stringify(responseBody, null, 2));
    process.exit(1);
  }

  assert.equal(response.status, 200);
  assert.equal(responseBody.success, true);
  assert.ok(responseBody.analysis, "Analysis object must be present in response");

  const analysis = responseBody.analysis;

  console.log("\n[E2E 3] P2 Gemini Analysis Output Verified:");
  console.log(`  - Company: "${analysis.case_summary?.company}"`);
  console.log(`  - Job Title: "${analysis.case_summary?.job_title}"`);
  console.log(`  - Recruiter: "${analysis.case_summary?.recruiter_name}"`);
  console.log(`  - Email: "${analysis.case_summary?.recruiter_email}"`);
  console.log(`  - Salary: "${analysis.case_summary?.salary}"`);
  console.log(`  - Payment Detected: ${analysis.payment_detected}`);
  console.log(`  - Payment Amount: "${analysis.payment_amount}"`);
  console.log(`  - Sensitive Info:`, analysis.sensitive_information_requested);
  console.log(`  - Indicators Count: ${analysis.risk_indicators?.length || 0}`);
  console.log(`  - Targets Count: ${analysis.verification_targets?.length || 0}`);

  console.log("\n[E2E 4] P3 Deterministic Intelligence Engine Derivation:");
  const mockCase = {
    id: "case_e2e_demo",
    folderId: "folder_default",
    title: analysis.case_summary?.job_title || "Software Developer",
    company: analysis.case_summary?.company || "ABC Technologies",
    recruiterMessage: DEMO_CASE_MESSAGE,
    jobUrl: DEMO_CASE_URL,
    evidence: [
      { id: "e1", type: "pdf", name: "fake-offer-letter.pdf" },
      { id: "e2", type: "image", name: "whatsapp-screenshot.png" },
    ],
    analysis,
    intelligence: null,
    timeline: [],
    status: "analyzing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastAnalyzedAt: null,
  };

  const intelligence = responseBody.intelligence || analyzeJobShieldIntelligence(mockCase, analysis);

  console.log(`  - Total P3 Findings: ${intelligence.summary.totalFindings}`);
  console.log(`  - High Severity Findings: ${intelligence.summary.highSeverityCount}`);
  console.log(`  - Medium Severity Findings: ${intelligence.summary.mediumSeverityCount}`);
  console.log(`  - Low Severity Findings: ${intelligence.summary.lowSeverityCount}`);
  console.log(`  - Contradictions: ${intelligence.summary.contradictionCount}`);
  console.log(`  - Verification Targets: ${intelligence.verificationTargets.length}`);

  intelligence.findings.forEach((f, idx) => {
    console.log(`    Finding [${idx + 1}] [${f.severity.toUpperCase()}]: ${f.title}`);
  });

  if (intelligence.contradictions.length > 0) {
    intelligence.contradictions.forEach((c, idx) => {
      console.log(`    Contradiction [${idx + 1}]: ${c.field} - ${c.title}: ${c.explanation}`);
    });
  }

  assert.ok(intelligence.findings.length > 0, "P3 findings must be generated");
  assert.ok(intelligence.verificationTargets.length > 0, "Verification targets must be generated");

  console.log("\n==================================================");
  console.log("✓ REAL GEMINI MULTIMODAL E2E VERIFICATION SUCCEEDED!");
  console.log("==================================================");
}

runRealGeminiE2ETest().catch((err) => {
  console.error("FATAL ERROR in runRealGeminiE2ETest:", err);
  process.exit(1);
});
