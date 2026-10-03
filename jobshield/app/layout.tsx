import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "JobShield | Verify before you trust",
  description:
    "JobShield uses Google Gemini multimodal intelligence to analyze job offers, recruiter messages, screenshots, PDFs and recruitment evidence to isolate evidence-backed risk indicators.",
  keywords: [
    "job scam prevention",
    "recruitment verification",
    "offer letter verification",
    "job fraud detection",
    "Gemini multimodal AI",
  ],
  authors: [{ name: "JobShield Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#e5e8ee] text-slate-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
