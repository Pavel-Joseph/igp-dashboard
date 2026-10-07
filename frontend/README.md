# IGP India Dashboard frontend

React + Vite frontend. The production build uses Supabase Auth and the 2026 admin tables defined in `../database/001_admin_workbook.sql`.

## Local build

Run `npm install` and `npm run build` in this folder. For local live sign-in, create an ignored `.env.local` containing:

```env
VITE_SUPABASE_URL=https://iiabwxffqaizukeswptd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Use only the **publishable** key in Vite. Never place the Supabase secret/service-role key or database password in Vite or Git. The publishable key is designed for browser use; row-level security and a signed-in account control access.

## Vercel setup

In the Vercel project's **Settings → Environment Variables**, add the same two `VITE_` variables for Production. Redeploy after adding them; Vite reads them at build time. The local `.env.local` is Git-ignored and does not configure Vercel.

The app requires a Supabase Auth user and a matching `public.user_profiles` row. To establish the first admin:

1. In Supabase **Authentication → Users**, create or invite your own account.
2. Copy that user's UUID, then run this in Supabase SQL Editor, replacing the placeholder:
   `insert into public.user_profiles(id,role) values ('AUTH_USER_UUID'::uuid,'admin');`
3. Sign in at the app's Login page.

No email address or password is stored in the project source. Partner accounts later need `role='partner'` and the matching `partner_id`; RLS limits reads to that partner. Child Sponsor and APE users have their own assigned roles. A person cannot select a higher role from the browser.

## Current live scope

The Admin dashboard reads partner grants, programme figures, planned schedules, and monthly petty-cash totals from Supabase. Child Sponsor and APE dashboards read the metrics allowed by their database role. Partner pages read only the assigned partner's grant, schedule, and programme figures.

Funds received, quarterly expenses, NEW girls counts, and APE outcome measures were not present in the admin workbook. Their live views show them as unavailable. Quarter entry forms remain read-only until their data tables and final edit/approval rules are defined. The two external-workbook schedule formulas are excluded from verified schedule totals.

The earlier workbook preview and localStorage entry form are available only in development without Supabase environment variables. They are not the production data source.
