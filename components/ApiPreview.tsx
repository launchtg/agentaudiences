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
    <div className="rounded-lg border border-white/[0.06] bg-navy-light overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Agent API Preview</h3>
          <p className="mt-0.5 text-xs text-muted">
            Agent-ready feed: structured actions your AI agents can consume and execute.
          </p>
        </div>
        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Live
        </span>
      </div>

      {/* cURL example */}
      <div className="border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">cURL</p>
          <button
            onClick={() => copy(curlExample, "curl")}
            className="text-[11px] text-muted hover:text-white transition-colors"
          >
            {copied === "curl" ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="rounded bg-[#080d1a] px-3 py-2 text-xs text-emerald-400 font-mono overflow-x-auto">
          {curlExample}
        </pre>
      </div>

      {/* JSON response */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
            GET /api/agent-feed/{audienceId}
          </p>
          <button
            onClick={() => copy(json, "json")}
            className="text-[11px] text-muted hover:text-white transition-colors"
          >
            {copied === "json" ? "Copied" : "Copy JSON"}
          </button>
        </div>
        <pre className="max-h-96 overflow-auto rounded bg-[#080d1a] px-4 py-3 text-[11px] leading-relaxed text-white/70 font-mono">
          {json}
        </pre>
      </div>
    </div>
  );
}
