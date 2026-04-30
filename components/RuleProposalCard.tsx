"use client";

import { useState } from "react";
import ConditionDisplay from "@/components/ConditionDisplay";
import type { ConditionGroup } from "@/lib/types/rules";

interface RuleProposal {
  id: string;
  name: string;
  description: string | null;
  segment_type: string | null;
  conditions: ConditionGroup;
  defining_traits: Record<string, string> | null;
  monetization_paths: {
    path: string;
    description: string;
    estimated_value: string;
  }[] | null;
  confidence: number | null;
  status: string;
}

interface ActionTemplate {
  id: string;
  action_type: string;
  title_template: string;
  urgency: string | null;
  estimated_value: string | null;
  scoring_inputs: Record<string, number>;
  status: string;
}

export default function RuleProposalCard({
  rule,
  templates,
  onApprove,
  onReject,
  disabled,
}: {
  rule: RuleProposal;
  templates: ActionTemplate[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  disabled?: boolean;
}) {
  const [showTemplates, setShowTemplates] = useState(false);

  const statusColor =
    rule.status === "approved"
      ? "border-green-500/30 bg-green-500/5"
      : rule.status === "rejected"
        ? "border-red-500/30 bg-red-500/5 opacity-60"
        : "border-white/10 bg-white/[0.02]";

  const confidenceColor =
    (rule.confidence || 0) >= 0.85
      ? "text-green-400"
      : (rule.confidence || 0) >= 0.7
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className={`rounded-lg border p-4 ${statusColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[14px] font-semibold text-white truncate">
              {rule.name}
            </h3>
            {rule.status !== "pending" && (
              <span
                className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                  rule.status === "approved"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {rule.status}
              </span>
            )}
          </div>
          {rule.description && (
            <p className="text-[12px] text-muted">{rule.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rule.segment_type && (
            <span className="text-[10px] font-mono bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-muted">
              {rule.segment_type}
            </span>
          )}
          {rule.confidence != null && (
            <span className={`text-[11px] font-mono ${confidenceColor}`}>
              {Math.round(rule.confidence * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="mb-3 p-3 rounded bg-black/30 border border-white/5">
        <p className="text-[10px] font-mono text-muted/60 uppercase tracking-wider mb-2">
          Matching Conditions
        </p>
        <ConditionDisplay conditions={rule.conditions} />
      </div>

      {/* Traits + Monetization */}
      <div className="flex gap-4 mb-3">
        {rule.defining_traits && Object.keys(rule.defining_traits).length > 0 && (
          <div className="flex-1">
            <p className="text-[10px] font-mono text-muted/60 uppercase tracking-wider mb-1.5">
              Traits
            </p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(rule.defining_traits).map(([k, v]) => (
                <span
                  key={k}
                  className="text-[10px] font-mono bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-muted"
                >
                  {k}: {v}
                </span>
              ))}
            </div>
          </div>
        )}
        {rule.monetization_paths && rule.monetization_paths.length > 0 && (
          <div className="flex-1">
            <p className="text-[10px] font-mono text-muted/60 uppercase tracking-wider mb-1.5">
              Revenue Paths
            </p>
            <div className="flex flex-wrap gap-1">
              {rule.monetization_paths.map((p, i) => (
                <span
                  key={i}
                  className={`text-[10px] font-mono rounded px-1.5 py-0.5 border ${
                    p.estimated_value === "high"
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : p.estimated_value === "medium"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-white/5 border-white/10 text-muted"
                  }`}
                >
                  {p.path} ({p.estimated_value})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Templates (collapsible) */}
      {templates.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-[11px] font-mono text-neon/70 hover:text-neon flex items-center gap-1"
          >
            <span className="text-[10px]">{showTemplates ? "▾" : "▸"}</span>
            {templates.length} action template{templates.length > 1 ? "s" : ""}
          </button>
          {showTemplates && (
            <div className="mt-2 space-y-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded bg-white/[0.02] border border-white/5 text-[12px]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] bg-neon/10 border border-neon/20 text-neon rounded px-1.5 py-0.5">
                      {t.action_type}
                    </span>
                    {t.urgency && (
                      <span className="font-mono text-[10px] text-muted">
                        {t.urgency}
                      </span>
                    )}
                    {t.estimated_value && (
                      <span className="font-mono text-[10px] text-green-400/70">
                        {t.estimated_value}
                      </span>
                    )}
                  </div>
                  <p className="text-muted">{t.title_template}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {rule.status === "pending" && (
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => onApprove(rule.id)}
            disabled={disabled}
            className="px-3 py-1.5 text-[12px] font-medium rounded bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 disabled:opacity-50 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(rule.id)}
            disabled={disabled}
            className="px-3 py-1.5 text-[12px] font-medium rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
