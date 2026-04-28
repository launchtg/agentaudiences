"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import { MOCK_AUDIENCE, MOCK_SUBSCRIBERS } from "@/lib/mockData";
import { generateSegments } from "@/lib/generators/segments";
import { generateActions } from "@/lib/generators/actions";

/* ------------------------------------------------------------------ */
/*  LANDING PAGE                                                       */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const router = useRouter();
  const [running, setRunning] = useState(false);

  async function runDemo() {
    setRunning(true);
    const segs = generateSegments(MOCK_AUDIENCE, MOCK_SUBSCRIBERS);
    generateActions(MOCK_AUDIENCE, segs);
    await new Promise((r) => setTimeout(r, 500));
    router.push("/agent-feed?demo=1");
  }

  return (
    <div className="min-h-full">
      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neon/[0.08] bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Logo variant="horizontal" theme="dark" size="md" />
          <div className="hidden md:flex items-center gap-6 text-[13px] text-muted">
            <a href="#how-it-works" className="hover:text-neon transition-colors">How It Works</a>
            <a href="#agent-feed" className="hover:text-neon transition-colors">Agent Feed</a>
            <a href="#pricing" className="hover:text-neon transition-colors">Pricing</a>
          </div>
          <button
            onClick={runDemo}
            disabled={running}
            className="inline-flex h-8 items-center rounded-md bg-neon px-4 text-[12px] font-bold text-background hover:brightness-110 transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(212,255,0,0.15)]"
          >
            {running ? "Launching..." : "Run Demo"}
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-neon/[0.05] blur-[150px]" />
          <div className="absolute top-40 right-0 w-[500px] h-[500px] rounded-full bg-neon/[0.04] blur-[100px]" />
          <div className="absolute top-60 left-0 w-[300px] h-[300px] rounded-full bg-neon/[0.03] blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <p className="inline-block rounded-full border border-neon/30 bg-neon/[0.08] px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-neon mb-6 shadow-[0_0_15px_rgba(212,255,0,0.1)]">
                Agent-Ready Audience Intelligence
              </p>
              <h1 className="text-4xl md:text-[2.75rem] font-bold tracking-tight text-white leading-[1.12]">
                Your audience is sitting on{" "}
                <span className="text-neon">revenue</span>.{" "}
                <span className="text-muted">Your agents just don&apos;t know where to look.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base text-muted leading-relaxed">
                AgentAudiences turns your subscriber data into a live stream of
                sponsor, outreach, affiliate, and reactivation actions your AI
                agents can execute.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={runDemo}
                  disabled={running}
                  className="inline-flex h-12 items-center rounded-lg bg-neon px-7 text-sm font-bold text-background hover:brightness-110 transition-all disabled:opacity-60 shadow-[0_0_30px_rgba(212,255,0,0.2)]"
                >
                  {running ? "Launching..." : "Run the Demo"}
                </button>
                <a
                  href="/agent-feed"
                  className="inline-flex h-12 items-center rounded-lg border border-neon/20 px-7 text-sm font-medium text-neon hover:bg-neon/[0.06] transition-colors"
                >
                  See the Agent Feed
                </a>
              </div>

              <p className="mt-6 text-[12px] text-muted/60">
                Built for newsletter operators, publishers, data teams, and AI agents.
              </p>
            </div>

            {/* Right: Mock Agent Feed */}
            <div className="relative">
              <div className="rounded-xl border border-neon/20 bg-surface overflow-hidden shadow-[0_0_60px_rgba(212,255,0,0.06)]">
                {/* Feed header */}
                <div className="flex items-center justify-between border-b border-neon/10 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-white">Agent Feed</span>
                    <span className="relative rounded bg-neon/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-neon">
                      <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
                      <span className="pl-2">Live</span>
                    </span>
                  </div>
                  <span className="rounded bg-neon/[0.06] px-2 py-0.5 text-[10px] font-mono text-neon/70">JSON / API</span>
                </div>

                {/* Action cards */}
                <div className="p-3 space-y-2.5">
                  <MockActionCard
                    priority="critical"
                    title="Pitch SaaS Sponsors to High-Income Founders"
                    segment={418}
                    value="$6,200–$14,500"
                    score={92}
                  />
                  <MockActionCard
                    priority="high"
                    title="Re-engage Dormant High-Value Business Owners"
                    segment={276}
                    value="$2,100–$5,800"
                    score={81}
                  />
                  <MockActionCard
                    priority="medium"
                    title="Launch Affiliate Offer for Productivity Tools"
                    segment={903}
                    value="$1,800–$4,200"
                    score={67}
                  />
                </div>
              </div>
              {/* Glow behind panel */}
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-neon/[0.06] blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Neon divider ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />
      </div>

      {/* ── PROBLEM ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Your audience data is useful.{" "}
              <span className="text-neon/60">But your agents need instructions.</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base text-muted leading-relaxed">
              Most tools show you dashboards, charts, and segments. But they still
              leave the hard part to you: deciding what to do next.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <PainCard
              number="01"
              title="Dashboards don&apos;t execute"
              description="Reports tell you what happened. They don't tell your agents what to do about it."
            />
            <PainCard
              number="02"
              title="Agents need structured actions"
              description="AI agents can't act on pie charts. They need prioritized, scored instructions with clear next steps."
            />
            <PainCard
              number="03"
              title="Sponsor revenue hides in your segments"
              description="Your highest-value monetization opportunities are buried inside subscriber behavior patterns no dashboard surfaces."
            />
          </div>
        </div>
      </section>

      {/* ── Neon divider ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-neon/[0.03] blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="inline-block rounded-full border border-neon/20 bg-neon/[0.06] px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-neon mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              From audience data to <span className="text-neon">agent-ready</span> revenue actions.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <StepCard
              step="01"
              title="Connect or upload your audience"
              description="Beehiiv, Kit, HighLevel, or CSV. Bring your subscriber data in any format."
            />
            <StepCard
              step="02"
              title="Generate monetizable segments"
              description="Find high-value subscriber clusters, hidden sponsor angles, and intent patterns your agents can act on."
            />
            <StepCard
              step="03"
              title="Deploy the Agent Feed"
              description="Your agents receive prioritized actions with instructions, channels, timing, and expected value."
            />
          </div>
        </div>
      </section>

      {/* ── Neon divider ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />
      </div>

      {/* ── AGENT FEED SECTION ──────────────────────────────────── */}
      <section id="agent-feed" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <p className="inline-block rounded-full border border-neon/20 bg-neon/[0.06] px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-neon mb-3">Agent Feed</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                The feed your agents <span className="text-neon">actually need</span>.
              </h2>
              <p className="mt-4 text-base text-muted leading-relaxed">
                Every action answers what to do, who to act on, why now, what
                channel to use, and what outcome is possible.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Prioritized action scoring",
                  "Sponsor pitch recommendations",
                  "Affiliate and offer matching",
                  "Reactivation opportunities",
                  "API-ready JSON output",
                  "Human approval steps",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neon/15 shadow-[0_0_8px_rgba(212,255,0,0.1)]">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#D4FF00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* JSON preview */}
            <div className="relative">
              <div className="rounded-xl border border-neon/15 bg-surface overflow-hidden shadow-[0_0_40px_rgba(212,255,0,0.04)]">
                <div className="flex items-center justify-between border-b border-neon/10 px-5 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Agent-Ready Output</span>
                  <span className="rounded bg-neon/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-neon">JSON</span>
                </div>
                <pre className="px-5 py-4 text-[12px] leading-[1.7] text-white/60 font-mono overflow-x-auto">
{`{
  `}<span className="text-neon">&quot;action_type&quot;</span>{`: `}<span className="text-amber-300/80">&quot;sponsor_pitch&quot;</span>{`,
  `}<span className="text-neon">&quot;priority&quot;</span>{`: `}<span className="text-amber-300/80">&quot;critical&quot;</span>{`,
  `}<span className="text-neon">&quot;action_score&quot;</span>{`: `}<span className="text-neon font-bold">92</span>{`,
  `}<span className="text-neon">&quot;segment&quot;</span>{`: `}<span className="text-amber-300/80">&quot;High-Income SaaS Founders&quot;</span>{`,
  `}<span className="text-neon">&quot;estimated_value&quot;</span>{`: `}<span className="text-amber-300/80">&quot;$6,200–$14,500&quot;</span>{`,
  `}<span className="text-neon">&quot;agent_instruction&quot;</span>{`: {
    `}<span className="text-neon">&quot;goal&quot;</span>{`: `}<span className="text-amber-300/80">&quot;secure 1-2 sponsor deals&quot;</span>{`,
    `}<span className="text-neon">&quot;channel&quot;</span>{`: `}<span className="text-amber-300/80">&quot;email&quot;</span>{`,
    `}<span className="text-neon">&quot;approval_required&quot;</span>{`: `}<span className="text-neon font-bold">true</span>{`
  }
}`}
                </pre>
              </div>
              <div className="absolute -inset-4 -z-10 rounded-2xl bg-neon/[0.04] blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Neon divider ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />
      </div>

      {/* ── DIFFERENTIATION ─────────────────────────────────────── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-neon/[0.03] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Not another dashboard.{" "}
              <span className="text-neon">A different category entirely.</span>
            </h2>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-2 gap-px rounded-xl overflow-hidden border border-neon/10 bg-border-subtle">
              {/* Headers */}
              <div className="bg-surface px-6 py-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted/60">Traditional Analytics</p>
              </div>
              <div className="bg-surface px-6 py-4 border-l border-neon/10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neon">AgentAudiences</p>
              </div>
              {/* Rows */}
              {[
                ["Shows charts", "Creates actions"],
                ["Requires human interpretation", "Gives agents execution instructions"],
                ["Focuses on reporting", "Focuses on revenue"],
                ["Ends with insights", "Ends with agent-ready decisions"],
              ].map(([left, right], i) => (
                <div key={i} className="contents">
                  <div className="bg-background px-6 py-3.5 border-t border-border-subtle">
                    <p className="text-sm text-muted/60 line-through decoration-muted/20">{left}</p>
                  </div>
                  <div className="bg-background px-6 py-3.5 border-t border-l border-neon/10">
                    <p className="text-sm text-neon/90">{right}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Neon divider ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />
      </div>

      {/* ── USE CASES ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="inline-block rounded-full border border-neon/20 bg-neon/[0.06] px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-neon mb-3">Use Cases</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              What your agents can <span className="text-neon">do with it</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <UseCaseCard
              icon={<SponsorIcon />}
              title="Sponsor Sales Agent"
              description="Find sponsor categories and draft targeted pitches based on audience segments."
            />
            <UseCaseCard
              icon={<GrowthIcon />}
              title="Newsletter Growth Agent"
              description="Identify segments to reactivate or upsell for maximum subscriber lifetime value."
            />
            <UseCaseCard
              icon={<AdIcon />}
              title="Ad Operations Agent"
              description="Push high-intent segments into ad campaigns with matched creative and targeting."
            />
            <UseCaseCard
              icon={<RevenueIcon />}
              title="Revenue Strategy Agent"
              description="Spot hidden monetization angles inside the list that humans consistently miss."
            />
          </div>
        </div>
      </section>

      {/* ── Neon divider ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />
      </div>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon/[0.03] blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="inline-block rounded-full border border-neon/20 bg-neon/[0.06] px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-neon mb-3">Early Access Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Built for operators who want <span className="text-neon">revenue actions</span>,{" "}
              <span className="text-muted">not more reports.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <PricingCard
              title="Starter Snapshot"
              price="$97"
              period="one-time"
              features={[
                "One audience analysis",
                "Top 10 agent-ready actions",
                "Segment breakdown",
                "Great for testing one list",
              ]}
              cta="Get Started"
              onCtaClick={runDemo}
            />
            <PricingCard
              title="Operator"
              price="$497"
              period="/mo"
              featured
              features={[
                "Monthly action feed",
                "Up to 25,000 subscribers",
                "Agent API access",
                "Priority scoring engine",
                "Slack & webhook delivery",
              ]}
              cta="Run the Demo"
              onCtaClick={runDemo}
            />
            <PricingCard
              title="Scale"
              price="Custom"
              period=""
              features={[
                "Large audiences",
                "Custom integrations",
                "Advanced workflows",
                "Dedicated support",
                "White-label options",
              ]}
              cta="Request Access"
              onCtaClick={runDemo}
            />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-24 md:py-32 border-t border-neon/[0.08] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-neon/[0.06] blur-[120px]" />
          <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-neon/[0.03] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Logo variant="icon" theme="dark" size="lg" className="mx-auto mb-8 opacity-60" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Stop analyzing your audience.{" "}
            <span className="text-neon">Start deploying it.</span>
          </h2>
          <p className="mt-4 text-base text-muted leading-relaxed">
            Turn subscriber data into structured actions your agents can execute.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={runDemo}
              disabled={running}
              className="inline-flex h-12 items-center rounded-lg bg-neon px-8 text-sm font-bold text-background hover:brightness-110 transition-all disabled:opacity-60 shadow-[0_0_40px_rgba(212,255,0,0.25)]"
            >
              {running ? "Launching..." : "Run the Demo"}
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-neon/[0.08] py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo variant="horizontal" theme="dark" size="md" className="opacity-50" />
          <p className="text-[12px] text-muted/50 font-mono">
            Agent-ready audience intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SUB-COMPONENTS                                                     */
/* ------------------------------------------------------------------ */

function MockActionCard({
  priority,
  title,
  segment,
  value,
  score,
}: {
  priority: "critical" | "high" | "medium";
  title: string;
  segment: number;
  value: string;
  score: number;
}) {
  const styles = {
    critical: { border: "border-neon/30 shadow-[inset_0_0_20px_rgba(212,255,0,0.04)]", badge: "bg-neon/15 text-neon", scoreColor: "text-neon", dot: "bg-neon" },
    high: { border: "border-amber-400/20", badge: "bg-amber-400/10 text-amber-400", scoreColor: "text-amber-400", dot: "bg-amber-400" },
    medium: { border: "border-border-subtle", badge: "bg-white/[0.06] text-muted-light", scoreColor: "text-white", dot: "bg-muted" },
  };
  const s = styles[priority];

  return (
    <div className={`rounded-lg border ${s.border} bg-background p-3.5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${s.badge}`}>
              {priority}
            </span>
            <span className="text-[10px] text-muted">{segment.toLocaleString()} subscribers</span>
          </div>
          <p className="text-[13px] font-semibold text-white leading-snug">{title}</p>
          <p className="mt-1 text-[11px] text-muted">Est. value: <span className="text-neon/80 font-medium">{value}</span></p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className={`text-xl font-bold tabular-nums ${s.scoreColor}`}>{score}</span>
          <span className="text-[9px] text-muted font-mono -mt-0.5">/100</span>
        </div>
      </div>
    </div>
  );
}

function PainCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-6 hover:border-neon/20 transition-all group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neon/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <span className="text-[11px] font-bold text-neon font-mono">{number}</span>
        <h3 className="mt-2 text-[15px] font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-6 relative overflow-hidden group hover:border-neon/30 transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-neon/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-4 right-4 text-[48px] font-bold text-neon/[0.04] font-mono leading-none select-none">{step}</div>
      <div className="relative">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon/15 mb-4 shadow-[0_0_12px_rgba(212,255,0,0.1)]">
          <span className="text-[12px] font-bold text-neon font-mono">{step}</span>
        </div>
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function UseCaseCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-5 hover:border-neon/25 transition-all group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neon/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon/[0.12] mb-4 shadow-[0_0_12px_rgba(212,255,0,0.08)]">
          {icon}
        </div>
        <h3 className="text-[14px] font-semibold text-white group-hover:text-neon transition-colors">{title}</h3>
        <p className="mt-2 text-[13px] text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  period,
  features,
  cta,
  featured,
  onCtaClick,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  featured?: boolean;
  onCtaClick: () => void;
}) {
  return (
    <div className={`rounded-xl border p-6 flex flex-col relative overflow-hidden ${
      featured
        ? "border-neon/40 bg-neon/[0.04] shadow-[0_0_50px_rgba(212,255,0,0.08)]"
        : "border-border-subtle bg-surface hover:border-neon/15 transition-colors"
    }`}>
      {featured && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon to-transparent" />
      )}
      {featured && (
        <span className="self-start rounded bg-neon/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-neon mb-3">
          Most Popular
        </span>
      )}
      <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${featured ? "text-neon" : "text-white"}`}>{price}</span>
        {period && <span className="text-sm text-muted">{period}</span>}
      </div>
      <ul className="mt-5 space-y-2.5 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[13px] text-muted">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
              <path d="M2.5 6l2.5 2.5L9.5 4" stroke={featured ? "#D4FF00" : "#888"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onCtaClick}
        className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-bold transition-all ${
          featured
            ? "bg-neon text-background hover:brightness-110 shadow-[0_0_25px_rgba(212,255,0,0.2)]"
            : "border border-neon/20 text-neon hover:bg-neon/[0.06]"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

/* ── ICONS ──────────────────────────────────────────────────────── */

function SponsorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="4" width="14" height="10" rx="2" stroke="#D4FF00" strokeWidth="1.2" />
      <path d="M6 8.5h6M6 11h3" stroke="#D4FF00" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 14l4-5 3 3 5-7" stroke="#D4FF00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AdIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.5" stroke="#D4FF00" strokeWidth="1.2" />
      <circle cx="9" cy="9" r="2.5" stroke="#D4FF00" strokeWidth="1.2" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2v14M5 5.5C5 4.1 6.8 3 9 3s4 1.1 4 2.5S11.2 8 9 8 5 9.1 5 10.5 6.8 13 9 13s4-1.1 4-2.5" stroke="#D4FF00" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
