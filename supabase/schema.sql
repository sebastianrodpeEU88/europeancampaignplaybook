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

-- Onboarding profile: one row per user. Users read/write their own row.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  career_stage text,
  organisation_type text,
  current_employer text,
  skills text[] not null default '{}',
  email_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Event registrations: one row per (member, event). Writes happen server-side
-- via the service role after a membership check; users may read their own.
create table if not exists public.event_registrations (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_slug text not null,
  event_title text,
  event_start timestamptz,
  event_location text,
  reminded_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, event_slug)
);

-- Additive migration for tables created before the reminder job existed.
alter table public.event_registrations
  add column if not exists reminded_at timestamptz;

alter table public.event_registrations enable row level security;

drop policy if exists "Users can view their own registrations" on public.event_registrations;
create policy "Users can view their own registrations"
  on public.event_registrations for select
  using (auth.uid() = user_id);

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


-- ---------------------------------------------------------------------------
-- Bootcamp progress
--
-- One row per (user, article) marked complete. Bootcamp episodes are free but
-- account-gated, so progress only ever exists for signed-in users. Writes are
-- the user's own; the admin dashboard reads across everyone with the service
-- role key, which bypasses RLS.
-- ---------------------------------------------------------------------------
create table if not exists public.bootcamp_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  article_slug text not null,
  bootcamp_slug text,
  article_title text,
  episode_label text,
  completed_at timestamptz not null default now(),
  primary key (user_id, article_slug)
);

create index if not exists bootcamp_progress_bootcamp_idx
  on public.bootcamp_progress (bootcamp_slug);

alter table public.bootcamp_progress enable row level security;

drop policy if exists "Users can view their own bootcamp progress" on public.bootcamp_progress;
create policy "Users can view their own bootcamp progress"
  on public.bootcamp_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Users can record their own bootcamp progress" on public.bootcamp_progress;
create policy "Users can record their own bootcamp progress"
  on public.bootcamp_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can clear their own bootcamp progress" on public.bootcamp_progress;
create policy "Users can clear their own bootcamp progress"
  on public.bootcamp_progress for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- Contacts: the master person record
--
-- One row per human, keyed on the normalised email address, so a duplicate is
-- impossible at the database level. Site accounts link through user_id; people
-- who never sign up (form leads, workshop attendees, newsletter-only readers)
-- live here too, with user_id null.
--
-- The channel columns (membership, events, bootcamp) are denormalised on
-- purpose: one read gives the whole picture of a person, which is exactly what
-- Notion and beehiiv need pushed to them.
-- ---------------------------------------------------------------------------
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalised text generated always as (lower(btrim(email))) stored,
  user_id uuid unique references auth.users (id) on delete set null,

  first_name text,
  last_name text,
  phone text,
  career_stage text,
  organisation_type text,
  company text,

  membership_tier text,
  membership_status text,
  member_since timestamptz,

  newsletter_opt_in boolean not null default false,
  newsletter_status text not null default 'none'
    check (newsletter_status in ('none', 'pending', 'subscribed', 'unsubscribed', 'bounced')),

  events_registered integer not null default 0,
  last_event_slug text,
  last_event_at timestamptz,
  bootcamp_days_done integer not null default 0,

  -- Where this person first reached us, and everything they have touched since.
  source text,
  sources text[] not null default '{}',

  -- Written back by the sync worker so an update always lands on the same page
  -- and the same subscriber.
  notion_page_id text,
  beehiiv_subscription_id text,
  last_synced_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists contacts_email_normalised_key
  on public.contacts (email_normalised);

alter table public.contacts enable row level security;
-- No policies: contacts are read and written server-side with the service role.

drop trigger if exists set_contacts_updated_at on public.contacts;
create trigger set_contacts_updated_at
  before update on public.contacts
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- The outbox: every change to a contact queues one push to the channels
--
-- A trigger fills this, so a new feature cannot forget to sync. At most one
-- pending row per contact, and the worker marks it synced when both channels
-- have taken the update.
-- ---------------------------------------------------------------------------
create table if not exists public.contact_sync_queue (
  id bigserial primary key,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  reason text,
  enqueued_at timestamptz not null default now(),
  attempts integer not null default 0,
  last_error text,
  synced_at timestamptz
);

create unique index if not exists contact_sync_queue_one_pending
  on public.contact_sync_queue (contact_id) where synced_at is null;

create index if not exists contact_sync_queue_pending_idx
  on public.contact_sync_queue (enqueued_at) where synced_at is null;

alter table public.contact_sync_queue enable row level security;

create or replace function public.enqueue_contact_sync()
returns trigger
language plpgsql
as $$
begin
  -- The worker stamps its own bookkeeping columns; those writes must not
  -- queue another push, or the two would chase each other forever.
  if tg_op = 'UPDATE'
     and (to_jsonb(new) - 'updated_at' - 'last_synced_at' - 'notion_page_id' - 'beehiiv_subscription_id')
       = (to_jsonb(old) - 'updated_at' - 'last_synced_at' - 'notion_page_id' - 'beehiiv_subscription_id')
  then
    return new;
  end if;

  insert into public.contact_sync_queue (contact_id, reason)
  values (new.id, lower(tg_op))
  on conflict (contact_id) where synced_at is null
  do update set enqueued_at = now(), reason = excluded.reason, attempts = 0, last_error = null;

  return new;
end;
$$;

drop trigger if exists enqueue_contact_sync on public.contacts;
create trigger enqueue_contact_sync
  after insert or update on public.contacts
  for each row
  execute function public.enqueue_contact_sync();

