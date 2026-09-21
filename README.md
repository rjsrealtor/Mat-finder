# Mat Finder

Find free (and fee-based) Brazilian Jiu-Jitsu open mats near you. Anyone can
browse listings without an account; signing in (free) lets you add open
mats, rate them, and report changes — including flagging a listing as
members-only, which removes it from the default results.

Built with **Next.js 14** (App Router) + **Supabase** (Postgres, Auth, Row
Level Security). No paid services required to run this.

This README assumes zero existing accounts and walks through everything
from scratch. It'll take about 20–30 minutes the first time.

---

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub or email).
2. Click **New project**. Pick any name (e.g. `mat-finder`), generate a
   database password (save it somewhere, you likely won't need it again),
   and pick a region close to you. Free tier is fine.
3. Wait ~2 minutes for the project to finish provisioning.

### Run the schema

1. In the Supabase dashboard, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase/schema.sql` from this project, copy its entire contents,
   paste into the SQL editor, and click **Run**. This creates all tables,
   security policies, the ratings view, and the `apply_report` function.
3. New query again → paste the contents of `supabase/seed.sql` → **Run**.
   This adds 15 starter open mat listings across the US so the app isn't
   empty on day one.

### Get your API keys

1. In the dashboard, go to **Project Settings** (gear icon) → **API**.
2. You'll need two values from this page:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon / public key** (a long string starting with `eyJ...`)

Keep this tab open — you'll paste these into Vercel in step 3.

### Turn off email confirmation (optional, for faster testing)

By default Supabase requires users to click a confirmation link before
signing in. That's fine for production, but if you want to test sign-up
instantly: **Authentication** → **Providers** → **Email** → toggle off
**Confirm email**. You can turn it back on later.

---

## 2. Put the code on GitHub

1. Create a free account at [github.com](https://github.com) if you don't
   have one.
2. Create a new **empty** repository (no README/gitignore — this project
   already has them), e.g. `mat-finder`.
3. From inside this project folder on your computer:

   ```bash
   cd matfinder
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/mat-finder.git
   git push -u origin main
   ```

---

## 3. Deploy to Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign up — choose **Continue
   with GitHub** so it can see your repo.
2. Click **Add New… → Project**, find your `mat-finder` repo, click
   **Import**.
3. Vercel auto-detects Next.js — no build settings to change.
4. Before deploying, expand **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon/public key |
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now, fill in after step 5 |

5. Click **Deploy**. In ~1–2 minutes you'll get a live URL like
   `https://mat-finder-xyz.vercel.app`.

### Finish wiring auth redirects

1. Copy your live Vercel URL.
2. Back in Vercel: **Project Settings → Environment Variables**, set
   `NEXT_PUBLIC_SITE_URL` to that URL, then **Deployments → ⋯ → Redeploy**
   on the latest deployment so it picks up the change.
3. In Supabase: **Authentication → URL Configuration**, set **Site URL** to
   your Vercel URL, and add `https://<your-app>.vercel.app/auth/callback`
   under **Redirect URLs**.

That's it — the site is live and free. Vercel's free tier and Supabase's
free tier both comfortably cover a new app with modest traffic.

---

## Local development (optional)

If you want to run it on your own machine before/instead of deploying:

```bash
cd matfinder
cp .env.local.example .env.local
# fill in .env.local with your Supabase URL + anon key
npm install
npm run dev
```

Then open `http://localhost:3000`.

---

## How the data model works

- **`listings`** — the open mats themselves. Nobody can `UPDATE` a listing
  directly (not even signed-in users) — all edits go through the
  `apply_report` function so every change is logged.
- **`ratings`** — one row per (listing, user); a user can update their own
  rating but not anyone else's. `listings_with_rating` is a view that
  joins and averages these for display.
- **`reports`** — an audit log of every "closed" / "members only" /
  "correction" report submitted, plus the effect it had. The
  `apply_report` Postgres function (SECURITY DEFINER) is the only thing
  allowed to write it, so a report is always both logged and applied
  atomically.
- A listing with `status = 'closed'` or `visitor_policy = 'members_only'`
  is hidden from the default view — visitors can still reveal it with the
  "Show closed / members-only" checkbox, mainly so someone can see *why*
  it's flagged.

## What's next (not built yet)

- **Native mobile app**: this is a normal responsive website first — the
  plan discussed was website first, then wrap it (e.g. with Capacitor or
  Expo + a WebView, or a from-scratch React Native app hitting the same
  Supabase backend) once the website has real usage.
- **Monetization ideas to consider**: sponsored/featured gym listings,
  a "verified" badge for gyms that keep their listing up to date, premium
  filters (e.g. saved searches, alerts for new mats near you), affiliate
  links for gear, or eventually in-app payment for gyms that want to sell
  day passes through the app (Supabase + Stripe is a common pairing for
  this). The `profiles`/`auth` groundwork here is what a payments feature
  would build on.
- **Geolocation search** ("near me") — the schema stores city/state/address
  but not lat/lng yet; adding `postgis` or plain `lat`/`lng` columns plus a
  browser geolocation prompt would be the next natural feature.

## Project structure

```
app/                  Next.js App Router pages
  page.tsx            Home page (renders ListingsApp)
  login/page.tsx       Sign in / sign up
  auth/callback/       Handles Supabase email-confirmation redirect
components/           React components (all client-side)
lib/supabase/         Browser + server Supabase client helpers
lib/types.ts          Hand-written TS types matching the schema
supabase/schema.sql   Full database schema, RLS policies, RPC function
supabase/seed.sql     15 starter listings
middleware.ts         Refreshes the Supabase auth session on each request
```
