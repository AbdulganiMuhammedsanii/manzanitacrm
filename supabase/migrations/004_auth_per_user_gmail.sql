-- Per-user Gmail OAuth (linked to auth.users) + optional batch sender on campaign

alter table campaign_config
  add column if not exists sender_user_id uuid references auth.users (id) on delete set null;

drop policy if exists "gmail_integration_select" on gmail_integration;
drop policy if exists "gmail_integration_all" on gmail_integration;

drop table if exists gmail_integration;

create table gmail_integration (
  user_id uuid primary key references auth.users (id) on delete cascade,
  google_email text,
  refresh_token text,
  connected_at timestamptz,
  updated_at timestamptz not null default now()
);

create trigger gmail_integration_updated_at
  before update on gmail_integration
  for each row
  execute function set_updated_at();

alter table gmail_integration enable row level security;

create policy "gmail_integration_own_select"
  on gmail_integration for select
  using (auth.uid() = user_id);

create policy "gmail_integration_own_insert"
  on gmail_integration for insert
  with check (auth.uid() = user_id);

create policy "gmail_integration_own_update"
  on gmail_integration for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "gmail_integration_own_delete"
  on gmail_integration for delete
  using (auth.uid() = user_id);