-- ---------------------------------------------------------------------------
-- One write path
--
-- Everything that learns about a person calls upsert_contact: the site, the
-- Stripe webhook, a form intake, an import. Email is the key, normalised, so
-- the same person can never be created twice.
-- ---------------------------------------------------------------------------
create or replace function public.upsert_contact(
  p_email text,
  p_user_id uuid default null,
  p_source text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_email is null or btrim(p_email) = '' then
    return null;
  end if;

  insert into public.contacts (email, user_id, source, sources)
  values (
    btrim(p_email),
    p_user_id,
    p_source,
    case when p_source is null then '{}'::text[] else array[p_source] end
  )
  on conflict (email_normalised) do update
    set user_id = coalesce(public.contacts.user_id, excluded.user_id),
        sources = case
          when p_source is null or public.contacts.sources @> array[p_source] then public.contacts.sources
          else public.contacts.sources || p_source
        end
  returning id into v_id;

  return v_id;
end;
$$;

-- Recompute everything the channels care about for one account, from the
-- tables that already hold the truth. Called by the triggers below, so a
-- membership change, a registration or a completed bootcamp day updates the
-- contact the moment it happens.
create or replace function public.refresh_contact_for_user(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_id uuid;
begin
  if p_user_id is null then
    return null;
  end if;

  select coalesce(nullif(btrim(p.email), ''), u.email)
    into v_email
    from auth.users u
    left join public.profiles p on p.user_id = u.id
   where u.id = p_user_id;

  if v_email is null then
    return null;
  end if;

  v_id := public.upsert_contact(v_email, p_user_id, 'website');

  update public.contacts c set
    email = coalesce(nullif(btrim((select email from public.profiles where user_id = p_user_id)), ''), c.email),
    first_name = coalesce((select first_name from public.profiles where user_id = p_user_id), c.first_name),
    last_name = coalesce((select last_name from public.profiles where user_id = p_user_id), c.last_name),
    phone = coalesce((select phone from public.profiles where user_id = p_user_id), c.phone),
    career_stage = coalesce((select career_stage from public.profiles where user_id = p_user_id), c.career_stage),
    organisation_type = coalesce((select organisation_type from public.profiles where user_id = p_user_id), c.organisation_type),
    company = coalesce((select current_employer from public.profiles where user_id = p_user_id), c.company),
    newsletter_opt_in = coalesce((select email_opt_in from public.profiles where user_id = p_user_id), c.newsletter_opt_in),
    membership_tier = (select tier from public.subscriptions where user_id = p_user_id),
    membership_status = (select status from public.subscriptions where user_id = p_user_id),
    member_since = coalesce(c.member_since, (select created_at from public.subscriptions where user_id = p_user_id)),
    events_registered = (select count(*) from public.event_registrations where user_id = p_user_id),
    last_event_slug = (select event_slug from public.event_registrations where user_id = p_user_id
                        order by event_start desc nulls last limit 1),
    last_event_at = (select event_start from public.event_registrations where user_id = p_user_id
                      order by event_start desc nulls last limit 1),
    bootcamp_days_done = (select count(*) from public.bootcamp_progress where user_id = p_user_id)
  where c.id = v_id;

  return v_id;
end;
$$;

-- The four tables that describe an account, each keeping the contact current.
create or replace function public.refresh_contact_from_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_contact_for_user(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_contact_from_profile on public.profiles;
create trigger refresh_contact_from_profile
  after insert or update or delete on public.profiles
  for each row execute function public.refresh_contact_from_row();

drop trigger if exists refresh_contact_from_subscription on public.subscriptions;
create trigger refresh_contact_from_subscription
  after insert or update or delete on public.subscriptions
  for each row execute function public.refresh_contact_from_row();

drop trigger if exists refresh_contact_from_registration on public.event_registrations;
create trigger refresh_contact_from_registration
  after insert or update or delete on public.event_registrations
  for each row execute function public.refresh_contact_from_row();

drop trigger if exists refresh_contact_from_bootcamp on public.bootcamp_progress;
create trigger refresh_contact_from_bootcamp
  after insert or update or delete on public.bootcamp_progress
  for each row execute function public.refresh_contact_from_row();

-- ---------------------------------------------------------------------------
-- Backfill: every existing account becomes a contact, with its rollups.
-- Safe to re-run; the unique email index collapses anything already there.
-- ---------------------------------------------------------------------------
insert into public.contacts (email, user_id, source, sources)
select distinct on (lower(btrim(coalesce(nullif(btrim(p.email), ''), u.email))))
       coalesce(nullif(btrim(p.email), ''), u.email),
       u.id,
       'website',
       array['website']
  from auth.users u
  left join public.profiles p on p.user_id = u.id
 where coalesce(nullif(btrim(p.email), ''), u.email) is not null
 order by lower(btrim(coalesce(nullif(btrim(p.email), ''), u.email))), u.created_at
on conflict (email_normalised) do update
  set user_id = coalesce(public.contacts.user_id, excluded.user_id);

select public.refresh_contact_for_user(u.id) from auth.users u;

-- Memberships created by hand (legacy and corporate) carry a plan label and a
-- source rather than a Stripe tier, so the contact holds all three and the
-- channels can segment on whichever one is filled.
alter table public.contacts add column if not exists membership_plan text;
alter table public.contacts add column if not exists membership_source text;

create or replace function public.refresh_contact_for_user(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_id uuid;
begin
  if p_user_id is null then
    return null;
  end if;

  select coalesce(nullif(btrim(p.email), ''), u.email)
    into v_email
    from auth.users u
    left join public.profiles p on p.user_id = u.id
   where u.id = p_user_id;

  if v_email is null then
    return null;
  end if;

  v_id := public.upsert_contact(v_email, p_user_id, 'website');

  update public.contacts c set
    email = coalesce(nullif(btrim((select email from public.profiles where user_id = p_user_id)), ''), c.email),
    first_name = coalesce((select first_name from public.profiles where user_id = p_user_id), c.first_name),
    last_name = coalesce((select last_name from public.profiles where user_id = p_user_id), c.last_name),
    phone = coalesce((select phone from public.profiles where user_id = p_user_id), c.phone),
    career_stage = coalesce((select career_stage from public.profiles where user_id = p_user_id), c.career_stage),
    organisation_type = coalesce((select organisation_type from public.profiles where user_id = p_user_id), c.organisation_type),
    company = coalesce((select current_employer from public.profiles where user_id = p_user_id), c.company),
    newsletter_opt_in = coalesce((select email_opt_in from public.profiles where user_id = p_user_id), c.newsletter_opt_in),
    membership_tier = (select tier from public.subscriptions where user_id = p_user_id),
    membership_plan = (select plan_label from public.subscriptions where user_id = p_user_id),
    membership_source = (select source from public.subscriptions where user_id = p_user_id),
    membership_status = (select status from public.subscriptions where user_id = p_user_id),
    member_since = coalesce(c.member_since, (select created_at from public.subscriptions where user_id = p_user_id)),
    events_registered = (select count(*) from public.event_registrations where user_id = p_user_id),
    last_event_slug = (select event_slug from public.event_registrations where user_id = p_user_id
                        order by event_start desc nulls last limit 1),
    last_event_at = (select event_start from public.event_registrations where user_id = p_user_id
                      order by event_start desc nulls last limit 1),
    bootcamp_days_done = (select count(*) from public.bootcamp_progress where user_id = p_user_id)
  where c.id = v_id;

  return v_id;
end;
$$;

select public.refresh_contact_for_user(u.id) from auth.users u;

-- ---------------------------------------------------------------------------
-- Junk: signup spam and test addresses stay in the database and out of the
-- channels. Nothing is deleted, so a wrong call is one update away from being
-- put right, and the admin panel can still show who was set aside.
-- ---------------------------------------------------------------------------
alter table public.contacts add column if not exists status text not null default 'active';
alter table public.contacts drop constraint if exists contacts_status_check;
alter table public.contacts add constraint contacts_status_check check (status in ('active', 'junk'));

create index if not exists contacts_status_idx on public.contacts (status);

-- Test addresses.
update public.contacts set status = 'junk'
 where status = 'active'
   and (email_normalised like '%@example.com' or email_normalised like 'e2e-test@%');

-- Phone-to-email gateways: never a person reading a newsletter.
update public.contacts set status = 'junk'
 where status = 'active'
   and (email_normalised like '%@txt.att.net'
     or email_normalised like '%@vtext.com'
     or email_normalised like '%@tmomail.net'
     or email_normalised like '%@messaging.sprintpcs.com');

-- gmail ignores dots in the local part, so a scattering of them is the
-- signature of one address signing up many times. Four or more is well past
-- what anybody types by hand.
update public.contacts set status = 'junk'
 where status = 'active'
   and email_normalised like '%@gmail.com'
   and length(split_part(email_normalised, '@', 1))
       - length(replace(split_part(email_normalised, '@', 1), '.', '')) >= 4;

-- ---------------------------------------------------------------------------
-- The sales funnel
--
-- One stage per contact, enforced by a check constraint: a record can only
-- hold one value, so "in two stages at once" cannot happen.
--
-- Where somebody came from and what kind of client they are travel alongside
-- the stage rather than inside it, so the source survives every promotion and
-- questions like "how many LinkedIn leads became clients" stay answerable.
--
-- The facts move the stage forward by themselves (an info session booked, a
-- workshop attended, a membership started). Judgement stages — a conversation
-- asked for, someone about to sign, lost, dormant — are set by hand and are
-- never overwritten by the automation, which only ever moves a contact
-- forward.
-- ---------------------------------------------------------------------------
alter table public.contacts add column if not exists stage text not null default 'lead';
alter table public.contacts drop constraint if exists contacts_stage_check;
alter table public.contacts add constraint contacts_stage_check check (stage in (
  'lead',                  -- knows we exist
  'prospect_info_session', -- signed up to a free info session
  'prospect_conversation', -- asked for a conversation
  'prospect_workshop',     -- attended a workshop
  'prospect_closing',      -- about to become a client
  'client',                -- paying, in whatever form
  'lost',                  -- said no, or went cold for good
  'dormant'                -- parked, worth coming back to
));

alter table public.contacts add column if not exists stage_changed_at timestamptz not null default now();
alter table public.contacts add column if not exists stage_note text;
alter table public.contacts add column if not exists stage_actor text;

alter table public.contacts add column if not exists acquisition_source text;
alter table public.contacts drop constraint if exists contacts_acquisition_source_check;
alter table public.contacts add constraint contacts_acquisition_source_check check (
  acquisition_source is null or acquisition_source in (
    'linkedin_ads', 'instagram_ads', 'organic_search', 'website_request',
    'newsletter', 'event', 'referral', 'other'
  )
);

alter table public.contacts add column if not exists client_type text;
alter table public.contacts drop constraint if exists contacts_client_type_check;
alter table public.contacts add constraint contacts_client_type_check check (
  client_type is null or client_type in ('corporate', 'legacy', 'individual')
);

create index if not exists contacts_stage_idx on public.contacts (stage);

-- How far along a stage is. Only used to compare two stages, so the gaps and
-- the two stages left out (lost, dormant) are deliberate: the automation can
-- never put somebody there, and never pulls anybody backwards.
create or replace function public.stage_rank(p_stage text)
returns integer
language sql
immutable
as $$
  select case p_stage
    when 'lead' then 1
    when 'prospect_info_session' then 2
    when 'prospect_conversation' then 3
    when 'prospect_workshop' then 4
    when 'prospect_closing' then 5
    when 'client' then 6
    else 0
  end;
$$;

-- Every move, with what it came from, so time-in-stage and conversion between
-- stages can be read off the table later.
create table if not exists public.contact_stage_events (
  id bigserial primary key,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  from_stage text,
  to_stage text not null,
  changed_by text,
  note text,
  changed_at timestamptz not null default now()
);

create index if not exists contact_stage_events_contact_idx
  on public.contact_stage_events (contact_id, changed_at desc);

alter table public.contact_stage_events enable row level security;

-- The timestamp has to be set before the row is written, because it changes
-- the row itself.
create or replace function public.stamp_stage_changed_at()
returns trigger
language plpgsql
as $$
begin
  if new.stage is distinct from old.stage then
    new.stage_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists stamp_stage_changed_at on public.contacts;
create trigger stamp_stage_changed_at
  before update of stage on public.contacts
  for each row execute function public.stamp_stage_changed_at();

-- The history row has to be written after, because it points at the contact
-- by foreign key and the contact only exists once the insert has happened.
-- An "on conflict do update" fires the before-insert triggers even when it
-- ends up updating, so a before trigger here would reference a row that never
-- came into being.
create or replace function public.record_stage_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.contact_stage_events (contact_id, from_stage, to_stage, changed_by)
    values (new.id, null, new.stage, 'created');
  elsif new.stage is distinct from old.stage then
    insert into public.contact_stage_events (contact_id, from_stage, to_stage, changed_by, note)
    values (new.id, old.stage, new.stage, coalesce(new.stage_actor, 'automatic'), new.stage_note);
  end if;
  return null;
end;
$$;

drop trigger if exists record_stage_change on public.contacts;
create trigger record_stage_change
  after insert or update of stage on public.contacts
  for each row execute function public.record_stage_change();

-- Notes live beside the person, so the whole history of a relationship is in
-- one place and survives whatever happens to any other tool.
create table if not exists public.contact_notes (
  id bigserial primary key,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  body text not null,
  author text,
  created_at timestamptz not null default now()
);

create index if not exists contact_notes_contact_idx
  on public.contact_notes (contact_id, created_at desc);

alter table public.contact_notes enable row level security;

-- The facts advance the funnel. Called from refresh_contact_for_user, so a
-- booking, a workshop or a membership moves somebody along the moment it
-- happens, with no one having to remember.
create or replace function public.advance_contact_stage(p_contact_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
  v_earned text := 'lead';
  v_member text;
  v_source text;
begin
  select stage into v_current from public.contacts where id = p_contact_id;

  -- Somebody parked or written off stays where they were put, until a human
  -- moves them.
  if v_current in ('lost', 'dormant') then
    return;
  end if;

  -- An info session booked.
  if exists (
    select 1 from public.event_registrations
     where user_id = p_user_id
       and (event_slug like '%info-session%' or event_slug like '%live-demo%')
  ) then
    v_earned := 'prospect_info_session';
  end if;

  -- Any other event is a workshop.
  if exists (
    select 1 from public.event_registrations
     where user_id = p_user_id
       and event_slug not like '%info-session%'
       and event_slug not like '%live-demo%'
  ) then
    v_earned := 'prospect_workshop';
  end if;

  -- Paying, in whatever form.
  select status, source into v_member
       , v_source
    from public.subscriptions where user_id = p_user_id;

  if v_member in ('active', 'trialing') then
    v_earned := 'client';
  end if;

  -- Forward only: a hand-set stage further along is never undone.
  if public.stage_rank(v_earned) > public.stage_rank(v_current) then
    update public.contacts
       set stage = v_earned, stage_note = null, stage_actor = 'automatic'
     where id = p_contact_id;
  end if;

  -- What kind of client, from how the membership was created.
  if v_member is not null then
    update public.contacts
       set client_type = case v_source
             when 'corporate' then 'corporate'
             when 'legacy' then 'legacy'
             else 'individual'
           end
     where id = p_contact_id and client_type is null;
  end if;
end;
$$;

-- Hook it into the refresh every account write already performs.
create or replace function public.refresh_contact_for_user(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_id uuid;
begin
  if p_user_id is null then
    return null;
  end if;

  select coalesce(nullif(btrim(p.email), ''), u.email)
    into v_email
    from auth.users u
    left join public.profiles p on p.user_id = u.id
   where u.id = p_user_id;

  if v_email is null then
    return null;
  end if;

  v_id := public.upsert_contact(v_email, p_user_id, 'website');

  update public.contacts c set
    email = coalesce(nullif(btrim((select email from public.profiles where user_id = p_user_id)), ''), c.email),
    first_name = coalesce((select first_name from public.profiles where user_id = p_user_id), c.first_name),
    last_name = coalesce((select last_name from public.profiles where user_id = p_user_id), c.last_name),
    phone = coalesce((select phone from public.profiles where user_id = p_user_id), c.phone),
    career_stage = coalesce((select career_stage from public.profiles where user_id = p_user_id), c.career_stage),
    organisation_type = coalesce((select organisation_type from public.profiles where user_id = p_user_id), c.organisation_type),
    company = coalesce((select current_employer from public.profiles where user_id = p_user_id), c.company),
    newsletter_opt_in = coalesce((select email_opt_in from public.profiles where user_id = p_user_id), c.newsletter_opt_in),
    membership_tier = (select tier from public.subscriptions where user_id = p_user_id),
    membership_plan = (select plan_label from public.subscriptions where user_id = p_user_id),
    membership_source = (select source from public.subscriptions where user_id = p_user_id),
    membership_status = (select status from public.subscriptions where user_id = p_user_id),
    member_since = coalesce(c.member_since, (select created_at from public.subscriptions where user_id = p_user_id)),
    events_registered = (select count(*) from public.event_registrations where user_id = p_user_id),
    last_event_slug = (select event_slug from public.event_registrations where user_id = p_user_id
                        order by event_start desc nulls last limit 1),
    last_event_at = (select event_start from public.event_registrations where user_id = p_user_id
                      order by event_start desc nulls last limit 1),
    bootcamp_days_done = (select count(*) from public.bootcamp_progress where user_id = p_user_id)
  where c.id = v_id;

  perform public.advance_contact_stage(v_id, p_user_id);

  return v_id;
end;
$$;

-- Put every existing contact where the facts say it belongs.
select public.refresh_contact_for_user(u.id) from auth.users u;

-- ---------------------------------------------------------------------------
-- Attendance, and the free workshop
--
-- The site knows who registered. Only a human knows who turned up, and only a
-- human knows whether a workshop was the free one somebody is entitled to. So
-- registrations gain an attendance stamp and a kind, contacts gain the counts
-- and the free-workshop record, and the funnel learns to tell "booked" from
-- "came" from "booked and never appeared".
-- ---------------------------------------------------------------------------
alter table public.event_registrations add column if not exists attended_at timestamptz;
alter table public.event_registrations add column if not exists event_kind text;

alter table public.event_registrations drop constraint if exists event_registrations_kind_check;
alter table public.event_registrations add constraint event_registrations_kind_check check (
  event_kind is null or event_kind in ('info_session', 'workshop', 'other')
);

-- Info sessions and live demos are the open door; everything else we run is a
-- workshop. Backfilled from the slug, and set the same way on new rows.
update public.event_registrations
   set event_kind = case
         when event_slug like '%info-session%' or event_slug like '%live-demo%' then 'info_session'
         else 'workshop'
       end
 where event_kind is null;

create or replace function public.set_event_kind()
returns trigger
language plpgsql
as $$
begin
  if new.event_kind is null then
    new.event_kind := case
      when new.event_slug like '%info-session%' or new.event_slug like '%live-demo%' then 'info_session'
      else 'workshop'
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists set_event_kind on public.event_registrations;
create trigger set_event_kind
  before insert or update on public.event_registrations
  for each row execute function public.set_event_kind();

alter table public.contacts add column if not exists info_sessions_registered integer not null default 0;
alter table public.contacts add column if not exists info_sessions_attended integer not null default 0;
alter table public.contacts add column if not exists info_session_no_shows integer not null default 0;
alter table public.contacts add column if not exists workshops_registered integer not null default 0;
alter table public.contacts add column if not exists workshops_attended integer not null default 0;
alter table public.contacts add column if not exists workshop_no_shows integer not null default 0;

-- One free workshop per person: the date it was used, and which one it was.
alter table public.contacts add column if not exists free_workshop_used_at timestamptz;
alter table public.contacts add column if not exists free_workshop_event text;

-- The funnel, with attendance in it. The constraint is validated against
-- every existing row the moment it is added, so anyone sitting on a stage
-- name from the first version moves across first.
alter table public.contacts drop constraint if exists contacts_stage_check;

update public.contacts set stage = 'info_registered' where stage = 'prospect_info_session';
update public.contacts set stage = 'workshop_attended' where stage = 'prospect_workshop';

alter table public.contacts add constraint contacts_stage_check check (stage in (
  'lead',                     -- knows we exist
  'info_registered',          -- booked an info session
  'info_no_show',             -- booked one and never appeared
  'info_attended',            -- came to an info session
  'prospect_conversation',    -- asked for a conversation
  'workshop_registered',      -- booked a workshop
  'workshop_no_show',         -- booked one and never appeared
  'workshop_attended',        -- came to a workshop, set by hand
  'prospect_closing',         -- about to become a client
  'client',                   -- paying, in whatever form
  'not_now',                  -- asked us to come back later
  'lost',                     -- said no
  'dormant'                   -- went quiet
));

create or replace function public.stage_rank(p_stage text)
returns integer
language sql
immutable
as $$
  select case p_stage
    when 'lead' then 1
    when 'info_registered' then 2
    when 'info_no_show' then 2
    when 'info_attended' then 3
    when 'prospect_conversation' then 4
    when 'workshop_registered' then 5
    when 'workshop_no_show' then 5
    when 'workshop_attended' then 6
    when 'prospect_closing' then 7
    when 'client' then 8
    else 0
  end;
$$;

-- The rules, with attendance
--
-- Registrations and memberships move somebody forward. Turning up moves them
-- further. A booking that has come and gone with no attendance recorded moves
-- sideways to a no-show, which keeps the fact visible without pretending the
-- person went backwards.
--
-- Attending a workshop stays a human decision, because only a human knows
-- whether the workshop was the free one.
create or replace function public.advance_contact_stage(p_contact_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
  v_earned text := 'lead';
  v_member text;
  v_source text;
  v_info_reg integer;
  v_info_att integer;
  v_info_missed integer;
  v_work_reg integer;
  v_work_att integer;
  v_work_missed integer;
begin
  select stage into v_current from public.contacts where id = p_contact_id;

  select
    count(*) filter (where event_kind = 'info_session'),
    count(*) filter (where event_kind = 'info_session' and attended_at is not null),
    count(*) filter (where event_kind = 'info_session' and attended_at is null
                       and coalesce(event_start, now()) < now() - interval '4 hours'),
    count(*) filter (where event_kind <> 'info_session'),
    count(*) filter (where event_kind <> 'info_session' and attended_at is not null),
    count(*) filter (where event_kind <> 'info_session' and attended_at is null
                       and coalesce(event_start, now()) < now() - interval '4 hours')
    into v_info_reg, v_info_att, v_info_missed, v_work_reg, v_work_att, v_work_missed
    from public.event_registrations
   where user_id = p_user_id;

  update public.contacts set
    info_sessions_registered = v_info_reg,
    info_sessions_attended = v_info_att,
    info_session_no_shows = v_info_missed,
    workshops_registered = v_work_reg,
    workshops_attended = v_work_att,
    workshop_no_shows = v_work_missed
  where id = p_contact_id;

  -- Somebody parked, written off, or who asked us to come back later stays
  -- where a human put them.
  if v_current in ('lost', 'dormant', 'not_now') then
    return;
  end if;

  if v_info_reg > 0 then v_earned := 'info_registered'; end if;
  if v_info_att > 0 then v_earned := 'info_attended'; end if;
  if v_work_reg > 0 and public.stage_rank('workshop_registered') > public.stage_rank(v_earned) then
    v_earned := 'workshop_registered';
  end if;

  select status, source into v_member, v_source
    from public.subscriptions where user_id = p_user_id;

  if v_member in ('active', 'trialing') then
    v_earned := 'client';
  end if;

  if public.stage_rank(v_earned) > public.stage_rank(v_current) then
    update public.contacts
       set stage = v_earned, stage_note = null, stage_actor = 'automatic'
     where id = p_contact_id;
    v_current := v_earned;
  end if;

  -- Sideways, once the event has passed with nobody recording attendance.
  if v_current = 'info_registered' and v_info_missed > 0 and v_info_att = 0 then
    update public.contacts set stage = 'info_no_show', stage_actor = 'automatic' where id = p_contact_id;
  elsif v_current = 'workshop_registered' and v_work_missed > 0 and v_work_att = 0 then
    update public.contacts set stage = 'workshop_no_show', stage_actor = 'automatic' where id = p_contact_id;
  end if;

  if v_member is not null then
    update public.contacts
       set client_type = case v_source
             when 'corporate' then 'corporate'
             when 'legacy' then 'legacy'
             else 'individual'
           end
     where id = p_contact_id and client_type is null;
  end if;
end;
$$;

-- Bring every contact up to date with the new counts and rules.
select public.refresh_contact_for_user(u.id) from auth.users u;

-- ---------------------------------------------------------------------------
-- Renewals
--
-- Separate from the funnel stage on purpose: somebody can be a client whose
-- membership ends next month, or an ex-member you have asked to come back,
-- and squeezing that into the stage would lose one fact to record the other.
--
-- "Next month" and "overdue" look after themselves from the membership dates.
-- "Requested" is yours: once you have asked somebody to renew, the automation
-- leaves them alone until you move them.
-- ---------------------------------------------------------------------------
alter table public.contacts add column if not exists renewal_status text not null default 'none';
alter table public.contacts drop constraint if exists contacts_renewal_status_check;
alter table public.contacts add constraint contacts_renewal_status_check check (
  renewal_status in ('none', 'due_next_month', 'requested', 'overdue')
);

create index if not exists contacts_renewal_status_idx
  on public.contacts (renewal_status) where renewal_status <> 'none';

create or replace function public.refresh_renewal_for_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_end timestamptz;
  v_new text := 'none';
begin
  select status, current_period_end into v_status, v_end
    from public.subscriptions where user_id = p_user_id;

  if v_status is null then
    return; -- no membership on file: nothing automatic to say
  end if;

  if v_status in ('active', 'trialing') then
    if v_end is not null and v_end < now() then
      v_new := 'overdue';
    elsif v_end is not null and v_end < now() + interval '31 days' then
      v_new := 'due_next_month';
    end if;
  else
    v_new := 'overdue';
  end if;

  update public.contacts
     set renewal_status = v_new
   where user_id = p_user_id
     and renewal_status <> 'requested'
     and renewal_status is distinct from v_new;
end;
$$;

-- A membership change recomputes it straight away.
create or replace function public.refresh_renewal_from_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_renewal_for_user(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_renewal_from_subscription on public.subscriptions;
create trigger refresh_renewal_from_subscription
  after insert or update or delete on public.subscriptions
  for each row execute function public.refresh_renewal_from_row();

-- Dates roll over with nobody writing anything, so the daily cron calls this.
create or replace function public.refresh_all_renewals()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_count integer := 0;
begin
  for v_user in select user_id from public.subscriptions loop
    perform public.refresh_renewal_for_user(v_user);
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

select public.refresh_all_renewals();

-- A membership that expired where the person asked to be approached later.
-- Held like "requested": the automation stops writing over it, so an expiry
-- somebody has already answered stays answered.
alter table public.contacts drop constraint if exists contacts_renewal_status_check;
alter table public.contacts add constraint contacts_renewal_status_check check (
  renewal_status in ('none', 'due_next_month', 'requested', 'overdue', 'expired_follow_up')
);

create or replace function public.refresh_renewal_for_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_end timestamptz;
  v_new text := 'none';
begin
  select status, current_period_end into v_status, v_end
    from public.subscriptions where user_id = p_user_id;

  if v_status is null then
    return; -- no membership on file: nothing automatic to say
  end if;

  if v_status in ('active', 'trialing') then
    if v_end is not null and v_end < now() then
      v_new := 'overdue';
    elsif v_end is not null and v_end < now() + interval '31 days' then
      v_new := 'due_next_month';
    end if;
  else
    v_new := 'overdue';
  end if;

  update public.contacts
     set renewal_status = v_new
   where user_id = p_user_id
     and renewal_status not in ('requested', 'expired_follow_up')
     and renewal_status is distinct from v_new;
end;
$$;

select public.refresh_all_renewals();

-- ---------------------------------------------------------------------------
-- Former clients
--
-- Somebody who paid and then cancelled is neither a client nor a lead, and
-- flattening them into either loses the thing that makes them worth calling.
--
-- The move happens on the facts: a client whose membership stops being active
-- becomes a former client, and taking a membership again makes them a client,
-- since client outranks it. The stages below it cannot drag them back, so
-- booking an info session next spring leaves the history intact.
-- ---------------------------------------------------------------------------
alter table public.contacts drop constraint if exists contacts_stage_check;
alter table public.contacts add constraint contacts_stage_check check (stage in (
  'lead',
  'info_registered',
  'info_no_show',
  'info_attended',
  'prospect_conversation',
  'workshop_registered',
  'workshop_no_show',
  'workshop_attended',
  'prospect_closing',
  'client',
  'former_client',
  'not_now',
  'lost',
  'dormant'
));

create or replace function public.stage_rank(p_stage text)
returns integer
language sql
immutable
as $$
  select case p_stage
    when 'lead' then 1
    when 'info_registered' then 2
    when 'info_no_show' then 2
    when 'info_attended' then 3
    when 'prospect_conversation' then 4
    when 'workshop_registered' then 5
    when 'workshop_no_show' then 5
    when 'workshop_attended' then 6
    when 'prospect_closing' then 7
    -- Beside "about to sign": only becoming a client again beats it.
    when 'former_client' then 7
    when 'client' then 8
    else 0
  end;
$$;

create or replace function public.advance_contact_stage(p_contact_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
  v_earned text := 'lead';
  v_member text;
  v_source text;
  v_info_reg integer;
  v_info_att integer;
  v_info_missed integer;
  v_work_reg integer;
  v_work_att integer;
  v_work_missed integer;
begin
  select stage into v_current from public.contacts where id = p_contact_id;

  select
    count(*) filter (where event_kind = 'info_session'),
    count(*) filter (where event_kind = 'info_session' and attended_at is not null),
    count(*) filter (where event_kind = 'info_session' and attended_at is null
                       and coalesce(event_start, now()) < now() - interval '4 hours'),
    count(*) filter (where event_kind <> 'info_session'),
    count(*) filter (where event_kind <> 'info_session' and attended_at is not null),
    count(*) filter (where event_kind <> 'info_session' and attended_at is null
                       and coalesce(event_start, now()) < now() - interval '4 hours')
    into v_info_reg, v_info_att, v_info_missed, v_work_reg, v_work_att, v_work_missed
    from public.event_registrations
   where user_id = p_user_id;

  update public.contacts set
    info_sessions_registered = v_info_reg,
    info_sessions_attended = v_info_att,
    info_session_no_shows = v_info_missed,
    workshops_registered = v_work_reg,
    workshops_attended = v_work_att,
    workshop_no_shows = v_work_missed
  where id = p_contact_id;

  if v_current in ('lost', 'dormant', 'not_now') then
    return;
  end if;

  if v_info_reg > 0 then v_earned := 'info_registered'; end if;
  if v_info_att > 0 then v_earned := 'info_attended'; end if;
  if v_work_reg > 0 and public.stage_rank('workshop_registered') > public.stage_rank(v_earned) then
    v_earned := 'workshop_registered';
  end if;

  select status, source into v_member, v_source
    from public.subscriptions where user_id = p_user_id;

  if v_member in ('active', 'trialing') then
    v_earned := 'client';
  end if;

  if public.stage_rank(v_earned) > public.stage_rank(v_current) then
    update public.contacts
       set stage = v_earned, stage_note = null, stage_actor = 'automatic'
     where id = p_contact_id;
    v_current := v_earned;
  end if;

  -- A client whose membership stopped is a former client.
  if v_current = 'client' and v_member is not null and v_member not in ('active', 'trialing') then
    update public.contacts set stage = 'former_client', stage_actor = 'automatic' where id = p_contact_id;
    v_current := 'former_client';
  end if;

  if v_current = 'info_registered' and v_info_missed > 0 and v_info_att = 0 then
    update public.contacts set stage = 'info_no_show', stage_actor = 'automatic' where id = p_contact_id;
  elsif v_current = 'workshop_registered' and v_work_missed > 0 and v_work_att = 0 then
    update public.contacts set stage = 'workshop_no_show', stage_actor = 'automatic' where id = p_contact_id;
  end if;

  if v_member is not null then
    update public.contacts
       set client_type = case v_source
             when 'corporate' then 'corporate'
             when 'legacy' then 'legacy'
             else 'individual'
           end
     where id = p_contact_id and client_type is null;
  end if;
end;
$$;

select public.refresh_contact_for_user(u.id) from auth.users u;

-- ---------------------------------------------------------------------------
-- A payment that failed
--
-- A card that stops working is a client you are about to lose by accident,
-- which is a different thing from one who decided to leave. It gets its own
-- renewal status, set the moment the membership goes past due and cleared by
-- itself when a payment goes through.
-- ---------------------------------------------------------------------------
alter table public.contacts drop constraint if exists contacts_renewal_status_check;
alter table public.contacts add constraint contacts_renewal_status_check check (
  renewal_status in ('none', 'due_next_month', 'requested', 'overdue', 'expired_follow_up', 'payment_failed')
);

create or replace function public.refresh_renewal_for_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_end timestamptz;
  v_new text := 'none';
begin
  select status, current_period_end into v_status, v_end
    from public.subscriptions where user_id = p_user_id;

  if v_status is null then
    return;
  end if;

  if v_status in ('past_due', 'unpaid', 'incomplete') then
    -- The money stopped arriving while the membership is still meant to run.
    v_new := 'payment_failed';
  elsif v_status in ('active', 'trialing') then
    if v_end is not null and v_end < now() then
      v_new := 'overdue';
    elsif v_end is not null and v_end < now() + interval '31 days' then
      v_new := 'due_next_month';
    end if;
  else
    v_new := 'overdue';
  end if;

  update public.contacts
     set renewal_status = v_new
   where user_id = p_user_id
     and renewal_status not in ('requested', 'expired_follow_up', 'payment_failed')
     and renewal_status is distinct from v_new;
end;
$$;

select public.refresh_all_renewals();

-- Somebody who paid and cancelled before this funnel existed never passed
-- through "client", so the sideways move from client to former client never
-- fired for them and they sit among the leads. A membership on file that is
-- no longer live is enough: it outranks every stage below "about to sign", so
-- it also survives them booking something new.
create or replace function public.advance_contact_stage(p_contact_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
  v_earned text := 'lead';
  v_member text;
  v_source text;
  v_info_reg integer;
  v_info_att integer;
  v_info_missed integer;
  v_work_reg integer;
  v_work_att integer;
  v_work_missed integer;
begin
  select stage into v_current from public.contacts where id = p_contact_id;

  select
    count(*) filter (where event_kind = 'info_session'),
    count(*) filter (where event_kind = 'info_session' and attended_at is not null),
    count(*) filter (where event_kind = 'info_session' and attended_at is null
                       and coalesce(event_start, now()) < now() - interval '4 hours'),
    count(*) filter (where event_kind <> 'info_session'),
    count(*) filter (where event_kind <> 'info_session' and attended_at is not null),
    count(*) filter (where event_kind <> 'info_session' and attended_at is null
                       and coalesce(event_start, now()) < now() - interval '4 hours')
    into v_info_reg, v_info_att, v_info_missed, v_work_reg, v_work_att, v_work_missed
    from public.event_registrations
   where user_id = p_user_id;

  update public.contacts set
    info_sessions_registered = v_info_reg,
    info_sessions_attended = v_info_att,
    info_session_no_shows = v_info_missed,
    workshops_registered = v_work_reg,
    workshops_attended = v_work_att,
    workshop_no_shows = v_work_missed
  where id = p_contact_id;

  if v_current in ('lost', 'dormant', 'not_now') then
    return;
  end if;

  if v_info_reg > 0 then v_earned := 'info_registered'; end if;
  if v_info_att > 0 then v_earned := 'info_attended'; end if;
  if v_work_reg > 0 and public.stage_rank('workshop_registered') > public.stage_rank(v_earned) then
    v_earned := 'workshop_registered';
  end if;

  select status, source into v_member, v_source
    from public.subscriptions where user_id = p_user_id;

  -- Paid once, whenever that was.
  if v_member is not null
     and v_member not in ('active', 'trialing')
     and public.stage_rank('former_client') > public.stage_rank(v_earned) then
    v_earned := 'former_client';
  end if;

  -- Paying now.
  if v_member in ('active', 'trialing') then
    v_earned := 'client';
  end if;

  if public.stage_rank(v_earned) > public.stage_rank(v_current) then
    update public.contacts
       set stage = v_earned, stage_note = null, stage_actor = 'automatic'
     where id = p_contact_id;
    v_current := v_earned;
  end if;

  if v_current = 'client' and v_member is not null and v_member not in ('active', 'trialing') then
    update public.contacts set stage = 'former_client', stage_actor = 'automatic' where id = p_contact_id;
    v_current := 'former_client';
  end if;

  if v_current = 'info_registered' and v_info_missed > 0 and v_info_att = 0 then
    update public.contacts set stage = 'info_no_show', stage_actor = 'automatic' where id = p_contact_id;
  elsif v_current = 'workshop_registered' and v_work_missed > 0 and v_work_att = 0 then
    update public.contacts set stage = 'workshop_no_show', stage_actor = 'automatic' where id = p_contact_id;
  end if;

  if v_member is not null then
    update public.contacts
       set client_type = case v_source
             when 'corporate' then 'corporate'
             when 'legacy' then 'legacy'
             else 'individual'
           end
     where id = p_contact_id and client_type is null;
  end if;
end;
$$;

select public.refresh_contact_for_user(u.id) from auth.users u;

-- ---------------------------------------------------------------------------
-- Follow-up date
--
-- "Maybe later" is worth nothing without a date attached. One column, so the
-- admin panel can show who is due this week instead of leaving it in a note
-- nobody reads again.
-- ---------------------------------------------------------------------------
alter table public.contacts add column if not exists follow_up_on date;

create index if not exists contacts_follow_up_idx
  on public.contacts (follow_up_on) where follow_up_on is not null;


-- ── The LinkedIn lead-gen stage ──────────────────────────────────────────
-- A LinkedIn lead is a lead who handed over a name, a company and an address
-- on a lead-gen form, so it sits one notch above the newsletter crowd and
-- below anyone who has booked anything. The ranks are renumbered in tens to
-- leave room for the next one of these.

alter table public.contacts drop constraint if exists contacts_stage_check;

alter table public.contacts add constraint contacts_stage_check check (
  stage in ('lead', 'linkedin_lead', 'info_registered', 'info_no_show', 'info_attended',
            'prospect_conversation', 'workshop_registered', 'workshop_no_show',
            'workshop_attended', 'prospect_closing', 'client', 'former_client',
            'not_now', 'lost', 'dormant')
);

create or replace function public.stage_rank(p_stage text)
returns integer
language sql
immutable
as $$
  select case p_stage
    when 'lead' then 10
    when 'linkedin_lead' then 15
    when 'info_registered' then 20
    when 'info_no_show' then 20
    when 'info_attended' then 30
    when 'prospect_conversation' then 40
    when 'workshop_registered' then 50
    when 'workshop_no_show' then 50
    when 'workshop_attended' then 60
    when 'prospect_closing' then 70
    -- Beside "about to sign": only becoming a client again beats it.
    when 'former_client' then 70
    when 'client' then 80
    else 0
  end;
$$;


-- ── Dormant rejoins the funnel ───────────────────────────────────────────
-- Dormant describes somebody who went quiet, so a booking or a payment is
-- evidence they came back and the automation should act on it. Lost and
-- Not now stay frozen, because both are decisions with a reason behind them.
--
-- The rank matters as much as the condition: dormant sits level with lead, so
-- the automation's starting guess cannot drag anyone out of Dormant on its
-- own. Without that, an unranked stage scores 0 and every dormant contact
-- would snap back to Lead on the next refresh.

create or replace function public.stage_rank(p_stage text)
returns integer
language sql
immutable
as $$
  select case p_stage
    when 'lead' then 10
    when 'dormant' then 10
    when 'linkedin_lead' then 15
    when 'info_registered' then 20
    when 'info_no_show' then 20
    when 'info_attended' then 30
    when 'prospect_conversation' then 40
    when 'workshop_registered' then 50
    when 'workshop_no_show' then 50
    when 'workshop_attended' then 60
    when 'prospect_closing' then 70
    -- Beside "about to sign": only becoming a client again beats it.
    when 'former_client' then 70
    when 'client' then 80
    else 0
  end;
$$;

create or replace function public.advance_contact_stage(p_contact_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
  v_earned text := 'lead';
  v_member text;
  v_source text;
  v_info_reg integer;
  v_info_att integer;
  v_info_missed integer;
  v_work_reg integer;
  v_work_att integer;
  v_work_missed integer;
begin
  select stage into v_current from public.contacts where id = p_contact_id;

  select
    count(*) filter (where event_kind = 'info_session'),
    count(*) filter (where event_kind = 'info_session' and attended_at is not null),
    count(*) filter (where event_kind = 'info_session' and attended_at is null
                       and coalesce(event_start, now()) < now() - interval '4 hours'),
    count(*) filter (where event_kind <> 'info_session'),
    count(*) filter (where event_kind <> 'info_session' and attended_at is not null),
    count(*) filter (where event_kind <> 'info_session' and attended_at is null
                       and coalesce(event_start, now()) < now() - interval '4 hours')
    into v_info_reg, v_info_att, v_info_missed, v_work_reg, v_work_att, v_work_missed
    from public.event_registrations
   where user_id = p_user_id;

  update public.contacts set
    info_sessions_registered = v_info_reg,
    info_sessions_attended = v_info_att,
    info_session_no_shows = v_info_missed,
    workshops_registered = v_work_reg,
    workshops_attended = v_work_att,
    workshop_no_shows = v_work_missed
  where id = p_contact_id;

  -- Lost and Not now are decisions with a reason behind them, so the
  -- automation keeps its hands off. Dormant describes somebody who went
  -- quiet, and a booking is the evidence that they came back.
  if v_current in ('lost', 'not_now') then
    return;
  end if;

  if v_info_reg > 0 then v_earned := 'info_registered'; end if;
  if v_info_att > 0 then v_earned := 'info_attended'; end if;
  if v_work_reg > 0 and public.stage_rank('workshop_registered') > public.stage_rank(v_earned) then
    v_earned := 'workshop_registered';
  end if;

  select status, source into v_member, v_source
    from public.subscriptions where user_id = p_user_id;

  -- Paid once, whenever that was.
  if v_member is not null
     and v_member not in ('active', 'trialing')
     and public.stage_rank('former_client') > public.stage_rank(v_earned) then
    v_earned := 'former_client';
  end if;

  -- Paying now.
  if v_member in ('active', 'trialing') then
    v_earned := 'client';
  end if;

  if public.stage_rank(v_earned) > public.stage_rank(v_current) then
    update public.contacts
       set stage = v_earned, stage_note = null, stage_actor = 'automatic'
     where id = p_contact_id;
    v_current := v_earned;
  end if;

  if v_current = 'client' and v_member is not null and v_member not in ('active', 'trialing') then
    update public.contacts set stage = 'former_client', stage_actor = 'automatic' where id = p_contact_id;
    v_current := 'former_client';
  end if;

  if v_current = 'info_registered' and v_info_missed > 0 and v_info_att = 0 then
    update public.contacts set stage = 'info_no_show', stage_actor = 'automatic' where id = p_contact_id;
  elsif v_current = 'workshop_registered' and v_work_missed > 0 and v_work_att = 0 then
    update public.contacts set stage = 'workshop_no_show', stage_actor = 'automatic' where id = p_contact_id;
  end if;

  if v_member is not null then
    update public.contacts
       set client_type = case v_source
             when 'corporate' then 'corporate'
             when 'legacy' then 'legacy'
             else 'individual'
           end
     where id = p_contact_id and client_type is null;
  end if;
end;
$$;


-- ── Engagement columns, and keeping them out of the outbox ──────────────
-- What beehiiv knows about each subscriber that the CRM did not.
--
-- Two of these close gaps that made the lead pile unsortable: subscribed_at
-- is the real signup date, where created_at is only the day the import ran,
-- and the utm columns are the only record of which advert or post brought
-- somebody in before the site started capturing it.

alter table public.contacts add column if not exists newsletter_subscribed_at timestamptz;
alter table public.contacts add column if not exists emails_sent integer;
alter table public.contacts add column if not exists emails_opened integer;
alter table public.contacts add column if not exists emails_clicked integer;
alter table public.contacts add column if not exists open_rate numeric;
alter table public.contacts add column if not exists click_rate numeric;
alter table public.contacts add column if not exists newsletter_stats_at timestamptz;
alter table public.contacts add column if not exists utm_source text;
alter table public.contacts add column if not exists utm_medium text;
alter table public.contacts add column if not exists utm_campaign text;
alter table public.contacts add column if not exists referring_site text;

-- The two a campaign list gets sorted by.
create index if not exists contacts_open_rate_idx
  on public.contacts (open_rate desc nulls last) where open_rate is not null;
create index if not exists contacts_subscribed_at_idx
  on public.contacts (newsletter_subscribed_at desc nulls last);

-- Reading from beehiiv must not schedule a write back to it.
--
-- The engagement import writes open rates, click counts, the real subscribe
-- date and the utm parameters onto every contact. None of that is pushed to
-- any channel, yet each write queued a push, so one refresh of 2,025 rows
-- booked a 2,025-contact re-push, and a daily refresh would book one daily.
-- Those columns join the bookkeeping set the trigger ignores.

create or replace function public.enqueue_contact_sync()
returns trigger
language plpgsql
as $$
begin
  -- The worker stamps its own bookkeeping columns, and the engagement import
  -- stamps figures that are read from beehiiv rather than sent to it. Neither
  -- write may queue another push, or the two would chase each other forever.
  if tg_op = 'UPDATE'
     and (to_jsonb(new)
            - 'updated_at' - 'last_synced_at' - 'notion_page_id' - 'beehiiv_subscription_id'
            - 'newsletter_stats_at' - 'emails_sent' - 'emails_opened' - 'emails_clicked'
            - 'open_rate' - 'click_rate' - 'newsletter_subscribed_at'
            - 'utm_source' - 'utm_medium' - 'utm_campaign' - 'referring_site')
       = (to_jsonb(old)
            - 'updated_at' - 'last_synced_at' - 'notion_page_id' - 'beehiiv_subscription_id'
            - 'newsletter_stats_at' - 'emails_sent' - 'emails_opened' - 'emails_clicked'
            - 'open_rate' - 'click_rate' - 'newsletter_subscribed_at'
            - 'utm_source' - 'utm_medium' - 'utm_campaign' - 'referring_site')
  then
    return new;
  end if;

  insert into public.contact_sync_queue (contact_id, reason)
  values (new.id, lower(tg_op))
  on conflict (contact_id) where synced_at is null
  do update set enqueued_at = now(), reason = excluded.reason, attempts = 0, last_error = null;

  return new;
end;
$$;


-- ── The Notion-only fields ───────────────────────────────────────────────
-- The fields Notion held and the contacts table did not. Winding Notion down
-- means these have to live here first, otherwise "Supabase is the source of
-- truth" describes a thinner record than the one being replaced.

alter table public.contacts add column if not exists position text;
alter table public.contacts add column if not exists linkedin_url text;
alter table public.contacts add column if not exists website text;
alter table public.contacts add column if not exists organisation_name text;
alter table public.contacts add column if not exists org_mission text;
alter table public.contacts add column if not exists deal_value numeric;
alter table public.contacts add column if not exists participation_tags text;
alter table public.contacts add column if not exists policy_comms_source text;

create index if not exists contacts_deal_value_idx
  on public.contacts (deal_value) where deal_value is not null;


-- ── A second address for the same person ────────────────────────────────
-- A second address for the same person.
--
-- People reach us from a work address and a personal one, and a merge used to
-- mean the losing address survived only inside a junked row. Holding it on the
-- record that matters means a message from either address is recognisable as
-- the same person, and a future import can be checked against it.
--
-- Deliberately not unique and not the key: email_normalised stays the single
-- identity the CRM joins on, so nothing about the sync, the outbox or the
-- channel pushes changes.

alter table public.contacts add column if not exists email_2 text;

create index if not exists contacts_email_2_idx
  on public.contacts (lower(btrim(email_2))) where email_2 is not null;


-- ── Reached out ─────────────────────────────────────────────────────────
-- Reached out: you have written to this person yourself.
--
-- It sits between Lead and LinkedIn lead, so the automation's starting guess
-- of Lead can never pull somebody back out of it, while anyone who goes on to
-- book or attend something still moves forward past it.

alter table public.contacts drop constraint if exists contacts_stage_check;

alter table public.contacts add constraint contacts_stage_check check (
  stage in ('lead', 'reached_out', 'linkedin_lead', 'info_registered', 'info_no_show',
            'info_attended', 'prospect_conversation', 'workshop_registered',
            'workshop_no_show', 'workshop_attended', 'prospect_closing', 'client',
            'former_client', 'not_now', 'lost', 'dormant')
);

create or replace function public.stage_rank(p_stage text)
returns integer
language sql
immutable
as $$
  select case p_stage
    when 'lead' then 10
    -- Level with lead on purpose: a lead who went quiet is still a lead, so
    -- the automation's default cannot drag anyone out of Dormant.
    when 'dormant' then 10
    when 'reached_out' then 12
    when 'linkedin_lead' then 15
    when 'info_registered' then 20
    when 'info_no_show' then 20
    when 'info_attended' then 30
    when 'prospect_conversation' then 40
    when 'workshop_registered' then 50
    when 'workshop_no_show' then 50
    when 'workshop_attended' then 60
    when 'prospect_closing' then 70
    -- Beside "about to sign": only becoming a client again beats it.
    when 'former_client' then 70
    when 'client' then 80
    else 0
  end;
$$;


-- ── The weekly welcome ───────────────────────────────────────────────────
-- When the weekly welcome was drafted for this person.
--
-- The weekly job is driven by signup date, so without a stamp anyone who
-- signs up on a Monday would be welcomed twice: once that Tuesday and again
-- the next, while still inside the seven-day window. Stamped when the draft
-- is created rather than when it is sent, because the draft is the thing the
-- job produces and a second draft is the mistake worth preventing.

alter table public.contacts add column if not exists welcome_drafted_at timestamptz;

create index if not exists contacts_welcome_drafted_idx
  on public.contacts (welcome_drafted_at) where welcome_drafted_at is null;
