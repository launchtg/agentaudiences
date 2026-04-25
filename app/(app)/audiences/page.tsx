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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Audiences</h1>
          <p className="mt-0.5 text-sm text-muted">
            {loaded ? MOCK_AUDIENCE.name : "Import or load subscriber data."}
          </p>
        </div>
        <button
          onClick={loadSample}
          className="inline-flex h-9 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          {loaded ? "Reload Sample" : "Load Sample Data"}
        </button>
      </div>

      {!loaded ? (
        <EmptyState
          title="No audience loaded"
          description="Load sample subscriber data to explore audience demographics and engagement."
        />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Subscribers" value={subscribers.length} />
            <StatCard label="Industries" value={industries.length} />
            <StatCard label="Business Owners" value={owners} sub={`${Math.round((owners / subscribers.length) * 100)}% of list`} />
            <StatCard label="Avg Engagement" value={avgEngagement} sub="out of 100" />
          </div>

          {/* Subscriber table */}
          <div className="rounded-lg border border-white/[0.06] bg-navy-light overflow-hidden">
            <div className="border-b border-white/[0.06] px-5 py-3">
              <h2 className="text-sm font-semibold text-white">Subscribers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="px-5 py-2.5 font-medium text-muted">Name</th>
                    <th className="px-5 py-2.5 font-medium text-muted">Title</th>
                    <th className="px-5 py-2.5 font-medium text-muted">Industry</th>
                    <th className="px-5 py-2.5 font-medium text-muted">Location</th>
                    <th className="px-5 py-2.5 font-medium text-muted">Activity</th>
                    <th className="px-5 py-2.5 font-medium text-muted text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-2.5 text-white font-medium whitespace-nowrap">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="px-5 py-2.5 text-white/70 whitespace-nowrap">{s.job_title}</td>
                      <td className="px-5 py-2.5 text-white/70">{s.industry}</td>
                      <td className="px-5 py-2.5 text-muted whitespace-nowrap">
                        {s.city}{s.state ? `, ${s.state}` : ""}, {s.country}
                      </td>
                      <td className="px-5 py-2.5">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          s.recent_activity.includes("inactive")
                            ? "bg-white/[0.04] text-muted/60"
                            : s.recent_activity.includes("replied")
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/[0.06] text-muted"
                        }`}>
                          {s.recent_activity.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <span className={`font-mono font-semibold ${
                          s.engagement_score >= 80 ? "text-emerald-400" : s.engagement_score >= 50 ? "text-white" : "text-muted/60"
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
