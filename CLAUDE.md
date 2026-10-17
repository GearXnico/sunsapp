# CLAUDE.md · sunsapp

sunsapp takes a location and a date range and returns, for each day, the twilight, sunrise, solar noon, golden hour and sunset times, shown as a 24-hour sky view of one day, a table and a line chart. The backend geocodes the location with Nominatim, asks SunriseSunset.io for the sun times and caches the results with `Rails.cache`.

Chat with Nico in Spanish or English; both are fine. In Spanish, keep in English the technical terms the industry uses in English. When you use an acronym, add its meaning in parentheses the first time.

Code, comments, documentation, commit messages, branch names and PR (pull request) text are in English.

## Principles

- **No overengineer.** Do the minimum that solves the task; no layers, abstractions or configuration "just in case".
- **Keep it simple and secure.** Between two secure options, pick the simpler one. Security is never cut, but it is solved with the most direct thing that works.

## Documents

| Document | Purpose |
|---|---|
| `docs/architecture.md` | Components, request flow and folder map |
| `docs/api.md` | Contract of `GET /api/sun_cycle` |
| `docs/adr/` | The why behind each decision (ADR, architecture decision record); index in `docs/adr/README.md` |

Don't change an ADR decision on your own. If the code doesn't match a document, ask first.

## Stack

- **Backend:** Ruby 4.0.7, Rails 8.1 (API mode), `Rails.cache` (Solid Cache on SQLite), Minitest.
- **Frontend:** React 19, TypeScript in strict mode, Vite, Vitest, Chart.js.
- **External APIs:** SunriseSunset.io (sun times) and Nominatim (geocoding).
- **CI (continuous integration):** GitHub Actions in `.github/workflows/`.

## Structure

The flow goes one way: component → API client → controller → core → external API. The core caches with `Rails.cache`; there are no models.

```
sunsapp/
├── .github/                   CI workflows and PR template
├── .claude/skills/            project skills
├── docs/                      architecture.md, api.md, adr/
├── backend/                   Rails 8 API
│   ├── app/controllers/api/   receives and validates the request, builds the response
│   ├── app/core/sun_cycle/    query.rb (validates), lookup.rb (Rails.cache + API),
│   │                          sunrise_sunset_client.rb, geocoding_client.rb
│   └── test/                  mirrors app/ (controllers, core)
├── frontend/                  React + TypeScript (Vite)
│   └── src/
│       ├── api/               HTTP client and SunCycleDay type (only place that knows the URL)
│       ├── lib/               pure functions: time parsing and formatting, chart data, day stages, CSV export
│       ├── components/        SearchForm, Results, DayView, SkyBand, StageList, ResultsChart,
│       │                      ExportCsvButton, LoadingScreen, ErrorMessage
│       └── App.tsx            builds the screen and holds the state
├── compose.yml                local development (docker compose up)
├── CHANGELOG.md
├── CLAUDE.md
└── README.md
```

## Commands

Update this section if they change.

```bash
# Everything locally (backend :3000, frontend :3001)
docker compose up

# Backend
cd backend
bundle install
bin/rails db:prepare
bin/rails server                               # :3000
bin/rails test                                 # SimpleCov, fails below 80 %
bin/rubocop
bin/brakeman --no-pager
bundle exec bundler-audit check --update

# Frontend
cd frontend
npm ci
npm run dev                                    # Vite on :3001
npm test                                       # Vitest
npm run test:coverage                          # fails below 80 %
npm run lint && npm run typecheck
npm run build                                  # static site in dist/
npm audit --audit-level=high
```

The frontend reads the API URL from `VITE_API_URL` (default `http://localhost:3000`).

CI runs `.github/workflows/backend.yml` and `.github/workflows/frontend.yml` on every pull request and on push to `develop` and `main`. On push to `main`, `.github/workflows/pages.yml` publishes the frontend to GitHub Pages and Render deploys the API from `render.yaml` (ADR 0009).

## Git flow (ADR 0002)

**Branches**

- `feature/*`, `fix/*`, `docs/*`, `chore/*` and `refactor/*` start from `develop`.
- `hotfix/*` starts from `main`; `release/x.y.z` starts from `develop`.
- Lowercase, hyphenated, 2 to 4 English words.
- Never work directly on `develop` or `main`.

**Pull requests and merges**

- One PR per plan task, targeting `develop`, using the PR template (Before, After, How to test, Checklist).
- Release PRs (`release/x.y.z` → `main`) use `.github/PULL_REQUEST_TEMPLATE/release.md`: what's new and every feature included.
- Rebase & merge is the only merge method.
- **The agent never merges, approves or pushes to `develop` or `main` without Nico's explicit authorization and prior review.**
- `git push --force-with-lease` only on your own branch; never force push anywhere else.

**Commits**

- Conventional Commits in English: `feat: add timezone label`.
- Types: `feat`, `fix`, `test`, `docs`, `refactor` and `chore`.
- Each commit does one thing and leaves the tests green, because merges use rebase & merge.

## Migrations

- Migrations only add: new tables, optional columns or indexes.
- Removing a table or column takes two PRs: the first stops using it in the code, and a later one drops it with a migration. Each step can then be reverted on its own, and a running older version never loses a table it still reads.

## Tests

- Every `fix/*` starts with a failing test that reproduces the bug.
- Minimum coverage: 80 % of lines, in the backend and in the frontend.
- Tests never hit the network: stub HTTP with WebMock (backend) and mock the API client (frontend).
- Never skip, disable or delete a test to get CI green.

## Security

- Validate every input (location, dates, range) before using it.
- Never send internal error details (exception messages, stack traces) to clients.
- No secrets, `.env` files or real personal data in the repo; version only `.env.example`.
- Don't log personal data.
- New dependencies must pass `bundle exec bundler-audit check --update` or `npm audit --audit-level=high`.

## CHANGELOG

Each PR adds its entries under `## [Unreleased]` at the top of `CHANGELOG.md`, without a version number:

- The version is decided once, on `release/x.y.z`, with SemVer: a breaking contract change bumps MAJOR, any new feature bumps MINOR, only fixes bump PATCH.
- Every version in the CHANGELOG is a release on `main` with its tag; a `hotfix/*` adds its own PATCH section.
- The versioning guide is at the end of `CHANGELOG.md`.

## When each task is done

1. Run tests, coverage, lint, typecheck and audits, and confirm everything is green.
2. Add the entries under `Unreleased` in the CHANGELOG and update the ADR and docs the task touches.
3. Push the branch and open the PR to `develop`; Nico reviews and merges.
4. If a command or a convention changed, update this file in the same PR.

## Ask first

Don't do any of these without Nico's approval:

- Changing the stack, a major version or an ADR decision.
- Adding a paid service or a new external service.
- Deploying the app anywhere.
