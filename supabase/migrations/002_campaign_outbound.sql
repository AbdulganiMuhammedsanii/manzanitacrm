-- Outbound sequence campaign: 5 steps, daily cap, per-lead spacing

create table if not exists campaign_config (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Outbound sequence',
  is_active boolean not null default false,
  max_sends_per_day int not null default 15,
  days_between_steps int not null default 3,
  timezone text not null default 'America/Los_Angeles',
  send_window_start_hour smallint not null default 9
    check (send_window_start_hour between 0 and 23),
  send_window_end_hour smallint not null default 17
    check (send_window_end_hour between 0 and 23),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists campaign_steps (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaign_config (id) on delete cascade,
  step_index int not null check (step_index between 1 and 5),
  subject text not null default '',
  body text not null default '',
  unique (campaign_id, step_index)
);

-- Per-lead progress through the 5-step sequence
create table if not exists lead_sequence_state (
  lead_id uuid primary key references leads (id) on delete cascade,
  last_completed_step int not null default 0 check (last_completed_step between 0 and 5),
  next_eligible_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists outbound_send_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  step_index int not null check (step_index between 1 and 5),
  campaign_id uuid references campaign_config (id) on delete set null,
  sent_at timestamptz not null default now(),
  -- YYYY-MM-DD in campaign timezone — used for daily send caps
  send_calendar_day text not null,
  subject_line text,
  body_text text,
  unique (lead_id, step_index)
);

create index if not exists idx_outbound_send_log_sent_at on outbound_send_log (sent_at);
create index if not exists idx_outbound_send_log_lead on outbound_send_log (lead_id);
create index if not exists idx_lead_sequence_next on lead_sequence_state (next_eligible_at);

create trigger lead_sequence_state_updated_at
  before update on lead_sequence_state
  for each row
  execute function set_updated_at();

create trigger campaign_config_updated_at
  before update on campaign_config
  for each row
  execute function set_updated_at();

-- Seed one campaign + empty-ish steps (filled by UI defaults)
insert into campaign_config (id, name)
values (
  '00000000-0000-0000-0000-000000000001',
  'Outbound sequence'
)
on conflict (id) do nothing;

insert into campaign_steps (campaign_id, step_index, subject, body)
values
  (
    '00000000-0000-0000-0000-000000000001',
    1,
    'Exclusive Security Assessment for {{company_name}}',
    E'Hello {{first_name}},\n\nThis is email 1 of 5 in our sequence for {{company_name}}.\n\nBest regards,\nYour team'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    2,
    'Following up — {{company_name}}',
    E'Hello {{first_name}},\n\nQuick follow-up on our previous note regarding {{company_name}} at {{address}}.\n\nThanks,\nYour team'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    3,
    'Resources for {{company_name}}',
    E'Hi {{first_name}},\n\nSharing a short resource that may help {{company_name}}.\n\nRegards,\nYour team'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    4,
    'Checking in — {{company_name}}',
    E'Hello {{first_name}},\n\nWanted to check whether timing is better this week for a brief conversation.\n\nBest,\nYour team'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    5,
    'Last note — {{company_name}}',
    E'Hi {{first_name}},\n\nThis is the final message in our series. If you''d like to connect, just reply.\n\nThanks,\nYour team'
  )
on conflict (campaign_id, step_index) do nothing;

alter table campaign_config enable row level security;
alter table campaign_steps enable row level security;
alter table lead_sequence_state enable row level security;
alter table outbound_send_log enable row level security;

create policy "campaign_config_select" on campaign_config for select using (true);
create policy "campaign_config_all" on campaign_config for all using (true) with check (true);

create policy "campaign_steps_select" on campaign_steps for select using (true);
create policy "campaign_steps_all" on campaign_steps for all using (true) with check (true);

create policy "lead_sequence_state_select" on lead_sequence_state for select using (true);
create policy "lead_sequence_state_all" on lead_sequence_state for all using (true) with check (true);

create policy "outbound_send_log_select" on outbound_send_log for select using (true);
create policy "outbound_send_log_all" on outbound_send_log for all using (true) with check (true);
