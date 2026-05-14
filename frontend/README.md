# Matcha — Frontend

Vite + React app for the Matcha creator/advertiser platform.

## Running locally

```bash
npm install
npm run dev
```

The dev server listens on http://localhost:5173.

## Environment

Copy `.env.example` (in the repo root) and create `frontend/.env` with:

```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_AGENTS_BASE_URL=http://localhost:8000
VITE_ADVERTISER_ID=
```

`VITE_ADVERTISER_ID` is optional. If unset, the advertiser id is resolved from
`?advertiserId=...` in the URL, then `localStorage`, then a fallback call to
`/api/advertisers/sample`.

## Project layout

- `src/services/api.js` — single source of truth for backend (`/api/...`) calls.
  Use `userAPI`, `campaignAPI`, `dealAPI`, `contractAPI`, `advertiserAPI`.
- `src/lib/advertiser.js` — advertiser id resolution helper.
- `src/pages/` — route components (creator + advertiser flows + onboarding).
- `src/components/` — shared UI primitives + modals.
