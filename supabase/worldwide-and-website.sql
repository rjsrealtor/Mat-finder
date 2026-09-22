-- Worldwide listings + website link. Run once in the Supabase SQL editor.
alter table listings add column if not exists website text;
alter table listings add column if not exists country text not null default 'US';
alter table listings add column if not exists currency text not null default 'USD';

-- Recreate so l.* picks up the new columns.
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

-- Same gym name + city can exist in two countries.
drop index if exists listings_name_city_day_time_key;
create unique index if not exists listings_name_city_country_day_time_key
  on listings (name, city, country, day, time);
