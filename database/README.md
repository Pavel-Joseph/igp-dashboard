# 2026 admin workbook database

This folder contains a PostgreSQL/Supabase schema and a repeatable SQL import generated from `Finance Reports for 2026.xlsx`. The workbook itself is read-only during import. No cloud database has been provisioned, and the React frontend still uses its earlier static snapshot.

## Files

- `001_admin_workbook.sql`: tables, row-level security, audit/version triggers, and reconciliation views.
- `import_workbook.py`: reads the workbook and produces SQL.
- `seed_2026.sql`: generated values from the Desktop workbook copy supplied on 7 October 2026.

Run the schema, then seed, in a **new Supabase project's SQL editor** as the database owner. Do not expose a database password or service-role key in the Vite frontend. Create Auth users in Supabase Auth, then assign roles by inserting their Auth UUIDs into `public.user_profiles` as an administrator. A partner profile must include its `partner_id`. The initial admin profile must be inserted through the SQL editor or another trusted server-side process because no client can grant itself admin access.

The schema permits five role values: admin, child_sponsor, ape, partner, and associate. Admin can manage the imported data. Partners can read only their own partner rows; sponsor and APE users can read their respective programme metrics. Associate has no access to these admin tables yet. The original Associate approval responsibilities and the four current login labels still need a final role mapping before implementing those workflows. Audit events store each database row's prior and new versions, including profile changes. Database-owner operations, including the seed import, have a null actor ID.

Blank workbook cells are **not** imported; explicit numeric zeroes are. An external-workbook formula is imported with no verified amount, while its cached number and formula text are retained for review. SQL views calculate grant line-item totals and verified schedule totals. The workbook's displayed formula totals are not imported as separate source records.

## Workbook mapping

| Workbook sheet | Database tables | Imported records |
| --- | --- | ---: |
| Partners Grant'26 | partners, partner_grants, partner_grant_items | 12 partners, 12 grant headers, 74 grant items |
| Partners Index'26 | partner_metrics | 66 metrics |
| Partners Schedule'26 | partner_schedules | 36 populated month cells |
| Petty Cash'26 | petty_cash_monthly | 148 populated category-month cells |

`Sheet5` is empty. The metrics include programme counts, APE targets, and an `Admin` value whose unit is **unspecified** (one workbook cell is 0.084). No meaning was invented for that fractional value.

## Missing or needing confirmation

- There is no funds-received/actual transfer entry sheet. The schedule is planned funding, not proof of receipt.
- There are no partner quarterly expense entries or detailed office/petty-cash transactions. Petty cash has only monthly category totals, with September–December blank.
- There are no user emails, Auth IDs, role assignments, approval requests, or prior change logs in the workbook. New database edits will be logged after this schema is installed.
- `NEW` girls counts and APE `YCM`, `PAT`, `DDF`, and `Achieved` outcomes are absent. The index has APE targets for **JJS, ISD, BHS, CHF, and KMVS**; confirm whether ISD should appear in the APE dashboard.
- `SUSU` in the grant sheet is `SISU` in the index and schedule; `Anbu Illam` is `AI` in the index. The importer treats these as the same partners; confirm the preferred names.
- Schedule cells `O9` (Anbu Illam; cached 0) and `G14` (BHS; cached ₹690,422) refer to an external `Core Data-2` workbook that was not supplied. Their amounts are marked unverified and excluded from verified schedule totals.
- JJS's entered effective grant is ₹45,48,300, but ₹45,99,686 less ₹51,383 is ₹45,48,303. Schedule versus entered effective grant also differs for DSP (−₹0.50), RAISE (−₹0.49), JJS (+₹3), ISD (−₹15,85,881.62), and KMVS (+₹84). Confirm these values before using them for financial decisions.

## Validation performed

The SQL schema and generated import were executed in a temporary local PostgreSQL 18 instance with Supabase Auth role stubs. Imported counts matched the table above. A simulated partner account could read one partner's grant and metrics and no petty-cash rows. This is a local validation; it does not establish a deployed Supabase project or connect the frontend.
