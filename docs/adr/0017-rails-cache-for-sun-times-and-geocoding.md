# 0017. Rails.cache for sun times and geocoding

## Status

Accepted (2026-10-15), decided by Nico. Supersedes the cache part of ADR 0007.

## Context

ADR 0007 cached the sun times in the `sun_cycle_data` SQLite table, one row per place and day. The
table grows forever, nothing cleans it, two concurrent requests can store duplicate rows, and the
app needs a model, migrations and indexes only to keep a cache. Geocoding was not cached at all:
every search called Nominatim, whose usage policy asks clients to cache results and avoid repeated
queries. Production already runs Solid Cache (`:solid_cache_store`, its own SQLite database).

## Options considered

1. **Keep the SQLite table:** it works, but it is unbounded, needs its own cleanup and code, and
   does not cover geocoding.
2. **Rails.cache (chosen):** Solid Cache in production and a memory store in development already
   exist; entries expire on their own and the store has a size cap, so the cache stays bounded
   with less code. One mechanism covers sun times and geocoding.
3. **Compute the sun times locally (NOAA, National Oceanic and Atmospheric Administration,
   algorithm):** no external call at all, but it needs the time zone of the coordinates, which
   means another data source or gem. Left for the future.

## Decision

- Sun times: one entry per place and day, key `sun_cycle/v1/<lat>/<long>/<YYYY-MM-DD>` with the
  coordinates rounded to 4 decimals (about 11 m). The value holds the day (sunrise, sunset,
  golden hour, UTC offset) and the time zone. `SunCycle::Lookup` reads the requested days with
  `read_multi`, fetches the missing span in one call (split at 365 days, as in ADR 0007) and writes
  it with `write_multi`, `expires_in: 30.days`.
- Geocoding: `SunCycle::GeocodingClient` caches matches with `Rails.cache.fetch` for 30 days. The
  key is a SHA-256 of the name in lowercase with collapsed spaces, so "Tokyo" and " tokyo " share
  one entry and the location text is not stored. Misses and errors are not cached.
- Stores: production uses Solid Cache with `max_size` 256 MB and `max_age` 30 days
  (`config/cache.yml`); development uses a 64 MB memory store that is always on; tests use
  `:null_store` and the cache tests swap in a fresh `MemoryStore`.
- The `SunCycleData` model is removed. The `sun_cycle_data` table stays until a later PR drops it
  (two-PR rule for removals).

## Consequences

- The cache is bounded and cleans itself; there is no cache model or cache migration to maintain.
- A repeated search costs no external call; Nominatim is asked once per place every 30 days.
- Past sun times are refetched after 30 days; the cost is one call per range.
- The development cache is lost on restart, which only means one fresh call per search.
- Bumping `v1` in a key invalidates that cache if the value format changes.
