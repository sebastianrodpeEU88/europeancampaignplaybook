-- ── The claim, refined ───────────────────────────────────────────────────
-- Three changes once the flow was written out end to end.
--
-- A note from the claimant, optional, one line. It is the single most useful
-- input to the decision and the one thing no amount of scoring can infer.
--
-- A lapsed state. One live claim per person is what makes the entitlement
-- mean anything, but it also means an unanswered claim locks somebody out for
-- good. Silence is a valid answer, so a pending claim quietly lapses once its
-- workshop has started and the person is free to ask again. Distinct from
-- withdrawn, which is the person changing their own mind.
--
-- A record of which registration the free workshop paid for, so cancelling it
-- can give the entitlement back rather than quietly burning it.

alter table public.free_workshop_claims add column if not exists note text;
alter table public.free_workshop_claims add column if not exists booked_at timestamptz;

alter table public.free_workshop_claims drop constraint if exists free_workshop_claims_status_check;
alter table public.free_workshop_claims add constraint free_workshop_claims_status_check check (
  status in ('pending', 'approved', 'rejected', 'withdrawn', 'lapsed')
);

-- Lapsed joins rejected and withdrawn outside the index, so it frees the
-- person to claim again.
drop index if exists free_workshop_claims_one_live;
create unique index if not exists free_workshop_claims_one_live
  on public.free_workshop_claims (user_id)
  where status in ('pending', 'approved');

-- Sebastián answers these in order of urgency rather than arrival, so the
-- queue is read by how soon the workshop is.
create index if not exists free_workshop_claims_urgency
  on public.free_workshop_claims (status, event_start);
