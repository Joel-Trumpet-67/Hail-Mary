-- ============================================================
-- Grid Iron Picks — Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Leagues table
create table if not exists leagues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique,
  created_by  text not null,
  phase       text not null default 'picks'
                check (phase in ('picks','season','playoffs','final')),
  picks_lock_date timestamptz,
  created_at  timestamptz not null default now()
);

-- Players table (no auth — session stored client-side)
create table if not exists players (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  league_id     uuid not null references leagues(id) on delete cascade,
  session_token text not null,
  created_at    timestamptz not null default now(),
  unique (name, league_id)
);

-- Regular season picks
create table if not exists picks (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references players(id) on delete cascade,
  league_id   uuid not null references leagues(id) on delete cascade,
  game_id     text not null,   -- ESPN game ID
  team_id     text not null,   -- ESPN team ID (the team being picked)
  pick        text not null check (pick in ('W','L')),
  correct     boolean,         -- set after game resolves
  created_at  timestamptz not null default now(),
  unique (player_id, game_id, team_id)
);

-- Playoff bracket picks
create table if not exists playoff_picks (
  id              uuid primary key default gen_random_uuid(),
  player_id       uuid not null references players(id) on delete cascade,
  league_id       uuid not null references leagues(id) on delete cascade,
  game_id         text not null,
  picked_team_id  text not null,
  correct         boolean,
  created_at      timestamptz not null default now(),
  unique (player_id, game_id)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Allow anon reads and inserts (invite-link based, no auth)

alter table leagues      enable row level security;
alter table players      enable row level security;
alter table picks        enable row level security;
alter table playoff_picks enable row level security;

-- Leagues: anyone can read or create
create policy "leagues_select" on leagues for select using (true);
create policy "leagues_insert" on leagues for insert with check (true);

-- Players: anyone can read or create
create policy "players_select" on players for select using (true);
create policy "players_insert" on players for insert with check (true);

-- Picks: anyone can read or upsert (the app filters by league/player client-side)
create policy "picks_select" on picks for select using (true);
create policy "picks_insert" on picks for insert with check (true);
create policy "picks_update" on picks for update using (true);

-- Playoff picks: same open policy
create policy "playoff_picks_select" on playoff_picks for select using (true);
create policy "playoff_picks_insert" on playoff_picks for insert with check (true);
create policy "playoff_picks_update" on playoff_picks for update using (true);

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- Enable realtime for leaderboard live updates
alter publication supabase_realtime add table picks;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table playoff_picks;
