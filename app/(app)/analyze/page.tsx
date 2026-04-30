"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import RuleProposalCard from "@/components/RuleProposalCard";
import EmptyState from "@/components/EmptyState";

interface AudienceOption {
  id: string;
  name: string;
}

interface ProposedRule {
  id: string;
  name: string;
  description: string | null;
  segment_type: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions: any;
  defining_traits: Record<string, string> | null;
  monetization_paths: {
    path: string;
    description: string;
    estimated_value: string;
  }[] | null;
  confidence: number | null;
  status: string;
  llm_run_id: string | null;
}

interface ProposedTemplate {
  id: string;
  segment_rule_id: string;
  action_type: string;
  title_template: string;
  urgency: string | null;
  estimated_value: string | null;
  scoring_inputs: Record<string, number>;
  status: string;
}

export default function AnalyzePage() {
  const [audiences, setAudiences] = useState<AudienceOption[]>([]);
  const [selectedAudienceId, setSelectedAudienceId] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rules, setRules] = useState<ProposedRule[]>([]);
  const [templates, setTemplates] = useState<ProposedTemplate[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<string | null>(null);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    loadAudiences();
  });

  const loadAudiences = useCallback(async () => {
    try {
      let res = await fetch("/api/audiences");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAudiences(
            data.map((a: { id: string; name: string }) => ({
              id: a.id,
              name: a.name,
            }))
          );
          setSelectedAudienceId(data[0].id);
          // Load existing proposals for this audience
          loadExistingProposals(data[0].id);
          return;
        }
      }

      // No audiences — seed demo
      res = await fetch("/api/demo/run", { method: "POST" });
      if (res.ok) {
        const demo = await res.json();
        if (demo.audienceId) {
          setAudiences([
            { id: demo.audienceId, name: "SaaS Growth Newsletter" },
          ]);
          setSelectedAudienceId(demo.audienceId);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  async function loadExistingProposals(audienceId: string) {
    // Check if there are pending or approved rules already
    try {
      const res = await fetch(
        `/api/segment-rules/batch?audience_id=${audienceId}`
      );
      if (res.ok) {
        // We don't have a GET on batch, so we'll check from the analyze response
      }
    } catch {
      // ignore
    }
  }

  async function handleAnalyze() {
    if (!selectedAudienceId) return;
    setAnalyzing(true);
    setError(null);
    setRules([]);
    setTemplates([]);
    setRunId(null);
    setWarnings([]);
    setGenerateResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience_id: selectedAudienceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed");
        return;
      }

      setRunId(data.run_id);
      setRules(data.proposed_rules || []);
      setTemplates(data.proposed_action_templates || []);
      setWarnings(data.validation_warnings || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to server"
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleApproveRule(ruleId: string) {
    setActionInProgress(true);
    try {
      const res = await fetch(`/api/segment-rules/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) => (r.id === ruleId ? { ...r, status: "approved" } : r))
        );
        setTemplates((prev) =>
          prev.map((t) =>
            t.segment_rule_id === ruleId ? { ...t, status: "approved" } : t
          )
        );
      }
    } finally {
      setActionInProgress(false);
    }
  }

  async function handleRejectRule(ruleId: string) {
    setActionInProgress(true);
    try {
      const res = await fetch(`/api/segment-rules/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) => (r.id === ruleId ? { ...r, status: "rejected" } : r))
        );
        setTemplates((prev) =>
          prev.map((t) =>
            t.segment_rule_id === ruleId ? { ...t, status: "rejected" } : t
          )
        );
      }
    } finally {
      setActionInProgress(false);
    }
  }

  async function handleApproveAll() {
    if (!runId) return;
    setActionInProgress(true);
    try {
      const res = await fetch("/api/segment-rules/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_id: runId, action: "approve_all" }),
      });
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) =>
            r.status === "pending" ? { ...r, status: "approved" } : r
          )
        );
        setTemplates((prev) =>
          prev.map((t) =>
            t.status === "pending" ? { ...t, status: "approved" } : t
          )
        );
      }
    } finally {
      setActionInProgress(false);
    }
  }

  async function handleRejectAll() {
    if (!runId) return;
    setActionInProgress(true);
    try {
      const res = await fetch("/api/segment-rules/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_id: runId, action: "reject_all" }),
      });
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) =>
            r.status === "pending" ? { ...r, status: "rejected" } : r
          )
        );
        setTemplates((prev) =>
          prev.map((t) =>
            t.status === "pending" ? { ...t, status: "rejected" } : t
          )
        );
      }
    } finally {
      setActionInProgress(false);
    }
  }

  async function handleGenerate() {
    if (!selectedAudienceId) return;
    setGenerating(true);
    setGenerateResult(null);

    try {
      // Generate segments first
      const segRes = await fetch("/api/segments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience_id: selectedAudienceId }),
      });
      const segData = await segRes.json();

      if (!segRes.ok) {
        setGenerateResult(`Segment generation failed: ${segData.error}`);
        return;
      }

      // Then generate actions
      const actRes = await fetch("/api/actions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience_id: selectedAudienceId }),
      });
      const actData = await actRes.json();

      if (!actRes.ok) {
        setGenerateResult(`Action generation failed: ${actData.error}`);
        return;
      }

      setGenerateResult(
        `Generated ${segData.generated} segments (${segData.mode}) and ${actData.generated} actions (${actData.mode})`
      );
    } catch (err) {
      setGenerateResult(
        err instanceof Error ? err.message : "Generation failed"
      );
    } finally {
      setGenerating(false);
    }
  }

  const pendingCount = rules.filter((r) => r.status === "pending").length;
  const approvedCount = rules.filter((r) => r.status === "approved").length;
  const hasProposals = rules.length > 0;

  return (
    <div className="mx-auto max-w-4xl py-10 px-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">
          Analyze Audience
        </h1>
        <p className="text-[13px] text-muted">
          AI analyzes your subscriber data and proposes segment rules tailored to
          your audience. Approve the rules you want, then generate segments and
          actions from them.
        </p>
      </div>

      {/* Audience Selector */}
      <div className="mb-6">
        <label className="block text-[12px] font-mono text-muted/70 uppercase tracking-wider mb-2">
          Audience
        </label>
        {audiences.length === 0 ? (
          <EmptyState title="Loading audiences..." description="Fetching your audience data from the server." />
        ) : (
          <select
            value={selectedAudienceId}
            onChange={(e) => {
              setSelectedAudienceId(e.target.value);
              setRules([]);
              setTemplates([]);
              setRunId(null);
              setError(null);
              setGenerateResult(null);
            }}
            className="w-full max-w-md rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-neon/40"
          >
            {audiences.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Analyze Button */}
      {!hasProposals && (
        <div className="mb-8">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !selectedAudienceId}
            className="px-5 py-2.5 text-[13px] font-semibold rounded-md bg-neon/20 text-neon border border-neon/30 hover:bg-neon/30 disabled:opacity-50 transition-colors"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border border-neon/50 border-t-neon rounded-full animate-spin" />
                Analyzing subscriber patterns...
              </span>
            ) : (
              "Analyze Audience"
            )}
          </button>
          {analyzing && (
            <p className="mt-3 text-[12px] text-muted">
              The AI is examining your subscriber data to discover
              revenue-relevant segments. This may take 15-30 seconds.
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <div className="mb-6 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-[12px] text-amber-400">
          <p className="font-medium mb-1">
            Some proposed rules were skipped due to invalid fields:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Proposals */}
      {hasProposals && (
        <>
          {/* Summary + Batch Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] text-muted">
              <span className="text-white font-medium">{rules.length}</span>{" "}
              proposed rules
              {approvedCount > 0 && (
                <span className="text-green-400 ml-2">
                  {approvedCount} approved
                </span>
              )}
              {pendingCount > 0 && (
                <span className="text-muted ml-2">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <>
                  <button
                    onClick={handleApproveAll}
                    disabled={actionInProgress}
                    className="px-3 py-1.5 text-[11px] font-medium rounded bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 disabled:opacity-50 transition-colors"
                  >
                    Approve All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    disabled={actionInProgress}
                    className="px-3 py-1.5 text-[11px] font-medium rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                  >
                    Reject All
                  </button>
                </>
              )}
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-3 py-1.5 text-[11px] font-medium rounded bg-white/5 text-muted border border-white/10 hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                Re-Analyze
              </button>
            </div>
          </div>

          {/* Rule Cards */}
          <div className="space-y-4 mb-8">
            {rules.map((rule) => (
              <RuleProposalCard
                key={rule.id}
                rule={rule}
                templates={templates.filter(
                  (t) => t.segment_rule_id === rule.id
                )}
                onApprove={handleApproveRule}
                onReject={handleRejectRule}
                disabled={actionInProgress}
              />
            ))}
          </div>

          {/* Generate from approved rules */}
          {approvedCount > 0 && (
            <div className="p-4 rounded-lg border border-neon/20 bg-neon/5">
              <h3 className="text-[14px] font-semibold text-white mb-1">
                Generate Segments & Actions
              </h3>
              <p className="text-[12px] text-muted mb-3">
                {approvedCount} approved rule{approvedCount > 1 ? "s" : ""} will
                be used to generate segments and actions for your audience.
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 text-[13px] font-semibold rounded-md bg-neon/20 text-neon border border-neon/30 hover:bg-neon/30 disabled:opacity-50 transition-colors"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border border-neon/50 border-t-neon rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  "Generate from Approved Rules"
                )}
              </button>
              {generateResult && (
                <p className="mt-3 text-[12px] text-green-400">
                  {generateResult}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
