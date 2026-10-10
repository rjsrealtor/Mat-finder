-- Emails the owner when someone signs up: each new profile pings
-- /api/notify-signup (which sends the email through Resend).
create extension if not exists pg_net;

create or replace function public.notify_signup()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://www.matfinderbjj.com/api/notify-signup',
    body := jsonb_build_object('id', new.id),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public, extensions;

drop trigger if exists on_profile_created_notify on public.profiles;
create trigger on_profile_created_notify
  after insert on public.profiles
  for each row execute procedure public.notify_signup();
