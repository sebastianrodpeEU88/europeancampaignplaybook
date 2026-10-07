-- ── Claiming the free workshop ───────────────────────────────────────────
-- Everyone gets one workshop on the house. Until now that was a convention
-- Sebastián kept in his head and recorded afterwards on the contact, while
-- the site let anybody with an account register for anything. Making the
-- workshops members-only turns the free one into something worth asking for,
-- and this table is the asking.
--
-- A claim is a request, not a booking. It is read by a person, approved or
-- refused, and only then does the claimant get to register through the normal
-- path, so the seat, the calendar invite and the reminder all still come from
-- one place.

create table if not exists public.free_workshop_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  event_slug text not null,
  event_title text,
  event_start timestamptz,
  status text not null default 'pending',
  -- What the scoring thought and why, frozen at the moment of claiming. Kept
  -- as written rather than recomputed later, so a decision can always be read
  -- back against what was actually known at the time.
  recommendation jsonb,
  claimed_at timestamptz not null default now(),
  decided_at timestamptz,
  reject_reason text,
  decision_note text,
  notified_at timestamptz,
  answered_at timestamptz,
  constraint free_workshop_claims_status_check check (
    status in ('pending', 'approved', 'rejected', 'withdrawn')
  )
);

-- One free workshop per person, ever. A pending or approved claim blocks a
-- second one; a rejected or withdrawn claim leaves them free to ask again for
-- a different workshop.
create unique index if not exists free_workshop_claims_one_live
  on public.free_workshop_claims (user_id)
  where status in ('pending', 'approved');

create index if not exists free_workshop_claims_queue
  on public.free_workshop_claims (status, claimed_at);

create index if not exists free_workshop_claims_event
  on public.free_workshop_claims (event_slug, status);

alter table public.free_workshop_claims enable row level security;

-- A person may see their own claims, which is what the event page button
-- reads to know whether to say "claim", "we are checking" or "register".
-- Creating and deciding stay server-side with the service role: a claim that
-- could be written from the browser could be written already approved.
drop policy if exists "read own claims" on public.free_workshop_claims;
create policy "read own claims" on public.free_workshop_claims
  for select using (auth.uid() = user_id);
