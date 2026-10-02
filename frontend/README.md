# IGP India Dashboard frontend

React + Vite frontend for the 2026 IGP dashboard. This is a **read-only design preview**. The login choices switch preview workspaces; they are not authentication or security controls.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` checks TypeScript and creates a production frontend bundle in `dist/`.

## Current pages

- Landing page and four-option login selection: Admin, Child Sponsor, Awareness & Preventive Education, Partners Login.
- Admin: Dashboard, Partners Grant, Partners Schedule, Funds Received, India Office Management.
- Partner preview: one selected partner's grants and schedule. In the finished service the signed-in account must determine that partner; the selector is only for demonstrating the layout.
- Child Sponsor and APE: workspace shells awaiting their detailed fields and permission rules.

## Preview data

`src/data/workbookSnapshot.json` is a static, read-only extraction from the 2026 workbook. `scripts/extract_workbook_snapshot.py` documents the current mapping and can refresh this local preview from a workbook path. It never edits the workbook.

The **Funds Received** view currently maps to `Credit Data`; this mapping should be confirmed before treating it as the final funds-received model. Figures in the supplied dashboard screenshots may differ from this workbook snapshot. The frontend displays the workbook values, not values transcribed from the images.

## Live Excel connection later

A browser cannot safely open a workbook from a local `C:\` path for users across the internet. The live service will need the workbook in a managed shared location such as OneDrive for Business or SharePoint, a server-side connection to it, real authentication, role and partner checks on every request, and a separate audit/approval record. None of those backend pieces are part of this frontend preview.
