-- Mat Finder — database schema
-- Run this once in your Supabase project's SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run from scratch on a brand new project.

-- ---------- enums ----------
do $$ begin
  create type gi_type as enum ('gi', 'nogi', 'gi_nogi');
exception when duplicate_object then null; end $$;

do $$ begin
  create type visitor_policy as enum ('open', 'conditions', 'members_only');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_status as enum ('active', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_type as enum ('closed', 'members_only', 'correction');
exception when duplicate_object then null; end $$;

-- ---------- profiles ----------
-- One row per signed-up user, auto-created on signup (see trigger below).
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles are viewable by everyone" on profiles;
create policy "profiles are viewable by everyone" on profiles for select using (true);

drop policy if exists "users can insert their own profile" on profiles;
create policy "users can insert their own profile" on profiles for insert with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on profiles;
create policy "users can update their own profile" on profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- listings ----------
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text not null,
  address text not null,
  day text not null,
  time text not null,
  gi gi_type not null default 'gi_nogi',
  fee_cents integer,            -- null = varies / ask the gym, 0 = free, >0 = fee in cents
  fee_note text,                 -- human-readable, e.g. "$10 for non-members"
  visitor_policy visitor_policy not null default 'open',
  policy_note text,
  status listing_status not null default 'active',
  source text not null default 'community',   -- 'seed' | 'community'
  report_count integer not null default 0,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_city_idx on listings (lower(city));
create index if not exists listings_status_idx on listings (status);

-- lets supabase/seed.sql upsert instead of duplicating on re-run
create unique index if not exists listings_name_city_key on listings (name, city);

alter table listings enable row level security;

drop policy if exists "listings are viewable by everyone" on listings;
create policy "listings are viewable by everyone" on listings for select using (true);

drop policy if exists "authenticated users can add listings" on listings;
create policy "authenticated users can add listings" on listings
  for insert to authenticated
  with check (auth.uid() = created_by);

-- ---------- ratings ----------
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

alter table ratings enable row level security;

drop policy if exists "ratings are viewable by everyone" on ratings;
create policy "ratings are viewable by everyone" on ratings for select using (true);

drop policy if exists "authenticated users can rate" on ratings;
create policy "authenticated users can rate" on ratings
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users can update their own rating" on ratings;
create policy "users can update their own rating" on ratings
  for update to authenticated
  using (auth.uid() = user_id);

-- ---------- reports ----------
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type report_type not null,
  payload jsonb,
  note text,
  created_at timestamptz not null default now()
);

alter table reports enable row level security;

drop policy if exists "reports are viewable by everyone" on reports;
create policy "reports are viewable by everyone" on reports for select using (true);

drop policy if exists "authenticated users can report" on reports;
create policy "authenticated users can report" on reports
  for insert to authenticated
  with check (auth.uid() = user_id);

-- ---------- listings + rating aggregate view ----------
create or replace view listings_with_rating as
select
  l.*,
  coalesce(round(avg(r.stars)::numeric, 2), 0) as rating_avg,
  count(r.id) as rating_count
from listings l
left join ratings r on r.listing_id = l.id
group by l.id;

-- ---------- apply_report RPC ----------
-- Called by the app instead of letting users UPDATE listings directly:
-- keeps every mutation to a listing logged as a report, and limits what
-- a report can change to exactly these fields.
create or replace function public.apply_report(
  p_listing_id uuid,
  p_type report_type,
  p_day text default null,
  p_time text default null,
  p_fee_note text default null,
  p_note text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'must be signed in to report a listing';
  end if;

  insert into reports (listing_id, user_id, type, payload, note)
  values (
    p_listing_id,
    auth.uid(),
    p_type,
    jsonb_build_object('day', p_day, 'time', p_time, 'fee_note', p_fee_note),
    p_note
  );

  update listings
  set
    status = case when p_type = 'closed' then 'closed'::listing_status else status end,
    visitor_policy = case when p_type = 'members_only' then 'members_only'::visitor_policy else visitor_policy end,
    day = case when p_type = 'correction' and p_day is not null and p_day <> '' then p_day else day end,
    time = case when p_type = 'correction' and p_time is not null and p_time <> '' then p_time else time end,
    fee_note = case when p_type = 'correction' and p_fee_note is not null and p_fee_note <> '' then p_fee_note else fee_note end,
    report_count = report_count + 1,
    updated_at = now()
  where id = p_listing_id;
end;
$$;

-- ---------- grants ----------
-- RLS policies above control row-level access; these grants control
-- whether a role can touch the table/view/function at all.
grant usage on schema public to anon, authenticated;

grant select on table profiles, listings, ratings, reports, listings_with_rating
  to anon, authenticated;

grant insert on table profiles, listings, ratings, reports to authenticated;
grant update on table profiles, ratings to authenticated;

grant execute on function public.apply_report to authenticated;
