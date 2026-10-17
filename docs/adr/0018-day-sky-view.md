# 0018. Day sky view

## Status

Accepted (2026-10-16), decided by Nico (approved wireframe for task R3). Supersedes ADR 0013 and
changes the role of the ADR 0008 chart.

## Context

The line chart (ADR 0008) shows how sunrise, sunset and the evening golden hour move across the
range, but it does not answer the question most visitors bring: what does one day look like, and
when is the light good? ADR 0013 proposed golden hour bands and day length on the same chart and
left the morning golden hour out because the API did not send it. SunriseSunset.io already returns
`first_light`, `dawn`, `solar_noon`, `dusk` and `last_light` for each day; contract v2 dropped them.

## Options considered

1. **Extend the line chart (ADR 0013):** bands and a second axis on Chart.js; no contract change,
   but still a multi-day view, busier on small screens, and no twilight or blue hour.
2. **Day view as the main visual, line chart behind a button:** one day at a time as a 24-hour sky
   band (night, twilight, blue hour, golden hour, daylight) with the sun's arc from sunrise to
   sunset peaking at solar noon, a list of stages, and Prev/Next across the range. Needs five more
   fields from the API.
3. **Both visuals always on screen:** more to read and scroll, no clear main view.

## Decision

Option 2.

- **Contract v3** of `GET /api/sun_cycle` adds `first_light`, `dawn`, `solar_noon`, `dusk` and
  `last_light` per day (24-hour `HH:MM`, local time of the place, `null` when missing), normalized
  like `sunrise`. Fields are only added; none is renamed or removed.
- **Cache:** the sun times key moves from `sun_cycle/v1/` to `sun_cycle/v2/`. Entries written
  before v3 lack the new fields; with a new key they are never read and expire on their own within
  30 days (ADR 0017). The cost is one extra SunriseSunset.io call per place and range the first
  time it is asked again.
- **Day view** (`DayView`, `SkyBand`, `KeyTimes` (replaced `StageList` in ADR 0016) in `frontend/src/components/`, pure computations
  in `frontend/src/lib/dayView.ts`): the stages are night → twilight (`first_light`–`dawn`) →
  blue hour (`dawn`–`sunrise`) → morning golden hour → daylight → evening golden hour
  (`golden_hour`–`sunset`) → blue hour (`sunset`–`dusk`) → twilight (`dusk`–`last_light`) → night.
  A stage whose start or end is `null` is not drawn, so polar days leave the band unfilled there.
- **Morning golden hour** is an approximation: the API sends only the evening start, so the
  morning end is that start mirrored around solar noon, `2 × solar_noon − golden_hour`. The sun's
  path is close to symmetric around solar noon, so the error is a few minutes at most.
- **Line chart** (ADR 0008) stays as it is, behind a "See variation" button.

## Consequences

- One day is readable at a glance, including the morning golden hour and the blue hours.
- The contract grows by five fields; frontend type, tests and `docs/api.md` change with it.
- The first searches after the deploy refetch their days once because of the cache key change.
- The mirrored morning golden hour can differ by a few minutes from a real solar-elevation
  calculation; if that matters, compute it from the sun's elevation instead (new ADR).
- The page shell, form, background and table styling are left for the UI renewal (ADR 0016).
