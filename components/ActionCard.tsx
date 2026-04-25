"use client";

import { useState } from "react";

const PRIORITY_STYLES: Record<string, { border: string; badge: string; label: string }> = {
  critical: { border: "border-accent/40", badge: "bg-accent/15 text-accent", label: "Critical" },
  high: { border: "border-amber-400/30", badge: "bg-amber-400/10 text-amber-400", label: "High" },
  medium: { border: "border-blue-400/20", badge: "bg-blue-400/10 text-blue-400", label: "Medium" },
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-white/[0.06] text-muted",
  in_progress: "bg-blue-500/15 text-blue-400",
  completed: "bg-emerald-500/15 text-emerald-400",
  dismissed: "bg-white/[0.04] text-muted/50",
};

export default function ActionCard({
  action,
  onStatusChange,
}: {
  action: {
    id: string;
    title: string;
    action_type: string;
    priority: string;
    action_score: number;
    urgency: string;
    estimated_value: string;
    recommended_channels: string[];
    why_now: string;
    reasoning?: { segment_signal: string; revenue_logic: string; risk: string };
    agent_instruction?: { objective: string; steps: string[]; success_criteria: string; fallback: string };
    status: string;
  };
  onStatusChange?: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const pri = PRIORITY_STYLES[action.priority] || PRIORITY_STYLES.medium;

  return (
    <div className={`rounded-lg border ${pri.border} bg-navy-light overflow-hidden transition-all`}>
      {/* Header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pri.badge}`}>
                {pri.label}
              </span>
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-muted">
                {action.action_type.replace(/_/g, " ")}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[action.status] || STATUS_STYLES.new}`}>
                {action.status.replace(/_/g, " ")}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white leading-snug">{action.title}</h3>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white">{action.action_score}</span>
              <span className="text-[10px] text-muted">/100</span>
            </div>
          </div>
        </div>

        {/* Key metrics row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="text-muted">Value: <span className="text-white font-medium">{action.estimated_value}</span></span>
          <span className="text-muted">Urgency: <span className="text-white font-medium">{action.urgency.replace(/_/g, " ")}</span></span>
        </div>

        {/* Why now */}
        <div className="mt-3 rounded bg-white/[0.03] px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent mb-0.5">Why now</p>
          <p className="text-xs text-white/80 leading-relaxed">{action.why_now}</p>
        </div>

        {/* Channels */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {action.recommended_channels.map((ch) => (
            <span
              key={ch}
              className="rounded-full border border-white/[0.08] px-2.5 py-0.5 text-[11px] text-muted"
            >
              {ch.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center gap-1 border-t border-white/[0.06] py-2 text-[11px] font-medium text-muted hover:text-white transition-colors"
      >
        {expanded ? "Hide" : "Show"} agent instructions
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && action.agent_instruction && (
        <div className="border-t border-white/[0.06] px-5 py-4 space-y-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted mb-1">Objective</p>
            <p className="text-xs text-white/80">{action.agent_instruction.objective}</p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted mb-1.5">Steps</p>
            <ol className="space-y-1.5">
              {action.agent_instruction.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/80">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-semibold text-muted mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted mb-1">Success Criteria</p>
            <p className="text-xs text-white/80">{action.agent_instruction.success_criteria}</p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted mb-1">Fallback</p>
            <p className="text-xs text-white/70">{action.agent_instruction.fallback}</p>
          </div>

          {action.reasoning && (
            <div className="mt-2 rounded bg-white/[0.03] px-3 py-2.5 space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Reasoning</p>
              <p className="text-xs text-white/70"><span className="text-muted">Signal:</span> {action.reasoning.segment_signal}</p>
              <p className="text-xs text-white/70"><span className="text-muted">Revenue:</span> {action.reasoning.revenue_logic}</p>
              <p className="text-xs text-white/70"><span className="text-muted">Risk:</span> {action.reasoning.risk}</p>
            </div>
          )}
        </div>
      )}

      {/* Status actions */}
      {onStatusChange && action.status !== "completed" && action.status !== "dismissed" && (
        <div className="flex border-t border-white/[0.06]">
          <button
            onClick={() => onStatusChange(action.id, "in_progress")}
            className="flex-1 py-2 text-[11px] font-medium text-blue-400 hover:bg-blue-400/5 transition-colors border-r border-white/[0.06]"
          >
            Start
          </button>
          <button
            onClick={() => onStatusChange(action.id, "completed")}
            className="flex-1 py-2 text-[11px] font-medium text-emerald-400 hover:bg-emerald-400/5 transition-colors border-r border-white/[0.06]"
          >
            Complete
          </button>
          <button
            onClick={() => onStatusChange(action.id, "dismissed")}
            className="flex-1 py-2 text-[11px] font-medium text-muted hover:bg-white/[0.03] transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
