const TYPE_LABELS: Record<string, string> = {
  intent_cluster: "Intent Cluster",
  behavioral_cohort: "Behavioral Cohort",
  demographic_slice: "Demographic Slice",
  reactivation_pool: "Reactivation Pool",
  high_value_tier: "High-Value Tier",
};

export default function SegmentCard({
  segment,
}: {
  segment: {
    name: string;
    description: string;
    segment_type: string;
    subscriber_count: number;
    defining_traits: Record<string, string>;
    monetization_paths: { path: string; description: string; estimated_value: string }[];
    confidence: number;
  };
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-navy-light overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{segment.name}</h3>
          <p className="mt-0.5 text-xs text-muted">{segment.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-muted">
          {TYPE_LABELS[segment.segment_type] || segment.segment_type}
        </span>
      </div>

      <div className="px-5 py-3 space-y-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted">Subscribers</span>
          <span className="font-semibold text-white">{segment.subscriber_count}</span>
          <span className="text-muted">Confidence</span>
          <span className="font-semibold text-white">{Math.round(segment.confidence * 100)}%</span>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted mb-1.5">Traits</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(segment.defining_traits).map(([k, v]) => (
              <span
                key={k}
                className="rounded bg-white/[0.06] px-2 py-0.5 text-[11px] text-muted"
              >
                {k}: {v}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted mb-1.5">Monetization</p>
          <div className="space-y-1">
            {segment.monetization_paths.map((mp, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  mp.estimated_value === "high" ? "bg-accent" : mp.estimated_value === "medium" ? "bg-amber-400" : "bg-muted/40"
                }`} />
                <span className="text-white/80">{mp.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
