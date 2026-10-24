# 0004. Tests and CI

## Status

Accepted (2026-10-14)

## Context

The backend had a single scaffold test that called a route that does not exist and would have
hit the real SunriseSunset.io API. The frontend test looked for "learn react". The Rails
workflow lived in `backend/.github/`, which GitHub ignores, so nothing ran on pull requests.
The upcoming fixes (time zones, validation, cache) need a safety net first, and the external
APIs (SunriseSunset.io and Nominatim) must never be called from tests.

## Options considered

1. **Minimal:** keep the Rails defaults and add a couple of smoke tests. Cheap, but it does not
   protect the fixes that follow and gives no coverage or audit signal.
2. **Unit and integration tests with audits in CI (chosen):** Minitest on the backend, Vitest on
   the frontend, coverage threshold, lint and dependency audits in GitHub Actions.
3. **Option 2 plus end-to-end tests with Playwright:** covers the browser flow, but the app is a
   single screen, needs both servers and stubbed external APIs in CI, and costs more to keep
   stable than it protects.

## Decision

- **Backend:** Minitest (Rails default) with WebMock blocking all real HTTP and stubbing
  SunriseSunset.io, and Geocoder's built-in `:test` lookup for locations. Tests mirror `app/`
  (`test/controllers`, `test/services`, `test/models`).
- **Frontend:** Vitest with Testing Library (ADR 0005).
- **Coverage:** 80 % of lines minimum. SimpleCov fails `bin/rails test` below it; Vitest does the
  same on the frontend.
- **CI:** workflows in the root `.github/workflows/`, one per app, on pull requests and pushes to
  `develop` and `main`, with read-only permissions. Backend jobs: tests, RuboCop, Brakeman and
  `bundler-audit`. Frontend jobs: tests with coverage, lint, typecheck and `npm audit`.
- **No end-to-end tests** for now.

## Consequences

- Tests run offline and fast, and every PR shows whether behavior, style or dependencies broke.
- First tests are characterization tests of the current behavior; known bugs are fixed later with
  their own failing tests.
- Audits can fail CI when a new advisory appears even if the code did not change; the fix is a
  dependency bump in its own commit.
- The browser flow is checked by hand; if the UI grows beyond one screen, revisit end-to-end tests.
