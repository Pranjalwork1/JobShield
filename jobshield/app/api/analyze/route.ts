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

// Helper to create standardized JSON responses with request correlation headers
function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  reqId: string
) {
  return NextResponse.json(
    { ...body, requestId: reqId },
    {
      status,
      headers: {
        "X-JobShield-Request-Id": reqId,
        "Content-Type": "application/json",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const reqId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  const requestStartTime = Date.now();
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
      console.error(
        `[JobShield API] [${reqId}] Configuration error: Missing API Key -`,
        configMsg
      );
      return jsonResponse(
        {
          success: false,
          code: "MISSING_API_KEY",
          error:
            "The Gemini API key is missing. Please set GEMINI_API_KEY in your environment variables.",
        },
        500,
        reqId
      );
    }

    // 2. Parse Multipart FormData
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (parseErr) {
      console.error(
        `[JobShield API] [${reqId}] FormData parsing failed:`,
        parseErr
      );
      return jsonResponse(
        {
          success: false,
          code: "INVALID_REQUEST_BODY",
          error: "Could not parse multipart form data from request.",
        },
        400,
        reqId
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
      return jsonResponse(
        {
          success: false,
          code: "NO_EVIDENCE_PROVIDED",
          error:
            "No recruitment evidence provided. Please upload at least one file, enter a recruiter message, or provide a job URL.",
        },
        400,
        reqId
      );
    }

    // 4. Validate file constraints
    if (files.length > MAX_FILES_COUNT) {
      return jsonResponse(
        {
          success: false,
          code: "TOO_MANY_FILES",
          error: `Too many files uploaded. Maximum allowed is ${MAX_FILES_COUNT} files per case.`,
        },
        400,
        reqId
      );
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!file || file.size === 0) {
        continue;
      }

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return jsonResponse(
          {
            success: false,
            code: "UNSUPPORTED_FILE_TYPE",
            error: `Unsupported file type for "${file.name}" (${file.type || "unknown"}). Allowed types are PDF, PNG, JPG, and WEBP.`,
          },
          400,
          reqId
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        return jsonResponse(
          {
            success: false,
            code: "FILE_TOO_LARGE",
            error: `File "${file.name}" exceeds the 10 MB limit (${sizeMb} MB). Please upload a smaller file.`,
          },
          400,
          reqId
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
        console.error(
          `[JobShield API] [${reqId}] Failed to serialize file "${file.name}":`,
          fileErr
        );
        return jsonResponse(
          {
            success: false,
            code: "FILE_READ_ERROR",
            error: `Failed to read uploaded file "${file.name}". Please re-upload and try again.`,
          },
          400,
          reqId
        );
      }
    }

    // Diagnostic safe log
    if (isDebug) {
      console.log(
        `[JobShield API] [${reqId}] Submitting case: model=${model}, files=${validFilesCount}, mimeTypes=${mimeTypes.join(",")}, hasMessage=${hasMessage}, hasUrl=${hasUrl}`
      );
    }

    // 6. Call Gemini API Server-Side with bounded execution and fast fallbacks
    // Use candidate models verified on the Gemini API
    const candidateModels = Array.from(
      new Set([
        model,
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
        "gemini-3.8-flash",
        "gemini-3.7-flash",
      ])
    ).filter((m) => m && m !== "gemini-2.5-flash");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let response: any = null;
    let usedModel = model;

    // Timeouts to prevent Vercel 60s gateway timeouts
    const MAX_TOTAL_BUDGET_MS = 26000;
    const PER_MODEL_TIMEOUT_MS = 14000;

    for (let i = 0; i < candidateModels.length; i++) {
      const elapsed = Date.now() - requestStartTime;
      if (elapsed > MAX_TOTAL_BUDGET_MS) {
        console.warn(
          `[JobShield API] [${reqId}] Request budget reached (${elapsed}ms). Aborting candidate model rotation.`
        );
        break;
      }

      const currentCandidate = candidateModels[i];
      try {
        if (isDebug) {
          console.log(
            `[JobShield API] [${reqId}] Invoking Gemini model: ${currentCandidate}`
          );
        }

        const generatePromise = ai.models.generateContent({
          model: currentCandidate,
          contents,
          config: {
            systemInstruction: JOBSHIELD_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseJsonSchema: geminiResponseJsonSchema,
            temperature: 0.1,
          },
        });

        let timer: NodeJS.Timeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            reject(
              new Error(
                `Timeout: Model ${currentCandidate} did not respond within ${PER_MODEL_TIMEOUT_MS / 1000}s`
              )
            );
          }, PER_MODEL_TIMEOUT_MS);
        });

        response = await Promise.race([generatePromise, timeoutPromise]).finally(
          () => {
            clearTimeout(timer);
          }
        );

        usedModel = currentCandidate;
        break;
      } catch (candidateErr: unknown) {
        const errStr =
          candidateErr instanceof Error
            ? candidateErr.message
            : String(candidateErr);
        console.warn(
          `[JobShield API] [${reqId}] Model ${currentCandidate} issue: ${errStr.slice(0, 140)}`
        );

        const isRecoverableIssue =
          errStr.includes("429") ||
          errStr.includes("quota") ||
          errStr.includes("503") ||
          errStr.includes("UNAVAILABLE") ||
          errStr.includes("high demand") ||
          errStr.includes("Timeout") ||
          errStr.includes("404") ||
          errStr.includes("not found");

        if (!isRecoverableIssue || i === candidateModels.length - 1) {
          throw candidateErr;
        }
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    if (!response) {
      console.error(
        `[JobShield API] [${reqId}] All candidate models exhausted or timed out within budget.`
      );
      return jsonResponse(
        {
          success: false,
          code: "MODEL_TIMEOUT_OR_UNAVAILABLE",
          error:
            "The AI analysis engine is currently experiencing high latency or spikes in demand. Please try analyzing again in a few moments.",
        },
        504,
        reqId
      );
    }

    const responseText = response.text;
    if (!responseText) {
      console.error(
        `[JobShield API] [${reqId}] Empty Gemini response text: model=${usedModel}`
      );
      return jsonResponse(
        {
          success: false,
          code: "EMPTY_GEMINI_RESPONSE",
          error:
            "JobShield received an empty analysis response from the AI engine. Please verify the evidence and try again.",
        },
        502,
        reqId
      );
    }

    // 7. Parse and Validate with Zod
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (jsonErr) {
      console.error(
        `[JobShield API] [${reqId}] JSON parse failure: model=${usedModel}`,
        jsonErr
      );
      return jsonResponse(
        {
          success: false,
          code: "MALFORMED_JSON",
          error:
            "JobShield received a non-JSON response from the analysis model. Please try again.",
          ...(isDebug ? { details: String(jsonErr) } : {}),
        },
        502,
        reqId
      );
    }

    const validationResult = JobShieldAnalysisSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      console.error(
        `[JobShield API] [${reqId}] Zod validation failure: model=${usedModel}, issues=`,
        validationResult.error.flatten()
      );
      return jsonResponse(
        {
          success: false,
          code: "SCHEMA_VALIDATION_FAILURE",
          error:
            "Analysis response failed schema validation. Your evidence could not be reliably structured. Please try again.",
          ...(isDebug ? { details: validationResult.error.flatten() } : {}),
        },
        502,
        reqId
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
      console.error(
        `[JobShield API] [${reqId}] Intelligence generation error:`,
        intelErr
      );
      intelligenceError = "JobShield could not generate the intelligence layer.";
    }

    // 9. Return structured analysis and intelligence result
    return jsonResponse(
      {
        success: true,
        analysis: validationResult.data,
        intelligence,
        intelligenceError,
        model: usedModel,
      },
      200,
      reqId
    );
  } catch (error: unknown) {
    const rawError = error instanceof Error ? error.message : String(error);

    // Safe error categorization without logging PII or API keys
    let code = "SERVER_FAILURE";
    let clientMessage =
      "JobShield couldn't complete the analysis. Your evidence has not been classified as safe or unsafe. Please try again.";
    let statusCode = 500;

    if (
      rawError.includes("API key not valid") ||
      rawError.includes("API_KEY_INVALID")
    ) {
      code = "INVALID_API_KEY";
      clientMessage =
        "The configured Gemini API key is invalid. Please verify your GEMINI_API_KEY in environment variables.";
      statusCode = 401;
    } else if (
      rawError.includes("quota") ||
      rawError.includes("rate limit") ||
      rawError.includes("429")
    ) {
      code = "RATE_LIMIT_EXCEEDED";
      clientMessage =
        "Gemini API rate limit reached or quota exceeded. Please wait a moment and try again.";
      statusCode = 429;
    } else if (
      rawError.includes("model not found") ||
      rawError.includes("404")
    ) {
      code = "MODEL_NOT_FOUND";
      clientMessage = `The configured Gemini model "${model}" was not found. Please verify GEMINI_MODEL in environment variables.`;
      statusCode = 404;
    } else if (
      rawError.includes("503") ||
      rawError.includes("UNAVAILABLE") ||
      rawError.includes("high demand")
    ) {
      code = "GEMINI_SERVICE_UNAVAILABLE";
      clientMessage =
        "Gemini AI model is temporarily experiencing high demand. Please try analyzing again in a few seconds.";
      statusCode = 503;
    } else if (
      rawError.includes("Timeout") ||
      rawError.includes("timed out")
    ) {
      code = "GATEWAY_TIMEOUT";
      clientMessage =
        "The analysis model took too long to respond. Please try analyzing again.";
      statusCode = 504;
    } else if (
      rawError.includes("INVALID_ARGUMENT") ||
      rawError.includes("400")
    ) {
      code = "GEMINI_INVALID_ARGUMENT";
      clientMessage =
        "Gemini rejected the analysis request configuration. Please check your evidence files and try again.";
      statusCode = 400;
    }

    console.error(
      `[JobShield API] [${reqId}] Error: code=${code}, status=${statusCode}, model=${model}, files=${validFilesCount}, mimeTypes=${mimeTypes.join(",")}, message=${rawError.slice(0, 200)}`
    );

    return jsonResponse(
      {
        success: false,
        code,
        error: clientMessage,
        ...(isDebug ? { details: rawError } : {}),
      },
      statusCode,
      reqId
    );
  }
}
