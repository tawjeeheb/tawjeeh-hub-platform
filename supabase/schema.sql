-- ============================================================================
-- Tawjeeh HUB — Database schema, RLS policies, and triggers
-- Run this in the Supabase SQL editor (or via the CLI) on a fresh project.
-- ============================================================================

-- Enums ----------------------------------------------------------------------
create type user_role        as enum ('admin', 'customer');
-- Lifecycle: draft/archived are owner-only and never shown to the public
-- (see PUBLIC_PRODUCT_STATUSES in src/lib/types.ts and the public data layer).
create type product_status   as enum ('available', 'coming_soon', 'draft', 'archived');
create type order_status      as enum ('pending', 'paid', 'failed', 'refunded');
create type payment_provider  as enum ('mock', 'moyasar', 'hyperpay', 'paytabs');
create type audit_action      as enum (
  'login',
  'purchase_created',
  'payment_confirmed',
  'file_downloaded',
  'admin_product_updated'
);

-- Profiles -------------------------------------------------------------------
-- One row per auth user. Role drives all authorization.
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  role       user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- Products -------------------------------------------------------------------
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  subtitle    text,
  description text not null default '',
  contents    text[] not null default '{}',
  audience    text[] not null default '{}',
  category    text not null,
  price_sar   integer not null default 0 check (price_sar >= 0),
  status      product_status not null default 'available',
  cover_url   text,
  -- Path inside the PRIVATE storage bucket. Never exposed to the browser.
  file_path   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Orders ---------------------------------------------------------------------
create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  product_id          uuid not null references public.products (id) on delete restrict,
  amount_sar          integer not null check (amount_sar >= 0),
  status              order_status not null default 'pending',
  payment_provider    payment_provider not null default 'mock',
  provider_payment_id text,
  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);
create index orders_user_idx on public.orders (user_id);

-- Entitlements ---------------------------------------------------------------
-- The grant that authorizes downloads. Unique per (user, product).
create table public.entitlements (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  order_id   uuid not null references public.orders (id) on delete cascade,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index entitlements_user_idx on public.entitlements (user_id);

-- Downloads ------------------------------------------------------------------
create table public.downloads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  product_id    uuid not null references public.products (id) on delete cascade,
  order_id      uuid references public.orders (id) on delete set null,
  downloaded_at timestamptz not null default now(),
  ip_address    text
);
create index downloads_user_idx on public.downloads (user_id);

-- Audit logs -----------------------------------------------------------------
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles (id) on delete set null,
  action      audit_action not null,
  entity_type text,
  entity_id   text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- Helper: is the current user an admin? --------------------------------------
-- NOTE: this stays callable by anon/authenticated because the RLS policies below
-- reference it. It is SECURITY DEFINER with a fixed search_path and returns ONLY
-- whether the CALLER themselves is an admin (no data exposure, no escalation), so
-- the linter's "exposed SECURITY DEFINER" WARN is an accepted low risk here.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- New-user trigger: create a profile automatically --------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- handle_new_user runs ONLY via the trigger above. Triggers fire regardless of
-- the caller's EXECUTE privilege, so we remove its needless RPC exposure.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ============================================================================
-- Row Level Security
-- Server-side trusted writes use the service-role key, which BYPASSES RLS.
-- Client access (anon / authenticated) is constrained by the policies below.
-- ============================================================================

alter table public.profiles     enable row level security;
alter table public.products     enable row level security;
alter table public.orders       enable row level security;
alter table public.entitlements enable row level security;
alter table public.downloads    enable row level security;
alter table public.audit_logs   enable row level security;

-- Profiles: a user sees/updates only their own; admins see all.
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- Column-level lock: clients may only edit their own display name. The role,
-- email, and id columns can NEVER be changed from the client — this is what
-- makes self-promotion to admin impossible. Role changes happen exclusively via
-- the service role (see scripts/bootstrap-admin.mjs).
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to anon, authenticated;

-- Products: catalog is publicly readable; no client writes (service role only).
create policy "products_select_all" on public.products
  for select using (true);

-- Column-level hardening: `file_path` points into the PRIVATE bucket and must
-- NEVER be selectable by clients. RLS is row-level only, so we additionally
-- revoke the table grant and re-grant SELECT on every column EXCEPT file_path.
-- The service role is unaffected and still reads file_path server-side.
revoke select on public.products from anon, authenticated;
grant select (
  id, slug, title, subtitle, description, contents, audience,
  category, price_sar, status, cover_url, created_at, updated_at
) on public.products to anon, authenticated;

-- Orders: a user reads only their own orders. Inserts/updates via service role.
create policy "orders_select_own" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

-- Entitlements: a user reads only their own. Writes via service role.
create policy "entitlements_select_own" on public.entitlements
  for select using (user_id = auth.uid() or public.is_admin());

-- Downloads: a user reads only their own. Writes via service role.
create policy "downloads_select_own" on public.downloads
  for select using (user_id = auth.uid() or public.is_admin());

-- Audit logs: admins only. Writes via service role.
create policy "audit_select_admin" on public.audit_logs
  for select using (public.is_admin());

-- ============================================================================
-- Storage: PRIVATE bucket for product files
-- ============================================================================
-- Create a PRIVATE bucket (public = false). No anon/authenticated storage
-- policies are added, so objects are never directly accessible. Downloads are
-- served exclusively through short-lived signed URLs minted server-side by the
-- service role after the entitlement check passes.
insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;

-- Defense-in-depth: RLS on storage.objects is enabled by default in Supabase.
-- We deliberately add NO select/insert/update/delete policies for anon or
-- authenticated on this bucket, so direct object access is DENIED by default
-- (RLS is deny-by-omission). Only the service role (which bypasses RLS) can
-- read objects, and it does so solely to mint short-lived signed URLs.
-- If your project disabled it, re-enable with:
--   alter table storage.objects enable row level security;
