"use client";

import { useState } from "react";

const PRIORITY_STYLES: Record<string, { border: string; badge: string; glow: string; label: string }> = {
  critical: {
    border: "border-neon/30",
    badge: "bg-neon/15 text-neon",
    glow: "shadow-[0_0_20px_rgba(212,255,0,0.06)]",
    label: "CRITICAL",
  },
  high: {
    border: "border-amber-400/20",
    badge: "bg-amber-400/10 text-amber-400",
    glow: "",
    label: "HIGH",
  },
  medium: {
    border: "border-border-subtle",
    badge: "bg-white/[0.06] text-muted-light",
    glow: "",
    label: "MEDIUM",
  },
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
    <div className={`rounded-lg border ${pri.border} ${pri.glow} bg-surface overflow-hidden transition-all hover:bg-surface-raised`}>
      {/* Header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${pri.badge}`}>
                {pri.label}
              </span>
              <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-muted uppercase tracking-wider">
                {action.action_type.replace(/_/g, " ")}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[action.status] || STATUS_STYLES.new}`}>
                {action.status.replace(/_/g, " ")}
              </span>
            </div>
            <h3 className="text-[15px] font-semibold text-white leading-snug">{action.title}</h3>
          </div>

          <div className="flex shrink-0 flex-col items-end">
            <span className={`text-2xl font-bold tabular-nums ${action.priority === "critical" ? "text-neon" : "text-white"}`}>
              {action.action_score}
            </span>
            <span className="text-[10px] text-muted font-mono -mt-0.5">/100</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
          <span className="text-muted">Value <span className="text-white font-semibold">{action.estimated_value}</span></span>
          <span className="text-muted">Urgency <span className="text-white font-medium">{action.urgency.replace(/_/g, " ")}</span></span>
        </div>

        {/* Why now */}
        <div className="mt-4 rounded bg-white/[0.03] border border-border-subtle px-3.5 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neon mb-1">Why Now</p>
          <p className="text-xs text-white/80 leading-relaxed">{action.why_now}</p>
        </div>

        {/* Channels */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {action.recommended_channels.map((ch) => (
            <span
              key={ch}
              className="rounded border border-border-subtle px-2.5 py-0.5 text-[11px] text-muted font-mono"
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center gap-1.5 border-t border-border-subtle py-2.5 text-[11px] font-medium text-muted hover:text-neon transition-colors"
      >
        {expanded ? "Hide" : "Show"} Agent Instructions
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

      {/* Expanded: Agent Instructions */}
      {expanded && action.agent_instruction && (
        <div className="border-t border-border-subtle px-5 py-5 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neon mb-1.5">Objective</p>
            <p className="text-xs text-white/80 leading-relaxed">{action.agent_instruction.objective}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neon mb-2">Execution Steps</p>
            <ol className="space-y-2">
              {action.agent_instruction.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-white/80">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-neon/10 text-[10px] font-bold text-neon mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">Success Criteria</p>
            <p className="text-xs text-white/70 leading-relaxed">{action.agent_instruction.success_criteria}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">Fallback</p>
            <p className="text-xs text-white/60 leading-relaxed">{action.agent_instruction.fallback}</p>
          </div>

          {action.reasoning && (
            <div className="rounded bg-white/[0.02] border border-border-subtle px-4 py-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Reasoning</p>
              <div className="space-y-1.5 text-xs text-white/60">
                <p><span className="text-muted font-mono text-[10px]">signal</span> {action.reasoning.segment_signal}</p>
                <p><span className="text-muted font-mono text-[10px]">revenue</span> {action.reasoning.revenue_logic}</p>
                <p><span className="text-muted font-mono text-[10px]">risk</span> {action.reasoning.risk}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status actions */}
      {onStatusChange && action.status !== "completed" && action.status !== "dismissed" && (
        <div className="flex border-t border-border-subtle">
          <button
            onClick={() => onStatusChange(action.id, "in_progress")}
            className="flex-1 py-2.5 text-[11px] font-semibold text-muted hover:text-neon hover:bg-neon-glow transition-colors border-r border-border-subtle"
          >
            Start
          </button>
          <button
            onClick={() => onStatusChange(action.id, "completed")}
            className="flex-1 py-2.5 text-[11px] font-semibold text-muted hover:text-emerald-400 hover:bg-emerald-400/5 transition-colors border-r border-border-subtle"
          >
            Complete
          </button>
          <button
            onClick={() => onStatusChange(action.id, "dismissed")}
            className="flex-1 py-2.5 text-[11px] font-semibold text-muted hover:text-white/60 hover:bg-white/[0.02] transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
