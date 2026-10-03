import { getGeminiClient, getGeminiModel } from "./gemini";

export interface GeminiHealthResult {
  ok: boolean;
  model: string;
  latencyMs: number;
  error?: string;
  code?: string;
}

/**
 * Minimal server-side Gemini health check.
 * Verifies API key, model accessibility, and basic structured JSON response.
 * Does not upload files or disclose sensitive environment credentials.
 */
export async function checkGeminiHealth(): Promise<GeminiHealthResult> {
  const configured = getGeminiModel();
  const startTime = Date.now();
  const candidates = Array.from(new Set([configured, "gemini-3.7-flash", "gemini-3.5-flash"]));

  let lastError = "";
  let lastCode = "UNKNOWN_ERROR";

  try {
    const ai = getGeminiClient();

    for (const model of candidates) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: "Respond with JSON verifying system operational status: {\"ok\": true}",
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: {
              type: "object",
              properties: {
                ok: { type: "boolean" },
              },
              required: ["ok"],
            },
            temperature: 0.1,
          },
        });

        const text = response.text || "";
        const parsed = JSON.parse(text);

        return {
          ok: Boolean(parsed.ok),
          model,
          latencyMs: Date.now() - startTime,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
        if (lastError.includes("API key not valid") || lastError.includes("API_KEY_INVALID")) {
          lastCode = "INVALID_API_KEY";
          break; // Don't try other models if the API key is completely invalid
        } else if (lastError.includes("not found") || lastError.includes("404")) {
          lastCode = "MODEL_NOT_FOUND";
        } else if (lastError.includes("quota") || lastError.includes("429")) {
          lastCode = "QUOTA_EXCEEDED";
        } else if (lastError.includes("503") || lastError.includes("UNAVAILABLE")) {
          lastCode = "SERVICE_UNAVAILABLE";
        }
      }
    }

    return {
      ok: false,
      model: configured,
      latencyMs: Date.now() - startTime,
      error: lastError,
      code: lastCode,
    };
  } catch (clientErr: unknown) {
    return {
      ok: false,
      model: configured,
      latencyMs: Date.now() - startTime,
      error: clientErr instanceof Error ? clientErr.message : String(clientErr),
      code: "CONFIG_ERROR",
    };
  }
}
