# Changelog

All notable changes to sunsapp are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The versioning guide is at the end of this file.

## [Unreleased]

### Added

- `GET /api/sun_cycle` answers `429 Too Many Requests` when the same IP sends more than 20 requests in a minute, so one client cannot use up the SunriseSunset.io quota or the Nominatim limit (ADR 0012).
- Free deployment from `main` (ADR 0009): the API on Render's free plan from `render.yaml`, and the frontend on GitHub Pages from `.github/workflows/pages.yml`.

## [1.1.0] - 2026-10-17

### Added

- The response has `matched_place`, the name of the place the geocoder found, and the results show it under the title, so a wrong "Santiago" is visible (contract v3, ADR 0011). Geocoding cache entries move to the `geocoding/v2/` key, so places cached before are geocoded once more.
- Release pull request template (`.github/PULL_REQUEST_TEMPLATE/release.md`) with what's new and the list of features included.
- "Export CSV" button under the results table: downloads `sunsapp-<timezone>-<start>-<end>.csv` with date, sunrise, sunset, golden_hour and utc_offset, built in the browser with no API change (ADR 0015, now accepted). Missing times are empty cells, cells follow RFC 4180 and text cells that start with `=`, `+`, `-` or `@` are escaped against formula injection.
- Day sky view as the main visual: a 24-hour band of night, twilight, blue hour, golden hour and daylight with the sun's arc from sunrise to sunset peaking at solar noon, the list of stages with start and end times, day length and its change against the previous day, and Prev/Next between the days of the range ([ADR 0018](docs/adr/0018-day-sky-view.md)).
- `GET /api/sun_cycle` contract v3: `first_light`, `dawn`, `solar_noon`, `dusk` and `last_light` per day (24-hour `HH:MM` local time, `null` when missing). No field was renamed or removed.

### Changed

- New interface from the approved R5 wireframe ([ADR 0016](docs/adr/0016-ui-renewal.md), now accepted): a centered start card, the search form in one row on top of the results, and light and dark themes that follow the system.
- Search errors are plain-language messages inside the card (for example "We couldn't find that place."), the field at fault is marked with `aria-invalid`, and the API's raw text or internal details are never shown.
- Loading shows a turning sun inside the card and a disabled "Searching…" button instead of the full-screen overlay.
- The day view shows six key time cards (first light, sunrise, solar noon, golden hour, sunset, last light) instead of the stages list; "See variation" and "Export CSV" sit together above the table.
- The footer credits SunriseSunset.io and Nominatim (© OpenStreetMap contributors).
- Versions are decided at release time: PRs add their entries under `Unreleased`, and every version in this file is a tagged release on `main` (ADR 0002, amended).
- `CLAUDE.md` writes down the two-PR rule for removing a table or column.
- The line chart is behind a "See variation" button, and the table highlights the day shown in the day view.
- Sun times are cached under `sun_cycle/v2/`; entries written before contract v3 lack the new fields, are not read and expire on their own.
- The morning golden hour end is approximated as the evening golden hour start mirrored around solar noon.
- ADR 0013 (extended chart) is superseded by ADR 0018.

### Removed

- Bootstrap: the frontend uses its own CSS with design tokens.
- The unused `sun_cycle_data` table, dropped by a migration. The cache has lived in `Rails.cache` since 1.0.0 (ADR 0017).

## [1.0.0] - 2026-10-15

First stable release. It collects 0.1.4 to 0.1.14:

- Sun times shown in the place's own time zone, with a fixed 24-hour chart axis (contract v2 of `GET /api/sun_cycle`).
- Validated requests, generic errors and `Rails.cache` for sun times and geocoding.
- React 19 + TypeScript + Vite frontend; Ruby 4.0.7 and Rails 8.1.4 backend.
- Tests with an 80 % coverage gate, CI (continuous integration) for backend and frontend, and `docker compose up` for local development.
- New README, API reference and ADRs 0001 to 0017.

## [0.1.14] - 2026-10-15

### Added

- `docs/api.md`: the full contract of `GET /api/sun_cycle` (params, limits, 200 body, error messages, cache and CORS).
- Proposed ADRs 0009 to 0016 (free deployment, geocoding provider, ambiguous places, rate limiting, extended chart, bilingual UI, CSV export and UI renewal) and an ADR index in `docs/adr/README.md`.

