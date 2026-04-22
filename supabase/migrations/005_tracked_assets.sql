-- PDF / file opens: metadata + per-open events (tracked redirect → S3 presigned GET)

create table if not exists tracked_assets (
  id uuid primary key default gen_random_uuid(),
  label text not null default 'Document',
  -- If null at read time, server falls back to AWS_S3_BUCKET / PDF_ASSETS_BUCKET env
  s3_bucket text,
  s3_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists asset_open_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  asset_id uuid not null references tracked_assets (id) on delete cascade,
  opened_at timestamptz not null default now(),
  user_agent text
);

create index if not exists idx_asset_open_events_lead on asset_open_events (lead_id);
create index if not exists idx_asset_open_events_asset on asset_open_events (asset_id);
create index if not exists idx_asset_open_events_opened_at on asset_open_events (opened_at);

alter table tracked_assets enable row level security;
alter table asset_open_events enable row level security;
