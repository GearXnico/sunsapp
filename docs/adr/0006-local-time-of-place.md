# 0006. Local time of the place

## Status

Accepted (2026-10-14)

## Context

The backend asked SunriseSunset.io for `formatted=0`, a parameter of a different API
(sunrise-sunset.org), so it received 12-hour strings such as `5:41:58 AM` and passed them on
without saying which zone they belonged to. The frontend parsed them as 24-hour times and the
chart drew sunsets on top of sunrises. SunriseSunset.io already resolves the zone of the place from
its coordinates and reports it per day (`timezone` as an IANA name, `utc_offset` in minutes), and
it can return 24-hour times with `time_format=24`.

## Options considered

1. **Local time of the place, 24 h, with the zone in the response (chosen):** what someone
   planning a sunset photo at that place needs; the API already gives it, so the backend only
   validates and forwards it.
2. **UTC from the API and conversion in the browser:** one canonical format, but the browser
   needs the zone of the place anyway to show it, and DST rules would live in the frontend.
3. **Both zones (place and viewer):** useful only for remote planning; doubles the columns in the
   table and the chart for a case nobody asked for.

## Decision

- The backend calls SunriseSunset.io with `time_format=24` and one `date_start`/`date_end` call
  per range (split every 365 days, the API limit).
- Every time is validated: `H:MM` or `HH:MM`, optional seconds, normalized to zero-padded `HH:MM`;
  anything else, `null` or `-` becomes `null` (polar day or night).
- The response carries `timezone` (IANA) once and `utc_offset` per day, because the offset can
  change inside a range with DST. Contract v2:
  `{ location, timezone, days: [{ date, sunrise, sunset, golden_hour, utc_offset }] }`.
- The cache stores `timezone` and `utc_offset` (add-only migration). Rows cached before it had no
  zone, so the migration deletes them and they are fetched again.

## Consequences

- Times read the same as a local clock at the place, and the UI can label the zone
  (for example `Asia/Tokyo, UTC+9`).
- The response shape changed (v2), so the frontend must be updated in the same release.
- The first request after deploying refetches every previously cached day.
- Showing the time in the viewer's zone would need a new decision; `utc_offset` per day makes it
  possible without changing the API.
