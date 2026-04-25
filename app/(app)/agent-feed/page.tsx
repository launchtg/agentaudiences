"use client";

import { useState } from "react";
import ActionCard from "@/components/ActionCard";
import ApiPreview from "@/components/ApiPreview";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { MOCK_AUDIENCE, MOCK_SUBSCRIBERS } from "@/lib/mockData";
import type { AgentAction } from "@/lib/mockData";
import { generateSegments } from "@/lib/generators/segments";
import { generateActions } from "@/lib/generators/actions";

export default function AgentFeedPage() {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [showApi, setShowApi] = useState(false);

  function generate() {
    const segs = generateSegments(MOCK_AUDIENCE, MOCK_SUBSCRIBERS);
    const acts = generateActions(MOCK_AUDIENCE, segs);
    setActions(acts);
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

  // Build the API response shape
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
          <h1 className="text-xl font-bold text-white">Agent Feed</h1>
          <p className="mt-0.5 text-sm text-muted">
            {visible.length > 0
              ? `${visible.length} prioritized actions sorted by score`
              : "Generate scored, agent-ready revenue actions."}
          </p>
        </div>
        <div className="flex gap-2">
          {visible.length > 0 && (
            <button
              onClick={() => setShowApi(!showApi)}
              className="inline-flex h-9 items-center rounded-lg border border-white/10 px-4 text-sm font-medium text-white hover:bg-white/[0.04] transition-colors"
            >
              {showApi ? "Hide" : "Show"} API Preview
            </button>
          )}
          <button
            onClick={generate}
            className="inline-flex h-9 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
          >
            {visible.length > 0 ? "Regenerate" : "Generate Agent Feed"}
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No actions generated"
          description="Generate the agent feed to see prioritized, scored revenue actions with full agent instructions."
        />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Actions" value={visible.length} />
            <StatCard label="Critical" value={criticalCount} />
            <StatCard label="High" value={highCount} />
            <StatCard label="Medium" value={mediumCount} />
          </div>

          {/* API Preview */}
          {showApi && (
            <div className="mb-6">
              <ApiPreview data={apiResponse} audienceId={MOCK_AUDIENCE.id} />
            </div>
          )}

          {/* Action cards */}
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
      )}
    </div>
  );
}
