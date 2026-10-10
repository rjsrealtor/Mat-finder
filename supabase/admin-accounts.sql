-- Lets admins list every account (email, display name, signup and last sign-in)
-- on /admin/accounts. Emails live in auth.users, which the site can't read
-- directly, so this security definer function checks is_admin() first.
create or replace function public.admin_list_accounts()
returns table (
  id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  confirmed boolean
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  return query
    select u.id, u.email::text, p.display_name, u.created_at, u.last_sign_in_at,
           u.email_confirmed_at is not null
    from auth.users u
    left join public.profiles p on p.id = u.id
    order by u.created_at desc;
end;
$$;

revoke all on function public.admin_list_accounts() from public, anon;
grant execute on function public.admin_list_accounts() to authenticated;
