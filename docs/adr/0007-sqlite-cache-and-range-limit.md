# 0007. SQLite cache and range limit

## Status

Accepted (2026-10-14)

## Context

Every search geocodes the location and asks SunriseSunset.io for the sun times. The cache was
keyed by the location text, so "Santiago" and "Santiago, Chile" stored the same days twice, and
there was no limit on the range: a 10-year request meant thousands of days and, before ADR 0006,
one API call per day. The API accepts ranges of up to 365 days per call. The app has a single
backend process and a few users.

## Options considered

1. **SQLite cache keyed by rounded coordinates and date, with a range limit (chosen):** Rails 8
   default, no extra service, enough for one process and a few users.
2. **Postgres:** better for concurrent writers and several app servers, but adds a service to run
   locally, in CI and when deploying, for load the app does not have.
3. **No cache:** the simplest code, but every search hits the external API again, spends its quota
   and is slower; past dates never change, so caching them is safe.

## Decision

- The cache is the `sun_cycle_data` table in SQLite, one row per place and day, keyed by `lat`
  and `long` rounded to 4 decimals (about 11 m) and `start_date` (the day), with an index on the
  three columns. The `location` column is no longer written; it is removed in a later PR
  (two-PR rule for removals).
- A request covers at most 366 days (a leap year). Dates must be `YYYY-MM-DD` and at most 10 years
  ahead; anything else is a 400.
- The days missing from the cache are fetched in one call (`date_start`/`date_end`); a 366-day
  range is split into two calls because of the 365-day API limit.
- The logic lives in `app/core/sun_cycle/` (`Query`, `Lookup`, `SunriseSunsetClient`,
  `GeocodingClient`) and the controller only wires them.

## Consequences

- Repeated or nearby searches are served from SQLite without calling SunriseSunset.io.
- A request costs at most two external calls, so it cannot block the server or burn the API quota.
- Rows cached before this change (keyed by unrounded coordinates) are not matched again and are
  refetched; they are harmless and can be cleaned with the `location` column removal.
- Two concurrent requests for the same new days may store duplicate rows; reads take the first
  one. If that matters, add a unique index in a later migration.
- Moving to several app servers would need a shared database (revisit Postgres then).
