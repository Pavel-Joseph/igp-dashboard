# IGP India Dashboard frontend

React + Vite frontend for the 2026 IGP dashboard. This is a **design preview**. The login choices switch preview workspaces; they are not authentication or security controls.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` checks TypeScript and creates a production frontend bundle in `dist/`.

## Current pages

- Landing page and four-option login selection: Admin, Child Sponsor, Awareness & Preventive Education, Partners Login.
- Admin: Dashboard, Partners Grant, Partners Schedule, Funds Received, India Office Management.
- Partner preview: Dashboard and Q1–Q4 pages for RAISE, the sample signed-in organisation. The dashboard consolidates quarter budgets, funds received and expenses; shows annual balance/excess, girls counts and a two-ring quarter chart. Quarter pages accept funds-received and expense entries plus a NEW girls count. Preview entries are stored only in this browser's local storage. In the finished service the authenticated account must determine the partner on the server.
- Child Sponsor: one dashboard showing ECC, CS, EA and NEW counts, plus a reported total for each partner and a programme comparison. ECC, CS and EA come from the workbook snapshot. NEW is shown only when a count was entered in this browser's partner preview; otherwise it remains unreported.
- APE: one dashboard for JJS, BHS, CHF and KMVS with Target, YCM, PAT, DDF and Achieved columns. The supplied workbook snapshot provides targets for JJS and BHS only; unavailable programme values are shown as dashes. Workbook budget items named PAT and DDF are not used as programme results.

## Preview data

`src/data/workbookSnapshot.json` is a static, read-only extraction from the 2026 workbook. `scripts/extract_workbook_snapshot.py` documents the current mapping and can refresh this local preview from a workbook path. It never edits the workbook. On the partner dashboard, quarterly budget means the sum of scheduled transfers in that quarter. Expenses are empty until entered in the preview, and NEW is not supplied by the snapshot.

The **Funds Received** view currently maps to `Credit Data`; this mapping should be confirmed before treating it as the final funds-received model. Figures in the supplied dashboard screenshots may differ from this workbook snapshot. The frontend displays the workbook values, not values transcribed from the images.

## Live Excel connection later

A browser cannot safely open a workbook from a local `C:\` path for users across the internet. The live service will need the workbook in a managed shared location such as OneDrive for Business or SharePoint, a server-side connection to it, real authentication, role and partner checks on every request, and a separate audit/approval record. None of those backend pieces are part of this frontend preview.
