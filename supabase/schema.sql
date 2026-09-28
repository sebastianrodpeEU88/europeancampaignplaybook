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
