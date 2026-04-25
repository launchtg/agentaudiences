export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-navy-light px-6 py-16 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06]">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-muted">
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-xs text-xs text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
