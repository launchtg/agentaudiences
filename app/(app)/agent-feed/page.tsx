"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ActionCard from "@/components/ActionCard";
import ApiPreview from "@/components/ApiPreview";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { MOCK_AUDIENCE, MOCK_SUBSCRIBERS } from "@/lib/mockData";
import type { AgentAction } from "@/lib/mockData";
import { generateSegments } from "@/lib/generators/segments";
import { generateActions } from "@/lib/generators/actions";

export default function AgentFeedPage() {
  return (
    <Suspense>
      <AgentFeedInner />
    </Suspense>
  );
}

function AgentFeedInner() {
  const searchParams = useSearchParams();
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [showApi, setShowApi] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("demo") === "1" && actions.length === 0) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const segs = generateSegments(MOCK_AUDIENCE, MOCK_SUBSCRIBERS);
    const acts = generateActions(MOCK_AUDIENCE, segs);
    setActions(acts);
    setLoading(false);
  }

  function handleStatusChange(id: string, status: string) {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }

  const visible = actions.filter((a) => a.priority !== "hidden");
  const criticalCount = visible.filter((a) => a.priority === "critical").length;
  const highCount = visible.filter((a) => a.priority === "high").length;
  const mediumCount = visible.filter((a) => a.priority === "medium").length;

  const apiResponse = {
    audience_id: MOCK_AUDIENCE.id,
    total: visible.length,
    actions: visible.map((a) => ({
      id: a.id,
      title: a.title,
      action_type: a.action_type,
      priority: a.priority,
      action_score: a.action_score,
      urgency: a.urgency,
      estimated_value: a.estimated_value,
      recommended_channels: a.recommended_channels,
      why_now: a.why_now,
      reasoning: a.reasoning,
      agent_instruction: a.agent_instruction,
      status: a.status,
    })),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">Agent Feed</h1>
            {visible.length > 0 && (
              <span className="rounded bg-neon/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-neon">
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-muted">
            {loading
              ? "Prioritizing revenue actions..."
              : visible.length > 0
              ? `${visible.length} actions sorted by score — ready for agent execution`
              : "Generate scored, agent-ready revenue actions."}
          </p>
        </div>
        <div className="flex gap-2">
          {visible.length > 0 && (
            <button
              onClick={() => setShowApi(!showApi)}
              className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium text-muted hover:text-white hover:border-neon/30 transition-colors"
            >
              {showApi ? "Hide" : "Show"} API
            </button>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="inline-flex h-9 items-center rounded-lg bg-neon px-5 text-sm font-bold text-background hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Generating..." : visible.length > 0 ? "Regenerate" : "Generate Feed"}
          </button>
        </div>
      </div>

      {visible.length === 0 && !loading ? (
        <EmptyState
          title="No actions generated"
          description="Generate the agent feed to see prioritized, scored revenue actions with full execution instructions."
        />
      ) : visible.length > 0 ? (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Actions" value={visible.length} />
            <StatCard label="Critical" value={criticalCount} highlight={criticalCount > 0} />
            <StatCard label="High" value={highCount} />
            <StatCard label="Medium" value={mediumCount} />
          </div>

          {showApi && (
            <div className="mb-6">
              <ApiPreview data={apiResponse} audienceId={MOCK_AUDIENCE.id} />
            </div>
          )}

          <div className="grid gap-4">
            {visible.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
