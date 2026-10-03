import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Read .env.local into process.env
try {
  const envContent = fs.readFileSync(".env.local", "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...vals] = trimmed.split("=");
      process.env[key.trim()] = vals.join("=").trim();
    }
  });
} catch (e) {
  console.warn("Could not read .env.local:", e.message);
}

const { geminiResponseJsonSchema, JobShieldAnalysisSchema } = await import("../lib/schemas.ts");
const { JOBSHIELD_SYSTEM_PROMPT } = await import("../lib/prompts.ts");
const { checkGeminiHealth } = await import("../lib/geminiHealth.ts");

const apiKey = process.env.GEMINI_API_KEY || "";
const configuredModel = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
const ai = new GoogleGenAI({ apiKey });

// Helper to execute generation with automatic 429/503 retry and fallback
async function generateWithRetry(options) {
  const models = [configuredModel, "gemini-3.7-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"];
  for (const m of models) {
    try {
      const res = await ai.models.generateContent({
        ...options,
        model: m
      });
      return { res, model: m };
    } catch (err) {
      const msg = err.message || String(err);
      if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("429") || msg.includes("quota")) {
        console.warn(`[Retry] ${m} reported rate limit/quota/demand issue. Waiting 2s and trying fallback model...`);
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("All candidate models exhausted.");
}

console.log("==================================================");
console.log("       JOBSHIELD FULL E2E TEST VERIFICATION       ");
console.log("==================================================");

// 0. HEALTH CHECK
console.log("\n[HEALTH CHECK] Testing lib/geminiHealth.ts...");
const health = await checkGeminiHealth();
console.log("Health check result:", health);

// TEST A: TEXT ONLY
console.log("\n[TEST A] Testing Text Only...");
const promptText = 'Analyze this sentence and return JSON: "Please pay ₹2,999 before joining."';
const { res: resA, model: modelA } = await generateWithRetry({
  contents: promptText,
  config: { responseMimeType: "application/json" }
});
console.log(`TEST A Result (${modelA}):`, resA.text ? "PASS" : "FAIL");

await new Promise((r) => setTimeout(r, 2500));

// TEST B: TEXT + STRUCTURED JSON SCHEMA
console.log("\n[TEST B] Testing Text + responseJsonSchema...");
const { res: resB, model: modelB } = await generateWithRetry({
  contents: 'Analyze this recruitment offer text: "Position: Software Developer at ABC Technologies. Salary: 8.5 LPA. Pay 2999 fee."',
  config: {
    systemInstruction: JOBSHIELD_SYSTEM_PROMPT,
    responseMimeType: "application/json",
    responseJsonSchema: geminiResponseJsonSchema,
    temperature: 0.1
  }
});
const parsedB = JSON.parse(resB.text);
const valB = JobShieldAnalysisSchema.safeParse(parsedB);
console.log(`TEST B Result (${modelB}):`, valB.success ? "PASS" : "FAIL");

await new Promise((r) => setTimeout(r, 2500));

// TEST C: IMAGE ONLY
console.log("\n[TEST C] Testing Image Only...");
const imgBytes = fs.readFileSync("public/samples/whatsapp-screenshot.png");
const { res: resC, model: modelC } = await generateWithRetry({
  contents: [
    { text: "Analyze this recruitment chat screenshot evidence:" },
    { inlineData: { mimeType: "image/png", data: imgBytes.toString("base64") } }
  ],
  config: {
    systemInstruction: JOBSHIELD_SYSTEM_PROMPT,
    responseMimeType: "application/json",
    responseJsonSchema: geminiResponseJsonSchema,
    temperature: 0.1
  }
});
const parsedC = JSON.parse(resC.text);
const valC = JobShieldAnalysisSchema.safeParse(parsedC);
console.log(`TEST C Result (${modelC}):`, valC.success ? "PASS" : "FAIL");
if (valC.success) {
  console.log("  Extracted company:", valC.data.case_summary.company);
  console.log("  Extracted role:", valC.data.case_summary.job_title);
  console.log("  Payment requested:", valC.data.requests.payment_requested);
}

await new Promise((r) => setTimeout(r, 2500));

// TEST D: PDF ONLY
console.log("\n[TEST D] Testing PDF Only...");
const pdfBytes = fs.readFileSync("public/samples/fake-offer-letter.pdf");
const { res: resD, model: modelD } = await generateWithRetry({
  contents: [
    { text: "Analyze this employment offer letter PDF evidence:" },
    { inlineData: { mimeType: "application/pdf", data: pdfBytes.toString("base64") } }
  ],
  config: {
    systemInstruction: JOBSHIELD_SYSTEM_PROMPT,
    responseMimeType: "application/json",
    responseJsonSchema: geminiResponseJsonSchema,
    temperature: 0.1
  }
});
const parsedD = JSON.parse(resD.text);
const valD = JobShieldAnalysisSchema.safeParse(parsedD);
console.log(`TEST D Result (${modelD}):`, valD.success ? "PASS" : "FAIL");
if (valD.success) {
  console.log("  Extracted company:", valD.data.case_summary.company);
  console.log("  Extracted salary:", valD.data.case_summary.salary);
}

await new Promise((r) => setTimeout(r, 2500));

// TEST E: FULL DEMO MULTIMODAL CASE (PDF + Image + Message + URL)
console.log("\n[TEST E] Testing Full Demo Multimodal Case...");
const { res: resE, model: modelE } = await generateWithRetry({
  contents: [
    { text: "EVIDENCE CASE INTAKE:\n- Uploaded files: 2\n- Recruiter message: Provided\n- Job URL: Provided (https://abctechnologies-careers-portal.fakejobs.in/apply/software-developer)\n\nPlease analyze all items below together as evidence for a single recruitment case." },
    { text: "--- EVIDENCE ITEM: RECRUITER MESSAGE ---\n\"\"\"\nHi, I am Rahul Sharma from HR. You have been selected for Software Developer at ABC Technologies. Please pay ₹2,999 registration fee for equipment dispatch and laptop delivery. Send PAN, Aadhaar, and bank account details immediately.\n\"\"\"\n--- END OF RECRUITER MESSAGE ---" },
    { text: "--- EVIDENCE ITEM: JOB URL (Provided by user) ---\nURL: https://abctechnologies-careers-portal.fakejobs.in/apply/software-developer\n--- END OF JOB URL ---" },
    { text: "--- EVIDENCE ITEM: FILE [fake-offer-letter.pdf] ---" },
    { inlineData: { mimeType: "application/pdf", data: pdfBytes.toString("base64") } },
    { text: "--- EVIDENCE ITEM: FILE [whatsapp-screenshot.png] ---" },
    { inlineData: { mimeType: "image/png", data: imgBytes.toString("base64") } }
  ],
  config: {
    systemInstruction: JOBSHIELD_SYSTEM_PROMPT,
    responseMimeType: "application/json",
    responseJsonSchema: geminiResponseJsonSchema,
    temperature: 0.1
  }
});
const parsedE = JSON.parse(resE.text);
const valE = JobShieldAnalysisSchema.safeParse(parsedE);
console.log(`TEST E Result (${modelE}):`, valE.success ? "PASS" : "FAIL");
if (valE.success) {
  console.log("  Company:", valE.data.case_summary.company);
  console.log("  Role:", valE.data.case_summary.job_title);
  console.log("  Salary:", valE.data.case_summary.salary);
  console.log("  Payment Requested:", valE.data.requests.payment_requested);
  console.log("  Payment Amount:", valE.data.requests.payment_amount);
  console.log("  Sensitive Info:", valE.data.requests.sensitive_information_requested);
  console.log("  Risk indicators:", valE.data.risk_indicators.length);
  console.log("  Verification targets:", valE.data.verification_targets.length);
}
console.log("\n==================================================");
