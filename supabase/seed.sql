-- Mat Finder — starter listings
-- Run this AFTER schema.sql, once, in the Supabase SQL editor.
-- These 15 were verified against each gym's own website in September 2026 —
-- confirm current day/time/fee before publicizing further; open mat
-- schedules change often. Re-running this file is safe (it upserts by name+city).

insert into listings (name, city, state, address, day, time, gi, fee_cents, fee_note, visitor_policy, policy_note, status, source)
values
  ('Legion American Jiu-Jitsu', 'San Diego', 'CA', '7550 Miramar Rd Suite 330, San Diego, CA 92126', 'Sunday', '12:00 PM – 2:30 PM', 'gi_nogi', 0, 'Free', 'conditions', '18+ only, rolling experience required — not a first-class venue.', 'active', 'seed'),
  ('Atos Jiu-Jitsu HQ', 'San Diego', 'CA', '4810 Mercury St, San Diego, CA 92111', 'Check schedule', 'Varies — see academy schedule', 'gi_nogi', null, 'Ask front desk', 'open', 'Visitors are welcome anytime at the academy.', 'active', 'seed'),
  ('Colorado Brazilian Jiu Jitsu Satori', 'Denver', 'CO', '4605 Quebec St Unit B5, Denver, CO 80216', 'Sunday', '12:00 PM – 1:00 PM', 'gi', 1000, '$10 for non-members, free for CBJJS members', 'open', 'Community open mat, open to any gym.', 'active', 'seed'),
  ('The Coop BJJ', 'Los Angeles', 'CA', '10131 National Blvd, Los Angeles, CA 90034', 'Sat & Sun', 'Sat 10:00 AM–12:00 PM · Sun 11:00 AM–1:00 PM', 'gi_nogi', 0, 'Free trial open mat, $35 day pass after', 'open', 'Out-of-town guests welcome — please sign the waiver first.', 'active', 'seed'),
  ('@ Jiu Jitsu NYC', 'Jackson Heights, Queens', 'NY', '82-19 Northern Blvd 2nd Fl, Jackson Heights, NY 11372', 'Sunday', '10:00 AM – 12:00 PM', 'gi_nogi', 0, 'Free', 'open', 'All affiliations and academies welcome.', 'active', 'seed'),
  ('Boston Submission Fighting', 'Arlington', 'MA', '965 Massachusetts Ave #102, Arlington, MA 02476', 'Sunday', '10:00 AM – 12:00 PM', 'nogi', 0, 'Free for visitors', 'open', 'Saturday 11am–12pm open mat at this gym is members-only, but Sunday is open to all.', 'active', 'seed'),
  ('Southside Jiu Jitsu Club — Randori', 'Chicago', 'IL', '837 & 841 E 63rd St, Chicago, IL 60637', 'Fri & Sat', '7:00 PM – 7:45 PM', 'gi_nogi', null, 'Contact gym for drop-in rate', 'conditions', '30+ classes or 6 months experience required; open to drop-ins.', 'active', 'seed'),
  ('Ground Game Theory', 'Miami', 'FL', '9766 SW 24th St Unit 12, Miami, FL 33165', 'Check schedule', 'Varies — see academy schedule', 'nogi', null, 'Contact gym', 'open', 'Local students, visitors and hobbyists all welcome.', 'active', 'seed'),
  ('Midnight Jiu-Jitsu Club', 'Seattle', 'WA', '755 Bellevue Ave E, Seattle, WA 98102', 'Saturday', '10:00 AM – 11:30 AM', 'gi_nogi', 0, 'Free, waiver only', 'conditions', 'Open to non-members — experienced grapplers only.', 'active', 'seed'),
  ('VOW Jiu-Jitsu', 'Austin', 'TX', '5555 N Lamar Blvd H115, Austin, TX 78751', 'Sunday', '2:00 PM start — confirm end time with gym', 'nogi', 2500, '$25 class pass for non-members', 'open', 'Non-member drop-ins welcomed.', 'active', 'seed'),
  ('Temporal BJJ', 'Atlanta (East Atlanta Village)', 'GA', '1231 Glenwood Ave SE, Atlanta, GA 30316', 'Check schedule', 'Book online for current time', 'gi_nogi', 3500, '$35 per session', 'open', null, 'active', 'seed'),
  ('10th Planet Jiu Jitsu Portland', 'Portland', 'OR', '1735 SE Grand Ave, Portland, OR 97214', 'Friday', 'Evening — see gym schedule', 'nogi', 3000, '$30 drop-in for visiting grapplers', 'open', 'Explicitly open to every academy in the city.', 'active', 'seed'),
  ('Fight For Us Jiu Jitsu', 'Las Vegas', 'NV', '7135 W Ann Rd #140, Las Vegas, NV 89130', 'Saturday', 'From 10:00 AM', 'gi_nogi', 0, 'Free with intro trial — ask about drop-in rate after', 'open', 'Kids and adults, no formal class structure.', 'active', 'seed'),
  ('RocknRoll BJJ & Fitness', 'Santa Ana', 'CA', '10862 Coronel Rd Suite B, Santa Ana, CA 92705', 'Saturday', 'Morning — see gym for exact time', 'gi', 0, 'Free', 'open', 'All schools and belt levels invited; visitors from out of town welcome.', 'active', 'seed'),
  ('Refuge BJJ', 'Phoenix', 'AZ', '711 E Carefree Hwy Suite 201, Phoenix, AZ 85085', 'Saturday', 'Morning — see gym schedule', 'gi_nogi', null, 'Contact gym', 'open', 'Walk-ins and visitors always welcome.', 'active', 'seed')
on conflict (name, city, day, time) do nothing;
