import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function GET() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  const model = getGeminiModel();
  return NextResponse.json({
    operational: true,
    configured: hasKey,
    model,
    timestamp: new Date().toISOString(),
  });
}
