"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
      style={{
        background: copied ? "rgb(220 252 231)" : "rgb(241 245 249)",
        color: copied ? "rgb(21 128 61)" : "rgb(71 85 105)",
        border: `1px solid ${copied ? "rgb(187 247 208)" : "rgb(226 232 240)"}`,
      }}
    >
      {copied ? (
        <>
          <Check size={14} /> Copied!
        </>
      ) : (
        <>
          <Copy size={14} /> Copy Prompt
        </>
      )}
    </button>
  );
}
