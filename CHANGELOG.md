# Changelog

All notable changes to sunsapp are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The versioning guide is at the end of this file.

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

- Each PR adds its own version section at the top of this file, in the PR itself.
- `feat` commits bump MINOR (`0.1.4` → `0.2.0`); every other type (`fix`, `docs`, `refactor`, `chore`, `test`) bumps PATCH (`0.2.0` → `0.2.1`). A PR with at least one `feat` bumps MINOR.
- MAJOR stays at 0 until `1.0.0` is released on `main` through `release/1.0.0`.
- Use the sections `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` and `Security`; leave out the empty ones.
- Write entries for people using or maintaining the app, not as a copy of the commit messages.
- When a PR merges, open PRs rebase on `develop` and renumber their section if another PR took their version.
