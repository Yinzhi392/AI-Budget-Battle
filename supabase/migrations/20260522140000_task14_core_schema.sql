create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id text primary key,
  email text not null unique,
  provider text not null check (provider in ('email_magic_link', 'google_oauth')),
  created_at timestamptz not null default now()
);

create table if not exists public.anonymous_sessions (
  id text primary key,
  linked_user_id text references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.analysis_sessions (
  id text primary key,
  user_id text references public.app_users(id) on delete set null,
  anonymous_session_id text references public.anonymous_sessions(id) on delete set null,
  region text not null check (region in ('cn_mainland', 'study_abroad')),
  country_region text,
  currency text not null,
  period_start text not null,
  period_end text not null,
  status text not null check (status in ('created', 'collecting', 'confirmed', 'report_generated', 'saved')),
  is_saved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.uploaded_images (
  id text primary key,
  analysis_session_id text not null references public.analysis_sessions(id) on delete cascade,
  source_type text not null check (source_type in ('monthly_summary', 'representative_daily', 'category_summary', 'single_transaction')),
  original_name text not null,
  size_bytes integer not null check (size_bytes >= 0),
  temporary_storage_url text not null,
  ocr_status text not null check (ocr_status in ('pending', 'completed', 'failed')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.transaction_items (
  id text primary key,
  analysis_session_id text not null references public.analysis_sessions(id) on delete cascade,
  amount numeric not null check (amount > 0),
  currency text not null,
  category text not null,
  merchant text,
  note text,
  transaction_time text not null,
  source_image_id text,
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  source text not null check (source in ('manual', 'mock_ai', 'ocr')),
  is_user_confirmed boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.confirmed_aggregates (
  id text primary key,
  analysis_session_id text not null references public.analysis_sessions(id) on delete cascade,
  amount numeric not null check (amount > 0),
  currency text not null,
  category text not null,
  period_label text not null,
  note text,
  source text not null check (source in ('manual', 'mock_ai', 'ocr')),
  source_image_id text,
  source_type text,
  source_platform text,
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  dedupe_key text,
  overlap_group_id text,
  possible_duplicate boolean,
  possible_overlap boolean,
  is_estimate boolean not null default true,
  is_user_confirmed boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.category_total_hints (
  id text primary key,
  analysis_session_id text not null references public.analysis_sessions(id) on delete cascade,
  category text not null,
  amount numeric not null check (amount > 0),
  currency text not null,
  period_label text not null,
  note text,
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  is_estimate boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.extraction_outputs (
  analysis_session_id text primary key references public.analysis_sessions(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_reports (
  id text primary key,
  analysis_session_id text not null unique references public.analysis_sessions(id) on delete cascade,
  payload jsonb not null,
  generated_at timestamptz not null default now()
);

create table if not exists public.share_cards (
  id text primary key,
  ai_report_id text not null references public.ai_reports(id) on delete cascade,
  template_type text not null check (template_type in ('xiaohongshu_square', 'xiaohongshu_vertical', 'wechat_moments')),
  platform text not null check (platform in ('xiaohongshu', 'wechat')),
  image_url text not null,
  challenge_tag text not null,
  is_watermarked boolean not null,
  owner_type text not null check (owner_type in ('anonymous', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.benchmark_profiles (
  id text primary key,
  region text not null check (region in ('cn_mainland', 'study_abroad')),
  currency text not null,
  student_context text not null,
  category text not null,
  range_low numeric not null,
  range_high numeric not null,
  label text not null,
  description text not null,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values
  ('temporary-uploads', 'temporary-uploads', false),
  ('share-cards', 'share-cards', false)
on conflict (id) do nothing;

alter table public.app_users enable row level security;
alter table public.anonymous_sessions enable row level security;
alter table public.analysis_sessions enable row level security;
alter table public.uploaded_images enable row level security;
alter table public.transaction_items enable row level security;
alter table public.confirmed_aggregates enable row level security;
alter table public.category_total_hints enable row level security;
alter table public.extraction_outputs enable row level security;
alter table public.ai_reports enable row level security;
alter table public.share_cards enable row level security;
alter table public.benchmark_profiles enable row level security;

create policy "service_role manages app_users"
on public.app_users for all
to service_role
using (true)
with check (true);

create policy "service_role manages anonymous_sessions"
on public.anonymous_sessions for all
to service_role
using (true)
with check (true);

create policy "service_role manages analysis_sessions"
on public.analysis_sessions for all
to service_role
using (true)
with check (true);

create policy "users read own saved analysis_sessions"
on public.analysis_sessions for select
to authenticated
using (user_id = auth.uid()::text and is_saved = true);

create policy "service_role manages uploaded_images"
on public.uploaded_images for all
to service_role
using (true)
with check (true);

create policy "service_role manages transaction_items"
on public.transaction_items for all
to service_role
using (true)
with check (true);

create policy "service_role manages confirmed_aggregates"
on public.confirmed_aggregates for all
to service_role
using (true)
with check (true);

create policy "service_role manages category_total_hints"
on public.category_total_hints for all
to service_role
using (true)
with check (true);

create policy "service_role manages extraction_outputs"
on public.extraction_outputs for all
to service_role
using (true)
with check (true);

create policy "service_role manages ai_reports"
on public.ai_reports for all
to service_role
using (true)
with check (true);

create policy "users read own saved ai_reports"
on public.ai_reports for select
to authenticated
using (
  exists (
    select 1
    from public.analysis_sessions s
    where s.id = ai_reports.analysis_session_id
      and s.user_id = auth.uid()::text
      and s.is_saved = true
  )
);

create policy "service_role manages share_cards"
on public.share_cards for all
to service_role
using (true)
with check (true);

create policy "service_role manages benchmark_profiles"
on public.benchmark_profiles for all
to service_role
using (true)
with check (true);

create policy "authenticated users read benchmark_profiles"
on public.benchmark_profiles for select
to authenticated
using (true);

create policy "service_role manages temporary uploads"
on storage.objects for all
to service_role
using (bucket_id = 'temporary-uploads')
with check (bucket_id = 'temporary-uploads');

create policy "service_role manages share cards"
on storage.objects for all
to service_role
using (bucket_id = 'share-cards')
with check (bucket_id = 'share-cards');
