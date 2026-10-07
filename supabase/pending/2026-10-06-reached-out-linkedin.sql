-- ── Reached out, on LinkedIn ─────────────────────────────────────────────
-- Email is not the only way to write to somebody, and the first time this
-- mattered was a mailbox that came back full. The person has been reached,
-- just not through a channel that leaves a trace in the inbox, and recording
-- that as plain "Reached out" would make the next person wonder where the
-- email went.
--
-- Ranked level with reached_out rather than above it: both say the same thing
-- about how far along somebody is, so neither should be able to drag the
-- other backwards or forwards.

alter table public.contacts drop constraint if exists contacts_stage_check;

alter table public.contacts add constraint contacts_stage_check check (
  stage in ('lead', 'reached_out', 'reached_out_linkedin', 'linkedin_lead',
            'info_registered', 'info_no_show', 'info_attended',
            'prospect_conversation', 'workshop_registered',
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
    when 'dormant' then 10
    when 'reached_out' then 12
    -- Level with reached_out: a different channel, the same distance travelled.
    when 'reached_out_linkedin' then 12
    when 'linkedin_lead' then 15
    when 'info_registered' then 20
    when 'info_no_show' then 20
    when 'info_attended' then 30
    when 'prospect_conversation' then 40
    when 'workshop_registered' then 50
    when 'workshop_no_show' then 50
    when 'workshop_attended' then 60
    when 'prospect_closing' then 70
    when 'former_client' then 70
    when 'client' then 80
    else 0
  end;
$$;
