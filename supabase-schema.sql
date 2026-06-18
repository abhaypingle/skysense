-- SkySense — Supabase SQL Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security on all tables

-- ── Search history ────────────────────────────────────────────
create table if not exists public.search_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  location_name text not null,
  lat          float not null,
  lon          float not null,
  searched_at  timestamptz default now()
);

alter table public.search_history enable row level security;

create policy "Users see own history"
  on public.search_history for select
  using (auth.uid() = user_id);

create policy "Users insert own history"
  on public.search_history for insert
  with check (auth.uid() = user_id);

create policy "Users delete own history"
  on public.search_history for delete
  using (auth.uid() = user_id);

-- ── Favourites ────────────────────────────────────────────────
create table if not exists public.favourites (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  location_name text not null,
  lat          float not null,
  lon          float not null,
  created_at   timestamptz default now(),
  unique (user_id, location_name)
);

alter table public.favourites enable row level security;

create policy "Users see own favourites"
  on public.favourites for select
  using (auth.uid() = user_id);

create policy "Users insert own favourites"
  on public.favourites for insert
  with check (auth.uid() = user_id);

create policy "Users delete own favourites"
  on public.favourites for delete
  using (auth.uid() = user_id);

-- ── User preferences ──────────────────────────────────────────
create table if not exists public.user_prefs (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  mode         text default 'general',
  units        text default 'celsius',
  updated_at   timestamptz default now()
);

alter table public.user_prefs enable row level security;

create policy "Users see own prefs"
  on public.user_prefs for select
  using (auth.uid() = user_id);

create policy "Users upsert own prefs"
  on public.user_prefs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
