"use client";

import { useState } from "react";

export default function CopyBlock({
  label,
  value,
  mono = true,
  multiline = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  multiline?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
          {label}
        </span>
        <button
          onClick={copy}
          className="text-[11px] font-medium text-neon hover:text-neon/80 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {multiline ? (
        <pre className={`w-full rounded-md border border-border-subtle bg-background p-3 text-xs text-white/80 overflow-x-auto whitespace-pre-wrap break-words ${mono ? "font-mono" : ""}`}>
          {value}
        </pre>
      ) : (
        <div className="flex items-center gap-2">
          <div className={`flex-1 rounded-md border border-border-subtle bg-background px-3 py-2 text-xs text-white/80 truncate ${mono ? "font-mono" : ""}`}>
            {value}
          </div>
        </div>
      )}
    </div>
  );
}
