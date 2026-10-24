# 0001 · Monorepo with a Rails API backend and a React frontend

- **Status:** Accepted
- **Date:** 2026-10-14

## Context

sunsapp started (May 2025) as a single repository with a Rails 8 API in `backend/` and a React app in `frontend/`. The app is small: one endpoint, `GET /api/sun_cycle`, and one screen. Reaching 1.0.0 means fixing bugs and modernizing both sides, so the repository layout needs confirming the repository layout and the domain logic needs a home.

Today the logic is split between a large controller (`Api::SunCycleController`, which validates, geocodes, loops over days and caches) and `app/services/sun_cycle_fetcher.rb`. That makes it hard to test each step and to see, when opening the repo, where the "sun cycle" logic is.

## Options considered

**Repository layout**

1. **Monorepo with `backend/` and `frontend/` (current).** One clone, one CI, one PR per change even when it touches both sides.
2. **Two repositories.** Independent versions and pipelines, but the API contract changes in two places and needs two PRs.
3. **Rails full stack (views or Hotwire) without a separate frontend.** Fewer moving parts, but drops the React + TypeScript frontend already decided for the project.

**Where the domain logic lives**

1. **`backend/app/services/`.** The usual Rails convention, but "services" becomes a bucket for anything, and today it holds a single fetcher.
2. **`backend/app/core/sun_cycle/`.** An explicit "core" folder with one file per responsibility: `query.rb` (validates the request), `lookup.rb` (cache + API), `sunrise_sunset_client.rb` and `geocoding_client.rb`.
3. **`backend/lib/`.** Plain Ruby outside the app, but not autoloaded by default and easy to forget.

## Decision

- Keep the **monorepo** with a Rails 8 API in `backend/` and a React frontend in `frontend/`.
- Put the domain logic in **`backend/app/core/sun_cycle/`**, with a thin controller that only receives the request and builds the response. The models only store the cache.
- The name "core" is chosen for human readability: someone opening the repo sees where the app's logic is without knowing Rails conventions. Rails autoloads every folder under `app/`, so `app/core/sun_cycle/query.rb` defines `SunCycle::Query` with no extra configuration.
- `app/services/` is removed when the logic moves.

## Consequences

- One CI, one CHANGELOG and one PR per change, even when a change touches the API and the screen.
- Each step (validation, cache, external clients) is a small class tested on its own, with HTTP stubbed.
- The request flow goes one way: component → API client → controller → core → external API.
- `app/core/` is not a Rails default; `docs/architecture.md` and `AGENTS.md` explain it so contributors don't add a parallel `app/services/`.
