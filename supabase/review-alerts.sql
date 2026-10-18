-- Emails the owner when someone rates or reviews a gym: each new or edited
-- rating pings /api/notify-review (which sends the email through Resend).
-- To turn the alerts off later: drop trigger on_rating_notify on public.ratings;
create extension if not exists pg_net;

alter table public.ratings add column if not exists updated_at timestamptz not null default now();

create or replace function public.notify_review()
returns trigger as $$
begin
  if tg_op = 'UPDATE' then
    if new.stars is not distinct from old.stars and new.comment is not distinct from old.comment then
      return new;
    end if;
    new.updated_at := now();
  end if;
  perform net.http_post(
    url := 'https://www.matfinderbjj.com/api/notify-review',
    body := jsonb_build_object('id', new.id, 'edited', tg_op = 'UPDATE'),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public, extensions;

drop trigger if exists on_rating_notify on public.ratings;
create trigger on_rating_notify
  before insert or update on public.ratings
  for each row execute procedure public.notify_review();
