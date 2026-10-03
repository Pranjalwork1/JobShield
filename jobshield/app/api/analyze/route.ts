import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, getGeminiModel } from "@/lib/gemini";
import { JOBSHIELD_SYSTEM_PROMPT } from "@/lib/prompts";
import {
  JobShieldAnalysisSchema,
  geminiResponseJsonSchema,
} from "@/lib/schemas";
import { analyzeJobShieldIntelligence } from "@/lib/intelligence";
import { Evidence } from "@/types/jobshield";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES_COUNT = 5;

export const runtime = "nodejs";
export const maxDuration = 60; // Up to 60s for multimodal document processing

const isDebug =
  process.env.JOBSHIELD_DEBUG === "true" ||
  process.env.NEXT_PUBLIC_JOBSHIELD_DEBUG === "true";

export async function POST(req: NextRequest) {
  const model = getGeminiModel();
  let validFilesCount = 0;
  const mimeTypes: string[] = [];

  try {
    // 1. Verify Gemini API Key configuration
    let ai;
    try {
      ai = getGeminiClient();
    } catch (configError: unknown) {
      const configMsg =
        configError instanceof Error
          ? configError.message
          : "Gemini API key is not configured.";
      console.error("[JobShield API] Configuration error: Missing API Key -", configMsg);
      return NextResponse.json(
        {
          success: false,
          code: "MISSING_API_KEY",
          error: "The Gemini API key is missing. Please set GEMINI_API_KEY in .env.local.",
        },
        { status: 500 }
      );
    }

    // 2. Parse Multipart FormData
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (parseErr) {
      console.error("[JobShield API] FormData parsing failed:", parseErr);
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_REQUEST_BODY",
          error: "Could not parse multipart form data from request.",
        },
        { status: 400 }
      );
    }

    const files = formData.getAll("files") as File[];
    const message = formData.get("message")?.toString()?.trim() || "";
    const url = formData.get("url")?.toString()?.trim() || "";

    // 3. Validation: Case must contain at least one piece of evidence
    const hasFiles = files.length > 0 && files.some((f) => f.size > 0);
    const hasMessage = message.length > 0;
    const hasUrl = url.length > 0;

    if (!hasFiles && !hasMessage && !hasUrl) {
      return NextResponse.json(
        {
          success: false,
          code: "NO_EVIDENCE_PROVIDED",
          error:
            "No recruitment evidence provided. Please upload at least one file, enter a recruiter message, or provide a job URL.",
        },
        { status: 400 }
      );
    }

    // 4. Validate file constraints
    if (files.length > MAX_FILES_COUNT) {
      return NextResponse.json(
        {
          success: false,
          code: "TOO_MANY_FILES",
          error: `Too many files uploaded. Maximum allowed is ${MAX_FILES_COUNT} files per case.`,
        },
        { status: 400 }
      );
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!file || file.size === 0) {
        continue;
      }

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            success: false,
            code: "UNSUPPORTED_FILE_TYPE",
            error: `Unsupported file type for "${file.name}" (${file.type || "unknown"}). Allowed types are PDF, PNG, JPG, and WEBP.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        return NextResponse.json(
          {
            success: false,
            code: "FILE_TOO_LARGE",
            error: `File "${file.name}" exceeds the 10 MB limit (${sizeMb} MB). Please upload a smaller file.`,
          },
          { status: 400 }
        );
      }

      validFiles.push(file);
      mimeTypes.push(file.type);
    }
    validFilesCount = validFiles.length;

    // 5. Build Gemini Multimodal Contents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contents: any[] = [];

    // Header context part
    let evidenceSummary = `EVIDENCE CASE INTAKE:\n`;
    evidenceSummary += `- Uploaded files: ${validFilesCount}\n`;
    evidenceSummary += `- Recruiter message text: ${hasMessage ? "Provided" : "None"}\n`;
    evidenceSummary += `- Job URL: ${hasUrl ? "Provided (" + url + ")" : "None"}\n\n`;
    evidenceSummary += `Please analyze all items below together as evidence for a single recruitment case.`;
    contents.push({ text: evidenceSummary });

    if (hasMessage) {
      contents.push({
        text: `--- EVIDENCE ITEM: RECRUITER MESSAGE ---\n"""\n${message}\n"""\n--- END OF RECRUITER MESSAGE ---`,
      });
    }

    if (hasUrl) {
      contents.push({
        text: `--- EVIDENCE ITEM: JOB URL (Provided by user) ---\nURL: ${url}\nNote: This URL was provided by the user as part of the recruitment interaction.\n--- END OF JOB URL ---`,
      });
    }

    for (const file of validFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        contents.push({
          text: `--- EVIDENCE ITEM: FILE [${file.name}] (MIME: ${file.type}, Size: ${file.size} bytes) ---`,
        });

        contents.push({
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        });
      } catch (fileErr) {
        console.error(`[JobShield API] Failed to serialize file "${file.name}":`, fileErr);
        return NextResponse.json(
          {
            success: false,
            code: "FILE_READ_ERROR",
            error: `Failed to read uploaded file "${file.name}". Please re-upload and try again.`,
          },
          { status: 400 }
        );
      }
    }

    // Diagnostic safe log
    if (isDebug) {
      console.log(
        `[JobShield API] Submitting case: model=${model}, files=${validFilesCount}, mimeTypes=${mimeTypes.join(",")}, hasMessage=${hasMessage}, hasUrl=${hasUrl}`
      );
    }

    // 6. Call Gemini API Server-Side with fallback on 429/503/404
    const candidateModels = Array.from(
      new Set([model, "gemini-3.7-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"])
    );
    let response;
    let usedModel = model;

    for (let i = 0; i < candidateModels.length; i++) {
      const currentCandidate = candidateModels[i];
      try {
        if (isDebug) {
          console.log(`[JobShield API] Invoking Gemini model: ${currentCandidate}`);
        }
        response = await ai.models.generateContent({
          model: currentCandidate,
          contents,
          config: {
            systemInstruction: JOBSHIELD_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseJsonSchema: geminiResponseJsonSchema,
            temperature: 0.1,
          },
        });
        usedModel = currentCandidate;
        break;
      } catch (candidateErr: unknown) {
        const errStr = candidateErr instanceof Error ? candidateErr.message : String(candidateErr);
        console.warn(`[JobShield API] Model ${currentCandidate} encountered issue: ${errStr.slice(0, 120)}`);

        const isQuotaOrAvailability =
          errStr.includes("429") ||
          errStr.includes("quota") ||
          errStr.includes("503") ||
          errStr.includes("UNAVAILABLE") ||
          errStr.includes("404");

        if (!isQuotaOrAvailability || i === candidateModels.length - 1) {
          throw candidateErr;
        }
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!response) {
      throw new Error("Failed to receive a valid response from Gemini candidate models.");
    }

    const responseText = response.text;
    if (!responseText) {
      console.error(`[JobShield API] Empty Gemini response text: model=${model}`);
      return NextResponse.json(
        {
          success: false,
          code: "EMPTY_GEMINI_RESPONSE",
          error:
            "JobShield received an empty analysis response from the AI engine. Please verify the evidence and try again.",
        },
        { status: 502 }
      );
    }

    // 7. Parse and Validate with Zod
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (jsonErr) {
      console.error(`[JobShield API] JSON parse failure: model=${model}`, jsonErr);
      return NextResponse.json(
        {
          success: false,
          code: "MALFORMED_JSON",
          error:
            "JobShield received a non-JSON response from the analysis model. Please try again.",
          ...(isDebug ? { details: String(jsonErr) } : {}),
        },
        { status: 502 }
      );
    }

    const validationResult = JobShieldAnalysisSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      console.error(
        `[JobShield API] Zod validation failure: model=${model}, issues=`,
        validationResult.error.flatten()
      );
      return NextResponse.json(
        {
          success: false,
          code: "SCHEMA_VALIDATION_FAILURE",
          error:
            "Analysis response failed schema validation. Your evidence could not be reliably structured. Please try again.",
          ...(isDebug ? { details: validationResult.error.flatten() } : {}),
        },
        { status: 502 }
      );
    }

    // 8. Generate P3 Intelligence Engine Layer
    let intelligence = null;
    let intelligenceError: string | null = null;
    try {
      const caseEvidence: Evidence[] = validFiles.map((file, idx) => ({
        id: `ev_${idx}_${file.name}`,
        name: file.name,
        type: file.type === "application/pdf" ? "pdf" : "image",
        mimeType: file.type,
        size: file.size,
      }));

      intelligence = analyzeJobShieldIntelligence(
        {
          id: "api_case",
          title: validationResult.data.case_summary.job_title,
          company: validationResult.data.case_summary.company,
          recruiterMessage: message,
          jobUrl: url,
          evidence: caseEvidence,
        },
        validationResult.data
      );
    } catch (intelErr) {
      console.error("[JobShield API] Intelligence generation error:", intelErr);
      intelligenceError = "JobShield could not generate the intelligence layer.";
    }

    // 9. Return structured analysis and intelligence result
    return NextResponse.json(
      {
        success: true,
        analysis: validationResult.data,
        intelligence,
        intelligenceError,
        model: usedModel,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const rawError = error instanceof Error ? error.message : String(error);

    // Safe error categorization without logging PII or API keys
    let code = "SERVER_FAILURE";
    let clientMessage =
      "JobShield couldn't complete the analysis. Your evidence has not been classified as safe or unsafe. Please try again.";
    let statusCode = 500;

    if (rawError.includes("API key not valid") || rawError.includes("API_KEY_INVALID")) {
      code = "INVALID_API_KEY";
      clientMessage = "The configured Gemini API key is invalid. Please check your GEMINI_API_KEY in .env.local.";
      statusCode = 401;
    } else if (rawError.includes("quota") || rawError.includes("rate limit") || rawError.includes("429")) {
      code = "RATE_LIMIT_EXCEEDED";
      clientMessage = "Gemini API rate limit reached or quota exceeded. Please wait a moment and try again.";
      statusCode = 429;
    } else if (rawError.includes("model not found") || rawError.includes("404")) {
      code = "MODEL_NOT_FOUND";
      clientMessage = `The configured Gemini model "${model}" was not found. Please verify GEMINI_MODEL in .env.local.`;
      statusCode = 404;
    } else if (rawError.includes("503") || rawError.includes("UNAVAILABLE") || rawError.includes("high demand")) {
      code = "GEMINI_SERVICE_UNAVAILABLE";
      clientMessage = "Gemini AI model is temporarily experiencing high demand. Please try analyzing again in a few seconds.";
      statusCode = 503;
    } else if (rawError.includes("INVALID_ARGUMENT") || rawError.includes("400")) {
      code = "GEMINI_INVALID_ARGUMENT";
      clientMessage = "Gemini rejected the analysis request configuration. Please check your evidence files and try again.";
      statusCode = 400;
    }

    console.error(
      `[JobShield API] Error: code=${code}, status=${statusCode}, model=${model}, files=${validFilesCount}, mimeTypes=${mimeTypes.join(",")}, message=${rawError}`
    );

    return NextResponse.json(
      {
        success: false,
        code,
        error: clientMessage,
        ...(isDebug ? { details: rawError } : {}),
      },
      { status: statusCode }
    );
  }
}
