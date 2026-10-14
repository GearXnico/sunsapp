# Changelog

All notable changes to sunsapp are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The versioning guide is at the end of this file.

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
