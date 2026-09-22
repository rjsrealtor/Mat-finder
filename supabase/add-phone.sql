-- Adds an optional phone number to listings. Run once in the Supabase SQL editor.
alter table listings add column if not exists phone text;

-- listings_with_rating selects l.*, which Postgres expands when the view is
-- created, so it must be recreated to pick up the new column.
drop view if exists listings_with_rating;
create view listings_with_rating with (security_invoker = true) as
select
  l.*,
  coalesce(round(avg(r.stars)::numeric, 2), 0) as rating_avg,
  count(r.id) as rating_count
from listings l
left join ratings r on r.listing_id = l.id
group by l.id;

grant select on table listings_with_rating to anon, authenticated;
