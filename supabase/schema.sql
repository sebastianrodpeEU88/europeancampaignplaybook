-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query)
-- after creating the project. Safe to re-run: uses "if not exists" / "or replace".

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  tier text check (tier in ('student', 'young_professional', 'standard')),
  billing_interval text check (billing_interval in ('month', 'year')),
  status text not null check (
    status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid')
  ),
  cancel_at_period_end boolean not null default false,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Additive migration for projects created before cancel_at_period_end existed.
alter table public.subscriptions
  add column if not exists cancel_at_period_end boolean not null default false;

alter table public.subscriptions enable row level security;

-- Users can read their own subscription row. All writes happen server-side
-- via the service role key (webhook handler), which bypasses RLS — no
-- insert/update/delete policy is granted to the authenticated role.
drop policy if exists "Users can view their own subscription" on public.subscriptions;
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Keeps updated_at current on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_updated_at();

-- Records a self-service deletion request. The account is banned (locked
-- out) immediately when a row is inserted here, but nothing is actually
-- purged automatically — invoice/subscription history in `subscriptions`
-- (and in Stripe itself) is legally required to be retained for tax
-- purposes, so full deletion of a user's auth record + personal data is a
-- deliberate manual step, done once the required retention period has
-- passed. Query this table periodically to see who's waiting.
create table if not exists public.deletion_requests (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  requested_at timestamptz not null default now()
);

alter table public.deletion_requests enable row level security;

-- Users can see that their own request was recorded. All writes happen
-- server-side via the service role key — no insert/update/delete policy is
-- granted to the authenticated role.
drop policy if exists "Users can view their own deletion request" on public.deletion_requests;
create policy "Users can view their own deletion request"
  on public.deletion_requests for select
  using (auth.uid() = user_id);
