-- Lets admins (profiles.is_admin = true) edit and delete any listing.
-- Run once in the Supabase SQL editor. Safe to re-run.

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

drop policy if exists "admins can update listings" on listings;
create policy "admins can update listings" on listings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can delete listings" on listings;
create policy "admins can delete listings" on listings
  for delete to authenticated
  using (public.is_admin());

-- RLS above still limits these to admins.
grant update, delete on table listings to authenticated;
