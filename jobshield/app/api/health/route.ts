import { NextResponse } from "next/server";

export async function GET() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  return NextResponse.json({
    operational: true,
    configured: hasKey,
    model: "gemini-2.5-flash",
    timestamp: new Date().toISOString(),
  });
}
