"use client";

import { useState } from "react";

export default function ApiPreview({
  data,
  audienceId,
}: {
  data: unknown;
  audienceId: string;
}) {
  const [copied, setCopied] = useState<"json" | "curl" | null>(null);
  const json = JSON.stringify(data, null, 2);
  const curlExample = `curl -s http://localhost:3000/api/agent-feed/${audienceId} | jq .`;

  function copy(text: string, type: "json" | "curl") {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white">Agent-Ready Output</h3>
            <span className="rounded bg-neon/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-neon">
              Live
            </span>
          </div>
          <p className="text-xs text-muted">
            This is the structured feed your AI agents consume and execute.
          </p>
        </div>
      </div>

      {/* cURL */}
      <div className="border-b border-border-subtle px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">cURL</p>
          <button
            onClick={() => copy(curlExample, "curl")}
            className="text-[11px] text-muted hover:text-neon transition-colors font-mono"
          >
            {copied === "curl" ? "copied" : "copy"}
          </button>
        </div>
        <pre className="rounded bg-background px-3 py-2.5 text-xs text-neon/80 font-mono overflow-x-auto border border-border-subtle">
          {curlExample}
        </pre>
      </div>

      {/* JSON */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted font-mono">
            GET /api/agent-feed/{audienceId}
          </p>
          <button
            onClick={() => copy(json, "json")}
            className="text-[11px] text-muted hover:text-neon transition-colors font-mono"
          >
            {copied === "json" ? "copied" : "copy json"}
          </button>
        </div>
        <pre className="max-h-[28rem] overflow-auto rounded bg-background px-4 py-3 text-[11px] leading-relaxed text-white/60 font-mono border border-border-subtle">
          {json}
        </pre>
      </div>
    </div>
  );
}
