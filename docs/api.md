# API

The backend exposes one endpoint. It returns, for a place and a date range, the sunrise, the
sunset and the start of the evening golden hour of each day, in the local time of the place
(contract v2, [ADR 0006](adr/0006-local-time-of-place.md)).

Base URL in development: `http://localhost:3000`.

## GET /api/sun_cycle

### Query parameters

| Name | Required | Rules |
|---|---|---|
| `location` | yes | Free text, for example `Santiago` or `Tokyo, Japan`. Trimmed, spaces collapsed and each word capitalized (the rest of the word lowercased, so `NYC` becomes `Nyc`); at most 200 characters after that. |
| `start_date` | yes | `YYYY-MM-DD`, a real calendar date. |
| `end_date` | yes | `YYYY-MM-DD`, not before `start_date`. |

Limits ([ADR 0007](adr/0007-sqlite-cache-and-range-limit.md)):

- The range covers at most 366 days, both ends included.
- Neither date may be more than 10 years after today. There is no lower limit.
- Each parameter must be a single string; arrays or hashes count as missing.

### Example

```http
GET /api/sun_cycle?location=santiago&start_date=2026-09-05&end_date=2026-09-06
```

```json
{
  "location": "Santiago",
  "timezone": "America/Santiago",
  "days": [
    { "date": "2026-09-05", "sunrise": "07:21", "sunset": "18:51", "golden_hour": "18:17", "utc_offset": -240 },
    { "date": "2026-09-06", "sunrise": "08:20", "sunset": "19:51", "golden_hour": "19:18", "utc_offset": -180 }
  ]
}
```

Chile moves its clocks forward on 2026-09-06, so `utc_offset` changes inside the range.

### 200 body

| Field | Type | Meaning |
|---|---|---|
| `location` | string | The normalized `location` parameter (not the name the geocoder found). |
| `timezone` | string | IANA (Internet Assigned Numbers Authority) zone name of the place, for example `Asia/Tokyo`. |
| `days[].date` | string | `YYYY-MM-DD`, in ascending order. |
| `days[].sunrise` | string or null | Local time, 24-hour, zero-padded `HH:MM`. |
| `days[].sunset` | string or null | Same format. |
| `days[].golden_hour` | string or null | Start of the evening golden hour, same format. |
| `days[].utc_offset` | integer or null | Minutes from UTC (coordinated universal time) on that day; it can change inside a range because of DST (daylight saving time). |

- A time is `null` when the sun does not rise or set that day (polar day or night) or when
  SunriseSunset.io sent a value that is not a valid time. The UI shows "—" and the chart leaves a gap.
- `utc_offset` is `null` only if SunriseSunset.io did not send an integer.
- Days the cache does not have and SunriseSunset.io does not return are left out of `days`, so
  `days` can be shorter than the range (see Errors, 404).

### Errors

Every error body is `{ "error": "<message>" }`.

| Status | `error` | When |
|---|---|---|
| 400 | `Missing parameters` | A parameter is missing, empty or not a string. |
| 400 | `Invalid location` | The location is longer than 200 characters, or the geocoder finds nothing. |
| 400 | `Invalid date format` | A date is not `YYYY-MM-DD` or does not exist (`2026-02-30`). |
| 400 | `Invalid date range` | `start_date` is after `end_date`. |
| 400 | `<date> exceeds the allowed future limit (10 years from today).` | A date is more than 10 years ahead; `<date>` is the first one that is. |
| 400 | `Date range cannot exceed 366 days` | The range is longer than 366 days. |
| 404 | `No sun data found for this location and dates` | No day is cached and SunriseSunset.io fails or returns no usable data. |
| 500 | `Internal server error` | Any unexpected error, including a geocoder outage or timeout. |

The parameter checks run in the order of the table and the first failure is returned. The
location is geocoded only after all of them pass, so "geocoder finds nothing" comes last. A 500 never includes internal details; the log keeps only the error class and the first
backtrace line, and `location` is filtered from the request logs.

### Caching and external calls

Both caches use `Rails.cache` (Solid Cache in production, the memory store in development) and
expire after 30 days ([ADR 0017](adr/README.md)).

- Geocoding: Nominatim (5 s timeout, own User-Agent). Successful results are cached by location;
  a place that is not found is asked again next time.
- Sun times: one cache entry per day, keyed by the coordinates rounded to 4 decimals (about 11 m)
  and the date. Only the days missing from the cache are fetched, from the first missing day to the
  last one, in one call to SunriseSunset.io (two when the gap is 366 days, because its limit is 365
  per call; 10 s timeout).
- If that call fails, the cached days are still returned with a 200.

## CORS

CORS (cross-origin resource sharing) is allowed on `/api/*` for the `GET`, `HEAD` and `OPTIONS`
methods, only from the origins in `CORS_ORIGINS` (comma-separated). The default is
`http://localhost:3001`, the Vite dev server. See `backend/.env.example`.

## Health check

`GET /up` answers 200 when the app boots (Rails default).

## Changing the contract

Follow the `api-contract` skill (`.claude/skills/api-contract/SKILL.md`): backend code and tests,
the frontend type in `frontend/src/api/types.ts` and its tests, and this file change in the same PR.
