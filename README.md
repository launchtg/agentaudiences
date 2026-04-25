# AgentAudiences

AgentAudiences turns raw subscriber data into scored, agent-ready revenue actions. No generic personas — just monetizable audience segments and prioritized instructions your AI agents can execute autonomously.

Built for newsletter operators, B2B marketers, and anyone with a subscriber list who wants to know exactly what to do next and why.

## What It Does

1. **Import** subscriber data (email, demographics, intent signals, engagement scores)
2. **Segment** subscribers into monetizable action clusters (not generic personas)
3. **Score** every possible action using a multi-factor formula (intent × value × fit × timing × size ÷ effort)
4. **Prioritize** actions into an agent feed: critical, high, medium — hidden actions are filtered out
5. **Serve** a structured JSON API that AI agents can consume and execute

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (Postgres)
- **AI:** LLM prompt templates (Anthropic-ready) + deterministic mock generators for demo

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd agentaudiences
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your keys:

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, never exposed to browser) | Yes |
| `LLM_API_KEY` | Anthropic API key (not required for demo — mock generators work without it) | No |

### 3. Set up the database

Run the schema in your Supabase SQL Editor:

```sql
-- Copy the contents of supabase/schema.sql and run in Supabase SQL Editor
```

Or run it directly:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Paste the contents of `supabase/schema.sql`
4. Click **Run**

This creates four tables: `audiences`, `subscribers`, `segments`, `agent_actions`.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/                          → Next.js App Router
  (app)/                      → Layout group with sidebar
    dashboard/page.tsx        → Pipeline overview + demo runner
    audiences/page.tsx        → Subscriber table + audience stats
    segments/page.tsx         → Generated monetizable segments
    agent-feed/page.tsx       → Prioritized action feed + API preview
  api/
    audiences/route.ts        → POST: create audience
    subscribers/import/route.ts → POST: import subscribers
    segments/generate/route.ts  → POST: generate segments
    actions/generate/route.ts   → POST: generate actions
    actions/[actionId]/route.ts → PATCH: update action status
    agent-feed/[audienceId]/route.ts → GET: prioritized action feed

components/                   → UI components
  Sidebar.tsx                 → App navigation
  ActionCard.tsx              → Expandable action card with agent instructions
  SegmentCard.tsx             → Segment display with traits + monetization
  ApiPreview.tsx              → JSON preview panel with cURL example
  StatCard.tsx                → Metric display card
  EmptyState.tsx              → Empty state placeholder

lib/
  scoring.ts                  → Action scoring engine
  mockData.ts                 → Types + 24 mock subscribers
  supabase/client.ts          → Browser Supabase client
  supabase/server.ts          → Server Supabase client (service role protected)
  generators/segments.ts      → Deterministic segment generator
  generators/actions.ts       → Deterministic action generator
  prompts/segmentPrompt.ts    → LLM segment prompt
  prompts/actionPrompt.ts     → LLM action prompt

supabase/
  schema.sql                  → Database schema (4 tables)
```

## API Routes

### `POST /api/audiences`

Create a new audience.

```json
{ "name": "My Newsletter", "source": "csv_import" }
```

### `POST /api/subscribers/import`

Import subscribers into an audience.

```json
{
  "audience_id": "uuid",
  "subscribers": [
    {
      "email": "user@example.com",
      "first_name": "Jane",
      "industry": "SaaS",
      "engagement_score": 85
    }
  ]
}
```

### `POST /api/segments/generate`

Generate monetizable segments for an audience (uses deterministic generator).

```json
{ "audience_id": "uuid" }
```

### `POST /api/actions/generate`

Generate scored agent actions from segments.

```json
{ "audience_id": "uuid" }
```

### `GET /api/agent-feed/[audienceId]`

Returns prioritized, visible actions (medium+ priority) sorted by score descending. This is the endpoint AI agents consume.

```bash
curl -s http://localhost:3000/api/agent-feed/aud-001 | jq .
```

### `PATCH /api/actions/[actionId]`

Update an action's status.

```json
{ "status": "in_progress" }
```

Valid statuses: `new`, `in_progress`, `completed`, `dismissed`.

## MVP Demo Flow

The app includes deterministic mock generators so you can demo the full pipeline without a database or LLM key:

1. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2. Click **Load Sample Data**
3. Watch the pipeline process: Audience → Subscribers → Segments → Actions
4. Navigate to **Segments** to see monetizable audience clusters
5. Navigate to **Agent Feed** to see prioritized actions with scoring
6. Expand any action card to see full agent instructions
7. Click **Show API Preview** to see the JSON output an AI agent would consume

## Scoring Engine

Actions are scored using:

```
Action Score = (Intent × Audience Value × Sponsor Fit × Timing × Segment Size) ÷ Effort
```

Normalized to 0–100. Priority bands:

| Score | Priority | Visible |
|---|---|---|
| 90–100 | Critical | Yes |
| 75–89 | High | Yes |
| 55–74 | Medium | Yes |
| Below 55 | Hidden | No |

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: AgentAudiences MVP"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `LLM_API_KEY` (optional)
4. Click **Deploy**

The build command (`next build`) and output directory are auto-detected by Vercel.

### 3. Set up Supabase for production

Ensure your Supabase project has the schema applied and that RLS policies are configured for your use case.
