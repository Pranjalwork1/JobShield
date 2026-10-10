import { GoogleGenAI } from "@google/genai";

/**
 * Returns a configured GoogleGenAI SDK client instance.
 * Throws a descriptive configuration error if GEMINI_API_KEY is missing.
 * This runs strictly on the server side.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Please create a .env.local file with your Gemini API key (GEMINI_API_KEY=your_key) and restart the application."
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

/**
 * Returns the configured Gemini model name from GEMINI_MODEL,
 * defaulting to the supported multimodal model ("gemini-3.8-flash").
 * Automatically replaces retired model identifiers (e.g., gemini-2.5-flash) with gemini-3.8-flash.
 */
export function getGeminiModel(): string {
  const model = process.env.GEMINI_MODEL?.trim();
  if (model === "gemini-2.5-flash") {
    return "gemini-3.8-flash";
  }
  return model || "gemini-3.8-flash";
}
