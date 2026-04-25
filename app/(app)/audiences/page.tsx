"use client";

import { useState } from "react";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { MOCK_AUDIENCE, MOCK_SUBSCRIBERS } from "@/lib/mockData";
import type { Subscriber } from "@/lib/mockData";

export default function AudiencesPage() {
  const [loaded, setLoaded] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  function loadSample() {
    setSubscribers(MOCK_SUBSCRIBERS);
    setLoaded(true);
  }

  const industries = [...new Set(subscribers.map((s) => s.industry))];
  const owners = subscribers.filter((s) => s.business_owner).length;
  const avgEngagement = subscribers.length
    ? Math.round(subscribers.reduce((sum, s) => sum + s.engagement_score, 0) / subscribers.length)
    : 0;
  const highIncome = subscribers.filter((s) => s.income_tier === "high").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Audiences</h1>
          <p className="mt-0.5 text-sm text-muted">
            {loaded ? `${MOCK_AUDIENCE.name} — ${MOCK_AUDIENCE.subscriber_count?.toLocaleString()} subscribers` : "Import or load subscriber data."}
          </p>
        </div>
        <button
          onClick={loadSample}
          className="inline-flex h-9 items-center rounded-lg bg-neon px-5 text-sm font-bold text-background hover:brightness-110 transition-all"
        >
          {loaded ? "Reload" : "Load Sample Data"}
        </button>
      </div>

      {!loaded ? (
        <EmptyState
          title="No audience loaded"
          description="Load sample subscriber data to explore demographics, engagement, and intent signals."
        />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Subscribers" value={MOCK_AUDIENCE.subscriber_count?.toLocaleString() || subscribers.length} sub="total list size" />
            <StatCard label="Industries" value={industries.length} sub={`${owners} business owners`} />
            <StatCard label="High Income" value={highIncome} sub={`${Math.round((highIncome / subscribers.length) * 100)}% of sample`} highlight />
            <StatCard label="Avg Engagement" value={avgEngagement} sub="out of 100" />
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden">
            <div className="border-b border-border-subtle px-5 py-3">
              <h2 className="text-sm font-semibold text-white">Subscriber Sample</h2>
              <p className="text-[11px] text-muted mt-0.5">{subscribers.length} records shown</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-left">
                    <th className="px-5 py-2.5 font-semibold text-muted uppercase tracking-wider text-[10px]">Name</th>
                    <th className="px-5 py-2.5 font-semibold text-muted uppercase tracking-wider text-[10px]">Title</th>
                    <th className="px-5 py-2.5 font-semibold text-muted uppercase tracking-wider text-[10px]">Industry</th>
                    <th className="px-5 py-2.5 font-semibold text-muted uppercase tracking-wider text-[10px]">Income</th>
                    <th className="px-5 py-2.5 font-semibold text-muted uppercase tracking-wider text-[10px]">Activity</th>
                    <th className="px-5 py-2.5 font-semibold text-muted uppercase tracking-wider text-[10px] text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s.id} className="border-b border-border-subtle/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-2.5 text-white font-medium whitespace-nowrap">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="px-5 py-2.5 text-white/60 whitespace-nowrap">{s.job_title}</td>
                      <td className="px-5 py-2.5 text-white/60">{s.industry}</td>
                      <td className="px-5 py-2.5">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          s.income_tier === "high" ? "bg-neon/10 text-neon" : s.income_tier === "medium" ? "bg-white/[0.06] text-muted-light" : "bg-white/[0.04] text-muted/60"
                        }`}>
                          {s.income_tier}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          s.recent_activity.includes("inactive")
                            ? "bg-white/[0.04] text-muted/50"
                            : s.recent_activity.includes("replied")
                            ? "bg-emerald-500/10 text-emerald-400"
                            : s.recent_activity.includes("clicked")
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-white/[0.06] text-muted"
                        }`}>
                          {s.recent_activity.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <span className={`font-mono font-semibold tabular-nums ${
                          s.engagement_score >= 80 ? "text-neon" : s.engagement_score >= 50 ? "text-white" : "text-muted/50"
                        }`}>
                          {s.engagement_score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
