-- Single-row Gmail OAuth integration (refresh token stored server-side only)

create table if not exists gmail_integration (
  id uuid primary key default '00000000-0000-0000-0000-000000000002'::uuid,
  google_email text,
  refresh_token text,
  connected_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into gmail_integration (id)
values ('00000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

create trigger gmail_integration_updated_at
  before update on gmail_integration
  for each row
  execute function set_updated_at();

alter table gmail_integration enable row level security;

create policy "gmail_integration_select" on gmail_integration for select using (true);
create policy "gmail_integration_all" on gmail_integration for all using (true) with check (true);
