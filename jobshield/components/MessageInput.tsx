"use client";

import React from "react";
import { MessageSquareText } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MessageInput({
  value,
  onChange,
  disabled = false,
}: MessageInputProps) {
  const examplePlaceholder = `e.g. "Congratulations! You have been selected for the Software Developer position. Please pay ₹2,999 registration fee before joining."`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="recruiter-message-input"
          className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider"
        >
          <MessageSquareText className="w-4 h-4 text-emerald-600" />
          <span>Recruiter Message / Chat / Email Body</span>
        </label>
        <span className="text-xs text-slate-400 font-mono">
          {value.length} characters
        </span>
      </div>

      <div className="relative">
        <textarea
          id="recruiter-message-input"
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={examplePlaceholder}
          className="w-full px-4 py-3 bg-white/95 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/25 focus:border-[#1E90FF] shadow-sm transition-all resize-y disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
        />
      </div>
      <p className="text-xs text-slate-400">
        Paste direct WhatsApp messages, Telegram messages, LinkedIn InMails, or email body text.
      </p>
    </div>
  );
}
