-- ============================================================================
-- Migration 0002 — Persistence Foundation (Phase 3)
-- Adds: majors, jobs, saved_jobs, applications (+ indexes + RLS).
-- Idempotent where possible. Safe on an existing database. No data loss.
-- The app keeps working in seed mode until these are populated.
-- ============================================================================

-- Enums -----------------------------------------------------------------------
do $$ begin
  create type job_work_mode as enum ('onsite', 'remote', 'hybrid', 'unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_verification as enum ('verified', 'unverified', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum
    ('saved', 'applied', 'interview', 'offer', 'rejected', 'withdrawn');
exception when duplicate_object then null; end $$;

-- Majors ----------------------------------------------------------------------
create table if not exists public.majors (
  slug             text primary key,
  name_ar          text not null,
  name_en          text not null default '',
  blurb            text not null default '',
  keywords         text[] not null default '{}',
  synonyms         text[] not null default '{}',
  related          text[] not null default '{}',
  sectors          text[] not null default '{}',
  product_category text,
  created_at       timestamptz not null default now()
);

-- Jobs ------------------------------------------------------------------------
create table if not exists public.jobs (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  title              text not null,
  employer           text not null default '',
  sector             text not null default '',
  city               text not null default '',
  work_mode          job_work_mode not null default 'unknown',
  apply_url          text not null,
  posted_at          timestamptz not null default now(),
  deadline           timestamptz,
  source             text not null default 'seed',
  raw_text           text not null default '',
  accepted_majors    text[] not null default '{}',
  accepts_all_majors boolean not null default false,
  skills             text[] not null default '{}',
  suggested_courses  text[] not null default '{}',
  suggested_certs    text[] not null default '{}',
  verification       job_verification not null default 'unverified',
  last_checked_at    timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists jobs_posted_idx on public.jobs (posted_at desc);
create index if not exists jobs_city_idx on public.jobs (city);
create index if not exists jobs_accepted_majors_idx on public.jobs using gin (accepted_majors);

-- Saved jobs (per user) -------------------------------------------------------
create table if not exists public.saved_jobs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  job_ref    text not null,          -- job id or slug (works for seed + db jobs)
  title      text not null,
  employer   text not null default '',
  city       text not null default '',
  apply_url  text not null default '',
  major_slug text,
  created_at timestamptz not null default now(),
  unique (user_id, job_ref)
);
create index if not exists saved_jobs_user_idx on public.saved_jobs (user_id);

-- Applications (per user) -----------------------------------------------------
create table if not exists public.applications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  job_ref    text not null,
  title      text not null,
  employer   text not null default '',
  status     application_status not null default 'saved',
  notes      text,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_ref)
);
create index if not exists applications_user_idx on public.applications (user_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.majors       enable row level security;
alter table public.jobs         enable row level security;
alter table public.saved_jobs   enable row level security;
alter table public.applications enable row level security;

-- Catalog: publicly readable; writes via service role only (ingestion/admin).
drop policy if exists "majors_select_all" on public.majors;
create policy "majors_select_all" on public.majors for select using (true);

drop policy if exists "jobs_select_all" on public.jobs;
create policy "jobs_select_all" on public.jobs for select using (true);

-- Saved jobs: each user owns their rows (read + write).
drop policy if exists "saved_jobs_select_own" on public.saved_jobs;
create policy "saved_jobs_select_own" on public.saved_jobs
  for select using (user_id = auth.uid());
drop policy if exists "saved_jobs_insert_own" on public.saved_jobs;
create policy "saved_jobs_insert_own" on public.saved_jobs
  for insert with check (user_id = auth.uid());
drop policy if exists "saved_jobs_delete_own" on public.saved_jobs;
create policy "saved_jobs_delete_own" on public.saved_jobs
  for delete using (user_id = auth.uid());

-- Applications: each user owns their rows (full CRUD on own).
drop policy if exists "applications_select_own" on public.applications;
create policy "applications_select_own" on public.applications
  for select using (user_id = auth.uid());
drop policy if exists "applications_write_own" on public.applications;
create policy "applications_write_own" on public.applications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
