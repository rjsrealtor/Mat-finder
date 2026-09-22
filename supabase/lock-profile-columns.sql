-- Security fix: "users can update their own profile" plus a table-wide UPDATE
-- grant let any signed-in user set profiles.is_admin = true on themselves.
-- Limit what they can update to display_name only.
revoke update on table profiles from authenticated, anon;
grant update (display_name) on table profiles to authenticated;
