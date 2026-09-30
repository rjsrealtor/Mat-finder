-- Lets a signed-in user permanently delete their own account (required by the
-- App Store). Deleting the auth user cascades to profiles, and from profiles to
-- their ratings and reports; listings they added stay, with created_by cleared.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
