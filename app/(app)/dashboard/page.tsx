"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { MOCK_AUDIENCE, MOCK_SUBSCRIBERS } from "@/lib/mockData";
import type { Segment, AgentAction } from "@/lib/mockData";
import { generateSegments } from "@/lib/generators/segments";
import { generateActions } from "@/lib/generators/actions";

type Step = "idle" | "audience" | "subscribers" | "segments" | "actions" | "done";

const STEP_LABELS: Record<string, { label: string; loading: string }> = {
  audience: { label: "Create Audience", loading: "Creating audience..." },
  subscribers: { label: "Import Subscribers", loading: "Importing 18,420 subscribers..." },
  segments: { label: "Generate Segments", loading: "Analyzing monetization patterns..." },
  actions: { label: "Generate Actions", loading: "Prioritizing revenue actions..." },
};

export default function DashboardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(false);

  async function runDemo() {
    setLoading(true);

    setStep("audience");
    await pause(500);

    setStep("subscribers");
    await pause(600);

    setStep("segments");
    await pause(400);
    const segs = generateSegments(MOCK_AUDIENCE, MOCK_SUBSCRIBERS);
    setSegments(segs);

    setStep("actions");
    await pause(500);
    const acts = generateActions(MOCK_AUDIENCE, segs);
    setActions(acts);

    setStep("done");
    setLoading(false);
  }

  const visible = actions.filter((a) => a.priority !== "hidden");
  const criticalCount = actions.filter((a) => a.priority === "critical").length;
  const highCount = actions.filter((a) => a.priority === "high").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">
            {step === "idle"
              ? "Run the pipeline to generate agent-ready actions."
              : step === "done"
              ? MOCK_AUDIENCE.name
              : STEP_LABELS[step]?.loading || "Processing..."}
          </p>
        </div>
        <div className="flex gap-2">
          {step === "done" && (
            <button
              onClick={() => router.push("/agent-feed")}
              className="inline-flex h-9 items-center rounded-lg border border-neon/30 px-5 text-sm font-semibold text-neon hover:bg-neon-glow transition-colors"
            >
              View Agent Feed
            </button>
          )}
          <button
            onClick={runDemo}
            disabled={loading}
            className="inline-flex h-9 items-center rounded-lg bg-neon px-5 text-sm font-bold text-background hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : step === "done" ? "Run Again" : "Run Demo"}
          </button>
        </div>
      </div>

      {step === "idle" ? (
        <EmptyState
          title="No data loaded"
          description='Click "Run Demo" to create a sample audience, generate monetizable segments, and produce scored agent actions in seconds.'
        />
      ) : (
        <>
          {/* Progress */}
          <div className="mb-8 flex items-center gap-1">
            {(["audience", "subscribers", "segments", "actions"] as const).map((s, i) => {
              const order = ["audience", "subscribers", "segments", "actions"];
              const currentIdx = order.indexOf(step === "done" ? "actions" : step);
              const done = i < currentIdx || step === "done";
              const current = i === currentIdx && step !== "done";

              return (
                <div key={s} className="flex items-center gap-1 flex-1">
                  {i > 0 && (
                    <div className={`h-px flex-1 ${done ? "bg-neon/40" : "bg-border-subtle"}`} />
                  )}
                  <div className="flex items-center gap-1.5">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                      done
                        ? "bg-neon text-background"
                        : current
                        ? "bg-neon/20 text-neon ring-1 ring-neon/40"
                        : "bg-white/[0.06] text-muted"
                    }`}>
                      {done ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-[11px] font-medium whitespace-nowrap ${done || current ? "text-white" : "text-muted"}`}>
                      {STEP_LABELS[s].label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Subscribers" value={MOCK_AUDIENCE.subscriber_count?.toLocaleString() || "0"} sub="imported" />
            <StatCard label="Segments" value={segments.length} sub="generated" />
            <StatCard label="Actions" value={visible.length} sub="visible" />
            <StatCard label="Critical" value={criticalCount} sub={`+ ${highCount} high priority`} highlight={criticalCount > 0} />
          </div>

          {/* Pipeline summary */}
          {step === "done" && (
            <div className="rounded-lg border border-border-subtle bg-surface p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Revenue Pipeline</h2>
              <div className="space-y-2.5">
                {visible.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 text-xs group">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${
                      a.priority === "critical" ? "bg-neon" : a.priority === "high" ? "bg-amber-400" : "bg-muted/30"
                    }`} />
                    <span className="text-white/80 flex-1 truncate group-hover:text-white transition-colors">{a.title}</span>
                    <span className={`font-mono font-bold tabular-nums ${a.priority === "critical" ? "text-neon" : "text-muted"}`}>{a.action_score}</span>
                    <span className="text-muted w-36 text-right">{a.estimated_value}</span>
                  </div>
                ))}
                {visible.length > 6 && (
                  <p className="text-[11px] text-muted pt-1">+ {visible.length - 6} more actions in the feed</p>
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
