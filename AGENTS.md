# AGENTS.md

Guidance for coding agents working in this repository.

sunsapp takes a location and a date range and returns, for each day, the twilight, sunrise, solar noon, golden hour and sunset times, shown as a 24-hour sky view of one day, a table and a line chart. The backend geocodes the location with Nominatim, asks SunriseSunset.io for the sun times and caches the results with `Rails.cache`.

## Principles

- Do the minimum that solves the task. No layers, abstractions or configuration "just in case".
- Between two secure options, pick the simpler one. Security is never traded away.
- Write code a reviewer can read without comments. Comment only a non-obvious *why*.

## Stack

- **Backend:** Ruby 4.0, Rails 8.1 in API mode, `Rails.cache` (Solid Cache on SQLite), Minitest.
- **Frontend:** React 19, TypeScript (strict), Vite, Vitest, Chart.js.
- **External APIs:** SunriseSunset.io (sun times) and Nominatim (geocoding).
- **CI/CD:** GitHub Actions; the API runs on Render and the frontend on GitHub Pages.

## Layout

The flow goes one way: component → API client → controller → core → external API. The core caches with `Rails.cache`; there are no models.

```
backend/                     Rails API
  app/controllers/api/       validates the request and builds the response
  app/core/sun_cycle/        query.rb (validation), lookup.rb (cache + API),
                             sunrise_sunset_client.rb, geocoding_client.rb
  test/                      mirrors app/
frontend/src/
  api/                       HTTP client and response types (the only place that knows the URL)
  lib/                       pure functions: time parsing, chart data, day stages, CSV export
  components/                one component per file
  App.tsx                    builds the screen and holds the state
docs/                        architecture, API contract, ADRs
.claude/skills/              Claude Code project skills
compose.yml                  local development
render.yaml                  API deployment (Render Blueprint)
```

## Commands

```bash
docker compose up                      # backend :3000, frontend :3001

# Backend
cd backend
bundle install && bin/rails db:prepare
bin/rails test                         # SimpleCov fails below 80 %
bin/rubocop
bin/brakeman --no-pager
bundle exec bundler-audit check --update

# Frontend
cd frontend
npm ci
npm run dev                            # Vite on :3001
npm run test:coverage                  # fails below 80 %
npm run lint && npm run typecheck
npm run build
npm audit --audit-level=high
```

The frontend reads the API URL from `VITE_API_URL` (default `http://localhost:3000`).

## Conventions

- Code, comments, docs, commits, branch names and PRs in English, including test names.
- `GET /api/sun_cycle` is the only endpoint. A change to its response follows `docs/api.md` and the `api-contract` skill.
- Times in the response are local to the place, 24-hour `HH:MM`, and `null` when missing.
- Migrations only add (tables, optional columns, indexes). Removing something takes two PRs: stop using it, then drop it.

## Workflow

- git-flow: `feature/`, `fix/`, `docs/`, `chore/` and `refactor/` branch from `develop`; `hotfix/` and the back-merge start from `main`; `release/x.y.z` starts from `develop`. Names are 2 to 4 lowercase, hyphenated words.
- Conventional Commits (`feat`, `fix`, `test`, `docs`, `refactor`, `chore`); each commit does one thing and keeps the tests green, because merges use rebase & merge.
- One focused PR to `develop`, using the PR template. Release PRs use `.github/PULL_REQUEST_TEMPLATE/release.md`.
- Every change records an entry under `## [Unreleased]` in `CHANGELOG.md`; the version is chosen only on `release/x.y.z` (guide at the end of the file).
- Never push to, merge into, approve on or force-push `develop` or `main`. `--force-with-lease` only on your own branch.

## Tests

- Every feature ships with tests; every fix starts with a failing test that reproduces the bug.
- Minimum line coverage: 80 % in the backend and in the frontend.
- Tests never hit the network: WebMock in the backend, a mocked API client in the frontend.
- Never skip, disable or delete a test to get CI green.

## Security

- Validate every input (location, dates, range) before using it.
- Never send internal error details (exception messages, stack traces) to clients.
- No secrets, `.env` files or real personal data in the repo; only `.env.example`.
- Don't log personal data.
- New dependencies must pass `bundler-audit` or `npm audit --audit-level=high`.

## Ask before

- Changing the stack, a major version or a decision recorded in `docs/adr/`.
- Adding an external or paid service.
- Deploying the app, or changing `render.yaml` or the workflows.
