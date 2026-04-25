"use client";

import { useState } from "react";
import SegmentCard from "@/components/SegmentCard";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { MOCK_AUDIENCE, MOCK_SUBSCRIBERS } from "@/lib/mockData";
import type { Segment } from "@/lib/mockData";
import { generateSegments } from "@/lib/generators/segments";

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const segs = generateSegments(MOCK_AUDIENCE, MOCK_SUBSCRIBERS);
    setSegments(segs);
    setLoading(false);
  }

  const highConf = segments.filter((s) => s.confidence >= 0.85).length;
  const totalSubs = segments.reduce((sum, s) => sum + s.subscriber_count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Segments</h1>
          <p className="mt-0.5 text-sm text-muted">
            {loading
              ? "Analyzing monetization patterns..."
              : segments.length > 0
              ? `${segments.length} monetizable segments from ${MOCK_AUDIENCE.name}`
              : "Generate revenue-focused segments from subscriber data."}
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex h-9 items-center rounded-lg bg-neon px-5 text-sm font-bold text-background hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? "Analyzing..." : segments.length > 0 ? "Regenerate" : "Generate Segments"}
        </button>
      </div>

      {segments.length === 0 && !loading ? (
        <EmptyState
          title="No segments generated"
          description="Generate segments to discover monetizable action clusters hidden in your audience data."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Segments" value={segments.length} sub="monetizable clusters" />
            <StatCard label="High Confidence" value={highConf} sub="85%+ confidence" highlight={highConf > 0} />
            <StatCard label="Subscribers Matched" value={totalSubs} sub="across all segments" />
          </div>

          <div className="grid gap-4">
            {segments.map((seg) => (
              <SegmentCard key={seg.id} segment={seg} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
