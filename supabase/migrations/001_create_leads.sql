-- Enum-like constraint for email delivery status
create type email_status_enum as enum (
  'delivered',
  'opened',
  'clicked',
  'hard_bounced',
  'soft_bounced',
  'unsubscribed'
);

create table if not exists leads (
  id           uuid primary key default gen_random_uuid(),
  first_name   text,
  last_name    text,
  email        text,
  phone        text,
  company      text,
  city         text,
  county       text,
  state        text default 'CA',
  license_number text,

  email_status email_status_enum,      -- null = never sent
  is_emailed   boolean not null default false,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Fast lookups by email and status
create index if not exists idx_leads_email       on leads (email);
create index if not exists idx_leads_is_emailed  on leads (is_emailed);
create index if not exists idx_leads_email_status on leads (email_status);
create index if not exists idx_leads_county      on leads (county);

-- Auto-update updated_at on row change
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row
  execute function set_updated_at();

-- Row-level security: public read, authenticated write
alter table leads enable row level security;

create policy "Public read access"
  on leads for select
  using (true);

create policy "Service role full access"
  on leads for all
  using (true)
  with check (true);
