create table audiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  source text,
  created_at timestamptz default now()
);

create table subscribers (
  id uuid primary key default gen_random_uuid(),
  audience_id uuid references audiences(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  city text,
  state text,
  country text,
  income_tier text,
  industry text,
  job_title text,
  business_owner boolean,
  intent_categories text[],
  recent_activity text,
  engagement_score numeric,
  raw_data jsonb,
  created_at timestamptz default now()
);

create table segments (
  id uuid primary key default gen_random_uuid(),
  audience_id uuid references audiences(id) on delete cascade,
  name text not null,
  description text,
  segment_type text,
  subscriber_count int,
  defining_traits jsonb,
  monetization_paths jsonb,
  confidence numeric,
  created_at timestamptz default now()
);

create table agent_actions (
  id uuid primary key default gen_random_uuid(),
  audience_id uuid references audiences(id) on delete cascade,
  segment_id uuid references segments(id) on delete cascade,
  title text not null,
  action_type text,
  priority text,
  action_score numeric,
  urgency text,
  estimated_value text,
  recommended_channels text[],
  why_now text,
  reasoning jsonb,
  agent_instruction jsonb,
  status text default 'new',
  created_at timestamptz default now()
);