### Changed

- New root README for first-time visitors: features, quick start, repository map, request flow diagram, API example and quality commands.
- Short, accurate `backend/README.md` and `frontend/README.md` replace the outdated Ruby 3.4.3/Rails 8.0.2 and Create React App ones.
- `docs/architecture.md` and `CLAUDE.md` match the current folders, cache and commands.

## [0.1.13] - 2026-10-15

### Changed

- Sun times are cached in `Rails.cache` (Solid Cache in production), one entry per place and day for 30 days, instead of the `sun_cycle_data` table; repeated searches still call SunriseSunset.io only for the missing days.
- Geocoding matches are cached for 30 days, as the Nominatim usage policy asks; misses and errors are not cached and the location text is not stored in the key.
- The production cache keeps entries at most 30 days (256 MB cap), and development always uses a 64 MB memory cache. See ADR 0017.

### Removed

- The `SunCycleData` model. The `sun_cycle_data` table stays until a later release drops it.

## [0.1.12] - 2026-10-15

### Added

- Root `compose.yml` for local development: `docker compose up` starts the backend (`ruby:4.0.7`, Rails on :3000, gems and SQLite in named volumes) and the frontend (`node:24-alpine`, Vite on :3001), with no nginx.

## [0.1.11] - 2026-10-15

### Changed

- Rails 8.0.5.1 → 8.1.4 (`load_defaults 8.1`), with the `app:update` changes reviewed by hand; the app keeps its own CORS, parameter filter and production settings.
- Ruby 3.4.3 → 4.0.7 in `.ruby-version` and the backend Dockerfile.
- json 3.1, minitest 6 (with `minitest-mock` for `Object#stub`) and native extension gems updated for Ruby 4.0.

### Removed

- The Brakeman ignore for the Rails 8.0 end of life (`config/brakeman.ignore`).

## [0.1.10] - 2026-10-15

### Fixed

- `GET /api/sun_cycle` validates its params (strict `YYYY-MM-DD` dates, at most 366 days, location up to 200 characters) and answers 400 with a clear message.
- A 500 answers a generic "Internal server error" and logs only the error class; the location is filtered from the logs.
- Nominatim requests send a User-Agent and a timeout, and a geocoding outage is no longer reported as an invalid location.
- CORS (cross-origin resource sharing) origins come from `CORS_ORIGINS` (default `http://localhost:3001`) and only `GET`, `HEAD` and `OPTIONS` are allowed.

### Changed

- The request logic moved from the controller to `backend/app/core/sun_cycle/` (`Query`, `Lookup`, `SunriseSunsetClient`, `GeocodingClient`).
- The cache is indexed by coordinates and date.

### Added

- ADR 0007 (SQLite cache and range limit).

## [0.1.9] - 2026-10-15

### Fixed

- `GET /api/sun_cycle` returns the sun times in 24-hour local time of the place, with its zone (API v2: `{ location, timezone, days: [{ date, sunrise, sunset, golden_hour, utc_offset }] }`). Before, it sent a parameter SunriseSunset.io does not have and got 12-hour times with no zone.
- Each cached day stores its `timezone` and `utc_offset`; cached rows without a zone are deleted and fetched again.
- Missing days are fetched in one call instead of one call per day.

### Added

- ADR 0006 (local time of the place).

## [0.1.8] - 2026-10-15

### Fixed

- The chart parses only 24-hour `HH:MM` times; 12-hour and ISO 8601 times no longer plot wrong points or none.
- Sun times are shown in the place's zone on a fixed 00:00-24:00 axis, with the zone in the axis title, tooltip and table, the offset per row when it changes (DST, daylight saving time) and gaps or dashes for missing times.
- Search errors render inline under the form instead of `alert()`.

### Added

- ADR 0008 (chart time axis).

## [0.1.7] - 2026-10-14

### Added

- Backend characterization tests for `GET /api/sun_cycle`, `SunCycleFetcher` and `SunCycleData`, with WebMock (no real HTTP), the Geocoder test lookup and SimpleCov (80 % minimum).
- Backend CI workflow at the repo root: tests, RuboCop, Brakeman and bundler-audit.
- ADR 0004 (tests and CI).

