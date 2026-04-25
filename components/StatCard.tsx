export default function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-5 ${
      highlight
        ? "border-neon/20 bg-neon-glow"
        : "border-border-subtle bg-surface"
    }`}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-bold tracking-tight ${highlight ? "text-neon" : "text-white"}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}
