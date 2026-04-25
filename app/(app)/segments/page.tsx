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

  function generate() {
    const segs = generateSegments(MOCK_AUDIENCE, MOCK_SUBSCRIBERS);
    setSegments(segs);
  }

  const highConf = segments.filter((s) => s.confidence >= 0.85).length;
  const totalSubs = segments.reduce((sum, s) => sum + s.subscriber_count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Segments</h1>
          <p className="mt-0.5 text-sm text-muted">
            {segments.length > 0
              ? `${segments.length} monetizable segments from ${MOCK_AUDIENCE.name}`
              : "Generate revenue-focused segments from subscriber data."}
          </p>
        </div>
        <button
          onClick={generate}
          className="inline-flex h-9 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          {segments.length > 0 ? "Regenerate" : "Generate Segments"}
        </button>
      </div>

      {segments.length === 0 ? (
        <EmptyState
          title="No segments generated"
          description="Generate segments to discover monetizable clusters in your audience."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Segments" value={segments.length} />
            <StatCard label="High Confidence" value={highConf} sub="85%+ confidence" />
            <StatCard label="Subscribers Covered" value={totalSubs} sub="across all segments" />
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
