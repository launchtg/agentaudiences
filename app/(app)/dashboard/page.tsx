"use client";

import { useState } from "react";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { MOCK_AUDIENCE, MOCK_SUBSCRIBERS } from "@/lib/mockData";
import type { Segment, AgentAction } from "@/lib/mockData";
import { generateSegments } from "@/lib/generators/segments";
import { generateActions } from "@/lib/generators/actions";

type Step = "idle" | "audience" | "subscribers" | "segments" | "actions" | "done";

export default function DashboardPage() {
  const [step, setStep] = useState<Step>("idle");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(false);

  async function runDemo() {
    setLoading(true);

    // Step 1: Audience
    setStep("audience");
    await pause(400);

    // Step 2: Subscribers
    setStep("subscribers");
    await pause(400);

    // Step 3: Segments
    setStep("segments");
    const segs = generateSegments(MOCK_AUDIENCE, MOCK_SUBSCRIBERS);
    setSegments(segs);
    await pause(400);

    // Step 4: Actions
    setStep("actions");
    const acts = generateActions(MOCK_AUDIENCE, segs);
    setActions(acts);
    await pause(300);

    setStep("done");
    setLoading(false);
  }

  const visibleActions = actions.filter((a) => a.priority !== "hidden");
  const criticalCount = actions.filter((a) => a.priority === "critical").length;
  const highCount = actions.filter((a) => a.priority === "high").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">
            {step === "idle"
              ? "Load sample data to see AgentAudiences in action."
              : `${MOCK_AUDIENCE.name}`}
          </p>
        </div>
        <button
          onClick={runDemo}
          disabled={loading}
          className="inline-flex h-9 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {loading ? "Processing..." : step === "done" ? "Run Again" : "Load Sample Data"}
        </button>
      </div>

      {step === "idle" ? (
        <EmptyState
          title="No data loaded"
          description='Click "Load Sample Data" to generate audiences, segments, and agent actions from 24 mock subscribers.'
        />
      ) : (
        <>
          {/* Progress steps */}
          <div className="mb-8 flex items-center gap-2">
            {(["audience", "subscribers", "segments", "actions"] as const).map((s, i) => {
              const stepOrder = ["audience", "subscribers", "segments", "actions"];
              const currentIdx = stepOrder.indexOf(step === "done" ? "actions" : step);
              const thisIdx = i;
              const isDone = thisIdx < currentIdx || step === "done";
              const isCurrent = thisIdx === currentIdx && step !== "done";

              return (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && (
                    <div className={`h-px w-6 ${isDone ? "bg-accent" : "bg-white/10"}`} />
                  )}
                  <div className="flex items-center gap-1.5">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isDone ? "bg-accent text-white" : isCurrent ? "bg-accent/20 text-accent border border-accent" : "bg-white/[0.06] text-muted"
                    }`}>
                      {isDone ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-[11px] font-medium ${isDone || isCurrent ? "text-white" : "text-muted"}`}>
                      {s === "audience" ? "Audience" : s === "subscribers" ? "Subscribers" : s === "segments" ? "Segments" : "Actions"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Subscribers" value={MOCK_SUBSCRIBERS.length} sub="imported" />
            <StatCard label="Segments" value={segments.length} sub="generated" />
            <StatCard label="Actions" value={visibleActions.length} sub="visible" />
            <StatCard
              label="Critical"
              value={criticalCount}
              sub={`+ ${highCount} high priority`}
            />
          </div>

          {/* Quick summary */}
          {step === "done" && (
            <div className="rounded-lg border border-white/[0.06] bg-navy-light p-5">
              <h2 className="text-sm font-semibold text-white mb-3">Pipeline Summary</h2>
              <div className="space-y-2">
                {visibleActions.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 text-xs">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${
                      a.priority === "critical" ? "bg-accent" : a.priority === "high" ? "bg-amber-400" : "bg-blue-400"
                    }`} />
                    <span className="text-white/80 flex-1 truncate">{a.title}</span>
                    <span className="font-mono text-muted">{a.action_score}/100</span>
                    <span className="text-muted">{a.estimated_value}</span>
                  </div>
                ))}
                {visibleActions.length > 5 && (
                  <p className="text-[11px] text-muted">+ {visibleActions.length - 5} more actions</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function pause(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
