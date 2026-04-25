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
  const confPct = Math.round(segment.confidence * 100);

  return (
    <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden hover:border-border transition-colors">
      <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{segment.name}</h3>
          <p className="mt-0.5 text-xs text-muted leading-relaxed">{segment.description}</p>
        </div>
        <span className="shrink-0 rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-muted uppercase tracking-wider">
          {TYPE_LABELS[segment.segment_type] || segment.segment_type}
        </span>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-muted">Subscribers </span>
            <span className="font-semibold text-white">{segment.subscriber_count.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted">Confidence </span>
            <span className={`font-semibold ${confPct >= 85 ? "text-neon" : "text-white"}`}>{confPct}%</span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Defining Traits</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(segment.defining_traits).map(([k, v]) => (
              <span
                key={k}
                className="rounded bg-white/[0.05] px-2 py-0.5 text-[11px] text-muted-light/70 font-mono"
              >
                {k}:{v}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Monetization Paths</p>
          <div className="space-y-1.5">
            {segment.monetization_paths.map((mp, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                  mp.estimated_value === "high" ? "bg-neon" : mp.estimated_value === "medium" ? "bg-amber-400" : "bg-muted/30"
                }`} />
                <span className="text-white/70 leading-relaxed">{mp.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