### Changed

- Gems updated for bundler-audit: Rails 8.0.5.1, httparty 0.24, **puma 8 (major bump required by a security advisory)**, Brakeman 8.1; json stays on 2.x because json 3 breaks Rails 8.0 rendering.

### Removed

- Unused mailers, jobs, Kamal deployment files and the ignored `backend/.github/` folder.

## [0.1.6] - 2026-10-14

### Changed

- Frontend migrated from Create React App to Vite 8 with React 19 and TypeScript strict; dev server on port 3001, build output in `dist/`.
- The API URL comes from `VITE_API_URL` (default `http://localhost:3000`) through `src/api/client.ts`.

### Added

- Vitest and Testing Library suite with an 80 % line-coverage gate, ESLint flat config and the frontend CI workflow.
- ADR 0005 (Vite and TypeScript).

### Removed

- CRA boilerplate and unused dependencies (`react-datepicker`, `is-obj`, `is-regexp`, `web-vitals`).

### Fixed

- `class` replaced by `className` in the results table.

## [0.1.5] - 2026-10-14

### Added

- Seven Claude Code project skills in `.claude/skills/`: `dev-setup`, `check`, `task-flow`, `new-adr`, `api-contract`, `release` and `security-pass`.
- ADR 0003 (Claude Code project skills).

## [0.1.4] - 2026-10-14

### Added

- `CLAUDE.md` with the stack, target commands, git flow and working rules.
- Pull request template with Before, After, How to test and Checklist.
- This changelog, with versions 0.1.0 to 0.1.3 reconstructed from the git history.
- ADR 0001 (monorepo with Rails API and React frontend) and ADR 0002 (git-flow with rebase & merge).
- `docs/architecture.md` with the components, the request flow and the target folder map.
- Root `.gitignore` for dependencies, coverage, environment files, OS files and logs.

## [0.1.3] - 2025-05-09

Hotfix `hotfix/fix_max-date`.

### Fixed

- Dates more than 10 years in the future are rejected with a 400 error.

### Changed

- README: more setup details and the SunriseSunset.io URL typo fixed.

## [0.1.2] - 2025-05-09

Hotfix `hotfix/fix_front_port`.

### Fixed

- The frontend dev server runs on port 3001 so it no longer collides with the backend on 3000.

## [0.1.1] - 2025-05-09

Release `release/0.1.1`.

### Added

- Loading screen while the sun times are fetched.
- Footer with a link to SunriseSunset.io.
- TODO list in the README.

## [0.1.0] - 2025-05-09

First release (`release/0.1.0`).

### Added

- Rails 8 API backend and React frontend in one repository.
- `GET /api/sun_cycle` with location, start date and end date: geocodes the location and fetches sunrise, sunset and golden hour from SunriseSunset.io.
- `SunCycleData` model that caches each day in SQLite.
- Search form, results table and results chart (Chart.js), with a responsive layout.
- Input validations and error handling for missing parameters, invalid dates and unknown locations.
- CORS (cross-origin resource sharing) enabled with rack-cors.

### Fixed

- Sun times stored as strings instead of a time column.
- Date loop in the sun cycle fetcher.

---

## Versioning guide

Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and are decided once, at release time (ADR 0002, amended 2026-10-17).

- Each PR adds its entries under `## [Unreleased]` at the top of this file, in the PR itself. It does not pick a version number.
- Use the sections `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` and `Security`; leave out the empty ones.
- Write entries for people using or maintaining the app, not as a copy of the commit messages.
- On `release/x.y.z`, the `Unreleased` section becomes `## [x.y.z] - YYYY-MM-DD`, from what it collected: a breaking change to the API contract bumps MAJOR, any new feature bumps MINOR, and only fixes or maintenance bump PATCH. That version gets the tag `vx.y.z` on `main`.
- A `hotfix/*` PR to `main` adds its own PATCH section directly, because it ships on its own.
- Every version in this file is a release on `main` with its tag. The `0.1.x` sections before `1.0.0` are the exception: they record the per-PR versions used while the app was first built.
