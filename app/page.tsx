import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <main className="flex flex-col items-center gap-8 text-center">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Agent<span className="text-accent">Audiences</span>
          </h1>
          <p className="mt-3 max-w-lg text-lg text-muted leading-relaxed">
            Turn your subscriber list into scored, agent-ready revenue actions.
            No guessing. No generic personas. Just monetizable segments and
            prioritized instructions your AI agents can execute.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-lg bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
          >
            Open Dashboard
          </Link>
          <Link
            href="/agent-feed"
            className="inline-flex h-11 items-center rounded-lg border border-white/10 px-6 text-sm font-medium text-white hover:bg-white/[0.04] transition-colors"
          >
            View Agent Feed
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-white">24</p>
            <p className="mt-0.5 text-xs text-muted">Sample Subscribers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">10</p>
            <p className="mt-0.5 text-xs text-muted">Segment Rules</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">8</p>
            <p className="mt-0.5 text-xs text-muted">Action Types</p>
          </div>
        </div>
      </main>
    </div>
  );
}
